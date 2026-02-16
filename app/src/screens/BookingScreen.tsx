/**
 * BookingScreen — Booking request form with payment.
 *
 * Flow: pick date/time → pick location → pay via Stripe → booking created.
 * Policy: pay upfront, free cancel up to 48h before session.
 */
import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    Alert,
    KeyboardAvoidingView,
    Platform,
} from 'react-native';
import { Ionicons, MaterialCommunityIcons, Feather } from '@expo/vector-icons';
import { Colors, Spacing, FontSizes, BorderRadius } from '../theme';
import { UserProfile } from '../types';
import { createBooking } from '../services/bookingService';
import { handlePayment } from '../services/paymentService';
import { formatPrice } from '../utils/formatters';
import { auth } from '../config/firebase';
import DateTimePicker from '../components/ui/DateTimePicker';
import CourtSelector from '../components/booking/CourtSelector';
import PaymentModal from '../components/payment/PaymentModal';
import { useResponsive } from '../utils/responsive';

interface BookingScreenProps {
    mentor: UserProfile;
    onBack: () => void;
    onBooked: () => void;
}

type SessionType = 'sparring' | 'tournament';

export default function BookingScreen({ mentor, onBack, onBooked }: BookingScreenProps) {
    const [sessionType, setSessionType] = useState<SessionType>('sparring');
    const [location, setLocation] = useState(mentor.club || '');
    const [selectedDate, setSelectedDate] = useState<Date | null>(null);
    const [saving, setSaving] = useState(false);

    // Web payment modal
    const [showPaymentModal, setShowPaymentModal] = useState(false);
    const [clientSecret, setClientSecret] = useState('');

    const { headerPaddingTop, contentStyle, isWeb, isWide } = useResponsive();

    const price = mentor.mentorPrice || 0;
    const currentUserId = auth.currentUser?.uid;
    const isSelf = currentUserId === mentor.id;

    // Minimum booking date = tomorrow
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(7, 0, 0, 0);

    const handleConfirm = async () => {
        if (isSelf) {
            Alert.alert('Impossible', 'Vous ne pouvez pas réserver une session avec vous-même.');
            return;
        }
        if (!selectedDate) {
            Alert.alert('Champ requis', 'Veuillez sélectionner une date et heure.');
            return;
        }
        if (!location.trim()) {
            Alert.alert('Champ requis', 'Veuillez choisir un lieu.');
            return;
        }
        if (selectedDate <= new Date()) {
            Alert.alert('Date invalide', 'La date doit être dans le futur.');
            return;
        }

        setSaving(true);
        try {
            if (Platform.OS === 'web') {
                // Web: get clientSecret → show PaymentModal
                const secret = await handlePayment(price, mentor.id, () => {});
                if (secret) {
                    setClientSecret(secret);
                    setShowPaymentModal(true);
                }
            } else {
                // Native: PaymentSheet flow
                await handlePayment(price, mentor.id, async () => {
                    // Payment succeeded — create booking
                    await createBookingAfterPayment();
                });
            }
        } catch (err) {
            Alert.alert('Erreur', 'Impossible de traiter le paiement.');
        } finally {
            setSaving(false);
        }
    };

    const createBookingAfterPayment = async (stripePaymentIntentId?: string) => {
        try {
            const mentorName = `${mentor.firstName ?? ''} ${mentor.lastName ?? ''}`.trim();
            await createBooking({
                mentorId: mentor.id,
                mentorName,
                sessionType,
                date: selectedDate!,
                location: location.trim(),
                price,
                stripePaymentIntentId,
            });

            Alert.alert(
                'Réservation confirmée',
                `Votre session avec ${mentor.firstName} est réservée.\nLe mentor doit encore confirmer.`,
            );
            onBooked();
        } catch (err) {
            Alert.alert('Erreur', 'Le paiement a réussi mais la réservation a échoué. Contactez le support.');
        }
    };

    return (
        <KeyboardAvoidingView
            style={styles.container}
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
            {/* Header */}
            <View style={[styles.header, { paddingTop: headerPaddingTop }]}>
                <TouchableOpacity onPress={onBack} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={22} color={Colors.textPrimary} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>{'Réserver une session'}</Text>
                <View style={styles.headerSpacer} />
            </View>

            <ScrollView
                contentContainerStyle={styles.content}
                keyboardShouldPersistTaps="handled"
            >
                {/* Self-booking warning */}
                {isSelf && (
                    <View style={styles.warningBanner}>
                        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                            <Ionicons name="warning" size={18} color="#EF4444" />
                            <Text style={styles.warningText}>
                                {'Vous ne pouvez pas réserver une session avec vous-même.'}
                            </Text>
                        </View>
                    </View>
                )}

                {/* Mentor recap */}
                <View style={styles.mentorCard}>
                    <Text style={styles.mentorCardLabel}>{'Mentor'}</Text>
                    <Text style={styles.mentorCardName}>
                        {mentor.firstName} {mentor.lastName}
                    </Text>
                    {mentor.club ? (
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: Spacing.xs }}>
                            <Ionicons name="location-outline" size={14} color={Colors.textSecondary} />
                            <Text style={styles.mentorCardClub}>{mentor.club}</Text>
                        </View>
                    ) : null}
                    {mentor.averageRating ? (
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: Spacing.xs }}>
                            <Ionicons name="star" size={14} color={Colors.warning} />
                            <Text style={styles.mentorCardRating}>
                                {mentor.averageRating.toFixed(1)} ({mentor.totalReviews || 0}{' avis'})
                            </Text>
                        </View>
                    ) : null}
                </View>

                {/* Session type */}
                <View style={styles.section}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: Spacing.sm }}>
                        <MaterialCommunityIcons name="tennis" size={18} color={Colors.textPrimary} />
                        <Text style={[styles.sectionTitle, { marginBottom: 0 }]}>{'Type de session'}</Text>
                    </View>
                    <View style={styles.toggleRow}>
                        <TouchableOpacity
                            style={[
                                styles.toggleButton,
                                sessionType === 'sparring' && styles.toggleActive,
                            ]}
                            onPress={() => setSessionType('sparring')}
                        >
                            <Text
                                style={[
                                    styles.toggleText,
                                    sessionType === 'sparring' && styles.toggleTextActive,
                                ]}
                            >
                                {'Sparring'}
                            </Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={[
                                styles.toggleButton,
                                sessionType === 'tournament' && styles.toggleActive,
                            ]}
                            onPress={() => setSessionType('tournament')}
                        >
                            <Text
                                style={[
                                    styles.toggleText,
                                    sessionType === 'tournament' && styles.toggleTextActive,
                                ]}
                            >
                                {'Prépa Tournoi'}
                            </Text>
                        </TouchableOpacity>
                    </View>
                </View>

                {/* Date & Time */}
                <View style={styles.section}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: Spacing.sm }}>
                        <Ionicons name="calendar-outline" size={18} color={Colors.textPrimary} />
                        <Text style={[styles.sectionTitle, { marginBottom: 0 }]}>{'Date & Heure'}</Text>
                    </View>
                    <DateTimePicker
                        value={selectedDate}
                        onChange={setSelectedDate}
                        minimumDate={tomorrow}
                        placeholder="Choisir une date et heure"
                    />
                </View>

                {/* Location */}
                <View style={styles.section}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: Spacing.sm }}>
                        <Ionicons name="location-outline" size={18} color={Colors.textPrimary} />
                        <Text style={[styles.sectionTitle, { marginBottom: 0 }]}>{'Lieu'}</Text>
                    </View>
                    <CourtSelector
                        value={location}
                        onChange={setLocation}
                        mentorClub={mentor.club}
                        placeholder="Choisir un terrain"
                    />
                </View>

                {/* Price recap */}
                <View style={styles.priceCard}>
                    <View style={styles.priceRow}>
                        <Text style={styles.priceLabel}>{'Tarif session'}</Text>
                        <Text style={styles.priceValue}>{formatPrice(price)}</Text>
                    </View>
                    <View style={styles.priceDivider} />
                    <View style={styles.priceRow}>
                        <Text style={styles.priceLabel}>{'Total'}</Text>
                        <Text style={styles.priceTotalValue}>{formatPrice(price)}</Text>
                    </View>
                    <View style={{ flexDirection: 'row', alignItems: 'flex-start', gap: 6, marginTop: Spacing.sm }}>
                        <Feather name="shield" size={14} color={Colors.textSecondary} style={{ marginTop: 2 }} />
                        <Text style={styles.priceNote}>
                            {'Paiement sécurisé via Stripe. Annulation gratuite jusqu\'à 48h avant la session.'}
                        </Text>
                    </View>
                </View>

                {/* Confirm + Pay */}
                <TouchableOpacity
                    style={[
                        styles.confirmButton,
                        (saving || isSelf) && styles.confirmButtonDisabled,
                    ]}
                    activeOpacity={0.8}
                    disabled={saving || isSelf}
                    onPress={handleConfirm}
                >
                    <Text style={styles.confirmButtonText}>
                        {saving ? 'Traitement en cours…' : `Réserver et payer ${formatPrice(price)}`}
                    </Text>
                </TouchableOpacity>
            </ScrollView>

            {/* Web Stripe Payment Modal */}
            <PaymentModal
                visible={showPaymentModal}
                clientSecret={clientSecret}
                onSuccess={() => {
                    setShowPaymentModal(false);
                    createBookingAfterPayment(clientSecret);
                }}
                onCancel={() => {
                    setShowPaymentModal(false);
                    setSaving(false);
                }}
            />
        </KeyboardAvoidingView>
    );
}

