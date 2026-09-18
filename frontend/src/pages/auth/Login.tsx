import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Link, useNavigate } from 'react-router-dom';
import { AuthService } from '../../services/authService';
import { useAuth } from '../../context/AuthContext';

const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export const Login: React.FC = () => {
  const [error, setError] = useState<string | null>(null);
  const { refreshProfile } = useAuth();
  const navigate = useNavigate();

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginFormValues) => {
    setError(null);
    try {
      const userProfile = await AuthService.loginWithEmail(data.email, data.password);
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
      setError(err.message || 'Login failed');
    }
  };

  return (
    <div style={{ maxWidth: '400px', margin: '4rem auto', padding: '2rem', border: '1px solid #ccc', borderRadius: '8px' }}>
      <h2>Login to GET YOUR JOB</h2>
      {error && <div style={{ color: 'red', marginBottom: '1rem' }}>{error}</div>}
      <form onSubmit={handleSubmit(onSubmit)} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <div>
          <label>Email</label>
          <input type="email" {...register('email')} style={{ width: '100%', padding: '0.5rem' }} />
          {errors.email && <span style={{ color: 'red', fontSize: '0.8rem' }}>{errors.email.message}</span>}
        </div>
        <div>
          <label>Password</label>
          <input type="password" {...register('password')} style={{ width: '100%', padding: '0.5rem' }} />
          {errors.password && <span style={{ color: 'red', fontSize: '0.8rem' }}>{errors.password.message}</span>}
        </div>
        <button type="submit" disabled={isSubmitting} style={{ padding: '0.75rem', background: '#0070f3', color: 'white', border: 'none', borderRadius: '4px' }}>
          {isSubmitting ? 'Logging in...' : 'Login'}
        </button>
      </form>
      <div style={{ marginTop: '1rem', display: 'flex', justifyContent: 'space-between' }}>
        <Link to="/register">Create an account</Link>
        <Link to="/forgot-password">Forgot Password?</Link>
      </div>
      <div style={{ marginTop: '1rem', textAlign: 'center' }}>
        <Link to="/phone-otp">Continue with Phone OTP</Link>
      </div>
    </div>
  );
};
