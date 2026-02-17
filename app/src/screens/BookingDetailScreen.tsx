/**
 * BookingDetailScreen — Full details for a single booking.
 *
 * Accessible by tapping a booking card from either BookingsListScreen
 * or MentorBookingsScreen.
 */
import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    Alert,
} from 'react-native';
import { Colors, Spacing, FontSizes, BorderRadius } from '../theme';
import { Ionicons, MaterialCommunityIcons, Feather } from '@expo/vector-icons';
import { Booking, BookingStatus } from '../types';
import { formatDate, formatTime, formatPrice } from '../utils/formatters';
import { cancelBooking, acceptBooking, rejectBooking, completeBooking } from '../services/bookingService';
import { getOrCreateConversation } from '../services/messagingService';
import { createReview, getReviewForBooking } from '../services/reviewService';
import { getUserProfile } from '../services/userService';
import { auth } from '../config/firebase';
import ReviewModal from '../components/booking/ReviewModal';
import { useResponsive } from '../utils/responsive';

interface BookingDetailScreenProps {
    booking: Booking;
    onBack: () => void;
    /** Called after any status change so the parent can refresh */
    onStatusChanged?: () => void;
    /** Open chat for this booking */
    onOpenChat?: (conversationId: string, otherUserName: string) => void;
}

const STATUS_CONFIG: Record<BookingStatus, { label: string; color: string; bg: string; iconName: keyof typeof Ionicons.glyphMap }> = {
    pending: { label: 'En attente de validation', color: '#F59E0B', bg: '#F59E0B20', iconName: 'time-outline' },
    confirmed: { label: 'Confirmée', color: '#22C55E', bg: '#22C55E20', iconName: 'checkmark-circle-outline' },
    rejected: { label: 'Refusée', color: '#EF4444', bg: '#EF444420', iconName: 'close-circle-outline' },
    completed: { label: 'Terminée', color: '#38BDF8', bg: '#38BDF820', iconName: 'trophy-outline' },
    cancelled: { label: 'Annulée', color: '#94A3B8', bg: '#94A3B820', iconName: 'ban-outline' },
};

/** Can the user cancel (48h policy)? */
function canCancelWithRefund(bookingDate: Date): boolean {
    const now = new Date();
    const diffMs = bookingDate.getTime() - now.getTime();
    const diffHours = diffMs / (1000 * 60 * 60);
    return diffHours >= 48;
}

