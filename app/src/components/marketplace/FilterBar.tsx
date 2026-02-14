import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Spacing, FontSizes, BorderRadius } from '../../theme';

export interface ActiveFilters {
    league?: string;
    maxPrice?: number;
    minRanking?: number;
    maxRanking?: number;
}

interface FilterBarProps {
    activeFilters: ActiveFilters;
    onOpenFilter: () => void;
    onClearFilters: () => void;
}

export default function FilterBar({ activeFilters, onOpenFilter, onClearFilters }: FilterBarProps) {
    const hasFilters = Object.values(activeFilters).some((v) => v !== undefined && v !== '');
    const filterCount = Object.values(activeFilters).filter((v) => v !== undefined && v !== '').length;

    return (
        <View style={styles.container}>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.scroll}>
                <TouchableOpacity
                    style={[styles.chip, hasFilters && styles.chipActive]}
                    onPress={onOpenFilter}
                    activeOpacity={0.7}
                >
                    <Text style={[styles.chipText, hasFilters && styles.chipTextActive]}>
                        {'Filtres'}
                        {filterCount > 0 ? ` (${filterCount})` : ''}
                    </Text>
                </TouchableOpacity>

                {activeFilters.league ? (
                    <View style={[styles.chip, styles.chipActive]}>
                        <Text style={[styles.chipText, styles.chipTextActive]}>
                            {activeFilters.league.toUpperCase()}
                        </Text>
                    </View>
                ) : null}

                {activeFilters.maxPrice ? (
                    <View style={[styles.chip, styles.chipActive]}>
                        <Text style={[styles.chipText, styles.chipTextActive]}>
                            {'Max '}{activeFilters.maxPrice}{'€'}
                        </Text>
                    </View>
                ) : null}

                {(activeFilters.minRanking || activeFilters.maxRanking) ? (
                    <View style={[styles.chip, styles.chipActive]}>
                        <Text style={[styles.chipText, styles.chipTextActive]}>
                            {'# '}
                            {activeFilters.minRanking ? `#${activeFilters.minRanking}` : ''}
                            {activeFilters.minRanking && activeFilters.maxRanking ? ' - ' : ''}
                            {activeFilters.maxRanking ? `#${activeFilters.maxRanking}` : ''}
                        </Text>
                    </View>
                ) : null}

                {hasFilters ? (
                    <TouchableOpacity style={styles.clearChip} onPress={onClearFilters} activeOpacity={0.7}>
                        <Text style={styles.clearText}>{'✕ Réinitialiser'}</Text>
                    </TouchableOpacity>
                ) : null}
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        marginBottom: Spacing.sm,
    },
    scroll: {
        flexDirection: 'row',
        gap: Spacing.sm,
        paddingVertical: Spacing.xs,
    },
    chip: {
        backgroundColor: Colors.backgroundSecondary,
        paddingHorizontal: Spacing.md,
        paddingVertical: Spacing.sm,
        borderRadius: BorderRadius.full,
        borderWidth: 1,
        borderColor: Colors.border,
    },
    chipActive: {
        backgroundColor: '#EAB30815',
        borderColor: Colors.primary,
    },
    chipText: {
        color: Colors.textSecondary,
        fontSize: FontSizes.sm,
        fontWeight: '500',
    },
    chipTextActive: {
        color: Colors.primary,
        fontWeight: '600',
    },
    clearChip: {
        paddingHorizontal: Spacing.md,
        paddingVertical: Spacing.sm,
        justifyContent: 'center',
    },
    clearText: {
        color: Colors.error,
        fontSize: FontSizes.sm,
        fontWeight: '500',
    },
});
