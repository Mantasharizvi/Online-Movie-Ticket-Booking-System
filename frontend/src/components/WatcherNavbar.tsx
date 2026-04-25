import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { Film, MapPin, User, ChevronDown, LogOut } from 'lucide-react';

export default function CinemateNavbar() {
  const { user, logout } = useAuth();

  return (
    <nav className="w-full flex items-center justify-between px-8 py-6 text-white bg-transparent z-50">
      <div className="flex items-center gap-2">
        <Link href="/" className="flex items-center gap-2 group">
          <Film className="h-8 w-8 text-fuchsia-500 group-hover:text-fuchsia-400 transition-colors" />
          <h1 className="font-extrabold text-2xl tracking-widest text-white">CINEMATE<span className="text-fuchsia-500 text-xl leading-none">.</span></h1>
        </Link>
      </div>
      

      <div className="flex-1" />

      <div className="flex items-center gap-8">
        <button className="flex items-center gap-2 text-white/80 hover:text-white font-medium text-sm transition-colors uppercase tracking-widest text-[10px] font-bold">
          <MapPin className="w-3 h-3 text-fuchsia-400 shadow-[0_0_10px_rgba(232,121,249,0.5)]" />
          <span>Ocean Mall</span>
          <ChevronDown className="w-3 h-3 opacity-70" />
        </button>

        {user ? (
          <div className="flex items-center gap-6">
            <Link href="/bookings" className="flex items-center gap-2 text-white/80 hover:text-white font-bold text-xs transition-colors uppercase tracking-widest group">
              <span className="group-hover:text-fuchsia-400 transition-colors">My Bookings</span>
            </Link>
            <div className="flex items-center gap-3 pl-6 border-l border-white/10">
              <div className="w-8 h-8 rounded-full bg-fuchsia-600/20 border border-fuchsia-500/30 flex items-center justify-center text-fuchsia-400 text-xs font-black">
                {user.name.charAt(0).toUpperCase()}
              </div>
              <button 
                onClick={logout}
                className="text-slate-400 hover:text-white p-2 transition-colors"
                title="Logout"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          </div>
        ) : (
          <Link 
            href="/login" 
            className="flex items-center gap-2 text-white/80 hover:text-white font-bold text-xs transition-colors uppercase tracking-widest group"
          >
            <User className="w-4 h-4 text-fuchsia-400 group-hover:scale-110 transition-transform" />
            <span>Log in</span>
          </Link>
        )}
      </div>
    </nav>
  );
}
