import React, { useState, useEffect } from 'react';
import type { JobSearchFilters } from '../../types/jobDiscovery';
import { JobService } from '../../services/jobService';
import type { Category } from '../../schemas/job';

interface JobFiltersProps {
  filters: JobSearchFilters;
  onChange: (newFilters: JobSearchFilters) => void;
}

export const JobFilters: React.FC<JobFiltersProps> = ({ filters, onChange }) => {
  const [categories, setCategories] = useState<Category[]>([]);

  useEffect(() => {
    JobService.getCategories().then(setCategories).catch(console.error);
  }, []);

  const handleCategoryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    onChange({ ...filters, categoryId: e.target.value || undefined });
  };

  const handleWorkTypeToggle = (type: string) => {
    const current = filters.workType || [];
    const updated = current.includes(type) 
      ? current.filter((t: string) => t !== type)
      : [...current, type];
    onChange({ ...filters, workType: updated.length > 0 ? updated : undefined });
  };

  return (
    <div style={{ background: 'white', padding: '1.5rem', borderRadius: '8px', border: '1px solid #eaeaea' }}>
      <h3 style={{ marginTop: 0 }}>Filters</h3>
      
      <div style={{ marginBottom: '1.5rem' }}>
        <h4>Category</h4>
        <select value={filters.categoryId || ''} onChange={handleCategoryChange} style={{ width: '100%', padding: '0.5rem' }}>
          <option value="">All Categories</option>
          {categories.filter(c => c.type === 'Main Category').map(c => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
        </select>
      </div>

      <div style={{ marginBottom: '1.5rem' }}>
        <h4>Work Type</h4>
        {['FULL_TIME', 'PART_TIME', 'DAILY', 'CONTRACT', 'REMOTE'].map(type => (
          <label key={type} style={{ display: 'block', marginBottom: '0.5rem' }}>
            <input 
              type="checkbox" 
              checked={(filters.workType || []).includes(type)}
              onChange={() => handleWorkTypeToggle(type)}
              style={{ marginRight: '0.5rem' }}
            />
            {type.replace('_', ' ')}
          </label>
        ))}
      </div>

      <div style={{ marginBottom: '1.5rem' }}>
        <h4>Urgency</h4>
        <label>
          <input 
            type="checkbox" 
            checked={filters.isUrgent || false}
            onChange={(e) => onChange({ ...filters, isUrgent: e.target.checked || undefined })}
            style={{ marginRight: '0.5rem' }}
          />
          Urgent Jobs Only
        </label>
      </div>

      <button 
        onClick={() => onChange({})} 
        style={{ width: '100%', padding: '0.5rem', background: '#f5f5f5', border: '1px solid #ccc', borderRadius: '4px', cursor: 'pointer' }}
      >
        Clear All Filters
      </button>
    </div>
  );
};
