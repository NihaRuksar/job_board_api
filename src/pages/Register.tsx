import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { UserPlus } from 'lucide-react';

export default function Register() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<'seeker' | 'company'>('seeker');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, role })
      });
      
      const data = await res.json();
      
      if (!res.ok) {
        throw new Error(data.error || 'Registration failed');
      }

      // Automatically redirect to login
      navigate('/login');
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
          <UserPlus size={20} />
        </div>
        <h1 className="text-lg font-bold tracking-[2px] uppercase text-content-main">Create Account</h1>
        <p className="text-content-dim font-mono text-xs mt-2 uppercase">Initialize new entity</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4 font-mono text-xs">
        {error && (
          <div className="bg-[rgba(239,68,68,0.1)] text-red-500 p-3 border border-red-500/50">
            {error}
          </div>
        )}
        
        <div className="grid grid-cols-2 gap-3 mb-4">
          <button
            type="button"
            onClick={() => setRole('seeker')}
            className={`py-2 rounded uppercase tracking-wider font-bold border transition-all ${role === 'seeker' ? 'border-primary-accent bg-[rgba(59,130,246,0.1)] text-primary-accent' : 'border-surface-border text-content-dim bg-surface-bg hover:border-content-dim'}`}
          >
            Seeker
          </button>
          <button
            type="button"
            onClick={() => setRole('company')}
            className={`py-2 rounded uppercase tracking-wider font-bold border transition-all ${role === 'company' ? 'border-primary-accent bg-[rgba(59,130,246,0.1)] text-primary-accent' : 'border-surface-border text-content-dim bg-surface-bg hover:border-content-dim'}`}
          >
            Company
          </button>
        </div>

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
          {loading ? 'Processing...' : 'Register'}
        </button>
      </form>

      <p className="text-center mt-6 text-content-dim font-mono text-xs pt-4 border-t border-surface-border opacity-70">
        Account exists? <Link to="/login" className="text-primary-accent hover:underline uppercase tracking-wider pl-2">Log in</Link>
      </p>
    </div>
  );
}
