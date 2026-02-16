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
    BookingScreen,
    BookingsListScreen,
    MentorBookingsScreen,
    BookingDetailScreen,
    ConversationsListScreen,
    ChatScreen,
} from '../screens';
import BottomTabBar, { TabName } from '../components/ui/BottomTabBar';
import { Colors } from '../theme';
import { ActivityIndicator, View, Text, Platform } from 'react-native';
import { UserProfile, Booking } from '../types';

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
    const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
    const [selectedConversationId, setSelectedConversationId] = useState<string | null>(null);
    const [selectedConversationName, setSelectedConversationName] = useState<string>('');
    const [userIsMentor, setUserIsMentor] = useState(false);

    // Check if current user is a mentor (to show the right bookings view)
    useEffect(() => {
        const checkMentor = async () => {
            const userId = auth.currentUser?.uid;
            if (!userId) return;
            try {
                const { getUserProfile } = require('../services/userService');
                const profile = await getUserProfile(userId);
                setUserIsMentor(profile?.isMentor ?? false);
            } catch {
                // ignore
            }
        };
        checkMentor();
    }, []);

    const handleTabPress = (tab: TabName) => {
        setActiveTab(tab);
        setActiveScreen(tab);
        setSelectedMentor(null);
        setSelectedBooking(null);
        setSelectedConversationId(null);
        setSelectedConversationName('');
    };

    const handleMentorPress = (mentor: UserProfile) => {
        setSelectedMentor(mentor);
        setActiveScreen('mentorDetail');
    };

    const handleBookingPress = (booking: Booking) => {
        setSelectedBooking(booking);
        setActiveScreen('bookingDetail');
    };

    const handleConversationPress = (conversationId: string, otherUserName: string) => {
        setSelectedConversationId(conversationId);
        setSelectedConversationName(otherUserName);
        setActiveScreen('chat');
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
                        onNavigateMarketplace={() => {
                            setActiveTab('marketplace');
                            setActiveScreen('marketplace');
                        }}
                        onNavigateBookings={() => {
                            setActiveTab('bookings');
                            setActiveScreen('bookings');
                        }}
                        onNavigateMessages={() => {
                            setActiveTab('messages');
                            setActiveScreen('messages');
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
                        onBooking={() => setActiveScreen('booking')}
                    />
                );
            case 'booking':
                if (!selectedMentor) return null;
                return (
                    <BookingScreen
                        mentor={selectedMentor}
                        onBack={() => setActiveScreen('mentorDetail')}
                        onBooked={() => {
                            setSelectedMentor(null);
                            setActiveTab('bookings');
                            setActiveScreen('bookings');
                        }}
                    />
                );
            case 'bookings':
                // Show mentor-specific view if user is a mentor, else client view
                if (userIsMentor) {
                    return (
                        <MentorBookingsScreen
                            onBack={() => {
                                setActiveTab('home');
                                setActiveScreen('home');
                            }}
                            onBookingPress={handleBookingPress}
                        />
                    );
                }
                return (
                    <BookingsListScreen
                        onBack={() => {
                            setActiveTab('home');
                            setActiveScreen('home');
                        }}
                        onBookingPress={handleBookingPress}
                    />
                );
            case 'bookingDetail':
                if (!selectedBooking) return null;
                return (
                    <BookingDetailScreen
                        booking={selectedBooking}
                        onBack={() => {
                            setSelectedBooking(null);
                            setActiveScreen('bookings');
                        }}
                        onStatusChanged={() => {
                            // Booking status changed — will reload on return to list
                        }}
                        onOpenChat={(conversationId: string, otherUserName: string) => {
                            setSelectedConversationId(conversationId);
                            setSelectedConversationName(otherUserName);
                            setActiveScreen('chat');
                        }}
                    />
                );
            case 'messages':
                return (
                    <ConversationsListScreen
                        onConversationPress={handleConversationPress}
                        onBack={() => {
                            setActiveTab('home');
                            setActiveScreen('home');
                        }}
                    />
                );
            case 'chat':
                if (!selectedConversationId) return null;
                return (
                    <ChatScreen
                        conversationId={selectedConversationId}
                        otherUserName={selectedConversationName}
                        onBack={() => {
                            setSelectedConversationId(null);
                            setSelectedConversationName('');
                            setActiveScreen('messages');
                            setActiveTab('messages');
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

    // Hide tab bar on sub-screens (mentorDetail, editProfile, booking, bookingDetail, chat)
    const showTabBar = ['home', 'marketplace', 'messages', 'bookings', 'profile'].includes(activeScreen);
    const isWeb = Platform.OS === 'web';

    return (
        <View style={{ flex: 1, flexDirection: isWeb ? 'row' : 'column' }}>
            {/* Web: sidebar always visible on left */}
            {isWeb && (
                <BottomTabBar activeTab={activeTab} onTabPress={handleTabPress} />
            )}
            {/* Content area */}
            <View style={{ flex: 1 }}>
                {renderScreen()}
            </View>
            {/* Mobile: bottom tab bar */}
            {!isWeb && showTabBar && (
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
            const completed = await hasCompletedOnboarding(userId);
            setNeedsOnboarding(!completed);
            setError(null);
        } catch (err) {
            setNeedsOnboarding(true);
            setError('Erreur de connexion Firestore');
        }
    }, []);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
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
        setNeedsOnboarding(false);
    };

    const handleNeedOnboarding = () => {
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
