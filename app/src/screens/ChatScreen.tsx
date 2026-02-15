/**
 * ChatScreen — Real-time chat for a specific conversation.
 *
 * Messages are streamed via Firestore onSnapshot.
 * The input bar stays at the bottom with a send button.
 */
import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    TouchableOpacity,
    TextInput,
    KeyboardAvoidingView,
    Platform,
} from 'react-native';
import { Colors, Spacing, FontSizes, BorderRadius } from '../theme';
import { Ionicons } from '@expo/vector-icons';
import { Message } from '../types';
import { onMessages, sendMessage, markMessagesAsRead } from '../services/messagingService';
import { auth } from '../config/firebase';
import { formatRelativeTime } from '../utils/formatters';

interface ChatScreenProps {
    conversationId: string;
    otherUserName: string;
    onBack: () => void;
}

export default function ChatScreen({ conversationId, otherUserName, onBack }: ChatScreenProps) {
    const [messages, setMessages] = useState<Message[]>([]);
    const [inputText, setInputText] = useState('');
    const [sending, setSending] = useState(false);
    const flatListRef = useRef<FlatList>(null);
    const userId = auth.currentUser?.uid;

    useEffect(() => {
        const unsubscribe = onMessages(conversationId, (msgs) => {
            setMessages(msgs);
            // Mark messages as read when we receive them
            markMessagesAsRead(conversationId).catch(() => {});
        });

        return unsubscribe;
    }, [conversationId]);

    // Scroll to bottom when new messages arrive
    useEffect(() => {
        if (messages.length > 0) {
            setTimeout(() => {
                flatListRef.current?.scrollToEnd({ animated: true });
            }, 100);
        }
    }, [messages.length]);

    const handleSend = useCallback(async () => {
        const text = inputText.trim();
        if (!text || sending) return;

        setSending(true);
        setInputText('');

        try {
            await sendMessage(conversationId, text);
        } catch (err) {
            console.error('[ChatScreen] Send error:', err);
            setInputText(text); // Restore text on error
        } finally {
            setSending(false);
        }
    }, [inputText, sending, conversationId]);

    const renderMessage = ({ item }: { item: Message }) => {
        const isMine = item.senderId === userId;

        return (
            <View style={[styles.messageBubbleWrap, isMine ? styles.myMessageWrap : styles.otherMessageWrap]}>
                <View style={[styles.messageBubble, isMine ? styles.myMessage : styles.otherMessage]}>
                    <Text style={[styles.messageText, isMine ? styles.myMessageText : styles.otherMessageText]}>
                        {item.content}
                    </Text>
                    <Text style={[styles.messageTime, isMine ? styles.myMessageTime : styles.otherMessageTime]}>
                        {formatRelativeTime(new Date(item.createdAt))}
                    </Text>
                </View>
            </View>
        );
    };

    return (
        <KeyboardAvoidingView
            style={styles.container}
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
            keyboardVerticalOffset={0}
        >
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={onBack} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={22} color={Colors.textPrimary} />
                </TouchableOpacity>
                <View style={styles.headerInfo}>
                    <Text style={styles.headerTitle} numberOfLines={1}>
                        {otherUserName}
                    </Text>
                </View>
                <View style={styles.headerSpacer} />
            </View>

            {/* Messages */}
            <FlatList
                ref={flatListRef}
                data={messages}
                keyExtractor={(item) => item.id}
                renderItem={renderMessage}
                contentContainerStyle={styles.messagesList}
                showsVerticalScrollIndicator={false}
                ListEmptyComponent={
                    <View style={styles.emptyContainer}>
                        <Ionicons
                            name="chatbubble-ellipses-outline"
                            size={40}
                            color={Colors.textSecondary}
                            style={{ marginBottom: Spacing.md }}
                        />
                        <Text style={styles.emptyText}>
                            {'Envoyez votre premier message !'}
                        </Text>
                    </View>
                }
                onContentSizeChange={() => {
                    flatListRef.current?.scrollToEnd({ animated: false });
                }}
            />

            {/* Input bar */}
            <View style={styles.inputBar}>
                <TextInput
                    style={styles.input}
                    value={inputText}
                    onChangeText={setInputText}
                    placeholder="Écrire un message…"
                    placeholderTextColor={Colors.textSecondary}
                    multiline
                    maxLength={1000}
                    onSubmitEditing={handleSend}
                    blurOnSubmit={false}
                />
                <TouchableOpacity
                    style={[styles.sendButton, (!inputText.trim() || sending) && styles.sendButtonDisabled]}
                    onPress={handleSend}
                    disabled={!inputText.trim() || sending}
                    activeOpacity={0.7}
                >
                    <Ionicons
                        name="send"
                        size={20}
                        color={inputText.trim() && !sending ? Colors.background : Colors.textSecondary}
                    />
                </TouchableOpacity>
            </View>
        </KeyboardAvoidingView>
    );
}

