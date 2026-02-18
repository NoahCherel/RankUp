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

        // Save account ID to Firestore (use set+merge in case doc doesn't exist yet)
        await db.collection("users").doc(uid).set({
            stripeAccountId: account.id,
            stripeOnboardingComplete: false,
        }, { merge: true });

        console.log(`Created Stripe account ${account.id} for user ${uid}`);
        return { accountId: account.id };
    } catch (error: any) {
        console.error("Error creating Stripe account:", error);
        const msg = error?.message || error?.raw?.message || "Unable to create Stripe account.";
        throw new functions.https.HttpsError("internal", msg);
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
            refresh_url: "https://rankup-dd6ca.web.app/stripe-refresh",
            return_url: "https://rankup-dd6ca.web.app/stripe-return",
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

// =========================================================================
// REVIEW — Recalculate mentor rating on new review
// =========================================================================

export const onReviewCreated = functions
    .region("europe-west1")
    .firestore.document("reviews/{reviewId}")
    .onCreate(async (snap) => {
        const review = snap.data();
        const revieweeId = review.revieweeId;
        if (!revieweeId) return;

        // Fetch all reviews for this reviewee
        const reviewsSnap = await db.collection("reviews")
            .where("revieweeId", "==", revieweeId)
            .get();

        if (reviewsSnap.empty) return;

        let totalRating = 0;
        reviewsSnap.docs.forEach((d) => {
            totalRating += d.data().rating || 0;
        });

        const count = reviewsSnap.size;
        const averageRating = Math.round((totalRating / count) * 10) / 10;

        await db.collection("users").doc(revieweeId).update({
            averageRating,
            totalReviews: count,
        });

        console.log(`[onReviewCreated] Updated ${revieweeId}: avg=${averageRating}, total=${count}`);
    });

// =========================================================================
// SEED DEMO DATA — Admin SDK (bypasses security rules)
// =========================================================================

export const seedDemoData = functions
    .region("europe-west1")
    .runWith({ timeoutSeconds: 120, memory: "256MB" })
    .https.onCall(async (_data: any, context: functions.https.CallableContext) => {
        if (!context.auth) {
            throw new functions.https.HttpsError("unauthenticated", "User must be logged in.");
        }

        const currentUid = context.auth.uid;
        console.log(`[seedDemoData] Seeding demo data for user ${currentUid}`);

        // Try to get current user profile to use their name
        let currentName = "Utilisateur";
        try {
            const userDoc = await db.collection("users").doc(currentUid).get();
            if (userDoc.exists) {
                const d = userDoc.data()!;
                currentName = `${d.firstName || ""} ${d.lastName || ""}`.trim() || "Utilisateur";
            }
        } catch { /* ignore */ }

        const NOW = Date.now();
        const DAY = 24 * 60 * 60 * 1000;
        const DEMO_PASSWORD = "Demo1234!";

        // Helper: create or get a Firebase Auth user, return real UID
        async function getOrCreateAuthUser(email: string, displayName: string): Promise<string> {
            try {
                const existing = await admin.auth().getUserByEmail(email);
                return existing.uid;
            } catch (err: any) {
                if (err.code === "auth/user-not-found") {
                    const created = await admin.auth().createUser({
                        email,
                        password: DEMO_PASSWORD,
                        displayName,
                        emailVerified: true,
                    });
                    return created.uid;
                }
                throw err;
            }
        }

        // ------ Mentors ------
        const mentorDefs = [
            {
                email: "carlos.rivera@demo.com",
                firstName: "Carlos", lastName: "Rivera", age: 28,
                nationality: "ES", ranking: 45, bestRanking: 30, points: 1850,
                league: "ile-de-france", club: "Paris Padel Club",
                playStyle: "left", isMentor: true, mentorPrice: 45,
                mentorDescription: "Joueur professionnel avec 8 ans d'expérience. Spécialisé dans le jeu au filet et les volées.",
                matchesPlayed: 320, matchesWon: 240, averageRating: 4.8, totalReviews: 12,
            },
            {
                email: "sophie.martin@demo.com",
                firstName: "Sophie", lastName: "Martin", age: 32,
                nationality: "FR", ranking: 120, bestRanking: 85, points: 1200,
                league: "paca", club: "Marseille Padel Arena",
                playStyle: "right", isMentor: true, mentorPrice: 35,
                mentorDescription: "Coach certifiée FFT. Approche pédagogique adaptée à tous les niveaux.",
                matchesPlayed: 180, matchesWon: 120, averageRating: 4.6, totalReviews: 8,
            },
            {
                email: "marco.rossi@demo.com",
                firstName: "Marco", lastName: "Rossi", age: 25,
                nationality: "IT", ranking: 78, bestRanking: 55, points: 1450,
                league: "occitanie", club: "Toulouse Padel Center",
                playStyle: "both", isMentor: true, mentorPrice: 40,
                mentorDescription: "Polyvalent et stratégique. Idéal pour progresser rapidement sur les deux côtés du terrain.",
                matchesPlayed: 210, matchesWon: 155, averageRating: 4.3, totalReviews: 6,
            },
            {
                email: "lucia.fernandez@demo.com",
                firstName: "Lucia", lastName: "Fernandez", age: 30,
                nationality: "AR", ranking: 35, bestRanking: 20, points: 2100,
                league: "auvergne-rhone-alpes", club: "Lyon Padel Club",
                playStyle: "left", isMentor: true, mentorPrice: 55,
                mentorDescription: "Ancienne joueuse du circuit WPT. Expertise tactique de haut niveau.",
                matchesPlayed: 450, matchesWon: 370, averageRating: 4.9, totalReviews: 15,
            },
            {
                email: "thomas.dupont@demo.com",
                firstName: "Thomas", lastName: "Dupont", age: 27,
                nationality: "FR", ranking: 200, bestRanking: 150, points: 900,
                league: "bretagne", club: "Rennes Padel Indoor",
                playStyle: "right", isMentor: true, mentorPrice: 30,
                mentorDescription: "Spécialiste du côté droit. Parfait pour les débutants et intermédiaires.",
                matchesPlayed: 100, matchesWon: 65, averageRating: 4.1, totalReviews: 4,
            },
        ];

        // ------ Regular users ------
        const userDefs = [
            {
                email: "alice.bernard@demo.com",
                firstName: "Alice", lastName: "Bernard", age: 24,
                nationality: "FR", ranking: 500, league: "ile-de-france",
                club: "Paris Padel Club", playStyle: "right",
                isMentor: false, matchesPlayed: 25, matchesWon: 10,
                averageRating: 0, totalReviews: 0,
            },
            {
                email: "julien.moreau@demo.com",
                firstName: "Julien", lastName: "Moreau", age: 29,
                nationality: "FR", ranking: 350, league: "paca",
                club: "Nice Padel Beach", playStyle: "left",
                isMentor: false, matchesPlayed: 45, matchesWon: 22,
                averageRating: 0, totalReviews: 0,
            },
            {
                email: "emma.leroy@demo.com",
                firstName: "Emma", lastName: "Leroy", age: 22,
                nationality: "FR", ranking: 800, league: "occitanie",
                club: "Montpellier Padel Club", playStyle: "both",
                isMentor: false, matchesPlayed: 12, matchesWon: 4,
                averageRating: 0, totalReviews: 0,
            },
        ];

        // ---- Create real Firebase Auth accounts and get UIDs ----
        const uidMap: Record<string, string> = {};
        const allDefs = [...mentorDefs, ...userDefs];

        for (const def of allDefs) {
            const displayName = `${def.firstName} ${def.lastName}`;
            const uid = await getOrCreateAuthUser(def.email, displayName);
            uidMap[def.email] = uid;
            console.log(`[seedDemoData] Auth user: ${def.email} -> ${uid}`);
        }

        // Convenient aliases
        const carlosUid = uidMap["carlos.rivera@demo.com"];
        const sophieUid = uidMap["sophie.martin@demo.com"];
        const marcoUid = uidMap["marco.rossi@demo.com"];
        const luciaUid = uidMap["lucia.fernandez@demo.com"];
        const thomasUid = uidMap["thomas.dupont@demo.com"];
        // aliceUid not used directly — alice's bookings are replaced by currentUid
        const julienUid = uidMap["julien.moreau@demo.com"];
        const emmaUid = uidMap["emma.leroy@demo.com"];

        const now = admin.firestore.Timestamp.now();

        // ---- Write user profiles to Firestore (using real UIDs as doc IDs) ----
        const userBatch = db.batch();
        for (const def of allDefs) {
            const uid = uidMap[def.email];
            const ref = db.collection("users").doc(uid);
            userBatch.set(ref, {
                ...def,
                id: uid,
                createdAt: now,
                updatedAt: now,
            }, { merge: true });
        }
        await userBatch.commit();
        console.log(`[seedDemoData] Created ${allDefs.length} user profiles`);

        // ------ Bookings (using real UIDs) ------
        const bookings = [
            {
                id: "booking_1",
                clientId: currentUid, clientName: currentName,
                mentorId: carlosUid, mentorName: "Carlos Rivera",
                sessionType: "sparring",
                date: admin.firestore.Timestamp.fromMillis(NOW + 3 * DAY),
                location: "Paris Padel Club — Court 3", price: 45, appFee: 6.75,
                status: "confirmed",
            },
            {
                id: "booking_2",
                clientId: julienUid, clientName: "Julien Moreau",
                mentorId: sophieUid, mentorName: "Sophie Martin",
                sessionType: "tournament",
                date: admin.firestore.Timestamp.fromMillis(NOW + 5 * DAY),
                location: "Marseille Padel Arena — Court 1", price: 35, appFee: 5.25,
                status: "pending",
            },
            {
                id: "booking_3",
                clientId: emmaUid, clientName: "Emma Leroy",
                mentorId: marcoUid, mentorName: "Marco Rossi",
                sessionType: "sparring",
                date: admin.firestore.Timestamp.fromMillis(NOW - 2 * DAY),
                location: "Toulouse Padel Center — Court 5", price: 40, appFee: 6,
                status: "completed",
            },
            {
                id: "booking_4",
                clientId: currentUid, clientName: currentName,
                mentorId: luciaUid, mentorName: "Lucia Fernandez",
                sessionType: "sparring",
                date: admin.firestore.Timestamp.fromMillis(NOW - 5 * DAY),
                location: "Lyon Padel Club — Court 2", price: 55, appFee: 8.25,
                status: "completed",
            },
            {
                id: "booking_5",
                clientId: currentUid, clientName: currentName,
                mentorId: carlosUid, mentorName: "Carlos Rivera",
                sessionType: "tournament",
                date: admin.firestore.Timestamp.fromMillis(NOW + 7 * DAY),
                location: "Paris Padel Club — Court 1", price: 45, appFee: 6.75,
                status: "pending",
            },
            {
                id: "booking_6",
                clientId: emmaUid, clientName: "Emma Leroy",
                mentorId: thomasUid, mentorName: "Thomas Dupont",
                sessionType: "sparring",
                date: admin.firestore.Timestamp.fromMillis(NOW - 10 * DAY),
                location: "Rennes Padel Indoor — Court 4", price: 30, appFee: 4.5,
                status: "completed",
            },
            {
                id: "booking_7",
                clientId: currentUid, clientName: currentName,
                mentorId: carlosUid, mentorName: "Carlos Rivera",
                sessionType: "sparring",
                date: admin.firestore.Timestamp.fromMillis(NOW - 3 * DAY),
                location: "Paris Padel Club — Court 2", price: 45, appFee: 6.75,
                status: "completed",
            },
        ];

        const bookingBatch = db.batch();
        for (const b of bookings) {
            const ref = db.collection("bookings").doc(b.id);
            bookingBatch.set(ref, { ...b, createdAt: now, updatedAt: now }, { merge: true });
        }
        await bookingBatch.commit();
        console.log(`[seedDemoData] Created ${bookings.length} bookings`);

        // ------ Conversations (using real UIDs) ------
        const conversations = [
            {
                id: "conv_1",
                participants: [currentUid, carlosUid],
                bookingId: "booking_1",
                lastMessage: "Parfait, à jeudi alors ! 🎾",
                lastMessageAt: admin.firestore.Timestamp.fromMillis(NOW - 1 * 60 * 60 * 1000),
                unreadCount: 0,
                messages: [
                    { senderId: currentUid, content: "Bonjour Carlos ! J'ai hâte pour la session.", createdAt: NOW - 4 * 60 * 60 * 1000 },
                    { senderId: carlosUid, content: "Salut ! Super, on va travailler les volées hautes.", createdAt: NOW - 3 * 60 * 60 * 1000 },
                    { senderId: currentUid, content: "Génial ! C'est exactement ce dont j'ai besoin.", createdAt: NOW - 2 * 60 * 60 * 1000 },
                    { senderId: carlosUid, content: "Parfait, à jeudi alors ! 🎾", createdAt: NOW - 1 * 60 * 60 * 1000 },
                ],
            },
            {
                id: "conv_2",
                participants: [emmaUid, marcoUid],
                bookingId: "booking_3",
                lastMessage: "Merci pour la session, c'était top ! 💪",
                lastMessageAt: admin.firestore.Timestamp.fromMillis(NOW - 2 * DAY),
                unreadCount: 0,
                messages: [
                    { senderId: emmaUid, content: "Bonjour Marco, est-ce qu'on peut faire des exercices de bandeja ?", createdAt: NOW - 3 * DAY },
                    { senderId: marcoUid, content: "Bien sûr ! J'ai un programme parfait pour ça.", createdAt: NOW - 3 * DAY + 30 * 60 * 1000 },
                    { senderId: emmaUid, content: "Merci pour la session, c'était top ! 💪", createdAt: NOW - 2 * DAY },
                ],
            },
            {
                id: "conv_3",
                participants: [currentUid, luciaUid],
                bookingId: "booking_4",
                lastMessage: "N'hésite pas à revenir ! 😊",
                lastMessageAt: admin.firestore.Timestamp.fromMillis(NOW - 4 * DAY),
                unreadCount: 0,
                messages: [
                    { senderId: luciaUid, content: "Bravo pour aujourd'hui, tu as bien progressé !", createdAt: NOW - 5 * DAY },
                    { senderId: currentUid, content: "Merci beaucoup Lucia ! J'ai appris énormément.", createdAt: NOW - 5 * DAY + 15 * 60 * 1000 },
                    { senderId: luciaUid, content: "N'hésite pas à revenir ! 😊", createdAt: NOW - 4 * DAY },
                ],
            },
            {
                id: "conv_4",
                participants: [emmaUid, thomasUid],
                bookingId: "booking_6",
                lastMessage: "À bientôt !",
                lastMessageAt: admin.firestore.Timestamp.fromMillis(NOW - 9 * DAY),
                unreadCount: 0,
                messages: [
                    { senderId: emmaUid, content: "Salut Thomas, merci pour les conseils sur le service !", createdAt: NOW - 10 * DAY },
                    { senderId: thomasUid, content: "Avec plaisir ! Continue à pratiquer le mouvement qu'on a vu.", createdAt: NOW - 10 * DAY + 45 * 60 * 1000 },
                    { senderId: emmaUid, content: "À bientôt !", createdAt: NOW - 9 * DAY },
                ],
            },
        ];

        for (const conv of conversations) {
            const { messages, ...convData } = conv;
            const convRef = db.collection("conversations").doc(conv.id);
            await convRef.set(convData, { merge: true });

            // Delete existing messages in sub-collection then re-create
            const existingMsgs = await convRef.collection("messages").get();
            const delBatch = db.batch();
            existingMsgs.docs.forEach((d) => delBatch.delete(d.ref));
            await delBatch.commit();

            for (const msg of messages) {
                await convRef.collection("messages").add({
                    conversationId: conv.id,
                    senderId: msg.senderId,
                    content: msg.content,
                    createdAt: admin.firestore.Timestamp.fromMillis(msg.createdAt),
                    read: true,
                });
            }
        }
        console.log(`[seedDemoData] Created ${conversations.length} conversations with messages`);

        // ------ Reviews (using real UIDs) ------
        const reviews = [
            { id: "review_1", bookingId: "booking_3", reviewerId: emmaUid, revieweeId: marcoUid, rating: 4, comment: "Très bon coach, explique clairement les techniques." },
            { id: "review_2", bookingId: "booking_4", reviewerId: currentUid, revieweeId: luciaUid, rating: 5, comment: "Incroyable ! Lucia est la meilleure coach que j'ai eue." },
            { id: "review_3", bookingId: "booking_6", reviewerId: emmaUid, revieweeId: thomasUid, rating: 4, comment: "Patient et pédagogue. Parfait pour débuter." },
            { id: "review_4", bookingId: "booking_fake_1", reviewerId: julienUid, revieweeId: carlosUid, rating: 5, comment: "Carlos est exceptionnel. Niveau pro et très sympa." },
            { id: "review_5", bookingId: "booking_fake_2", reviewerId: julienUid, revieweeId: carlosUid, rating: 5, comment: "Session intense et enrichissante !" },
            { id: "review_9", bookingId: "booking_fake_6", reviewerId: emmaUid, revieweeId: carlosUid, rating: 4, comment: "Super session, Carlos m'a aidée à améliorer ma volée de revers." },
            { id: "review_10", bookingId: "booking_fake_7", reviewerId: thomasUid, revieweeId: carlosUid, rating: 5, comment: "Excellent pédagogue, on sent le niveau pro. Je recommande !" },
            { id: "review_6", bookingId: "booking_fake_3", reviewerId: emmaUid, revieweeId: sophieUid, rating: 5, comment: "Sophie adapte parfaitement ses cours au niveau." },
            { id: "review_7", bookingId: "booking_fake_4", reviewerId: julienUid, revieweeId: sophieUid, rating: 4, comment: "Bonne ambiance et bons conseils techniques." },
            { id: "review_8", bookingId: "booking_fake_5", reviewerId: currentUid, revieweeId: luciaUid, rating: 5, comment: "J'ai progressé de fou en une seule session." },
        ];

        const reviewBatch = db.batch();
        for (const r of reviews) {
            const ref = db.collection("reviews").doc(r.id);
            reviewBatch.set(ref, { ...r, createdAt: now }, { merge: true });
        }
        await reviewBatch.commit();
        console.log(`[seedDemoData] Created ${reviews.length} reviews`);

        return {
            success: true,
            mentors: mentorDefs.length,
            users: userDefs.length,
            bookings: bookings.length,
            conversations: conversations.length,
            reviews: reviews.length,
            demoPassword: DEMO_PASSWORD,
            demoAccounts: allDefs.map((d) => d.email),
        };
    });
