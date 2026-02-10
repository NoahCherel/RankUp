import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    Modal,
    TouchableOpacity,
    ScrollView,
    TextInput as RNTextInput,
    Pressable,
} from 'react-native';
import { Colors, Spacing, FontSizes, BorderRadius } from '../../theme';
import { ActiveFilters } from './FilterBar';

const LEAGUES = [
    { label: 'Toutes', value: '' },
    { label: 'Île-de-France', value: 'idf' },
    { label: 'PACA', value: 'paca' },
    { label: 'Occitanie', value: 'occitanie' },
    { label: 'Nouvelle-Aquitaine', value: 'nouvelle-aquitaine' },
    { label: 'Auvergne-Rhône-Alpes', value: 'aura' },
    { label: 'Bretagne', value: 'bretagne' },
    { label: 'Grand Est', value: 'grand-est' },
    { label: 'Hauts-de-France', value: 'hauts-de-france' },
    { label: 'Normandie', value: 'normandie' },
    { label: 'Pays de la Loire', value: 'pays-de-la-loire' },
];

interface FilterModalProps {
    visible: boolean;
    onClose: () => void;
    filters: ActiveFilters;
    onApply: (filters: ActiveFilters) => void;
}

export default function FilterModal({ visible, onClose, filters, onApply }: FilterModalProps) {
    const [league, setLeague] = useState(filters.league || '');
    const [maxPrice, setMaxPrice] = useState(filters.maxPrice?.toString() || '');
    const [minRanking, setMinRanking] = useState(filters.minRanking?.toString() || '');
    const [maxRanking, setMaxRanking] = useState(filters.maxRanking?.toString() || '');

    const handleApply = () => {
        onApply({
            league: league || undefined,
            maxPrice: maxPrice ? parseInt(maxPrice, 10) : undefined,
            minRanking: minRanking ? parseInt(minRanking, 10) : undefined,
            maxRanking: maxRanking ? parseInt(maxRanking, 10) : undefined,
        });
        onClose();
    };

    const handleReset = () => {
        setLeague('');
        setMaxPrice('');
        setMinRanking('');
        setMaxRanking('');
        onApply({});
        onClose();
    };

    return (
        <Modal visible={visible} animationType="slide" transparent>
            <View style={styles.overlay}>
                <Pressable style={styles.backdrop} onPress={onClose} />
                <View style={styles.sheet}>
                    {/* Handle */}
                    <View style={styles.handle} />

                    {/* Title */}
                    <View style={styles.header}>
                        <Text style={styles.title}>{'Filtres'}</Text>
                        <TouchableOpacity onPress={onClose}>
                            <Text style={styles.closeText}>{'✕'}</Text>
                        </TouchableOpacity>
                    </View>

                    <ScrollView showsVerticalScrollIndicator={false}>
                        {/* League */}
                        <Text style={styles.sectionTitle}>{'📍 Ligue'}</Text>
                        <View style={styles.leagueGrid}>
                            {LEAGUES.map((l) => (
                                <TouchableOpacity
                                    key={l.value}
                                    style={[
                                        styles.leagueChip,
                                        league === l.value && styles.leagueChipActive,
                                    ]}
                                    onPress={() => setLeague(l.value)}
                                >
                                    <Text
                                        style={[
                                            styles.leagueChipText,
                                            league === l.value && styles.leagueChipTextActive,
                                        ]}
                                    >
                                        {l.label}
                                    </Text>
                                </TouchableOpacity>
                            ))}
                        </View>

                        {/* Price */}
                        <Text style={styles.sectionTitle}>{'💰 Prix maximum (€)'}</Text>
                        <RNTextInput
                            style={styles.textInput}
                            value={maxPrice}
                            onChangeText={setMaxPrice}
                            placeholder="Ex: 50"
                            placeholderTextColor={Colors.textSecondary}
                            keyboardType="numeric"
                        />

                        {/* Ranking */}
                        <Text style={styles.sectionTitle}>{'🏆 Classement'}</Text>
                        <View style={styles.rangeRow}>
                            <View style={styles.rangeInput}>
                                <Text style={styles.rangeLabel}>{'Min'}</Text>
                                <RNTextInput
                                    style={styles.textInput}
                                    value={minRanking}
                                    onChangeText={setMinRanking}
                                    placeholder="Ex: 100"
                                    placeholderTextColor={Colors.textSecondary}
                                    keyboardType="numeric"
                                />
                            </View>
                            <Text style={styles.rangeSep}>{'—'}</Text>
                            <View style={styles.rangeInput}>
                                <Text style={styles.rangeLabel}>{'Max'}</Text>
                                <RNTextInput
                                    style={styles.textInput}
                                    value={maxRanking}
                                    onChangeText={setMaxRanking}
                                    placeholder="Ex: 500"
                                    placeholderTextColor={Colors.textSecondary}
                                    keyboardType="numeric"
                                />
                            </View>
                        </View>
                    </ScrollView>

                    {/* Action Buttons */}
                    <View style={styles.actions}>
                        <TouchableOpacity style={styles.resetButton} onPress={handleReset}>
                            <Text style={styles.resetText}>{'Réinitialiser'}</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.applyButton} onPress={handleApply}>
                            <Text style={styles.applyText}>{'Appliquer'}</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        </Modal>
    );
}

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        justifyContent: 'flex-end',
    },
    backdrop: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(0,0,0,0.5)',
    },
    sheet: {
        backgroundColor: Colors.background,
        borderTopLeftRadius: BorderRadius.xl + 8,
        borderTopRightRadius: BorderRadius.xl + 8,
        padding: Spacing.lg,
        maxHeight: '80%',
    },
    handle: {
        width: 40,
        height: 4,
        borderRadius: 2,
        backgroundColor: Colors.border,
        alignSelf: 'center',
        marginBottom: Spacing.md,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: Spacing.lg,
    },
    title: {
        color: Colors.textPrimary,
        fontSize: FontSizes.xl,
        fontWeight: '800',
    },
    closeText: {
        color: Colors.textSecondary,
        fontSize: FontSizes.xl,
    },
    sectionTitle: {
        color: Colors.textPrimary,
        fontSize: FontSizes.md,
        fontWeight: '600',
        marginTop: Spacing.lg,
        marginBottom: Spacing.sm,
    },
    leagueGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: Spacing.sm,
    },
    leagueChip: {
        backgroundColor: Colors.backgroundSecondary,
        paddingHorizontal: Spacing.md,
        paddingVertical: Spacing.sm,
        borderRadius: BorderRadius.full,
        borderWidth: 1,
        borderColor: Colors.border,
    },
    leagueChipActive: {
        backgroundColor: '#EAB30815',
        borderColor: Colors.primary,
    },
    leagueChipText: {
        color: Colors.textSecondary,
        fontSize: FontSizes.sm,
    },
    leagueChipTextActive: {
        color: Colors.primary,
        fontWeight: '600',
    },
    textInput: {
        backgroundColor: Colors.backgroundSecondary,
        borderRadius: BorderRadius.lg,
        padding: Spacing.md,
        color: Colors.textPrimary,
        fontSize: FontSizes.md,
        borderWidth: 1,
        borderColor: Colors.border,
    },
    rangeRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: Spacing.sm,
    },
    rangeInput: {
        flex: 1,
    },
    rangeLabel: {
        color: Colors.textSecondary,
        fontSize: FontSizes.xs,
        marginBottom: Spacing.xs,
    },
    rangeSep: {
        color: Colors.textSecondary,
        fontSize: FontSizes.lg,
        paddingTop: Spacing.md,
    },
    actions: {
        flexDirection: 'row',
        gap: Spacing.md,
        marginTop: Spacing.xl,
        paddingBottom: Spacing.md,
    },
    resetButton: {
        flex: 1,
        paddingVertical: Spacing.md,
        borderRadius: BorderRadius.xl,
        borderWidth: 2,
        borderColor: Colors.border,
        alignItems: 'center',
    },
    resetText: {
        color: Colors.textSecondary,
        fontSize: FontSizes.md,
        fontWeight: '600',
    },
    applyButton: {
        flex: 1,
        paddingVertical: Spacing.md,
        borderRadius: BorderRadius.xl,
        backgroundColor: Colors.primary,
        alignItems: 'center',
    },
    applyText: {
        color: Colors.background,
        fontSize: FontSizes.md,
        fontWeight: '700',
    },
});
