/**
 * CourtSelector — Padel court / location picker.
 *
 * Shows a list of well-known paddle courts + free-text input.
 */
import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    Modal,
    ScrollView,
    Platform,
} from 'react-native';
import { Colors, Spacing, FontSizes, BorderRadius } from '../../theme';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import TextInput from '../ui/TextInput';

interface CourtSelectorProps {
    value: string;
    onChange: (court: string) => void;
    /** Mentor's club — shown as first suggestion */
    mentorClub?: string;
    placeholder?: string;
}

/** Pre-defined padel courts (France — PACA region + popular) */
const COURTS: { name: string; city: string }[] = [
    { name: 'All In Padel', city: 'Mougins' },
    { name: '4Padel Sophia Antipolis', city: 'Biot' },
    { name: 'Padel Club Antibes', city: 'Antibes' },
    { name: 'Nice Padel Club', city: 'Nice' },
    { name: 'Cannes Padel', city: 'Cannes' },
    { name: 'Set Club', city: 'Aix-en-Provence' },
    { name: 'Marseille Padel Club', city: 'Marseille' },
    { name: 'Padel Arena', city: 'Montpellier' },
    { name: 'RSI Padel', city: 'Lyon' },
    { name: 'Toulouse Padel Club', city: 'Toulouse' },
    { name: 'Paris Padel', city: 'Paris' },
];

export default function CourtSelector({
    value,
    onChange,
    mentorClub,
    placeholder = 'Choisir un terrain',
}: CourtSelectorProps) {
    const [visible, setVisible] = useState(false);
    const [customText, setCustomText] = useState('');

    const handleSelect = (court: string) => {
        onChange(court);
        setVisible(false);
    };

    const handleCustomConfirm = () => {
        if (customText.trim()) {
            onChange(customText.trim());
            setCustomText('');
            setVisible(false);
        }
    };

    return (
        <>
            {/* Trigger */}
            <TouchableOpacity style={styles.trigger} onPress={() => setVisible(true)} activeOpacity={0.7}>
                <Ionicons name="location-outline" size={18} color={Colors.textSecondary} style={{ marginRight: Spacing.sm }} />
                <Text style={[styles.triggerText, !value && styles.triggerPlaceholder]}>
                    {value || placeholder}
                </Text>
                <Text style={styles.triggerChevron}>{'›'}</Text>
            </TouchableOpacity>

            {/* Modal */}
            <Modal
                visible={visible}
                transparent
                animationType="slide"
                onRequestClose={() => setVisible(false)}
            >
                <View style={styles.overlay}>
                    <View style={styles.modal}>
                        {/* Header */}
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>{'Choisir un terrain'}</Text>
                            <TouchableOpacity onPress={() => setVisible(false)}>
                                <Ionicons name="close" size={24} color={Colors.textSecondary} />
                            </TouchableOpacity>
                        </View>

                        <ScrollView
                            showsVerticalScrollIndicator={false}
                            contentContainerStyle={styles.modalContent}
                        >
                            {/* Mentor's club (if available) */}
                            {mentorClub ? (
                                <>
                                    <Text style={styles.groupTitle}>{'Club du mentor'}</Text>
                                    <TouchableOpacity
                                        style={[
                                            styles.courtItem,
                                            value === mentorClub && styles.courtItemActive,
                                        ]}
                                        onPress={() => handleSelect(mentorClub)}
                                    >
                                        <Ionicons name="star" size={18} color={Colors.primary} style={{ marginRight: Spacing.md }} />
                                        <View style={{ flex: 1 }}>
                                            <Text
                                                style={[
                                                    styles.courtName,
                                                    value === mentorClub && styles.courtNameActive,
                                                ]}
                                            >
                                                {mentorClub}
                                            </Text>
                                            <Text style={styles.courtCity}>{'Recommandé'}</Text>
                                        </View>
                                        {value === mentorClub && (
                                            <Ionicons name="checkmark" size={20} color={Colors.primary} style={{ marginLeft: Spacing.sm }} />
                                        )}
                                    </TouchableOpacity>
                                </>
                            ) : null}

                            {/* Popular courts */}
                            <Text style={styles.groupTitle}>{'Terrains populaires'}</Text>
                            {COURTS.map((court) => {
                                const label = `${court.name} — ${court.city}`;
                                const active = value === label;
                                return (
                                    <TouchableOpacity
                                        key={label}
                                        style={[styles.courtItem, active && styles.courtItemActive]}
                                        onPress={() => handleSelect(label)}
                                    >
                                        <MaterialCommunityIcons name="stadium-variant" size={18} color={Colors.textSecondary} style={{ marginRight: Spacing.md }} />
                                        <View style={{ flex: 1 }}>
                                            <Text style={[styles.courtName, active && styles.courtNameActive]}>
                                                {court.name}
                                            </Text>
                                            <Text style={styles.courtCity}>{court.city}</Text>
                                        </View>
                                        {active && <Ionicons name="checkmark" size={20} color={Colors.primary} style={{ marginLeft: Spacing.sm }} />}
                                    </TouchableOpacity>
                                );
                            })}

                            {/* Custom input */}
                            <Text style={styles.groupTitle}>{'Autre lieu'}</Text>
                            <View style={styles.customRow}>
                                <View style={{ flex: 1 }}>
                                    <TextInput
                                        placeholder="Nom du club ou adresse…"
                                        value={customText}
                                        onChangeText={setCustomText}
                                    />
                                </View>
                                <TouchableOpacity
                                    style={[
                                        styles.customConfirm,
                                        !customText.trim() && styles.customConfirmDisabled,
                                    ]}
                                    disabled={!customText.trim()}
                                    onPress={handleCustomConfirm}
                                >
                                    <Text style={styles.customConfirmText}>{'OK'}</Text>
                                </TouchableOpacity>
                            </View>
                        </ScrollView>
                    </View>
                </View>
            </Modal>
        </>
    );
}

