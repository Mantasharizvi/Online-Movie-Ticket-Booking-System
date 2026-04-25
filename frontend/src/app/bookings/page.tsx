'use client';
import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import CinemateNavbar from '@/components/WatcherNavbar';
import { Loader2, Ticket, Calendar, Clock, MapPin, ChevronRight, Inbox, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function UserBookingsPage() {
   const { user, token } = useAuth();
   const router = useRouter();
   const [bookings, setBookings] = useState<any[]>([]);
   const [isLoading, setIsLoading] = useState(true);

   useEffect(() => {
      const fetchBookings = async () => {
         if (!token) {
            setIsLoading(false);
            return;
         }
         try {
            const res = await fetch('http://localhost:5000/api/bookings/my-bookings', {
               headers: { 'Authorization': `Bearer ${token}` }
            });
            if (res.ok) {
               setBookings(await res.json());
            }
         } catch (e) {
            console.error(e);
         } finally {
            setIsLoading(false);
         }
      };
      fetchBookings();
   }, [token]);

   if (isLoading) {
      return (
         <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center">
            <Loader2 className="w-12 h-12 text-[#c084fc] animate-spin mb-4" />
            <p className="text-[#c084fc] font-bold uppercase tracking-widest text-sm">Fetching your tickets...</p>
         </div>
      );
   }

   if (!user) {
      return (
         <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center text-white px-4">
            <h1 className="text-4xl font-black mb-6">Access Denied</h1>
            <p className="text-slate-400 mb-10 font-bold uppercase tracking-widest text-xs">Please login to view your bookings</p>
            <Link href="/login" className="bg-fuchsia-600 px-10 py-4 rounded-2xl font-black uppercase tracking-widest text-xs">Login Now</Link>
         </div>
      );
   }

   return (
      <div className="min-h-screen bg-slate-950 text-white font-outfit">
         <CinemateNavbar />
         
         <div className="max-w-5xl mx-auto px-6 py-16 mt-12">
            <button 
               onClick={() => router.back()}
               className="group flex items-center gap-2 text-slate-500 hover:text-fuchsia-400 transition-all mb-8 font-black uppercase tracking-[0.2em] text-[10px]"
            >
               <div className="w-8 h-8 rounded-full bg-white/5 border border-white/5 flex items-center justify-center group-hover:border-fuchsia-500/30 group-hover:bg-fuchsia-500/5">
                  <ArrowLeft className="w-4 h-4" />
               </div>
               Go Back
            </button>

            <div className="flex items-center justify-between mb-16">
               <div>
                  <h1 className="text-4xl lg:text-5xl font-black tracking-tight mb-2">My Bookings</h1>
                  <p className="text-slate-500 font-bold uppercase tracking-[0.2em] text-[10px]">Your Cinematic History</p>
               </div>
               <div className="w-16 h-16 rounded-3xl bg-fuchsia-600/10 border border-fuchsia-500/20 flex items-center justify-center text-fuchsia-400">
                  <Ticket className="w-8 h-8" />
               </div>
            </div>

            {bookings.length === 0 ? (
               <div className="bg-slate-900/40 border border-white/5 rounded-[3rem] p-20 text-center backdrop-blur-3xl">
                  <div className="w-20 h-20 bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-8">
                     <Inbox className="w-8 h-8 text-slate-600" />
                  </div>
                  <h3 className="text-2xl font-bold mb-4 text-white">No Bookings Yet</h3>
                  <p className="text-slate-500 max-w-xs mx-auto mb-10 font-medium">Explore the latest movies and book your first experience with Cinemate.</p>
                  <Link href="/" className="inline-flex items-center gap-3 text-fuchsia-400 font-black uppercase tracking-widest text-xs hover:text-fuchsia-300 transition-colors">
                     Back to Movies <ChevronRight className="w-4 h-4" />
                  </Link>
               </div>
            ) : (
               <div className="grid gap-6">
                  {bookings.map((booking) => (
                     <div key={booking._id} className="bg-slate-900/40 border border-white/5 rounded-[2.5rem] p-8 hover:border-fuchsia-500/30 transition-all group relative overflow-hidden backdrop-blur-xl">
                        <div className="flex flex-col md:flex-row gap-8 items-center">
                           {/* Movie Thumbnail */}
                           <div className="w-full md:w-32 h-44 rounded-2xl overflow-hidden shrink-0 border border-white/10">
                              <img 
                                 src={booking.showtime?.movie?.image || "https://images.unsplash.com/photo-1542204165-65bf26472b9b?auto=format&fit=crop&q=80&w=200"} 
                                 className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                                 alt="Poster"
                              />
                           </div>

                           {/* Info */}
                           <div className="flex-1 space-y-4">
                              <div className="flex items-center justify-between">
                                 <h3 className="text-2xl font-black text-white group-hover:text-fuchsia-400 transition-colors">{booking.showtime?.movie?.title || 'Unknown Movie'}</h3>
                                 <span className="text-fuchsia-500 font-black text-sm">{booking.totalAmount} Rs</span>
                              </div>

                              <div className="flex flex-wrap gap-6 text-sm">
                                 <div className="flex items-center gap-2 text-slate-400 font-bold uppercase tracking-widest text-[10px]">
                                    <Calendar className="w-3.5 h-3.5 text-fuchsia-600" />
                                    <span>{new Date(booking.createdAt).toLocaleDateString()}</span>
                                 </div>
                                 <div className="flex items-center gap-2 text-slate-400 font-bold uppercase tracking-widest text-[10px]">
                                    <Clock className="w-3.5 h-3.5 text-fuchsia-600" />
                                    <span>{booking.showtime?.timeString || 'N/A'}</span>
                                 </div>
                                 <div className="flex items-center gap-2 text-slate-400 font-bold uppercase tracking-widest text-[10px]">
                                    <MapPin className="w-3.5 h-3.5 text-fuchsia-600" />
                                    <span>{booking.showtime?.theaterName || 'Cinema Hall'}</span>
                                 </div>
                              </div>

                              <div className="pt-4 flex items-center gap-2 flex-wrap">
                                 {booking.seats.map((seat: any, i: number) => (
                                    <span key={i} className="px-3 py-1 bg-white/5 border border-white/5 rounded-lg text-fuchsia-400 text-[10px] font-black uppercase tracking-widest">
                                       {seat.row}{seat.number}
                                    </span>
                                 ))}
                              </div>
                           </div>
                        </div>
                     </div>
                  ))}
               </div>
            )}
         </div>
      </div>
   );
}
