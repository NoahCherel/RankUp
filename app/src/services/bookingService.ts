/**
 * Booking service — CRUD for the `bookings` Firestore collection.
 */
import {
    doc,
    getDoc,
    setDoc,
    updateDoc,
    collection,
    query,
    where,
    getDocs,
    orderBy,
    Timestamp,
    onSnapshot,
    type Unsubscribe,
} from 'firebase/firestore';
import { db, auth } from '../config/firebase';
import { Booking, BookingStatus } from '../types';

const BOOKINGS_COLLECTION = 'bookings';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
const toBooking = (id: string, data: any): Booking => ({
    ...data,
    id,
    date: data.date?.toDate?.() ?? new Date(data.date),
    createdAt: data.createdAt?.toDate?.() ?? new Date(),
    updatedAt: data.updatedAt?.toDate?.() ?? new Date(),
});

// ---------------------------------------------------------------------------
// Create
// ---------------------------------------------------------------------------

export interface CreateBookingInput {
    mentorId: string;
    mentorName: string;
    sessionType: 'tournament' | 'sparring';
    date: Date;
    location: string;
    price: number;
    stripePaymentIntentId?: string;
}

/**
 * Create a new booking in Firestore with status `pending`.
 */
export const createBooking = async (input: CreateBookingInput): Promise<Booking> => {
    const userId = auth.currentUser?.uid;
    if (!userId) throw new Error('User not authenticated');

    const bookingRef = doc(collection(db, BOOKINGS_COLLECTION));
    const now = Timestamp.now();

    const userDoc = await getDoc(doc(db, 'users', userId));
    const userData = userDoc.data();
    const clientName = userData
        ? `${userData.firstName ?? ''} ${userData.lastName ?? ''}`.trim()
        : '';

    const appFee = Math.round(input.price * 0.15 * 100) / 100; // 15% commission

    const bookingData: Record<string, any> = {
        clientId: userId,
        clientName,
        mentorId: input.mentorId,
        mentorName: input.mentorName,
        sessionType: input.sessionType,
        date: Timestamp.fromDate(input.date),
        location: input.location,
        price: input.price,
        appFee,
        status: 'pending' as BookingStatus,
        createdAt: now,
        updatedAt: now,
    };

    if (input.stripePaymentIntentId) {
        bookingData.stripePaymentIntentId = input.stripePaymentIntentId;
    }

    await setDoc(bookingRef, bookingData);
    console.log('[bookingService] Created booking:', bookingRef.id);

    return toBooking(bookingRef.id, {
        ...bookingData,
        date: input.date,
        createdAt: now.toDate(),
        updatedAt: now.toDate(),
    });
};

// ---------------------------------------------------------------------------
// Read
// ---------------------------------------------------------------------------

/**
 * Get a single booking by ID.
 */
export const getBooking = async (bookingId: string): Promise<Booking | null> => {
    const snap = await getDoc(doc(db, BOOKINGS_COLLECTION, bookingId));
    if (!snap.exists()) return null;
    return toBooking(snap.id, snap.data());
};

/**
 * Get all bookings where the current user is the **client**.
 * Sorted client-side to avoid needing a Firestore composite index.
 */
export const getMyBookings = async (): Promise<Booking[]> => {
    const userId = auth.currentUser?.uid;
    if (!userId) return [];

    const q = query(
        collection(db, BOOKINGS_COLLECTION),
        where('clientId', '==', userId),
    );
    const snap = await getDocs(q);
    const bookings = snap.docs.map((d) => toBooking(d.id, d.data()));
    return bookings.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
};

/**
 * Get all bookings where the current user is the **mentor**.
 * Sorted client-side to avoid needing a Firestore composite index.
 */
export const getMentorBookings = async (): Promise<Booking[]> => {
    const userId = auth.currentUser?.uid;
    if (!userId) return [];

    const q = query(
        collection(db, BOOKINGS_COLLECTION),
        where('mentorId', '==', userId),
    );
    const snap = await getDocs(q);
    const bookings = snap.docs.map((d) => toBooking(d.id, d.data()));
    return bookings.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
};

/**
 * Real-time listener for mentor's pending bookings (for notifications badge).
 */
export const onMentorPendingBookings = (
    callback: (bookings: Booking[]) => void,
): Unsubscribe => {
    const userId = auth.currentUser?.uid;
    if (!userId) return () => {};

    const q = query(
        collection(db, BOOKINGS_COLLECTION),
        where('mentorId', '==', userId),
        where('status', '==', 'pending'),
    );

    return onSnapshot(q, (snap) => {
        const bookings = snap.docs.map((d) => toBooking(d.id, d.data()));
        callback(bookings);
    });
};

// ---------------------------------------------------------------------------
// Update status
// ---------------------------------------------------------------------------

/**
 * Update the status of a booking.
 */
export const updateBookingStatus = async (
    bookingId: string,
    status: BookingStatus,
): Promise<void> => {
    const bookingRef = doc(db, BOOKINGS_COLLECTION, bookingId);
    await updateDoc(bookingRef, {
        status,
        updatedAt: Timestamp.now(),
    });
    console.log(`[bookingService] Booking ${bookingId} → ${status}`);
};

/**
 * Mentor accepts a booking.
 */
export const acceptBooking = (bookingId: string) =>
    updateBookingStatus(bookingId, 'confirmed');

/**
 * Mentor rejects a booking.
 */
export const rejectBooking = (bookingId: string) =>
    updateBookingStatus(bookingId, 'rejected');

/**
 * Check whether a booking can be cancelled with a full refund (48h policy).
 */
export const canCancelWithRefund = (bookingDate: Date): boolean => {
    const now = new Date();
    const diffMs = new Date(bookingDate).getTime() - now.getTime();
    return diffMs >= 48 * 60 * 60 * 1000;
};

/**
 * Cancel a booking (by either party).
 */
export const cancelBooking = (bookingId: string) =>
    updateBookingStatus(bookingId, 'cancelled');

/**
 * Mark a booking as completed.
 */
export const completeBooking = (bookingId: string) =>
    updateBookingStatus(bookingId, 'completed');
