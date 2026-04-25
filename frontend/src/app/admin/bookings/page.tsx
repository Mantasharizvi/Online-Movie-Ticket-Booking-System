'use client';
import { useState, useEffect } from 'react';
import { 
  Search, Filter, Download, Eye, CheckCircle2, Clock, XCircle, ExternalLink, Loader2, Calendar, X, ChevronDown
} from 'lucide-react';
import * as XLSX from 'xlsx';
import { useAuth } from '@/context/AuthContext';

export default function BookingsLog() {
  const { adminToken } = useAuth();
  const [bookings, setBookings] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isDateFilterOpen, setIsDateFilterOpen] = useState(false);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  useEffect(() => {
    const fetchBookings = async () => {
      if (!adminToken) return;
      try {
        const res = await fetch('http://localhost:5000/api/bookings', {
          headers: { 'Authorization': `Bearer ${adminToken}` }
        });
        if (res.ok) {
          const data = await res.json();
          setBookings(data.sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));
        }
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchBookings();
  }, [adminToken]);

  const filteredBookings = bookings.filter(booking => {
    // 1. Search Logic
    const matchesSearch = 
      booking.user?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      booking._id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      booking.showtime?.movie?.title?.toLowerCase().includes(searchTerm.toLowerCase());
    
    // 2. Date Range Logic
    const bookingDate = new Date(booking.createdAt);
    let matchesDate = true;
    
    if (startDate) {
      const start = new Date(startDate);
      start.setHours(0, 0, 0, 0);
      matchesDate = matchesDate && bookingDate >= start;
    }
    
    if (endDate) {
      const end = new Date(endDate);
      end.setHours(23, 59, 59, 999);
      matchesDate = matchesDate && bookingDate <= end;
    }

    return matchesSearch && matchesDate;
  });

  const handleExportCSV = () => {
    if (filteredBookings.length === 0) return alert('No data to export!');

    const exportData = filteredBookings.map(b => ({
      'Order ID': b._id.toUpperCase(),
      'Date': new Date(b.createdAt).toLocaleString(),
      'User Name': b.user?.name || 'Unknown',
      'User Email': b.user?.email || 'N/A',
      'Movie': b.showtime?.movie?.title || 'Unknown',
      'Seats': b.seats.map((s: any) => `${s.row}${s.number}`).join(', '),
      'Amount': `Rs ${b.totalAmount}`,
      'Status': b.paymentStatus
    }));

    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.json_to_sheet(exportData);
    XLSX.utils.book_append_sheet(wb, ws, 'Bookings');
    XLSX.writeFile(wb, `Bookings_Log_${new Date().toISOString().split('T')[0]}.xlsx`);
  };

  return (
    <div className="p-8 lg:p-12 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight mb-2 text-white">Bookings Log</h1>
          <p className="text-slate-400 font-medium text-sm">Monitor and manage real-time ticket sales.</p>
        </div>
        <button 
          onClick={handleExportCSV}
          disabled={filteredBookings.length === 0}
          className="flex items-center gap-2 bg-slate-950 border border-white/5 text-white px-6 py-2.5 rounded-xl font-bold transition-all hover:bg-white/5 shadow-xl disabled:opacity-50"
        >
          <Download className="w-5 h-5 text-fuchsia-500" />
          Export Report
        </button>
      </div>

      {/* Filters & Search */}
      <div className="flex flex-col md:flex-row gap-4 mb-8">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
          <input 
            type="text" 
            placeholder="Search by ID, User, or Movie..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-slate-950 border border-white/5 rounded-2xl py-4 pl-12 pr-4 text-white placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-fuchsia-500/50 transition-all font-bold"
          />
        </div>
        <div className="relative">
          <button 
            onClick={() => setIsDateFilterOpen(!isDateFilterOpen)}
            className={`flex items-center gap-2 border px-6 py-4 rounded-2xl font-bold transition-all shadow-xl h-full ${isDateFilterOpen || startDate || endDate ? 'bg-fuchsia-600 border-fuchsia-600 text-white' : 'bg-slate-950 border-white/5 text-slate-400 hover:text-white'}`}
          >
            <Calendar className="w-5 h-5" />
            {startDate && endDate ? `${new Date(startDate).toLocaleDateString()} - ${new Date(endDate).toLocaleDateString()}` : 'Date Range'}
          </button>

          {/* Date Filter Dropdown */}
          {isDateFilterOpen && (
            <>
              <div className="fixed inset-0 z-40" onClick={() => setIsDateFilterOpen(false)} />
              <div className="absolute right-0 top-full mt-4 w-80 bg-slate-900 border border-white/10 rounded-[2rem] shadow-2xl p-8 z-50 animate-in fade-in zoom-in slide-in-from-top-4 duration-300 ease-out">
                <div className="space-y-6">
                   <div>
                     <label className="block text-slate-500 text-[10px] font-black uppercase tracking-[0.2em] mb-3 ml-1">Start Date</label>
                     <input 
                      type="date" 
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                      className="w-full bg-slate-950 border border-white/5 rounded-xl py-3 px-4 text-white focus:ring-2 focus:ring-fuchsia-500/50 outline-none transition-all font-bold [color-scheme:dark]"
                     />
                   </div>
                   <div>
                     <label className="block text-slate-500 text-[10px] font-black uppercase tracking-[0.2em] mb-3 ml-1">End Date</label>
                     <input 
                      type="date" 
                      value={endDate}
                      onChange={(e) => setEndDate(e.target.value)}
                      className="w-full bg-slate-950 border border-white/5 rounded-xl py-3 px-4 text-white focus:ring-2 focus:ring-fuchsia-500/50 outline-none transition-all font-bold [color-scheme:dark]"
                     />
                   </div>

                   <div className="flex gap-2 pt-4">
                      <button 
                        onClick={() => {
                          setStartDate('');
                          setEndDate('');
                          setIsDateFilterOpen(false);
                        }}
                        className="flex-1 py-3.5 rounded-xl bg-white/5 text-slate-400 text-xs font-black uppercase tracking-widest hover:bg-white/10 hover:text-white transition-all"
                      >
                        Reset
                      </button>
                      <button 
                        onClick={() => setIsDateFilterOpen(false)}
                        className="flex-1 py-3.5 rounded-xl bg-fuchsia-600 text-white text-xs font-black uppercase tracking-widest hover:bg-fuchsia-500 transition-all shadow-lg shadow-fuchsia-900/40"
                      >
                        Apply
                      </button>
                   </div>
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Bookings Table */}
      <div className="bg-slate-900/40 backdrop-blur-sm border border-white/5 rounded-[2.5rem] shadow-2xl overflow-hidden relative min-h-[400px]">
        {isLoading && (
          <div className="absolute inset-0 z-10 bg-slate-950/50 flex items-center justify-center">
             <Loader2 className="w-8 h-8 text-fuchsia-500 animate-spin" />
          </div>
        )}
        
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-black/40 text-slate-500 text-[10px] uppercase tracking-[0.2em] font-black">
                <th className="px-8 py-5">Order Info</th>
                <th className="px-8 py-5">Customer</th>
                <th className="px-8 py-5">Movie & Seats</th>
                <th className="px-8 py-5">Status</th>
                <th className="px-8 py-5">Amount</th>
                <th className="px-8 py-5 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="text-sm">
              {filteredBookings.length === 0 && !isLoading && (
                 <tr>
                    <td colSpan={6} className="px-8 py-12 text-center text-slate-500">No bookings found in database.</td>
                 </tr>
              )}
              {filteredBookings.map((booking) => (
                <tr key={booking._id} className="border-b border-white/5 hover:bg-white/5 transition-colors group">
                  <td className="px-8 py-6">
                    <div className="flex flex-col">
                      <span className="font-black text-white text-base tracking-tight mb-0.5">{booking._id.slice(-6).toUpperCase()}</span>
                      <span className="text-[10px] text-slate-500 font-black uppercase tracking-widest">{new Date(booking.createdAt).toLocaleDateString()}</span>
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-3">
                       <div className="w-10 h-10 rounded-2xl bg-slate-950 border border-white/5 flex items-center justify-center text-xs font-black text-fuchsia-400 shadow-inner">
                          {booking.user?.name?.charAt(0) || '?'}
                       </div>
                       <div className="flex flex-col">
                         <span className="font-bold text-slate-200">{booking.user?.name || 'Unknown'}</span>
                         <span className="text-xs text-slate-500 font-medium">{booking.user?.email}</span>
                       </div>
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <div className="flex flex-col">
                      <span className="text-slate-300 font-bold mb-1">{booking.showtime?.movie?.title || 'Unknown Title'}</span>
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 bg-black/40 rounded-lg border border-white/5 text-[10px] text-fuchsia-400 font-black uppercase tracking-widest">
                          Seats: {booking.seats.map((s: any) => `${s.row}${s.number}`).join(', ')}
                        </span>
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-2">
                       {booking.paymentStatus === 'completed' ? (
                          <div className="flex items-center gap-2 text-emerald-400 font-black text-[10px] uppercase tracking-widest bg-emerald-400/10 px-3 py-1.5 rounded-full border border-emerald-400/20">
                             <CheckCircle2 className="w-3.5 h-3.5" />
                             Confirmed
                          </div>
                       ) : booking.paymentStatus === 'pending' ? (
                          <div className="flex items-center gap-2 text-amber-400 font-black text-[10px] uppercase tracking-widest bg-amber-400/10 px-3 py-1.5 rounded-full border border-amber-400/20">
                             <Clock className="w-3.5 h-3.5" />
                             Pending
                          </div>
                       ) : (
                          <div className="flex items-center gap-2 text-red-500 font-black text-[10px] uppercase tracking-widest bg-red-400/10 px-3 py-1.5 rounded-full border border-red-400/20">
                             <XCircle className="w-3.5 h-3.5" />
                             Failed
                          </div>
                       )}
                    </div>
                  </td>
                  <td className="px-8 py-6">
                     <div className="flex flex-col">
                        <span className="font-black text-white text-lg tracking-tighter">Rs {booking.totalAmount}</span>
                        <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Online</span>
                     </div>
                  </td>
                  <td className="px-8 py-6 text-right">
                    <div className="flex justify-end gap-2">
                      <button className="p-2.5 rounded-xl bg-slate-950 border border-white/5 text-slate-500 hover:text-white hover:bg-slate-800 transition-all group/btn">
                        <Eye className="w-5 h-5 group-hover/btn:scale-110 transition-transform" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
