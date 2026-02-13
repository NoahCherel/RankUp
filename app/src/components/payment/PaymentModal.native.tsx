/**
 * Native stub — the PaymentSheet handles everything natively, so there is
 * no modal to render.  This component always returns `null`.
 */
import React from 'react';

interface PaymentModalProps {
    visible: boolean;
    clientSecret: string;
    onSuccess: () => void;
    onCancel: () => void;
}

const PaymentModal: React.FC<PaymentModalProps> = () => null;

export default PaymentModal;
