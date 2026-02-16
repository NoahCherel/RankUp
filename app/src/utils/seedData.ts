/**
 * Seed Data Utility — RankUp MVP
 *
 * Populates Firestore with realistic demo data for soutenance.
 * Run from the app's developer menu or import and call `seedAll()`.
 *
 * Links some bookings, conversations, and reviews to the currently
 * logged-in user so they appear in the app immediately.
 *
 * Creates:
 *  - 5 mentor profiles
 *  - 3 regular user profiles (+ updates current user)
 *  - 6 bookings (various statuses)
 *  - 4 conversations with messages
 *  - 8 reviews
 */
import {
    doc,
    setDoc,
    collection,
    Timestamp,
    writeBatch,
} from 'firebase/firestore';
import { db, auth } from '../config/firebase';
import { getUserProfile } from '../services/userService';

// ---------------------------------------------------------------------------
// Data
// ---------------------------------------------------------------------------

const NOW = new Date();
const DAY = 24 * 60 * 60 * 1000;

const mentors = [
    {
        id: 'mentor_carlos',
        email: 'carlos.rivera@demo.com',
        firstName: 'Carlos',
        lastName: 'Rivera',
        age: 28,
        nationality: 'ES',
        ranking: 45,
        bestRanking: 30,
        points: 1850,
        league: 'ile-de-france',
        club: 'Paris Padel Club',
        playStyle: 'left' as const,
        isMentor: true,
        mentorPrice: 45,
        mentorDescription: 'Joueur professionnel avec 8 ans d\'expérience. Spécialisé dans le jeu au filet et les volées.',
        matchesPlayed: 320,
        matchesWon: 240,
        averageRating: 4.8,
        totalReviews: 12,
    },
    {
        id: 'mentor_sophie',
        email: 'sophie.martin@demo.com',
        firstName: 'Sophie',
        lastName: 'Martin',
        age: 32,
        nationality: 'FR',
        ranking: 120,
        bestRanking: 85,
        points: 1200,
        league: 'paca',
        club: 'Marseille Padel Arena',
        playStyle: 'right' as const,
        isMentor: true,
        mentorPrice: 35,
        mentorDescription: 'Coach certifiée FFT. Approche pédagogique adaptée à tous les niveaux.',
        matchesPlayed: 180,
        matchesWon: 120,
        averageRating: 4.6,
        totalReviews: 8,
    },
    {
        id: 'mentor_marco',
        email: 'marco.rossi@demo.com',
        firstName: 'Marco',
        lastName: 'Rossi',
        age: 25,
        nationality: 'IT',
        ranking: 78,
        bestRanking: 55,
        points: 1450,
        league: 'occitanie',
        club: 'Toulouse Padel Center',
        playStyle: 'both' as const,
        isMentor: true,
        mentorPrice: 40,
        mentorDescription: 'Polyvalent et stratégique. Idéal pour progresser rapidement sur les deux côtés du terrain.',
        matchesPlayed: 210,
        matchesWon: 155,
        averageRating: 4.3,
        totalReviews: 6,
    },
    {
        id: 'mentor_lucia',
        email: 'lucia.fernandez@demo.com',
        firstName: 'Lucia',
        lastName: 'Fernandez',
        age: 30,
        nationality: 'AR',
        ranking: 35,
        bestRanking: 20,
        points: 2100,
        league: 'auvergne-rhone-alpes',
        club: 'Lyon Padel Club',
        playStyle: 'left' as const,
        isMentor: true,
        mentorPrice: 55,
        mentorDescription: 'Ancienne joueuse du circuit WPT. Expertise tactique de haut niveau.',
        matchesPlayed: 450,
        matchesWon: 370,
        averageRating: 4.9,
        totalReviews: 15,
    },
    {
        id: 'mentor_thomas',
        email: 'thomas.dupont@demo.com',
        firstName: 'Thomas',
        lastName: 'Dupont',
        age: 27,
        nationality: 'FR',
        ranking: 200,
        bestRanking: 150,
        points: 900,
        league: 'bretagne',
        club: 'Rennes Padel Indoor',
        playStyle: 'right' as const,
        isMentor: true,
        mentorPrice: 30,
        mentorDescription: 'Spécialiste du côté droit. Parfait pour les débutants et intermédiaires.',
        matchesPlayed: 100,
        matchesWon: 65,
        averageRating: 4.1,
        totalReviews: 4,
    },
];

