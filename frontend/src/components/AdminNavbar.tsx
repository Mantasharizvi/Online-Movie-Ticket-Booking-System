'use client';
import { useAuth } from '@/context/AuthContext';
import { LayoutDashboard, Film, LogOut, Shield } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function AdminNavbar() {
  const { user, logout } = useAuth();
  const pathname = usePathname();

  const links = [
    { name: 'Movies', href: '/admin/movies', icon: Film },
    { name: 'Showtimes', href: '/admin/showtimes', icon: LayoutDashboard },
  ];

  return (
    <nav className="bg-slate-900/60 border-b border-white/5 backdrop-blur-xl sticky top-0 z-[80] px-8 py-3 flex items-center justify-between">
      <div className="flex items-center gap-12">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-fuchsia-600 flex items-center justify-center text-white shadow-lg shadow-fuchsia-900/40">
            <Shield className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-black text-white leading-none">Admin Panel</h1>
            <p className="text-[10px] text-fuchsia-400 font-bold uppercase tracking-widest mt-1">CloudGate Matrix</p>
          </div>
        </div>

        <div className="hidden md:flex items-center gap-2">
          {links.map((link) => {
            const Icon = link.icon;
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.name}
                href={link.href}
                className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-black uppercase tracking-widest transition-all
                  ${isActive 
                    ? 'bg-fuchsia-600/10 text-fuchsia-400 border border-fuchsia-500/20 shadow-[0_0_20px_rgba(192,132,252,0.1)]' 
                    : 'text-slate-500 hover:text-white hover:bg-white/5'
                  }`}
              >
                <Icon className="w-4 h-4" />
                {link.name}
              </Link>
            );
          })}
        </div>
      </div>

      <div className="flex items-center gap-6">
        <div className="hidden xl:flex flex-col items-end mr-2">
          <span className="text-xs font-black text-white">{user?.name}</span>
          <span className="text-[10px] font-bold text-fuchsia-500/80 uppercase tracking-tighter">System Administrator</span>
        </div>
        
        <button
          onClick={logout}
          className="flex items-center gap-2 bg-slate-800 hover:bg-red-600/20 hover:text-red-500 hover:border-red-500/30 text-white px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all border border-white/5"
        >
          <LogOut className="w-4 h-4" />
          Logout
        </button>
      </div>
    </nav>
  );
}
