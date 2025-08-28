'use client';
import React, { useState, useEffect } from 'react';
import { DotLottieReact } from '@lottiefiles/dotlottie-react';

export const Preloader = () => {
  const [showPreloader, setShowPreloader] = useState(true);

  useEffect(() => {
    // Hide preloader after 10 seconds
    const timer = setTimeout(() => {
      setShowPreloader(false);
    }, 10000);

    return () => clearTimeout(timer);
  }, []);

  if (!showPreloader) return null;

  return (
    <div
      className='w-32 h-32 md:w-64 md:h-64 flex items-center justify-center fixed top-0 left-0 right-0 bottom-0 m-auto bg-transparent z-50'
    >
      <DotLottieReact
  src="https://lottie.host/b8463921-449f-46c0-8c05-0d41f96dfb66/3Rz3QkM4MI.lottie"
        loop
        autoplay
      />
    </div>
  );
};
