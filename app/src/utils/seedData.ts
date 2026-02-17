/**
 * Seed Data Utility — RankUp MVP
 *
 * Calls the `seedDemoData` Cloud Function which uses Admin SDK
 * to bypass Firestore security rules and populate demo data.
 * Creates real Firebase Auth accounts for all demo users.
 *
 * Links some bookings, conversations, and reviews to the currently
 * logged-in user so they appear in the app immediately.
 *
 * Creates:
 *  - 5 mentor profiles (real Firebase Auth accounts)
 *  - 3 regular user profiles (real Firebase Auth accounts)
 *  - 6 bookings (various statuses)
 *  - 4 conversations with messages
 *  - 8 reviews
 */
import { httpsCallable } from 'firebase/functions';
import { functions } from '../config/firebase';

export interface SeedResult {
    success: boolean;
    error?: string;
    demoPassword?: string;
    demoAccounts?: string[];
}

/**
 * Seed all demo data via Cloud Function.
 * Returns demo account emails and password for login.
 */
export const seedAll = async (): Promise<SeedResult> => {
    try {
        const seedFn = httpsCallable(functions, 'seedDemoData');
        const result = await seedFn({});
        const data = result.data as any;
        if (data?.success) {
            return {
                success: true,
                demoPassword: data.demoPassword,
                demoAccounts: data.demoAccounts,
            };
        }
        return { success: false, error: 'Cloud function returned failure' };
    } catch (error: any) {
        console.error('seedAll error:', error);
        return { success: false, error: error.message || 'Unknown error' };
    }
};

/**
 * Get a summary of what will be seeded.
 */
export const getSeedSummary = () => ({
    mentors: 5,
    users: 3,
    bookings: 6,
    conversations: 4,
    reviews: 8,
    totalMessages: 13,
});
