import React, { useState } from 'react';
import { useForm, FormProvider } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useNavigate } from 'react-router-dom';
import { ContractorProfileSchema } from '../../schemas/profile';
import type { ContractorProfile } from '../../schemas/profile';
import { ProfileService } from '../../services/profileService';
import { useAuth } from '../../context/AuthContext';

export const ContractorOnboarding: React.FC = () => {
  const { userProfile, user, refreshProfile } = useAuth();
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [error, setError] = useState<string | null>(null);

  const methods = useForm<ContractorProfile>({
    resolver: zodResolver(ContractorProfileSchema) as any,
    defaultValues: {
      contractorName: userProfile?.displayName || '',
      businessCategory: '',
      workerTypes: [],
      profileCompleteness: 0,
      verificationStatus: 'unverified'
    }
  });

  const { handleSubmit, formState: { isSubmitting, errors } } = methods;

  const nextStep = () => setStep(s => Math.min(s + 1, 3));
  const prevStep = () => setStep(s => Math.max(s - 1, 1));

  const onSubmit = async (data: ContractorProfile) => {
    if (!user) return;
    setError(null);
    try {
      await ProfileService.saveProfile(user.uid, 'CONTRACTOR', data);
      await refreshProfile();
      navigate('/contractor/dashboard');
    } catch (err: any) {
      setError(err.message || "Failed to save profile");
    }
  };

  return (
    <div style={{ maxWidth: '600px', margin: '2rem auto', padding: '2rem', border: '1px solid #ddd', borderRadius: '8px' }}>
      <h2>Contractor Onboarding - Step {step} of 3</h2>
      
      {error && <div style={{ color: 'red', marginBottom: '1rem' }}>{error}</div>}

      <FormProvider {...methods}>
        <form onSubmit={handleSubmit(onSubmit)} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          
          {step === 1 && (
            <div>
              <h3>Contractor Info</h3>
              <label>Contractor Name *</label>
              <input {...methods.register('contractorName')} style={{ width: '100%', padding: '0.5rem', marginBottom: '1rem' }} />
              {errors.contractorName && <p style={{ color: 'red' }}>{errors.contractorName.message}</p>}

              <label>Company Name (Optional)</label>
              <input {...methods.register('companyName')} style={{ width: '100%', padding: '0.5rem', marginBottom: '1rem' }} />

              <label>Business Category *</label>
              <input {...methods.register('businessCategory')} style={{ width: '100%', padding: '0.5rem', marginBottom: '1rem' }} />
              {errors.businessCategory && <p style={{ color: 'red' }}>{errors.businessCategory.message}</p>}
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
              <p>You can add more details from your profile dashboard.</p>
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
