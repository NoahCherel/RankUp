import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    Alert,
    KeyboardAvoidingView,
    Platform,
    TouchableOpacity,
} from 'react-native';
import { Colors, Spacing, FontSizes, BorderRadius } from '../theme';
import { Ionicons } from '@expo/vector-icons';
import { Button, TextInput, LoadingSpinner } from '../components';
import {
    AvatarPicker,
    NationalitySelector,
    PlayStyleSelector,
    LeagueSelector,
    MentorToggle,
} from '../components/profile';
import {
    getUserProfile,
    updateUserProfile,
    uploadProfilePhoto,
} from '../services/userService';
import { onboardMentor } from '../services/paymentService';
import { auth } from '../config/firebase';
import { UserProfile } from '../types';
import { useResponsive } from '../utils/responsive';

interface EditProfileScreenProps {
    onBack: () => void;
}

export default function EditProfileScreen({ onBack }: EditProfileScreenProps) {
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    // Profile data
    const [photoUri, setPhotoUri] = useState<string>('');
    const [originalPhotoUrl, setOriginalPhotoUrl] = useState<string>('');
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [age, setAge] = useState('');
    const [nationality, setNationality] = useState('FR');
    const [ranking, setRanking] = useState('');
    const [league, setLeague] = useState('');
    const [playStyle, setPlayStyle] = useState<'left' | 'right' | 'both'>('right');
    const [club, setClub] = useState('');
    const [isMentor, setIsMentor] = useState(false);
    const [mentorPrice, setMentorPrice] = useState(0);
    const [mentorDescription, setMentorDescription] = useState('');

    useEffect(() => {
        loadProfile();
    }, []);

    const loadProfile = async () => {
        const userId = auth.currentUser?.uid;
        if (!userId) return;

        try {
            const profile = await getUserProfile(userId);
            if (profile) {
                setOriginalPhotoUrl(profile.photoURL || '');
                setPhotoUri(profile.photoURL || '');
                setFirstName(profile.firstName || '');
                setLastName(profile.lastName || '');
                setAge(profile.age?.toString() || '');
                setNationality(profile.nationality || 'FR');
                setRanking(profile.ranking?.toString() || '');
                setLeague(profile.league || '');
                setPlayStyle(profile.playStyle || 'right');
                setClub(profile.club || '');
                setIsMentor(profile.isMentor || false);
                setMentorPrice(profile.mentorPrice || 0);
                setMentorDescription(profile.mentorDescription || '');
            }
        } catch (error) {
            Alert.alert('Erreur', 'Impossible de charger ton profil.');
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        const userId = auth.currentUser?.uid;
        if (!userId) return;

        setSaving(true);

        try {
            // Upload new photo if changed (non-blocking on web CORS errors)
            let photoURL = originalPhotoUrl;
            if (photoUri && photoUri !== originalPhotoUrl) {
                try {
                    photoURL = await uploadProfilePhoto(userId, photoUri);
                } catch (photoError) {
                    // Keep original photo URL, don't block profile save
                }
            }

            // Build update object without undefined values
            const profileUpdate: Record<string, any> = {
                firstName,
                lastName,
                nationality,
                league,
                playStyle,
                isMentor,
            };

            // Only include optional fields if they have values
            if (photoURL) profileUpdate.photoURL = photoURL;
            if (age) profileUpdate.age = parseInt(age, 10);
            if (ranking) profileUpdate.ranking = parseInt(ranking, 10);
            if (club) profileUpdate.club = club;
            if (isMentor) {
                profileUpdate.mentorPrice = mentorPrice;
                profileUpdate.mentorDescription = mentorDescription;
            }

            await updateUserProfile(userId, profileUpdate);

            Alert.alert('Profil mis à jour', 'Tes modifications ont été enregistrées.');
            onBack();
        } catch (error) {
            Alert.alert('Erreur', 'Impossible de sauvegarder ton profil.');
        } finally {
            setSaving(false);
        }
    };

    const { headerPaddingTop, contentStyle, isWeb, isWide } = useResponsive();

    if (loading) {
        return <LoadingSpinner fullScreen message="Chargement du profil..." />;
    }

    return (
        <KeyboardAvoidingView
            style={styles.container}
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
            {/* Header */}
            <View style={[styles.header, { paddingTop: headerPaddingTop }]}>
                <TouchableOpacity onPress={onBack} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={22} color={Colors.textPrimary} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Modifier mon profil</Text>
                <View style={styles.headerSpacer} />
            </View>

            <ScrollView
                contentContainerStyle={styles.content}
                keyboardShouldPersistTaps="handled"
            >
                {/* Avatar */}
                <View style={styles.avatarSection}>
                    <AvatarPicker
                        photoURL={photoUri}
                        firstName={firstName}
                        lastName={lastName}
                        onPhotoSelected={setPhotoUri}
                    />
                </View>

                {/* Personal Info */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Informations personnelles</Text>

                    <TextInput
                        label="Prénom"
                        value={firstName}
                        onChangeText={setFirstName}
                        autoCapitalize="words"
                    />

                    <TextInput
                        label="Nom"
                        value={lastName}
                        onChangeText={setLastName}
                        autoCapitalize="words"
                    />

                    <View style={styles.row}>
                        <View style={styles.halfInput}>
                            <TextInput
                                label="Âge"
                                value={age}
                                onChangeText={setAge}
                                keyboardType="numeric"
                            />
                        </View>
                        <View style={styles.halfInput}>
                            <NationalitySelector
                                value={nationality}
                                onChange={(code) => setNationality(code)}
                            />
                        </View>
                    </View>
                </View>

                {/* Padel Info */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Padel</Text>

                    <TextInput
                        label="Classement FFT"
                        value={ranking}
                        onChangeText={setRanking}
                        keyboardType="numeric"
                    />

                    <LeagueSelector
                        value={league}
                        onChange={setLeague}
                    />

                    <TextInput
                        label="Club"
                        value={club}
                        onChangeText={setClub}
                    />

                    <PlayStyleSelector
                        value={playStyle}
                        onChange={setPlayStyle}
                    />
                </View>

                {/* Mentor Section */}
                <View style={styles.section}>
                    <MentorToggle
                        isMentor={isMentor}
                        onToggle={setIsMentor}
                        price={mentorPrice}
                        onPriceChange={setMentorPrice}
                        description={mentorDescription}
                        onDescriptionChange={setMentorDescription}
                    />

                    {isMentor && (
                        <TouchableOpacity
                            style={styles.stripeButton}
                            onPress={async () => {
                                try {
                                    await onboardMentor();
                                } catch (e) {
                                    // Error handled in service
                                }
                            }}
                        >
                            <Text style={styles.stripeButtonText}>{'Configurer les virements (Stripe)'}</Text>
                        </TouchableOpacity>
                    )}
                </View>

                {/* Save Button */}
                <Button
                    title="Enregistrer"
                    onPress={handleSave}
                    loading={saving}
                    size="large"
                    style={styles.saveButton}
                />
            </ScrollView>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.background,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: Spacing.md,
        paddingTop: Spacing.xl,
        paddingBottom: Spacing.md,
        borderBottomWidth: 1,
        borderBottomColor: Colors.border,
    },
    backButton: {
        padding: Spacing.sm,
    },

    headerTitle: {
        color: Colors.textPrimary,
        fontSize: FontSizes.lg,
        fontWeight: '600',
    },
    headerSpacer: {
        width: 40,
    },
    content: {
        padding: Spacing.lg,
    },
    avatarSection: {
        alignItems: 'center',
        marginBottom: Spacing.xl,
    },
    section: {
        marginBottom: Spacing.lg,
    },
    sectionTitle: {
        color: Colors.textPrimary,
        fontSize: FontSizes.lg,
        fontWeight: '600',
        marginBottom: Spacing.md,
    },
    row: {
        flexDirection: 'row',
        gap: Spacing.md,
    },
    halfInput: {
        flex: 1,
    },
    saveButton: {
        marginTop: Spacing.xl,
        marginBottom: Spacing.xxl,
    },
    stripeButton: {
        marginTop: Spacing.md,
        padding: Spacing.md,
        backgroundColor: '#635BFF15', // Stripe blurple light
        borderRadius: BorderRadius.lg,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#635BFF',
    },
    stripeButtonText: {
        color: '#635BFF',
        fontWeight: '600',
        fontSize: FontSizes.sm,
    },
});

