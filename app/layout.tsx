"use client";
import { Inter, Quicksand, Lilita_One } from 'next/font/google';
import './globals.css';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Preloader } from '@/components/Preloader';
import { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import {AuthProvider} from '@/contexts/AuthContext';
import { Toaster } from 'sonner';
const inter = Inter({ 
  subsets: ['latin'], 
  variable: '--font-inter' 
});

const quicksand = Quicksand({ 
  subsets: ['latin'], 
  variable: '--font-quicksand' 
});

const lilitaone = Lilita_One({ 
  subsets: ['latin'], 
  weight: '400', 
  variable: '--font-lilitaone' 
});

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [showPreloader, setShowPreloader] = useState(true);
  const pathname = usePathname();

  // Define routes where header and footer should be hidden
  const hideHeaderFooterRoutes = ['/login', '/register', '/signin', '/signup', '/dashboard/manager', '/dashboard/admin', '/dashboard/super-admin', '/dashboard/users', '/dashboard/settings', '/dashboard/buses', '/dashboard/routes', '/dashboard/bookings', '/dashboard/bookings/create'];
  const shouldHideHeaderFooter = hideHeaderFooterRoutes.includes(pathname);

  useEffect(() => {
    const timer = setTimeout(() => setShowPreloader(false), 5000); // 5 seconds
    return () => clearTimeout(timer);
  }, []);

  return (
    <html lang="en">
      <AuthProvider>
      <body className={`${inter.variable} ${quicksand.variable} ${lilitaone.variable}`}>
        {showPreloader ? (
          <Preloader />
        ) : (
          <>
            {!shouldHideHeaderFooter && <Header />}
            {children}
            <Toaster position="bottom-right" richColors />
            {!shouldHideHeaderFooter && <Footer />}
          </>
        )}
      </body>
      </AuthProvider>
    </html>
  );
}