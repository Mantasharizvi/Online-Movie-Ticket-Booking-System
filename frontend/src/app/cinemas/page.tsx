'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { MapPin, Star, ChevronRight, Loader2, Search, Clapperboard } from 'lucide-react';
import Navbar from '@/components/Navbar';

export default function CinemasPage() {
  const [cinemas, setCinemas] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const fetchCinemas = async () => {
      try {
        const res = await fetch('http://localhost:5000/api/cinemas');
        if (res.ok) {
          setCinemas(await res.json());
        }
      } catch (e) {
        console.error(e);
      } finally {
        setIsLoading(false);
      }
    };
    fetchCinemas();
  }, []);

  const filteredCinemas = cinemas.filter(c => 
    c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.city.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center">
        <Loader2 className="w-12 h-12 text-[#c084fc] animate-spin mb-4" />
        <p className="text-[#c084fc] font-black uppercase tracking-widest text-sm">Discovering Cinemas...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white selection:bg-fuchsia-500/30">
      <Navbar />
      
      {/* Background Glows */}
      <div className="fixed top-0 left-0 w-[800px] h-[800px] bg-[#c084fc]/10 rounded-full blur-[150px] pointer-events-none -translate-x-1/2 -translate-y-1/2" />
      <div className="fixed bottom-0 right-0 w-[600px] h-[600px] bg-purple-900/10 rounded-full blur-[120px] pointer-events-none translate-x-1/3 translate-y-1/3" />

      <div className="relative z-10 max-w-[1400px] mx-auto px-4 lg:px-8 py-24">
        
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-16">
          <div className="max-w-2xl">
            <h1 className="text-5xl lg:text-7xl font-black tracking-tighter mb-6 bg-clip-text text-transparent bg-gradient-to-r from-white via-white to-slate-500">
              EXPLORE <br/>CINEMAS
            </h1>
            <p className="text-slate-400 font-bold uppercase tracking-widest text-xs leading-relaxed max-w-lg">
              Find the perfect venue for your next movie experience. Explore top-rated theaters in your city.
            </p>
          </div>
          
          <div className="relative w-full md:w-80 group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 group-focus-within:text-fuchsia-400 transition-colors" />
            <input 
              type="text" 
              placeholder="SEARCH BY NAME OR CITY..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-900/50 border border-white/10 rounded-2xl py-4 pl-12 pr-6 text-xs font-black lowercase tracking-widest outline-none focus:border-fuchsia-500/50 focus:bg-slate-900 transition-all placeholder:text-slate-700"
            />
          </div>
        </div>

        {/* Cinemas Grid */}
        {filteredCinemas.length === 0 ? (
          <div className="py-32 flex flex-col items-center justify-center border border-dashed border-white/5 rounded-[4rem] bg-white/2">
            <MapPin className="w-16 h-16 text-slate-800 mb-6" />
            <h3 className="text-2xl font-black text-slate-600 uppercase tracking-tighter">No Cinemas Found</h3>
            <p className="text-slate-700 text-xs font-bold uppercase mt-2 tracking-widest">Try a different search term or city</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 lg:gap-12">
            {filteredCinemas.map((cinema) => (
              <Link 
                href={`/cinemas/${encodeURIComponent(cinema.name)}`} 
                key={cinema._id}
                className="group flex flex-col h-full bg-slate-900/40 rounded-[2.5rem] border border-white/5 overflow-hidden hover:border-fuchsia-500/30 transition-all duration-500 hover:shadow-[0_0_50px_rgba(192,132,252,0.1)] hover:-translate-y-2"
              >
                {/* Cinema Image */}
                <div className="relative aspect-[16/10] overflow-hidden">
                  <img 
                    src={cinema.image || "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?auto=format&fit=crop&q=80&w=2000"} 
                    alt={cinema.name}
                    className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110 group-hover:rotate-1"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent" />
                  
                  {/* Rating Badge */}
                  <div className="absolute top-6 left-6 px-4 py-2 bg-slate-950/90 backdrop-blur-md rounded-2xl border border-white/10 flex items-center gap-2">
                    <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
                    <span className="text-xs font-black text-white">{cinema.rating || '4.0'}</span>
                  </div>
                </div>

                {/* Cinema Info */}
                <div className="p-8 flex flex-col flex-1">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-1 h-1 bg-fuchsia-500 rounded-full" />
                    <span className="text-[10px] font-black text-fuchsia-500 uppercase tracking-[0.3em]">{cinema.city}</span>
                  </div>
                  
                  <h2 className="text-2xl lg:text-3xl font-black text-white mb-4 tracking-tight group-hover:text-fuchsia-400 transition-colors">
                    {cinema.name}
                  </h2>
                  
                  <div className="flex items-start gap-4 mb-8 text-slate-500">
                    <MapPin className="w-5 h-5 shrink-0 text-slate-700" />
                    <p className="text-xs font-bold leading-relaxed line-clamp-2 uppercase tracking-wider">{cinema.address}</p>
                  </div>

                  <div className="mt-auto flex items-center justify-between border-t border-white/5 pt-6">
                    <div className="flex gap-2">
                      {cinema.facilities?.slice(0, 3).map((f: string) => (
                        <div key={f} className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center border border-white/5">
                           <span className="text-[8px] font-black text-slate-400 uppercase tracking-tighter truncate px-1">{f}</span>
                        </div>
                      ))}
                    </div>
                    <div className="flex items-center gap-2 text-fuchsia-400 text-[10px] font-black uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-all translate-x-4 group-hover:translate-x-0">
                      View Shows <ChevronRight className="w-3 h-3" />
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}

      </div>
    </div>
  );
}
