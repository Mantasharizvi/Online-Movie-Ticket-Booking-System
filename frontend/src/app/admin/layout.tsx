'use client';
import { useAuth } from '@/context/AuthContext';
import { useRouter, usePathname } from 'next/navigation';
import { useEffect } from 'react';
import { Loader2 } from 'lucide-react';
import AdminSidebar from '@/components/AdminSidebar';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { admin, isLoading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    // Redirection logic:
    if (!isLoading && pathname !== '/admin/login') {
       if (!admin || admin.role !== 'admin') {
          router.push('/admin/login');
       }
    }
    
    if (!isLoading && pathname === '/admin/login' && admin?.role === 'admin') {
       router.push('/admin');
    }
  }, [admin, isLoading, pathname, router]);

  if (isLoading) {
    return (
      <div className="min-h-screen grow bg-slate-950 flex items-center justify-center">
        <Loader2 className="w-10 h-10 text-fuchsia-600 animate-spin" />
      </div>
    );
  }

  // If we are on the login page, just render it WITHOUT the sidebar
  if (pathname === '/admin/login') {
    return <>{children}</>;
  }

  // If not logged in as admin, don't show children yet (handled by useEffect redirect)
  if (!admin || admin.role !== 'admin') {
     return (
       <div className="min-h-screen grow bg-slate-950 flex items-center justify-center">
         <Loader2 className="w-10 h-10 text-fuchsia-600 animate-spin" />
       </div>
     );
  }

  // Return the children within the dashboard shell (with sidebar)
  return (
    <div className="min-h-screen bg-slate-950 flex overflow-hidden">
      <AdminSidebar />
      <main className="flex-1 overflow-y-auto grow custom-scrollbar">
        {children}
      </main>
    </div>
  );
}
