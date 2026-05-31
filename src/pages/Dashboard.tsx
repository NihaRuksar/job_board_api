import React from 'react';
import { Routes, Route, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../lib/AuthContext';
import SeekerDashboard from './SeekerDashboard';
import CompanyDashboard from './CompanyDashboard';

export default function Dashboard() {
  const { user } = useAuth();
  
  return (
    <div>
      <div className="mb-8 border-b border-surface-border pb-6">
        <h1 className="text-xl font-bold tracking-[2px] uppercase text-content-main">Dashboard</h1>
        <p className="text-content-dim font-mono text-xs mt-2 uppercase">Manage your {user?.role === 'seeker' ? 'applications and profile' : 'company profile and job postings'}.</p>
      </div>

      {user?.role === 'seeker' ? <SeekerDashboard /> : <CompanyDashboard />}
    </div>
  );
}
