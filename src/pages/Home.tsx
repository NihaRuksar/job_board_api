import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Search, MapPin, Briefcase } from 'lucide-react';
import { motion } from 'framer-motion';
import { Job } from '../types';
import { formatDistanceToNow } from 'date-fns';

export default function Home() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchJobs();
  }, []);

  const fetchJobs = async (query = '') => {
    setLoading(true);
    try {
      const res = await fetch(`/api/jobs${query ? `?search=${query}` : ''}`);
      const data = await res.json();
      setJobs(data.results || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchJobs(search);
  };

  return (
    <div className="space-y-8 pb-12">
      {/* Hero Section */}
      <section className="pt-8 text-center max-w-3xl mx-auto">
        <motion.h1 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-2xl sm:text-3xl font-bold tracking-[2px] uppercase text-content-main mb-6 leading-tight border-b border-surface-border pb-4 inline-block"
        >
          Find your next <span className="text-primary-accent">dream job</span>
        </motion.h1>
        <motion.p 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="text-[11px] font-mono text-content-dim mb-8 uppercase tracking-widest opacity-80"
        >
          Discover thousands of job openings from top companies around the world.
        </motion.p>
        
        <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-3 max-w-2xl mx-auto font-mono text-xs">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-content-dim" size={16} />
            <input 
              type="text" 
              placeholder="Search /..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-3 rounded bg-surface-card border border-surface-border text-content-main focus:border-primary-accent outline-none transition placeholder-content-dim/50"
            />
          </div>
          <button 
            type="submit"
            className="bg-primary-accent hover:opacity-90 text-white px-8 py-3 rounded font-bold uppercase tracking-widest transition"
          >
            Search
          </button>
        </form>
      </section>

      {/* Job Listings */}
      <section>
        <span className="font-mono text-[10px] text-content-dim uppercase tracking-[1px] mb-4 block border-b border-surface-border pb-2">Latest Opportunities</span>
        
        {loading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin h-6 w-6 border-2 border-primary-accent border-t-transparent rounded-full"></div>
          </div>
        ) : jobs.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {jobs.map((job, i) => (
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                key={job.id} 
              >
                <Link to={`/jobs/${job.id}`} className="block bg-surface-card border border-surface-border border-l-[3px] hover:border-l-primary-accent hover:border-surface-border rounded p-4 transition group h-full flex flex-col relative">
                  <div className="flex justify-between items-start mb-3">
                    <div className="h-8 w-8 bg-surface-bg border border-surface-border flex items-center justify-center text-xs font-bold text-content-dim">
                      {job.companyLogo ? (
                        <img src={job.companyLogo} alt={job.companyName} className="h-full w-full object-cover grayscale opacity-80" />
                      ) : (
                        job.companyName?.charAt(0) || 'C'
                      )}
                    </div>
                    <span className="text-[9px] font-mono font-bold px-2 py-0.5 bg-[rgba(16,185,129,0.1)] text-success-base border border-success-base/30 rounded uppercase tracking-wider">
                      {job.job_type}
                    </span>
                  </div>
                  <h3 className="font-bold text-[13px] text-content-main mb-1 group-hover:text-primary-accent transition line-clamp-1">{job.title}</h3>
                  <p className="text-content-dim text-[11px] font-mono mb-4 line-clamp-1">{job.companyName}</p>
                  
                  <div className="flex flex-col gap-1.5 font-mono text-[10px] text-content-dim mt-auto mb-4">
                    <div className="flex items-center gap-2">
                      <div className="w-[4px] h-[4px] rounded-full bg-primary-accent"></div>
                      <span className="truncate">{job.location}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-[4px] h-[4px] rounded-full bg-primary-accent"></div>
                      <span className="truncate">${job.salary_min}k - ${job.salary_max}k</span>
                    </div>
                  </div>
                  
                  <div className="font-mono text-[9px] text-content-dim pt-2 border-t border-surface-border opacity-50 uppercase">
                    <span>{formatDistanceToNow(new Date(job.created_at), { addSuffix: true })}</span>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="text-center py-16 bg-surface-card border border-surface-border rounded">
            <p className="text-content-dim font-mono text-xs uppercase tracking-widest">Sys_Msg: No jobs found.</p>
          </div>
        )}
      </section>
    </div>
  );
}
