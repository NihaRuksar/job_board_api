import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Briefcase, User as UserIcon, LogOut } from 'lucide-react';
import { useAuth } from '../lib/AuthContext';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <nav className="bg-[rgba(21,25,33,0.8)] border-b border-surface-border sticky top-0 z-10 w-full px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
      <Link to="/" className="flex items-center gap-2 group">
        <div className="bg-primary-accent text-white p-1.5 rounded group-hover:opacity-90 transition">
          <Briefcase size={20} />
        </div>
        <span className="font-bold text-lg tracking-[2px] uppercase text-primary-accent font-sans">JobSphere</span>
      </Link>
      
      <div className="flex items-center gap-4 font-mono text-xs uppercase tracking-wider">
        {user ? (
          <>
            <Link 
              to="/dashboard" 
              className="font-medium text-content-dim hover:text-content-main transition flex items-center gap-2 px-3 py-2 rounded hover:bg-surface-card"
            >
              <UserIcon size={16} />
              Dashboard
            </Link>
            <button 
              onClick={handleLogout}
              className="font-medium text-red-500 hover:text-red-400 transition flex items-center gap-2 px-3 py-2 rounded hover:bg-surface-card"
            >
              <LogOut size={16} />
              Logout
            </button>
          </>
        ) : (
          <>
            <Link to="/login" className="font-medium text-content-dim hover:text-content-main transition">Log in</Link>
            <Link to="/register" className="bg-primary-accent hover:opacity-90 text-white px-4 py-2 rounded transition shadow-sm border border-transparent">
              Sign up
            </Link>
          </>
        )}
      </div>
    </nav>
  );
}