export default function BookingDetailScreen({ booking, onBack, onStatusChanged, onOpenChat }: BookingDetailScreenProps) {
    const date = new Date(booking.date);
    const cfg = STATUS_CONFIG[booking.status];
    const sessionLabel = booking.sessionType === 'tournament' ? 'Préparation Tournoi' : 'Sparring';
    const userId = auth.currentUser?.uid;
    const isMentor = userId === booking.mentorId;
    const isClient = userId === booking.clientId;

    const canCancel = (booking.status === 'pending' || booking.status === 'confirmed');
    const refundEligible = canCancelWithRefund(date);

    const [showReviewModal, setShowReviewModal] = useState(false);
    const [hasReviewed, setHasReviewed] = useState(false);
    const [loadingChat, setLoadingChat] = useState(false);

    const { headerPaddingTop, contentStyle, isWeb, isWide } = useResponsive();

    // Check if user already reviewed this booking
    useEffect(() => {
        if (booking.status === 'completed' && userId) {
            getReviewForBooking(booking.id, userId)
                .then((review) => {
                    if (review) setHasReviewed(true);
                })
                .catch(() => {});
        }
    }, [booking.id, booking.status, userId]);

    // Determine the other party's name for review modal
    const otherPartyName = isMentor
        ? (booking.clientName || 'le joueur')
        : (booking.mentorName || 'le mentor');

    // Determine the reviewee ID
    const revieweeId = isMentor ? booking.clientId : booking.mentorId;

    const handleOpenChat = async () => {
        if (loadingChat) return;
        setLoadingChat(true);
        try {
            const conversation = await getOrCreateConversation(
                booking.id,
                [booking.clientId, booking.mentorId],
            );
            const otherName = isMentor
                ? (booking.clientName || 'Joueur')
                : (booking.mentorName || 'Mentor');
            onOpenChat?.(conversation.id, otherName);
        } catch (err) {
            Alert.alert('Erreur', 'Impossible d\'ouvrir la conversation.');
        } finally {
            setLoadingChat(false);
        }
    };

    const handleReviewSubmit = async (rating: number, comment: string) => {
        await createReview({
            bookingId: booking.id,
            revieweeId,
            rating,
            comment,
        });
        setHasReviewed(true);
        setShowReviewModal(false);
        Alert.alert('Merci !', 'Votre avis a été enregistré.');
    };

    const handleCancel = () => {
        const message = refundEligible
            ? 'Vous recevrez un remboursement complet.'
            : 'La session est dans moins de 48h, aucun remboursement ne sera effectué.';

        Alert.alert(
            'Annuler la réservation ?',
            message,
            [
                { text: 'Non', style: 'cancel' },
                {
                    text: 'Oui, annuler',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            await cancelBooking(booking.id);
                            Alert.alert('Réservation annulée');
                            onStatusChanged?.();
                            onBack();
                        } catch {
                            Alert.alert('Erreur', "Impossible d'annuler.");
                        }
                    },
                },
            ],
        );
    };

    const handleAccept = () => {
        Alert.alert(
            'Accepter la session ?',
            `Session avec ${booking.clientName || 'le joueur'} le ${formatDate(date)}.`,
            [
                { text: 'Non', style: 'cancel' },
                {
                    text: 'Accepter',
                    onPress: async () => {
                        try {
                            await acceptBooking(booking.id);
                            Alert.alert('Session confirmée');
                            onStatusChanged?.();
                            onBack();
                        } catch {
                            Alert.alert('Erreur', 'Impossible de confirmer.');
                        }
                    },
                },
            ],
        );
    };

    const handleReject = () => {
        Alert.alert(
            'Refuser la session ?',
            `Refuser la demande de ${booking.clientName || 'le joueur'} ?`,
            [
                { text: 'Non', style: 'cancel' },
                {
                    text: 'Refuser',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            await rejectBooking(booking.id);
                            Alert.alert('Session refusée');
                            onStatusChanged?.();
                            onBack();
                        } catch {
                            Alert.alert('Erreur', 'Impossible de refuser.');
                        }
                    },
                },
            ],
        );
    };

    const handleComplete = () => {
        Alert.alert(
            'Session terminée ?',
            'Confirmer que la session a bien eu lieu ?',
            [
                { text: 'Non', style: 'cancel' },
                {
                    text: 'Oui, terminée',
                    onPress: async () => {
                        try {
                            await completeBooking(booking.id);
                            Alert.alert('Session terminée. Merci !');
                            onStatusChanged?.();
                            onBack();
                        } catch {
                            Alert.alert('Erreur');
                        }
                    },
                },
            ],
        );
    };

    return (
        <View style={styles.container}>
            {/* Header */}
            <View style={[styles.header, { paddingTop: headerPaddingTop }]}>
                <TouchableOpacity onPress={onBack} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={22} color={Colors.textPrimary} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>{'Détails réservation'}</Text>
                <View style={styles.headerSpacer} />
            </View>

            <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
                {/* Status banner */}
                <View style={[styles.statusBanner, { backgroundColor: cfg.bg, borderColor: cfg.color }]}>
                    <Ionicons name={cfg.iconName} size={20} color={cfg.color} />
                    <Text style={[styles.statusLabel, { color: cfg.color }]}>{cfg.label}</Text>
                </View>

                {/* People */}
                <View style={styles.card}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: Spacing.sm }}>
                        <Ionicons name="people-outline" size={18} color={Colors.textPrimary} />
                        <Text style={[styles.cardTitle, { marginBottom: 0 }]}>{'Participants'}</Text>
                    </View>
                    <DetailRow
                        label="Client"
                        value={booking.clientName || 'Joueur'}
                        highlight={isClient}
                    />
                    <DetailRow
                        label="Mentor"
                        value={booking.mentorName || 'Mentor'}
                        highlight={isMentor}
                        isLast
                    />
                </View>

                {/* Session info */}
                <View style={styles.card}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: Spacing.sm }}>
                        <MaterialCommunityIcons name="tennis" size={18} color={Colors.textPrimary} />
                        <Text style={[styles.cardTitle, { marginBottom: 0 }]}>{'Session'}</Text>
                    </View>
                    <DetailRow label="Type" value={sessionLabel} />
                    <DetailRow label="Date" value={formatDate(date)} />
                    <DetailRow label="Heure" value={formatTime(date)} />
                    <DetailRow label="Lieu" value={booking.location} isLast />
                </View>

                {/* Payment */}
                <View style={styles.card}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: Spacing.sm }}>
                        <Ionicons name="card-outline" size={18} color={Colors.textPrimary} />
                        <Text style={[styles.cardTitle, { marginBottom: 0 }]}>{'Paiement'}</Text>
                    </View>
                    <DetailRow label="Tarif session" value={formatPrice(booking.price)} />
                    {booking.appFee ? (
                        <DetailRow label="Frais de service" value={formatPrice(booking.appFee)} />
                    ) : null}
                    <DetailRow
                        label="Total payé"
                        value={formatPrice(booking.price)}
                        bold
                    />
                    <DetailRow
                        label="Statut paiement"
                        value={booking.stripePaymentIntentId ? 'Payé' : 'Non payé'}
                        isLast
                    />
                </View>

                {/* Cancellation policy */}
                <View style={styles.policyCard}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: Spacing.sm }}>
                        <Ionicons name="document-text-outline" size={18} color={Colors.textPrimary} />
                        <Text style={[styles.policyTitle, { marginBottom: 0 }]}>{'Politique d\'annulation'}</Text>
                    </View>
                    <Text style={styles.policyText}>
                        {'Annulation gratuite jusqu\'à 48h avant la session. '
                            + 'Passé ce délai, aucun remboursement ne sera effectué.'}
                    </Text>
                    {canCancel && (
                        <View style={[styles.policyBadge, { backgroundColor: refundEligible ? '#22C55E20' : '#EF444420' }]}>
                            <Text style={[styles.policyBadgeText, { color: refundEligible ? '#22C55E' : '#EF4444' }]}>
                                {refundEligible ? 'Annulation gratuite possible' : 'Délai de 48h dépassé'}
                            </Text>
                        </View>
                    )}
                </View>

                {/* Actions */}
                <View style={styles.actionsSection}>
                    {/* Chat — available for confirmed or completed bookings */}
                    {(booking.status === 'confirmed' || booking.status === 'completed') && onOpenChat && (
                        <TouchableOpacity style={styles.chatBtn} onPress={handleOpenChat} disabled={loadingChat}>
                            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                                <Ionicons name="chatbubbles" size={18} color={Colors.background} />
                                <Text style={styles.chatBtnText}>
                                    {loadingChat ? 'Ouverture…' : 'Messagerie'}
                                </Text>
                            </View>
                        </TouchableOpacity>
                    )}

                    {/* Review — available for completed bookings, if not already reviewed */}
                    {booking.status === 'completed' && !hasReviewed && (
                        <TouchableOpacity style={styles.reviewBtn} onPress={() => setShowReviewModal(true)}>
                            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                                <Ionicons name="star" size={18} color={Colors.primary} />
                                <Text style={styles.reviewBtnText}>{'Laisser un avis'}</Text>
                            </View>
                        </TouchableOpacity>
                    )}
                    {booking.status === 'completed' && hasReviewed && (
                        <View style={styles.reviewedBadge}>
                            <Ionicons name="checkmark-circle" size={18} color={Colors.success} />
                            <Text style={styles.reviewedBadgeText}>{'Avis envoyé'}</Text>
                        </View>
                    )}

                    {/* Mentor actions */}
                    {isMentor && booking.status === 'pending' && (
                        <View style={styles.mentorActions}>
                            <TouchableOpacity style={styles.rejectBtn} onPress={handleReject}>
                                <Text style={styles.rejectBtnText}>{'Refuser'}</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={styles.acceptBtn} onPress={handleAccept}>
                                <Text style={styles.acceptBtnText}>{'Accepter'}</Text>
                            </TouchableOpacity>
                        </View>
                    )}
                    {isMentor && booking.status === 'confirmed' && date < new Date() && (
                        <TouchableOpacity style={styles.completeBtn} onPress={handleComplete}>
                            <Text style={styles.completeBtnText}>{'Marquer comme terminée'}</Text>
                        </TouchableOpacity>
                    )}

                    {/* Cancel (both parties) */}
                    {canCancel && (
                        <TouchableOpacity style={styles.cancelBtn} onPress={handleCancel}>
                            <Text style={styles.cancelBtnText}>{'Annuler la réservation'}</Text>
                        </TouchableOpacity>
                    )}
                </View>

                <View style={{ height: Spacing.xxl }} />
            </ScrollView>

            {/* Review Modal */}
            <ReviewModal
                visible={showReviewModal}
                mentorName={otherPartyName}
                onSubmit={handleReviewSubmit}
                onClose={() => setShowReviewModal(false)}
            />
        </View>
    );
}

