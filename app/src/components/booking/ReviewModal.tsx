/**
 * ReviewModal — Modal to submit a star rating + optional comment.
 *
 * Displayed after a completed booking to collect feedback.
 */
import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    Modal,
    TouchableOpacity,
    TextInput,
    Alert,
    KeyboardAvoidingView,
    Platform,
    TouchableWithoutFeedback,
} from 'react-native';
import { Colors, Spacing, FontSizes, BorderRadius } from '../../theme';
import { Ionicons } from '@expo/vector-icons';

interface ReviewModalProps {
    visible: boolean;
    mentorName: string;
    onSubmit: (rating: number, comment: string) => Promise<void>;
    onClose: () => void;
}

export default function ReviewModal({ visible, mentorName, onSubmit, onClose }: ReviewModalProps) {
    const [rating, setRating] = useState(0);
    const [comment, setComment] = useState('');
    const [submitting, setSubmitting] = useState(false);

    const handleSubmit = async () => {
        if (rating === 0) {
            Alert.alert('Note requise', 'Veuillez sélectionner une note de 1 à 5 étoiles.');
            return;
        }

        setSubmitting(true);
        try {
            await onSubmit(rating, comment.trim());
            // Reset form
            setRating(0);
            setComment('');
        } catch (err: any) {
            Alert.alert('Erreur', err?.message || 'Impossible de soumettre l\'avis.');
        } finally {
            setSubmitting(false);
        }
    };

    const handleClose = () => {
        setRating(0);
        setComment('');
        onClose();
    };

    const ratingLabels = ['', 'Décevant', 'Peut mieux faire', 'Correct', 'Très bien', 'Excellent'];

    return (
        <Modal
            visible={visible}
            transparent
            animationType="fade"
            onRequestClose={handleClose}
        >
            <TouchableWithoutFeedback onPress={handleClose}>
                <View style={styles.overlay}>
                    <TouchableWithoutFeedback>
                        <KeyboardAvoidingView
                            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
                        >
                            <View style={styles.modal}>
                                {/* Close button */}
                                <TouchableOpacity style={styles.closeButton} onPress={handleClose}>
                                    <Ionicons name="close" size={22} color={Colors.textSecondary} />
                                </TouchableOpacity>

                                {/* Header */}
                                <View style={styles.headerSection}>
                                    <Ionicons name="star" size={32} color={Colors.primary} style={{ marginBottom: Spacing.sm }} />
                                    <Text style={styles.title}>{'Évaluer la session'}</Text>
                                    <Text style={styles.subtitle}>
                                        {'Comment s\'est passée votre session avec '}
                                        <Text style={styles.mentorName}>{mentorName}</Text>
                                        {' ?'}
                                    </Text>
                                </View>

                                {/* Stars */}
                                <View style={styles.starsRow}>
                                    {[1, 2, 3, 4, 5].map((star) => (
                                        <TouchableOpacity
                                            key={star}
                                            onPress={() => setRating(star)}
                                            activeOpacity={0.7}
                                            style={styles.starButton}
                                        >
                                            <Ionicons
                                                name={star <= rating ? 'star' : 'star-outline'}
                                                size={36}
                                                color={star <= rating ? Colors.primary : Colors.textSecondary}
                                            />
                                        </TouchableOpacity>
                                    ))}
                                </View>
                                {rating > 0 && (
                                    <Text style={styles.ratingLabel}>{ratingLabels[rating]}</Text>
                                )}

                                {/* Comment */}
                                <TextInput
                                    style={styles.commentInput}
                                    placeholder="Laissez un commentaire (optionnel)…"
                                    placeholderTextColor={Colors.textSecondary}
                                    value={comment}
                                    onChangeText={setComment}
                                    multiline
                                    maxLength={500}
                                    numberOfLines={3}
                                    textAlignVertical="top"
                                />

                                {/* Submit */}
                                <TouchableOpacity
                                    style={[styles.submitButton, rating === 0 && styles.submitButtonDisabled]}
                                    onPress={handleSubmit}
                                    disabled={rating === 0 || submitting}
                                    activeOpacity={0.8}
                                >
                                    <Text style={styles.submitButtonText}>
                                        {submitting ? 'Envoi en cours…' : 'Envoyer l\'avis'}
                                    </Text>
                                </TouchableOpacity>
                            </View>
                        </KeyboardAvoidingView>
                    </TouchableWithoutFeedback>
                </View>
            </TouchableWithoutFeedback>
        </Modal>
    );
}

// ---------------------------------------------------------------------------
// Styles
// ---------------------------------------------------------------------------

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.7)',
        justifyContent: 'center',
        alignItems: 'center',
        padding: Spacing.lg,
    },
    modal: {
        backgroundColor: Colors.backgroundSecondary,
        borderRadius: BorderRadius.xl,
        padding: Spacing.xl,
        width: '100%',
        maxWidth: 400,
        borderWidth: 1,
        borderColor: Colors.border,
    },
    closeButton: {
        position: 'absolute',
        top: Spacing.md,
        right: Spacing.md,
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: Colors.background,
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1,
    },

    headerSection: {
        alignItems: 'center',
        marginBottom: Spacing.lg,
    },
    title: {
        color: Colors.textPrimary,
        fontSize: FontSizes.xl,
        fontWeight: '800',
        marginBottom: Spacing.xs,
    },
    subtitle: {
        color: Colors.textSecondary,
        fontSize: FontSizes.sm,
        textAlign: 'center',
        lineHeight: 20,
    },
    mentorName: {
        color: Colors.primary,
        fontWeight: '700',
    },

    starsRow: {
        flexDirection: 'row',
        justifyContent: 'center',
        gap: Spacing.sm,
        marginBottom: Spacing.sm,
    },
    starButton: {
        padding: Spacing.xs,
    },
    ratingLabel: {
        color: Colors.primary,
        fontSize: FontSizes.sm,
        fontWeight: '600',
        textAlign: 'center',
        marginBottom: Spacing.md,
    },

    commentInput: {
        backgroundColor: Colors.background,
        borderRadius: BorderRadius.lg,
        padding: Spacing.md,
        color: Colors.textPrimary,
        fontSize: FontSizes.sm,
        minHeight: 80,
        borderWidth: 1,
        borderColor: Colors.border,
        marginBottom: Spacing.lg,
    },

    submitButton: {
        backgroundColor: Colors.primary,
        borderRadius: BorderRadius.lg,
        paddingVertical: Spacing.md,
        alignItems: 'center',
    },
    submitButtonDisabled: {
        opacity: 0.4,
    },
    submitButtonText: {
        color: Colors.background,
        fontSize: FontSizes.md,
        fontWeight: '700',
    },
});
