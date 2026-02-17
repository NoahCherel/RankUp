import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    Image,
} from 'react-native';
import { Colors, Spacing, FontSizes, BorderRadius } from '../theme';
import { Ionicons, MaterialCommunityIcons, Feather } from '@expo/vector-icons';
import { UserProfile, Review } from '../types';
import { getInitials, formatRelativeTime } from '../utils/formatters';
import { auth } from '../config/firebase';
import { getReviewsForUser } from '../services/reviewService';
import { getUserProfile } from '../services/userService';
import { useResponsive } from '../utils/responsive';

interface MentorDetailScreenProps {
    mentor: UserProfile;
    onBack: () => void;
    onBooking: () => void;
}

export default function MentorDetailScreen({ mentor, onBack, onBooking }: MentorDetailScreenProps) {
    const initials = getInitials(mentor.firstName || '?', mentor.lastName || '?');
    const isSelf = auth.currentUser?.uid === mentor.id;
    const [reviews, setReviews] = useState<(Review & { reviewerName?: string })[]>([]);
    const [loadingReviews, setLoadingReviews] = useState(true);

    const { headerPaddingTop, contentStyle, isWeb, isWide } = useResponsive();

    useEffect(() => {
        loadReviews();
    }, [mentor.id]);

    const loadReviews = async () => {
        try {
            const data = await getReviewsForUser(mentor.id);
            // Enrich with reviewer names
            const enriched = await Promise.all(
                data.slice(0, 10).map(async (review) => {
                    try {
                        const profile = await getUserProfile(review.reviewerId);
                        return {
                            ...review,
                            reviewerName: profile
                                ? `${profile.firstName || ''} ${profile.lastName || ''}`.trim()
                                : 'Joueur',
                        };
                    } catch {
                        return { ...review, reviewerName: 'Joueur' };
                    }
                }),
            );
            setReviews(enriched);
        } catch (err) {
            // Reviews loading error handled silently
        } finally {
            setLoadingReviews(false);
        }
    };

    const playStyleLabel = mentor.playStyle === 'left' ? 'Gauche'
        : mentor.playStyle === 'right' ? 'Droite'
            : mentor.playStyle === 'both' ? 'Les deux' : '-';

    const renderStars = (rating: number) => {
        const full = Math.floor(rating);
        const half = rating - full >= 0.5 ? 1 : 0;
        const empty = 5 - full - half;
        return '★'.repeat(full) + (half ? '½' : '') + '☆'.repeat(empty);
    };

    return (
        <View style={styles.container}>
            {/* Header */}
            <View style={[styles.header, { paddingTop: headerPaddingTop }]}>
                <TouchableOpacity style={styles.backButton} onPress={onBack} activeOpacity={0.7}>
                    <Ionicons name="arrow-back" size={22} color={Colors.textPrimary} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>{'Profil Mentor'}</Text>
                <View style={styles.headerSpacer} />
            </View>

            <ScrollView
                contentContainerStyle={styles.content}
                showsVerticalScrollIndicator={false}
            >
                {/* Avatar + Name */}
                <View style={styles.profileCard}>
                    <View style={styles.avatarGlow}>
                        {mentor.photoURL ? (
                            <Image source={{ uri: mentor.photoURL }} style={styles.avatar} />
                        ) : (
                            <View style={styles.avatarPlaceholder}>
                                <Text style={styles.avatarInitials}>{initials}</Text>
                            </View>
                        )}
                    </View>

                    <Text style={styles.name}>
                        {mentor.firstName} {mentor.lastName}
                    </Text>

                    <View style={styles.badges}>
                        {mentor.nationality ? (
                            <View style={styles.badge}>
                                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                                    <Ionicons name="globe-outline" size={12} color={Colors.textSecondary} />
                                    <Text style={styles.badgeText}>{mentor.nationality}</Text>
                                </View>
                            </View>
                        ) : null}
                        {mentor.league ? (
                            <View style={styles.badge}>
                                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                                    <Ionicons name="location-outline" size={12} color={Colors.textSecondary} />
                                    <Text style={styles.badgeText}>{mentor.league.toUpperCase()}</Text>
                                </View>
                            </View>
                        ) : null}
                        <View style={[styles.badge, styles.mentorBadge]}>
                            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                                <Ionicons name="shield-checkmark" size={12} color={Colors.primary} />
                                <Text style={[styles.badgeText, styles.mentorBadgeText]}>{'Mentor Certifié'}</Text>
                            </View>
                        </View>
                    </View>

                    {/* Rating */}
                    <View style={styles.ratingRow}>
                        <Text style={styles.ratingStars}>
                            {renderStars(mentor.averageRating || 0)}
                        </Text>
                        <Text style={styles.ratingText}>
                            {' '}{(mentor.averageRating || 0).toFixed(1)} ({mentor.totalReviews || 0}{' avis'})
                        </Text>
                    </View>
                </View>

                {/* Price Card */}
                <View style={styles.priceCard}>
                    <View style={styles.priceHeader}>
                        <Text style={styles.priceLabel}>{'Tarif par session'}</Text>
                        <View style={styles.priceValueRow}>
                            <Text style={styles.priceValue}>{mentor.mentorPrice || 0}</Text>
                            <Text style={styles.priceCurrency}>{'€'}</Text>
                        </View>
                    </View>
                </View>

                {/* Stats */}
                <View style={styles.statsRow}>
                    <View style={styles.statCard}>
                        <Ionicons name="trophy" size={20} color={Colors.primary} style={{ marginBottom: Spacing.xs }} />
                        <Text style={styles.statValue}>
                            {mentor.ranking ? `#${mentor.ranking}` : '-'}
                        </Text>
                        <Text style={styles.statLabel}>{'Classement'}</Text>
                    </View>
                    <View style={[styles.statCard, styles.statCardCenter]}>
                        <MaterialCommunityIcons name="tennis" size={20} color={Colors.primary} style={{ marginBottom: Spacing.xs }} />
                        <Text style={styles.statValue}>{mentor.matchesPlayed || 0}</Text>
                        <Text style={styles.statLabel}>{'Matchs'}</Text>
                    </View>
                    <View style={styles.statCard}>
                        <Ionicons name="medal" size={20} color={Colors.primary} style={{ marginBottom: Spacing.xs }} />
                        <Text style={styles.statValue}>{mentor.matchesWon || 0}</Text>
                        <Text style={styles.statLabel}>{'Victoires'}</Text>
                    </View>
                </View>

                {/* Padel Info */}
                <View style={styles.section}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: Spacing.md }}>
                        <MaterialCommunityIcons name="tennis" size={18} color={Colors.textPrimary} />
                        <Text style={[styles.sectionTitle, { marginBottom: 0 }]}>{'Informations Padel'}</Text>
                    </View>
                    <InfoRow label="Ligue" value={mentor.league?.toUpperCase() || '-'} />
                    <InfoRow label="Club" value={mentor.club || '-'} />
                    <InfoRow label="Position" value={playStyleLabel} isLast />
                </View>

                {/* About / Description */}
                {mentor.mentorDescription ? (
                    <View style={styles.section}>
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: Spacing.md }}>
                            <Feather name="file-text" size={18} color={Colors.textPrimary} />
                            <Text style={[styles.sectionTitle, { marginBottom: 0 }]}>{'\u00c0 propos'}</Text>
                        </View>
                        <Text style={styles.description}>{mentor.mentorDescription}</Text>
                    </View>
                ) : null}

                {/* Reviews */}
                <View style={styles.section}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: Spacing.md }}>
                        <Ionicons name="star" size={18} color={Colors.primary} />
                        <Text style={[styles.sectionTitle, { marginBottom: 0 }]}>
                            {'Avis'} ({mentor.totalReviews || 0})
                        </Text>
                    </View>
                    {loadingReviews ? (
                        <View style={styles.comingSoon}>
                            <Text style={styles.comingSoonText}>{'Chargement des avis…'}</Text>
                        </View>
                    ) : reviews.length === 0 ? (
                        <View style={styles.comingSoon}>
                            <Text style={styles.comingSoonText}>{'Aucun avis pour le moment'}</Text>
                        </View>
                    ) : (
                        reviews.map((review, idx) => (
                            <View
                                key={review.id}
                                style={[
                                    reviewStyles.card,
                                    idx < reviews.length - 1 && { marginBottom: Spacing.sm },
                                ]}
                            >
                                <View style={reviewStyles.header}>
                                    <Text style={reviewStyles.name}>{review.reviewerName || 'Joueur'}</Text>
                                    <Text style={reviewStyles.date}>
                                        {formatRelativeTime(new Date(review.createdAt))}
                                    </Text>
                                </View>
                                <Text style={reviewStyles.stars}>
                                    {'★'.repeat(review.rating)}{'☆'.repeat(5 - review.rating)}
                                </Text>
                                {review.comment ? (
                                    <Text style={reviewStyles.comment}>{review.comment}</Text>
                                ) : null}
                            </View>
                        ))
                    )}
                </View>

                {/* CTA */}
                {isSelf ? (
                    <View style={[styles.ctaButton, { backgroundColor: Colors.backgroundSecondary, borderWidth: 1, borderColor: Colors.border }]}>
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                            <Ionicons name="person" size={18} color={Colors.textSecondary} />
                            <Text style={[styles.ctaText, { color: Colors.textSecondary }]}>{'C\'est votre profil'}</Text>
                        </View>
                    </View>
                ) : (
                    <TouchableOpacity
                        style={styles.ctaButton}
                        activeOpacity={0.8}
                        onPress={onBooking}
                    >
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                            <Ionicons name="calendar" size={18} color={Colors.background} />
                            <Text style={styles.ctaText}>{'Réserver une session'}</Text>
                        </View>
                        <Text style={styles.ctaSubtext}>{`${mentor.mentorPrice || 0}€ · Paiement sécurisé`}</Text>
                    </TouchableOpacity>
                )}

                <View style={{ height: Spacing.xxl }} />
            </ScrollView>
        </View>
    );
}

