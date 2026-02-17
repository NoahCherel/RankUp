import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    Image,
    Alert,
    Platform,
    useWindowDimensions,
} from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { Colors, Spacing, FontSizes, BorderRadius } from '../theme';
import { auth } from '../config/firebase';
import { getUserProfile } from '../services/userService';
import { UserProfile } from '../types';
import { getInitials } from '../utils/formatters';
import { seedAll, getSeedSummary } from '../utils/seedData';

interface HomeScreenProps {
    onNavigateProfile?: () => void;
    onNavigateMarketplace?: () => void;
    onNavigateBookings?: () => void;
    onNavigateMessages?: () => void;
}

export default function HomeScreen({ onNavigateProfile, onNavigateMarketplace, onNavigateBookings, onNavigateMessages }: HomeScreenProps) {
    const [profile, setProfile] = useState<UserProfile | null>(null);
    const [greeting, setGreeting] = useState('');
    const [seeding, setSeeding] = useState(false);

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
            // Silently handle
        }
    };

    const initials = profile ? getInitials(profile.firstName || '?', profile.lastName || '?') : '?';
    const { width } = useWindowDimensions();
    const isWeb = Platform.OS === 'web';
    const isWide = width > 768;

    return (
        <ScrollView style={styles.container} contentContainerStyle={[styles.scrollContent, isWeb && styles.webScrollContent]}>
            {/* Header */}
            <View style={styles.header}>
                {!isWeb && (
                    <View style={styles.logoWrap}>
                        <MaterialCommunityIcons name="lightning-bolt" size={22} color={Colors.primary} />
                        <Text style={styles.logoText}>{'RankUp'}</Text>
                    </View>
                )}
                {isWeb && <View />}
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
                    <View style={styles.statIconWrap}>
                        <MaterialCommunityIcons name="tennis" size={22} color={Colors.secondary} />
                    </View>
                    <Text style={styles.statValue}>{profile?.matchesPlayed || 0}</Text>
                    <Text style={styles.statLabel}>{'Matchs'}</Text>
                </View>
                <View style={[styles.statCard, styles.statCardHighlight]}>
                    <View style={styles.statIconWrap}>
                        <Ionicons name="trophy" size={22} color={Colors.primary} />
                    </View>
                    <Text style={[styles.statValue, styles.statValueHighlight]}>
                        {profile?.ranking ? `#${profile.ranking}` : '-'}
                    </Text>
                    <Text style={styles.statLabel}>{'Classement'}</Text>
                </View>
                <View style={styles.statCard}>
                    <View style={styles.statIconWrap}>
                        <Ionicons name="star" size={22} color={Colors.warning} />
                    </View>
                    <Text style={styles.statValue}>
                        {profile?.averageRating ? profile.averageRating.toFixed(1) : '-'}
                    </Text>
                    <Text style={styles.statLabel}>{'Note'}</Text>
                </View>
            </View>

            {/* Quick Actions */}
            <Text style={styles.sectionTitle}>{'Actions rapides'}</Text>
            <View style={[styles.actionsGrid, isWide && styles.actionsGridWide]}>
                <TouchableOpacity style={styles.actionCard} onPress={onNavigateProfile} activeOpacity={0.7}>
                    <View style={[styles.actionIconBg, { backgroundColor: '#EAB30815' }]}>
                        <Ionicons name="person" size={22} color={Colors.primary} />
                    </View>
                    <Text style={styles.actionTitle}>{'Mon Profil'}</Text>
                    <Text style={styles.actionSubtitle}>{'Voir et modifier'}</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.actionCard} activeOpacity={0.7} onPress={onNavigateMarketplace}>
                    <View style={[styles.actionIconBg, { backgroundColor: '#38BDF815' }]}>
                        <Ionicons name="search" size={22} color={Colors.secondary} />
                    </View>
                    <Text style={styles.actionTitle}>{'Explorer'}</Text>
                    <Text style={styles.actionSubtitle}>{'Trouver un mentor'}</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.actionCard} activeOpacity={0.7} onPress={onNavigateBookings}>
                    <View style={[styles.actionIconBg, { backgroundColor: '#22C55E15' }]}>
                        <Ionicons name="calendar" size={22} color={Colors.success} />
                    </View>
                    <Text style={styles.actionTitle}>{'Sessions'}</Text>
                    <Text style={styles.actionSubtitle}>{'Mes réservations'}</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.actionCard} activeOpacity={0.7} onPress={onNavigateMessages}>
                    <View style={[styles.actionIconBg, { backgroundColor: '#EF444415' }]}>
                        <Ionicons name="chatbubbles" size={22} color={Colors.error} />
                    </View>
                    <Text style={styles.actionTitle}>{'Messages'}</Text>
                    <Text style={styles.actionSubtitle}>{'Mes conversations'}</Text>
                </TouchableOpacity>
            </View>

            {/* Dev: Seed demo data */}
            <View style={styles.seedSection}>
                <Text style={styles.seedTitle}>{'🛠 Outils développeur'}</Text>
                <TouchableOpacity
                    style={[styles.seedButton, seeding && styles.seedButtonDisabled]}
                    activeOpacity={0.7}
                    disabled={seeding}
                    onPress={async () => {
                        const summary = getSeedSummary();
                        Alert.alert(
                            'Seed données démo',
                            `Cela va créer :\n• ${summary.mentors} mentors\n• ${summary.users} utilisateurs\n• ${summary.bookings} réservations\n• ${summary.conversations} conversations\n• ${summary.reviews} avis\n\nContinuer ?`,
                            [
                                { text: 'Annuler', style: 'cancel' },
                                {
                                    text: 'Seed',
                                    onPress: async () => {
                                        setSeeding(true);
                                        const result = await seedAll();
                                        setSeeding(false);
                                        if (result.success) {
                                            Alert.alert('✅ Succès', 'Les données de démo sont prêtes !');
                                        } else {
                                            Alert.alert('❌ Erreur', result.error || 'Erreur inconnue');
                                        }
                                    },
                                },
                            ],
                        );
                    }}
                >
                    <Ionicons name="cloud-upload" size={18} color={Colors.background} />
                    <Text style={styles.seedButtonText}>
                        {seeding ? 'Seeding...' : 'Charger données démo'}
                    </Text>
                </TouchableOpacity>
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
    webScrollContent: {
        maxWidth: 900,
        alignSelf: 'center' as any,
        width: '100%' as any,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: Spacing.lg,
        paddingTop: Spacing.xxl + 8,
        paddingBottom: Spacing.md,
    },
    logoWrap: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
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
    statIconWrap: {
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
    actionsGridWide: {
        flexWrap: 'nowrap',
    },
    actionCard: {
        backgroundColor: Colors.backgroundSecondary,
        borderRadius: BorderRadius.xl,
        padding: Spacing.lg,
        borderWidth: 1,
        borderColor: Colors.border,
        flexGrow: 1,
        flexShrink: 1,
        flexBasis: '44%',
    },
    actionIconBg: {
        width: 44,
        height: 44,
        borderRadius: BorderRadius.lg,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: Spacing.sm,
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
    seedSection: {
        paddingHorizontal: Spacing.lg,
        marginTop: Spacing.md,
        marginBottom: Spacing.xl,
    },
    seedTitle: {
        color: Colors.textSecondary,
        fontSize: FontSizes.sm,
        fontWeight: '600',
        marginBottom: Spacing.sm,
    },
    seedButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: Spacing.sm,
        backgroundColor: Colors.secondary,
        paddingVertical: Spacing.md,
        borderRadius: BorderRadius.lg,
    },
    seedButtonDisabled: {
        opacity: 0.5,
    },
    seedButtonText: {
        color: Colors.background,
        fontSize: FontSizes.md,
        fontWeight: '600',
    },
});
