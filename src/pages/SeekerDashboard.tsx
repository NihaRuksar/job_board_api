import React, { useEffect, useState } from 'react';
import { useAuth } from '../lib/AuthContext';
import { Application } from '../types';
import { formatDistanceToNow } from 'date-fns';
import { Link } from 'react-router-dom';

export default function SeekerDashboard() {
  const { token } = useAuth();
  const [apps, setApps] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/applications/mine', {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(data => setApps(data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [token]);

  return (
    <div className="space-y-6">
      <div className="bg-surface-card rounded border border-surface-border p-8">
        <h2 className="text-[10px] font-mono font-bold text-content-dim uppercase tracking-[2px] mb-6 block border-b border-surface-border pb-2">My Applications</h2>
        
        {loading ? (
          <p className="font-mono text-xs text-content-dim">Loading...</p>
        ) : apps.length === 0 ? (
          <p className="text-content-dim font-mono text-xs">You haven't applied to any jobs yet.</p>
        ) : (
          <div className="divide-y divide-surface-border font-mono text-xs">
            {apps.map(app => (
              <div key={app.id} className="py-4 flex items-center justify-between group">
                <div>
                  <Link to={`/jobs/${app.jobId}`} className="font-bold text-content-main hover:text-primary-accent block transition pb-1">
                    {app.jobTitle}
                  </Link>
                  <p className="text-[10px] text-content-dim mt-1 uppercase text-opacity-80">
                    Applied {formatDistanceToNow(new Date(app.applied_at), { addSuffix: true })}
                  </p>
                </div>
                <div>
                  <span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-widest border
                    ${app.status === 'accepted' ? 'bg-[rgba(16,185,129,0.1)] text-success-base border-success-base/50' : 
                      app.status === 'rejected' ? 'bg-[rgba(239,68,68,0.1)] text-red-500 border-red-500/50' : 
                      'bg-[rgba(234,179,8,0.1)] text-yellow-500 border-yellow-500/50'}`}>
                    {app.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
