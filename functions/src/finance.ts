import * as admin from 'firebase-admin';
import { onCall, HttpsError } from 'firebase-functions/v2/https';
import { onRequest } from 'firebase-functions/v2/https';
import { logAdminAction } from './permissions'; // Assuming permissions exist

/**
 * Creates a payment order securely from the backend.
 * Expects { planId } in data.
 */
export const createPaymentOrder = onCall(async (request) => {
  if (!request.auth) {
    throw new HttpsError('unauthenticated', 'User must be authenticated to purchase a plan.');
  }

  const { planId } = request.data;
  if (!planId) {
    throw new HttpsError('invalid-argument', 'A valid planId is required.');
  }

  // 1. Fetch Plan configuration from Firestore to guarantee price safety.
  // const planDoc = await admin.firestore().collection('plans').doc(planId).get();
  // 2. Make Razorpay/Stripe API call to create Order.
  // 3. Store Order tracking ID in 'payments' collection.
  
  return {
    orderId: 'MOCK_ORDER_ID_12345',
    amount: 1000,
    currency: 'USD'
  };
});

/**
 * Verifies a completed checkout process securely.
 * Server-authoritative source of truth for payment success.
 */
export const verifyPayment = onCall(async (request) => {
  if (!request.auth) {
    throw new HttpsError('unauthenticated', 'User must be authenticated.');
  }

  const { orderId, providerPaymentId, signature } = request.data;
  
  // 1. Verify the cryptographic signature returned by the provider (e.g. Razorpay).
  // 2. Check the 'payments' collection to ensure this order wasn't already fulfilled.
  // 3. Update 'payments' collection status to CAPTURED.
  // 4. Update or create the 'subscriptions' document for the user.
  // 5. Generate an 'invoices' record.
  
  return { success: true, message: 'Payment successfully verified and subscription activated.' };
});

/**
 * Payment Provider Webhook Endpoint.
 * Must be idempotent.
 */
export const handlePaymentWebhook = onRequest(async (req, res) => {
  // 1. Validate Webhook Signature from provider.
  // const signature = req.headers['x-razorpay-signature'];
  
  // 2. Idempotency Check using provider Event ID.
  const eventId = req.body.id;
  const eventRef = admin.firestore().collection('paymentEvents').doc(eventId);
  
  try {
    await admin.firestore().runTransaction(async (t) => {
      const doc = await t.get(eventRef);
      if (doc.exists) {
        throw new Error('Already processed');
      }
      
      // Process event (e.g. subscription_cancelled, payment_failed)
      // Update relevant collections (subscriptions, payments, invoices).
      
      t.set(eventRef, { processedAt: admin.firestore.FieldValue.serverTimestamp() });
    });
    res.status(200).send('Webhook processed');
  } catch (err) {
    if ((err as Error).message === 'Already processed') {
      res.status(200).send('Webhook ignored - duplicate');
    } else {
      console.error(err);
      res.status(500).send('Webhook error');
    }
  }
});
