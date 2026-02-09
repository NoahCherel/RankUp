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
    limit,
    Timestamp,
} from 'firebase/firestore';
import {
    ref,
    uploadBytes,
    getDownloadURL,
} from 'firebase/storage';
import { db, storage, auth } from '../config/firebase';
import { UserProfile } from '../types';

const USERS_COLLECTION = 'users';

// Helper to remove undefined values (Firestore doesn't accept undefined)
const removeUndefined = (obj: Record<string, any>): Record<string, any> => {
    return Object.fromEntries(
        Object.entries(obj).filter(([_, value]) => value !== undefined)
    );
};

// Create or update user profile
export const createUserProfile = async (
    userId: string,
    profileData: Partial<UserProfile>
): Promise<void> => {
    try {
        console.log('[userService] Creating profile for:', userId);
        const userRef = doc(db, USERS_COLLECTION, userId);
        const now = Timestamp.now();

        const defaultProfile: Partial<UserProfile> = {
            id: userId,
            email: auth.currentUser?.email || '',
            createdAt: now.toDate(),
            updatedAt: now.toDate(),
            isMentor: false,
            matchesPlayed: 0,
            matchesWon: 0,
            averageRating: 0,
            totalReviews: 0,
        };

        // Remove undefined values before saving
        const cleanProfileData = removeUndefined(profileData);

        const dataToSave = removeUndefined({
            ...defaultProfile,
            ...cleanProfileData,
            updatedAt: now,
        });

        console.log('[userService] Data to save:', JSON.stringify(dataToSave, null, 2));

        await setDoc(userRef, dataToSave, { merge: true });
        console.log('[userService] Profile created successfully');
    } catch (error) {
        console.error('[userService] Error creating profile:', error);
        throw error;
    }
};

// Get user profile by ID
export const getUserProfile = async (userId: string): Promise<UserProfile | null> => {
    try {
        console.log('[userService] Getting profile for:', userId);
        const userRef = doc(db, USERS_COLLECTION, userId);
        const userSnap = await getDoc(userRef);

        console.log('[userService] Document exists:', userSnap.exists());

        if (userSnap.exists()) {
            const data = userSnap.data();
            console.log('[userService] Raw data:', JSON.stringify(data, null, 2));
            return {
                ...data,
                id: userSnap.id,
                createdAt: data.createdAt?.toDate?.() || new Date(),
                updatedAt: data.updatedAt?.toDate?.() || new Date(),
            } as UserProfile;
        }

        console.log('[userService] No profile found');
        return null;
    } catch (error) {
        console.error('[userService] Error getting profile:', error);
        throw error;
    }
};

// Update user profile
export const updateUserProfile = async (
    userId: string,
    updates: Partial<UserProfile>
): Promise<void> => {
    try {
        console.log('[userService] Updating profile for:', userId);
        const userRef = doc(db, USERS_COLLECTION, userId);
        const cleanUpdates = removeUndefined(updates);
        await updateDoc(userRef, {
            ...cleanUpdates,
            updatedAt: Timestamp.now(),
        });
        console.log('[userService] Profile updated successfully');
    } catch (error) {
        console.error('[userService] Error updating profile:', error);
        throw error;
    }
};

// Check if user has completed onboarding
export const hasCompletedOnboarding = async (userId: string): Promise<boolean> => {
    try {
        console.log('[userService] Checking onboarding for:', userId);
        const profile = await getUserProfile(userId);
        const completed = !!(profile?.firstName && profile?.lastName);
        console.log('[userService] Onboarding completed:', completed);
        return completed;
    } catch (error) {
        console.error('[userService] Error checking onboarding:', error);
        // If we can't check, assume not completed
        return false;
    }
};

// Upload profile photo
export const uploadProfilePhoto = async (
    userId: string,
    photoUri: string
): Promise<string> => {
    try {
        console.log('[userService] Uploading photo for:', userId);

        let blob;
        try {
            const response = await fetch(photoUri);
            blob = await response.blob();
        } catch (fetchError) {
            console.error('[userService] Error fetching blob:', fetchError);
            throw new Error('Failed to process image file');
        }

        const photoRef = ref(storage, `profiles/${userId}/avatar.jpg`);

        try {
            await uploadBytes(photoRef, blob);
        } catch (uploadError: any) {
            if (uploadError.code === 'storage/unauthorized') {
                throw new Error('Permission denied: Check Firebase Storage rules');
            } else if (uploadError.message && uploadError.message.includes('CORS')) {
                throw new Error('CORS Error: You need to configure CORS for your Firebase Storage bucket via Google Cloud Console or gsutil.');
            }
            throw uploadError;
        }

        const downloadURL = await getDownloadURL(photoRef);
        console.log('[userService] Photo uploaded:', downloadURL);

        // Update user profile with new photo URL
        await updateUserProfile(userId, { photoURL: downloadURL });

        return downloadURL;
    } catch (error) {
        console.error('[userService] Error uploading photo:', error);
        // Don't block the whole proccess if upload fails, just return empty string or rethrow if critical
        // For onboarding user experience, we might want to log it and continue without photo?
        // But for now let's rethrow to show alert
        throw error;
    }
};

// Get mentors (users with isMentor = true)
export const getMentors = async (
    filters?: {
        minRanking?: number;
        maxRanking?: number;
        city?: string;
        maxPrice?: number;
    },
    limitCount: number = 20
): Promise<UserProfile[]> => {
    let q = query(
        collection(db, USERS_COLLECTION),
        where('isMentor', '==', true),
        orderBy('averageRating', 'desc'),
        limit(limitCount)
    );

    const querySnapshot = await getDocs(q);
    const mentors: UserProfile[] = [];

    querySnapshot.forEach((doc) => {
        const data = doc.data();
        const profile: UserProfile = {
            ...data,
            id: doc.id,
            createdAt: data.createdAt?.toDate?.() || new Date(),
            updatedAt: data.updatedAt?.toDate?.() || new Date(),
        } as UserProfile;

        // Apply client-side filters if needed
        if (filters) {
            if (filters.minRanking && profile.ranking && profile.ranking > filters.minRanking) {
                return;
            }
            if (filters.maxRanking && profile.ranking && profile.ranking < filters.maxRanking) {
                return;
            }
            if (filters.maxPrice && profile.mentorPrice && profile.mentorPrice > filters.maxPrice) {
                return;
            }
        }

        mentors.push(profile);
    });

    return mentors;
};

// Search mentors by name
export const searchMentors = async (searchTerm: string): Promise<UserProfile[]> => {
    // Note: Firestore doesn't support full-text search natively
    // For MVP, we'll fetch all mentors and filter client-side
    const mentors = await getMentors({}, 100);

    const lowercaseSearch = searchTerm.toLowerCase();
    return mentors.filter(mentor => {
        const fullName = `${mentor.firstName} ${mentor.lastName}`.toLowerCase();
        return fullName.includes(lowercaseSearch);
    });
};

// Toggle mentor mode
export const toggleMentorMode = async (
    userId: string,
    isMentor: boolean,
    mentorData?: {
        mentorPrice?: number;
        mentorDescription?: string;
    }
): Promise<void> => {
    const updates: Partial<UserProfile> = {
        isMentor,
        ...(isMentor ? mentorData : {}),
    };

    await updateUserProfile(userId, updates);
};
