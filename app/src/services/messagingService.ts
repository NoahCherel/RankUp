/**
 * Messaging service — CRUD for `conversations` and `messages` Firestore collections.
 *
 * Conversations are created automatically when a booking is confirmed,
 * allowing client and mentor to chat.
 * Messages are real-time via onSnapshot.
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
    addDoc,
    serverTimestamp,
    type Unsubscribe,
} from 'firebase/firestore';
import { db, auth } from '../config/firebase';
import { Conversation, Message } from '../types';

const CONVERSATIONS_COLLECTION = 'conversations';
const MESSAGES_COLLECTION = 'messages';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const toConversation = (id: string, data: any): Conversation => ({
    ...data,
    id,
    lastMessageAt: data.lastMessageAt?.toDate?.() ?? (data.lastMessageAt ? new Date(data.lastMessageAt) : undefined),
});

const toMessage = (id: string, data: any): Message => ({
    ...data,
    id,
    createdAt: data.createdAt?.toDate?.() ?? new Date(data.createdAt),
});

// ---------------------------------------------------------------------------
// Conversations
// ---------------------------------------------------------------------------

/**
 * Get or create a conversation for a booking between two participants.
 * If a conversation already exists for the bookingId, return it.
 */
export const getOrCreateConversation = async (
    bookingId: string,
    participantIds: [string, string],
): Promise<Conversation> => {
    const userId = auth.currentUser?.uid;
    if (!userId) throw new Error('User not authenticated');

    // Query must include array-contains for current user to satisfy Firestore rules
    const q = query(
        collection(db, CONVERSATIONS_COLLECTION),
        where('bookingId', '==', bookingId),
        where('participants', 'array-contains', userId),
    );
    const snap = await getDocs(q);

    if (!snap.empty) {
        const existing = snap.docs[0];
        return toConversation(existing.id, existing.data());
    }

    // Create new conversation
    const convRef = doc(collection(db, CONVERSATIONS_COLLECTION));
    const convData = {
        participants: participantIds,
        bookingId,
        lastMessage: '',
        lastMessageAt: Timestamp.now(),
        unreadCount: 0,
    };

    await setDoc(convRef, convData);

    return toConversation(convRef.id, {
        ...convData,
        lastMessageAt: convData.lastMessageAt.toDate(),
    });
};

/**
 * Get all conversations for the current user.
 * Sorted client-side by lastMessageAt descending.
 */
export const getMyConversations = async (): Promise<Conversation[]> => {
    const userId = auth.currentUser?.uid;
    if (!userId) return [];

    const q = query(
        collection(db, CONVERSATIONS_COLLECTION),
        where('participants', 'array-contains', userId),
    );
    const snap = await getDocs(q);
    const conversations = snap.docs.map((d) => toConversation(d.id, d.data()));

    return conversations.sort((a, b) => {
        const aTime = a.lastMessageAt?.getTime() ?? 0;
        const bTime = b.lastMessageAt?.getTime() ?? 0;
        return bTime - aTime;
    });
};

/**
 * Real-time listener for the current user's conversations.
 */
export const onMyConversations = (
    callback: (conversations: Conversation[]) => void,
): Unsubscribe => {
    const userId = auth.currentUser?.uid;
    if (!userId) return () => {};

    const q = query(
        collection(db, CONVERSATIONS_COLLECTION),
        where('participants', 'array-contains', userId),
    );

    return onSnapshot(q, (snap) => {
        const conversations = snap.docs.map((d) => toConversation(d.id, d.data()));
        conversations.sort((a, b) => {
            const aTime = a.lastMessageAt?.getTime() ?? 0;
            const bTime = b.lastMessageAt?.getTime() ?? 0;
            return bTime - aTime;
        });
        callback(conversations);
    });
};

/**
 * Get a single conversation by ID.
 */
export const getConversation = async (conversationId: string): Promise<Conversation | null> => {
    const snap = await getDoc(doc(db, CONVERSATIONS_COLLECTION, conversationId));
    if (!snap.exists()) return null;
    return toConversation(snap.id, snap.data());
};

// ---------------------------------------------------------------------------
// Messages
// ---------------------------------------------------------------------------

/**
 * Send a message to a conversation.
 */
export const sendMessage = async (
    conversationId: string,
    content: string,
): Promise<Message> => {
    const userId = auth.currentUser?.uid;
    if (!userId) throw new Error('User not authenticated');

    const msgRef = doc(collection(db, CONVERSATIONS_COLLECTION, conversationId, MESSAGES_COLLECTION));
    const now = Timestamp.now();

    const msgData = {
        conversationId,
        senderId: userId,
        content: content.trim(),
        createdAt: now,
        read: false,
    };

    await setDoc(msgRef, msgData);

    // Update the conversation's last message
    const convRef = doc(db, CONVERSATIONS_COLLECTION, conversationId);
    await updateDoc(convRef, {
        lastMessage: content.trim().substring(0, 100),
        lastMessageAt: now,
    });

    return toMessage(msgRef.id, {
        ...msgData,
        createdAt: now.toDate(),
    });
};

/**
 * Real-time listener for messages in a conversation, ordered by createdAt.
 */
export const onMessages = (
    conversationId: string,
    callback: (messages: Message[]) => void,
): Unsubscribe => {
    const q = query(
        collection(db, CONVERSATIONS_COLLECTION, conversationId, MESSAGES_COLLECTION),
        orderBy('createdAt', 'asc'),
    );

    return onSnapshot(q, (snap) => {
        const messages = snap.docs.map((d) => toMessage(d.id, d.data()));
        callback(messages);
    });
};

/**
 * Mark all messages from the other user as read.
 */
export const markMessagesAsRead = async (conversationId: string): Promise<void> => {
    const userId = auth.currentUser?.uid;
    if (!userId) return;

    const q = query(
        collection(db, CONVERSATIONS_COLLECTION, conversationId, MESSAGES_COLLECTION),
        where('read', '==', false),
    );

    const snap = await getDocs(q);

    const updates = snap.docs
        .filter((d) => d.data().senderId !== userId)
        .map((d) => updateDoc(d.ref, { read: true }));

    await Promise.all(updates);
};
