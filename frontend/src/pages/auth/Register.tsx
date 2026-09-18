import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Link, useNavigate } from 'react-router-dom';
import { AuthService } from '../../services/authService';
import { useAuth } from '../../context/AuthContext';

const registerSchema = z.object({
  fullName: z.string().min(2, 'Full name is required'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  confirmPassword: z.string()
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

type RegisterFormValues = z.infer<typeof registerSchema>;

export const Register: React.FC = () => {
  const [error, setError] = useState<string | null>(null);
  const { refreshProfile } = useAuth();
  const navigate = useNavigate();

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
  });

  const onSubmit = async (data: RegisterFormValues) => {
    setError(null);
    try {
      await AuthService.registerWithEmail(data.email, data.password, data.fullName);
      await refreshProfile();
      navigate('/select-role');
    } catch (err: any) {
      setError(err.message || 'Registration failed');
    }
  };

  return (
    <div style={{ maxWidth: '400px', margin: '4rem auto', padding: '2rem', border: '1px solid #ccc', borderRadius: '8px' }}>
      <h2>Create an Account</h2>
      <p>Find Work. Hire Workers. Build Your Future.</p>
      {error && <div style={{ color: 'red', marginBottom: '1rem' }}>{error}</div>}
      <form onSubmit={handleSubmit(onSubmit)} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <div>
          <label>Full Name</label>
          <input type="text" {...register('fullName')} style={{ width: '100%', padding: '0.5rem' }} />
          {errors.fullName && <span style={{ color: 'red', fontSize: '0.8rem' }}>{errors.fullName.message}</span>}
        </div>
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
        <div>
          <label>Confirm Password</label>
          <input type="password" {...register('confirmPassword')} style={{ width: '100%', padding: '0.5rem' }} />
          {errors.confirmPassword && <span style={{ color: 'red', fontSize: '0.8rem' }}>{errors.confirmPassword.message}</span>}
        </div>
        <button type="submit" disabled={isSubmitting} style={{ padding: '0.75rem', background: '#0070f3', color: 'white', border: 'none', borderRadius: '4px' }}>
          {isSubmitting ? 'Registering...' : 'Register'}
        </button>
      </form>
      <div style={{ marginTop: '1rem', textAlign: 'center' }}>
        <Link to="/login">Already have an account? Login</Link>
      </div>
    </div>
  );
};
