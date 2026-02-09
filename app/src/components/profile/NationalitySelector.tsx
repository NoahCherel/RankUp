import React, { useState } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
    Modal,
    FlatList,
    TextInput as RNTextInput,
} from 'react-native';
import { Colors, Spacing, FontSizes, BorderRadius } from '../../theme';

// Common nationalities for Padel players (French-focused)
const NATIONALITIES = [
    { code: 'FR', name: 'France', flag: '🇫🇷' },
    { code: 'ES', name: 'Espagne', flag: '🇪🇸' },
    { code: 'PT', name: 'Portugal', flag: '🇵🇹' },
    { code: 'IT', name: 'Italie', flag: '🇮🇹' },
    { code: 'BE', name: 'Belgique', flag: '🇧🇪' },
    { code: 'CH', name: 'Suisse', flag: '🇨🇭' },
    { code: 'AR', name: 'Argentine', flag: '🇦🇷' },
    { code: 'BR', name: 'Brésil', flag: '🇧🇷' },
    { code: 'MX', name: 'Mexique', flag: '🇲🇽' },
    { code: 'DE', name: 'Allemagne', flag: '🇩🇪' },
    { code: 'GB', name: 'Royaume-Uni', flag: '🇬🇧' },
    { code: 'NL', name: 'Pays-Bas', flag: '🇳🇱' },
    { code: 'SE', name: 'Suède', flag: '🇸🇪' },
    { code: 'US', name: 'États-Unis', flag: '🇺🇸' },
    { code: 'MA', name: 'Maroc', flag: '🇲🇦' },
    { code: 'DZ', name: 'Algérie', flag: '🇩🇿' },
    { code: 'TN', name: 'Tunisie', flag: '🇹🇳' },
];

interface NationalitySelectorProps {
    value?: string;
    onChange: (code: string, name: string) => void;
    label?: string;
    error?: string;
}

export default function NationalitySelector({
    value,
    onChange,
    label = 'Nationalité',
    error,
}: NationalitySelectorProps) {
    const [modalVisible, setModalVisible] = useState(false);
    const [search, setSearch] = useState('');

    const selectedNationality = NATIONALITIES.find(n => n.code === value);

    const filteredNationalities = NATIONALITIES.filter(n =>
        n.name.toLowerCase().includes(search.toLowerCase())
    );

    const handleSelect = (nationality: typeof NATIONALITIES[0]) => {
        onChange(nationality.code, nationality.name);
        setModalVisible(false);
        setSearch('');
    };

    return (
        <View style={styles.container}>
            {label && <Text style={styles.label}>{label}</Text>}

            <TouchableOpacity
                style={[styles.selector, error && styles.selectorError]}
                onPress={() => setModalVisible(true)}
            >
                {selectedNationality ? (
                    <View style={styles.selectedValue}>
                        <Text style={styles.flag}>{selectedNationality.flag}</Text>
                        <Text style={styles.selectedText}>{selectedNationality.name}</Text>
                    </View>
                ) : (
                    <Text style={styles.placeholder}>Sélectionner...</Text>
                )}
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
                            <Text style={styles.modalTitle}>Nationalité</Text>
                            <TouchableOpacity onPress={() => setModalVisible(false)}>
                                <Text style={styles.closeButton}>✕</Text>
                            </TouchableOpacity>
                        </View>

                        <RNTextInput
                            style={styles.searchInput}
                            placeholder="Rechercher..."
                            placeholderTextColor={Colors.textSecondary}
                            value={search}
                            onChangeText={setSearch}
                        />

                        <FlatList
                            data={filteredNationalities}
                            keyExtractor={(item) => item.code}
                            renderItem={({ item }) => (
                                <TouchableOpacity
                                    style={[
                                        styles.option,
                                        item.code === value && styles.optionSelected,
                                    ]}
                                    onPress={() => handleSelect(item)}
                                >
                                    <Text style={styles.optionFlag}>{item.flag}</Text>
                                    <Text style={styles.optionText}>{item.name}</Text>
                                    {item.code === value && (
                                        <Text style={styles.checkmark}>✓</Text>
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
    selectedValue: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    flag: {
        fontSize: FontSizes.xl,
        marginRight: Spacing.sm,
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
        maxHeight: '70%',
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
    searchInput: {
        backgroundColor: Colors.backgroundSecondary,
        margin: Spacing.md,
        paddingHorizontal: Spacing.md,
        paddingVertical: Spacing.sm,
        borderRadius: BorderRadius.md,
        color: Colors.textPrimary,
        fontSize: FontSizes.md,
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
    optionFlag: {
        fontSize: FontSizes.xl,
        marginRight: Spacing.md,
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
