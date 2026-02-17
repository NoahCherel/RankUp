/**
 * MentorBookingsScreen — Incoming booking requests for mentors.
 *
 * Mentors can accept or reject pending bookings, and see their history.
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
import { Booking, BookingStatus } from '../types';
import {
    getMentorBookings,
    acceptBooking,
    rejectBooking,
    completeBooking,
} from '../services/bookingService';
import { formatDate, formatTime } from '../utils/formatters';
import { useResponsive } from '../utils/responsive';
import { confirmAction, showAlert } from '../utils/confirm';

interface MentorBookingsScreenProps {
    onBack: () => void;
    onBookingPress?: (booking: Booking) => void;
}

type Tab = 'pending' | 'all';

export default function MentorBookingsScreen({ onBack, onBookingPress }: MentorBookingsScreenProps) {
    const [tab, setTab] = useState<Tab>('pending');
    const [bookings, setBookings] = useState<Booking[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    const loadBookings = useCallback(async () => {
        try {
            const data = await getMentorBookings();
            setBookings(data);
        } catch (err) {
            // Error handled silently
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, []);

    useEffect(() => {
        loadBookings();
    }, [loadBookings]);

    const onRefresh = () => {
        setRefreshing(true);
        loadBookings();
    };

    const pending = bookings.filter((b) => b.status === 'pending');
    const all = bookings;
    const displayed = tab === 'pending' ? pending : all;

    const handleAccept = (booking: Booking) => {
        confirmAction(
            'Accepter la session ?',
            `Session avec ${booking.clientName || 'le joueur'} le ${formatDate(new Date(booking.date))}.`,
            'Accepter',
            async () => {
                try {
                    await acceptBooking(booking.id);
                    loadBookings();
                    showAlert('Session confirmée');
                } catch (err) {
                    console.error('Accept booking error:', err);
                    showAlert('Erreur', 'Impossible de confirmer.');
                }
            },
        );
    };

    const handleReject = (booking: Booking) => {
        confirmAction(
            'Refuser la session ?',
            `Refuser la demande de ${booking.clientName || 'le joueur'} ?`,
            'Refuser',
            async () => {
                try {
                    await rejectBooking(booking.id);
                    loadBookings();
                } catch (err) {
                    console.error('Reject booking error:', err);
                    showAlert('Erreur', 'Impossible de refuser.');
                }
            },
            true,
        );
    };

    const handleComplete = (booking: Booking) => {
        confirmAction(
            'Session terminée ?',
            'Confirmer que la session a bien eu lieu ?',
            'Oui, terminée',
            async () => {
                try {
                    await completeBooking(booking.id);
                    loadBookings();
                    showAlert('Session marquée comme terminée.');
                } catch (err) {
                    console.error('Complete booking error:', err);
                    showAlert('Erreur', 'Impossible de mettre à jour.');
                }
            },
        );
    };

    const { headerPaddingTop, contentStyle, isWeb, isWide } = useResponsive();

    if (loading) {
        return <LoadingSpinner fullScreen message="Chargement des demandes…" />;
    }

    return (
        <View style={styles.container}>
            {/* Header */}
            <View style={[styles.header, { paddingTop: headerPaddingTop }]}>
                <TouchableOpacity onPress={onBack} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={22} color={Colors.textPrimary} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>{'Demandes reçues'}</Text>
                <View style={styles.headerSpacer} />
            </View>

            {/* Tabs */}
            <View style={styles.tabs}>
                <TouchableOpacity
                    style={[styles.tab, tab === 'pending' && styles.tabActive]}
                    onPress={() => setTab('pending')}
                >
                    <Text style={[styles.tabText, tab === 'pending' && styles.tabTextActive]}>
                        {'En attente'} ({pending.length})
                    </Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={[styles.tab, tab === 'all' && styles.tabActive]}
                    onPress={() => setTab('all')}
                >
                    <Text style={[styles.tabText, tab === 'all' && styles.tabTextActive]}>
                        {'Toutes'} ({all.length})
                    </Text>
                </TouchableOpacity>
            </View>

            {/* List */}
            <FlatList
                data={displayed}
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
                        <Ionicons name="mail-open-outline" size={48} color={Colors.textSecondary} style={{ marginBottom: Spacing.md }} />
                        <Text style={styles.emptyText}>
                            {tab === 'pending'
                                ? 'Aucune demande en attente'
                                : 'Aucune réservation'}
                        </Text>
                    </View>
                }
                renderItem={({ item }) => (
                    <TouchableOpacity
                        activeOpacity={0.7}
                        onPress={() => onBookingPress?.(item)}
                    >
                        <MentorBookingCard
                            booking={item}
                            onAccept={() => handleAccept(item)}
                            onReject={() => handleReject(item)}
                            onComplete={() => handleComplete(item)}
                        />
                    </TouchableOpacity>
                )}
            />
        </View>
    );
}

