import React from 'react';
import { View, TouchableOpacity, Text, StyleSheet, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Spacing, FontSizes } from '../../theme';

export type TabName = 'home' | 'marketplace' | 'bookings' | 'profile';

interface BottomTabBarProps {
    activeTab: TabName;
    onTabPress: (tab: TabName) => void;
}

const tabs: { key: TabName; label: string; icon: keyof typeof Ionicons.glyphMap; iconActive: keyof typeof Ionicons.glyphMap }[] = [
    { key: 'home', label: 'Accueil', icon: 'home-outline', iconActive: 'home' },
    { key: 'marketplace', label: 'Explorer', icon: 'search-outline', iconActive: 'search' },
    { key: 'bookings', label: 'Sessions', icon: 'calendar-outline', iconActive: 'calendar' },
    { key: 'profile', label: 'Profil', icon: 'person-outline', iconActive: 'person' },
];

export default function BottomTabBar({ activeTab, onTabPress }: BottomTabBarProps) {
    return (
        <View style={styles.container}>
            {tabs.map((tab) => {
                const isActive = activeTab === tab.key;
                return (
                    <TouchableOpacity
                        key={tab.key}
                        style={styles.tab}
                        onPress={() => onTabPress(tab.key)}
                        activeOpacity={0.7}
                    >
                        <View style={[styles.iconWrap, isActive && styles.iconWrapActive]}>
                            <Ionicons
                                name={isActive ? tab.iconActive : tab.icon}
                                size={22}
                                color={isActive ? Colors.primary : Colors.textSecondary}
                            />
                        </View>
                        <Text style={[styles.label, isActive && styles.labelActive]}>
                            {tab.label}
                        </Text>
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
        paddingBottom: Platform.OS === 'ios' ? 24 : 10,
        paddingTop: Spacing.sm,
    },
    tab: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: Spacing.xs,
    },
    iconWrap: {
        width: 36,
        height: 28,
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 14,
        marginBottom: 2,
    },
    iconWrapActive: {
        backgroundColor: 'rgba(234, 179, 8, 0.12)',
    },
    label: {
        fontSize: 11,
        color: Colors.textSecondary,
        fontWeight: '500',
    },
    labelActive: {
        color: Colors.primary,
        fontWeight: '600',
    },
});
