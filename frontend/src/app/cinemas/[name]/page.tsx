'use client';

import { useState, useEffect, use } from 'react';
import Link from 'next/link';
import { MapPin, Heart, ChevronDown, ChevronRight, Loader2, Info, Ticket, Coffee, Play } from 'lucide-react';
import Navbar from '@/components/Navbar';

export default function CinemaDetailPage({ params }: { params: Promise<{ name: string }> | { name: string } }) {
  const resolvedParams = params instanceof Promise ? use(params) : params;
  const cinemaName = decodeURIComponent(resolvedParams.name);

  const [data, setData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(new Date().getDate().toString());

  useEffect(() => {
    const fetchDetails = async () => {
      try {
        const res = await fetch(`http://localhost:5000/api/cinemas/${encodeURIComponent(cinemaName)}`);
        if (res.ok) {
          const json = await res.json();
          setData(json);
          // Set initial date from first showtime if available
          if (json.movies.length > 0 && json.movies[0].showtimes.length > 0) {
             const firstDate = new Date(json.movies[0].showtimes[0].showTime).getDate().toString();
             setSelectedDate(firstDate);
          }
        }
      } catch (e) {
        console.error(e);
      } finally {
        setIsLoading(false);
      }
    };
    fetchDetails();
  }, [cinemaName]);

  const getDates = () => {
    if (!data) return [];
    const allShowtimes = data.movies.flatMap((m: any) => m.showtimes);
    return Array.from(new Map(allShowtimes.map((st: any) => {
      const d = new Date(st.showTime);
      d.setHours(0,0,0,0);
      const time = d.getTime();
      const day = d.getDate().toString();
      const month = d.toLocaleString('en-US', { month: 'short' }).toUpperCase();
      const weekday = d.toLocaleString('en-US', { weekday: 'short' }).toUpperCase();
      return [time, { day, month, weekday, time }];
    })).values()).sort((a: any, b: any) => a.time - b.time);
  };

  const dates = getDates();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center">
        <Loader2 className="w-12 h-12 text-[#c084fc] animate-spin mb-4" />
        <p className="text-[#c084fc] font-black uppercase tracking-widest text-sm">Loading Cinema Schedule...</p>
      </div>
    );
  }

  if (!data) {
     return (
        <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center text-white">
           <h1 className="text-3xl font-black uppercase tracking-tighter mb-4">Cinema Not Found</h1>
           <Link href="/cinemas" className="text-fuchsia-400 font-bold uppercase tracking-widest text-xs hover:underline">Back to all cinemas</Link>
        </div>
     );
  }

  const { cinema, movies } = data;

  return (
    <div className="min-h-screen bg-slate-950 text-white selection:bg-fuchsia-500/30">
      <Navbar />

      <div className="max-w-[1400px] mx-auto px-4 lg:px-12 py-24">
        
        {/* Cinema Header */}
        <div className="flex flex-col gap-6 mb-16 animate-in fade-in slide-in-from-top-4 duration-700">
           <div className="flex items-center gap-4">
              <Heart className="w-6 h-6 text-slate-700 hover:text-red-500 transition-colors cursor-pointer" />
              <h1 className="text-4xl lg:text-5xl font-black tracking-tighter uppercase whitespace-pre-wrap">{cinema.name}</h1>
           </div>
           
           <div className="flex flex-col lg:flex-row lg:items-center gap-6 justify-between">
              <div className="flex items-start gap-3 max-w-2xl group cursor-pointer">
                 <MapPin className="w-5 h-5 text-fuchsia-500 group-hover:animate-bounce mt-0.5" />
                 <p className="text-slate-400 font-bold uppercase tracking-widest text-xs leading-relaxed transition-colors group-hover:text-slate-300">
                    {cinema.address}
                 </p>
              </div>
              <button className="flex items-center gap-2 text-fuchsia-400 font-black uppercase tracking-[0.2em] text-[10px] hover:text-fuchsia-300 transition-colors group">
                 Cinema Info <ChevronDown className="w-3 h-3 group-hover:translate-y-0.5 transition-transform" />
              </button>
           </div>
        </div>

        {/* Action Bar (Dates & Filters) - Reference Image Style */}
        <div className="bg-slate-900 border border-white/5 rounded-[2.5rem] p-2 flex flex-col xl:flex-row items-center justify-between gap-4 mb-12 shadow-2xl relative z-20">
            <div className="flex items-center gap-4 overflow-x-auto w-full xl:w-auto custom-scrollbar pb-4 xl:pb-0 px-4 pt-2 min-h-[100px]">
               {dates.map((d: any, i: number) => (
                  <div 
                    key={i} 
                    onClick={() => setSelectedDate(d.day)}
                    className={`flex flex-col items-center justify-center w-14 h-[84px] rounded-full cursor-pointer transition-all duration-300 shrink-0
                      ${selectedDate === d.day ? 'bg-[#c084fc] text-slate-900 shadow-[0_0_20px_rgba(192,132,252,0.4)] scale-110' : 'text-slate-500 hover:text-white hover:bg-white/5'}
                    `}
                  >
                     <span className="text-[10px] uppercase font-bold opacity-80 mb-1 tracking-widest">{d.month}</span>
                     <span className="text-2xl font-black leading-none mb-1">{d.day}</span>
                     <span className="text-[10px] uppercase font-bold opacity-80">{d.weekday}</span>
                  </div>
               ))}
            </div>

            <div className="hidden xl:block w-px h-12 bg-white/10" />

            <div className="flex flex-wrap items-center justify-center gap-3 xl:gap-6 w-full xl:w-auto px-6 pb-2 xl:pb-0">
               <div className="flex items-center gap-3 text-xs font-black uppercase tracking-widest text-slate-500">
                  <div className="flex items-center gap-2">
                     <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" /> Available
                  </div>
                  <div className="flex items-center gap-2">
                     <div className="w-2.5 h-2.5 rounded-full bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.5)]" /> Filling
                  </div>
               </div>
            </div>
        </div>

        {/* Movies & Showtimes List */}
        <div className="flex flex-col gap-8">
           {movies.map((mObj: any) => {
              const movieShowtimes = mObj.showtimes.filter((st: any) => new Date(st.showTime).getDate().toString() === selectedDate);
              if (movieShowtimes.length === 0) return null;

              return (
                 <div key={mObj.movie._id} className="bg-slate-900/40 backdrop-blur-md rounded-[3rem] p-8 lg:p-12 border border-white/5 hover:border-white/10 transition-colors shadow-xl flex flex-col lg:flex-row gap-10 group">
                    
                    {/* Movie Poster & Title */}
                    <div className="lg:w-1/3 shrink-0 flex flex-col">
                       <Link href={`/movies/${mObj.movie._id}`} className="block relative aspect-[2/3] w-48 rounded-2xl overflow-hidden mb-6 shadow-2xl transition-transform group-hover:scale-105">
                          <img src={mObj.movie.image} alt={mObj.movie.title} className="w-full h-full object-cover" />
                          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent" />
                          <div className="absolute bottom-4 left-4 flex group-hover:translate-x-1 transition-transform">
                             <Play className="w-4 h-4 text-fuchsia-500 fill-fuchsia-500" />
                          </div>
                       </Link>
                       <h2 className="text-2xl lg:text-3xl font-black text-white uppercase tracking-tighter mb-2 group-hover:text-fuchsia-400 transition-colors">{mObj.movie.title}</h2>
                       <div className="flex items-center gap-4 text-slate-500">
                           <div className="flex gap-2">
                              {mObj.movie.tags?.slice(0, 2).map((t: string) => (
                                 <span key={t} className="text-[10px] font-bold uppercase tracking-widest border border-white/10 px-2 py-0.5 rounded-md">{t}</span>
                              ))}
                           </div>
                           <span className="text-[10px] font-black text-slate-700 opacity-60">UA | {mObj.movie.langs?.split(',')[0]}</span>
                       </div>
                    </div>

                    {/* Timings Grid */}
                    <div className="flex-1 flex flex-wrap gap-4 items-start content-start">
                       {movieShowtimes.map((st: any) => {
                          const totalSeats = st.seats.length || 1;
                          const bookedSeats = st.seats.filter((s: any) => s.isBooked).length;
                          let status = 'available';
                          if (bookedSeats / totalSeats > 0.6) status = 'filling';
                          if (bookedSeats === totalSeats) status = 'sold-out';

                          return (
                             <Link
                               href={`/movies/${mObj.movie._id}`}
                               key={st._id}
                               className={`group/btn relative flex flex-col items-center justify-center px-8 py-4 min-w-[140px] rounded-2xl border transition-all overflow-hidden
                                 ${status === 'available' 
                                   ? 'border-emerald-500/20 text-emerald-400 bg-emerald-500/5 hover:bg-emerald-500/10 hover:border-emerald-500 hover:shadow-[0_0_20px_rgba(16,185,129,0.2)]' 
                                   : status === 'sold-out' ? 'opacity-30 cursor-not-allowed border-white/5' : 'border-amber-500/20 text-amber-400 bg-amber-500/5 hover:bg-amber-500/10 hover:border-amber-500 hover:shadow-[0_0_20px_rgba(245,158,11,0.2)]'}
                               `}
                             >
                                <span className="font-black text-lg text-white group-hover/btn:-translate-y-0.5 transition-transform">{st.timeString}</span>
                                <span className="text-[10px] font-black uppercase tracking-[0.2em] mt-1 opacity-50 group-hover/btn:translate-y-0.5 transition-transform">{st.format}</span>
                                <div className={`absolute top-3 right-3 w-1.5 h-1.5 rounded-full ${status === 'available' ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]' : status === 'filling' ? 'bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.5)]' : 'hidden'}`} />
                                <div className="text-[8px] font-black uppercase tracking-widest mt-2 opacity-30">{status === 'filling' ? 'FAST FILLING' : status === 'sold-out' ? 'SOLD OUT' : 'AVAILABLE'}</div>
                             </Link>
                          );
                       })}
                    </div>
                 </div>
              );
           })}

           {movies.every((m: any) => !m.showtimes.some((st: any) => new Date(st.showTime).getDate().toString() === selectedDate)) && (
              <div className="py-24 text-center border-2 border-dashed border-white/5 rounded-[4rem] bg-white/2">
                 <Loader2 className="w-12 h-12 text-slate-800 mx-auto mb-4" />
                 <h3 className="text-xl font-bold text-slate-600 uppercase tracking-tighter">No shows scheduled for this date</h3>
                 <p className="text-slate-700 text-xs font-bold uppercase mt-2 tracking-widest">Please select another date above</p>
              </div>
           )}
        </div>
      </div>
      
      {/* Footer Branding */}
      <div className="max-w-[1400px] mx-auto px-4 lg:px-12 pb-24 text-center opacity-20">
         <div className="h-px bg-gradient-to-r from-transparent via-white to-transparent mb-12" />
         <h2 className="text-8xl font-black tracking-tighter text-white/5 select-none">CINEMATE</h2>
      </div>
    </div>
  );
}
