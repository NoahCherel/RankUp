import React, { useState, useCallback } from 'react';
import { View, TextInput as RNTextInput, StyleSheet, TouchableOpacity, Text } from 'react-native';
import { Colors, Spacing, FontSizes, BorderRadius } from '../../theme';

interface SearchBarProps {
    value: string;
    onChangeText: (text: string) => void;
    placeholder?: string;
}

export default function SearchBar({ value, onChangeText, placeholder = 'Rechercher un mentor...' }: SearchBarProps) {
    return (
        <View style={styles.container}>
            <Text style={styles.icon}>{'🔍'}</Text>
            <RNTextInput
                style={styles.input}
                value={value}
                onChangeText={onChangeText}
                placeholder={placeholder}
                placeholderTextColor={Colors.textSecondary}
                returnKeyType="search"
                autoCorrect={false}
                autoCapitalize="none"
            />
            {value.length > 0 && (
                <TouchableOpacity onPress={() => onChangeText('')} style={styles.clearButton}>
                    <Text style={styles.clearText}>{'✕'}</Text>
                </TouchableOpacity>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: Colors.backgroundSecondary,
        borderRadius: BorderRadius.xl,
        paddingHorizontal: Spacing.md,
        height: 48,
        borderWidth: 1,
        borderColor: Colors.border,
    },
    icon: {
        fontSize: FontSizes.md,
        marginRight: Spacing.sm,
    },
    input: {
        flex: 1,
        color: Colors.textPrimary,
        fontSize: FontSizes.md,
        height: '100%',
    },
    clearButton: {
        width: 28,
        height: 28,
        borderRadius: 14,
        backgroundColor: Colors.border,
        alignItems: 'center',
        justifyContent: 'center',
    },
    clearText: {
        color: Colors.textSecondary,
        fontSize: FontSizes.xs,
        fontWeight: '600',
    },
});
