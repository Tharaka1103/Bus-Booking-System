"use client";
import { Inter, Quicksand, Lilita_One } from 'next/font/google';
import './globals.css';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Preloader } from '@/components/Preloader';
import { useState, useEffect } from 'react';

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

  useEffect(() => {
    const timer = setTimeout(() => setShowPreloader(false), 5000); // 10 seconds
    return () => clearTimeout(timer);
  }, []);

  return (
    <html lang="en">
      <body className={`${inter.variable} ${quicksand.variable} ${lilitaone.variable}`}>
        {showPreloader ? (
          <Preloader />
        ) : (
          <>
            <Header />
            {children}
            <Footer />
          </>
        )}
      </body>
    </html>
  );
}
