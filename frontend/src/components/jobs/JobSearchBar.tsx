import React, { useState } from 'react';

interface JobSearchBarProps {
  onSearch: (searchTerm: string, locationTerm: string) => void;
  initialSearch?: string;
  initialLocation?: string;
}

export const JobSearchBar: React.FC<JobSearchBarProps> = ({ onSearch, initialSearch = '', initialLocation = '' }) => {
  const [searchTerm, setSearchTerm] = useState(initialSearch);
  const [locationTerm, setLocationTerm] = useState(initialLocation);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch(searchTerm, locationTerm);
  };

  return (
    <form onSubmit={handleSubmit} style={{ 
      display: 'flex', 
      gap: '1rem', 
      background: 'white', 
      padding: '1rem', 
      borderRadius: '8px',
      boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
      flexWrap: 'wrap'
    }}>
      <div style={{ flex: '2', minWidth: '200px' }}>
        <input 
          type="text" 
          placeholder="Search jobs, skills, companies..." 
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={{ width: '100%', padding: '0.75rem', border: '1px solid #ddd', borderRadius: '4px' }}
        />
      </div>
      <div style={{ flex: '1', minWidth: '150px' }}>
        <input 
          type="text" 
          placeholder="Enter city, area or location" 
          value={locationTerm}
          onChange={(e) => setLocationTerm(e.target.value)}
          style={{ width: '100%', padding: '0.75rem', border: '1px solid #ddd', borderRadius: '4px' }}
        />
      </div>
      <button type="submit" style={{ 
        padding: '0.75rem 1.5rem', 
        background: '#0070f3', 
        color: 'white', 
        border: 'none', 
        borderRadius: '4px',
        fontWeight: 'bold',
        cursor: 'pointer'
      }}>
        Search
      </button>
    </form>
  );
};