const users = [
    {
        id: 'user_alice',
        email: 'alice.bernard@demo.com',
        firstName: 'Alice',
        lastName: 'Bernard',
        age: 24,
        nationality: 'FR',
        ranking: 500,
        league: 'ile-de-france',
        club: 'Paris Padel Club',
        playStyle: 'right' as const,
        isMentor: false,
        matchesPlayed: 25,
        matchesWon: 10,
        averageRating: 0,
        totalReviews: 0,
    },
    {
        id: 'user_julien',
        email: 'julien.moreau@demo.com',
        firstName: 'Julien',
        lastName: 'Moreau',
        age: 29,
        nationality: 'FR',
        ranking: 350,
        league: 'paca',
        club: 'Nice Padel Beach',
        playStyle: 'left' as const,
        isMentor: false,
        matchesPlayed: 45,
        matchesWon: 22,
        averageRating: 0,
        totalReviews: 0,
    },
    {
        id: 'user_emma',
        email: 'emma.leroy@demo.com',
        firstName: 'Emma',
        lastName: 'Leroy',
        age: 22,
        nationality: 'FR',
        ranking: 800,
        league: 'occitanie',
        club: 'Montpellier Padel Club',
        playStyle: 'both' as const,
        isMentor: false,
        matchesPlayed: 12,
        matchesWon: 4,
        averageRating: 0,
        totalReviews: 0,
    },
];

const bookings = [
    {
        id: 'booking_1',
        clientId: 'user_alice',
        clientName: 'Alice Bernard',
        mentorId: 'mentor_carlos',
        mentorName: 'Carlos Rivera',
        sessionType: 'sparring' as const,
        date: new Date(NOW.getTime() + 3 * DAY),
        location: 'Paris Padel Club — Court 3',
        price: 45,
        appFee: 6.75,
        status: 'confirmed' as const,
    },
    {
        id: 'booking_2',
        clientId: 'user_julien',
        clientName: 'Julien Moreau',
        mentorId: 'mentor_sophie',
        mentorName: 'Sophie Martin',
        sessionType: 'tournament' as const,
        date: new Date(NOW.getTime() + 5 * DAY),
        location: 'Marseille Padel Arena — Court 1',
        price: 35,
        appFee: 5.25,
        status: 'pending' as const,
    },
    {
        id: 'booking_3',
        clientId: 'user_emma',
        clientName: 'Emma Leroy',
        mentorId: 'mentor_marco',
        mentorName: 'Marco Rossi',
        sessionType: 'sparring' as const,
        date: new Date(NOW.getTime() - 2 * DAY),
        location: 'Toulouse Padel Center — Court 5',
        price: 40,
        appFee: 6,
        status: 'completed' as const,
    },
    {
        id: 'booking_4',
        clientId: 'user_alice',
        clientName: 'Alice Bernard',
        mentorId: 'mentor_lucia',
        mentorName: 'Lucia Fernandez',
        sessionType: 'sparring' as const,
        date: new Date(NOW.getTime() - 5 * DAY),
        location: 'Lyon Padel Club — Court 2',
        price: 55,
        appFee: 8.25,
        status: 'completed' as const,
    },
    {
        id: 'booking_5',
        clientId: 'user_julien',
        clientName: 'Julien Moreau',
        mentorId: 'mentor_carlos',
        mentorName: 'Carlos Rivera',
        sessionType: 'tournament' as const,
        date: new Date(NOW.getTime() + 7 * DAY),
        location: 'Paris Padel Club — Court 1',
        price: 45,
        appFee: 6.75,
        status: 'pending' as const,
    },
    {
        id: 'booking_6',
        clientId: 'user_emma',
        clientName: 'Emma Leroy',
        mentorId: 'mentor_thomas',
        mentorName: 'Thomas Dupont',
        sessionType: 'sparring' as const,
        date: new Date(NOW.getTime() - 10 * DAY),
        location: 'Rennes Padel Indoor — Court 4',
        price: 30,
        appFee: 4.5,
        status: 'completed' as const,
    },
];

