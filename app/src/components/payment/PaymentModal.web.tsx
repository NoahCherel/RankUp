/**
 * Web payment modal — displays a Stripe PaymentElement inside a modal overlay.
 *
 * Uses @stripe/react-stripe-js (web-only SDK). This file is never bundled
 * on native thanks to the `.web.tsx` extension.
 */
import React, { useState } from 'react';
import { loadStripe, Stripe } from '@stripe/stripe-js';
import {
    Elements,
    PaymentElement,
    useStripe,
    useElements,
} from '@stripe/react-stripe-js';
import { STRIPE_PUBLISHABLE_KEY } from '../../services/paymentService.shared';

// Lazy-load Stripe.js once
let stripePromise: Promise<Stripe | null> | null = null;
const getStripe = () => {
    if (!stripePromise) {
        stripePromise = loadStripe(STRIPE_PUBLISHABLE_KEY);
    }
    return stripePromise;
};

// ---------------------------------------------------------------------------
// Inner checkout form (must live inside <Elements>)
// ---------------------------------------------------------------------------
interface CheckoutFormProps {
    onSuccess: () => void;
    onCancel: () => void;
}

function CheckoutForm({ onSuccess, onCancel }: CheckoutFormProps) {
    const stripe = useStripe();
    const elements = useElements();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!stripe || !elements) return;

        setLoading(true);
        setError(null);

        const { error: confirmError } = await stripe.confirmPayment({
            elements,
            confirmParams: {
                return_url: window.location.href,
            },
            redirect: 'if_required',
        });

        if (confirmError) {
            setError(confirmError.message ?? 'Le paiement a échoué.');
            setLoading(false);
        } else {
            setLoading(false);
            onSuccess();
        }
    };

    return (
        <form onSubmit={handleSubmit} style={formStyles.form}>
            <PaymentElement />

            {error && <p style={formStyles.error}>{error}</p>}

            <div style={formStyles.actions}>
                <button
                    type="button"
                    onClick={onCancel}
                    disabled={loading}
                    style={formStyles.cancelBtn}
                >
                    Annuler
                </button>
                <button
                    type="submit"
                    disabled={!stripe || loading}
                    style={{
                        ...formStyles.payBtn,
                        opacity: loading ? 0.6 : 1,
                    }}
                >
                    {loading ? 'Traitement…' : 'Payer'}
                </button>
            </div>
        </form>
    );
}

// ---------------------------------------------------------------------------
// Exported modal wrapper
// ---------------------------------------------------------------------------
interface PaymentModalProps {
    visible: boolean;
    clientSecret: string;
    onSuccess: () => void;
    onCancel: () => void;
}

const PaymentModal: React.FC<PaymentModalProps> = ({
    visible,
    clientSecret,
    onSuccess,
    onCancel,
}) => {
    if (!visible || !clientSecret) return null;

    return (
        <div style={overlayStyles.backdrop} onClick={onCancel}>
            <div
                style={overlayStyles.modal}
                onClick={(e) => e.stopPropagation()}
            >
                <h2 style={overlayStyles.title}>Paiement sécurisé</h2>

                <Elements
                    stripe={getStripe()}
                    options={{
                        clientSecret,
                        appearance: {
                            theme: 'night',
                            variables: {
                                colorPrimary: '#EAB308',
                                colorBackground: '#1E293B',
                                colorText: '#F8FAFC',
                                colorDanger: '#EF4444',
                                borderRadius: '8px',
                            },
                        },
                    }}
                >
                    <CheckoutForm onSuccess={onSuccess} onCancel={onCancel} />
                </Elements>
            </div>
        </div>
    );
};

export default PaymentModal;

// ---------------------------------------------------------------------------
// Inline styles (web-only — plain CSS-in-JS objects)
// ---------------------------------------------------------------------------
const overlayStyles: Record<string, React.CSSProperties> = {
    backdrop: {
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(0,0,0,0.65)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 9999,
    },
    modal: {
        backgroundColor: '#1E293B',
        borderRadius: 16,
        padding: 32,
        width: '100%',
        maxWidth: 480,
        boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
        border: '1px solid #334155',
    },
    title: {
        color: '#F8FAFC',
        fontSize: 20,
        fontWeight: 700,
        marginBottom: 24,
        textAlign: 'center',
    },
};

const formStyles: Record<string, React.CSSProperties> = {
    form: {
        display: 'flex',
        flexDirection: 'column',
        gap: 16,
    },
    error: {
        color: '#EF4444',
        fontSize: 14,
        margin: 0,
    },
    actions: {
        display: 'flex',
        gap: 12,
        marginTop: 8,
    },
    cancelBtn: {
        flex: 1,
        padding: '12px 16px',
        borderRadius: 12,
        border: '1px solid #334155',
        backgroundColor: 'transparent',
        color: '#94A3B8',
        fontSize: 16,
        fontWeight: 600,
        cursor: 'pointer',
    },
    payBtn: {
        flex: 2,
        padding: '12px 16px',
        borderRadius: 12,
        border: 'none',
        backgroundColor: '#EAB308',
        color: '#0F172A',
        fontSize: 16,
        fontWeight: 700,
        cursor: 'pointer',
    },
};
