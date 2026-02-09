import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    Image,
    RefreshControl,
} from 'react-native';
import { signOut } from 'firebase/auth';
import { auth } from '../config/firebase';
import { getUserProfile } from '../services/userService';
import { UserProfile } from '../types';
import { Colors, Spacing, FontSizes, BorderRadius } from '../theme';
import { LoadingSpinner, Button } from '../components/ui';
import { getInitials } from '../utils/formatters';

interface MyProfileScreenProps {
    onEditProfile: () => void;
    onBack: () => void;
    onProfileNotFound?: () => void;
}

export default function MyProfileScreen({ onEditProfile, onBack, onProfileNotFound }: MyProfileScreenProps) {
    const [profile, setProfile] = useState<UserProfile | null>(null);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    useEffect(() => {
        loadProfile();
    }, []);

    const loadProfile = async () => {
        const userId = auth.currentUser?.uid;
        if (!userId) {
            setLoading(false);
            return;
        }

        try {
            const data = await getUserProfile(userId);
            if (!data && onProfileNotFound) {
                onProfileNotFound();
                return;
            }
            setProfile(data);
        } catch (err) {
            console.error('[Profile] Load error:', err);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    const handleLogout = async () => {
        try {
            await signOut(auth);
        } catch (err) {
            console.error('Logout error:', err);
        }
    };

    const onRefresh = () => {
        setRefreshing(true);
        loadProfile();
    };

    if (loading) {
        return <LoadingSpinner fullScreen message="Chargement du profil..." />;
    }

    if (!profile) {
        return (
            <View style={styles.emptyContainer}>
                <TouchableOpacity style={styles.backButtonAbsolute} onPress={onBack}>
                    <Text style={styles.backArrow}>{'←'}</Text>
                </TouchableOpacity>
                <Text style={styles.emptyEmoji}>{'😕'}</Text>
                <Text style={styles.emptyTitle}>{'Profil introuvable'}</Text>
                <Text style={styles.emptyText}>
                    {"Ton profil n'a pas été trouvé. Complète ton inscription."}
                </Text>
                <Button
                    title="Compléter mon profil"
                    onPress={() => onProfileNotFound?.()}
                    style={{ marginTop: Spacing.lg }}
                />
                <TouchableOpacity onPress={handleLogout} style={styles.logoutLink}>
                    <Text style={styles.logoutLinkText}>{'Se déconnecter'}</Text>
                </TouchableOpacity>
            </View>
        );
    }

    const initials = getInitials(profile.firstName || '?', profile.lastName || '?');

    const playStyleLabel = profile.playStyle === 'left' ? '⬅️ Gauche'
        : profile.playStyle === 'right' ? '➡️ Droite'
            : profile.playStyle === 'both' ? '↔️ Les deux' : '-';

    return (
        <View style={styles.container}>
            {/* Fixed Header with Back Arrow */}
            <View style={styles.header}>
                <TouchableOpacity style={styles.backButton} onPress={onBack} activeOpacity={0.7}>
                    <Text style={styles.backArrow}>{'←'}</Text>
                </TouchableOpacity>
                <Text style={styles.headerTitle}>{'Mon Profil'}</Text>
                <TouchableOpacity style={styles.editBtn} onPress={onEditProfile} activeOpacity={0.7}>
                    <Text style={styles.editBtnText}>{'✏️'}</Text>
                </TouchableOpacity>
            </View>

            <ScrollView
                contentContainerStyle={styles.content}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Colors.primary} />
                }
                showsVerticalScrollIndicator={false}
            >
                {/* Profile Card */}
                <View style={styles.profileCard}>
                    <View style={styles.avatarGlow}>
                        {profile.photoURL ? (
                            <Image source={{ uri: profile.photoURL }} style={styles.avatar} />
                        ) : (
                            <View style={styles.avatarPlaceholder}>
                                <Text style={styles.avatarInitials}>{initials}</Text>
                            </View>
                        )}
                    </View>

                    <Text style={styles.name}>
                        {profile.firstName} {profile.lastName}
                    </Text>

                    <View style={styles.badges}>
                        {profile.nationality ? (
                            <View style={styles.badge}>
                                <Text style={styles.badgeText}>{'🌍 '}{profile.nationality}</Text>
                            </View>
                        ) : null}
                        {profile.league ? (
                            <View style={styles.badge}>
                                <Text style={styles.badgeText}>{'📍 '}{profile.league.toUpperCase()}</Text>
                            </View>
                        ) : null}
                        {profile.isMentor ? (
                            <View style={[styles.badge, styles.mentorBadge]}>
                                <Text style={[styles.badgeText, styles.mentorBadgeText]}>
                                    {'🎯 Mentor'}
                                </Text>
                            </View>
                        ) : null}
                    </View>
                </View>

                {/* Stats Cards */}
                <View style={styles.statsRow}>
                    <View style={styles.statCard}>
                        <Text style={styles.statIcon}>{'🏆'}</Text>
                        <Text style={styles.statValue}>
                            {profile.ranking ? `#${profile.ranking}` : '-'}
                        </Text>
                        <Text style={styles.statLabel}>{'Classement'}</Text>
                    </View>
                    <View style={[styles.statCard, styles.statCardCenter]}>
                        <Text style={styles.statIcon}>{'🎾'}</Text>
                        <Text style={styles.statValue}>{profile.matchesPlayed || 0}</Text>
                        <Text style={styles.statLabel}>{'Matchs'}</Text>
                    </View>
                    <View style={styles.statCard}>
                        <Text style={styles.statIcon}>{'⭐'}</Text>
                        <Text style={styles.statValue}>
                            {profile.averageRating ? profile.averageRating.toFixed(1) : '-'}
                        </Text>
                        <Text style={styles.statLabel}>{'Note'}</Text>
                    </View>
                </View>

                {/* Padel Info Section */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>{'🎾 Padel'}</Text>
                    <InfoRow label="Ligue" value={profile.league?.toUpperCase() || '-'} />
                    <InfoRow label="Club" value={profile.club || '-'} />
                    <InfoRow label="Position" value={playStyleLabel} isLast />
                </View>

                {/* Mentor Info */}
                {profile.isMentor ? (
                    <View style={[styles.section, styles.mentorSection]}>
                        <Text style={styles.sectionTitle}>{'🎯 Mode Mentor'}</Text>
                        <InfoRow
                            label="Tarif / session"
                            value={`${profile.mentorPrice || 0}€`}
                            valueStyle={styles.priceValue}
                        />
                        {profile.mentorDescription ? (
                            <Text style={styles.description}>{profile.mentorDescription}</Text>
                        ) : null}
                        <View style={styles.mentorStats}>
                            <View style={styles.mentorStatItem}>
                                <Text style={styles.mentorStatValue}>{profile.totalReviews || 0}</Text>
                                <Text style={styles.mentorStatLabel}>{'avis'}</Text>
                            </View>
                            <View style={styles.mentorStatDivider} />
                            <View style={styles.mentorStatItem}>
                                <Text style={styles.mentorStatValue}>{profile.matchesWon || 0}</Text>
                                <Text style={styles.mentorStatLabel}>{'sessions'}</Text>
                            </View>
                        </View>
                    </View>
                ) : null}

                {/* Edit Profile Button */}
                <TouchableOpacity style={styles.editProfileButton} onPress={onEditProfile} activeOpacity={0.8}>
                    <Text style={styles.editProfileText}>{'✏️ Modifier mon profil'}</Text>
                </TouchableOpacity>

                {/* Logout */}
                <TouchableOpacity style={styles.logoutButton} onPress={handleLogout} activeOpacity={0.7}>
                    <Text style={styles.logoutText}>{'Se déconnecter'}</Text>
                </TouchableOpacity>
            </ScrollView>
        </View>
    );
}

// Reusable info row component
function InfoRow({ label, value, valueStyle, isLast }: { label: string; value: string; valueStyle?: any; isLast?: boolean }) {
    return (
        <View style={[styles.infoRow, isLast && styles.infoRowLast]}>
            <Text style={styles.infoLabel}>{label}</Text>
            <Text style={[styles.infoValue, valueStyle]}>{value}</Text>
        </View>
    );
}

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
    backButtonAbsolute: {
        position: 'absolute',
        top: Spacing.xxl + 8,
        left: Spacing.lg,
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: Colors.backgroundSecondary,
        alignItems: 'center',
        justifyContent: 'center',
    },
    backArrow: {
        color: Colors.textPrimary,
        fontSize: FontSizes.xl,
        fontWeight: '600',
    },
    headerTitle: {
        color: Colors.textPrimary,
        fontSize: FontSizes.lg,
        fontWeight: '700',
    },
    editBtn: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: Colors.backgroundSecondary,
        alignItems: 'center',
        justifyContent: 'center',
    },
    editBtnText: {
        fontSize: FontSizes.md,
    },
    content: {
        padding: Spacing.lg,
        paddingBottom: Spacing.xxl,
    },
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: Colors.background,
        padding: Spacing.xl,
    },
    emptyEmoji: {
        fontSize: 64,
        marginBottom: Spacing.md,
    },
    emptyTitle: {
        color: Colors.textPrimary,
        fontSize: FontSizes.xl,
        fontWeight: 'bold',
        marginBottom: Spacing.sm,
    },
    emptyText: {
        color: Colors.textSecondary,
        fontSize: FontSizes.md,
        textAlign: 'center',
    },
    logoutLink: {
        marginTop: Spacing.xl,
    },
    logoutLinkText: {
        color: Colors.error,
        fontSize: FontSizes.sm,
    },
    // Profile Card
    profileCard: {
        alignItems: 'center',
        marginBottom: Spacing.lg,
        paddingVertical: Spacing.lg,
    },
    avatarGlow: {
        width: 108,
        height: 108,
        borderRadius: 54,
        borderWidth: 3,
        borderColor: Colors.primary,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: Spacing.md,
    },
    avatar: {
        width: 100,
        height: 100,
        borderRadius: 50,
    },
    avatarPlaceholder: {
        width: 100,
        height: 100,
        borderRadius: 50,
        backgroundColor: Colors.backgroundSecondary,
        alignItems: 'center',
        justifyContent: 'center',
    },
    avatarInitials: {
        color: Colors.primary,
        fontSize: FontSizes.xxl,
        fontWeight: '800',
    },
    name: {
        color: Colors.textPrimary,
        fontSize: FontSizes.xl + 4,
        fontWeight: '800',
        marginBottom: Spacing.sm,
        letterSpacing: 0.3,
    },
    badges: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'center',
        gap: Spacing.sm,
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
    statIcon: {
        fontSize: 20,
        marginBottom: Spacing.xs,
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
    mentorSection: {
        borderColor: Colors.primary,
        backgroundColor: '#EAB30808',
    },
    sectionTitle: {
        color: Colors.textPrimary,
        fontSize: FontSizes.md,
        fontWeight: '700',
        marginBottom: Spacing.md,
    },
    infoRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: Spacing.sm + 2,
        borderBottomWidth: 1,
        borderBottomColor: Colors.border,
    },
    infoRowLast: {
        borderBottomWidth: 0,
    },
    infoLabel: {
        color: Colors.textSecondary,
        fontSize: FontSizes.sm,
    },
    infoValue: {
        color: Colors.textPrimary,
        fontSize: FontSizes.sm,
        fontWeight: '600',
    },
    priceValue: {
        color: Colors.primary,
        fontWeight: '800',
        fontSize: FontSizes.md,
    },
    description: {
        color: Colors.textSecondary,
        fontSize: FontSizes.sm,
        lineHeight: 22,
        marginTop: Spacing.md,
        fontStyle: 'italic',
    },
    mentorStats: {
        flexDirection: 'row',
        marginTop: Spacing.lg,
        justifyContent: 'center',
        gap: Spacing.xl,
    },
    mentorStatItem: {
        alignItems: 'center',
    },
    mentorStatDivider: {
        width: 1,
        backgroundColor: Colors.border,
    },
    mentorStatValue: {
        color: Colors.primary,
        fontSize: FontSizes.xl,
        fontWeight: '800',
    },
    mentorStatLabel: {
        color: Colors.textSecondary,
        fontSize: FontSizes.xs,
        marginTop: 2,
    },
    // Buttons
    editProfileButton: {
        borderWidth: 2,
        borderColor: Colors.primary,
        borderRadius: BorderRadius.xl,
        paddingVertical: Spacing.md,
        alignItems: 'center',
        marginTop: Spacing.md,
        marginBottom: Spacing.sm,
    },
    editProfileText: {
        color: Colors.primary,
        fontSize: FontSizes.md,
        fontWeight: '700',
    },
    logoutButton: {
        paddingVertical: Spacing.md,
        alignItems: 'center',
        marginBottom: Spacing.lg,
    },
    logoutText: {
        color: Colors.error,
        fontSize: FontSizes.sm,
        fontWeight: '500',
    },
});
