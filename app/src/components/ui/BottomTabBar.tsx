import React from 'react';
import { View, TouchableOpacity, Text, StyleSheet } from 'react-native';
import { Colors, Spacing, FontSizes, BorderRadius } from '../../theme';

export type TabName = 'home' | 'marketplace' | 'profile';

interface BottomTabBarProps {
    activeTab: TabName;
    onTabPress: (tab: TabName) => void;
}

const tabs: { key: TabName; label: string; icon: string }[] = [
    { key: 'home', label: 'Accueil', icon: '🏠' },
    { key: 'marketplace', label: 'Marketplace', icon: '🔍' },
    { key: 'profile', label: 'Profil', icon: '👤' },
];

export default function BottomTabBar({ activeTab, onTabPress }: BottomTabBarProps) {
    return (
        <View style={styles.container}>
            {tabs.map((tab) => {
                const isActive = activeTab === tab.key;
                return (
                    <TouchableOpacity
                        key={tab.key}
                        style={[styles.tab, isActive && styles.tabActive]}
                        onPress={() => onTabPress(tab.key)}
                        activeOpacity={0.7}
                    >
                        <Text style={[styles.icon, isActive && styles.iconActive]}>
                            {tab.icon}
                        </Text>
                        <Text style={[styles.label, isActive && styles.labelActive]}>
                            {tab.label}
                        </Text>
                        {isActive && <View style={styles.indicator} />}
                    </TouchableOpacity>
                );
            })}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        backgroundColor: Colors.backgroundSecondary,
        borderTopWidth: 1,
        borderTopColor: Colors.border,
        paddingBottom: 16, // safe area
        paddingTop: Spacing.sm,
    },
    tab: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: Spacing.xs,
        position: 'relative',
    },
    tabActive: {},
    icon: {
        fontSize: 20,
        marginBottom: 2,
        opacity: 0.5,
    },
    iconActive: {
        opacity: 1,
    },
    label: {
        fontSize: FontSizes.xs,
        color: Colors.textSecondary,
        fontWeight: '500',
    },
    labelActive: {
        color: Colors.primary,
        fontWeight: '700',
    },
    indicator: {
        position: 'absolute',
        top: -Spacing.sm,
        width: 24,
        height: 3,
        borderRadius: 2,
        backgroundColor: Colors.primary,
    },
});
