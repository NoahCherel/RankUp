import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { Colors, Spacing, FontSizes, BorderRadius } from '../../theme';
import { UserProfile } from '../../types';
import { getInitials } from '../../utils/formatters';

interface MentorCardProps {
    mentor: UserProfile;
    onPress: () => void;
}

export default function MentorCard({ mentor, onPress }: MentorCardProps) {
    const initials = getInitials(mentor.firstName || '?', mentor.lastName || '?');
    const isTopRated = (mentor.averageRating || 0) >= 4.5;

    const playStyleLabel = mentor.playStyle === 'left' ? 'Gauche'
        : mentor.playStyle === 'right' ? 'Droite'
            : mentor.playStyle === 'both' ? 'Les deux' : '';

    return (
        <TouchableOpacity
            style={[styles.card, isTopRated && styles.cardTopRated]}
            onPress={onPress}
            activeOpacity={0.85}
        >
            {/* Top Rated Badge */}
            {isTopRated && (
                <View style={styles.topBadge}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                        <Ionicons name="star" size={12} color={Colors.primary} />
                        <Text style={styles.topBadgeText}>{'Top'}</Text>
                    </View>
                </View>
            )}

            <View style={styles.row}>
                {/* Avatar */}
                <View style={[styles.avatarContainer, isTopRated && styles.avatarContainerTop]}>
                    {mentor.photoURL ? (
                        <Image source={{ uri: mentor.photoURL }} style={styles.avatar} />
                    ) : (
                        <View style={styles.avatarPlaceholder}>
                            <Text style={styles.avatarInitials}>{initials}</Text>
                        </View>
                    )}
                </View>

                {/* Info */}
                <View style={styles.info}>
                    <Text style={styles.name} numberOfLines={1}>
                        {mentor.firstName} {mentor.lastName}
                    </Text>

                    <View style={styles.metaRow}>
                        {mentor.nationality ? (
                            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                                <Ionicons name="globe-outline" size={12} color={Colors.textSecondary} />
                                <Text style={styles.metaText}>{mentor.nationality}</Text>
                            </View>
                        ) : null}
                        {mentor.league ? (
                            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                                <Ionicons name="location-outline" size={12} color={Colors.textSecondary} />
                                <Text style={styles.metaText}>{mentor.league.toUpperCase()}</Text>
                            </View>
                        ) : null}
                    </View>

                    <View style={styles.metaRow}>
                        {mentor.ranking ? (
                            <View style={styles.chip}>
                                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                                    <Ionicons name="trophy" size={12} color={Colors.primary} />
                                    <Text style={styles.chipText}>{'#'}{mentor.ranking}</Text>
                                </View>
                            </View>
                        ) : null}
                        {playStyleLabel ? (
                            <View style={styles.chip}>
                                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                                    <MaterialCommunityIcons name="tennis" size={12} color={Colors.primary} />
                                    <Text style={styles.chipText}>{playStyleLabel}</Text>
                                </View>
                            </View>
                        ) : null}
                    </View>

                    {/* Rating */}
                    <View style={styles.ratingRow}>
                        <Text style={styles.ratingStars}>
                            {renderStars(mentor.averageRating || 0)}
                        </Text>
                        <Text style={styles.ratingCount}>
                            {'('}{mentor.totalReviews || 0}{')'}
                        </Text>
                    </View>
                </View>

                {/* Price */}
                <View style={styles.priceContainer}>
                    <Text style={styles.priceValue}>
                        {mentor.mentorPrice || 0}{'€'}
                    </Text>
                    <Text style={styles.priceLabel}>{'/ session'}</Text>
                </View>
            </View>
        </TouchableOpacity>
    );
}

function renderStars(rating: number): string {
    const full = Math.floor(rating);
    const half = rating - full >= 0.5 ? 1 : 0;
    const empty = 5 - full - half;
    return '★'.repeat(full) + (half ? '½' : '') + '☆'.repeat(empty);
}

const styles = StyleSheet.create({
    card: {
        backgroundColor: Colors.backgroundSecondary,
        borderRadius: BorderRadius.xl,
        padding: Spacing.md,
        marginBottom: Spacing.sm,
        borderWidth: 1,
        borderColor: Colors.border,
        overflow: 'hidden',
    },
    cardTopRated: {
        borderColor: Colors.primary,
        backgroundColor: '#EAB30808',
    },
    topBadge: {
        position: 'absolute',
        top: 0,
        right: 0,
        backgroundColor: Colors.primary,
        paddingHorizontal: Spacing.sm,
        paddingVertical: 2,
        borderBottomLeftRadius: BorderRadius.md,
    },
    topBadgeText: {
        color: Colors.background,
        fontSize: FontSizes.xs,
        fontWeight: '700',
    },
    row: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    avatarContainer: {
        width: 60,
        height: 60,
        borderRadius: 30,
        borderWidth: 2,
        borderColor: Colors.border,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: Spacing.md,
    },
    avatarContainerTop: {
        borderColor: Colors.primary,
    },
    avatar: {
        width: 56,
        height: 56,
        borderRadius: 28,
    },
    avatarPlaceholder: {
        width: 56,
        height: 56,
        borderRadius: 28,
        backgroundColor: Colors.background,
        alignItems: 'center',
        justifyContent: 'center',
    },
    avatarInitials: {
        color: Colors.primary,
        fontSize: FontSizes.lg,
        fontWeight: '800',
    },
    info: {
        flex: 1,
    },
    name: {
        color: Colors.textPrimary,
        fontSize: FontSizes.md,
        fontWeight: '700',
        marginBottom: 2,
    },
    metaRow: {
        flexDirection: 'row',
        gap: Spacing.sm,
        marginBottom: 2,
    },
    metaText: {
        color: Colors.textSecondary,
        fontSize: FontSizes.xs,
    },
    chip: {
        backgroundColor: Colors.background,
        paddingHorizontal: Spacing.sm,
        paddingVertical: 1,
        borderRadius: BorderRadius.full,
    },
    chipText: {
        color: Colors.textSecondary,
        fontSize: FontSizes.xs - 1,
    },
    ratingRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 2,
    },
    ratingStars: {
        color: Colors.primary,
        fontSize: FontSizes.xs,
        marginRight: 4,
    },
    ratingCount: {
        color: Colors.textSecondary,
        fontSize: FontSizes.xs - 1,
    },
    priceContainer: {
        alignItems: 'flex-end',
        justifyContent: 'center',
        marginLeft: Spacing.sm,
    },
    priceValue: {
        color: Colors.primary,
        fontSize: FontSizes.xl,
        fontWeight: '800',
    },
    priceLabel: {
        color: Colors.textSecondary,
        fontSize: FontSizes.xs - 1,
    },
});
