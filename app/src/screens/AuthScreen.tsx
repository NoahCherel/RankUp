import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    KeyboardAvoidingView,
    Platform,
    Alert,
    ScrollView,
    TouchableOpacity,
} from 'react-native';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../config/firebase';
import { Colors, Spacing, FontSizes, BorderRadius } from '../theme';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Button, TextInput } from '../components';
import { validateLoginForm, getFieldError } from '../utils/validation';
import { useResponsive } from '../utils/responsive';

type AuthMode = 'login' | 'signup';

export default function AuthScreen() {
    const [mode, setMode] = useState<AuthMode>('login');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState<{ field: string; message: string }[]>([]);

    const { headerPaddingTop, contentStyle, isWeb, isWide } = useResponsive();

    const handleAuth = async () => {
        // Validate form
        const validationErrors = validateLoginForm({ email, password });

        if (mode === 'signup' && password !== confirmPassword) {
            validationErrors.push({
                field: 'confirmPassword',
                message: 'Les mots de passe ne correspondent pas'
            });
        }

        if (validationErrors.length > 0) {
            setErrors(validationErrors);
            return;
        }

        setErrors([]);
        setLoading(true);

        try {
            if (mode === 'login') {
                await signInWithEmailAndPassword(auth, email, password);
            } else {
                await createUserWithEmailAndPassword(auth, email, password);
            }
        } catch (error: any) {
            let message = 'Une erreur est survenue';

            switch (error.code) {
                case 'auth/invalid-email':
                    message = 'Email invalide';
                    break;
                case 'auth/user-not-found':
                    message = 'Aucun compte associé à cet email';
                    break;
                case 'auth/wrong-password':
                    message = 'Mot de passe incorrect';
                    break;
                case 'auth/email-already-in-use':
                    message = 'Cet email est déjà utilisé';
                    break;
                case 'auth/weak-password':
                    message = 'Mot de passe trop faible (min. 6 caractères)';
                    break;
                case 'auth/too-many-requests':
                    message = 'Trop de tentatives. Réessayez plus tard.';
                    break;
                case 'auth/network-request-failed':
                    message = 'Erreur réseau. Vérifiez votre connexion.';
                    break;
            }

            Alert.alert('Erreur', message);
        } finally {
            setLoading(false);
        }
    };

    const toggleMode = () => {
        setMode(mode === 'login' ? 'signup' : 'login');
        setErrors([]);
        setConfirmPassword('');
    };

    return (
        <KeyboardAvoidingView
            style={styles.container}
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
            <ScrollView
                contentContainerStyle={[styles.scrollContent, isWeb && { maxWidth: 480, width: '100%' as any, alignSelf: 'center' as any }]}
                keyboardShouldPersistTaps="handled"
            >
                {/* Header */}
                <View style={styles.header}>
                    <MaterialCommunityIcons name="lightning-bolt" size={40} color={Colors.primary} />
                    <Text style={styles.logo}>RankUp</Text>
                    <Text style={styles.subtitle}>
                        {mode === 'login'
                            ? 'Bienvenue sur le court'
                            : 'Rejoins la communauté'}
                    </Text>
                </View>

                {/* Form */}
                <View style={styles.form}>
                    <TextInput
                        label="Email"
                        placeholder="ton.email@exemple.com"
                        value={email}
                        onChangeText={(text) => {
                            setEmail(text);
                            setErrors(errors.filter(e => e.field !== 'email'));
                        }}
                        keyboardType="email-address"
                        autoCapitalize="none"
                        autoComplete="email"
                        error={getFieldError(errors, 'email')}
                    />

                    <TextInput
                        label="Mot de passe"
                        placeholder="••••••••"
                        value={password}
                        onChangeText={(text) => {
                            setPassword(text);
                            setErrors(errors.filter(e => e.field !== 'password'));
                        }}
                        isPassword
                        autoComplete="password"
                        error={getFieldError(errors, 'password')}
                    />

                    {mode === 'signup' && (
                        <TextInput
                            label="Confirmer le mot de passe"
                            placeholder="••••••••"
                            value={confirmPassword}
                            onChangeText={(text) => {
                                setConfirmPassword(text);
                                setErrors(errors.filter(e => e.field !== 'confirmPassword'));
                            }}
                            isPassword
                            error={getFieldError(errors, 'confirmPassword')}
                        />
                    )}

                    <Button
                        title={mode === 'login' ? 'Se connecter' : "Créer mon compte"}
                        onPress={handleAuth}
                        loading={loading}
                        size="large"
                        style={styles.submitButton}
                    />
                </View>

                {/* Divider */}
                <View style={styles.divider}>
                    <View style={styles.dividerLine} />
                    <Text style={styles.dividerText}>ou</Text>
                    <View style={styles.dividerLine} />
                </View>

                {/* Social Login (placeholder) */}
                <View style={styles.socialButtons}>
                    <Button
                        title="Continuer avec Apple"
                        onPress={() => Alert.alert('Info', 'Apple Sign-In sera disponible prochainement')}
                        variant="outline"
                        style={styles.socialButton}
                    />
                    <Button
                        title="Continuer avec Google"
                        onPress={() => Alert.alert('Info', 'Google Sign-In sera disponible prochainement')}
                        variant="outline"
                        style={styles.socialButton}
                    />
                </View>

                {/* Toggle Mode */}
                <TouchableOpacity onPress={toggleMode} style={styles.toggleContainer}>
                    <Text style={styles.toggleText}>
                        {mode === 'login'
                            ? "Pas encore de compte ? "
                            : 'Déjà un compte ? '}
                        <Text style={styles.toggleAction}>
                            {mode === 'login' ? "S'inscrire" : 'Se connecter'}
                        </Text>
                    </Text>
                </TouchableOpacity>
            </ScrollView>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.background,
    },
    scrollContent: {
        flexGrow: 1,
        justifyContent: 'center',
        paddingHorizontal: Spacing.lg,
        paddingVertical: Spacing.xl,
    },
    header: {
        alignItems: 'center',
        marginBottom: Spacing.xl,
    },
    icon: {
        fontSize: 48,
        marginBottom: Spacing.sm,
    },
    logo: {
        fontSize: FontSizes.xxl,
        fontWeight: 'bold',
        color: Colors.primary,
        letterSpacing: 1,
    },
    subtitle: {
        fontSize: FontSizes.md,
        color: Colors.textSecondary,
        marginTop: Spacing.xs,
    },
    form: {
        marginBottom: Spacing.lg,
    },
    submitButton: {
        marginTop: Spacing.md,
    },
    divider: {
        flexDirection: 'row',
        alignItems: 'center',
        marginVertical: Spacing.lg,
    },
    dividerLine: {
        flex: 1,
        height: 1,
        backgroundColor: Colors.border,
    },
    dividerText: {
        color: Colors.textSecondary,
        paddingHorizontal: Spacing.md,
        fontSize: FontSizes.sm,
    },
    socialButtons: {
        gap: Spacing.sm,
    },
    socialButton: {
        marginBottom: Spacing.sm,
    },
    toggleContainer: {
        marginTop: Spacing.xl,
        alignItems: 'center',
    },
    toggleText: {
        color: Colors.textSecondary,
        fontSize: FontSizes.sm,
    },
    toggleAction: {
        color: Colors.secondary,
        fontWeight: '600',
    },
});
