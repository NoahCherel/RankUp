/**
 * WebLayout — Full-width web wrapper.
 * On mobile (iOS/Android), renders children directly with no wrapper.
 * On web, provides a full-screen dark background with no constraints.
 */
import React from 'react';
import { View, StyleSheet, Platform } from 'react-native';
import { Colors } from '../../theme';

interface WebLayoutProps {
    children: React.ReactNode;
}

export default function WebLayout({ children }: WebLayoutProps) {
    if (Platform.OS !== 'web') {
        return <>{children}</>;
    }

    return (
        <View style={styles.webRoot}>
            {children}
        </View>
    );
}

const styles = StyleSheet.create({
    webRoot: {
        flex: 1,
        backgroundColor: Colors.background,
        minHeight: '100%' as any,
    },
});
