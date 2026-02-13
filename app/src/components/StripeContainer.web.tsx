import React from 'react';

interface StripeContainerProps {
    children: React.ReactNode;
}

/**
 * Web StripeContainer — simple passthrough.
 *
 * On web, Stripe Elements are initialised per-payment inside <PaymentModal>
 * (which wraps its own <Elements> provider with the clientSecret).
 * There is no app-level provider needed.
 */
export const StripeContainer: React.FC<StripeContainerProps> = ({ children }) => {
    return <>{children}</>;
};
