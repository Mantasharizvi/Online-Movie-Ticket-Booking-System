'use client';
import { useState } from 'react';
import Link from 'next/link';
import { Film, Mail, Lock, ArrowRight, Loader2, User, XCircle, AlertCircle, X } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

export default function Login() {
  const [isLogin, setIsLogin] = useState(true);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showDeactivatedModal, setShowDeactivatedModal] = useState(false);
  
  const { login, signup } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      if (isLogin) {
        await login(email, password);
      } else {
        await signup(name, email, password);
      }
    } catch (err: any) {
      if (err.message.includes('deactivated')) {
        setShowDeactivatedModal(true);
      } else {
        setError(err.message || 'An error occurred. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-slate-950 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background gradients */}
      <div className="absolute top-[-10%] left-[-10%] w-[32rem] h-[32rem] bg-fuchsia-600/20 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[32rem] h-[32rem] bg-indigo-600/20 rounded-full blur-[120px] pointer-events-none" />

      <div className="w-full max-w-md bg-white/5 backdrop-blur-2xl border border-white/10 rounded-[2.5rem] shadow-2xl overflow-hidden z-10 animate-in fade-in zoom-in duration-500">
        <div className="p-8 lg:p-10">
          <div className="flex justify-center mb-10">
            <Link href="/" className="flex items-center gap-3 group">
              <Film className="h-10 w-10 text-fuchsia-500 group-hover:scale-110 transition-transform duration-300" />
              <span className="font-extrabold text-3xl tracking-widest text-white">CINEMATE<span className="text-fuchsia-500 text-2xl leading-none">.</span></span>
            </Link>
          </div>

          <div className="mb-10 text-center">
            <h1 className="text-3xl font-extrabold text-white mb-2 tracking-tight">
              {isLogin ? 'Welcome Back' : 'Create Account'}
            </h1>
            <p className="text-slate-400 font-medium">
              {isLogin ? 'Enter your credentials to continue' : 'Join us to book your favorite movies'}
            </p>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-2xl text-red-400 text-sm font-bold animate-in slide-in-from-top-2">
              {error}
            </div>
          )}

          <form className="space-y-5" onSubmit={handleSubmit}>
            {!isLogin && (
              <div className="space-y-2">
                <label className="text-xs font-black uppercase tracking-[0.15em] text-slate-500 ml-1">Full Name</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <User className="h-5 w-5 text-slate-600" />
                  </div>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Enter your name"
                    className="w-full pl-11 pr-4 py-4 bg-slate-900/50 border border-white/5 rounded-2xl text-white placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-fuchsia-500/50 transition-all font-bold"
                  />
                </div>
              </div>
            )}
            
            <div className="space-y-2">
              <label className="text-xs font-black uppercase tracking-[0.15em] text-slate-500 ml-1">Email Address</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-slate-600" />
                </div>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="w-full pl-11 pr-4 py-4 bg-slate-900/50 border border-white/5 rounded-2xl text-white placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-fuchsia-500/50 transition-all font-bold"
                />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-center ml-1">
                <label className="text-xs font-black uppercase tracking-[0.15em] text-slate-500">Password</label>
                {isLogin && (
                  <button type="button" className="text-[10px] uppercase font-black tracking-widest text-fuchsia-500 hover:text-fuchsia-400 transition-colors">
                    Reset?
                  </button>
                )}
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-slate-600" />
                </div>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-11 pr-4 py-4 bg-slate-900/50 border border-white/5 rounded-2xl text-white placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-fuchsia-500/50 transition-all font-bold"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full group relative flex justify-center items-center gap-2 py-4 px-4 bg-fuchsia-600 hover:bg-fuchsia-500 text-white rounded-2xl font-black shadow-xl shadow-fuchsia-900/40 transition-all active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <>
                  {isLogin ? 'Sign In Now' : 'Create Account'}
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>
          </form>

          <div className="mt-10 text-center">
            <button 
              onClick={() => {
                setIsLogin(!isLogin);
                setError('');
              }}
              className="text-slate-400 text-xs font-bold hover:text-white transition-colors"
            >
              {isLogin ? "Don't have an account? " : "Already have an account? "}
              <span className="text-fuchsia-500 ml-1 underline decoration-fuchsia-500/30 underline-offset-4">
                {isLogin ? 'Sign up' : 'Sign in'}
              </span>
            </button>
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
              
              <h2 className="text-2xl font-black text-white mb-2">Access Denied</h2>
              <p className="text-slate-400 font-bold text-sm leading-relaxed mb-8">
                Your account has been deactivated by an administrator. Please contact our support team for more information.
              </p>

              <button 
                onClick={() => setShowDeactivatedModal(false)}
                className="w-full bg-slate-950 border border-white/5 text-white py-4 rounded-2xl font-black uppercase tracking-widest hover:bg-slate-800 transition-all"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
