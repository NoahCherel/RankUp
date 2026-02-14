/**
 * Web payment service — NO native SDK imports.
 *
 * Metro resolves this file on web instead of paymentService.native.ts.
 * The actual payment UI is handled by the <WebPaymentModal> component;
 * this module only provides the imperative helpers.
 */
import { Alert } from 'react-native';
import { createPaymentIntentOnBackend } from './paymentService.shared';

// Re-export shared helpers
export { onboardMentor, createPaymentIntentOnBackend, STRIPE_PUBLISHABLE_KEY } from './paymentService.shared';

/**
 * On web the payment flow is driven by <WebPaymentModal> (which mounts
 * Stripe Elements and handles confirmation). This function is a lightweight
 * wrapper that creates the PaymentIntent and returns the clientSecret so the
 * modal can take over.
 *
 * Screens that need to trigger a payment should:
 *   1. Call `handlePayment()` to get the `clientSecret`.
 *   2. Set state to show `<WebPaymentModal clientSecret={…} />`.
 */
export const handlePayment = async (
    amount: number,
    mentorId: string,
    _onSuccess: () => void,
): Promise<string | undefined> => {
    try {
        console.log('[PaymentService:web] Creating PaymentIntent…');
        const { clientSecret } = await createPaymentIntentOnBackend(
            Math.round(amount * 100),
            'eur',
            mentorId,
        );
        return clientSecret;
    } catch (error: any) {
        console.error('[PaymentService:web] Error:', error);
        Alert.alert('Erreur', 'Une erreur est survenue lors du paiement.');
        return undefined;
    }
};
