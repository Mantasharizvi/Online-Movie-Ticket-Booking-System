'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { Film, Search, LogOut, LayoutDashboard, Loader2 } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';

export default function Navbar() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [results, setResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(async () => {
      if (searchQuery.trim().length > 0) {
        setIsSearching(true);
        try {
          const res = await fetch(`http://localhost:5000/api/movies/search?query=${searchQuery}`);
          if (res.ok) {
            const data = await res.json();
            setResults(data);
            setShowResults(true);
          }
        } catch (err) {
          console.error('Search error:', err);
        } finally {
          setIsSearching(false);
        }
      } else {
        setResults([]);
        setShowResults(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Click outside listener
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setShowResults(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleResultClick = (id: string) => {
    setShowResults(false);
    setSearchQuery('');
    router.push(`/movies/${id}`);
  };

  return (
    <nav className="fixed w-full z-50 bg-black/40 backdrop-blur-md border-b border-white/10 transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <Link href="/" className="flex items-center gap-2 group">
              <Film className="h-8 w-8 text-fuchsia-500 group-hover:text-fuchsia-400 transition-colors" />
              <h1 className="font-extrabold text-2xl tracking-widest text-white">CINEMATE<span className="text-fuchsia-500 text-xl leading-none">.</span></h1>
            </Link>
          </div>
          
          <div className="hidden md:block flex-1 max-w-md mx-8 relative" ref={searchRef}>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                {isSearching ? (
                  <Loader2 className="h-4 w-4 text-fuchsia-500 animate-spin" />
                ) : (
                  <Search className="h-4 w-4 text-slate-500" />
                )}
              </div>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onFocus={() => searchQuery.length > 0 && setShowResults(true)}
                className="block w-full pl-10 pr-3 py-2 border border-white/5 rounded-full leading-5 bg-white/5 text-slate-300 placeholder-slate-600 focus:outline-none focus:bg-white/10 focus:ring-1 focus:ring-fuchsia-500 focus:border-fuchsia-500 transition-all sm:text-sm font-medium"
                placeholder="Search movies..."
              />
            </div>

            {/* Results Dropdown */}
            {showResults && results.length > 0 && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-slate-900/95 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl shadow-black/50 overflow-hidden z-[100] animate-in fade-in slide-in-from-top-2 duration-200">
                <div className="max-h-[400px] overflow-y-auto custom-scrollbar">
                  <div className="p-2">
                    <p className="px-4 py-2 text-[10px] font-black text-slate-500 uppercase tracking-widest border-b border-white/5 mb-2">Movie Results</p>
                    {results.map((movie) => (
                      <div 
                        key={movie._id}
                        onClick={() => handleResultClick(movie._id)}
                        className="flex items-center gap-4 p-2 hover:bg-white/5 rounded-xl cursor-pointer transition-all group"
                      >
                        <div className="w-12 h-16 rounded-lg overflow-hidden shrink-0 border border-white/5 group-hover:border-fuchsia-500/50 transition-colors">
                          <img 
                            src={movie.image || "https://images.unsplash.com/photo-1542204165-65bf26472b9b?auto=format&fit=crop&q=80&w=200"} 
                            alt={movie.title}
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="text-sm font-bold text-white group-hover:text-fuchsia-400 transition-colors truncate">{movie.title}</h4>
                          <p className="text-[10px] text-slate-500 font-extrabold uppercase tracking-tighter">Movie • In Lucknow</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
            
            {showResults && searchQuery.length > 0 && results.length === 0 && !isSearching && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-slate-900/95 backdrop-blur-xl border border-white/10 rounded-2xl p-6 text-center shadow-2xl z-[100]">
                <p className="text-slate-500 font-bold text-xs uppercase tracking-widest">No movies found for "{searchQuery}"</p>
              </div>
            )}
          </div>

          <div className="flex items-center gap-3">
            {user ? (
              <div className="flex items-center gap-3">
                {user.role === 'admin' && (
                  <Link 
                    href="/admin" 
                    className="flex items-center gap-2 px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-widest text-fuchsia-400 bg-fuchsia-500/10 border border-fuchsia-500/20 hover:bg-fuchsia-500/20 transition-all"
                  >
                    <LayoutDashboard className="w-4 h-4" />
                    Dashboard
                  </Link>
                )}
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10">
                   <div className="w-7 h-7 rounded-full bg-fuchsia-600 flex items-center justify-center text-[10px] font-black text-white shadow-lg">
                      {user.name.charAt(0)}
                   </div>
                   <span className="hidden sm:inline text-xs font-bold text-slate-300">{user.name}</span>
                </div>
                <button 
                  onClick={logout}
                  className="p-2 rounded-full hover:bg-red-500/10 text-slate-500 hover:text-red-500 transition-all border border-transparent hover:border-red-500/20"
                  title="Logout"
                >
                  <LogOut className="w-5 h-5" />
                </button>
              </div>
            ) : (
              <>
                <Link 
                  href="/login" 
                  className="px-5 py-2 rounded-full text-[10px] font-black uppercase tracking-widest text-white hover:bg-white/10 transition-all border border-white/10"
                >
                  Sign In
                </Link>
                <Link 
                  href="/login" 
                  className="hidden sm:block px-5 py-2 rounded-full text-[10px] font-black uppercase tracking-widest text-white bg-fuchsia-600 hover:bg-fuchsia-500 transition-all shadow-lg shadow-fuchsia-900/40"
                >
                  Sign Up
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
