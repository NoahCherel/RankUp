import React from 'react';
import { View, ActivityIndicator, StyleSheet, Text } from 'react-native';
import { Colors, FontSizes, Spacing } from '../../theme';

interface LoadingSpinnerProps {
    size?: 'small' | 'large';
    message?: string;
    fullScreen?: boolean;
}

export default function LoadingSpinner({
    size = 'large',
    message,
    fullScreen = false,
}: LoadingSpinnerProps) {
    const content = (
        <View style={[styles.container, fullScreen && styles.fullScreen]}>
            <ActivityIndicator size={size} color={Colors.primary} />
            {message && <Text style={styles.message}>{message}</Text>}
        </View>
    );

    if (fullScreen) {
        return <View style={styles.overlay}>{content}</View>;
    }

    return content;
}

const styles = StyleSheet.create({
    container: {
        alignItems: 'center',
        justifyContent: 'center',
        padding: Spacing.lg,
    },
    fullScreen: {
        flex: 1,
    },
    overlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: Colors.background,
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 999,
    },
    message: {
        color: Colors.textSecondary,
        fontSize: FontSizes.sm,
        marginTop: Spacing.md,
    },
});