const conversations = [
    {
        id: 'conv_1',
        participants: ['user_alice', 'mentor_carlos'],
        bookingId: 'booking_1',
        lastMessage: 'Parfait, à jeudi alors ! 🎾',
        lastMessageAt: new Date(NOW.getTime() - 1 * 60 * 60 * 1000),
        unreadCount: 0,
        messages: [
            { senderId: 'user_alice', content: 'Bonjour Carlos ! J\'ai hâte pour la session.', createdAt: new Date(NOW.getTime() - 4 * 60 * 60 * 1000) },
            { senderId: 'mentor_carlos', content: 'Salut Alice ! Super, on va travailler les volées hautes.', createdAt: new Date(NOW.getTime() - 3 * 60 * 60 * 1000) },
            { senderId: 'user_alice', content: 'Génial ! C\'est exactement ce dont j\'ai besoin.', createdAt: new Date(NOW.getTime() - 2 * 60 * 60 * 1000) },
            { senderId: 'mentor_carlos', content: 'Parfait, à jeudi alors ! 🎾', createdAt: new Date(NOW.getTime() - 1 * 60 * 60 * 1000) },
        ],
    },
    {
        id: 'conv_2',
        participants: ['user_emma', 'mentor_marco'],
        bookingId: 'booking_3',
        lastMessage: 'Merci pour la session, c\'était top ! 💪',
        lastMessageAt: new Date(NOW.getTime() - 2 * DAY),
        unreadCount: 0,
        messages: [
            { senderId: 'user_emma', content: 'Bonjour Marco, est-ce qu\'on peut faire des exercices de bandeja ?', createdAt: new Date(NOW.getTime() - 3 * DAY) },
            { senderId: 'mentor_marco', content: 'Bien sûr ! J\'ai un programme parfait pour ça.', createdAt: new Date(NOW.getTime() - 3 * DAY + 30 * 60 * 1000) },
            { senderId: 'user_emma', content: 'Merci pour la session, c\'était top ! 💪', createdAt: new Date(NOW.getTime() - 2 * DAY) },
        ],
    },
    {
        id: 'conv_3',
        participants: ['user_alice', 'mentor_lucia'],
        bookingId: 'booking_4',
        lastMessage: 'N\'hésite pas à revenir ! 😊',
        lastMessageAt: new Date(NOW.getTime() - 4 * DAY),
        unreadCount: 0,
        messages: [
            { senderId: 'mentor_lucia', content: 'Bravo pour aujourd\'hui Alice, tu as bien progressé !', createdAt: new Date(NOW.getTime() - 5 * DAY) },
            { senderId: 'user_alice', content: 'Merci beaucoup Lucia ! J\'ai appris énormément.', createdAt: new Date(NOW.getTime() - 5 * DAY + 15 * 60 * 1000) },
            { senderId: 'mentor_lucia', content: 'N\'hésite pas à revenir ! 😊', createdAt: new Date(NOW.getTime() - 4 * DAY) },
        ],
    },
    {
        id: 'conv_4',
        participants: ['user_emma', 'mentor_thomas'],
        bookingId: 'booking_6',
        lastMessage: 'À bientôt !',
        lastMessageAt: new Date(NOW.getTime() - 9 * DAY),
        unreadCount: 0,
        messages: [
            { senderId: 'user_emma', content: 'Salut Thomas, merci pour les conseils sur le service !', createdAt: new Date(NOW.getTime() - 10 * DAY) },
            { senderId: 'mentor_thomas', content: 'Avec plaisir ! Continue à pratiquer le mouvement qu\'on a vu.', createdAt: new Date(NOW.getTime() - 10 * DAY + 45 * 60 * 1000) },
            { senderId: 'user_emma', content: 'À bientôt !', createdAt: new Date(NOW.getTime() - 9 * DAY) },
        ],
    },
];

const reviews = [
    { id: 'review_1', bookingId: 'booking_3', reviewerId: 'user_emma', revieweeId: 'mentor_marco', rating: 4, comment: 'Très bon coach, explique clairement les techniques.' },
    { id: 'review_2', bookingId: 'booking_4', reviewerId: 'user_alice', revieweeId: 'mentor_lucia', rating: 5, comment: 'Incroyable ! Lucia est la meilleure coach que j\'ai eue.' },
    { id: 'review_3', bookingId: 'booking_6', reviewerId: 'user_emma', revieweeId: 'mentor_thomas', rating: 4, comment: 'Patient et pédagogue. Parfait pour débuter.' },
    { id: 'review_4', bookingId: 'booking_fake_1', reviewerId: 'user_julien', revieweeId: 'mentor_carlos', rating: 5, comment: 'Carlos est exceptionnel. Niveau pro et très sympa.' },
    { id: 'review_5', bookingId: 'booking_fake_2', reviewerId: 'user_alice', revieweeId: 'mentor_carlos', rating: 5, comment: 'Session intense et enrichissante !' },
    { id: 'review_6', bookingId: 'booking_fake_3', reviewerId: 'user_emma', revieweeId: 'mentor_sophie', rating: 5, comment: 'Sophie adapte parfaitement ses cours au niveau.' },
    { id: 'review_7', bookingId: 'booking_fake_4', reviewerId: 'user_julien', revieweeId: 'mentor_sophie', rating: 4, comment: 'Bonne ambiance et bons conseils techniques.' },
    { id: 'review_8', bookingId: 'booking_fake_5', reviewerId: 'user_alice', revieweeId: 'mentor_lucia', rating: 5, comment: 'J\'ai progressé de fou en une seule session.' },
];

