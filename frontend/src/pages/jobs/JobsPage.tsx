import React, { useState, useEffect } from 'react';
import { JobSearchService } from '../../services/jobSearchService';
import type { JobSearchFilters, JobSortOption } from '../../types/jobDiscovery';
import type { Job } from '../../schemas/job';
import { JobSearchBar } from '../../components/jobs/JobSearchBar';
import { JobFilters } from '../../components/jobs/JobFilters';
import { JobSort } from '../../components/jobs/JobSort';
import { JobCard } from '../../components/JobCard';

export const JobsPage: React.FC = () => {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [filters, setFilters] = useState<JobSearchFilters>({});
  const [sortBy, setSortBy] = useState<JobSortOption>('NEWEST');

  useEffect(() => {
    fetchJobs();
  }, [filters, sortBy]);

  const fetchJobs = async () => {
    setLoading(true);
    try {
      const results = await JobSearchService.searchJobs({
        filters,
        sortBy,
        limit: 20
      });
      setJobs(results);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (searchTerm: string, _locationTerm: string) => {
    // In a real app, geocode the locationTerm to get lat/lng. 
    // Here we just use basic text matching if implemented, or ignore.
    setFilters(prev => ({ ...prev, searchTerm }));
  };

  return (
    <div style={{ background: '#f9f9f9', minHeight: '100vh', padding: '2rem 1rem' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        
        <div style={{ marginBottom: '2rem' }}>
          <h1 style={{ marginBottom: '1rem' }}>Find Your Next Job</h1>
          <JobSearchBar onSearch={handleSearch} initialSearch={filters.searchTerm} />
        </div>

        <div style={{ display: 'flex', gap: '2rem', flexDirection: 'row', flexWrap: 'wrap' }}>
          
          {/* Sidebar Filters */}
          <div style={{ flex: '1', minWidth: '250px', maxWidth: '300px' }}>
            <JobFilters filters={filters} onChange={setFilters} />
          </div>

          {/* Results Area */}
          <div style={{ flex: '3', minWidth: '300px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <h2 style={{ margin: 0 }}>{jobs.length} {jobs.length === 20 ? '+' : ''} Jobs Found</h2>
              <JobSort value={sortBy} onChange={setSortBy} hasLocation={!!filters.location} />
            </div>

            {loading ? (
              <p>Loading jobs...</p>
            ) : jobs.length === 0 ? (
              <div style={{ padding: '3rem', textAlign: 'center', background: 'white', borderRadius: '8px', border: '1px solid #eaeaea' }}>
                <h3>No jobs found</h3>
                <p>Try adjusting your search or clearing filters.</p>
                <button onClick={() => setFilters({})} style={{ padding: '0.5rem 1rem', background: '#0070f3', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
                  Clear Filters
                </button>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {jobs.map(job => (
                  <JobCard key={job.id} job={job} />
                ))}
                
                {jobs.length >= 20 && (
                  <button style={{ padding: '1rem', background: 'white', border: '1px solid #ddd', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}>
                    Load More Jobs
                  </button>
                )}
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  );
};
