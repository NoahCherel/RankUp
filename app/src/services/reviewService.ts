/**
 * Review service — CRUD for the `reviews` Firestore collection.
 *
 * A review can only be left after a booking is completed.
 * Each booking can only have one review per reviewer.
 */
import {
    doc,
    getDoc,
    setDoc,
    collection,
    query,
    where,
    getDocs,
    orderBy,
    Timestamp,
    updateDoc,
    increment,
} from 'firebase/firestore';
import { db, auth } from '../config/firebase';
import { Review } from '../types';

const REVIEWS_COLLECTION = 'reviews';
const USERS_COLLECTION = 'users';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const toReview = (id: string, data: any): Review => ({
    ...data,
    id,
    createdAt: data.createdAt?.toDate?.() ?? new Date(data.createdAt),
});

// ---------------------------------------------------------------------------
// Create
// ---------------------------------------------------------------------------

export interface CreateReviewInput {
    bookingId: string;
    revieweeId: string;
    rating: number; // 1-5
    comment?: string;
}

/**
 * Submit a review for a completed booking.
 * Also updates the reviewee's averageRating and totalReviews.
 */
export const createReview = async (input: CreateReviewInput): Promise<Review> => {
    const userId = auth.currentUser?.uid;
    if (!userId) throw new Error('User not authenticated');

    if (input.rating < 1 || input.rating > 5) {
        throw new Error('Rating must be between 1 and 5');
    }

    // Check if a review already exists for this booking from this user
    const existing = await getReviewForBooking(input.bookingId, userId);
    if (existing) {
        throw new Error('You have already reviewed this booking');
    }

    const reviewRef = doc(collection(db, REVIEWS_COLLECTION));
    const now = Timestamp.now();

    const reviewData = {
        bookingId: input.bookingId,
        reviewerId: userId,
        revieweeId: input.revieweeId,
        rating: input.rating,
        comment: input.comment || '',
        createdAt: now,
    };

    await setDoc(reviewRef, reviewData);
    console.log('[reviewService] Created review:', reviewRef.id);

    // Update the reviewee's average rating and total reviews
    await updateUserRating(input.revieweeId);

    return toReview(reviewRef.id, {
        ...reviewData,
        createdAt: now.toDate(),
    });
};

// ---------------------------------------------------------------------------
// Read
// ---------------------------------------------------------------------------

/**
 * Get a review for a specific booking by a specific reviewer.
 */
export const getReviewForBooking = async (
    bookingId: string,
    reviewerId: string,
): Promise<Review | null> => {
    const q = query(
        collection(db, REVIEWS_COLLECTION),
        where('bookingId', '==', bookingId),
        where('reviewerId', '==', reviewerId),
    );
    const snap = await getDocs(q);
    if (snap.empty) return null;
    return toReview(snap.docs[0].id, snap.docs[0].data());
};

/**
 * Get all reviews for a specific user (as reviewee).
 * Sorted by createdAt descending.
 */
export const getReviewsForUser = async (userId: string): Promise<Review[]> => {
    const q = query(
        collection(db, REVIEWS_COLLECTION),
        where('revieweeId', '==', userId),
    );
    const snap = await getDocs(q);
    const reviews = snap.docs.map((d) => toReview(d.id, d.data()));
    return reviews.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
};

/**
 * Get all reviews for a specific booking.
 */
export const getReviewsForBooking = async (bookingId: string): Promise<Review[]> => {
    const q = query(
        collection(db, REVIEWS_COLLECTION),
        where('bookingId', '==', bookingId),
    );
    const snap = await getDocs(q);
    return snap.docs.map((d) => toReview(d.id, d.data()));
};

// ---------------------------------------------------------------------------
// Update user rating
// ---------------------------------------------------------------------------

/**
 * Recalculate and update a user's averageRating and totalReviews.
 */
const updateUserRating = async (userId: string): Promise<void> => {
    const reviews = await getReviewsForUser(userId);
    if (reviews.length === 0) return;

    const totalRating = reviews.reduce((sum, r) => sum + r.rating, 0);
    const averageRating = Math.round((totalRating / reviews.length) * 10) / 10;

    const userRef = doc(db, USERS_COLLECTION, userId);
    await updateDoc(userRef, {
        averageRating,
        totalReviews: reviews.length,
    });

    console.log(`[reviewService] Updated user ${userId}: avg=${averageRating}, total=${reviews.length}`);
};
