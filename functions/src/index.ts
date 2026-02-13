import * as functions from "firebase-functions/v1";
import * as admin from "firebase-admin";
import Stripe from "stripe";

admin.initializeApp();
const db = admin.firestore();

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
        // Get mentor's Stripe Account ID
        const mentorDoc = await db.collection("users").doc(mentorId).get();
        const mentorData = mentorDoc.data();
        const connectedAccountId = mentorData?.stripeAccountId;

        if (!connectedAccountId) {
            throw new functions.https.HttpsError("failed-precondition", "Mentor has not set up payments.");
        }

        // Calculate application fee (e.g., 15%)
        const applicationFeeAmount = Math.round(amount * 0.15);

        const paymentIntent = await stripe.paymentIntents.create({
            amount: amount, // amount in cents
            currency: currency || "eur",
            automatic_payment_methods: {
                enabled: true,
            },
            application_fee_amount: applicationFeeAmount,
            transfer_data: {
                destination: connectedAccountId,
            },
        });

        return {
            clientSecret: paymentIntent.client_secret,
            publishableKey: process.env.STRIPE_PUBLISHABLE_KEY ?? "",
        };
    } catch (error) {
        console.error("Error creating payment intent:", error);
        throw new functions.https.HttpsError("internal", "Unable to create payment intent.");
    }
});
