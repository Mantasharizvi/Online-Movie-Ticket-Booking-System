'use client';
import { useState, useEffect } from 'react';
import {
  Plus, Calendar, Monitor, Clock, ChevronLeft, ChevronRight, ChevronDown, MoreVertical, X, Search, Loader2, Trash2
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

const screens = [
  { id: '1', name: 'Screen 1', type: 'IMAX', capacity: 160 },
  { id: '2', name: 'Screen 2', type: '4DX', capacity: 160 },
  { id: '3', name: 'Screen 3', type: 'Dolby Cinema', capacity: 160 },
  { id: '4', name: 'Screen 4', type: 'Premium', capacity: 160 },
];

const theaters = [
  'PVR: SUPERPLEX Lulu',
  'Cinepolis: VIP',
  'Ocean Mall Cinema',
  'Grand Royal Cineplex',
  'Skyline Cinema'
];

export default function ShowtimesManagement() {
  const { adminToken } = useAuth();
  const [showtimes, setShowtimes] = useState<any[]>([]);
  const [movies, setMovies] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSlotModalOpen, setIsSlotModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    movie: '',
    theaterName: theaters[0],
    screen: 'Screen 1',
    format: '2D',
    timeString: '',
    showTimeDate: '',
    ticketPrice: 200,
    comfortPrice: 350
  });

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [showRes, movRes] = await Promise.all([
        fetch('http://localhost:5000/api/showtimes'),
        fetch('http://localhost:5000/api/movies')
      ]);
      if (showRes.ok && movRes.ok) {
        setShowtimes(await showRes.json());
        setMovies(await movRes.json());
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => {
      const newState = { ...prev, [name]: value };
      if (name === 'showTimeDate' && value) {
        const date = new Date(value);
        const timeString = date.toLocaleTimeString('en-US', {
          hour: '2-digit',
          minute: '2-digit',
          hour12: true
        }).toUpperCase();
        newState.timeString = timeString;
      }
      return newState;
    });
  };

  const generateSeats = () => {
    const seats: any[] = [];
    const rows = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J'];
    rows.forEach(row => {
      const type = (['D', 'E', 'F', 'G', 'H', 'I', 'J'].includes(row)) ? 'comfort' : 'normal';
      for (let i = 1; i <= 16; i++) {
        seats.push({ row, number: i, isBooked: false, type });
      }
    });
    return seats;
  };

  const handleScheduleShow = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!adminToken) return alert('Not authenticated!');
    if (!formData.movie) return alert('Please select a movie');
    if (!formData.showTimeDate) return alert('Please select a date and time');
    if (!formData.timeString) return alert('Please enter a display time');

    setIsSubmitting(true);
    try {
      const payload = {
        movie: formData.movie,
        theaterName: formData.theaterName,
        screen: formData.screen,
        format: formData.format,
        timeString: formData.timeString,
        showTime: new Date(formData.showTimeDate).toISOString(),
        ticketPrice: Number(formData.ticketPrice),
        comfortPrice: Number(formData.comfortPrice),
        seats: generateSeats()
      };

      const res = await fetch('http://localhost:5000/api/showtimes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${adminToken}`
        },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        setIsSlotModalOpen(false);
        setFormData(prev => ({ ...prev, movie: '', showTimeDate: '', timeString: '' }));
        fetchData();
      } else {
        const err = await res.json();
        alert('Failed to schedule: ' + err.message);
      }
    } catch (err) {
      console.error(err);
      alert('Error scheduling showtime.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="p-8 lg:p-12 max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight mb-2 text-white">Showtimes & Scheduling</h1>
          <p className="text-slate-400 font-medium text-sm">Manage show timings mapped directly into MongoDB.</p>
        </div>
        <button
          onClick={() => setIsSlotModalOpen(true)}
          className="flex items-center gap-2 bg-fuchsia-600 hover:bg-fuchsia-500 text-white px-6 py-2.5 rounded-xl font-bold transition-all shadow-lg shadow-fuchsia-900/20"
        >
          <Plus className="w-5 h-5" />
          Schedule New Show
        </button>
      </div>

      {isLoading ? (
        <div className="min-h-[400px] flex items-center justify-center">
          <Loader2 className="w-8 h-8 text-fuchsia-500 animate-spin" />
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-8">
          {screens.map((screen) => {
            const screenShows = showtimes.filter(s => s.screen === screen.name);

            return (
              <div key={screen.id} className="bg-slate-900/30 border border-white/5 rounded-[2rem] overflow-hidden shadow-2xl">
                <div className="p-6 bg-slate-950/30 border-b border-white/5 flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-fuchsia-500/10 text-fuchsia-400 flex items-center justify-center border border-fuchsia-500/10">
                      <Monitor className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-white leading-tight">{screen.name}</h3>
                      <p className="text-xs text-slate-500 font-bold tracking-widest uppercase mb-0.5">{screen.type} • {screen.capacity} Seats</p>
                    </div>
                  </div>
                </div>

                <div className="p-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                    {screenShows.map(show => (
                      <div key={show._id} className="bg-[#0f1420] border border-white/5 rounded-3xl p-5 hover:border-fuchsia-500/30 transition-all group relative cursor-pointer shadow-lg flex flex-col justify-between">
                        <div>
                          <div className="flex justify-between items-start mb-4">
                            <div className="flex items-center gap-2 text-fuchsia-400 font-black text-[10px] tracking-widest uppercase">
                              <Clock className="w-3.5 h-3.5" />
                              {show.timeString}
                            </div>
                            <span className="text-[9px] uppercase tracking-widest text-slate-500 font-bold border border-white/10 px-2 py-0.5 rounded-full">{show.format}</span>
                          </div>
                          <h4 className="font-bold text-white text-base mb-1 line-clamp-1 group-hover:text-fuchsia-400 transition-colors">
                            {show.movie?.title || 'Unknown Movie'}
                          </h4>
                          <p className="text-[10px] text-slate-500 font-bold tracking-widest uppercase mb-6 truncate">{new Date(show.showTime).toLocaleDateString()}</p>
                        </div>
                        <div className="flex justify-between items-center bg-black/40 p-3 rounded-2xl border border-white/5 mt-auto">
                          <span className="text-[10px] font-black text-slate-600 uppercase tracking-widest">Pricing</span>
                          <span className="text-sm font-black text-white">Rs {show.ticketPrice}</span>
                        </div>
                      </div>
                    ))}

                    {screenShows.length === 0 && (
                      <div className="col-span-full py-16 flex flex-col items-center justify-center text-center">
                        <div className="w-20 h-20 rounded-full bg-slate-950 border border-dashed border-white/10 flex items-center justify-center mb-4 shadow-xl">
                          <Clock className="w-8 h-8 text-slate-700" />
                        </div>
                        <p className="text-slate-500 font-bold text-sm">No shows scheduled for this screen yet.</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Schedule Modal */}
      {isSlotModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/80 backdrop-blur-md" onClick={() => !isSubmitting && setIsSlotModalOpen(false)} />
          <div className="relative bg-[#0b0f19] border border-white/10 rounded-[2.5rem] w-full max-w-2xl overflow-hidden shadow-2xl animate-in fade-in zoom-in duration-300">
            <div className="p-8 border-b border-white/5 flex justify-between items-center bg-slate-900/30 shrink-0">
              <div>
                <h2 className="text-2xl font-extrabold text-white mb-1">Schedule New Show</h2>
                <p className="text-slate-400 text-sm font-medium">Map a movie to a screen and generate seats.</p>
              </div>
              <button disabled={isSubmitting} onClick={() => setIsSlotModalOpen(false)} className="p-3 rounded-2xl hover:bg-white/5 text-slate-400 transition-colors disabled:opacity-50">
                <X className="w-6 h-6" />
              </button>
            </div>

            <form className="p-8 max-h-[70vh] overflow-y-auto custom-scrollbar" onSubmit={handleScheduleShow}>
              <div className="grid grid-cols-2 gap-6 mb-8">
                <div className="col-span-2">
                  <label className="block text-slate-400 text-xs font-bold uppercase tracking-widest mb-2 px-1">Select Movie *</label>
                  <div className="relative group">
                    <select required name="movie" value={formData.movie} onChange={handleInputChange} className="w-full bg-slate-900 border border-white/5 rounded-2xl py-4 px-6 pr-12 text-white outline-none focus:ring-2 focus:ring-fuchsia-500/50 font-bold appearance-none cursor-pointer group-hover:bg-slate-800 transition-colors">
                      <option value="">Choose Movie...</option>
                      {movies.map(movie => (
                        <option key={movie._id} value={movie._id}>{movie.title}</option>
                      ))}
                    </select>
                    <ChevronDown className="absolute right-6 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500 pointer-events-none group-hover:text-fuchsia-400 transition-colors" />
                  </div>
                </div>

                <div className="col-span-2">
                  <label className="block text-slate-400 text-xs font-bold uppercase tracking-widest mb-2 px-1">Theater Name</label>
                  <div className="relative group">
                    <select name="theaterName" value={formData.theaterName} onChange={handleInputChange} className="w-full bg-slate-900 border border-white/5 rounded-2xl py-4 px-6 pr-12 text-white outline-none focus:ring-2 focus:ring-fuchsia-500/50 font-bold appearance-none cursor-pointer group-hover:bg-slate-800 transition-colors">
                      {theaters.map(t => (
                        <option key={t} value={t}>{t}</option>
                      ))}
                    </select>
                    <ChevronDown className="absolute right-6 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500 pointer-events-none group-hover:text-fuchsia-400 transition-colors" />
                  </div>
                </div>

                <div>
                  <label className="block text-slate-400 text-xs font-bold uppercase tracking-widest mb-2 px-1">Screen</label>
                  <div className="relative group">
                    <select name="screen" value={formData.screen} onChange={handleInputChange} className="w-full bg-slate-900 border border-white/5 rounded-2xl py-4 px-6 pr-12 text-white appearance-none focus:outline-none focus:ring-2 focus:ring-fuchsia-500/50 transition-all font-bold cursor-pointer group-hover:bg-slate-800">
                      {screens.map(screen => (
                        <option key={screen.id} value={screen.name}>{screen.name}</option>
                      ))}
                    </select>
                    <ChevronDown className="absolute right-6 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500 pointer-events-none group-hover:text-fuchsia-400 transition-colors" />
                  </div>
                </div>

                <div>
                  <label className="block text-slate-400 text-xs font-bold uppercase tracking-widest mb-2 px-1">Format</label>
                  <div className="relative group">
                    <select name="format" value={formData.format} onChange={handleInputChange} className="w-full bg-slate-900 border border-white/5 rounded-2xl py-4 px-6 pr-12 text-white appearance-none focus:outline-none focus:ring-2 focus:ring-fuchsia-500/50 transition-all font-bold cursor-pointer group-hover:bg-slate-800">
                      <option value="2D">2D</option>
                      <option value="3D">3D</option>
                      <option value="IMAX">IMAX</option>
                      <option value="IMAX 3D">IMAX 3D</option>
                      <option value="4DX">4DX</option>
                    </select>
                    <ChevronDown className="absolute right-6 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500 pointer-events-none group-hover:text-fuchsia-400 transition-colors" />
                  </div>
                </div>

                <div>
                  <label className="block text-slate-400 text-xs font-bold uppercase tracking-widest mb-2 px-1">Select Date & Time *</label>
                  <input required name="showTimeDate" value={formData.showTimeDate} onChange={handleInputChange} type="datetime-local" className="w-full bg-slate-900 border border-white/5 rounded-2xl py-4 px-6 text-white focus:outline-none focus:ring-2 focus:ring-fuchsia-500/50 transition-all font-bold" />
                </div>

                <div>
                  <label className="block text-slate-400 text-xs font-bold uppercase tracking-widest mb-2 px-1">UI Display Time (Auto) *</label>
                  <input required name="timeString" value={formData.timeString} onChange={handleInputChange} type="text" placeholder="10:30 AM" className="w-full bg-slate-900 border border-white/5 rounded-2xl py-4 px-6 text-white focus:outline-none focus:ring-2 focus:ring-fuchsia-500/50 transition-all font-bold" />
                </div>

                <div>
                  <label className="block text-slate-400 text-xs font-bold uppercase tracking-widest mb-2 px-1">Normal Seat Price (Rs) *</label>
                  <input required name="ticketPrice" value={formData.ticketPrice} onChange={handleInputChange} type="number" className="w-full bg-slate-900 border border-white/5 rounded-2xl py-4 px-6 text-white focus:outline-none focus:ring-2 focus:ring-fuchsia-500/50 transition-all font-bold" />
                </div>
                <div>
                  <label className="block text-slate-400 text-xs font-bold uppercase tracking-widest mb-2 px-1">Comfort Seat Price (Rs) *</label>
                  <input required name="comfortPrice" value={formData.comfortPrice} onChange={handleInputChange} type="number" className="w-full bg-slate-900 border border-white/5 rounded-2xl py-4 px-6 text-white focus:outline-none focus:ring-2 focus:ring-fuchsia-500/50 transition-all font-bold" />
                </div>
              </div>

              <div className="flex gap-4">
                <button type="button" onClick={() => setIsSlotModalOpen(false)} disabled={isSubmitting} className="flex-1 py-4 rounded-2xl border border-white/5 text-white font-bold hover:bg-white/5 transition-all disabled:opacity-50">
                  Cancel
                </button>
                <button type="submit" disabled={isSubmitting} className="flex-1 py-4 rounded-2xl bg-fuchsia-600 text-white font-bold shadow-xl shadow-fuchsia-900/40 hover:bg-fuchsia-500 transition-all disabled:opacity-50 flex items-center justify-center gap-2">
                  {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Schedule & Generate Seats'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