// ---------------------------------------------------------------------------
// MentorBookingCard
// ---------------------------------------------------------------------------

function MentorBookingCard({
    booking,
    onAccept,
    onReject,
    onComplete,
}: {
    booking: Booking;
    onAccept: () => void;
    onReject: () => void;
    onComplete: () => void;
}) {
    const date = new Date(booking.date);
    const sessionLabel = booking.sessionType === 'tournament' ? 'Prépa Tournoi' : 'Sparring';

    return (
        <View style={cardStyles.container}>
            <View style={cardStyles.topRow}>
                <View style={{ flex: 1 }}>
                    <Text style={cardStyles.clientName}>{booking.clientName || 'Joueur'}</Text>
                    <Text style={cardStyles.sessionType}>{sessionLabel}</Text>
                </View>
                <StatusBadge status={booking.status} />
            </View>

            <View style={cardStyles.infoRow}>
                <Ionicons name="calendar-outline" size={14} color={Colors.textSecondary} style={{ marginRight: Spacing.sm }} />
                <Text style={cardStyles.infoText}>
                    {formatDate(date)} {'à '}{formatTime(date)}
                </Text>
            </View>
            <View style={cardStyles.infoRow}>
                <Ionicons name="location-outline" size={14} color={Colors.textSecondary} style={{ marginRight: Spacing.sm }} />
                <Text style={cardStyles.infoText}>{booking.location}</Text>
            </View>
            <View style={cardStyles.infoRow}>
                <Ionicons name="card-outline" size={14} color={Colors.textSecondary} style={{ marginRight: Spacing.sm }} />
                <Text style={cardStyles.infoText}>{booking.price}€</Text>
            </View>

            {/* Actions */}
            {booking.status === 'pending' && (
                <View style={cardStyles.actions}>
                    <TouchableOpacity style={cardStyles.rejectBtn} onPress={onReject}>
                        <Text style={cardStyles.rejectBtnText}>{'Refuser'}</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={cardStyles.acceptBtn} onPress={onAccept}>
                        <Text style={cardStyles.acceptBtnText}>{'Accepter'}</Text>
                    </TouchableOpacity>
                </View>
            )}
            {booking.status === 'confirmed' && new Date(booking.date) < new Date() && (
                <TouchableOpacity style={cardStyles.completeBtn} onPress={onComplete}>
                    <Text style={cardStyles.completeBtnText}>{'Marquer comme terminée'}</Text>
                </TouchableOpacity>
            )}
        </View>
    );
}

// ---------------------------------------------------------------------------
// StatusBadge (shared)
// ---------------------------------------------------------------------------

const STATUS_CONFIG: Record<BookingStatus, { label: string; color: string; bg: string }> = {
    pending: { label: 'En attente', color: '#F59E0B', bg: '#F59E0B20' },
    confirmed: { label: 'Confirmé', color: '#22C55E', bg: '#22C55E20' },
    rejected: { label: 'Refusé', color: '#EF4444', bg: '#EF444420' },
    completed: { label: 'Terminé', color: '#38BDF8', bg: '#38BDF820' },
    cancelled: { label: 'Annulé', color: '#94A3B8', bg: '#94A3B820' },
};

