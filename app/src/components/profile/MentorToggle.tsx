import React from 'react';
import {
    View,
    Text,
    StyleSheet,
    Switch,
} from 'react-native';
import { Colors, Spacing, FontSizes, BorderRadius } from '../../theme';
import { Ionicons } from '@expo/vector-icons';
import { TextInput } from '../ui';

interface MentorToggleProps {
    isMentor: boolean;
    onToggle: (value: boolean) => void;
    price?: number;
    onPriceChange?: (price: number) => void;
    description?: string;
    onDescriptionChange?: (description: string) => void;
}

export default function MentorToggle({
    isMentor,
    onToggle,
    price,
    onPriceChange,
    description,
    onDescriptionChange,
}: MentorToggleProps) {
    return (
        <View style={styles.container}>
            {/* Toggle Header */}
            <View style={styles.header}>
                <View style={styles.headerText}>
                    <Text style={styles.title}>Mode Mentor</Text>
                    <Text style={styles.subtitle}>
                        Propose tes services aux autres joueurs
                    </Text>
                </View>
                <Switch
                    value={isMentor}
                    onValueChange={onToggle}
                    trackColor={{ false: Colors.border, true: Colors.primary }}
                    thumbColor={isMentor ? Colors.textPrimary : Colors.textSecondary}
                />
            </View>

            {/* Mentor Fields (shown when enabled) */}
            {isMentor && (
                <View style={styles.mentorFields}>
                    <View style={styles.priceContainer}>
                        <TextInput
                            label="Tarif par session (€)"
                            placeholder="50"
                            value={price?.toString() || ''}
                            onChangeText={(text) => {
                                const numValue = parseInt(text, 10);
                                if (!isNaN(numValue) || text === '') {
                                    onPriceChange?.(numValue || 0);
                                }
                            }}
                            keyboardType="numeric"
                        />
                        <Text style={styles.priceHint}>
                            Prix moyen : 40-80€/session
                        </Text>
                    </View>

                    <TextInput
                        label="Description (optionnel)"
                        placeholder="Décris ton style de jeu, ton expérience..."
                        value={description || ''}
                        onChangeText={(text) => onDescriptionChange?.(text)}
                        multiline
                        numberOfLines={3}
                        style={styles.descriptionInput}
                    />

                    <View style={styles.infoCard}>
                        <Text style={styles.infoTitle}>Avantages Mentor</Text>
                        <Text style={styles.infoText}>
                            • Apparais dans la recherche{'\n'}
                            • Reçois des demandes de réservation{'\n'}
                            • Gagne de l'argent en jouant
                        </Text>
                    </View>
                </View>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        backgroundColor: Colors.backgroundSecondary,
        borderRadius: BorderRadius.xl,
        padding: Spacing.lg,
        marginBottom: Spacing.md,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    headerText: {
        flex: 1,
    },
    title: {
        color: Colors.textPrimary,
        fontSize: FontSizes.lg,
        fontWeight: '600',
    },
    subtitle: {
        color: Colors.textSecondary,
        fontSize: FontSizes.sm,
        marginTop: Spacing.xs,
    },
    mentorFields: {
        marginTop: Spacing.lg,
        paddingTop: Spacing.lg,
        borderTopWidth: 1,
        borderTopColor: Colors.border,
    },
    priceContainer: {
        marginBottom: Spacing.sm,
    },
    priceHint: {
        color: Colors.textSecondary,
        fontSize: FontSizes.xs,
        marginTop: -Spacing.sm,
        marginBottom: Spacing.md,
    },
    descriptionInput: {
        minHeight: 80,
        textAlignVertical: 'top',
    },
    infoCard: {
        backgroundColor: Colors.background,
        borderRadius: BorderRadius.lg,
        padding: Spacing.md,
        marginTop: Spacing.sm,
        borderWidth: 1,
        borderColor: Colors.primary,
        borderStyle: 'dashed',
    },
    infoTitle: {
        color: Colors.primary,
        fontSize: FontSizes.sm,
        fontWeight: '600',
        marginBottom: Spacing.xs,
    },
    infoText: {
        color: Colors.textSecondary,
        fontSize: FontSizes.sm,
        lineHeight: 20,
    },
});
