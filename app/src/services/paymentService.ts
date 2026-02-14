/**
 * paymentService.ts — TypeScript declaration stub.
 *
 * Metro resolves paymentService.native.ts / paymentService.web.ts at runtime.
 * This file exists solely so that TypeScript can resolve
 *   `import { … } from './paymentService'`
 * without errors. It re-exports the web API surface (which is a superset).
 */
export { handlePayment } from './paymentService.web';
export { onboardMentor, createPaymentIntentOnBackend, STRIPE_PUBLISHABLE_KEY } from './paymentService.shared';