// ---------------------------------------------------------------------------
// Styles
// ---------------------------------------------------------------------------

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.background,
    },
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
    content: {
        padding: Spacing.lg,
        paddingBottom: Spacing.xxl,
    },
    warningBanner: {
        backgroundColor: '#EF444420',
        borderRadius: BorderRadius.lg,
        padding: Spacing.md,
        marginBottom: Spacing.lg,
        borderWidth: 1,
        borderColor: '#EF4444',
    },
    warningText: {
        color: '#EF4444',
        fontSize: FontSizes.sm,
        fontWeight: '600',
        textAlign: 'center',
    },
    mentorCard: {
        backgroundColor: Colors.backgroundSecondary,
        borderRadius: BorderRadius.xl,
        padding: Spacing.lg,
        marginBottom: Spacing.lg,
        borderWidth: 1,
        borderColor: Colors.border,
    },
    mentorCardLabel: {
        color: Colors.textSecondary,
        fontSize: FontSizes.xs,
        fontWeight: '600',
        textTransform: 'uppercase',
        letterSpacing: 1,
        marginBottom: Spacing.xs,
    },
    mentorCardName: {
        color: Colors.textPrimary,
        fontSize: FontSizes.xl,
        fontWeight: '800',
    },
    mentorCardClub: {
        color: Colors.textSecondary,
        fontSize: FontSizes.sm,
    },
    mentorCardRating: {
        color: Colors.textSecondary,
        fontSize: FontSizes.sm,
    },
    section: {
        marginBottom: Spacing.lg,
    },
    sectionTitle: {
        color: Colors.textPrimary,
        fontSize: FontSizes.md,
        fontWeight: '700',
        marginBottom: Spacing.sm,
    },
    toggleRow: {
        flexDirection: 'row',
        gap: Spacing.sm,
    },
    toggleButton: {
        flex: 1,
        paddingVertical: Spacing.md,
        borderRadius: BorderRadius.lg,
        backgroundColor: Colors.backgroundSecondary,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: Colors.border,
    },
    toggleActive: {
        borderColor: Colors.primary,
        backgroundColor: '#EAB30815',
    },
    toggleText: {
        color: Colors.textSecondary,
        fontSize: FontSizes.sm,
        fontWeight: '600',
    },
    toggleTextActive: {
        color: Colors.primary,
        fontWeight: '700',
    },
    priceCard: {
        backgroundColor: Colors.backgroundSecondary,
        borderRadius: BorderRadius.xl,
        padding: Spacing.lg,
        marginBottom: Spacing.lg,
        borderWidth: 1,
        borderColor: Colors.border,
    },
    priceRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: Spacing.xs,
    },
    priceLabel: {
        color: Colors.textSecondary,
        fontSize: FontSizes.sm,
    },
    priceValue: {
        color: Colors.textPrimary,
        fontSize: FontSizes.sm,
        fontWeight: '600',
    },
    priceTotalValue: {
        color: Colors.primary,
        fontSize: FontSizes.lg,
        fontWeight: '800',
    },
    priceDivider: {
        height: 1,
        backgroundColor: Colors.border,
        marginVertical: Spacing.sm,
    },
    priceNote: {
        color: Colors.textSecondary,
        fontSize: FontSizes.xs,
        fontStyle: 'italic',
        marginTop: Spacing.sm,
        lineHeight: 18,
    },
    confirmButton: {
        backgroundColor: Colors.primary,
        borderRadius: BorderRadius.xl,
        paddingVertical: Spacing.md + 2,
        alignItems: 'center',
    },
    confirmButtonDisabled: {
        backgroundColor: Colors.border,
    },
    confirmButtonText: {
        color: Colors.background,
        fontSize: FontSizes.md,
        fontWeight: '700',
    },
});
