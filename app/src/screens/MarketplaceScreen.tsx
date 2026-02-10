import React, { useState, useEffect, useCallback } from 'react';
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    RefreshControl,
    ActivityIndicator,
} from 'react-native';
import { Colors, Spacing, FontSizes, BorderRadius } from '../theme';
import { UserProfile } from '../types';
import { getMentors } from '../services/userService';
import { MentorCard, SearchBar, FilterBar, FilterModal, ActiveFilters } from '../components/marketplace';

interface MarketplaceScreenProps {
    onMentorPress: (mentor: UserProfile) => void;
}

export default function MarketplaceScreen({ onMentorPress }: MarketplaceScreenProps) {
    const [mentors, setMentors] = useState<UserProfile[]>([]);
    const [filteredMentors, setFilteredMentors] = useState<UserProfile[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [filters, setFilters] = useState<ActiveFilters>({});
    const [filterModalVisible, setFilterModalVisible] = useState(false);

    useEffect(() => {
        loadMentors();
    }, []);

    // Apply search filter whenever searchQuery or mentors change
    useEffect(() => {
        if (!searchQuery.trim()) {
            setFilteredMentors(mentors);
            return;
        }
        const query = searchQuery.toLowerCase();
        const filtered = mentors.filter((m) => {
            const fullName = `${m.firstName} ${m.lastName}`.toLowerCase();
            return fullName.includes(query);
        });
        setFilteredMentors(filtered);
    }, [searchQuery, mentors]);

    const loadMentors = async (currentFilters?: ActiveFilters) => {
        try {
            const filtersToUse = currentFilters || filters;
            const data = await getMentors({
                minRanking: filtersToUse.minRanking,
                maxRanking: filtersToUse.maxRanking,
                maxPrice: filtersToUse.maxPrice,
            }, 50);

            // Client-side league filter
            let result = data;
            if (filtersToUse.league) {
                result = data.filter((m) => m.league === filtersToUse.league);
            }

            setMentors(result);
            setFilteredMentors(result);
        } catch (err) {
            console.error('[Marketplace] Error loading mentors:', err);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    const handleRefresh = () => {
        setRefreshing(true);
        loadMentors();
    };

    const handleApplyFilters = (newFilters: ActiveFilters) => {
        setFilters(newFilters);
        setLoading(true);
        loadMentors(newFilters);
    };

    const handleClearFilters = () => {
        setFilters({});
        setLoading(true);
        loadMentors({});
    };

    const renderMentor = ({ item }: { item: UserProfile }) => (
        <MentorCard mentor={item} onPress={() => onMentorPress(item)} />
    );

    const renderEmpty = () => {
        if (loading) return null;
        return (
            <View style={styles.emptyContainer}>
                <Text style={styles.emptyEmoji}>{'🔍'}</Text>
                <Text style={styles.emptyTitle}>{'Aucun mentor trouvé'}</Text>
                <Text style={styles.emptyText}>
                    {searchQuery
                        ? 'Essaie un autre nom ou modifie tes filtres.'
                        : 'Aucun joueur n\'a activé le mode Mentor pour le moment.'}
                </Text>
            </View>
        );
    };

    return (
        <View style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <View>
                    <Text style={styles.headerTitle}>{'Marketplace'}</Text>
                    <Text style={styles.headerSubtitle}>
                        {loading
                            ? 'Chargement...'
                            : `${filteredMentors.length} mentor${filteredMentors.length !== 1 ? 's' : ''} disponible${filteredMentors.length !== 1 ? 's' : ''}`}
                    </Text>
                </View>
            </View>

            {/* Search + Filters */}
            <View style={styles.controlsContainer}>
                <SearchBar value={searchQuery} onChangeText={setSearchQuery} />
                <FilterBar
                    activeFilters={filters}
                    onOpenFilter={() => setFilterModalVisible(true)}
                    onClearFilters={handleClearFilters}
                />
            </View>

            {/* Loading */}
            {loading ? (
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color={Colors.primary} />
                    <Text style={styles.loadingText}>{'Chargement des mentors...'}</Text>
                </View>
            ) : (
                <FlatList
                    data={filteredMentors}
                    renderItem={renderMentor}
                    keyExtractor={(item) => item.id}
                    contentContainerStyle={styles.listContent}
                    showsVerticalScrollIndicator={false}
                    ListEmptyComponent={renderEmpty}
                    refreshControl={
                        <RefreshControl
                            refreshing={refreshing}
                            onRefresh={handleRefresh}
                            tintColor={Colors.primary}
                        />
                    }
                />
            )}

            {/* Filter Modal */}
            <FilterModal
                visible={filterModalVisible}
                onClose={() => setFilterModalVisible(false)}
                filters={filters}
                onApply={handleApplyFilters}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.background,
    },
    header: {
        paddingHorizontal: Spacing.lg,
        paddingTop: Spacing.xxl + 8,
        paddingBottom: Spacing.sm,
    },
    headerTitle: {
        color: Colors.textPrimary,
        fontSize: FontSizes.xxl,
        fontWeight: '800',
    },
    headerSubtitle: {
        color: Colors.textSecondary,
        fontSize: FontSizes.sm,
        marginTop: 2,
    },
    controlsContainer: {
        paddingHorizontal: Spacing.lg,
        marginBottom: Spacing.xs,
    },
    listContent: {
        paddingHorizontal: Spacing.lg,
        paddingBottom: Spacing.xxl,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    loadingText: {
        color: Colors.textSecondary,
        fontSize: FontSizes.sm,
        marginTop: Spacing.md,
    },
    emptyContainer: {
        alignItems: 'center',
        paddingVertical: Spacing.xxl * 2,
    },
    emptyEmoji: {
        fontSize: 64,
        marginBottom: Spacing.md,
    },
    emptyTitle: {
        color: Colors.textPrimary,
        fontSize: FontSizes.lg,
        fontWeight: '700',
        marginBottom: Spacing.xs,
    },
    emptyText: {
        color: Colors.textSecondary,
        fontSize: FontSizes.sm,
        textAlign: 'center',
        lineHeight: 22,
        paddingHorizontal: Spacing.xl,
    },
});
