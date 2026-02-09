import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    Image,
    Animated,
} from 'react-native';
import { Colors, Spacing, FontSizes, BorderRadius } from '../theme';
import { auth } from '../config/firebase';
import { getUserProfile } from '../services/userService';
import { UserProfile } from '../types';
import { getInitials } from '../utils/formatters';

interface HomeScreenProps {
    onNavigateProfile?: () => void;
}

export default function HomeScreen({ onNavigateProfile }: HomeScreenProps) {
    const [profile, setProfile] = useState<UserProfile | null>(null);
    const [greeting, setGreeting] = useState('');

    useEffect(() => {
        const hour = new Date().getHours();
        if (hour < 12) setGreeting('Bonjour');
        else if (hour < 18) setGreeting('Bon après-midi');
        else setGreeting('Bonsoir');

        loadProfile();
    }, []);

    const loadProfile = async () => {
        const userId = auth.currentUser?.uid;
        if (!userId) return;
        try {
            const data = await getUserProfile(userId);
            setProfile(data);
        } catch (err) {
            console.log('Home profile load:', err);
        }
    };

    const initials = profile ? getInitials(profile.firstName || '?', profile.lastName || '?') : '?';

    return (
        <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent}>
            {/* Header */}
            <View style={styles.header}>
                <View>
                    <Text style={styles.logoText}>{'⚡ RankUp'}</Text>
                </View>
                <TouchableOpacity style={styles.avatarButton} onPress={onNavigateProfile}>
                    {profile?.photoURL ? (
                        <Image source={{ uri: profile.photoURL }} style={styles.avatarImage} />
                    ) : (
                        <Text style={styles.avatarInitials}>{initials}</Text>
                    )}
                </TouchableOpacity>
            </View>

            {/* Greeting */}
            <View style={styles.greetingSection}>
                <Text style={styles.greetingText}>
                    {greeting},{' '}
                    <Text style={styles.greetingName}>{profile?.firstName || 'Joueur'}</Text>
                </Text>
                <Text style={styles.greetingSubtext}>
                    {'Prêt pour ton prochain match ?'}
                </Text>
            </View>

            {/* Quick Stats */}
            <View style={styles.statsRow}>
                <View style={styles.statCard}>
                    <Text style={styles.statIcon}>{'🎾'}</Text>
                    <Text style={styles.statValue}>{profile?.matchesPlayed || 0}</Text>
                    <Text style={styles.statLabel}>{'Matchs'}</Text>
                </View>
                <View style={[styles.statCard, styles.statCardHighlight]}>
                    <Text style={styles.statIcon}>{'🏆'}</Text>
                    <Text style={[styles.statValue, styles.statValueHighlight]}>
                        {profile?.ranking ? `#${profile.ranking}` : '-'}
                    </Text>
                    <Text style={styles.statLabel}>{'Classement'}</Text>
                </View>
                <View style={styles.statCard}>
                    <Text style={styles.statIcon}>{'⭐'}</Text>
                    <Text style={styles.statValue}>
                        {profile?.averageRating ? profile.averageRating.toFixed(1) : '-'}
                    </Text>
                    <Text style={styles.statLabel}>{'Note'}</Text>
                </View>
            </View>

            {/* Quick Actions */}
            <Text style={styles.sectionTitle}>{'Actions rapides'}</Text>
            <View style={styles.actionsGrid}>
                <TouchableOpacity style={styles.actionCard} onPress={onNavigateProfile}>
                    <View style={[styles.actionIconBg, { backgroundColor: '#EAB30820' }]}>
                        <Text style={styles.actionIcon}>{'👤'}</Text>
                    </View>
                    <Text style={styles.actionTitle}>{'Mon Profil'}</Text>
                    <Text style={styles.actionSubtitle}>{'Voir et modifier'}</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.actionCard} activeOpacity={0.7}>
                    <View style={[styles.actionIconBg, { backgroundColor: '#38BDF820' }]}>
                        <Text style={styles.actionIcon}>{'🔍'}</Text>
                    </View>
                    <Text style={styles.actionTitle}>{'Trouver'}</Text>
                    <Text style={styles.actionSubtitle}>{'Bientôt disponible'}</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.actionCard} activeOpacity={0.7}>
                    <View style={[styles.actionIconBg, { backgroundColor: '#22C55E20' }]}>
                        <Text style={styles.actionIcon}>{'📅'}</Text>
                    </View>
                    <Text style={styles.actionTitle}>{'Réserver'}</Text>
                    <Text style={styles.actionSubtitle}>{'Bientôt disponible'}</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.actionCard} activeOpacity={0.7}>
                    <View style={[styles.actionIconBg, { backgroundColor: '#EF444420' }]}>
                        <Text style={styles.actionIcon}>{'🎯'}</Text>
                    </View>
                    <Text style={styles.actionTitle}>{'Mentors'}</Text>
                    <Text style={styles.actionSubtitle}>{'Bientôt disponible'}</Text>
                </TouchableOpacity>
            </View>

            {/* Coming Soon Banner */}
            <View style={styles.banner}>
                <View style={styles.bannerGlow} />
                <Text style={styles.bannerEmoji}>{'🚀'}</Text>
                <Text style={styles.bannerTitle}>{'Marketplace en construction'}</Text>
                <Text style={styles.bannerText}>
                    {'Recherche de partenaires, réservation de sessions et mentoring arrivent bientôt !'}
                </Text>
                <View style={styles.bannerDots}>
                    <View style={[styles.bannerDot, styles.bannerDotActive]} />
                    <View style={styles.bannerDot} />
                    <View style={styles.bannerDot} />
                </View>
            </View>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.background,
    },
    scrollContent: {
        paddingBottom: Spacing.xxl,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: Spacing.lg,
        paddingTop: Spacing.xxl + 8,
        paddingBottom: Spacing.md,
    },
    logoText: {
        fontSize: FontSizes.xl,
        fontWeight: '800',
        color: Colors.primary,
        letterSpacing: 0.5,
    },
    avatarButton: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: Colors.backgroundSecondary,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 2,
        borderColor: Colors.primary,
    },
    avatarImage: {
        width: 40,
        height: 40,
        borderRadius: 20,
    },
    avatarInitials: {
        color: Colors.primary,
        fontSize: FontSizes.md,
        fontWeight: '700',
    },
    greetingSection: {
        paddingHorizontal: Spacing.lg,
        marginBottom: Spacing.lg,
    },
    greetingText: {
        fontSize: FontSizes.xxl,
        fontWeight: '700',
        color: Colors.textPrimary,
    },
    greetingName: {
        color: Colors.primary,
    },
    greetingSubtext: {
        fontSize: FontSizes.md,
        color: Colors.textSecondary,
        marginTop: Spacing.xs,
    },
    statsRow: {
        flexDirection: 'row',
        paddingHorizontal: Spacing.lg,
        gap: Spacing.sm,
        marginBottom: Spacing.xl,
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
    statCardHighlight: {
        borderColor: Colors.primary,
        backgroundColor: '#EAB30810',
    },
    statIcon: {
        fontSize: 24,
        marginBottom: Spacing.xs,
    },
    statValue: {
        color: Colors.textPrimary,
        fontSize: FontSizes.xl,
        fontWeight: '800',
    },
    statValueHighlight: {
        color: Colors.primary,
    },
    statLabel: {
        color: Colors.textSecondary,
        fontSize: FontSizes.xs,
        marginTop: 2,
    },
    sectionTitle: {
        fontSize: FontSizes.lg,
        fontWeight: '700',
        color: Colors.textPrimary,
        paddingHorizontal: Spacing.lg,
        marginBottom: Spacing.md,
    },
    actionsGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        paddingHorizontal: Spacing.lg,
        gap: Spacing.sm,
        marginBottom: Spacing.xl,
    },
    actionCard: {
        width: '48%',
        backgroundColor: Colors.backgroundSecondary,
        borderRadius: BorderRadius.xl,
        padding: Spacing.lg,
        borderWidth: 1,
        borderColor: Colors.border,
        flexBasis: '47%',
    },
    actionIconBg: {
        width: 44,
        height: 44,
        borderRadius: BorderRadius.lg,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: Spacing.sm,
    },
    actionIcon: {
        fontSize: 22,
    },
    actionTitle: {
        color: Colors.textPrimary,
        fontSize: FontSizes.md,
        fontWeight: '600',
    },
    actionSubtitle: {
        color: Colors.textSecondary,
        fontSize: FontSizes.xs,
        marginTop: 2,
    },
    banner: {
        marginHorizontal: Spacing.lg,
        backgroundColor: Colors.backgroundSecondary,
        borderRadius: BorderRadius.xl,
        padding: Spacing.xl,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: Colors.border,
        overflow: 'hidden',
    },
    bannerGlow: {
        position: 'absolute',
        top: -40,
        width: 120,
        height: 120,
        borderRadius: 60,
        backgroundColor: Colors.primary,
        opacity: 0.06,
    },
    bannerEmoji: {
        fontSize: 40,
        marginBottom: Spacing.sm,
    },
    bannerTitle: {
        color: Colors.textPrimary,
        fontSize: FontSizes.lg,
        fontWeight: '700',
        marginBottom: Spacing.xs,
    },
    bannerText: {
        color: Colors.textSecondary,
        fontSize: FontSizes.sm,
        textAlign: 'center',
        lineHeight: 20,
        marginBottom: Spacing.md,
    },
    bannerDots: {
        flexDirection: 'row',
        gap: Spacing.xs,
    },
    bannerDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: Colors.border,
    },
    bannerDotActive: {
        backgroundColor: Colors.primary,
        width: 24,
    },
});
