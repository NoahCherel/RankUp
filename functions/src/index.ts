import * as functions from "firebase-functions/v1";
import * as admin from "firebase-admin";
import Stripe from "stripe";

admin.initializeApp();
const db = admin.firestore();
const messaging = admin.messaging();

// ---------------------------------------------------------------------------
// Stripe init — key comes from functions/.env (STRIPE_SECRET_KEY=sk_test_…)
// ---------------------------------------------------------------------------
const stripeSecret = process.env.STRIPE_SECRET_KEY ?? "";
if (!stripeSecret) {
    console.warn("⚠️  STRIPE_SECRET_KEY is not set — payment functions will fail.");
}
const stripe = new Stripe(stripeSecret, {
    apiVersion: "2023-10-16",
});

/**
 * Create a Stripe Express account for a mentor
 */
export const createStripeConnectedAccount = functions.region('europe-west1').https.onCall(async (data: any, context: functions.https.CallableContext) => {
    if (!context.auth) {
        throw new functions.https.HttpsError("unauthenticated", "User must be logged in.");
    }

    const uid = context.auth.uid;
    console.log(`Creating Stripe account for user ${uid}`);

    try {
        // Check if user already has a stripeAccountId
        const userDoc = await db.collection("users").doc(uid).get();
        const userData = userDoc.data();

        if (userData?.stripeAccountId) {
            console.log(`User ${uid} already has stripe account ${userData.stripeAccountId}`);
            return { accountId: userData.stripeAccountId };
        }

        const account = await stripe.accounts.create({
            type: "express",
            country: "FR", // Hardcoded for MVP
            email: context.auth.token.email,
            capabilities: {
                card_payments: { requested: true },
                transfers: { requested: true },
            },
        });

        // Save account ID to Firestore
        await db.collection("users").doc(uid).update({
            stripeAccountId: account.id,
            stripeOnboardingComplete: false,
        });

        console.log(`Created Stripe account ${account.id} for user ${uid}`);
        return { accountId: account.id };
    } catch (error) {
        console.error("Error creating Stripe account:", error);
        throw new functions.https.HttpsError("internal", "Unable to create Stripe account.");
    }
});

/**
 * Create an Account Link for onboarding (KYC)
 */
export const createStripeAccountLink = functions.region('europe-west1').https.onCall(async (data: any, context: functions.https.CallableContext) => {
    if (!context.auth) {
        throw new functions.https.HttpsError("unauthenticated", "User must be logged in.");
    }

    // const uid = context.auth.uid; // Removed unused variable
    const { accountId } = data;

    if (!accountId) {
        throw new functions.https.HttpsError("invalid-argument", "Account ID is required.");
    }

    console.log(`Creating account link for ${accountId}`);

    try {
        const accountLink = await stripe.accountLinks.create({
            account: accountId,
            refresh_url: "https://rankup-app.web.app/stripe-refresh", // Placeholder
            return_url: "https://rankup-app.web.app/stripe-return",   // Placeholder
            type: "account_onboarding",
        });

        return { url: accountLink.url };
    } catch (error) {
        console.error("Error creating account link:", error);
        throw new functions.https.HttpsError("internal", "Unable to create account link.");
    }
});

/**
 * Create a Payment Intent for a session
 */
export const createPaymentIntent = functions.region('europe-west1').https.onCall(async (data: any, context: functions.https.CallableContext) => {
    if (!context.auth) {
        throw new functions.https.HttpsError("unauthenticated", "User must be logged in.");
    }

    const { amount, currency, mentorId } = data;

    if (!amount || !mentorId) {
        throw new functions.https.HttpsError("invalid-argument", "Amount and Mentor ID are required.");
    }

    try {
        // Get mentor's Stripe Account ID (may not exist yet for MVP)
        const mentorDoc = await db.collection("users").doc(mentorId).get();
        const mentorData = mentorDoc.data();
        const connectedAccountId = mentorData?.stripeAccountId;

        // Build PaymentIntent params
        const intentParams: Stripe.PaymentIntentCreateParams = {
            amount: amount, // amount in cents
            currency: currency || "eur",
            automatic_payment_methods: {
                enabled: true,
            },
            metadata: {
                mentorId,
                clientId: context.auth.uid,
            },
        };

        // If mentor has Stripe Connect, use transfer_data
        if (connectedAccountId) {
            const applicationFeeAmount = Math.round(amount * 0.15);
            intentParams.application_fee_amount = applicationFeeAmount;
            intentParams.transfer_data = {
                destination: connectedAccountId,
            };
        }

        const paymentIntent = await stripe.paymentIntents.create(intentParams);

        return {
            clientSecret: paymentIntent.client_secret,
            publishableKey: process.env.STRIPE_PUBLISHABLE_KEY ?? "",
        };
    } catch (error) {
        console.error("Error creating payment intent:", error);
        throw new functions.https.HttpsError("internal", "Unable to create payment intent.");
    }
});

