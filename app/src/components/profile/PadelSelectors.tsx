import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    Modal,
    FlatList,
} from 'react-native';
import { Colors, Spacing, FontSizes, BorderRadius } from '../../theme';
import { Ionicons } from '@expo/vector-icons';

// French Padel Leagues
const LEAGUES = [
    { id: 'occitanie', name: 'Occitanie' },
    { id: 'paca', name: 'PACA' },
    { id: 'ile-de-france', name: 'Île-de-France' },
    { id: 'auvergne-rhone-alpes', name: 'Auvergne-Rhône-Alpes' },
    { id: 'nouvelle-aquitaine', name: 'Nouvelle-Aquitaine' },
    { id: 'bretagne', name: 'Bretagne' },
    { id: 'pays-de-la-loire', name: 'Pays de la Loire' },
    { id: 'hauts-de-france', name: 'Hauts-de-France' },
    { id: 'grand-est', name: 'Grand Est' },
    { id: 'normandie', name: 'Normandie' },
    { id: 'centre-val-de-loire', name: 'Centre-Val de Loire' },
    { id: 'bourgogne-franche-comte', name: 'Bourgogne-Franche-Comté' },
    { id: 'corse', name: 'Corse' },
];

// Play styles
const PLAY_STYLES: { id: string; name: string; iconName: keyof typeof Ionicons.glyphMap; description: string }[] = [
    { id: 'left', name: 'Côté gauche', iconName: 'arrow-back', description: 'Volée et revers' },
    { id: 'right', name: 'Côté droit', iconName: 'arrow-forward', description: 'Coups droits et smash' },
    { id: 'both', name: 'Les deux', iconName: 'swap-horizontal', description: 'Polyvalent' },
];

interface PlayStyleSelectorProps {
    value?: 'left' | 'right' | 'both';
    onChange: (value: 'left' | 'right' | 'both') => void;
    label?: string;
}

export function PlayStyleSelector({
    value,
    onChange,
    label = 'Position de jeu',
}: PlayStyleSelectorProps) {
    return (
        <View style={styles.container}>
            {label && <Text style={styles.label}>{label}</Text>}
            <View style={styles.playStyleRow}>
                {PLAY_STYLES.map((style) => (
                    <TouchableOpacity
                        key={style.id}
                        style={[
                            styles.playStyleCard,
                            value === style.id && styles.playStyleCardSelected,
                        ]}
                        onPress={() => onChange(style.id as 'left' | 'right' | 'both')}
                    >
                        <Ionicons name={style.iconName} size={22} color={value === style.id ? Colors.primary : Colors.textSecondary} style={{ marginBottom: Spacing.xs }} />
                        <Text
                            style={[
                                styles.playStyleName,
                                value === style.id && styles.playStyleNameSelected,
                            ]}
                        >
                            {style.name}
                        </Text>
                    </TouchableOpacity>
                ))}
            </View>
        </View>
    );
}

interface LeagueSelectorProps {
    value?: string;
    onChange: (value: string) => void;
    label?: string;
    error?: string;
}

export function LeagueSelector({
    value,
    onChange,
    label = 'Ligue',
    error,
}: LeagueSelectorProps) {
    const [modalVisible, setModalVisible] = useState(false);
    const selectedLeague = LEAGUES.find(l => l.id === value);

    return (
        <View style={styles.container}>
            {label && <Text style={styles.label}>{label}</Text>}

            <TouchableOpacity
                style={[styles.selector, error && styles.selectorError]}
                onPress={() => setModalVisible(true)}
            >
                <Text style={selectedLeague ? styles.selectedText : styles.placeholder}>
                    {selectedLeague?.name || 'Sélectionner...'}
                </Text>
                <Text style={styles.chevron}>▼</Text>
            </TouchableOpacity>

            {error && <Text style={styles.error}>{error}</Text>}

            <Modal
                visible={modalVisible}
                animationType="slide"
                transparent={true}
                onRequestClose={() => setModalVisible(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>Ligue</Text>
                            <TouchableOpacity onPress={() => setModalVisible(false)}>
                                <Ionicons name="close" size={24} color={Colors.textSecondary} />
                            </TouchableOpacity>
                        </View>

                        <FlatList
                            data={LEAGUES}
                            keyExtractor={(item) => item.id}
                            renderItem={({ item }) => (
                                <TouchableOpacity
                                    style={[
                                        styles.option,
                                        item.id === value && styles.optionSelected,
                                    ]}
                                    onPress={() => {
                                        onChange(item.id);
                                        setModalVisible(false);
                                    }}
                                >
                                    <Text style={styles.optionText}>{item.name}</Text>
                                    {item.id === value && (
                                        <Ionicons name="checkmark" size={20} color={Colors.primary} />
                                    )}
                                </TouchableOpacity>
                            )}
                        />
                    </View>
                </View>
            </Modal>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        marginBottom: Spacing.md,
    },
    label: {
        color: Colors.textPrimary,
        fontSize: FontSizes.sm,
        fontWeight: '500',
        marginBottom: Spacing.xs,
    },
    playStyleRow: {
        flexDirection: 'row',
        gap: Spacing.sm,
    },
    playStyleCard: {
        flex: 1,
        backgroundColor: Colors.backgroundSecondary,
        borderRadius: BorderRadius.lg,
        padding: Spacing.md,
        alignItems: 'center',
        borderWidth: 2,
        borderColor: 'transparent',
    },
    playStyleCardSelected: {
        borderColor: Colors.primary,
        backgroundColor: Colors.background,
    },
    playStyleIcon: {
        fontSize: FontSizes.xl,
        marginBottom: Spacing.xs,
    },
    playStyleName: {
        color: Colors.textSecondary,
        fontSize: FontSizes.sm,
        fontWeight: '500',
    },
    playStyleNameSelected: {
        color: Colors.primary,
    },
    selector: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: Colors.backgroundSecondary,
        borderRadius: BorderRadius.lg,
        paddingHorizontal: Spacing.md,
        paddingVertical: Spacing.md,
        borderWidth: 1,
        borderColor: Colors.border,
    },
    selectorError: {
        borderColor: Colors.error,
    },
    selectedText: {
        color: Colors.textPrimary,
        fontSize: FontSizes.md,
    },
    placeholder: {
        color: Colors.textSecondary,
        fontSize: FontSizes.md,
    },
    chevron: {
        color: Colors.textSecondary,
        fontSize: FontSizes.xs,
    },
    error: {
        color: Colors.error,
        fontSize: FontSizes.xs,
        marginTop: Spacing.xs,
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.7)',
        justifyContent: 'flex-end',
    },
    modalContent: {
        backgroundColor: Colors.background,
        borderTopLeftRadius: BorderRadius.xl,
        borderTopRightRadius: BorderRadius.xl,
        maxHeight: '60%',
        paddingBottom: Spacing.xl,
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: Spacing.lg,
        borderBottomWidth: 1,
        borderBottomColor: Colors.border,
    },
    modalTitle: {
        color: Colors.textPrimary,
        fontSize: FontSizes.lg,
        fontWeight: '600',
    },
    closeButton: {
        color: Colors.textSecondary,
        fontSize: FontSizes.xl,
    },
    option: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: Spacing.md,
        paddingHorizontal: Spacing.lg,
    },
    optionSelected: {
        backgroundColor: Colors.backgroundSecondary,
    },
    optionText: {
        color: Colors.textPrimary,
        fontSize: FontSizes.md,
        flex: 1,
    },
    checkmark: {
        color: Colors.primary,
        fontSize: FontSizes.lg,
        fontWeight: 'bold',
    },
});
