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
} from '../screens';
import { Colors } from '../theme';
import { ActivityIndicator, View, Text } from 'react-native';

export type RootStackParamList = {
    Auth: undefined;
    Onboarding: undefined;
    Main: undefined;
    Home: undefined;
    MyProfile: undefined;
    EditProfile: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

// Main Tab Navigator (will be replaced with proper tabs in US#3)
function MainStack({ onNeedOnboarding }: { onNeedOnboarding: () => void }) {
    const [activeScreen, setActiveScreen] = useState<'home' | 'profile' | 'editProfile'>('home');

    if (activeScreen === 'editProfile') {
        return <EditProfileScreen onBack={() => setActiveScreen('profile')} />;
    }

    if (activeScreen === 'profile') {
        return (
            <MyProfileScreen
                onEditProfile={() => setActiveScreen('editProfile')}
                onBack={() => setActiveScreen('home')}
                onProfileNotFound={onNeedOnboarding}
            />
        );
    }

    return <HomeScreen onNavigateProfile={() => setActiveScreen('profile')} />;
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
            // If Firestore fails, assume onboarding needed
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
                    Chargement...
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