// =========================================================================
// BOOKING WORKFLOW
// =========================================================================

/**
 * Helper — send a push notification via FCM.
 * Silently fails if token is missing or invalid (non-blocking).
 */
async function sendPushNotification(
    userId: string,
    title: string,
    body: string,
    data?: Record<string, string>,
): Promise<void> {
    try {
        const userDoc = await db.collection("users").doc(userId).get();
        const fcmToken = userDoc.data()?.fcmToken;
        if (!fcmToken) {
            console.log(`No FCM token for user ${userId}, skipping push.`);
            return;
        }
        await messaging.send({
            token: fcmToken,
            notification: { title, body },
            data: data ?? {},
        });
        console.log(`Push sent to ${userId}: ${title}`);
    } catch (err) {
        console.warn(`Push to ${userId} failed (non-blocking):`, err);
    }
}

/**
 * Firestore trigger — when a booking is created, notify the mentor.
 */
export const onBookingCreated = functions
    .region("europe-west1")
    .firestore.document("bookings/{bookingId}")
    .onCreate(async (snap, context) => {
        const booking = snap.data();
        const mentorId = booking.mentorId;
        const clientName = booking.clientName || "Un joueur";

        await sendPushNotification(
            mentorId,
            "📩 Nouvelle demande de session",
            `${clientName} souhaite réserver une session avec vous.`,
            { bookingId: context.params.bookingId, type: "booking_request" },
        );
    });

/**
 * Firestore trigger — when a booking status changes, notify the relevant user.
 */
export const onBookingStatusChanged = functions
    .region("europe-west1")
    .firestore.document("bookings/{bookingId}")
    .onUpdate(async (change, context) => {
        const before = change.before.data();
        const after = change.after.data();

        if (before.status === after.status) return; // no status change

        const bookingId = context.params.bookingId;
        const mentorName = after.mentorName || "Le mentor";
        const clientName = after.clientName || "Le joueur";

        switch (after.status) {
            case "confirmed":
                // Notify client that mentor accepted
                await sendPushNotification(
                    after.clientId,
                    "✅ Réservation confirmée !",
                    `${mentorName} a accepté votre session.`,
                    { bookingId, type: "booking_confirmed" },
                );
                break;

            case "rejected":
                // Notify client that mentor declined
                await sendPushNotification(
                    after.clientId,
                    "❌ Demande refusée",
                    `${mentorName} n'est pas disponible pour cette session.`,
                    { bookingId, type: "booking_rejected" },
                );
                break;

            case "cancelled":
                // Notify the other party
                // If the updater is the client, notify mentor; vice-versa
                if (after.cancelledBy === after.clientId) {
                    await sendPushNotification(
                        after.mentorId,
                        "🚫 Réservation annulée",
                        `${clientName} a annulé la session.`,
                        { bookingId, type: "booking_cancelled" },
                    );
                } else {
                    await sendPushNotification(
                        after.clientId,
                        "🚫 Réservation annulée",
                        `${mentorName} a annulé la session.`,
                        { bookingId, type: "booking_cancelled" },
                    );
                }
                break;

            case "completed":
                // Notify client to leave a review
                await sendPushNotification(
                    after.clientId,
                    "⭐ Session terminée",
                    "N'oubliez pas de laisser un avis !",
                    { bookingId, type: "booking_completed" },
                );
                break;
        }
    });
