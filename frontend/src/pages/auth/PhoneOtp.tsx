import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { RecaptchaVerifier } from 'firebase/auth';
import type { ConfirmationResult } from 'firebase/auth';
import { auth } from '../../config/firebase';
import { AuthService } from '../../services/authService';
import { useAuth } from '../../context/AuthContext';

export const PhoneOtp: React.FC = () => {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [otp, setOtp] = useState('');
  const [step, setStep] = useState<'PHONE' | 'OTP'>('PHONE');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [confirmationResult, setConfirmationResult] = useState<ConfirmationResult | null>(null);
  
  const { refreshProfile } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!window.recaptchaVerifier) {
      window.recaptchaVerifier = new RecaptchaVerifier(auth, 'recaptcha-container', {
        size: 'invisible'
      });
    }
  }, []);

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);
    try {
      if (!window.recaptchaVerifier) throw new Error('Recaptcha not initialized');
      const confirmation = await AuthService.sendPhoneOtp(phoneNumber, window.recaptchaVerifier);
      setConfirmationResult(confirmation);
      setStep('OTP');
    } catch (err: any) {
      setError(err.message || 'Failed to send OTP');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!confirmationResult) return;
    setError(null);
    setIsSubmitting(true);
    try {
      const userProfile = await AuthService.verifyPhoneOtp(confirmationResult, otp);
      await refreshProfile();
      
      if (userProfile.accountStatus !== 'active') {
        setError('Your account is not active. Please contact support.');
        await AuthService.logout();
        return;
      }

      if (!userProfile.role) {
        navigate('/select-role');
      } else {
        navigate(`/${userProfile.role.toLowerCase()}/dashboard`);
      }
    } catch (err: any) {
      setError(err.message || 'Invalid OTP');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div style={{ maxWidth: '400px', margin: '4rem auto', padding: '2rem', border: '1px solid #ccc', borderRadius: '8px' }}>
      <h2>Phone Login</h2>
      {error && <div style={{ color: 'red', marginBottom: '1rem' }}>{error}</div>}
      
      <div id="recaptcha-container"></div>

      {step === 'PHONE' ? (
        <form onSubmit={handleSendOtp} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div>
            <label>Phone Number (e.g., +1234567890)</label>
            <input 
              type="tel" 
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              required 
              style={{ width: '100%', padding: '0.5rem' }} 
            />
          </div>
          <button type="submit" disabled={isSubmitting} style={{ padding: '0.75rem', background: '#0070f3', color: 'white', border: 'none', borderRadius: '4px' }}>
            {isSubmitting ? 'Sending...' : 'Send OTP'}
          </button>
        </form>
      ) : (
        <form onSubmit={handleVerifyOtp} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div>
            <label>Enter OTP Code</label>
            <input 
              type="text" 
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              required 
              style={{ width: '100%', padding: '0.5rem' }} 
            />
          </div>
          <button type="submit" disabled={isSubmitting} style={{ padding: '0.75rem', background: '#0070f3', color: 'white', border: 'none', borderRadius: '4px' }}>
            {isSubmitting ? 'Verifying...' : 'Verify OTP'}
          </button>
          <button type="button" onClick={() => setStep('PHONE')} style={{ background: 'transparent', border: 'none', textDecoration: 'underline', cursor: 'pointer' }}>
            Back to Phone Number
          </button>
        </form>
      )}
    </div>
  );
};

declare global {
  interface Window {
    recaptchaVerifier: any;
  }
}
