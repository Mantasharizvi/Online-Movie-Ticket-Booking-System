'use client';

import { useState, useEffect } from 'react';
import CinemateNavbar from '@/components/WatcherNavbar';
import { Loader2, Play, Bell, Calendar, ChevronLeft, Info, Star } from 'lucide-react';
import Link from 'next/link';

export default function UpcomingMoviesPage() {
  const [movies, setMovies] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchUpcoming = async () => {
      try {
        const res = await fetch('http://localhost:5000/api/movies/upcoming');
        if (res.ok) {
          setMovies(await res.json());
        }
      } catch (e) {
        console.error(e);
      } finally {
        setIsLoading(false);
      }
    };
    fetchUpcoming();
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center">
        <Loader2 className="w-12 h-12 text-fuchsia-500 animate-spin mb-4" />
        <p className="text-fuchsia-400 font-bold uppercase tracking-[0.3em] text-xs">Loading Future Cinema...</p>
      </div>
    );
  }

  const featuredMovie = movies[0];

  return (
    <div className="min-h-screen bg-slate-950 text-white font-outfit overflow-x-hidden">
      <CinemateNavbar />

      {/* Hero Section */}
      {featuredMovie && (
        <section className="relative h-[80vh] w-full mt-16 overflow-hidden">
          <div className="absolute inset-0">
             <img 
               src={featuredMovie.cover || featuredMovie.image} 
               className="w-full h-full object-cover scale-105 active:scale-100 transition-transform duration-10000 linear"
               alt="Featured Backdrop"
             />
             <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/60 to-transparent" />
             <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-transparent to-transparent" />
          </div>

          <div className="relative h-full max-w-7xl mx-auto px-6 flex flex-col justify-center gap-6">
            <div className="flex items-center gap-3 animate-in slide-in-from-left-8 duration-700">
               <span className="px-3 py-1 bg-fuchsia-600 rounded-full text-[10px] font-black uppercase tracking-[0.2em] shadow-lg shadow-fuchsia-900/40">Highly Anticipated</span>
               <div className="flex items-center gap-1 text-fuchsia-400 font-bold text-xs uppercase tracking-widest">
                  <Star className="w-3 h-3 fill-fuchsia-400" /> Coming {new Date(featuredMovie.releaseDate).getFullYear()}
               </div>
            </div>

            <h1 className="text-6xl md:text-8xl font-black tracking-tighter uppercase max-w-3xl animate-in slide-in-from-left-12 duration-1000">
               {featuredMovie.title}
            </h1>

            <p className="text-lg text-slate-300 max-w-2xl line-clamp-3 font-medium leading-relaxed animate-in slide-in-from-left-16 duration-1000 delay-150">
               {featuredMovie.description}
            </p>

            <div className="flex items-center gap-4 animate-in slide-in-from-left-20 duration-1000 delay-300">
               <button className="px-8 py-4 bg-white text-black rounded-2xl font-black uppercase tracking-widest text-xs flex items-center gap-3 hover:bg-fuchsia-500 hover:text-white transition-all shadow-2xl">
                  <Play className="w-4 h-4 fill-current" /> Watch Trailer
               </button>
               <button className="px-8 py-4 bg-white/10 backdrop-blur-md border border-white/10 rounded-2xl font-black uppercase tracking-widest text-xs flex items-center gap-3 hover:bg-white/20 transition-all">
                  <Bell className="w-4 h-4" /> Notify Me
               </button>
            </div>
          </div>
        </section>
      )}

      {/* Main Showcase */}
      <section className="max-w-[1400px] mx-auto px-6 py-20">
        <div className="flex items-end justify-between mb-16 px-2">
           <div>
              <h2 className="text-3xl font-black tracking-tight mb-2 uppercase">Coming Soon</h2>
              <div className="h-1 w-20 bg-fuchsia-600 rounded-full" />
           </div>
           <p className="text-slate-500 font-black uppercase tracking-widest text-[10px]">Showing {movies.length} Upcoming Titles</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
          {movies.map((movie, index) => (
            <div 
              key={movie._id} 
              className="group relative bg-slate-900/40 border border-white/5 rounded-[2.5rem] overflow-hidden backdrop-blur-3xl hover:border-fuchsia-500/30 transition-all hover:-translate-y-3 duration-500"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              {/* Card Poster Area */}
              <div className="relative aspect-[16/10] overflow-hidden">
                 <img 
                   src={movie.cover || movie.image} 
                   className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" 
                   alt={movie.title}
                 />
                 <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent" />
                 
                 {/* Date Badge */}
                 <div className="absolute bottom-4 left-6 flex items-center gap-2 bg-slate-950/80 backdrop-blur-md px-4 py-2 rounded-xl border border-white/5">
                    <Calendar className="w-3 h-3 text-fuchsia-500" />
                    <span className="text-[10px] font-black uppercase tracking-widest text-white">
                       {movie.releaseDate ? new Date(movie.releaseDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'TBA'}
                    </span>
                 </div>
              </div>

              {/* Content */}
              <div className="p-8">
                <div className="flex items-center gap-2 mb-3">
                   {movie.tags?.slice(0, 2).map((tag: string) => (
                      <span key={tag} className="text-[9px] font-black uppercase tracking-tighter text-slate-500 border border-white/10 px-2 py-0.5 rounded-md">
                         {tag}
                      </span>
                   ))}
                </div>
                
                <h3 className="text-2xl font-black mb-3 line-clamp-1 group-hover:text-fuchsia-400 transition-colors uppercase tracking-tighter">
                   {movie.title}
                </h3>
                
                <p className="text-slate-400 text-sm line-clamp-2 mb-8 font-medium italic">
                   "{movie.description}"
                </p>

                <div className="flex items-center gap-3">
                   <button className="flex-1 py-4 bg-fuchsia-600 rounded-2xl font-black uppercase tracking-widest text-[10px] shadow-lg shadow-fuchsia-900/20 hover:bg-fuchsia-500 transition-all flex items-center justify-center gap-2">
                       <Play className="w-3 h-3 fill-current" /> Trailer
                   </button>
                   <button className="w-14 h-14 bg-white/5 border border-white/5 rounded-2xl flex items-center justify-center hover:bg-white/10 transition-all group/info">
                       <Info className="w-5 h-5 text-slate-400 group-hover/info:text-white" />
                   </button>
                </div>
              </div>

              {/* Decorative Accent */}
              <div className="absolute top-0 right-0 w-32 h-32 bg-fuchsia-600/10 blur-[60px] pointer-events-none group-hover:bg-fuchsia-600/20 transition-all" />
            </div>
          ))}
        </div>
      </section>

      {/* Footer CTA */}
      <section className="max-w-7xl mx-auto px-6 py-32 text-center">
         <div className="relative p-20 rounded-[4rem] bg-gradient-to-br from-fuchsia-900/20 to-slate-900/20 border border-white/5 overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10 pointer-events-none" />
            <h2 className="text-5xl font-black mb-6 uppercase tracking-tight">Stay in the Loop</h2>
            <p className="text-slate-400 max-w-xl mx-auto mb-12 font-medium">Never miss a premiere. Sign up to get notified about early access bookings and exclusive fan events.</p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center max-w-md mx-auto">
               <input 
                 type="email" 
                 placeholder="your@email.com" 
                 className="flex-1 bg-slate-950 border border-white/10 rounded-2xl px-6 py-4 outline-none focus:ring-2 focus:ring-fuchsia-500/50 transition-all"
               />
               <button className="bg-white text-black px-10 py-4 rounded-2xl font-black uppercase tracking-widest text-[10px] hover:bg-fuchsia-500 hover:text-white transition-all">
                  Join The Club
               </button>
            </div>
         </div>
      </section>

      {/* Floating Back Button */}
      <Link href="/" className="fixed bottom-10 left-10 z-[100] w-14 h-14 bg-slate-900/80 backdrop-blur-xl border border-white/10 rounded-full flex items-center justify-center text-white hover:border-fuchsia-500 group transition-all shadow-2xl">
         <ChevronLeft className="w-6 h-6 group-hover:-translate-x-1 transition-transform" />
      </Link>
    </div>
  );
}
