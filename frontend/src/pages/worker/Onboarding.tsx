import React, { useState } from 'react';
import { useForm, FormProvider } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useNavigate } from 'react-router-dom';
import { WorkerProfileSchema } from '../../schemas/profile';
import type { WorkerProfile } from '../../schemas/profile';
import { ProfileService } from '../../services/profileService';
import { useAuth } from '../../context/AuthContext';

export const WorkerOnboarding: React.FC = () => {
  const { userProfile, user, refreshProfile } = useAuth();
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [error, setError] = useState<string | null>(null);

  const methods = useForm<WorkerProfile>({
    resolver: zodResolver(WorkerProfileSchema) as any,
    defaultValues: {
      fullName: userProfile?.displayName || '',
      email: userProfile?.email || '',
      phoneNumber: userProfile?.phoneNumber || '',
      skills: [],
      languages: [],
      workTypes: [],
      portfolioPhotos: [],
      profileCompleteness: 0,
      verificationStatus: 'unverified'
    }
  });

  const { handleSubmit, formState: { isSubmitting, errors } } = methods;

  const nextStep = async () => {
    // Optional: add step-specific validation here using `trigger`
    setStep(s => Math.min(s + 1, 5));
  };

  const prevStep = () => setStep(s => Math.max(s - 1, 1));

  const onSubmit = async (data: WorkerProfile) => {
    if (!user) return;
    setError(null);
    try {
      await ProfileService.saveProfile(user.uid, 'WORKER', data);
      await refreshProfile(); // Refresh to update onboardingComplete
      navigate('/worker/dashboard');
    } catch (err: any) {
      setError(err.message || "Failed to save profile");
    }
  };

  return (
    <div style={{ maxWidth: '600px', margin: '2rem auto', padding: '2rem', border: '1px solid #ddd', borderRadius: '8px' }}>
      <h2>Worker Onboarding - Step {step} of 5</h2>
      <div style={{ background: '#eee', height: '8px', borderRadius: '4px', marginBottom: '2rem' }}>
        <div style={{ background: '#0070f3', height: '100%', width: `${(step / 5) * 100}%`, borderRadius: '4px', transition: 'width 0.3s' }}></div>
      </div>
      
      {error && <div style={{ color: 'red', marginBottom: '1rem' }}>{error}</div>}
      {Object.keys(errors).length > 0 && <div style={{ color: 'red', marginBottom: '1rem' }}>Please fix the errors in the form.</div>}

      <FormProvider {...methods}>
        <form onSubmit={handleSubmit(onSubmit)} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          
          {step === 1 && (
            <div>
              <h3>Basic Information</h3>
              <label>Full Name *</label>
              <input {...methods.register('fullName')} style={{ width: '100%', padding: '0.5rem', marginBottom: '1rem' }} />
              {errors.fullName && <p style={{ color: 'red' }}>{errors.fullName.message}</p>}

              <label>Bio (Optional)</label>
              <textarea {...methods.register('bio')} style={{ width: '100%', padding: '0.5rem', marginBottom: '1rem' }} />
            </div>
          )}

          {step === 2 && (
            <div>
              <h3>Professional Details</h3>
              <label>Experience Level</label>
              <select {...methods.register('experienceLevel')} style={{ width: '100%', padding: '0.5rem', marginBottom: '1rem' }}>
                <option value="">Select...</option>
                <option value="Fresher">Fresher</option>
                <option value="1-2 years">1-2 years</option>
                <option value="3-5 years">3-5 years</option>
                <option value="5+ years">5+ years</option>
              </select>

              <label>Education</label>
              <input {...methods.register('education')} style={{ width: '100%', padding: '0.5rem', marginBottom: '1rem' }} />
            </div>
          )}

          {step === 3 && (
            <div>
              <h3>Job Preferences</h3>
              <label>Expected Wage (INR) (Optional)</label>
              <input type="number" {...methods.register('expectedWage', { valueAsNumber: true })} style={{ width: '100%', padding: '0.5rem', marginBottom: '1rem' }} />
              
              <label>Salary Type</label>
              <select {...methods.register('salaryType')} style={{ width: '100%', padding: '0.5rem', marginBottom: '1rem' }}>
                <option value="">Select...</option>
                <option value="Monthly">Monthly</option>
                <option value="Daily">Daily</option>
                <option value="Hourly">Hourly</option>
              </select>
            </div>
          )}

          {step === 4 && (
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

          {step === 5 && (
            <div>
              <h3>Review & Submit</h3>
              <p>Please review your information. Uploading photos will be available in the edit profile section after onboarding.</p>
            </div>
          )}

          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '2rem' }}>
            {step > 1 && (
              <button type="button" onClick={prevStep} style={{ padding: '0.5rem 1rem' }}>Back</button>
            )}
            {step < 5 && (
              <button type="button" onClick={nextStep} style={{ padding: '0.5rem 1rem', background: '#0070f3', color: 'white', border: 'none' }}>Next</button>
            )}
            {step === 5 && (
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