function InfoRow({ label, value, isLast }: { label: string; value: string; isLast?: boolean }) {
    return (
        <View style={[infoStyles.row, isLast && infoStyles.rowLast]}>
            <Text style={infoStyles.label}>{label}</Text>
            <Text style={infoStyles.value}>{value}</Text>
        </View>
    );
}

const infoStyles = StyleSheet.create({
    row: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: Spacing.sm + 2,
        borderBottomWidth: 1,
        borderBottomColor: Colors.border,
    },
    rowLast: {
        borderBottomWidth: 0,
    },
    label: {
        color: Colors.textSecondary,
        fontSize: FontSizes.sm,
    },
    value: {
        color: Colors.textPrimary,
        fontSize: FontSizes.sm,
        fontWeight: '600',
    },
});

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
    headerSpacer: {
        width: 40,
    },
    content: {
        padding: Spacing.lg,
    },
    // Profile Card
    profileCard: {
        alignItems: 'center',
        marginBottom: Spacing.lg,
        paddingVertical: Spacing.md,
    },
    avatarGlow: {
        width: 120,
        height: 120,
        borderRadius: 60,
        borderWidth: 3,
        borderColor: Colors.primary,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: Spacing.md,
    },
    avatar: {
        width: 112,
        height: 112,
        borderRadius: 56,
    },
    avatarPlaceholder: {
        width: 112,
        height: 112,
        borderRadius: 56,
        backgroundColor: Colors.backgroundSecondary,
        alignItems: 'center',
        justifyContent: 'center',
    },
    avatarInitials: {
        color: Colors.primary,
        fontSize: 36,
        fontWeight: '800',
    },
    name: {
        color: Colors.textPrimary,
        fontSize: FontSizes.xxl,
        fontWeight: '800',
        marginBottom: Spacing.sm,
    },
    badges: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'center',
        gap: Spacing.sm,
        marginBottom: Spacing.sm,
    },
    badge: {
        backgroundColor: Colors.backgroundSecondary,
        paddingHorizontal: Spacing.md,
        paddingVertical: Spacing.xs + 2,
        borderRadius: BorderRadius.full,
        borderWidth: 1,
        borderColor: Colors.border,
    },
    mentorBadge: {
        backgroundColor: '#EAB30815',
        borderColor: Colors.primary,
    },
    badgeText: {
        color: Colors.textSecondary,
        fontSize: FontSizes.xs,
        fontWeight: '500',
    },
    mentorBadgeText: {
        color: Colors.primary,
        fontWeight: '700',
    },
    ratingRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    ratingStars: {
        color: Colors.primary,
        fontSize: FontSizes.md,
    },
    ratingText: {
        color: Colors.textSecondary,
        fontSize: FontSizes.sm,
    },
    // Price Card
    priceCard: {
        backgroundColor: '#EAB30810',
        borderRadius: BorderRadius.xl,
        padding: Spacing.lg,
        borderWidth: 2,
        borderColor: Colors.primary,
        marginBottom: Spacing.lg,
        alignItems: 'center',
    },
    priceHeader: {
        alignItems: 'center',
    },
    priceLabel: {
        color: Colors.textSecondary,
        fontSize: FontSizes.sm,
        marginBottom: Spacing.xs,
    },
    priceValueRow: {
        flexDirection: 'row',
        alignItems: 'flex-end',
    },
    priceValue: {
        color: Colors.primary,
        fontSize: 48,
        fontWeight: '900',
        lineHeight: 52,
    },
    priceCurrency: {
        color: Colors.primary,
        fontSize: FontSizes.xl,
        fontWeight: '700',
        marginBottom: 8,
        marginLeft: 2,
    },
    // Stats
    statsRow: {
        flexDirection: 'row',
        gap: Spacing.sm,
        marginBottom: Spacing.lg,
    },
    statCard: {
        flex: 1,
        backgroundColor: Colors.backgroundSecondary,
        borderRadius: BorderRadius.xl,
        padding: Spacing.md,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: Colors.border,
    },
    statCardCenter: {
        borderColor: Colors.primary,
        backgroundColor: '#EAB30810',
    },
    statValue: {
        color: Colors.textPrimary,
        fontSize: FontSizes.xl,
        fontWeight: '800',
    },
    statLabel: {
        color: Colors.textSecondary,
        fontSize: FontSizes.xs,
        marginTop: 2,
    },
    // Sections
    section: {
        backgroundColor: Colors.backgroundSecondary,
        borderRadius: BorderRadius.xl,
        padding: Spacing.lg,
        marginBottom: Spacing.md,
        borderWidth: 1,
        borderColor: Colors.border,
    },
    sectionTitle: {
        color: Colors.textPrimary,
        fontSize: FontSizes.md,
        fontWeight: '700',
        marginBottom: Spacing.md,
    },
    description: {
        color: Colors.textSecondary,
        fontSize: FontSizes.sm,
        lineHeight: 22,
    },
    comingSoon: {
        backgroundColor: Colors.background,
        borderRadius: BorderRadius.lg,
        padding: Spacing.lg,
        alignItems: 'center',
    },
    comingSoonText: {
        color: Colors.textSecondary,
        fontSize: FontSizes.sm,
        fontStyle: 'italic',
    },
    // CTA
    ctaButton: {
        backgroundColor: Colors.primary,
        borderRadius: BorderRadius.xl,
        paddingVertical: Spacing.lg,
        alignItems: 'center',
        marginTop: Spacing.sm,
        opacity: 0.7,
    },
    ctaText: {
        color: Colors.background,
        fontSize: FontSizes.lg,
        fontWeight: '800',
    },
    ctaSubtext: {
        color: Colors.background,
        fontSize: FontSizes.xs,
        marginTop: 2,
        opacity: 0.7,
    },
});

const reviewStyles = StyleSheet.create({
    card: {
        backgroundColor: Colors.background,
        borderRadius: BorderRadius.lg,
        padding: Spacing.md,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 4,
    },
    name: {
        color: Colors.textPrimary,
        fontSize: FontSizes.sm,
        fontWeight: '600',
    },
    date: {
        color: Colors.textSecondary,
        fontSize: FontSizes.xs,
    },
    stars: {
        color: Colors.primary,
        fontSize: FontSizes.sm,
        marginBottom: 4,
    },
    comment: {
        color: Colors.textSecondary,
        fontSize: FontSizes.sm,
        lineHeight: 20,
    },
});
