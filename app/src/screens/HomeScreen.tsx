import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { signOut } from 'firebase/auth';
import { auth } from '../config/firebase';
import { Colors, Spacing, FontSizes, BorderRadius } from '../theme';

export default function HomeScreen() {
    const user = auth.currentUser;

    const handleLogout = async () => {
        try {
            await signOut(auth);
        } catch (error) {
            console.error('Logout error:', error);
        }
    };

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.greeting}>Salut ! 👋</Text>
                <Text style={styles.email}>{user?.email}</Text>
            </View>

            <View style={styles.content}>
                <Text style={styles.title}>Bienvenue sur RankUp</Text>
                <Text style={styles.subtitle}>
                    La marketplace des partenaires de Padel
                </Text>

                <View style={styles.placeholder}>
                    <Text style={styles.placeholderText}>
                        🎾 Marketplace à venir...
                    </Text>
                </View>
            </View>

            <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
                <Text style={styles.logoutText}>Se déconnecter</Text>
            </TouchableOpacity>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.background,
        paddingHorizontal: Spacing.lg,
        paddingTop: Spacing.xxl,
    },
    header: {
        marginBottom: Spacing.xl,
    },
    greeting: {
        fontSize: FontSizes.xl,
        fontWeight: 'bold',
        color: Colors.textPrimary,
    },
    email: {
        fontSize: FontSizes.sm,
        color: Colors.textSecondary,
        marginTop: Spacing.xs,
    },
    content: {
        flex: 1,
    },
    title: {
        fontSize: FontSizes.xxl,
        fontWeight: 'bold',
        color: Colors.primary,
        marginBottom: Spacing.sm,
    },
    subtitle: {
        fontSize: FontSizes.md,
        color: Colors.textSecondary,
        marginBottom: Spacing.xl,
    },
    placeholder: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: Colors.backgroundSecondary,
        borderRadius: BorderRadius.xl,
        marginVertical: Spacing.lg,
    },
    placeholderText: {
        fontSize: FontSizes.lg,
        color: Colors.textSecondary,
    },
    logoutButton: {
        backgroundColor: Colors.backgroundSecondary,
        borderRadius: BorderRadius.lg,
        paddingVertical: Spacing.md,
        alignItems: 'center',
        marginBottom: Spacing.xl,
        borderWidth: 1,
        borderColor: Colors.border,
    },
    logoutText: {
        color: Colors.error,
        fontSize: FontSizes.md,
        fontWeight: '500',
    },
});
