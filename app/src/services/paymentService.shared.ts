/**
 * Shared payment service — platform-agnostic logic.
 *
 * Contains Firebase Cloud Function calls and helpers used by both
 * paymentService.native.ts and paymentService.web.ts.
 */
import { httpsCallable } from 'firebase/functions';
import { functions } from '../config/firebase';
import { Alert, Linking, Platform } from 'react-native';

// ---------------------------------------------------------------------------
// Stripe publishable key — set EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY in .env
// ---------------------------------------------------------------------------
export const STRIPE_PUBLISHABLE_KEY =
    process.env.EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY ?? '';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------
export interface CreateStripeAccountResponse {
    accountId: string;
}

export interface CreateAccountLinkResponse {
    url: string;
}

export interface CreatePaymentIntentResponse {
    clientSecret: string;
    publishableKey: string;
}

// ---------------------------------------------------------------------------
// Cloud Function helpers
// ---------------------------------------------------------------------------

/**
 * Calls the `createPaymentIntent` Cloud Function and returns the
 * clientSecret needed to confirm the payment on the client.
 */
export const createPaymentIntentOnBackend = async (
    amountCents: number,
    currency: string,
    mentorId: string,
): Promise<CreatePaymentIntentResponse> => {
    const createIntent = httpsCallable<
        { amount: number; currency: string; mentorId: string },
        CreatePaymentIntentResponse
    >(functions, 'createPaymentIntent');

    const response = await createIntent({
        amount: amountCents,
        currency,
        mentorId,
    });

    return response.data;
};

// ---------------------------------------------------------------------------
// Mentor onboarding (shared — works on both web & native)
// ---------------------------------------------------------------------------

/**
 * Creates (or retrieves) a Stripe Connect Express account for the current
 * user, then opens the Stripe onboarding URL so the mentor can complete KYC.
 */
export const onboardMentor = async (): Promise<void> => {
    try {
        const createAccount = httpsCallable<unknown, CreateStripeAccountResponse>(
            functions,
            'createStripeConnectedAccount',
        );
        const accountResult = await createAccount();
        const accountId = accountResult.data.accountId;

        const createLink = httpsCallable<{ accountId: string }, CreateAccountLinkResponse>(
            functions,
            'createStripeAccountLink',
        );
        const linkResult = await createLink({ accountId });
        const onboardingUrl = linkResult.data.url;

        if (Platform.OS === 'web') {
            // On web, window.open is more reliable than Linking
            window.open(onboardingUrl, '_blank');
        } else {
            const supported = await Linking.canOpenURL(onboardingUrl);
            if (supported) {
                await Linking.openURL(onboardingUrl);
            } else {
                Alert.alert('Erreur', "Impossible d'ouvrir le lien Stripe.");
            }
        }
    } catch (error: any) {
        Alert.alert('Erreur', 'Une erreur est survenue lors de la connexion avec Stripe.');
        throw error;
    }
};
