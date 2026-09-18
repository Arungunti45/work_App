import React, { useState, useEffect } from 'react';
import { useForm, FormProvider, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useNavigate } from 'react-router-dom';
import { JobSchema } from '../../../schemas/job';
import type { Job, Category, Skill } from '../../../schemas/job';
import { JobService } from '../../../services/jobService';
import { useAuth } from '../../../context/AuthContext';

export const NewJob: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [categories, setCategories] = useState<Category[]>([]);
  const [skills, setSkills] = useState<Skill[]>([]);
  const [error, setError] = useState<string | null>(null);

  const methods = useForm<Job>({
    resolver: zodResolver(JobSchema) as any,
    defaultValues: {
      employerId: user?.uid,
      title: '',
      description: '',
      categoryId: '',
      skillIds: [],
      workersRequired: 1,
      status: 'DRAFT',
      moderationStatus: 'NOT_SUBMITTED'
    }
  });

  const { handleSubmit, formState: { isSubmitting, errors }, control } = methods;
  
  const selectedCategory = useWatch({ control, name: 'categoryId' });

  useEffect(() => {
    JobService.getCategories().then(setCategories).catch(console.error);
  }, []);

  useEffect(() => {
    if (selectedCategory) {
      JobService.getSkills(selectedCategory).then(setSkills).catch(console.error);
    } else {
      setSkills([]);
    }
  }, [selectedCategory]);

  const onSaveDraft = async (data: Job) => {
    if (!user) return;
    setError(null);
    try {
      data.employerId = user.uid;
      data.status = 'DRAFT';
      await JobService.saveJobDraft(data);
      navigate('/employer/jobs');
    } catch (err: any) {
      setError(err.message || 'Failed to save draft');
    }
  };

  const onSubmitReview = async (data: Job) => {
    if (!user) return;
    setError(null);
    try {
      data.employerId = user.uid;
      const jobId = await JobService.saveJobDraft(data);
      await JobService.submitForModeration(jobId);
      navigate('/employer/jobs');
    } catch (err: any) {
      setError(err.message || 'Failed to submit job');
    }
  };

  return (
    <div style={{ padding: '2rem', maxWidth: '800px', margin: '0 auto' }}>
      <h2>Post a New Job</h2>
      {error && <div style={{ color: 'red', marginBottom: '1rem' }}>{error}</div>}
      
      <FormProvider {...methods}>
        <form style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          
          <section>
            <h3>Basic Information</h3>
            <label>Job Title *</label>
            <input {...methods.register('title')} style={{ width: '100%', padding: '0.5rem' }} />
            {errors.title && <p style={{ color: 'red' }}>{errors.title.message}</p>}

            <label>Description *</label>
            <textarea {...methods.register('description')} rows={5} style={{ width: '100%', padding: '0.5rem' }} />
            {errors.description && <p style={{ color: 'red' }}>{errors.description.message}</p>}
          </section>

          <section>
            <h3>Category & Skills</h3>
            <label>Category *</label>
            <select {...methods.register('categoryId')} style={{ width: '100%', padding: '0.5rem' }}>
              <option value="">Select Category...</option>
              {categories.filter(c => c.type === 'Main Category').map(c => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
            {errors.categoryId && <p style={{ color: 'red' }}>{errors.categoryId.message}</p>}
            
            {/* Simple skills multi-select or checkboxes (simplified for now) */}
            {skills.length > 0 && (
              <div style={{ marginTop: '1rem' }}>
                <label>Skills Required</label>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem' }}>
                  {skills.map(skill => (
                    <label key={skill.id}>
                      <input type="checkbox" value={skill.id} {...methods.register('skillIds')} />
                      {skill.name}
                    </label>
                  ))}
                </div>
              </div>
            )}
          </section>

          <section>
            <h3>Location</h3>
            <label>State</label>
            <input {...methods.register('state')} style={{ width: '100%', padding: '0.5rem' }} />
            <label>City</label>
            <input {...methods.register('city')} style={{ width: '100%', padding: '0.5rem' }} />
          </section>

          <section>
            <h3>Compensation</h3>
            <label>Salary Type</label>
            <select {...methods.register('salaryType')} style={{ width: '100%', padding: '0.5rem' }}>
              <option value="">Select...</option>
              <option value="MONTHLY">Monthly</option>
              <option value="DAILY">Daily</option>
              <option value="FIXED_CONTRACT">Fixed Contract</option>
            </select>
            <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
              <div style={{ flex: 1 }}>
                <label>Min Salary (₹)</label>
                <input type="number" {...methods.register('salaryMin', { valueAsNumber: true })} style={{ width: '100%', padding: '0.5rem' }} />
              </div>
              <div style={{ flex: 1 }}>
                <label>Max Salary (₹)</label>
                <input type="number" {...methods.register('salaryMax', { valueAsNumber: true })} style={{ width: '100%', padding: '0.5rem' }} />
              </div>
            </div>
          </section>

          <section>
            <h3>Requirements</h3>
            <label>Workers Required</label>
            <input type="number" {...methods.register('workersRequired', { valueAsNumber: true })} style={{ width: '100%', padding: '0.5rem' }} />
            {errors.workersRequired && <p style={{ color: 'red' }}>{errors.workersRequired.message}</p>}
          </section>

          <div style={{ display: 'flex', gap: '1rem', marginTop: '2rem' }}>
            <button type="button" onClick={handleSubmit(onSaveDraft)} disabled={isSubmitting} style={{ padding: '0.75rem 1.5rem' }}>
              Save Draft
            </button>
            <button type="button" onClick={handleSubmit(onSubmitReview)} disabled={isSubmitting} style={{ padding: '0.75rem 1.5rem', background: '#0070f3', color: 'white', border: 'none' }}>
              Submit for Review
            </button>
          </div>
        </form>
      </FormProvider>
    </div>
  );
};
