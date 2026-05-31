import React, { useState } from 'react';
import { useAuth } from '../lib/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { LogIn } from 'lucide-react';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      
      const data = await res.json();
      
      if (!res.ok) {
        throw new Error(data.error || 'Login failed');
      }

      login(data.access_token);
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto mt-16 bg-surface-card p-8 rounded border border-surface-border shadow-2xl shadow-black/50">
      <div className="text-center mb-8 border-b border-surface-border pb-6">
        <div className="inline-flex items-center justify-center w-12 h-12 bg-surface-bg border border-surface-border text-primary-accent rounded mb-4">
          <LogIn size={20} />
        </div>
        <h1 className="text-lg font-bold tracking-[2px] uppercase text-content-main">Welcome Back</h1>
        <p className="text-content-dim font-mono text-xs mt-2 uppercase">Log in to manage access.</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4 font-mono text-xs">
        {error && (
          <div className="bg-[rgba(239,68,68,0.1)] text-red-500 p-3 border border-red-500/50">
            {error}
          </div>
        )}
        
        <div>
          <label className="block text-content-dim uppercase tracking-wider mb-1.5 text-[10px]">Email Address</label>
          <input 
            type="email" 
            value={email}
            onChange={e => setEmail(e.target.value)}
            className="w-full px-3 py-2 bg-surface-bg border border-surface-border text-content-main focus:border-primary-accent outline-none transition"
            required
          />
        </div>
        
        <div>
          <label className="block text-content-dim uppercase tracking-wider mb-1.5 text-[10px]">Password</label>
          <input 
            type="password" 
            value={password}
            onChange={e => setPassword(e.target.value)}
            className="w-full px-3 py-2 bg-surface-bg border border-surface-border text-content-main focus:border-primary-accent outline-none transition"
            required
          />
        </div>

        <button 
          type="submit" 
          disabled={loading}
          className="w-full mt-2 bg-primary-accent hover:opacity-90 text-white font-bold tracking-widest uppercase py-3 transition disabled:opacity-50 disabled:cursor-not-allowed border border-transparent"
        >
          {loading ? 'Authenticating...' : 'Log In'}
        </button>
      </form>

      <p className="text-center mt-6 text-content-dim font-mono text-xs pt-4 border-t border-surface-border opacity-70">
        No account? <Link to="/register" className="text-primary-accent hover:underline uppercase tracking-wider pl-2">Sign up</Link>
      </p>
    </div>
  );
}