// ---------------------------------------------------------------------------
// Styles
// ---------------------------------------------------------------------------

const styles = StyleSheet.create({
    trigger: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: Colors.backgroundSecondary,
        borderRadius: BorderRadius.lg,
        borderWidth: 1,
        borderColor: Colors.border,
        paddingHorizontal: Spacing.md,
        paddingVertical: Spacing.md + 2,
    },
    triggerText: {
        flex: 1,
        color: Colors.textPrimary,
        fontSize: FontSizes.sm,
        fontWeight: '600',
    },
    triggerPlaceholder: { color: Colors.textSecondary, fontWeight: '400' },
    triggerChevron: {
        color: Colors.textSecondary,
        fontSize: FontSizes.xl,
        fontWeight: '300',
    },

    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.6)',
        justifyContent: 'flex-end',
    },
    modal: {
        backgroundColor: Colors.background,
        borderTopLeftRadius: BorderRadius.xl,
        borderTopRightRadius: BorderRadius.xl,
        maxHeight: '80%',
        ...(Platform.OS === 'web' ? { maxWidth: 480, alignSelf: 'center' as const, width: '100%' } : {}),
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: Spacing.lg,
        paddingTop: Spacing.lg,
        paddingBottom: Spacing.sm,
    },
    modalTitle: {
        color: Colors.textPrimary,
        fontSize: FontSizes.lg,
        fontWeight: '700',
    },
    modalContent: {
        paddingHorizontal: Spacing.lg,
        paddingBottom: Spacing.xxl,
    },

    groupTitle: {
        color: Colors.textSecondary,
        fontSize: FontSizes.xs,
        fontWeight: '700',
        textTransform: 'uppercase',
        letterSpacing: 1,
        marginTop: Spacing.lg,
        marginBottom: Spacing.sm,
    },

    courtItem: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: Colors.backgroundSecondary,
        borderRadius: BorderRadius.lg,
        padding: Spacing.md,
        marginBottom: Spacing.xs + 2,
        borderWidth: 1,
        borderColor: Colors.border,
    },
    courtItemActive: {
        borderColor: Colors.primary,
        backgroundColor: '#EAB30815',
    },
    courtName: {
        color: Colors.textPrimary,
        fontSize: FontSizes.sm,
        fontWeight: '600',
    },
    courtNameActive: { color: Colors.primary },
    courtCity: {
        color: Colors.textSecondary,
        fontSize: FontSizes.xs,
        marginTop: 1,
    },

    customRow: {
        flexDirection: 'row',
        alignItems: 'flex-end',
        gap: Spacing.sm,
    },
    customConfirm: {
        backgroundColor: Colors.primary,
        borderRadius: BorderRadius.lg,
        paddingVertical: Spacing.md,
        paddingHorizontal: Spacing.lg,
        marginBottom: 4,
    },
    customConfirmDisabled: { backgroundColor: Colors.border },
    customConfirmText: {
        color: Colors.background,
        fontSize: FontSizes.sm,
        fontWeight: '700',
    },
});