function StatusBadge({ status }: { status: BookingStatus }) {
    const cfg = STATUS_CONFIG[status];
    return (
        <View style={[badgeStyles.badge, { backgroundColor: cfg.bg, borderColor: cfg.color }]}>
            <Text style={[badgeStyles.text, { color: cfg.color }]}>{cfg.label}</Text>
        </View>
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
        width: 40, height: 40, borderRadius: 20,
        backgroundColor: Colors.backgroundSecondary,
        alignItems: 'center', justifyContent: 'center',
    },
    headerTitle: { color: Colors.textPrimary, fontSize: FontSizes.lg, fontWeight: '700' },
    headerSpacer: { width: 40 },
    tabs: {
        flexDirection: 'row',
        paddingHorizontal: Spacing.md,
        paddingTop: Spacing.md,
        gap: Spacing.sm,
    },
    tab: {
        flex: 1,
        paddingVertical: Spacing.sm + 2,
        borderRadius: BorderRadius.lg,
        backgroundColor: Colors.backgroundSecondary,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: Colors.border,
    },
    tabActive: {
        borderColor: Colors.primary,
        backgroundColor: '#EAB30815',
    },
    tabText: {
        color: Colors.textSecondary,
        fontSize: FontSizes.sm,
        fontWeight: '600',
    },
    tabTextActive: {
        color: Colors.primary,
        fontWeight: '700',
    },
    list: { padding: Spacing.md, paddingBottom: Spacing.xxl },
    emptyContainer: {
        alignItems: 'center',
        paddingVertical: Spacing.xxl * 2,
    },
    emptyText: {
        color: Colors.textSecondary,
        fontSize: FontSizes.md,
        fontStyle: 'italic',
    },
});

const cardStyles = StyleSheet.create({
    container: {
        backgroundColor: Colors.backgroundSecondary,
        borderRadius: BorderRadius.xl,
        padding: Spacing.lg,
        marginBottom: Spacing.md,
        borderWidth: 1,
        borderColor: Colors.border,
    },
    topRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: Spacing.md,
    },
    clientName: {
        color: Colors.textPrimary,
        fontSize: FontSizes.lg,
        fontWeight: '700',
    },
    sessionType: {
        color: Colors.textSecondary,
        fontSize: FontSizes.sm,
        marginTop: 2,
    },
    infoRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: Spacing.xs + 2,
    },
    infoText: { color: Colors.textSecondary, fontSize: FontSizes.sm },
    actions: {
        flexDirection: 'row',
        gap: Spacing.sm,
        marginTop: Spacing.md,
    },
    rejectBtn: {
        flex: 1,
        paddingVertical: Spacing.sm + 2,
        borderRadius: BorderRadius.lg,
        borderWidth: 1,
        borderColor: Colors.error,
        alignItems: 'center',
    },
    rejectBtnText: {
        color: Colors.error,
        fontSize: FontSizes.sm,
        fontWeight: '600',
    },
    acceptBtn: {
        flex: 2,
        paddingVertical: Spacing.sm + 2,
        borderRadius: BorderRadius.lg,
        backgroundColor: Colors.success,
        alignItems: 'center',
    },
    acceptBtnText: {
        color: '#FFFFFF',
        fontSize: FontSizes.sm,
        fontWeight: '700',
    },
    completeBtn: {
        marginTop: Spacing.md,
        paddingVertical: Spacing.sm + 2,
        borderRadius: BorderRadius.lg,
        backgroundColor: Colors.secondary,
        alignItems: 'center',
    },
    completeBtnText: {
        color: '#FFFFFF',
        fontSize: FontSizes.sm,
        fontWeight: '700',
    },
});

const badgeStyles = StyleSheet.create({
    badge: {
        paddingHorizontal: Spacing.md,
        paddingVertical: Spacing.xs,
        borderRadius: BorderRadius.full,
        borderWidth: 1,
    },
    text: {
        fontSize: FontSizes.xs,
        fontWeight: '700',
    },
});
