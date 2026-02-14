/**
 * Native payment service — uses @stripe/stripe-react-native PaymentSheet.
 *
 * Metro resolves this file on iOS / Android instead of paymentService.web.ts.
 */
import { Alert } from 'react-native';
import { initPaymentSheet, presentPaymentSheet } from '@stripe/stripe-react-native';
import { createPaymentIntentOnBackend } from './paymentService.shared';

// Re-export shared helpers so screens can import everything from one place
export { onboardMentor, createPaymentIntentOnBackend, STRIPE_PUBLISHABLE_KEY } from './paymentService.shared';

/**
 * Full native payment flow:
 *  1. Create PaymentIntent on backend
 *  2. Initialise the Stripe PaymentSheet
 *  3. Present the PaymentSheet to the user
 */
export const handlePayment = async (
    amount: number,
    mentorId: string,
    onSuccess: () => void,
): Promise<void> => {
    try {
        // 1 — Create PaymentIntent via Cloud Function (amount in cents)
        console.log('[PaymentService] Creating PaymentIntent…');
        const { clientSecret } = await createPaymentIntentOnBackend(
            Math.round(amount * 100),
            'eur',
            mentorId,
        );

        // 2 — Initialise the PaymentSheet
        console.log('[PaymentService] Initialising PaymentSheet…');
        const { error: initError } = await initPaymentSheet({
            merchantDisplayName: 'RankUp',
            paymentIntentClientSecret: clientSecret,
        });

        if (initError) {
            console.error('[PaymentService] Init error:', initError);
            Alert.alert('Erreur', "Impossible d'initialiser le paiement.");
            return;
        }

        // 3 — Present the PaymentSheet
        console.log('[PaymentService] Presenting PaymentSheet…');
        const { error: paymentError } = await presentPaymentSheet();

        if (paymentError) {
            console.log('[PaymentService] Payment failed / cancelled:', paymentError);
            if (paymentError.code !== 'Canceled') {
                Alert.alert('Paiement échoué', paymentError.message);
            }
            return;
        }

        console.log('[PaymentService] Payment success!');
        Alert.alert('Succès', 'Votre paiement est confirmé !');
        onSuccess();
    } catch (error: any) {
        console.error('[PaymentService] Payment error:', error);
        Alert.alert('Erreur', 'Une erreur est survenue lors du paiement.');
    }
};
