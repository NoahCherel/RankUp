import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    Alert,
    KeyboardAvoidingView,
    Platform,
} from 'react-native';
import { Colors, Spacing, FontSizes, BorderRadius } from '../theme';
import { Button, TextInput } from '../components';
import {
    AvatarPicker,
    NationalitySelector,
    PlayStyleSelector,
    LeagueSelector,
} from '../components/profile';
import { createUserProfile, uploadProfilePhoto } from '../services/userService';
import { auth } from '../config/firebase';
import { isValidName, isValidAge } from '../utils/validation';

interface OnboardingScreenProps {
    onComplete: () => void;
}

type Step = 1 | 2 | 3;

export default function OnboardingScreen({ onComplete }: OnboardingScreenProps) {
    const [step, setStep] = useState<Step>(1);
    const [loading, setLoading] = useState(false);

    // Step 1: Basic Info
    const [photoUri, setPhotoUri] = useState<string>('');
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [age, setAge] = useState('');
    const [nationality, setNationality] = useState('FR');

    // Step 2: Padel Info
    const [ranking, setRanking] = useState('');
    const [league, setLeague] = useState('');
    const [playStyle, setPlayStyle] = useState<'left' | 'right' | 'both'>('right');
    const [club, setClub] = useState('');

    // Errors
    const [errors, setErrors] = useState<Record<string, string>>({});

    const validateStep1 = (): boolean => {
        const newErrors: Record<string, string> = {};

        if (!firstName || !isValidName(firstName)) {
            newErrors.firstName = 'Prénom requis (min. 2 caractères)';
        }
        if (!lastName || !isValidName(lastName)) {
            newErrors.lastName = 'Nom requis (min. 2 caractères)';
        }
        if (age && !isValidAge(parseInt(age, 10))) {
            newErrors.age = 'Âge invalide (16-100 ans)';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const validateStep2 = (): boolean => {
        const newErrors: Record<string, string> = {};

        if (!league) {
            newErrors.league = 'Sélectionne ta ligue';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleNext = () => {
        if (step === 1 && validateStep1()) {
            setStep(2);
        } else if (step === 2 && validateStep2()) {
            setStep(3);
        }
    };

    const handleBack = () => {
        if (step > 1) {
            setStep((step - 1) as Step);
        }
    };

    const handleComplete = async () => {
        const userId = auth.currentUser?.uid;
        if (!userId) {
            Alert.alert('Erreur', 'Session expirée. Reconnecte-toi.');
            return;
        }

        setLoading(true);

        try {
            // Upload photo if selected
            let photoURL = '';
            if (photoUri) {
                photoURL = await uploadProfilePhoto(userId, photoUri);
            }

            // Create profile
            await createUserProfile(userId, {
                firstName,
                lastName,
                age: age ? parseInt(age, 10) : undefined,
                nationality,
                ranking: ranking ? parseInt(ranking, 10) : undefined,
                league,
                playStyle,
                club: club || undefined,
                photoURL: photoURL || undefined,
            });

            onComplete();
        } catch (error) {
            console.error('Onboarding error:', error);
            Alert.alert('Erreur', 'Impossible de créer ton profil. Réessaie.');
        } finally {
            setLoading(false);
        }
    };

    const renderStepIndicator = () => (
        <View style={styles.stepIndicator}>
            {[1, 2, 3].map((s) => (
                <View
                    key={s}
                    style={[
                        styles.stepDot,
                        s === step && styles.stepDotActive,
                        s < step && styles.stepDotCompleted,
                    ]}
                >
                    {s < step && <Text style={styles.stepCheck}>✓</Text>}
                </View>
            ))}
        </View>
    );

    const renderStep1 = () => (
        <>
            <Text style={styles.stepTitle}>Qui es-tu ?</Text>
            <Text style={styles.stepSubtitle}>
                Présente-toi à la communauté RankUp
            </Text>

            <View style={styles.avatarContainer}>
                <AvatarPicker
                    photoURL={photoUri}
                    firstName={firstName}
                    lastName={lastName}
                    onPhotoSelected={setPhotoUri}
                />
            </View>

            <TextInput
                label="Prénom"
                placeholder="Ton prénom"
                value={firstName}
                onChangeText={setFirstName}
                error={errors.firstName}
                autoCapitalize="words"
            />

            <TextInput
                label="Nom"
                placeholder="Ton nom"
                value={lastName}
                onChangeText={setLastName}
                error={errors.lastName}
                autoCapitalize="words"
            />

            <View style={styles.row}>
                <View style={styles.halfInput}>
                    <TextInput
                        label="Âge"
                        placeholder="25"
                        value={age}
                        onChangeText={setAge}
                        keyboardType="numeric"
                        error={errors.age}
                    />
                </View>
                <View style={styles.halfInput}>
                    <NationalitySelector
                        value={nationality}
                        onChange={(code) => setNationality(code)}
                    />
                </View>
            </View>
        </>
    );

    const renderStep2 = () => (
        <>
            <Text style={styles.stepTitle}>Ton niveau Padel</Text>
            <Text style={styles.stepSubtitle}>
                Ces infos aident à trouver le partenaire idéal
            </Text>

            <TextInput
                label="Classement FFT (optionnel)"
                placeholder="Ex: 1250"
                value={ranking}
                onChangeText={setRanking}
                keyboardType="numeric"
            />

            <LeagueSelector
                value={league}
                onChange={setLeague}
                error={errors.league}
            />

            <TextInput
                label="Club (optionnel)"
                placeholder="Nom de ton club"
                value={club}
                onChangeText={setClub}
            />

            <PlayStyleSelector
                value={playStyle}
                onChange={setPlayStyle}
            />
        </>
    );

    const renderStep3 = () => (
        <>
            <Text style={styles.stepTitle}>C'est parti !</Text>
            <Text style={styles.stepSubtitle}>
                Ton profil est presque prêt
            </Text>

            <View style={styles.summaryCard}>
                <View style={styles.summaryRow}>
                    <AvatarPicker
                        photoURL={photoUri}
                        firstName={firstName}
                        lastName={lastName}
                        size={80}
                        editable={false}
                    />
                    <View style={styles.summaryInfo}>
                        <Text style={styles.summaryName}>
                            {firstName} {lastName}
                        </Text>
                        <Text style={styles.summaryDetail}>
                            {age ? `${age} ans` : ''}
                            {age && nationality ? ' • ' : ''}
                            {nationality}
                        </Text>
                        {ranking ? (
                            <Text style={styles.summaryRanking}>
                                #{ranking}
                            </Text>
                        ) : null}
                    </View>
                </View>

                <View style={styles.summaryTags}>
                    <View style={styles.tag}>
                        <Text style={styles.tagText}>{league}</Text>
                    </View>
                    <View style={styles.tag}>
                        <Text style={styles.tagText}>
                            {playStyle === 'left' ? 'Gauche' : playStyle === 'right' ? 'Droite' : 'Polyvalent'}
                        </Text>
                    </View>
                    {club && (
                        <View style={styles.tag}>
                            <Text style={styles.tagText}>{club}</Text>
                        </View>
                    )}
                </View>
            </View>

            <Text style={styles.readyText}>
                Tu pourras modifier ton profil et activer le mode Mentor plus tard.
            </Text>
        </>
    );

    return (
        <KeyboardAvoidingView
            style={styles.container}
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
            <ScrollView
                contentContainerStyle={styles.content}
                keyboardShouldPersistTaps="handled"
            >
                {renderStepIndicator()}

                {step === 1 && renderStep1()}
                {step === 2 && renderStep2()}
                {step === 3 && renderStep3()}

                <View style={styles.buttons}>
                    {step > 1 && (
                        <Button
                            title="Retour"
                            onPress={handleBack}
                            variant="outline"
                            style={styles.backButton}
                        />
                    )}

                    {step < 3 ? (
                        <Button
                            title="Continuer"
                            onPress={handleNext}
                            style={styles.nextButton}
                        />
                    ) : (
                        <Button
                            title="Entrer dans l'arène"
                            onPress={handleComplete}
                            loading={loading}
                            style={styles.nextButton}
                        />
                    )}
                </View>
            </ScrollView>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.background,
    },
    content: {
        flexGrow: 1,
        padding: Spacing.lg,
        paddingTop: Spacing.xxl,
    },
    stepIndicator: {
        flexDirection: 'row',
        justifyContent: 'center',
        gap: Spacing.md,
        marginBottom: Spacing.xl,
    },
    stepDot: {
        width: 12,
        height: 12,
        borderRadius: 6,
        backgroundColor: Colors.border,
        alignItems: 'center',
        justifyContent: 'center',
    },
    stepDotActive: {
        backgroundColor: Colors.primary,
        width: 24,
    },
    stepDotCompleted: {
        backgroundColor: Colors.success,
    },
    stepCheck: {
        color: Colors.background,
        fontSize: 8,
        fontWeight: 'bold',
    },
    stepTitle: {
        fontSize: FontSizes.xxl,
        fontWeight: 'bold',
        color: Colors.textPrimary,
        textAlign: 'center',
        marginBottom: Spacing.xs,
    },
    stepSubtitle: {
        fontSize: FontSizes.md,
        color: Colors.textSecondary,
        textAlign: 'center',
        marginBottom: Spacing.xl,
    },
    avatarContainer: {
        alignItems: 'center',
        marginBottom: Spacing.lg,
    },
    row: {
        flexDirection: 'row',
        gap: Spacing.md,
    },
    halfInput: {
        flex: 1,
    },
    summaryCard: {
        backgroundColor: Colors.backgroundSecondary,
        borderRadius: BorderRadius.xl,
        padding: Spacing.lg,
        marginBottom: Spacing.lg,
    },
    summaryRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: Spacing.md,
    },
    summaryInfo: {
        marginLeft: Spacing.lg,
        flex: 1,
    },
    summaryName: {
        fontSize: FontSizes.xl,
        fontWeight: 'bold',
        color: Colors.textPrimary,
    },
    summaryDetail: {
        fontSize: FontSizes.sm,
        color: Colors.textSecondary,
        marginTop: Spacing.xs,
    },
    summaryRanking: {
        fontSize: FontSizes.lg,
        fontWeight: 'bold',
        color: Colors.primary,
        marginTop: Spacing.xs,
    },
    summaryTags: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: Spacing.sm,
    },
    tag: {
        backgroundColor: Colors.background,
        paddingHorizontal: Spacing.md,
        paddingVertical: Spacing.xs,
        borderRadius: BorderRadius.full,
    },
    tagText: {
        color: Colors.textSecondary,
        fontSize: FontSizes.sm,
    },
    readyText: {
        fontSize: FontSizes.sm,
        color: Colors.textSecondary,
        textAlign: 'center',
        lineHeight: 20,
    },
    buttons: {
        flexDirection: 'row',
        marginTop: Spacing.xl,
        gap: Spacing.md,
    },
    backButton: {
        flex: 1,
    },
    nextButton: {
        flex: 2,
    },
});
