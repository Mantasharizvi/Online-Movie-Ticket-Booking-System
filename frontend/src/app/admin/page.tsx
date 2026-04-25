'use client';
import { useState, useEffect } from 'react';
import { 
  TrendingUp, 
  Users, 
  Ticket, 
  Film,
  MoreVertical,
  ArrowUpRight,
  Download,
  Loader2
} from 'lucide-react';
import * as XLSX from 'xlsx';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';

export default function AdminDashboard() {
  const { adminToken } = useAuth();
  const [data, setData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await fetch('http://localhost:5000/api/admin/stats', {
          headers: { 'Authorization': `Bearer ${adminToken}` }
        });
        if (res.ok) {
          const json = await res.json();
          setData(json);
        }
      } catch (err) {
        console.error('Failed to fetch stats:', err);
      } finally {
        setIsLoading(false);
      }
    };

    if (adminToken) fetchStats();
  }, [adminToken]);

  const statConfig = [
    { key: 'totalRevenue', title: 'Total Revenue', icon: TrendingUp, color: 'text-emerald-400', bg: 'bg-emerald-400/10' },
    { key: 'totalBookings', title: 'Total Bookings', icon: Ticket, color: 'text-fuchsia-400', bg: 'bg-fuchsia-400/10' },
    { key: 'activeMovies', title: 'Active Movies', icon: Film, color: 'text-blue-400', bg: 'bg-blue-400/10' },
    { key: 'totalUsers', title: 'Total Users', icon: Users, color: 'text-purple-400', bg: 'bg-purple-400/10' },
  ];

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    
    if (diff < 60000) return 'Just now';
    if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
    if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
    return date.toLocaleDateString();
  };

  const handleDownloadReport = () => {
    if (!data) return;

    // 1. Prepare Summary Data
    const summaryData = statConfig.map(stat => ({
      Title: stat.title,
      Value: data.stats?.[stat.key as keyof typeof data.stats] || '0'
    }));

    // 2. Prepare Bookings Data
    const bookingsData = (data.recentBookings || []).map((b: any) => ({
      'Booking ID': b.id,
      'User': b.user,
      'Movie': b.movie,
      'Seats': b.seats,
      'Status': b.status,
      'Amount': b.amount,
      'Date': new Date(b.date).toLocaleString()
    }));

    // 3. Create Workbook and Sheets
    const wb = XLSX.utils.book_new();

    // Summary Sheet
    const wsSummary = XLSX.utils.json_to_sheet(summaryData);
    XLSX.utils.book_append_sheet(wb, wsSummary, 'Dashboard Summary');

    // Recent Bookings Sheet
    const wsBookings = XLSX.utils.json_to_sheet(bookingsData);
    XLSX.utils.book_append_sheet(wb, wsBookings, 'Recent Bookings');

    // 4. Trigger Download
    const fileName = `Dashboard_Report_${new Date().toISOString().split('T')[0]}.xlsx`;
    XLSX.writeFile(wb, fileName);
  };

  return (
    <div className="p-8 lg:p-12 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-12 gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight mb-2">Dashboard Overview</h1>
          <p className="text-slate-400 font-medium text-sm">Welcome back, Admin. Here's what's happening today.</p>
        </div>
        <button 
          onClick={handleDownloadReport}
          disabled={!data || isLoading}
          className="flex items-center gap-2 bg-slate-900 border border-white/10 hover:border-fuchsia-500/50 text-white px-6 py-2.5 rounded-xl font-bold transition-all shadow-lg group disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Download className="w-5 h-5 text-fuchsia-500 group-hover:scale-110 transition-transform" />
          Download Report
        </button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
        {statConfig.map((stat, i) => {
          const Icon = stat.icon;
          const value = data?.stats?.[stat.key as keyof typeof data.stats];
          
          return (
            <div key={i} className="bg-slate-900/40 backdrop-blur-xl border border-white/5 rounded-[2.5rem] p-8 shadow-2xl relative overflow-hidden group hover:border-fuchsia-500/20 transition-all duration-500">
              <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-fuchsia-500/10 to-transparent rounded-bl-full translate-x-1/2 -translate-y-1/2 group-hover:from-fuchsia-500/20 transition-all duration-500 pointer-events-none" />
              
              <div className="flex justify-between items-start mb-8">
                <div className={`w-14 h-14 rounded-2xl ${stat.bg} ${stat.color} flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-500`}>
                  <Icon className="w-7 h-7" />
                </div>
                <div className={`px-3 py-1.5 bg-emerald-500/5 text-emerald-400 rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center gap-1.5 border border-emerald-500/10`}>
                  <TrendingUp className="w-3 h-3" />
                  +12.5%
                </div>
              </div>
              
              <h3 className="text-slate-500 text-xs font-black uppercase tracking-[0.2em] mb-2">{stat.title}</h3>
              {isLoading ? (
                <div className="h-10 w-3/4 bg-slate-800 animate-pulse rounded-lg" />
              ) : (
                <div className="text-4xl font-extrabold text-white tracking-tighter group-hover:text-fuchsia-400 transition-colors duration-500">{value || '0'}</div>
              )}
            </div>
          )
        })}
      </div>

      {/* Recent Activity Table */}
      <div className="bg-slate-900/50 backdrop-blur-sm border border-white/5 rounded-3xl shadow-xl overflow-hidden">
        <div className="p-6 md:p-8 flex justify-between items-center border-b border-white/5">
          <h2 className="text-xl font-bold text-white">Recent Ticket Bookings</h2>
          <Link href="/admin/bookings" className="text-sm font-bold text-fuchsia-400 hover:text-fuchsia-300 flex items-center gap-1">
            View All <ArrowUpRight className="w-4 h-4" />
          </Link>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-black/20 text-slate-400 text-xs uppercase tracking-widest font-semibold">
                <th className="px-8 py-4">Booking ID</th>
                <th className="px-8 py-4">User</th>
                <th className="px-8 py-4">Movie</th>
                <th className="px-8 py-4">Status</th>
                <th className="px-8 py-4">Amount</th>
                <th className="px-8 py-4"></th>
              </tr>
            </thead>
            <tbody className="text-sm">
              {isLoading ? (
                Array(5).fill(0).map((_, i) => (
                  <tr key={i} className="border-b border-white/5 animate-pulse">
                    <td className="px-8 py-6"><div className="h-4 w-20 bg-slate-800 rounded" /></td>
                    <td className="px-8 py-6"><div className="h-8 w-8 bg-slate-800 rounded-full" /></td>
                    <td className="px-8 py-6"><div className="h-4 w-40 bg-slate-800 rounded" /></td>
                    <td className="px-8 py-6"><div className="h-6 w-20 bg-slate-800 rounded-full" /></td>
                    <td className="px-8 py-6"><div className="h-4 w-16 bg-slate-800 rounded" /></td>
                    <td className="px-8 py-6"></td>
                  </tr>
                ))
              ) : (data?.recentBookings || []).map((booking: any, i: number) => (
                <tr key={i} className="border-b border-white/5 hover:bg-white/10 transition-all cursor-pointer group">
                  <td className="px-8 py-6 font-black text-white tracking-wider">{booking.id}</td>
                  <td className="px-8 py-6 text-slate-300 font-medium">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-fuchsia-600/20 to-indigo-600/20 border border-fuchsia-500/20 flex items-center justify-center text-sm font-black text-fuchsia-400 shadow-lg">
                        {booking.user.charAt(0)}
                      </div>
                      <div className="flex flex-col">
                        <span className="font-bold text-white">{booking.user}</span>
                        <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">{formatDate(booking.date)}</span>
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <div className="flex flex-col">
                      <span className="text-slate-200 font-bold group-hover:text-fuchsia-400 transition-colors">{booking.movie}</span>
                      <span className="text-[10px] text-slate-500 font-black uppercase tracking-widest mt-0.5">Seats: {booking.seats}</span>
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <span className={`px-4 py-1.5 text-[10px] rounded-xl font-black uppercase tracking-[0.15em] border backdrop-blur-md shadow-lg
                      ${booking.status === 'Confirmed' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20 shadow-emerald-500/5' : 
                        booking.status === 'Pending' ? 'bg-amber-500/10 text-amber-400 border-amber-500/20 shadow-amber-500/5' : 
                        'bg-red-500/10 text-red-500 border-red-500/20 shadow-red-500/5'}`}
                    >
                      {booking.status}
                    </span>
                  </td>
                  <td className="px-8 py-6 font-black text-white text-base tracking-tighter">{booking.amount}</td>
                  <td className="px-8 py-5 text-right opacity-0 group-hover:opacity-100 transition-opacity">
                    <button className="text-slate-400 hover:text-white p-2 rounded-lg hover:bg-slate-800">
                      <MoreVertical className="w-4 h-4" />
                    </button>
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
