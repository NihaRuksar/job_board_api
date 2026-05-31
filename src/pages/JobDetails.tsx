import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAuth } from '../lib/AuthContext';
import { Job } from '../types';
import { formatDistanceToNow } from 'date-fns';
import { MapPin, Briefcase, DollarSign, Building } from 'lucide-react';

export default function JobDetails() {
  const { id } = useParams<{ id: string }>();
  const [job, setJob] = useState<Job | null>(null);
  const [loading, setLoading] = useState(true);
  const [applying, setApplying] = useState(false);
  const [appliedStatus, setAppliedStatus] = useState<string | null>(null);
  
  const { user, token } = useAuth();
  
  const [resumeUrl, setResumeUrl] = useState('');
  const [coverLetter, setCoverLetter] = useState('');

  useEffect(() => {
    fetch(`/api/jobs/${id}`)
      .then(res => res.json())
      .then(data => {
        if (!data.error) setJob(data);
      })
      .finally(() => setLoading(false));
  }, [id]);

  const handleApply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;
    
    setApplying(true);
    try {
      const res = await fetch(`/api/jobs/${id}/apply`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ resume_url: resumeUrl, cover_letter: coverLetter })
      });
      
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      
      setAppliedStatus('Successfully applied! Note: A mock Celery worker sent an async email to the employer.');
    } catch (err: any) {
      setAppliedStatus(`Error: ${err.message}`);
    } finally {
      setApplying(false);
    }
  };

  if (loading) return <div className="p-12 text-center">Loading...</div>;
  if (!job) return <div className="p-12 text-center text-red-500">Job not found</div>;

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-12">
      {/* Header */}
      <div className="bg-surface-card p-8 rounded border border-surface-border">
        <div className="flex flex-col md:flex-row gap-6 items-start">
          <div className="h-16 w-16 bg-surface-bg border border-surface-border flex items-center justify-center text-xl font-bold text-content-dim shrink-0">
             {job.companyDetails?.logo_url ? (
                <img src={job.companyDetails.logo_url} alt="" className="h-full w-full object-cover grayscale opacity-80" />
              ) : (
                job.companyDetails?.name?.charAt(0) || 'C'
              )}
          </div>
          
          <div className="flex-1 w-full">
            <div className="flex items-start justify-between flex-wrap gap-4">
              <div>
                <h1 className="text-2xl font-bold text-content-main leading-tight tracking-wide">{job.title}</h1>
                <p className="text-sm font-mono text-content-dim mt-2 flex items-center gap-2 uppercase">
                  <Building size={16} className="text-primary-accent" />
                  {job.companyDetails?.name || 'Unknown Company'}
                </p>
              </div>
              {!job.is_active && (
                <span className="px-2 py-0.5 bg-[rgba(239,68,68,0.1)] text-red-500 border border-red-500/50 font-bold rounded text-[10px] uppercase tracking-widest">
                  Closed
                </span>
              )}
            </div>

            <div className="flex flex-wrap gap-6 mt-6 pt-4 border-t border-surface-border font-mono text-xs uppercase tracking-wider text-content-dim">
              <div className="flex items-center gap-2">
                <MapPin size={16} className="text-primary-accent" />
                <span>{job.location}</span>
              </div>
              <div className="flex items-center gap-2">
                <Briefcase size={16} className="text-primary-accent" />
                <span>{job.job_type}</span>
              </div>
              <div className="flex items-center gap-2">
                <DollarSign size={16} className="text-primary-accent" />
                <span>${job.salary_min}k - ${job.salary_max}k</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          <div className="bg-surface-card p-8 rounded border border-surface-border">
            <h2 className="text-[10px] font-mono font-bold text-content-dim uppercase tracking-[2px] mb-6 block border-b border-surface-border pb-2">Job Description</h2>
            <div className="prose max-w-none text-content-main whitespace-pre-wrap font-sans text-sm leading-relaxed opacity-90">
              {job.description}
            </div>
          </div>
        </div>

        <div className="lg:col-span-1 space-y-6">
          <div className="bg-surface-bg p-6 rounded border border-primary-accent/50 shadow-[0_0_15px_rgba(59,130,246,0.1)]">
            <h3 className="font-bold text-primary-accent mb-4 text-xs font-mono uppercase tracking-[2px]">Application</h3>
            
            {user?.role === 'seeker' ? (
              job.is_active ? (
                appliedStatus && appliedStatus.includes('Success') ? (
                  <div className="bg-[rgba(16,185,129,0.1)] text-success-base p-4 border border-success-base/50 font-mono text-[10px] uppercase tracking-wider leading-relaxed">
                    {appliedStatus}
                  </div>
                ) : (
                  <form onSubmit={handleApply} className="space-y-4 font-mono text-xs">
                    {appliedStatus && <p className="text-red-500 bg-[rgba(239,68,68,0.1)] p-2 mb-2 border border-red-500/50">{appliedStatus}</p>}
                    <div>
                      <label className="block text-content-dim uppercase tracking-wider mb-1.5 text-[10px]">Resume URL</label>
                      <input 
                        type="url" 
                        required 
                        value={resumeUrl}
                        onChange={e => setResumeUrl(e.target.value)}
                        placeholder="https://..."
                        className="w-full px-3 py-2 bg-[rgba(0,0,0,0.3)] border border-surface-border text-content-main focus:border-primary-accent outline-none transition"
                      />
                    </div>
                    <div>
                      <label className="block text-content-dim uppercase tracking-wider mb-1.5 text-[10px]">Cover Letter</label>
                      <textarea 
                        required 
                        rows={4}
                        value={coverLetter}
                        onChange={e => setCoverLetter(e.target.value)}
                        placeholder="Message..."
                        className="w-full px-3 py-2 bg-[rgba(0,0,0,0.3)] border border-surface-border text-content-main focus:border-primary-accent outline-none transition resize-none"
                      />
                    </div>
                    <button 
                      type="submit" 
                      disabled={applying}
                      className="w-full py-3 mt-2 bg-primary-accent hover:opacity-90 text-white font-bold tracking-widest uppercase transition disabled:opacity-50"
                    >
                      {applying ? 'Transmitting...' : 'Submit Data'}
                    </button>
                  </form>
                )
              ) : (
                <p className="text-content-dim font-mono text-[10px] uppercase tracking-wider p-3 border border-surface-border text-center">Status: Closed</p>
              )
            ) : user?.role === 'company' ? (
              <p className="text-content-dim font-mono text-[10px] uppercase tracking-wider p-3 border border-surface-border text-center">Warning: Entity mismatch</p>
            ) : (
              <Link to="/login" className="block text-center w-full py-3 bg-primary-accent hover:opacity-90 text-white font-bold tracking-widest uppercase text-xs transition">
                Authenticate
              </Link>
            )}
            
            <p className="text-[10px] font-mono text-content-dim opacity-50 mt-6 text-center uppercase tracking-widest">
              Posted {formatDistanceToNow(new Date(job.created_at), { addSuffix: true })}
            </p>
          </div>

          <div className="bg-surface-card p-6 rounded border border-surface-border">
            <h3 className="text-[10px] font-mono font-bold text-content-dim uppercase tracking-[2px] mb-4 block border-b border-surface-border pb-2">Org Profile</h3>
            {job.companyDetails ? (
              <div className="font-mono text-[11px]">
                <p className="font-bold text-content-main mb-2">{job.companyDetails.name}</p>
                {job.companyDetails.website && (
                  <a href={job.companyDetails.website} target="_blank" rel="noreferrer" className="text-primary-accent hover:underline mb-4 inline-block break-all">
                    {job.companyDetails.website}
                  </a>
                )}
                <p className="text-content-dim mt-2 leading-relaxed opacity-80">{job.companyDetails.description}</p>
              </div>
            ) : (
              <p className="text-[10px] font-mono text-content-dim uppercase">No data</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
