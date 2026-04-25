'use client';
import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { Lock, Mail, Loader2, ShieldCheck, ChevronRight, XCircle } from 'lucide-react';

export default function AdminLoginPage() {
  const { login } = useAuth();
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showDeactivatedModal, setShowDeactivatedModal] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await login(email, password);
      // login handles the redirection if it's admin
    } catch (err: any) {
      if (err.message.includes('deactivated')) {
        setShowDeactivatedModal(true);
      } else {
        setError(err.message || 'Login failed. Please check your admin credentials.');
      }
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen grow flex items-center justify-center bg-slate-950 relative overflow-hidden font-outfit">
      {/* Background Elements */}
      <div className="absolute top-0 left-0 w-full h-full">
         <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-fuchsia-600/10 blur-[150px] rounded-full animate-pulse" />
         <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-600/10 blur-[150px] rounded-full animate-pulse delay-700" />
         <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full opacity-10 pointer-events-none" 
              style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, rgba(255,255,255,0.05) 1px, transparent 0)', backgroundSize: '40px 40px' }} />
      </div>

      <div className="relative z-10 w-full max-w-md px-6">
        {/* Logo/Icon */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-3xl bg-fuchsia-600/10 border border-fuchsia-500/20 text-fuchsia-500 mb-6 group transition-all hover:scale-110 hover:shadow-[0_0_30px_rgba(232,121,249,0.3)]">
             <ShieldCheck className="w-10 h-10 group-hover:animate-bounce" />
          </div>
          <h1 className="text-4xl font-black text-white mb-2 tracking-tight">Admin Portal</h1>
          <p className="text-slate-500 font-bold uppercase tracking-[0.2em] text-[10px]">Secure Access Only</p>
        </div>

        {/* Login Card */}
        <div className="bg-slate-900/40 border border-white/5 backdrop-blur-3xl rounded-[2.5rem] p-8 lg:p-10 shadow-2xl relative overflow-hidden group">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-fuchsia-500/50 to-transparent" />
          
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="bg-red-500/10 border border-red-500/20 text-red-500 px-4 py-3 rounded-2xl text-sm font-bold animate-in fade-in slide-in-from-top-2 duration-300">
                {error}
              </div>
            )}

            <div className="space-y-2">
              <label className="text-slate-400 text-xs font-black uppercase tracking-widest px-1 ml-1">Username / Email</label>
              <div className="relative group/field">
                <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none">
                  <Mail className="w-5 h-5 text-slate-600 group-focus-within/field:text-fuchsia-500 transition-colors" />
                </div>
                <input
                  type="text"
                  required
                  placeholder="admin"
                  className="w-full bg-slate-950/50 border border-white/5 rounded-2xl py-4 pl-14 pr-6 text-white placeholder-slate-600 outline-none focus:ring-2 focus:ring-fuchsia-500/40 focus:border-fuchsia-500/50 transition-all font-bold"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-slate-400 text-xs font-black uppercase tracking-widest px-1 ml-1">Password</label>
              <div className="relative group/field">
                <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none">
                  <Lock className="w-5 h-5 text-slate-600 group-focus-within/field:text-fuchsia-500 transition-colors" />
                </div>
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  className="w-full bg-slate-950/50 border border-white/5 rounded-2xl py-4 pl-14 pr-6 text-white placeholder-slate-600 outline-none focus:ring-2 focus:ring-fuchsia-500/40 focus:border-fuchsia-500/50 transition-all font-bold"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-fuchsia-600 hover:bg-fuchsia-500 disabled:opacity-50 text-white py-4 rounded-2xl font-black text-sm uppercase tracking-widest transition-all shadow-xl shadow-fuchsia-900/20 hover:shadow-fuchsia-500/30 flex items-center justify-center gap-3 active:scale-[0.98]"
            >
              {loading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <>
                  Verify Account <ChevronRight className="w-5 h-5" />
                </>
              )}
            </button>
          </form>

          {/* Helper info */}
          <div className="mt-8 text-center pt-8 border-t border-white/5">
             <p className="text-slate-600 font-bold text-[10px] uppercase tracking-widest">
                Protected by CloudGate Security Suite
             </p>
          </div>
        </div>
      </div>

      {/* Deactivated Modal */}
      {showDeactivatedModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/80 backdrop-blur-xl" onClick={() => setShowDeactivatedModal(false)} />
          <div className="bg-slate-900 border border-red-500/20 rounded-[2.5rem] w-full max-w-sm relative z-10 overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="absolute top-0 right-0 w-32 h-32 bg-red-500/5 rounded-bl-full -translate-y-8 translate-x-8" />
            
            <div className="p-10 text-center">
              <div className="w-20 h-20 bg-red-500/10 rounded-3xl flex items-center justify-center mx-auto mb-6 border border-red-500/20">
                <XCircle className="w-10 h-10 text-red-500" />
              </div>
              
              <h2 className="text-2xl font-black text-white mb-2">Admin Restricted</h2>
              <p className="text-slate-400 font-bold text-sm leading-relaxed mb-8">
                Your administrative access has been suspended. Please coordinate with the system owner for restoration.
              </p>

              <button 
                onClick={() => setShowDeactivatedModal(false)}
                className="w-full bg-slate-950 border border-white/5 text-white py-4 rounded-2xl font-black uppercase tracking-widest hover:bg-slate-800 transition-all"
              >
                Go Back
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
