import React from 'react';
import { useNavigate } from 'react-router-dom';

export const PricingPage: React.FC = () => {
  const navigate = useNavigate();
  return (
    <div style={{ padding: '2rem' }}>
      <h1>Premium Plans</h1>
      <div style={{ display: 'flex', gap: '2rem', marginTop: '2rem' }}>
        <div style={{ border: '1px solid #ccc', padding: '2rem', borderRadius: '8px' }}>
          <h2>Free Plan</h2>
          <p>$0 / forever</p>
          <ul>
            <li>Basic Profile</li>
            <li>Apply to Jobs</li>
          </ul>
        </div>
        <div style={{ border: '2px solid #3b82f6', padding: '2rem', borderRadius: '8px' }}>
          <h2>Premium Plan</h2>
          <p>$10 / month</p>
          <ul>
            <li>Enhanced Visibility</li>
            <li>Ad-free experience</li>
          </ul>
          <button onClick={() => navigate('/subscription/checkout')}>Upgrade Now</button>
        </div>
      </div>
    </div>
  );
};
