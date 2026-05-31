import React, { useEffect, useState } from 'react';
import { useAuth } from '../lib/AuthContext';
import { Job, CompanyProfile } from '../types';
import { formatDistanceToNow } from 'date-fns';

export default function CompanyDashboard() {
  const { token } = useAuth();
  
  const [profile, setProfile] = useState<CompanyProfile | null>(null);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loadingProfile, setLoadingProfile] = useState(true);
  
  // Forms
  const [editProfile, setEditProfile] = useState(false);
  const [showJobForm, setShowJobForm] = useState(false);
  const [profileForm, setProfileForm] = useState<Partial<CompanyProfile>>({});
  const [jobForm, setJobForm] = useState({ title: '', description: '', location: '', job_type: 'Full-time', salary_min: '', salary_max: '' });

  // Applications view
  const [viewingAppsFor, setViewingAppsFor] = useState<string | null>(null);
  const [apps, setApps] = useState<any[]>([]);

  useEffect(() => {
    fetchProfile();
    fetchMyJobs();
    // eslint-disable-next-line
  }, [token]);

  const fetchProfile = async () => {
    try {
      const res = await fetch('/api/company/profile', { headers: { Authorization: `Bearer ${token}` }});
      if (res.ok) {
        const data = await res.json();
        setProfile(data);
        setProfileForm({ name: data.name, website: data.website, location: data.location, description: data.description, logo_url: data.logo_url });
      }
    } finally {
      setLoadingProfile(false);
    }
  };

  const fetchMyJobs = async () => {
    // We fetch all jobs and filter manually for simplicity, or use a custom endpoint.
    // Wait, we have the user id but jobs only have companyId.
    // The blueprint implies we just use GET /api/jobs and filter or we have an internal relationship.
    // Since jobs returns all, let's just fetch all and filter by company id.
    const res = await fetch('/api/jobs');
    const data = await res.json();
    if (profile) {
       setJobs(data.results.filter((j: Job) => j.companyId === profile.id));
    }
  };

  useEffect(() => {
    if (profile) fetchMyJobs();
  }, [profile]);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    await fetch('/api/company/profile', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify(profileForm)
    });
    setEditProfile(false);
    fetchProfile();
  };

  const handlePostJob = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
      ...jobForm,
      salary_min: parseInt(jobForm.salary_min),
      salary_max: parseInt(jobForm.salary_max),
    };
    await fetch('/api/jobs', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify(payload)
    });
    setShowJobForm(false);
    setJobForm({ title: '', description: '', location: '', job_type: 'Full-time', salary_min: '', salary_max: '' });
    fetchMyJobs();
  };

  const loadApplications = async (jobId: string) => {
    if (viewingAppsFor === jobId) {
      setViewingAppsFor(null);
      return;
    }
    const res = await fetch(`/api/jobs/${jobId}/applications`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    const data = await res.json();
    setApps(data);
    setViewingAppsFor(jobId);
  };

  const handleAppStatus = async (appId: string, status: string) => {
    await fetch(`/api/applications/${appId}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ status })
    });
    if (viewingAppsFor) loadApplications(viewingAppsFor);
  };

  if (loadingProfile) return <div>Loading...</div>;

  return (
    <div className="space-y-8 pb-12">
      {/* Profile Section */}
      <div className="bg-surface-card rounded border border-surface-border p-8">
        <div className="flex justify-between flex-wrap gap-4 mb-6 border-b border-surface-border pb-4 w-full">
          <h2 className="text-[10px] font-mono font-bold text-content-dim uppercase tracking-[2px]">Company Profile</h2>
          {!editProfile && (
            <button onClick={() => setEditProfile(true)} className="px-3 py-1.5 border border-primary-accent text-primary-accent hover:bg-[rgba(59,130,246,0.1)] rounded text-[10px] font-mono font-bold uppercase tracking-wider transition">
              Edit
            </button>
          )}
        </div>

        {editProfile ? (
          <form onSubmit={handleUpdateProfile} className="space-y-4 font-mono text-xs">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-content-dim uppercase tracking-wider mb-1.5 text-[10px]">Company Name</label>
                <input required type="text" value={profileForm.name || ''} onChange={e => setProfileForm(prev => ({ ...prev, name: e.target.value }))} className="w-full px-3 py-2 bg-surface-bg border border-surface-border text-content-main focus:border-primary-accent outline-none" />
              </div>
              <div>
                <label className="block text-content-dim uppercase tracking-wider mb-1.5 text-[10px]">Location</label>
                <input required type="text" value={profileForm.location || ''} onChange={e => setProfileForm(prev => ({ ...prev, location: e.target.value }))} className="w-full px-3 py-2 bg-surface-bg border border-surface-border text-content-main focus:border-primary-accent outline-none" />
              </div>
            </div>
            <div>
              <label className="block text-content-dim uppercase tracking-wider mb-1.5 text-[10px]">Website URL</label>
              <input type="url" value={profileForm.website || ''} onChange={e => setProfileForm(prev => ({ ...prev, website: e.target.value }))} className="w-full px-3 py-2 bg-surface-bg border border-surface-border text-content-main focus:border-primary-accent outline-none" />
            </div>
            <div>
              <label className="block text-content-dim uppercase tracking-wider mb-1.5 text-[10px]">Description</label>
              <textarea rows={3} value={profileForm.description || ''} onChange={e => setProfileForm(prev => ({ ...prev, description: e.target.value }))} className="w-full px-3 py-2 bg-surface-bg border border-surface-border text-content-main focus:border-primary-accent outline-none"></textarea>
            </div>
            <div className="flex gap-2 pt-2">
              <button type="submit" className="bg-primary-accent text-white px-4 py-2 rounded font-bold uppercase tracking-widest text-[10px]">Save Data</button>
              <button type="button" onClick={() => setEditProfile(false)} className="bg-transparent border border-surface-border text-content-dim px-4 py-2 rounded font-bold uppercase tracking-widest text-[10px]">Cancel</button>
            </div>
          </form>
        ) : (
          <div className="space-y-4 text-content-dim font-mono text-xs">
            {profile?.name ? (
              <>
                <p><strong className="text-content-main font-semibold w-24 inline-block">Name:</strong> {profile.name}</p>
                <p><strong className="text-content-main font-semibold w-24 inline-block">Location:</strong> {profile.location}</p>
                {profile.website && <p><strong className="text-content-main font-semibold w-24 inline-block">Website:</strong> <a href={profile.website} className="text-primary-accent hover:underline">{profile.website}</a></p>}
                <p className="flex items-start"><strong className="text-content-main font-semibold w-24 inline-block shrink-0">Desc:</strong> <span className="opacity-80 leading-relaxed">{profile.description}</span></p>
              </>
            ) : (
              <div className="p-4 bg-[rgba(234,179,8,0.1)] text-yellow-500 border border-yellow-500/30 rounded uppercase tracking-wider text-[10px]">
                Warning: Complete profile initialization to proceed.
              </div>
            )}
          </div>
        )}
      </div>

      {/* Jobs Section */}
      <div className="bg-surface-card rounded border border-surface-border p-8">
        <div className="flex justify-between flex-wrap gap-4 mb-6 border-b border-surface-border pb-4">
          <h2 className="text-[10px] font-mono font-bold text-content-dim uppercase tracking-[2px]">Job Records</h2>
          {!showJobForm && profile?.name && (
            <button onClick={() => setShowJobForm(true)} className="px-3 py-1.5 bg-[rgba(59,130,246,0.1)] text-primary-accent border border-primary-accent hover:bg-primary-accent hover:text-white transition rounded text-[10px] font-mono font-bold uppercase tracking-wider">
              + Init Record
            </button>
          )}
        </div>

        {showJobForm && (
          <form onSubmit={handlePostJob} className="mb-8 p-6 bg-surface-bg rounded border border-surface-border space-y-4 font-mono text-xs">
            <h3 className="font-bold text-primary-accent mb-4 uppercase tracking-[2px] text-[10px]">Create Job Posting</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-content-dim uppercase tracking-wider mb-1.5 text-[10px]">Title</label>
                <input required type="text" value={jobForm.title} onChange={e => setJobForm(prev => ({ ...prev, title: e.target.value }))} className="w-full px-3 py-2 bg-[rgba(0,0,0,0.3)] border border-surface-border text-content-main focus:border-primary-accent outline-none" />
              </div>
              <div>
                <label className="block text-content-dim uppercase tracking-wider mb-1.5 text-[10px]">Location</label>
                <input required type="text" value={jobForm.location} onChange={e => setJobForm(prev => ({ ...prev, location: e.target.value }))} className="w-full px-3 py-2 bg-[rgba(0,0,0,0.3)] border border-surface-border text-content-main focus:border-primary-accent outline-none" />
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
               <div>
                  <label className="block text-content-dim uppercase tracking-wider mb-1.5 text-[10px]">Job Type</label>
                  <select value={jobForm.job_type} onChange={e => setJobForm(prev => ({ ...prev, job_type: e.target.value }))} className="w-full px-3 py-2 bg-[rgba(0,0,0,0.3)] text-content-main border border-surface-border focus:border-primary-accent outline-none">
                    <option>Full-time</option>
                    <option>Part-time</option>
                    <option>Contract</option>
                    <option>Remote</option>
                  </select>
               </div>
               <div>
                  <label className="block text-content-dim uppercase tracking-wider mb-1.5 text-[10px]">Min. Salary (k)</label>
                  <input required type="number" value={jobForm.salary_min} onChange={e => setJobForm(prev => ({ ...prev, salary_min: e.target.value }))} className="w-full px-3 py-2 bg-[rgba(0,0,0,0.3)] border border-surface-border text-content-main focus:border-primary-accent outline-none" />
               </div>
               <div>
                  <label className="block text-content-dim uppercase tracking-wider mb-1.5 text-[10px]">Max. Salary (k)</label>
                  <input required type="number" value={jobForm.salary_max} onChange={e => setJobForm(prev => ({ ...prev, salary_max: e.target.value }))} className="w-full px-3 py-2 bg-[rgba(0,0,0,0.3)] border border-surface-border text-content-main focus:border-primary-accent outline-none" />
               </div>
            </div>

            <div>
              <label className="block text-content-dim uppercase tracking-wider mb-1.5 text-[10px]">Description</label>
              <textarea required rows={4} value={jobForm.description} onChange={e => setJobForm(prev => ({ ...prev, description: e.target.value }))} className="w-full px-3 py-2 bg-[rgba(0,0,0,0.3)] border border-surface-border text-content-main focus:border-primary-accent outline-none resize-none"></textarea>
            </div>
            
            <div className="flex gap-2 pt-2 text-[10px]">
              <button type="submit" className="bg-primary-accent text-white px-4 py-2 rounded font-bold uppercase tracking-widest">Commit</button>
              <button type="button" onClick={() => setShowJobForm(false)} className="bg-transparent border border-surface-border text-content-dim px-4 py-2 rounded font-bold uppercase tracking-widest hover:bg-surface-border">Abort</button>
            </div>
          </form>
        )}

        <div className="space-y-4">
          {jobs.length === 0 && !showJobForm && (
            <p className="text-content-dim font-mono text-xs uppercase tracking-widest">SysMsg: No records located.</p>
          )}

          {jobs.map(job => (
            <div key={job.id} className="border border-surface-border rounded overflow-hidden">
               <div className="p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-surface-bg font-mono">
                 <div>
                   <h3 className="font-bold text-sm text-content-main uppercase tracking-wider">{job.title}</h3>
                   <p className="text-[10px] text-content-dim flex items-center gap-2 mt-2 uppercase tracking-wide opacity-80">
                     {job.location} • {job.job_type} • ${job.salary_min}k-${job.salary_max}k
                   </p>
                 </div>
                 <div className="flex items-center gap-4">
                   <span className={`text-[9px] px-2 py-0.5 rounded font-bold border uppercase tracking-widest ${job.is_active ? 'bg-[rgba(16,185,129,0.1)] text-success-base border-success-base/50' : 'bg-surface-card text-content-dim border-surface-border'}`}>
                     {job.is_active ? 'Active' : 'Closed'}
                   </span>
                   <button 
                     onClick={() => loadApplications(job.id)}
                     className="text-[10px] font-bold text-primary-accent hover:text-white hover:bg-primary-accent border border-primary-accent px-2 py-1 transition rounded uppercase tracking-wider"
                   >
                     Inspect Data
                   </button>
                 </div>
               </div>
               
               {/* Applications drawer */}
               {viewingAppsFor === job.id && (
                 <div className="bg-surface-card border-t border-surface-border p-4 sm:p-6 font-mono">
                   <h4 className="font-bold text-[10px] text-content-dim uppercase tracking-[3px] mb-4">Payloads ({apps.length})</h4>
                   {apps.length === 0 ? (
                     <p className="text-xs text-content-dim opacity-70">No incoming streams.</p>
                   ) : (
                     <div className="space-y-4">
                       {apps.map(app => (
                         <div key={app.id} className="bg-surface-bg p-4 rounded border border-surface-border text-[11px]">
                           <div className="flex justify-between items-start mb-3">
                             <a href={app.resume_url} target="_blank" rel="noreferrer" className="font-bold text-primary-accent hover:underline inline-flex items-center gap-1 uppercase tracking-wider">
                               Extract Document ↗
                             </a>
                             <div className="flex gap-2">
                               <button onClick={() => handleAppStatus(app.id, 'accepted')} className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-widest border transition ${app.status === 'accepted' ? 'bg-success-base text-white border-success-base' : 'border-success-base text-success-base hover:bg-[rgba(16,185,129,0.1)]'}`}>Commit</button>
                               <button onClick={() => handleAppStatus(app.id, 'rejected')} className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-widest border transition ${app.status === 'rejected' ? 'bg-red-500 text-white border-red-500' : 'border-red-500 text-red-500 hover:bg-[rgba(239,68,68,0.1)]'}`}>Drop</button>
                             </div>
                           </div>
                           <p className="text-content-dim bg-surface-card p-3 border border-surface-border rounded text-[10px] mb-3 break-all leading-relaxed">{app.cover_letter}</p>
                           <p className="text-[9px] text-content-dim uppercase tracking-wider opacity-80">State: <span className="font-bold text-content-main uppercase">{app.status}</span></p>
                         </div>
                       ))}
                     </div>
                   )}
                 </div>
               )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
