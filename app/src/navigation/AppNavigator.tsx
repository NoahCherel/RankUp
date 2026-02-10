import React, { useState, useEffect, useCallback } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { onAuthStateChanged, User } from 'firebase/auth';
import { auth } from '../config/firebase';
import { hasCompletedOnboarding } from '../services/userService';
import {
    AuthScreen,
    HomeScreen,
    OnboardingScreen,
    EditProfileScreen,
    MyProfileScreen,
    MarketplaceScreen,
    MentorDetailScreen,
} from '../screens';
import BottomTabBar, { TabName } from '../components/ui/BottomTabBar';
import { Colors } from '../theme';
import { ActivityIndicator, View, Text } from 'react-native';
import { UserProfile } from '../types';

export type RootStackParamList = {
    Auth: undefined;
    Onboarding: undefined;
    Main: undefined;
    Home: undefined;
    MyProfile: undefined;
    EditProfile: undefined;
    Marketplace: undefined;
    MentorDetail: { mentor: UserProfile };
};

const Stack = createNativeStackNavigator<RootStackParamList>();

// Main app with bottom tabs
function MainStack({ onNeedOnboarding }: { onNeedOnboarding: () => void }) {
    const [activeTab, setActiveTab] = useState<TabName>('home');
    const [activeScreen, setActiveScreen] = useState<string>('home');
    const [selectedMentor, setSelectedMentor] = useState<UserProfile | null>(null);

    const handleTabPress = (tab: TabName) => {
        setActiveTab(tab);
        setActiveScreen(tab);
        setSelectedMentor(null);
    };

    const handleMentorPress = (mentor: UserProfile) => {
        setSelectedMentor(mentor);
        setActiveScreen('mentorDetail');
    };

    const renderScreen = () => {
        switch (activeScreen) {
            case 'home':
                return (
                    <HomeScreen
                        onNavigateProfile={() => {
                            setActiveTab('profile');
                            setActiveScreen('profile');
                        }}
                    />
                );
            case 'marketplace':
                return (
                    <MarketplaceScreen
                        onMentorPress={handleMentorPress}
                    />
                );
            case 'mentorDetail':
                if (!selectedMentor) return null;
                return (
                    <MentorDetailScreen
                        mentor={selectedMentor}
                        onBack={() => {
                            setActiveScreen('marketplace');
                            setSelectedMentor(null);
                        }}
                    />
                );
            case 'profile':
                return (
                    <MyProfileScreen
                        onEditProfile={() => setActiveScreen('editProfile')}
                        onBack={() => {
                            setActiveTab('home');
                            setActiveScreen('home');
                        }}
                        onProfileNotFound={onNeedOnboarding}
                    />
                );
            case 'editProfile':
                return (
                    <EditProfileScreen
                        onBack={() => {
                            setActiveScreen('profile');
                            setActiveTab('profile');
                        }}
                    />
                );
            default:
                return <HomeScreen onNavigateProfile={() => setActiveScreen('profile')} />;
        }
    };

    // Hide tab bar on sub-screens (mentorDetail, editProfile)
    const showTabBar = ['home', 'marketplace', 'profile'].includes(activeScreen);

    return (
        <View style={{ flex: 1 }}>
            {renderScreen()}
            {showTabBar && (
                <BottomTabBar activeTab={activeTab} onTabPress={handleTabPress} />
            )}
        </View>
    );
}

export default function AppNavigator() {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const [needsOnboarding, setNeedsOnboarding] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const checkOnboarding = useCallback(async (userId: string) => {
        try {
            console.log('[Nav] Checking onboarding for:', userId);
            const completed = await hasCompletedOnboarding(userId);
            console.log('[Nav] Onboarding completed:', completed);
            setNeedsOnboarding(!completed);
            setError(null);
        } catch (err) {
            console.error('[Nav] Error checking onboarding:', err);
            setNeedsOnboarding(true);
            setError('Erreur de connexion Firestore');
        }
    }, []);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
            console.log('[Nav] Auth state changed:', currentUser?.email);
            setUser(currentUser);

            if (currentUser) {
                await checkOnboarding(currentUser.uid);
            } else {
                setNeedsOnboarding(false);
            }

            setLoading(false);
        });

        return unsubscribe;
    }, [checkOnboarding]);

    const handleOnboardingComplete = () => {
        console.log('[Nav] Onboarding complete');
        setNeedsOnboarding(false);
    };

    const handleNeedOnboarding = () => {
        console.log('[Nav] Profile not found, redirecting to onboarding');
        setNeedsOnboarding(true);
    };

    if (loading) {
        return (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: Colors.background }}>
                <ActivityIndicator size="large" color={Colors.primary} />
                <Text style={{ color: Colors.textSecondary, marginTop: 16 }}>
                    {'Chargement...'}
                </Text>
            </View>
        );
    }

    return (
        <NavigationContainer>
            <Stack.Navigator
                screenOptions={{
                    headerShown: false,
                    contentStyle: { backgroundColor: Colors.background },
                }}
            >
                {!user ? (
                    <Stack.Screen name="Auth" component={AuthScreen} />
                ) : needsOnboarding ? (
                    <Stack.Screen name="Onboarding">
                        {() => <OnboardingScreen onComplete={handleOnboardingComplete} />}
                    </Stack.Screen>
                ) : (
                    <Stack.Screen name="Main">
                        {() => <MainStack onNeedOnboarding={handleNeedOnboarding} />}
                    </Stack.Screen>
                )}
            </Stack.Navigator>
        </NavigationContainer>
    );
}
