import React from 'react';
import { View, TouchableOpacity, Pressable, Text, StyleSheet, Platform } from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { Colors, Spacing, FontSizes, BorderRadius } from '../../theme';

export type TabName = 'home' | 'marketplace' | 'messages' | 'bookings' | 'profile';

interface BottomTabBarProps {
    activeTab: TabName;
    onTabPress: (tab: TabName) => void;
}

const tabs: { key: TabName; label: string; icon: keyof typeof Ionicons.glyphMap; iconActive: keyof typeof Ionicons.glyphMap }[] = [
    { key: 'home', label: 'Accueil', icon: 'home-outline', iconActive: 'home' },
    { key: 'marketplace', label: 'Explorer', icon: 'search-outline', iconActive: 'search' },
    { key: 'messages', label: 'Messages', icon: 'chatbubbles-outline', iconActive: 'chatbubbles' },
    { key: 'bookings', label: 'Sessions', icon: 'calendar-outline', iconActive: 'calendar' },
    { key: 'profile', label: 'Profil', icon: 'person-outline', iconActive: 'person' },
];

function WebSidebar({ activeTab, onTabPress }: BottomTabBarProps) {
    return (
        <View style={sidebarStyles.container}>
            {/* Logo */}
            <View style={sidebarStyles.logoSection}>
                <MaterialCommunityIcons name="lightning-bolt" size={24} color={Colors.primary} />
                <Text style={sidebarStyles.logoText}>RankUp</Text>
            </View>

            {/* Nav items */}
            <View style={sidebarStyles.navSection}>
                {tabs.map((tab) => {
                    const isActive = activeTab === tab.key;
                    return (
                        <Pressable
                            key={tab.key}
                            style={({ hovered }: any) => [
                                sidebarStyles.navItem,
                                isActive && sidebarStyles.navItemActive,
                                hovered && !isActive && sidebarStyles.navItemHovered,
                                { cursor: 'pointer' } as any,
                            ]}
                            onPress={() => onTabPress(tab.key)}
                            accessibilityRole="tab"
                            accessibilityLabel={tab.label}
                        >
                            <Ionicons
                                name={isActive ? tab.iconActive : tab.icon}
                                size={20}
                                color={isActive ? Colors.primary : Colors.textSecondary}
                            />
                            <Text style={[
                                sidebarStyles.navLabel,
                                isActive && sidebarStyles.navLabelActive,
                            ]}>
                                {tab.label}
                            </Text>
                        </Pressable>
                    );
                })}
            </View>
        </View>
    );
}

export default function BottomTabBar({ activeTab, onTabPress }: BottomTabBarProps) {
    if (Platform.OS === 'web') {
        return <WebSidebar activeTab={activeTab} onTabPress={onTabPress} />;
    }

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

// Mobile bottom tab bar styles
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

// Web sidebar styles
const sidebarStyles = StyleSheet.create({
    container: {
        width: 220,
        backgroundColor: Colors.backgroundSecondary,
        borderRightWidth: 1,
        borderRightColor: Colors.border,
        paddingVertical: Spacing.lg,
        paddingHorizontal: Spacing.sm,
    },
    logoSection: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        paddingHorizontal: Spacing.md,
        paddingBottom: Spacing.xl,
        borderBottomWidth: 1,
        borderBottomColor: Colors.border,
        marginBottom: Spacing.md,
    },
    logoText: {
        fontSize: FontSizes.xl,
        fontWeight: '800',
        color: Colors.primary,
        letterSpacing: 0.5,
    },
    navSection: {
        gap: 4,
    },
    navItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: Spacing.sm,
        paddingVertical: Spacing.sm + 2,
        paddingHorizontal: Spacing.md,
        borderRadius: BorderRadius.lg,
    },
    navItemActive: {
        backgroundColor: 'rgba(234, 179, 8, 0.12)',
    },
    navItemHovered: {
        backgroundColor: 'rgba(234, 179, 8, 0.06)',
    },
    navLabel: {
        fontSize: FontSizes.md,
        color: Colors.textSecondary,
        fontWeight: '500',
    },
    navLabelActive: {
        color: Colors.primary,
        fontWeight: '600',
    },
});
