/**
 * BookingsListScreen — "Mes Réservations" for the client.
 *
 * Tabs: À venir | Terminés
 * Each card shows booking info + status badge + contextual action.
 */
import React, { useState, useEffect, useCallback } from 'react';
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    TouchableOpacity,
    Alert,
    RefreshControl,
} from 'react-native';
import { Colors, Spacing, FontSizes, BorderRadius } from '../theme';
import { Ionicons, MaterialCommunityIcons, Feather } from '@expo/vector-icons';
import { LoadingSpinner } from '../components';
import { Booking, BookingStatus } from '../types';
import { getMyBookings, cancelBooking } from '../services/bookingService';
import { formatDate, formatTime } from '../utils/formatters';
import { useResponsive } from '../utils/responsive';

interface BookingsListScreenProps {
    onBack: () => void;
    onBookingPress?: (booking: Booking) => void;
}

type Tab = 'upcoming' | 'past';

export default function BookingsListScreen({ onBack, onBookingPress }: BookingsListScreenProps) {
    const [tab, setTab] = useState<Tab>('upcoming');
    const [bookings, setBookings] = useState<Booking[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    const loadBookings = useCallback(async () => {
        try {
            const data = await getMyBookings();
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

    const now = new Date();
    const upcoming = bookings.filter(
        (b) => ['pending', 'confirmed'].includes(b.status) && new Date(b.date) >= now,
    );
    const past = bookings.filter(
        (b) => ['completed', 'rejected', 'cancelled'].includes(b.status) || new Date(b.date) < now,
    );
    const displayedBookings = tab === 'upcoming' ? upcoming : past;
    const { headerPaddingTop, contentStyle } = useResponsive();

    const handleCancel = (booking: Booking) => {
        Alert.alert(
            'Annuler la réservation ?',
            'Êtes-vous sûr de vouloir annuler cette session ?',
            [
                { text: 'Non', style: 'cancel' },
                {
                    text: 'Oui, annuler',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            await cancelBooking(booking.id);
                            loadBookings();
                        } catch (err) {
                            Alert.alert('Erreur', "Impossible d'annuler.");
                        }
                    },
                },
            ],
        );
    };

    if (loading) {
        return <LoadingSpinner fullScreen message="Chargement des réservations…" />;
    }

    return (
        <View style={styles.container}>
            {/* Header */}
            <View style={[styles.header, { paddingTop: headerPaddingTop }]}>
                <TouchableOpacity onPress={onBack} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={22} color={Colors.textPrimary} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>{'Mes Réservations'}</Text>
                <View style={styles.headerSpacer} />
            </View>

            {/* Tabs */}
            <View style={styles.tabs}>
                <TouchableOpacity
                    style={[styles.tab, tab === 'upcoming' && styles.tabActive]}
                    onPress={() => setTab('upcoming')}
                >
                    <Text style={[styles.tabText, tab === 'upcoming' && styles.tabTextActive]}>
                        {'À venir'} ({upcoming.length})
                    </Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={[styles.tab, tab === 'past' && styles.tabActive]}
                    onPress={() => setTab('past')}
                >
                    <Text style={[styles.tabText, tab === 'past' && styles.tabTextActive]}>
                        {'Terminés'} ({past.length})
                    </Text>
                </TouchableOpacity>
            </View>

            {/* List */}
            <FlatList
                data={displayedBookings}
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
                        <Ionicons name="calendar-outline" size={48} color={Colors.textSecondary} style={{ marginBottom: Spacing.md }} />
                        <Text style={styles.emptyText}>
                            {tab === 'upcoming'
                                ? 'Aucune réservation à venir'
                                : 'Aucune réservation passée'}
                        </Text>
                    </View>
                }
                renderItem={({ item }) => (
                    <TouchableOpacity
                        activeOpacity={0.7}
                        onPress={() => onBookingPress?.(item)}
                    >
                        <BookingCard
                            booking={item}
                            onCancel={() => handleCancel(item)}
                        />
                    </TouchableOpacity>
                )}
            />
        </View>
    );
}

// ---------------------------------------------------------------------------
// BookingCard
// ---------------------------------------------------------------------------

function BookingCard({
    booking,
    onCancel,
}: {
    booking: Booking;
    onCancel: () => void;
}) {
    const date = new Date(booking.date);
    const sessionLabel = booking.sessionType === 'tournament' ? 'Prépa Tournoi' : 'Sparring';

    return (
        <View style={cardStyles.container}>
            <View style={cardStyles.topRow}>
                <View style={{ flex: 1 }}>
                    <Text style={cardStyles.mentorName}>{booking.mentorName || 'Mentor'}</Text>
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
            {(booking.status === 'pending' || booking.status === 'confirmed') && (
                <TouchableOpacity style={cardStyles.cancelBtn} onPress={onCancel}>
                    <Text style={cardStyles.cancelBtnText}>{'Annuler'}</Text>
                </TouchableOpacity>
            )}
        </View>
    );
}

// ---------------------------------------------------------------------------
// StatusBadge
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
    mentorName: {
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
    cancelBtn: {
        marginTop: Spacing.md,
        paddingVertical: Spacing.sm,
        borderRadius: BorderRadius.lg,
        borderWidth: 1,
        borderColor: Colors.error,
        alignItems: 'center',
    },
    cancelBtnText: {
        color: Colors.error,
        fontSize: FontSizes.sm,
        fontWeight: '600',
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