// ---------------------------------------------------------------------------
// DetailRow
// ---------------------------------------------------------------------------

function DetailRow({
    label,
    value,
    isLast,
    bold,
    highlight,
}: {
    label: string;
    value: string;
    isLast?: boolean;
    bold?: boolean;
    highlight?: boolean;
}) {
    return (
        <View style={[detailStyles.row, isLast && detailStyles.rowLast]}>
            <Text style={detailStyles.label}>{label}</Text>
            <Text
                style={[
                    detailStyles.value,
                    bold && detailStyles.valueBold,
                    highlight && detailStyles.valueHighlight,
                ]}
            >
                {value}
                {highlight ? ' (vous)' : ''}
            </Text>
        </View>
    );
}

const detailStyles = StyleSheet.create({
    row: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: Spacing.sm + 2,
        borderBottomWidth: 1,
        borderBottomColor: Colors.border,
    },
    rowLast: { borderBottomWidth: 0 },
    label: { color: Colors.textSecondary, fontSize: FontSizes.sm },
    value: { color: Colors.textPrimary, fontSize: FontSizes.sm, fontWeight: '600' },
    valueBold: { color: Colors.primary, fontSize: FontSizes.md, fontWeight: '800' },
    valueHighlight: { color: Colors.secondary },
});

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
        width: 40, height: 40, borderRadius: 20,
        backgroundColor: Colors.backgroundSecondary,
        alignItems: 'center', justifyContent: 'center',
    },
    headerTitle: { color: Colors.textPrimary, fontSize: FontSizes.lg, fontWeight: '700' },
    headerSpacer: { width: 40 },

    content: {
        padding: Spacing.lg,
        paddingBottom: Spacing.xxl,
    },

    statusBanner: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: Spacing.md,
        borderRadius: BorderRadius.xl,
        borderWidth: 1,
        marginBottom: Spacing.lg,
        gap: Spacing.sm,
    },
    statusLabel: { fontSize: FontSizes.md, fontWeight: '700' },

    card: {
        backgroundColor: Colors.backgroundSecondary,
        borderRadius: BorderRadius.xl,
        padding: Spacing.lg,
        marginBottom: Spacing.md,
        borderWidth: 1,
        borderColor: Colors.border,
    },
    cardTitle: {
        color: Colors.textPrimary,
        fontSize: FontSizes.md,
        fontWeight: '700',
        marginBottom: Spacing.sm,
    },

    policyCard: {
        backgroundColor: Colors.backgroundSecondary,
        borderRadius: BorderRadius.xl,
        padding: Spacing.lg,
        marginBottom: Spacing.lg,
        borderWidth: 1,
        borderColor: Colors.border,
    },
    policyTitle: {
        color: Colors.textPrimary,
        fontSize: FontSizes.md,
        fontWeight: '700',
        marginBottom: Spacing.sm,
    },
    policyText: {
        color: Colors.textSecondary,
        fontSize: FontSizes.sm,
        lineHeight: 20,
    },
    policyBadge: {
        marginTop: Spacing.md,
        paddingVertical: Spacing.sm,
        paddingHorizontal: Spacing.md,
        borderRadius: BorderRadius.lg,
        alignSelf: 'flex-start',
    },
    policyBadgeText: {
        fontSize: FontSizes.xs,
        fontWeight: '700',
    },

    actionsSection: {
        gap: Spacing.sm,
    },
    mentorActions: {
        flexDirection: 'row',
        gap: Spacing.sm,
    },
    rejectBtn: {
        flex: 1,
        paddingVertical: Spacing.md,
        borderRadius: BorderRadius.lg,
        borderWidth: 1,
        borderColor: Colors.error,
        alignItems: 'center',
    },
    rejectBtnText: { color: Colors.error, fontSize: FontSizes.sm, fontWeight: '600' },
    acceptBtn: {
        flex: 2,
        paddingVertical: Spacing.md,
        borderRadius: BorderRadius.lg,
        backgroundColor: '#22C55E',
        alignItems: 'center',
    },
    acceptBtnText: { color: '#FFFFFF', fontSize: FontSizes.sm, fontWeight: '700' },
    completeBtn: {
        paddingVertical: Spacing.md,
        borderRadius: BorderRadius.lg,
        backgroundColor: Colors.secondary,
        alignItems: 'center',
    },
    completeBtnText: { color: '#FFFFFF', fontSize: FontSizes.sm, fontWeight: '700' },
    cancelBtn: {
        paddingVertical: Spacing.md,
        borderRadius: BorderRadius.lg,
        borderWidth: 1,
        borderColor: Colors.error,
        alignItems: 'center',
    },
    cancelBtnText: { color: Colors.error, fontSize: FontSizes.sm, fontWeight: '600' },
    chatBtn: {
        paddingVertical: Spacing.md,
        borderRadius: BorderRadius.lg,
        backgroundColor: Colors.secondary,
        alignItems: 'center',
    },
    chatBtnText: { color: Colors.background, fontSize: FontSizes.sm, fontWeight: '700' },
    reviewBtn: {
        paddingVertical: Spacing.md,
        borderRadius: BorderRadius.lg,
        borderWidth: 1,
        borderColor: Colors.primary,
        backgroundColor: '#EAB30815',
        alignItems: 'center',
    },
    reviewBtnText: { color: Colors.primary, fontSize: FontSizes.sm, fontWeight: '700' },
    reviewedBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        paddingVertical: Spacing.md,
        borderRadius: BorderRadius.lg,
        backgroundColor: '#22C55E15',
        borderWidth: 1,
        borderColor: '#22C55E40',
    },
    reviewedBadgeText: { color: Colors.success, fontSize: FontSizes.sm, fontWeight: '600' },
});
