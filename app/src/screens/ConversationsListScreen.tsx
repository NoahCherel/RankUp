/**
 * ConversationsListScreen — List of all conversations for the current user.
 *
 * Shows the last message, timestamp, and the other participant's name.
 * Tapping a conversation opens the ChatScreen.
 */
import React, { useState, useEffect, useCallback } from 'react';
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    TouchableOpacity,
    RefreshControl,
} from 'react-native';
import { Colors, Spacing, FontSizes, BorderRadius } from '../theme';
import { Ionicons } from '@expo/vector-icons';
import { LoadingSpinner } from '../components';
import { Conversation } from '../types';
import { onMyConversations, getMyConversations } from '../services/messagingService';
import { getUserProfile } from '../services/userService';
import { getBooking } from '../services/bookingService';
import { auth } from '../config/firebase';
import { formatRelativeTime, truncateText } from '../utils/formatters';
import { useResponsive } from '../utils/responsive';

interface ConversationsListScreenProps {
    onConversationPress: (conversationId: string, otherUserName: string) => void;
    onBack: () => void;
}

interface ConversationWithMeta extends Conversation {
    otherUserName: string;
    bookingLabel: string;
}

export default function ConversationsListScreen({
    onConversationPress,
    onBack,
}: ConversationsListScreenProps) {
    const [conversations, setConversations] = useState<ConversationWithMeta[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    const enrichConversations = useCallback(async (convs: Conversation[]) => {
        const userId = auth.currentUser?.uid;
        if (!userId) return [];

        const enriched: ConversationWithMeta[] = await Promise.all(
            convs.map(async (conv) => {
                const otherId = conv.participants.find((p) => p !== userId) || '';
                let otherUserName = 'Utilisateur';
                let bookingLabel = '';

                try {
                    const otherProfile = await getUserProfile(otherId);
                    if (otherProfile) {
                        otherUserName = `${otherProfile.firstName || ''} ${otherProfile.lastName || ''}`.trim() || 'Utilisateur';
                    }
                } catch { /* ignore */ }

                try {
                    const booking = await getBooking(conv.bookingId);
                    if (booking) {
                        const sessionLabel = booking.sessionType === 'tournament' ? 'Prépa Tournoi' : 'Sparring';
                        bookingLabel = sessionLabel;
                    }
                } catch { /* ignore */ }

                return { ...conv, otherUserName, bookingLabel };
            }),
        );

        return enriched;
    }, []);

    useEffect(() => {
        const unsubscribe = onMyConversations(async (convs) => {
            const enriched = await enrichConversations(convs);
            setConversations(enriched);
            setLoading(false);
            setRefreshing(false);
        });

        return unsubscribe;
    }, [enrichConversations]);

    const onRefresh = async () => {
        setRefreshing(true);
        try {
            const convs = await getMyConversations();
            const enriched = await enrichConversations(convs);
            setConversations(enriched);
        } catch (err) {
            // Error handled silently
        } finally {
            setRefreshing(false);
        }
    };

    const { headerPaddingTop, contentStyle, isWeb, isWide } = useResponsive();

    if (loading) {
        return <LoadingSpinner fullScreen message="Chargement des conversations…" />;
    }

    return (
        <View style={styles.container}>
            {/* Header */}
            <View style={[styles.header, { paddingTop: headerPaddingTop }]}>
                <TouchableOpacity onPress={onBack} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={22} color={Colors.textPrimary} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>{'Messages'}</Text>
                <View style={styles.headerSpacer} />
            </View>

            {/* List */}
            <FlatList
                data={conversations}
                keyExtractor={(item) => item.id}
                contentContainerStyle={styles.list}
                refreshControl={
                    <RefreshControl
                        refreshing={refreshing}
                        onRefresh={onRefresh}
                        tintColor={Colors.primary}
                    />
                }
                ListEmptyComponent={
                    <View style={styles.emptyContainer}>
                        <Ionicons
                            name="chatbubbles-outline"
                            size={48}
                            color={Colors.textSecondary}
                            style={{ marginBottom: Spacing.md }}
                        />
                        <Text style={styles.emptyTitle}>{'Aucune conversation'}</Text>
                        <Text style={styles.emptySubtext}>
                            {'Vos messages apparaîtront ici après une réservation confirmée.'}
                        </Text>
                    </View>
                }
                renderItem={({ item }) => (
                    <ConversationCard
                        conversation={item}
                        onPress={() => onConversationPress(item.id, item.otherUserName)}
                    />
                )}
            />
        </View>
    );
}

// ---------------------------------------------------------------------------
// ConversationCard
// ---------------------------------------------------------------------------

function ConversationCard({
    conversation,
    onPress,
}: {
    conversation: ConversationWithMeta;
    onPress: () => void;
}) {
    const initials = conversation.otherUserName
        .split(' ')
        .map((w) => w.charAt(0).toUpperCase())
        .join('')
        .substring(0, 2);

    return (
        <TouchableOpacity
            style={styles.card}
            onPress={onPress}
            activeOpacity={0.7}
        >
            {/* Avatar */}
            <View style={styles.cardAvatar}>
                <Text style={styles.cardAvatarText}>{initials}</Text>
            </View>

            {/* Content */}
            <View style={styles.cardContent}>
                <View style={styles.cardTopRow}>
                    <Text style={styles.cardName} numberOfLines={1}>
                        {conversation.otherUserName}
                    </Text>
                    {conversation.lastMessageAt && (
                        <Text style={styles.cardTime}>
                            {formatRelativeTime(conversation.lastMessageAt)}
                        </Text>
                    )}
                </View>
                {conversation.bookingLabel ? (
                    <View style={styles.bookingBadge}>
                        <Ionicons name="tennisball-outline" size={10} color={Colors.primary} />
                        <Text style={styles.bookingBadgeText}>{conversation.bookingLabel}</Text>
                    </View>
                ) : null}
                <Text style={styles.cardLastMessage} numberOfLines={1}>
                    {conversation.lastMessage || 'Démarrer la conversation…'}
                </Text>
            </View>

            {/* Chevron */}
            <Ionicons name="chevron-forward" size={18} color={Colors.textSecondary} />
        </TouchableOpacity>
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
    headerTitle: {
        color: Colors.textPrimary,
        fontSize: FontSizes.lg,
        fontWeight: '700',
    },
    headerSpacer: { width: 40 },

    list: {
        padding: Spacing.md,
        paddingBottom: Spacing.xxl,
    },

    emptyContainer: {
        alignItems: 'center',
        paddingVertical: Spacing.xxl * 2,
        paddingHorizontal: Spacing.lg,
    },
    emptyTitle: {
        color: Colors.textPrimary,
        fontSize: FontSizes.lg,
        fontWeight: '700',
        marginBottom: Spacing.sm,
    },
    emptySubtext: {
        color: Colors.textSecondary,
        fontSize: FontSizes.sm,
        textAlign: 'center',
        lineHeight: 20,
    },

    // Card
    card: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: Colors.backgroundSecondary,
        borderRadius: BorderRadius.xl,
        padding: Spacing.md,
        marginBottom: Spacing.sm,
        borderWidth: 1,
        borderColor: Colors.border,
    },
    cardAvatar: {
        width: 48,
        height: 48,
        borderRadius: 24,
        backgroundColor: Colors.background,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1,
        borderColor: Colors.primary,
        marginRight: Spacing.md,
    },
    cardAvatarText: {
        color: Colors.primary,
        fontSize: FontSizes.md,
        fontWeight: '700',
    },
    cardContent: {
        flex: 1,
        marginRight: Spacing.sm,
    },
    cardTopRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 2,
    },
    cardName: {
        color: Colors.textPrimary,
        fontSize: FontSizes.md,
        fontWeight: '600',
        flex: 1,
        marginRight: Spacing.sm,
    },
    cardTime: {
        color: Colors.textSecondary,
        fontSize: FontSizes.xs,
    },
    bookingBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        marginBottom: 2,
    },
    bookingBadgeText: {
        color: Colors.primary,
        fontSize: FontSizes.xs - 1,
        fontWeight: '600',
    },
    cardLastMessage: {
        color: Colors.textSecondary,
        fontSize: FontSizes.sm,
    },
});
