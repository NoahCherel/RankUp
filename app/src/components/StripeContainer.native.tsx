import React from 'react';
import { StripeProvider } from '@stripe/stripe-react-native';
import { STRIPE_PUBLISHABLE_KEY } from '../services/paymentService.shared';

interface StripeContainerProps {
    children: React.ReactNode;
}

export const StripeContainer: React.FC<StripeContainerProps> = ({ children }) => {
    if (!STRIPE_PUBLISHABLE_KEY) {
        return <>{children}</>;
    }

    return (
        <StripeProvider
            publishableKey={STRIPE_PUBLISHABLE_KEY}
            merchantIdentifier="merchant.com.rankup"
        >
            {children}
        </StripeProvider>
    );
};
