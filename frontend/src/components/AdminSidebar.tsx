import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  LayoutDashboard, 
  Film, 
  MonitorPlay, 
  Ticket, 
  Users, 
  Settings, 
  LogOut 
} from 'lucide-react';

import { useAuth } from '@/context/AuthContext';

export default function AdminSidebar() {
  const pathname = usePathname();
  const { logout } = useAuth();

  const navItems = [
    { label: 'Dashboard', href: '/admin', icon: LayoutDashboard },
    { label: 'Movies', href: '/admin/movies', icon: Film },
    { label: 'Showtimes', href: '/admin/showtimes', icon: MonitorPlay },
    { label: 'Bookings', href: '/admin/bookings', icon: Ticket },
    { label: 'Users', href: '/admin/users', icon: Users },
  ];

  return (
    <aside className="w-64 h-screen bg-slate-950 border-r border-white/5 flex flex-col shrink-0 sticky top-0 hidden md:flex">
      {/* Brand */}
      <div className="h-20 flex items-center px-8 border-b border-white/5 shrink-0">
        <Link href="/" className="flex items-center gap-2">
          <Film className="w-6 h-6 text-fuchsia-500" />
          <span className="font-extrabold text-xl tracking-widest text-white">
            CINEMATE<span className="text-fuchsia-500 font-bold block inline">.</span>
          </span>
        </Link>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 py-8 px-4 flex flex-col gap-2 overflow-y-auto custom-scrollbar">
        <div className="text-xs font-bold text-slate-500 uppercase tracking-widest px-4 mb-2">Main Menu</div>
        {navItems.map((item) => {
          const isActive = item.href === '/admin' ? pathname === '/admin' : (pathname === item.href || pathname?.startsWith(`${item.href}/`));
          const Icon = item.icon;
          
          return (
            <Link 
              key={item.href} 
              href={item.href}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-medium ${
                isActive 
                  ? 'bg-fuchsia-500/10 text-fuchsia-400 font-bold shadow-inner border border-fuchsia-500/20' 
                  : 'text-slate-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <Icon className={`w-5 h-5 ${isActive ? 'text-fuchsia-400' : 'text-slate-500'}`} />
              {item.label}
            </Link>
          );
        })}
      </nav>

      {/* Preferences & Logout */}
      <div className="p-4 border-t border-white/5">
        <div className="text-xs font-bold text-slate-500 uppercase tracking-widest px-4 mb-2 mt-2">Preferences</div>
        <Link 
            href="/admin/settings"
            className="flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-medium text-slate-400 hover:text-white hover:bg-white/5"
        >
          <Settings className="w-5 h-5 text-slate-500" />
          Settings
        </Link>
        <button 
            onClick={logout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-medium text-slate-400 hover:text-red-400 hover:bg-red-400/10 mt-2"
        >
          <LogOut className="w-5 h-5 text-slate-500 hover:text-red-400 transition-colors" />
          Logout
        </button>
      </div>
    </aside>
  );
}
