import React, { useEffect } from 'react';
import { View, Text, StyleSheet, Animated, Easing } from 'react-native';
import { Colors, FontSizes, Spacing } from '../theme';

interface SplashScreenProps {
    onComplete?: () => void;
}

export default function SplashScreen({ onComplete }: SplashScreenProps) {
    const fadeAnim = new Animated.Value(0);
    const scaleAnim = new Animated.Value(0.8);

    useEffect(() => {
        // Fade in and scale up animation
        Animated.parallel([
            Animated.timing(fadeAnim, {
                toValue: 1,
                duration: 800,
                useNativeDriver: true,
                easing: Easing.out(Easing.ease),
            }),
            Animated.spring(scaleAnim, {
                toValue: 1,
                tension: 50,
                friction: 7,
                useNativeDriver: true,
            }),
        ]).start();

        // Auto-complete after animation
        const timer = setTimeout(() => {
            onComplete?.();
        }, 2000);

        return () => clearTimeout(timer);
    }, []);

    return (
        <View style={styles.container}>
            <Animated.View
                style={[
                    styles.content,
                    {
                        opacity: fadeAnim,
                        transform: [{ scale: scaleAnim }],
                    },
                ]}
            >
                <Text style={styles.icon}>⚡</Text>
                <Text style={styles.logo}>RankUp</Text>
                <Text style={styles.tagline}>Elevate your game. Together.</Text>
            </Animated.View>

            <Text style={styles.version}>v1.0.0 - MVP</Text>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.background,
        alignItems: 'center',
        justifyContent: 'center',
    },
    content: {
        alignItems: 'center',
    },
    icon: {
        fontSize: 64,
        marginBottom: Spacing.md,
    },
    logo: {
        fontSize: FontSizes.xxl * 1.5,
        fontWeight: 'bold',
        color: Colors.primary,
        letterSpacing: 2,
    },
    tagline: {
        fontSize: FontSizes.md,
        color: Colors.textSecondary,
        marginTop: Spacing.sm,
        fontStyle: 'italic',
    },
    version: {
        position: 'absolute',
        bottom: Spacing.xl,
        color: Colors.textSecondary,
        fontSize: FontSizes.xs,
    },
});
