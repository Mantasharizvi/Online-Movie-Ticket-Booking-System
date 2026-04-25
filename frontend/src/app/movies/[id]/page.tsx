'use client';
import { useState, useEffect, use } from 'react';
import Link from 'next/link';
import CinemateNavbar from '@/components/WatcherNavbar';
import { Play, ChevronDown, ChevronRight, ChevronLeft, Ticket, Heart, CreditCard, Coffee, Shield, Info, Loader2, CheckCircle2 } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import Script from 'next/script';

export default function WatcherMoviePage({ params }: { params: Promise<{ id: string }> | { id: string } }) {
   const resolvedParams = params instanceof Promise ? use(params) : params;
   const movieId = resolvedParams.id;
   const { token, user } = useAuth();

   const [movie, setMovie] = useState<any>(null);
   const [showtimes, setShowtimes] = useState<any[]>([]);
   const [isLoading, setIsLoading] = useState(true);

   const [activeTab, setActiveTab] = useState<'info' | 'seats'>('info');
   const [selectedDate, setSelectedDate] = useState('18');
   const [selectedSeats, setSelectedSeats] = useState<string[]>([]);

   const [selectedTheater, setSelectedTheater] = useState('');
   const [selectedTime, setSelectedTime] = useState('');
   const [selectedShowtimeObj, setSelectedShowtimeObj] = useState<any>(null);
   const [isBooking, setIsBooking] = useState(false);
   const [showSuccessModal, setShowSuccessModal] = useState(false);

   const [filterFormat, setFilterFormat] = useState('All');
   const [filterPrice, setFilterPrice] = useState('All');
   const [filterTime, setFilterTime] = useState('All');

   const handleDateChange = (newDate: string) => {
      setSelectedDate(newDate);
      setSelectedShowtimeObj(null);
      setSelectedTheater('');
      setSelectedTime('');
      setSelectedSeats([]);
      // stay on seats if already there? User said "from there we select... but inside... date is changing but time not".
      // If they are in seats and change date, we SHOULD probably go back to showtimes because the old showtime is gone.
      setActiveTab('info');
   };

   useEffect(() => {
      const fetchDetails = async () => {
         try {
            const [movRes, showRes] = await Promise.all([
               fetch(`http://localhost:5000/api/movies/${movieId}`),
               fetch(`http://localhost:5000/api/showtimes/movie/${movieId}`)
            ]);
            if (movRes.ok) setMovie(await movRes.json());
            if (showRes.ok) {
               const data = await showRes.json();
               setShowtimes(data);
               // Set initial selected date to the first available showtime
               if (data.length > 0) {
                  const firstDate = new Date(data[0].showTime).getDate().toString();
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
   }, [movieId]);

   const getTheaters = () => {
      const grouped: Record<string, any> = {};

      // Apply Filters
      const filteredShowtimes = showtimes.filter(st => {
         // Date filter
         const stDate = new Date(st.showTime).getDate().toString();
         if (stDate !== selectedDate) return false;

         // Format filter
         if (filterFormat !== 'All' && st.format !== filterFormat) return false;

         // Price filter
         if (filterPrice !== 'All') {
            const price = st.ticketPrice;
            if (filterPrice === 'Budget' && price >= 500) return false;
            if (filterPrice === 'Premium' && price < 500) return false;
         }

         // Time filter
         if (filterTime !== 'All') {
            const hour = parseInt(st.timeString.split(':')[0]);
            const isPM = st.timeString.includes('PM');
            const actualHour = (isPM && hour !== 12) ? hour + 12 : (!isPM && hour === 12 ? 0 : hour);

            if (filterTime === 'Morning' && actualHour >= 12) return false;
            if (filterTime === 'Afternoon' && (actualHour < 12 || actualHour >= 18)) return false;
            if (filterTime === 'Evening' && actualHour < 18) return false;
         }

         return true;
      });

      filteredShowtimes.forEach(st => {
         if (!grouped[st.theaterName]) {
            grouped[st.theaterName] = {
               id: st.theaterName,
               name: st.theaterName,
               amenities: ['ticket', 'food'],
               showtimes: []
            };
         }

         const totalSeats = st.seats.length || 1;
         const bookedSeats = st.seats.filter((s: any) => s.isBooked).length;
         let status = 'available';
         if (bookedSeats / totalSeats > 0.5) status = 'fast-filling';
         if (bookedSeats === totalSeats) status = 'sold-out';

         grouped[st.theaterName].showtimes.push({
            id: st._id,
            time: st.timeString,
            format: st.format,
            status: status,
            ticketPrice: st.ticketPrice,
            comfortPrice: st.comfortPrice,
            rawShowtime: st
         });
      });
      return Object.values(grouped);
   };

   const theaters = getTheaters();

   const dates = Array.from(new Map(showtimes.map(st => {
      const d = new Date(st.showTime);
      d.setHours(0,0,0,0);
      const time = d.getTime();
      const day = d.getDate().toString();
      const month = d.toLocaleString('en-US', { month: 'short' }).toUpperCase();
      const weekday = d.toLocaleString('en-US', { weekday: 'short' }).toUpperCase();
      return [time, { day, month, weekday, time }];
   })).values()).sort((a, b) => a.time - b.time);

   const selectShowtime = (theaterName: string, time: string, showObj: any) => {
      setSelectedTheater(theaterName);
      setSelectedTime(time);
      setSelectedShowtimeObj(showObj);
      setSelectedSeats([]);
      setActiveTab('seats');
   };

   const isSeatBooked = (row: string, num: number) => {
      if (!selectedShowtimeObj) return false;
      const seat = selectedShowtimeObj.rawShowtime.seats.find((s: any) => s.row === row && s.number === num);
      return seat ? seat.isBooked : false;
   };

   const handleSeatClick = (seatId: string, row: string, num: number) => {
      if (isSeatBooked(row, num)) return;
      if (selectedSeats.includes(seatId)) {
         setSelectedSeats(selectedSeats.filter(id => id !== seatId));
      } else {
         setSelectedSeats([...selectedSeats, seatId]);
      }
   };

   const calculateTotal = () => {
      if (!selectedShowtimeObj) return 0;
      const normalPrice = selectedShowtimeObj.ticketPrice;
      const comfortPrice = selectedShowtimeObj.comfortPrice || (normalPrice + 100);
      let total = 0;
      selectedSeats.forEach(id => {
         const row = id.replace(/[0-9]/g, '');
         const num = parseInt(id.replace(/[^0-9]/g, ''));
         const seatData = selectedShowtimeObj.rawShowtime.seats.find((s: any) => s.row === row && s.number === num);
         
         if (seatData?.type === 'comfort' || (seatData?.type === undefined && ['D', 'E', 'F', 'G', 'H', 'I', 'J'].includes(row))) {
            total += comfortPrice;
         } else {
            total += normalPrice;
         }
      });
      return total;
   };

   const handleBookTickets = async () => {
      if (!token) {
         alert("Please login first to book tickets!");
         return;
      }
      if (selectedSeats.length === 0) return;

      setIsBooking(true);
      try {
         // 1. Create order on our backend
         const amount = calculateTotal();
         if (!amount || amount <= 0) {
            alert("Invalid booking amount. Please select seats again.");
            setIsBooking(false);
            return;
         }

         const orderRes = await fetch('http://localhost:5000/api/payment/create-order', {
            method: 'POST',
            headers: {
               'Content-Type': 'application/json',
               'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ amount })
         });

         if (!orderRes.ok) {
            const errorData = await orderRes.json().catch(() => ({}));
            console.error("Razorpay Order Creation Failed:", errorData);
            throw new Error(errorData.error || errorData.message || "Failed to create Razorpay order");
         }
         const order = await orderRes.json();

         // 2. Open Razorpay Checkout Modal
         const options = {
            key: 'rzp_test_SSkU8Fq3jJ3r3m',
            amount: order.amount, // in paise
            currency: "INR",
            name: "Cinemate Booking",
            description: `Booking ${selectedSeats.length} seats for ${movie?.title}`,
            order_id: order.id,
            prefill: {
               name: user?.name,
               email: user?.email,
               contact: "9999999999"
            },
            theme: {
               color: "#c084fc",
            },
            handler: async function (response: any) {
               // 3. Verify Payment Signature
               const verifyRes = await fetch('http://localhost:5000/api/payment/verify', {
                  method: 'POST',
                  headers: {
                     'Content-Type': 'application/json',
                     'Authorization': `Bearer ${token}`
                  },
                  body: JSON.stringify({ ...response })
               });

               if (verifyRes.ok) {
                  // 4. Create actual booking in DB
                  const formattedSeats = selectedSeats.map(id => {
                     const rowStr = id.replace(/[0-9]/g, '');
                     const numStr = id.replace(/[^0-9]/g, '');
                     return { row: rowStr, number: parseInt(numStr) };
                  });

                  const bookRes = await fetch('http://localhost:5000/api/bookings', {
                     method: 'POST',
                     headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                     },
                     body: JSON.stringify({
                        showtimeId: selectedShowtimeObj.id,
                        seats: formattedSeats,
                        totalAmount: amount
                     })
                  });

                  if (bookRes.ok) {
                     setShowSuccessModal(true);
                     setSelectedSeats([]);
                  } else {
                     const err = await bookRes.json();
                     alert('Booking failed but payment succeeded: ' + err.message);
                  }
               } else {
                  alert("Payment verification failed security check.");
               }
               setIsBooking(false);
            }
         };

         const rzp = new (window as any).Razorpay(options);
         rzp.on('payment.failed', function (response: any) {
            alert("Payment failed: " + response.error.description);
            setIsBooking(false);
         });
         rzp.open();

      } catch (e: any) {
         console.error(e);
         if (e.message.toLowerCase().includes('token') || e.message.toLowerCase().includes('log in again')) {
            alert('Your session has expired or is invalid. Please log in again.');
            // Optional: clear token and redirect could be added here
         } else {
            alert('Error: ' + e.message);
         }
         setIsBooking(false);
      }
   };

   const SuccessModal = () => (
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-xl animate-in fade-in duration-500">
         <div className="bg-slate-900 border border-fuchsia-500/30 rounded-[3rem] p-10 lg:p-14 max-w-lg w-full text-center shadow-[0_0_100px_rgba(232,121,249,0.1)] relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-fuchsia-500 to-transparent" />
            <div className="w-24 h-24 bg-fuchsia-600/20 rounded-full flex items-center justify-center mx-auto mb-8 relative border border-fuchsia-500/30">
               <div className="absolute inset-0 bg-fuchsia-500/20 rounded-full animate-ping" />
               <CheckCircle2 className="w-12 h-12 text-fuchsia-500 relative z-10" />
            </div>
            <h2 className="text-4xl font-black text-white mb-4 tracking-tight">Success!</h2>
            <p className="text-slate-400 font-bold mb-10 leading-relaxed uppercase tracking-widest text-[10px]">
               Your ticket has been booked successfully
            </p>
            <div className="flex flex-col gap-4">
               <Link 
                  href="/bookings" 
                  className="w-full py-4 bg-fuchsia-600 hover:bg-fuchsia-500 text-white rounded-2xl font-black uppercase tracking-widest text-[11px] transition-all shadow-xl shadow-fuchsia-900/40 flex items-center justify-center gap-2"
               >
                  View My Bookings <ChevronRight className="w-4 h-4" />
               </Link>
               <button 
                  onClick={() => {
                     setShowSuccessModal(false);
                     setActiveTab('info');
                  }}
                  className="w-full py-4 bg-white/5 hover:bg-white/10 text-slate-400 rounded-2xl font-black uppercase tracking-widest text-[11px] transition-all"
               >
                  Close
               </button>
            </div>
         </div>
      </div>
   );

   if (isLoading) {
      return (
         <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center">
            <Loader2 className="w-12 h-12 text-[#c084fc] animate-spin mb-4" />
            <p className="text-[#c084fc] font-bold uppercase tracking-widest text-sm">Loading Movie Details...</p>
         </div>
      );
   }

   if (!movie) {
      return (
         <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center text-white">
            <h1 className="text-3xl font-bold">Movie Not Found</h1>
         </div>
      );
   }

   return (
      <div className={`min-h-screen bg-slate-950 text-white font-sans ${activeTab === 'seats' ? 'overflow-hidden fixed inset-0' : ''}`}>
         <Script src="https://checkout.razorpay.com/v1/checkout.js" strategy="lazyOnload" />
         <div className="fixed top-0 left-0 w-[800px] h-[800px] bg-[#c084fc]/10 rounded-full blur-[150px] pointer-events-none -translate-x-1/2 -translate-y-1/2 z-0" />
         <div className="fixed top-0 right-0 w-[600px] h-[600px] bg-purple-900/10 rounded-full blur-[120px] pointer-events-none translate-x-1/3 -translate-y-1/3 z-0" />

         <div className="relative z-10 flex flex-col h-full">
            <CinemateNavbar />

            {activeTab === 'info' ? (
               <div className="max-w-[1400px] mx-auto w-full px-4 lg:px-12 py-8 mt-16 flex flex-col gap-16">

                  {/* Movie Info Section */}
                  <div className="flex flex-col lg:flex-row gap-8 lg:gap-16 items-start">
                     {/* Poster Column */}
                     <div className="w-[300px] lg:w-[380px] shrink-0 mx-auto lg:mx-0">
                        <div className="relative w-full aspect-[2/3] rounded-3xl overflow-hidden shadow-2xl shadow-fuchsia-900/20 border border-white/10 group">
                           <img src={movie.image || "https://images.unsplash.com/photo-1542204165-65bf26472b9b?auto=format&fit=crop&q=80&w=2000"} alt={movie.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                           <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent opacity-90" />

                           <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                              <button className="w-16 h-16 rounded-full bg-[#c084fc] pl-1 flex items-center justify-center shadow-[0_0_30px_rgba(192,132,252,0.5)] hover:scale-110 transition-transform">
                                 <Play className="w-6 h-6 fill-white text-white" />
                              </button>
                           </div>

                           <div className="absolute bottom-6 left-0 right-0 px-6">
                              {movie.logo ? (
                                 <img src={movie.logo} alt="Logo" className="w-48 mb-2" />
                              ) : (
                                 <h2 className="text-3xl font-black mb-2 leading-tight uppercase tracking-tight">{movie.title}</h2>
                              )}
                              <div className="flex items-center gap-2 text-xs text-[#c084fc] font-bold tracking-widest pl-2 uppercase">
                                 <span>IN CINEMAS NOW</span>
                              </div>
                           </div>
                        </div>
                     </div>

                     {/* Info content */}
                     <div className="flex-1 flex flex-col pt-4">
                        <h1 className="text-4xl lg:text-5xl xl:text-6xl font-black tracking-tight mb-6">
                           {movie.title}
                        </h1>

                        {/* Tags and Badges */}
                        <div className="flex flex-wrap items-center gap-4 mb-8 text-sm font-bold">
                           <div className="flex items-center gap-2 bg-amber-400/10 text-amber-400 px-3 py-1.5 rounded-lg border border-amber-400/20">
                              <span className="text-xs tracking-wider uppercase">IMDb</span>
                              <span>{movie.imdb || 'N/A'}</span>
                           </div>
                           <div className="px-3 py-1.5 rounded-lg border border-[#c084fc]/30 text-[#c084fc] bg-[#c084fc]/10">
                              {movie.pg || 'General'}
                           </div>
                           <div className="text-slate-300 flex items-center gap-2">
                              {movie.duration || '2h'} • {(movie.tags || []).join(', ')}
                           </div>
                        </div>

                        <p className="text-slate-400 leading-relaxed text-lg mb-8 max-w-3xl">
                           {movie.description}
                        </p>

                        {/* Credits Grid */}
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-8 mb-8 border-t border-white/5 pt-8">
                           <div>
                              <div className="text-slate-500 text-xs font-black uppercase tracking-widest mb-2">Director</div>
                              <div className="text-white font-bold">{movie.director || 'Unknown'}</div>
                           </div>
                           <div>
                              <div className="text-slate-500 text-xs font-black uppercase tracking-widest mb-2">Writers</div>
                              <div className="text-white font-bold leading-relaxed">{movie.writers?.split(' • ').map((w: string) => <div key={w}>{w}</div>) || 'Unknown'}</div>
                           </div>
                           <div>
                              <div className="text-slate-500 text-xs font-black uppercase tracking-widest mb-2">Stars</div>
                              <div className="text-white font-bold leading-relaxed">{movie.stars?.split(' • ').map((s: string) => <div key={s}>{s}</div>) || 'Unknown'}</div>
                           </div>
                        </div>
                     </div>
                  </div>

                  {/* Theaters & Showtime Section */}
                  <div className="flex flex-col gap-8 mb-20 animate-in slide-in-from-bottom-8 duration-700">

                     {/* Date & Filter Bar */}
                     <div className="bg-slate-900 border border-white/10 rounded-[2rem] p-2 flex flex-col xl:flex-row items-center justify-between gap-4 shadow-2xl relative z-20">
                        <div className="flex items-center gap-4 overflow-x-auto w-full xl:w-auto custom-scrollbar pb-6 xl:pb-0 px-2 pt-4 min-h-[110px]">
                           {dates.map((d, i) => (
                              <div
                                 key={i}
                                 onClick={() => handleDateChange(d.day)}
                                 className={`flex flex-col items-center justify-center w-14 h-[84px] rounded-full cursor-pointer transition-all duration-300 shrink-0
                           ${selectedDate === d.day ? 'bg-[#c084fc] text-slate-900 shadow-[0_0_15px_rgba(192,132,252,0.4)] scale-110' : 'text-slate-400 hover:text-white hover:bg-white/5'}
                           `}
                              >
                                 <span className="text-[10px] uppercase font-bold opacity-80 mb-1 tracking-widest">{d.month}</span>
                                 <span className="text-2xl font-black leading-none mb-1">{d.day}</span>
                                 <span className="text-[10px] uppercase font-bold opacity-80">{d.weekday}</span>
                              </div>
                           ))}
                        </div>

                        <div className="hidden xl:block w-px h-12 bg-white/10" />

                        {/* Filters */}
                        <div className="flex flex-wrap items-center justify-center gap-2 xl:gap-4 w-full xl:w-auto px-4 pb-2 xl:pb-0">
                           {/* Format Filter */}
                           <div className="relative">
                              <select
                                 value={filterFormat}
                                 onChange={(e) => setFilterFormat(e.target.value)}
                                 className="bg-slate-800 text-white font-bold text-xs pl-4 pr-10 py-2.5 rounded-xl border border-white/10 outline-none hover:bg-slate-700 transition-colors cursor-pointer appearance-none text-center min-w-[120px]"
                              >
                                 <option value="All">All Formats</option>
                                 <option value="2D">2D</option>
                                 <option value="3D">3D</option>
                                 <option value="IMAX 3D">IMAX 3D</option>
                              </select>
                              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#c084fc] pointer-events-none" />
                           </div>

                           {/* Price Filter */}
                           <div className="relative">
                              <select
                                 value={filterPrice}
                                 onChange={(e) => setFilterPrice(e.target.value)}
                                 className="bg-slate-800 text-white font-bold text-xs pl-4 pr-10 py-2.5 rounded-xl border border-white/10 outline-none hover:bg-slate-700 transition-colors cursor-pointer appearance-none text-center min-w-[130px]"
                              >
                                 <option value="All">All Prices</option>
                                 <option value="Budget">Budget (&lt;500)</option>
                                 <option value="Premium">Premium (&gt;500)</option>
                              </select>
                              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#c084fc] pointer-events-none" />
                           </div>

                           {/* Time Filter */}
                           <div className="relative">
                              <select
                                 value={filterTime}
                                 onChange={(e) => setFilterTime(e.target.value)}
                                 className="bg-slate-800 text-white font-bold text-xs pl-4 pr-10 py-2.5 rounded-xl border border-white/10 outline-none hover:bg-slate-700 transition-colors cursor-pointer appearance-none text-center min-w-[140px]"
                              >
                                 <option value="All">All Times</option>
                                 <option value="Morning">Morning</option>
                                 <option value="Afternoon">Afternoon</option>
                                 <option value="Evening">Evening</option>
                              </select>
                              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#c084fc] pointer-events-none" />
                           </div>
                        </div>
                     </div>

                     {/* Legend */}
                     <div className="flex items-center justify-end gap-6 text-xs font-black uppercase tracking-widest text-slate-400 px-4">
                        <div className="flex items-center gap-2">
                           <div className="w-3 h-3 rounded-full bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]"></div> Available
                        </div>
                        <div className="flex items-center gap-2">
                           <div className="w-3 h-3 rounded-full bg-amber-500 shadow-[0_0_10px_rgba(245,158,11,0.5)]"></div> Fast Filling
                        </div>
                     </div>

                     {/* Theater List */}
                     <div className="flex flex-col gap-4">
                        {theaters.length === 0 && (
                           <div className="p-12 text-center text-slate-500 font-bold bg-slate-900/40 rounded-3xl border border-white/5">
                              No showtimes scheduled for this movie on the selected date.
                           </div>
                        )}
                        {theaters.map((theater) => (
                           <div key={theater.id} className="bg-slate-900/60 backdrop-blur-sm border border-white/5 rounded-3xl p-6 lg:p-8 flex flex-col lg:flex-row gap-6 lg:gap-12 hover:border-white/10 transition-colors shadow-xl">

                              {/* Theater Info */}
                              <div className="lg:w-1/3 shrink-0 flex flex-col justify-start">
                                 <div className="flex items-center justify-between mb-3">
                                    <h3 className="text-xl font-bold text-white flex items-center gap-3">
                                       <Heart className="w-5 h-5 text-slate-600 hover:text-red-500 transition-colors cursor-pointer" />
                                       {theater.name}
                                    </h3>
                                 </div>
                                 <div className="flex items-center gap-4 text-slate-500">
                                    <div className="flex gap-2">
                                       <Ticket className="w-4 h-4 text-emerald-400" />
                                       <Coffee className="w-4 h-4 text-amber-400" />
                                    </div>
                                    <span className="text-xs font-bold uppercase tracking-widest text-slate-600 cursor-pointer hover:text-slate-400 transition-colors">Info</span>
                                 </div>
                              </div>

                              {/* Timing Grid */}
                              <div className="flex-1 flex flex-wrap gap-4 items-center">
                                 {theater.showtimes.map((st: any) => (
                                    <button
                                       key={st.id}
                                       onClick={() => selectShowtime(theater.name, st.time, st)}
                                       className={`group relative flex flex-col items-center justify-center px-6 py-3 min-w-[120px] rounded-2xl border transition-all overflow-hidden
                                 ${st.status === 'available'
                                             ? 'border-emerald-500/30 text-emerald-400 bg-emerald-500/5 hover:bg-emerald-500/20 hover:border-emerald-400 hover:shadow-[0_0_20px_rgba(16,185,129,0.2)]'
                                             : st.status === 'sold-out' ? 'border-red-500/30 text-red-500 bg-red-500/5 opacity-50 cursor-not-allowed'
                                                : 'border-amber-500/30 text-amber-500 bg-amber-500/5 hover:bg-amber-500/20 hover:border-amber-400 hover:shadow-[0_0_20px_rgba(245,158,11,0.2)]'
                                          }
                                 `}
                                       disabled={st.status === 'sold-out'}
                                    >
                                       <div className={`absolute top-2 right-2 w-1.5 h-1.5 rounded-full ${st.status === 'available' ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]' : st.status === 'fast-filling' ? 'bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.5)]' : 'hidden'}`} />
                                       <span className="font-black text-sm text-white group-hover:-translate-y-0.5 transition-transform">{st.time}</span>
                                       <span className="text-[10px] font-bold uppercase tracking-widest mt-0.5 opacity-80 group-hover:translate-y-0.5 transition-transform">{st.format}</span>
                                       <div className="text-[8px] uppercase tracking-[0.2em] font-black opacity-50 mt-1">{st.status === 'fast-filling' ? 'Filling' : st.status === 'sold-out' ? 'Sold Out' : 'Avail'}</div>
                                    </button>
                                 ))}
                              </div>
                           </div>
                        ))}
                     </div>
                  </div>
               </div>
            ) : (
               /* NEW EXACT LAYOUT FOR SEAT SELECTION */
               <div className="flex-1 flex flex-col relative z-20 bg-[#121318] animate-in fade-in duration-500 min-h-screen text-slate-300 pb-16">
                  {/* Top Navigation Bar */}
                  <div className="px-6 lg:px-12 py-8 flex items-center justify-between">
                     {/* Date Picker */}
                     <div className="flex items-center gap-6 overflow-x-auto pb-6 pt-4 scrollbar-hide shrink-0">
                        <div className="text-blue-400/80 font-semibold tracking-wider mr-2 text-sm pl-2">Date</div>
                        <ChevronLeft className="w-5 h-5 text-orange-600/80 cursor-pointer hover:text-orange-500" />
                        <div className="flex gap-4 px-2">
                           {dates.map((item, i) => (
                              <div key={i} onClick={() => handleDateChange(item.day)} className={`flex flex-col items-center justify-center w-14 h-[80px] rounded-full cursor-pointer transition-all duration-300 shrink-0 ${selectedDate === item.day ? 'bg-[#c084fc] text-slate-900 shadow-[0_0_15px_rgba(192,132,252,0.4)] scale-110' : 'text-slate-500 hover:text-slate-300 hover:bg-white/5'}`}>
                                 <span className="text-[10px] uppercase font-bold mb-1 opacity-80 tracking-widest">{item.month}</span>
                                 <span className="text-2xl font-black leading-none mb-1">{item.day}</span>
                                 <span className="text-[10px] uppercase font-bold opacity-80">{item.weekday}</span>
                              </div>
                           ))}
                        </div>
                        <ChevronRight className="w-5 h-5 text-orange-600/80 cursor-pointer hover:text-orange-500 pr-2" />
                     </div>

                     {/* Right Filters */}
                     <div className="hidden xl:flex items-center gap-16 mr-8 text-sm font-bold">
                        <div className="flex flex-col cursor-pointer group">
                           <span className="text-slate-500 text-xs mb-1.5 transition-colors group-hover:text-slate-400">Time</span>
                           <div className="flex items-center gap-3 text-white">{selectedTime || 'Select Time'} <ChevronDown className="w-3 h-3 text-orange-500" /></div>
                        </div>
                        <div className="flex flex-col cursor-pointer group">
                           <span className="text-slate-500 text-xs mb-1.5 transition-colors group-hover:text-slate-400">Type</span>
                           <div className="flex items-center gap-3 text-white">{selectedShowtimeObj?.format || 'Standard'} <ChevronDown className="w-3 h-3 text-orange-500" /></div>
                        </div>
                        <div className="flex flex-col cursor-pointer group">
                           <span className="text-slate-500 text-xs mb-1.5 transition-colors group-hover:text-slate-400">Address</span>
                           <div className="flex items-center gap-3 text-white uppercase">{selectedTheater || 'VENUE'} <ChevronDown className="w-3 h-3 text-orange-500" /></div>
                        </div>
                     </div>
                  </div>

                  {/* Main Stage Grid (Left Panel & Right Map) */}
                  <div className="flex-1 flex flex-col xl:flex-row px-6 lg:px-12 mt-2 gap-10 max-w-[1700px] mx-auto w-full">

                     {/* Left Panel: Selected Data & Cart */}
                     <div className="w-full xl:w-[380px] shrink-0 flex flex-col justify-start">
                        <div className="mb-4">
                           <h2 className="text-3xl font-normal text-white mb-6">Select Your Seats</h2>
                           <div className="flex items-center gap-4 mb-10 text-sm font-bold">
                              <span className="text-slate-500 font-light">{selectedSeats.length} Seats</span>
                              {selectedSeats.slice(0, 3).map(id => (
                                 <span key={id} className="bg-white/5 px-2.5 py-1 rounded-md text-slate-300 text-xs uppercase tracking-wider">{id.replace(/([A-Z])([0-9]+)/, '$1 $2')}</span>
                              ))}
                              {selectedSeats.length > 3 && <span className="bg-white/5 px-2 py-1 rounded-md">+{selectedSeats.length - 3}</span>}
                           </div>

                           <div className="border-b border-white/5 pb-8 mb-8">
                              <div className="flex justify-between items-center mb-6">
                                 <span className="text-[11px] font-black text-white uppercase tracking-[0.2em] relative -left-1">MOVIE TICKETS</span>
                                 <Ticket className="w-5 h-5 text-orange-500" />
                              </div>
                              <div className="flex justify-between text-xs font-semibold text-slate-500 mb-6">
                                 <span>Date & Time</span>
                                 <span className="text-slate-300/80">
                                    {(() => {
                                       const dItem = dates.find(d => d.day === selectedDate);
                                       const year = dItem ? new Date(dItem.time).getFullYear() : 2026;
                                       return `${selectedDate} ${dItem?.month} ${year}`;
                                    })()}: {selectedTime || 'N/A'}
                                 </span>
                              </div>

                              {/* DYNAMIC TICKET COUNTS */}
                              {(() => {
                                 let normalCount = 0;
                                 let comfortCount = 0;
                                 selectedSeats.forEach(id => {
                                    const row = id.replace(/[0-9]/g, '');
                                    if (['D', 'E', 'F', 'G', 'H', 'I', 'J'].includes(row)) comfortCount++;
                                    else normalCount++;
                                 });
                                 const normalPrice = selectedShowtimeObj?.ticketPrice || 0;
                                 const comfortPrice = selectedShowtimeObj?.comfortPrice || (normalPrice + 100);

                                 return (
                                    <>
                                       {normalCount > 0 && (
                                          <div className="flex justify-between text-xs font-semibold text-slate-500 mb-5">
                                             <span>Tickets (Normal)</span>
                                             <span className="text-slate-300/80">{normalPrice} Rs x {normalCount} = {normalPrice * normalCount} Rs</span>
                                          </div>
                                       )}
                                       {comfortCount > 0 && (
                                          <div className="flex justify-between text-xs font-semibold text-slate-500 mb-5">
                                             <span>Tickets (Comfort)</span>
                                             <span className="text-slate-300/80">{comfortPrice} Rs x {comfortCount} = {comfortPrice * comfortCount} Rs</span>
                                          </div>
                                       )}
                                       {normalCount === 0 && comfortCount === 0 && (
                                          <div className="flex justify-between text-xs font-semibold text-slate-500 mb-5">
                                             <span>Tickets (None)</span>
                                             <span className="text-slate-300/80">0 Rs</span>
                                          </div>
                                       )}
                                    </>
                                 );
                              })()}

                              <div className="flex justify-between text-[13px] font-bold text-white mt-8 pt-6 border-t border-white/5">
                                 <span>Total</span>
                                 <span>{calculateTotal()} Rs</span>
                              </div>
                           </div>
                        </div>

                        {/* Purple Summary Box */}
                        <div className="bg-[#d8b4fe] rounded-[2rem] p-8 text-slate-900 shadow-2xl relative">
                           {/* DYNAMIC TICKETS */}
                           {(() => {
                              let normalCount = 0;
                              let comfortCount = 0;
                              selectedSeats.forEach(id => {
                                 const row = id.replace(/[0-9]/g, '');
                                 if (['D', 'E', 'F', 'G', 'H', 'I', 'J'].includes(row)) comfortCount++;
                                 else normalCount++;
                              });

                              return (
                                 <div className="flex justify-between font-bold text-[13px] mb-4">
                                    <span className="opacity-80">Tickets</span>
                                    <span className="font-black text-sm">
                                       {normalCount > 0 && `${normalCount} Norm`}
                                       {normalCount > 0 && comfortCount > 0 && ' / '}
                                       {comfortCount > 0 && `${comfortCount} Comf`}
                                       {normalCount === 0 && comfortCount === 0 && '0'}
                                    </span>
                                 </div>
                              );
                           })()}

                           <div className="flex justify-between font-bold text-[13px] mb-8">
                              <span className="opacity-80">Type</span>
                              <span className="font-black text-sm">{selectedShowtimeObj?.format || '2D'}</span>
                           </div>
                           <div className="flex justify-between font-black text-xl mb-10 items-end">
                              <span className="text-sm tracking-widest uppercase">TOTAL PRICE</span>
                              <span className="text-2xl">{calculateTotal()} Rs</span>
                           </div>

                           <button
                              onClick={handleBookTickets}
                              disabled={selectedSeats.length === 0 || isBooking}
                              className="w-full py-4 bg-[#14151a] hover:bg-black text-[#d8b4fe] rounded-full font-black uppercase tracking-widest text-[13px] flex items-center justify-center disabled:opacity-50 transition-all shadow-xl"
                           >
                              {isBooking ? <Loader2 className="w-5 h-5 animate-spin" /> : 'BUY'}
                           </button>
                        </div>
                     </div>

                     {/* Right Panel: Seat Map Container */}
                     <div className="flex-1 bg-[#1c1f26] rounded-[3rem] p-8 lg:p-14 flex flex-col items-center shadow-2xl relative border border-white/5 ml-0 xl:ml-8 overflow-hidden h-fit xl:min-h-[700px]">
                        {/* Screen Curve Line */}
                        <div className="w-full max-w-4xl flex flex-col items-center mb-16 relative mt-4">
                           <div className="absolute top-0 w-full h-24 border-t-[3px] border-[#c084fc]/50 rounded-[100%] drop-shadow-[0_-5px_20px_rgba(192,132,252,0.3)]"></div>
                           <span className="uppercase tracking-[1em] text-white/90 text-sm font-light mt-10 ml-4 relative z-10 glow-text">SCREEN</span>
                        </div>

                        {/* Seat Grid A-J */}
                        <div className="flex flex-col gap-3 lg:gap-4 w-full max-w-4xl px-4 lg:px-8 z-10">
                           {['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J'].map((row) => (
                              <div key={row} className="flex justify-between items-center w-full relative">
                                 <span className="w-6 text-slate-500 font-bold text-[11px] lg:text-xs text-left">{row}</span>

                                 <div className="flex gap-4 sm:gap-6 md:gap-10 flex-1 justify-center relative items-center">
                                    {/* Left block: 4 seats */}
                                    <div className="flex gap-2 items-center">
                                       {[1, 2, 3, 4].map(num => {
                                          const seatId = `${row}${num}`;
                                          const isSelected = selectedSeats.includes(seatId);
                                          const isBooked = isSeatBooked(row, num);

                                          let bgClass = 'bg-[#2a2d36] hover:bg-[#3f4350]';
                                          if (isBooked) bgClass = 'bg-[#101216] cursor-not-allowed shadow-inner';
                                          else if (isSelected) bgClass = 'bg-[#c084fc] text-white shadow-[0_0_15px_rgba(192,132,252,0.4)] scale-110';

                                          const shapeClass = (row === 'A' || row === 'B' || row === 'C') ? 'w-5 h-4 sm:w-6 sm:h-5 rounded-sm' : 'w-6 h-6 sm:w-8 sm:h-8 rounded-t-[10px] rounded-b-[4px]';

                                          return <button key={num} disabled={isBooked} onClick={() => handleSeatClick(seatId, row, num)} className={`${shapeClass} transition-all duration-300 ${bgClass}`} />
                                       })}
                                    </div>

                                    {/* Middle block: 8 seats */}
                                    <div className="flex gap-2 relative items-center">
                                       {[5, 6, 7, 8, 9, 10, 11, 12].map((num, i) => {
                                          const seatId = `${row}${num}`;
                                          const isSelected = selectedSeats.includes(seatId);
                                          const isBooked = isSeatBooked(row, num);

                                          let bgClass = 'bg-[#2a2d36] hover:bg-[#3f4350]';
                                          if (isBooked) bgClass = 'bg-[#101216] cursor-not-allowed shadow-inner';
                                          else if (isSelected) bgClass = 'bg-[#c084fc] text-white shadow-[0_0_15px_rgba(192,132,252,0.4)] scale-110';

                                          const shapeClass = (row === 'A' || row === 'B' || row === 'C') ? 'w-5 h-4 sm:w-6 sm:h-5 rounded-sm' : 'w-6 h-6 sm:w-8 sm:h-8 rounded-t-[10px] rounded-b-[4px]';

                                          return <button key={num} disabled={isBooked} onClick={() => handleSeatClick(seatId, row, num)} className={`${shapeClass} transition-all duration-300 ${bgClass}`} />
                                       })}
                                    </div>

                                    {/* Right block: 4 seats */}
                                    <div className="flex gap-2 items-center">
                                       {[13, 14, 15, 16].map(num => {
                                          const seatId = `${row}${num}`;
                                          const isSelected = selectedSeats.includes(seatId);
                                          const isBooked = isSeatBooked(row, num);

                                          let bgClass = 'bg-[#2a2d36] hover:bg-[#3f4350]';
                                          if (isBooked) bgClass = 'bg-[#101216] cursor-not-allowed shadow-inner';
                                          else if (isSelected) bgClass = 'bg-[#c084fc] text-white shadow-[0_0_15px_rgba(192,132,252,0.4)] scale-110';

                                          const shapeClass = (row === 'A' || row === 'B' || row === 'C') ? 'w-5 h-4 sm:w-6 sm:h-5 rounded-sm' : 'w-6 h-6 sm:w-8 sm:h-8 rounded-t-[10px] rounded-b-[4px]';

                                          return <button key={num} disabled={isBooked} onClick={() => handleSeatClick(seatId, row, num)} className={`${shapeClass} transition-all duration-300 ${bgClass}`} />
                                       })}
                                    </div>
                                 </div>

                                 <span className="w-6 text-slate-500 font-bold text-[11px] lg:text-xs text-right">{row}</span>
                              </div>
                           ))}
                        </div>

                        {/* Legend at Bottom */}
                        <div className="hidden lg:flex absolute bottom-8 left-12 right-12 justify-between text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                           <div className="flex gap-6">
                              <div className="flex items-center gap-2"><div className="w-4 h-3 rounded-sm bg-[#2a2d36]" /> Normal</div>
                              <div className="flex items-center gap-2"><div className="w-5 h-5 rounded-t-[10px] rounded-b-[4px] bg-[#2a2d36]" /> Comfort</div>
                           </div>
                           <div className="flex gap-6 text-right">
                              <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-sm bg-[#2a2d36]" /> Available</div>
                              <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-sm bg-[#c084fc]" /> Selected</div>
                              <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-sm bg-[#101216]" /> Taken</div>
                           </div>
                        </div>
                     </div>
                  </div>
               </div>
            )}

         </div>
         {showSuccessModal && <SuccessModal />}
      </div>
   );
}

// Inline svg icon since standard lucide icons might not have a perfect wheelchair match
const WheelchairIcon = ({ className }: { className: string }) => (
   <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <circle cx="8" cy="8" r="2" />
      <path d="M12 21H7a5 5 0 0 1-5-5v-1" />
      <path d="M14 15v-3a2 2 0 0 0-2-2H8" />
      <path d="M18 10h-2l-2-4" />
      <path d="M22 21a5 5 0 0 1-5-5H8" />
   </svg>
);