// ---------------------------------------------------------------------------
// Styles
// ---------------------------------------------------------------------------

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: Colors.background },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: Spacing.md,
        paddingTop: Spacing.xxl + 8,
        paddingBottom: Spacing.md,
        borderBottomWidth: 1,
        borderBottomColor: Colors.border,
    },
    backButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: Colors.backgroundSecondary,
        alignItems: 'center',
        justifyContent: 'center',
    },
    headerInfo: {
        flex: 1,
        alignItems: 'center',
        paddingHorizontal: Spacing.sm,
    },
    headerTitle: {
        color: Colors.textPrimary,
        fontSize: FontSizes.lg,
        fontWeight: '700',
    },
    headerSpacer: { width: 40 },

    // Messages list
    messagesList: {
        padding: Spacing.md,
        paddingBottom: Spacing.sm,
        flexGrow: 1,
        justifyContent: 'flex-end',
    },

    emptyContainer: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: Spacing.xxl * 3,
    },
    emptyText: {
        color: Colors.textSecondary,
        fontSize: FontSizes.sm,
        fontStyle: 'italic',
    },

    // Message bubbles
    messageBubbleWrap: {
        marginBottom: Spacing.sm,
        flexDirection: 'row',
    },
    myMessageWrap: {
        justifyContent: 'flex-end',
    },
    otherMessageWrap: {
        justifyContent: 'flex-start',
    },
    messageBubble: {
        maxWidth: '78%',
        paddingHorizontal: Spacing.md,
        paddingVertical: Spacing.sm + 2,
        borderRadius: BorderRadius.xl,
    },
    myMessage: {
        backgroundColor: Colors.primary,
        borderBottomRightRadius: BorderRadius.sm,
    },
    otherMessage: {
        backgroundColor: Colors.backgroundSecondary,
        borderBottomLeftRadius: BorderRadius.sm,
        borderWidth: 1,
        borderColor: Colors.border,
    },
    messageText: {
        fontSize: FontSizes.sm,
        lineHeight: 20,
    },
    myMessageText: {
        color: Colors.background,
    },
    otherMessageText: {
        color: Colors.textPrimary,
    },
    messageTime: {
        fontSize: FontSizes.xs - 1,
        marginTop: 4,
    },
    myMessageTime: {
        color: 'rgba(15, 23, 42, 0.5)',
        textAlign: 'right',
    },
    otherMessageTime: {
        color: Colors.textSecondary,
    },

    // Input bar
    inputBar: {
        flexDirection: 'row',
        alignItems: 'flex-end',
        paddingHorizontal: Spacing.md,
        paddingVertical: Spacing.sm,
        borderTopWidth: 1,
        borderTopColor: Colors.border,
        backgroundColor: Colors.backgroundSecondary,
        paddingBottom: Platform.OS === 'ios' ? Spacing.lg : Spacing.sm,
    },
    input: {
        flex: 1,
        backgroundColor: Colors.background,
        borderRadius: BorderRadius.xl,
        paddingHorizontal: Spacing.md,
        paddingVertical: Spacing.sm + 2,
        color: Colors.textPrimary,
        fontSize: FontSizes.sm,
        maxHeight: 100,
        borderWidth: 1,
        borderColor: Colors.border,
    },
    sendButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: Colors.primary,
        alignItems: 'center',
        justifyContent: 'center',
        marginLeft: Spacing.sm,
    },
    sendButtonDisabled: {
        backgroundColor: Colors.backgroundSecondary,
    },
});
