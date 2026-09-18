import React, { useState } from 'react';
import { useForm, FormProvider } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useNavigate } from 'react-router-dom';
import { EmployerProfileSchema } from '../../schemas/profile';
import type { EmployerProfile } from '../../schemas/profile';
import { ProfileService } from '../../services/profileService';
import { useAuth } from '../../context/AuthContext';

export const EmployerOnboarding: React.FC = () => {
  const { userProfile, user, refreshProfile } = useAuth();
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [error, setError] = useState<string | null>(null);

  const methods = useForm<EmployerProfile>({
    resolver: zodResolver(EmployerProfileSchema) as any,
    defaultValues: {
      companyName: userProfile?.displayName || '',
      businessCategory: '',
      companyPhotos: [],
      profileCompleteness: 0,
      verificationStatus: 'unverified'
    }
  });

  const { handleSubmit, formState: { isSubmitting, errors } } = methods;

  const nextStep = () => setStep(s => Math.min(s + 1, 3));
  const prevStep = () => setStep(s => Math.max(s - 1, 1));

  const onSubmit = async (data: EmployerProfile) => {
    if (!user) return;
    setError(null);
    try {
      await ProfileService.saveProfile(user.uid, 'EMPLOYER', data);
      await refreshProfile();
      navigate('/employer/dashboard');
    } catch (err: any) {
      setError(err.message || "Failed to save profile");
    }
  };

  return (
    <div style={{ maxWidth: '600px', margin: '2rem auto', padding: '2rem', border: '1px solid #ddd', borderRadius: '8px' }}>
      <h2>Employer Onboarding - Step {step} of 3</h2>
      
      {error && <div style={{ color: 'red', marginBottom: '1rem' }}>{error}</div>}
      
      <FormProvider {...methods}>
        <form onSubmit={handleSubmit(onSubmit)} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          
          {step === 1 && (
            <div>
              <h3>Business Info</h3>
              <label>Company/Employer Name *</label>
              <input {...methods.register('companyName')} style={{ width: '100%', padding: '0.5rem', marginBottom: '1rem' }} />
              {errors.companyName && <p style={{ color: 'red' }}>{errors.companyName.message}</p>}

              <label>Business Category *</label>
              <input {...methods.register('businessCategory')} style={{ width: '100%', padding: '0.5rem', marginBottom: '1rem' }} />
              {errors.businessCategory && <p style={{ color: 'red' }}>{errors.businessCategory.message}</p>}

              <label>Description</label>
              <textarea {...methods.register('description')} style={{ width: '100%', padding: '0.5rem', marginBottom: '1rem' }} />
            </div>
          )}

          {step === 2 && (
            <div>
              <h3>Location</h3>
              <label>State *</label>
              <input {...methods.register('location.state')} style={{ width: '100%', padding: '0.5rem', marginBottom: '1rem' }} />
              {errors.location?.state && <p style={{ color: 'red' }}>{errors.location.state.message}</p>}

              <label>City *</label>
              <input {...methods.register('location.city')} style={{ width: '100%', padding: '0.5rem', marginBottom: '1rem' }} />
              {errors.location?.city && <p style={{ color: 'red' }}>{errors.location.city.message}</p>}

              <label>Area *</label>
              <input {...methods.register('location.area')} style={{ width: '100%', padding: '0.5rem', marginBottom: '1rem' }} />
              {errors.location?.area && <p style={{ color: 'red' }}>{errors.location.area.message}</p>}

              <label>Pincode *</label>
              <input {...methods.register('location.pincode')} style={{ width: '100%', padding: '0.5rem', marginBottom: '1rem' }} />
              {errors.location?.pincode && <p style={{ color: 'red' }}>{errors.location.pincode.message}</p>}
            </div>
          )}

          {step === 3 && (
            <div>
              <h3>Review & Submit</h3>
              <p>You can upload your logo and photos later from the edit profile page.</p>
            </div>
          )}

          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '2rem' }}>
            {step > 1 && <button type="button" onClick={prevStep} style={{ padding: '0.5rem 1rem' }}>Back</button>}
            {step < 3 && <button type="button" onClick={nextStep} style={{ padding: '0.5rem 1rem', background: '#0070f3', color: 'white', border: 'none' }}>Next</button>}
            {step === 3 && (
              <button type="submit" disabled={isSubmitting} style={{ padding: '0.5rem 1rem', background: '#28a745', color: 'white', border: 'none' }}>
                {isSubmitting ? 'Saving...' : 'Complete Onboarding'}
              </button>
            )}
          </div>
        </form>
      </FormProvider>
    </div>
  );
};
