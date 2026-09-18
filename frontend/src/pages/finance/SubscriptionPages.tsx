import React from 'react';

export const SubscriptionCheckout: React.FC = () => {
  return (
    <div style={{ padding: '2rem' }}>
      <h1>Secure Checkout</h1>
      <p>Your payment is processed securely by our provider.</p>
      {/* Mock provider checkout integration would go here */}
      <button style={{ padding: '0.5rem 1rem', background: '#22c55e', color: 'white' }}>Confirm Payment</button>
    </div>
  );
};

export const PaymentHistory: React.FC = () => {
  return (
    <div style={{ padding: '2rem' }}>
      <h1>Billing & Invoices</h1>
      <p>Review your past payments and download invoices.</p>
      <table style={{ width: '100%', marginTop: '2rem', textAlign: 'left' }}>
        <thead>
          <tr>
            <th>Date</th>
            <th>Amount</th>
            <th>Status</th>
            <th>Invoice</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td colSpan={4}>No previous payments found.</td>
          </tr>
        </tbody>
      </table>
    </div>
  );
};