// ---------------------------------------------------------------------------
// Seed functions
// ---------------------------------------------------------------------------

/**
 * Get the current user's ID and name for linking seed data.
 */
const getCurrentUserInfo = async () => {
    const uid = auth.currentUser?.uid;
    if (!uid) return { uid: 'user_alice', name: 'Alice Bernard' };
    try {
        const profile = await getUserProfile(uid);
        if (profile) {
            return { uid, name: `${profile.firstName} ${profile.lastName}` };
        }
    } catch {
        // fallback
    }
    return { uid, name: 'Utilisateur' };
};

export const seedUsers = async (): Promise<void> => {
    const batch = writeBatch(db);
    const now = Timestamp.now();

    for (const user of [...mentors, ...users]) {
        const ref = doc(db, 'users', user.id);
        batch.set(ref, {
            ...user,
            createdAt: now,
            updatedAt: now,
        }, { merge: true });
    }

    await batch.commit();
};

export const seedBookings = async (): Promise<void> => {
    const batch = writeBatch(db);
    const now = Timestamp.now();
    const currentUser = await getCurrentUserInfo();

    for (const booking of bookings) {
        const ref = doc(db, 'bookings', booking.id);
        // Replace 'user_alice' with current user in some bookings
        const isAlice = booking.clientId === 'user_alice';
        batch.set(ref, {
            ...booking,
            clientId: isAlice ? currentUser.uid : booking.clientId,
            clientName: isAlice ? currentUser.name : booking.clientName,
            date: Timestamp.fromDate(booking.date),
            createdAt: now,
            updatedAt: now,
        }, { merge: true });
    }

    await batch.commit();
};

export const seedConversations = async (): Promise<void> => {
    const currentUser = await getCurrentUserInfo();

    for (const conv of conversations) {
        const convRef = doc(db, 'conversations', conv.id);
        // Replace 'user_alice' participant with current user
        const participants = conv.participants.map(
            (p) => p === 'user_alice' ? currentUser.uid : p,
        );
        await setDoc(convRef, {
            participants,
            bookingId: conv.bookingId,
            lastMessage: conv.lastMessage,
            lastMessageAt: Timestamp.fromDate(conv.lastMessageAt),
            unreadCount: conv.unreadCount,
        }, { merge: true });

        // Seed messages
        for (const msg of conv.messages) {
            const msgRef = doc(collection(db, 'conversations', conv.id, 'messages'));
            await setDoc(msgRef, {
                conversationId: conv.id,
                senderId: msg.senderId === 'user_alice' ? currentUser.uid : msg.senderId,
                content: msg.content,
                createdAt: Timestamp.fromDate(msg.createdAt),
                read: true,
            });
        }
    }
};

export const seedReviews = async (): Promise<void> => {
    const batch = writeBatch(db);
    const now = Timestamp.now();
    const currentUser = await getCurrentUserInfo();

    for (const review of reviews) {
        const ref = doc(db, 'reviews', review.id);
        batch.set(ref, {
            ...review,
            reviewerId: review.reviewerId === 'user_alice' ? currentUser.uid : review.reviewerId,
            createdAt: now,
        }, { merge: true });
    }

    await batch.commit();
};

/**
 * Seed all demo data.
 * Call this from a dev screen or debug button.
 */
export const seedAll = async (): Promise<{ success: boolean; error?: string }> => {
    try {
        await seedUsers();
        await seedBookings();
        await seedConversations();
        await seedReviews();
        return { success: true };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
};

/**
 * Get a summary of what will be seeded.
 */
export const getSeedSummary = () => ({
    mentors: mentors.length,
    users: users.length,
    bookings: bookings.length,
    conversations: conversations.length,
    reviews: reviews.length,
    totalMessages: conversations.reduce((sum, c) => sum + c.messages.length, 0),
});
