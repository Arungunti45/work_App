import React from 'react';
import type { JobSortOption } from '../../types/jobDiscovery';

interface JobSortProps {
  value: JobSortOption;
  onChange: (sort: JobSortOption) => void;
  hasLocation?: boolean;
}

export const JobSort: React.FC<JobSortProps> = ({ value, onChange, hasLocation }) => {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
      <label style={{ fontSize: '0.9rem', color: '#666' }}>Sort by:</label>
      <select 
        value={value} 
        onChange={(e) => onChange(e.target.value as JobSortOption)}
        style={{ padding: '0.5rem', borderRadius: '4px', border: '1px solid #ddd' }}
      >
        <option value="NEWEST">Newest First</option>
        <option value="OLDEST">Oldest First</option>
        <option value="SALARY_HIGH">Salary (High to Low)</option>
        <option value="SALARY_LOW">Salary (Low to High)</option>
        {hasLocation && <option value="DISTANCE">Distance (Nearest First)</option>}
        {/* RELEVANCE would be implemented fully if we had a backend search engine */}
      </select>
    </div>
  );
};
