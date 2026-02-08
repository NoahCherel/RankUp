// User types
export interface User {
    id: string;
    email: string;
    displayName?: string;
    photoURL?: string;
    createdAt: Date;
    updatedAt: Date;
}

export interface UserProfile extends User {
    firstName: string;
    lastName: string;
    age?: number;
    nationality?: string;

    // Padel specific
    ranking?: number;
    bestRanking?: number;
    points?: number;
    league?: string;
    committee?: string;
    club?: string;
    playStyle?: 'left' | 'right' | 'both';

    // Mentor mode
    isMentor: boolean;
    mentorPrice?: number;
    mentorDescription?: string;
    mentorAvailability?: string[];

    // Stats
    matchesPlayed: number;
    matchesWon: number;
    averageRating: number;
    totalReviews: number;
}

// Booking types
export interface Booking {
    id: string;
    clientId: string;
    mentorId: string;

    sessionType: 'tournament' | 'sparring';
    date: Date;
    location: string;
    price: number;

    status: BookingStatus;

    createdAt: Date;
    updatedAt: Date;
}

export type BookingStatus =
    | 'pending'      // Waiting for mentor approval
    | 'confirmed'    // Mentor accepted, payment held
    | 'rejected'     // Mentor declined
    | 'completed'    // Session done
    | 'cancelled';   // Cancelled by either party

// Message types
export interface Message {
    id: string;
    conversationId: string;
    senderId: string;
    content: string;
    createdAt: Date;
    read: boolean;
}

export interface Conversation {
    id: string;
    participants: string[];
    bookingId: string;
    lastMessage?: string;
    lastMessageAt?: Date;
    unreadCount: number;
}

// Review types
export interface Review {
    id: string;
    bookingId: string;
    reviewerId: string;
    revieweeId: string;
    rating: number; // 1-5
    comment?: string;
    createdAt: Date;
}

// Navigation types
export type RootStackParamList = {
    Auth: undefined;
    Home: undefined;
    Profile: { userId: string };
    EditProfile: undefined;
    Booking: { mentorId: string };
    Chat: { conversationId: string };
    MyBookings: undefined;
};
