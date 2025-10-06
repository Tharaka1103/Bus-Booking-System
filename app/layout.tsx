// app/layout.tsx
"use client";
import { Inter, Quicksand, Lilita_One } from 'next/font/google';
import './globals.css';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Preloader } from '@/components/Preloader';
import { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { AuthProvider } from '@/contexts/AuthContext';
import { LanguageProvider, hasStoredLanguage } from '@/contexts/LanguageContext';
import LanguageSelector from '@/components/LanguageSelector';
import GoogleTranslate from '@/components/GoogleTranslate';
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
  const [showLanguageSelector, setShowLanguageSelector] = useState(false);
  const [isClient, setIsClient] = useState(false);
  const pathname = usePathname();

  // Define routes where header and footer should be hidden
  const hideHeaderFooterRoutes = [
    '/login', 
    '/booking', 
    '/register', 
    '/signin', 
    '/signup', 
    '/dashboard/manager', 
    '/dashboard/admin', 
    '/dashboard/super-admin', 
    '/dashboard/users', 
    '/dashboard/settings', 
    '/dashboard/buses', 
    '/dashboard/routes', 
    '/dashboard/bookings', 
    '/dashboard/bookings/create',
    '/dashboard/feedback'
  ];
  const shouldHideHeaderFooter = hideHeaderFooterRoutes.includes(pathname);

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    if (!isClient) return;

    // Show preloader first
    const preloaderTimer = setTimeout(() => {
      setShowPreloader(false);
      
      // Check if language is already stored
      const hasLanguage = hasStoredLanguage();
      setShowLanguageSelector(!hasLanguage);
    }, 3000); // 3 seconds for preloader

    return () => clearTimeout(preloaderTimer);
  }, [isClient]);

  const handleLanguageSelected = () => {
    setShowLanguageSelector(false);
  };

  if (!isClient) {
    return (
      <html lang="en">
        <head>
          <style>{`
            /* Hide Google Translate toolbar */
            .goog-te-banner-frame.skiptranslate {
              display: none !important;
            }
            body {
              top: 0px !important;
            }
            .goog-te-balloon-frame {
              display: none !important;
            }
            .goog-tooltip {
              display: none !important;
            }
            .goog-tooltip:hover {
              display: none !important;
            }
            .goog-text-highlight {
              background-color: transparent !important;
              box-shadow: none !important;
            }
          `}</style>
        </head>
        <body className={`${inter.variable} ${quicksand.variable} ${lilitaone.variable}`}>
          <div className="min-h-screen flex items-center justify-center">
            <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-sky-500"></div>
          </div>
        </body>
      </html>
    );
  }

  return (
    <html lang="en">
      <head>
        <style>{`
          /* Hide Google Translate toolbar */
          .goog-te-banner-frame.skiptranslate {
            display: none !important;
          }
          body {
            top: 0px !important;
          }
          .goog-te-balloon-frame {
            display: none !important;
          }
          .goog-tooltip {
            display: none !important;
          }
          .goog-tooltip:hover {
            display: none !important;
          }
          .goog-text-highlight {
            background-color: transparent !important;
            box-shadow: none !important;
          }
        `}</style>
      </head>
      <body className={`${inter.variable} ${quicksand.variable} ${lilitaone.variable}`}>
        <LanguageProvider>
          <AuthProvider>
            <GoogleTranslate />
            {showPreloader ? (
              <Preloader />
            ) : showLanguageSelector ? (
              <LanguageSelector onLanguageSelected={handleLanguageSelected} />
            ) : (
              <>
                {!shouldHideHeaderFooter && <Header />}
                {children}
                <Toaster position="bottom-right" richColors />
                {!shouldHideHeaderFooter && <Footer />}
              </>
            )}
          </AuthProvider>
        </LanguageProvider>
      </body>
    </html>
  );
}