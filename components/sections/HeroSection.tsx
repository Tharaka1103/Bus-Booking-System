'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowRight, ChevronLeft, ChevronRight } from 'lucide-react';
import { motion, Variants, AnimatePresence } from 'framer-motion';

const HeroSection = () => {
  // Desktop image slider data
  const desktopImages = [
    {
      src: '/heroimg1.jpg',
      alt: 'Sri Lankan bus journey through mountains'
    },
    {
      src: '/heroimg2.jpg',
      alt: 'Comfortable bus interior'
    },
    {
      src: '/aboutimg.jpg',
      alt: 'Beautiful Sri Lankan landscape'
    },
  ];

  // Mobile image slider data (optimized for mobile viewing)
  const mobileImages = [
    {
      src: '/mobileimg1.jpg',
      alt: 'Sri Lankan bus journey - mobile view'
    },
    {
      src: '/mobileimg2.jpg',
      alt: 'Comfortable bus interior - mobile view'
    },
    {
      src: '/mobileimg3.jpg',
      alt: 'Beautiful landscape - mobile view'
    },
  ];

  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isMobile, setIsMobile] = useState(false);

  // Auto-slide configuration
  const SLIDE_INTERVAL = 4000; // 4 seconds

  // Check if mobile view
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Get current images based on device type
  const currentImages = isMobile ? mobileImages : desktopImages;

  // Auto-slide effect
  useEffect(() => {
    const slideTimer = setInterval(() => {
      setCurrentImageIndex((prevIndex) =>
        prevIndex === currentImages.length - 1 ? 0 : prevIndex + 1
      );
    }, SLIDE_INTERVAL);

    return () => clearInterval(slideTimer);
  }, [currentImages.length]);

  // Reset index when switching between mobile/desktop
  useEffect(() => {
    setCurrentImageIndex(0);
  }, [isMobile]);

  // Manual navigation functions
  const goToNextSlide = () => {
    setCurrentImageIndex((prevIndex) =>
      prevIndex === currentImages.length - 1 ? 0 : prevIndex + 1
    );
  };

  const goToPrevSlide = () => {
    setCurrentImageIndex((prevIndex) =>
      prevIndex === 0 ? currentImages.length - 1 : prevIndex - 1
    );
  };

  const goToSlide = (index: number) => {
    setCurrentImageIndex(index);
  };

  // Animation variants with proper typing
  const containerVariants: Variants = {
    hidden: {
      opacity: 0
    },
    visible: {
      opacity: 1,
      transition: {
        delayChildren: 0.3,
        staggerChildren: 0.2
      }
    }
  };

  const itemVariants: Variants = {
    hidden: {
      y: 50,
      opacity: 0
    },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        duration: 0.8,
        ease: "easeOut"
      }
    }
  };

  const titleVariants: Variants = {
    hidden: {
      scale: 0.8,
      opacity: 0
    },
    visible: {
      scale: 1,
      opacity: 1,
      transition: {
        duration: 1,
        ease: "easeOut"
      }
    }
  };

  const buttonVariants: Variants = {
    hidden: {
      scale: 0,
      opacity: 0
    },
    visible: {
      scale: 1,
      opacity: 1,
      transition: {
        duration: 0.6,
        ease: "easeOut",
        delay: 1.2
      }
    },
    hover: {
      scale: 1.05,
      transition: {
        duration: 0.2,
        ease: "easeInOut"
      }
    },
    tap: {
      scale: 0.95
    }
  };

  // Updated image variants for smooth fade transition
  const imageVariants: Variants = {
    enter: {
      opacity: 0,
    },
    center: {
      opacity: 1,
      transition: {
        duration: 0.8,
        ease: "easeInOut"
      }
    },
    exit: {
      opacity: 0,
      transition: {
        duration: 0.4,
        ease: "easeInOut"
      }
    }
  };

  const textSlideVariants: Variants = {
    hidden: {
      opacity: 0,
      x: -50
    },
    visible: {
      opacity: 1,
      x: 0,
      transition: {
        duration: 0.8,
        ease: "easeOut"
      }
    }
  };

  const textSlideRightVariants: Variants = {
    hidden: {
      opacity: 0,
      x: 50
    },
    visible: {
      opacity: 1,
      x: 0,
      transition: {
        duration: 0.8,
        ease: "easeOut"
      }
    }
  };

  const floatingElementVariants: Variants = {
    animate: {
      y: [0, -20, 0],
      scale: [1, 1.2, 1],
      transition: {
        duration: 3,
        repeat: Infinity,
        ease: "easeInOut"
      }
    }
  };

  const floatingElement2Variants: Variants = {
    animate: {
      y: [0, 15, 0],
      x: [0, 10, 0],
      scale: [1, 0.8, 1],
      transition: {
        duration: 4,
        repeat: Infinity,
        ease: "easeInOut",
        delay: 1
      }
    }
  };

  const arrowVariants: Variants = {
    animate: {
      x: [0, 5, 0],
      transition: {
        duration: 1.5,
        repeat: Infinity,
        ease: "easeInOut",
        delay: 2
      }
    }
  };

  return (
    <section className="relative h-screen flex items-center justify-center overflow-hidden bg-black">
      {/* Background Image Slider */}
      <div className="absolute inset-0 z-0 bg-black">
        <AnimatePresence mode="wait">
          <motion.div
            key={`${isMobile ? 'mobile' : 'desktop'}-${currentImageIndex}`}
            variants={imageVariants}
            initial="enter"
            animate="center"
            exit="exit"
            className="absolute inset-0"
          >
            <Image
              src={currentImages[currentImageIndex].src}
              alt={currentImages[currentImageIndex].alt}
              fill
              className="object-cover"
              priority={currentImageIndex === 0}
              quality={90}
              sizes="100vw"
            />
          </motion.div>
        </AnimatePresence>

        {/* Overlay with enhanced gradient */}
        <motion.div
          className="absolute inset-0 bg-black/50"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 0.5 }}
        />
      </div>

      {/* Navigation Arrows - Hidden on mobile */}
      <button
        onClick={goToPrevSlide}
        className="absolute left-4 md:left-8 top-1/2 transform -translate-y-1/2 z-20 
                   bg-blue-500/30 hover:bg-blue-600/40 text-white p-2 md:p-3 rounded-full 
                   backdrop-blur-sm transition-all duration-300 hover:scale-110
                   border border-blue-400/50 hover:border-blue-300
                   hidden sm:block shadow-lg"
        aria-label="Previous image"
      >
        <ChevronLeft className="w-5 h-5 md:w-6 md:h-6" />
      </button>

      <button
        onClick={goToNextSlide}
        className="absolute right-4 md:right-8 top-1/2 transform -translate-y-1/2 z-20 
                   bg-blue-500/30 hover:bg-blue-600/40 text-white p-2 md:p-3 rounded-full 
                   backdrop-blur-sm transition-all duration-300 hover:scale-110
                   border border-blue-400/50 hover:border-blue-300
                   hidden sm:block shadow-lg"
        aria-label="Next image"
      >
        <ChevronRight className="w-5 h-5 md:w-6 md:h-6" />
      </button>

      {/* Slide Indicators */}
      <div className="absolute bottom-4 md:bottom-8 left-1/2 transform -translate-x-1/2 z-20 
                      flex space-x-2 md:space-x-3">
        {currentImages.map((_, index) => (
          <button
            key={index}
            onClick={() => goToSlide(index)}
            className={`w-2 h-2 md:w-3 md:h-3 rounded-full transition-all duration-300 
                        ${index === currentImageIndex
                ? 'bg-primary scale-125 shadow-lg shadow-blue-500/50'
                : 'bg-blue-300/60 hover:bg-blue-400/80'
              }`}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>

      {/* Animated Background Elements */}
      <motion.div
        className="absolute top-16 md:top-20 left-4 md:left-10 w-3 h-3 md:w-4 md:h-4 
                   bg-yellow-400 rounded-full opacity-60 shadow-lg"
        variants={floatingElementVariants}
        animate="animate"
      />
      <motion.div
        className="absolute bottom-24 md:bottom-32 right-8 md:right-16 w-4 h-4 md:w-6 md:h-6 
                   bg-blue-400 rounded-full opacity-40 shadow-lg"
        variants={floatingElement2Variants}
        animate="animate"
      />

      {/* Content */}
      <div className="relative z-10 container mx-auto px-4 text-center text-white">
        <motion.div
          className="max-w-4xl mx-auto"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          <motion.h1
            className="text-6xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl 
                       font-bold mb-4 md:mb-6 leading-tight drop-shadow-2xl"
            variants={titleVariants}
          >
            <motion.span
              variants={textSlideVariants}
              initial="hidden"
              animate="visible"
              transition={{ delay: 0.5 }}
              className="block"
            >
              Your Journey
            </motion.span>
            <motion.span
              className="text-accent block bg-accent bg-clip-text"
              variants={textSlideRightVariants}
              initial="hidden"
              animate="visible"
              transition={{ delay: 0.7 }}
            >
              Starts Here
            </motion.span>
          </motion.h1>

          <motion.p
            className="text-base sm:text-lg md:text-xl lg:text-2xl mb-6 md:mb-8 
                       text-gray-200 max-w-2xl mx-auto px-4 drop-shadow-lg"
            variants={itemVariants}
          >
            Experience comfortable, safe, and reliable bus travel across beautiful Sri Lanka.
          </motion.p>

          <motion.div
            className="flex flex-col sm:flex-row gap-3 md:gap-4 justify-center items-center 
                       mb-8 md:mb-12 px-4"
            variants={itemVariants}
          >
            <Link href="/booking">
              <motion.div
                variants={buttonVariants}
                whileHover="hover"
                whileTap="tap"
              >
                <Button
                  size="lg"
                  className="bg-primary animate-bounce 
                             text-white rounded-full px-6 py-3 md:px-8 md:py-4 text-base md:text-lg 
                             cursor-pointer shadow-2xl transition-all duration-300 w-full sm:w-auto
                             border border-blue-400/30"
                >
                  <motion.span
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 1.5 }}
                  >
                    Book Your Journey
                  </motion.span>
                  <motion.div
                    variants={arrowVariants}
                    animate="animate"
                    className="inline-block"
                  >
                    <ArrowRight className="ml-2 w-4 h-4 md:w-5 md:h-5" />
                  </motion.div>
                </Button>
              </motion.div>
            </Link>
          </motion.div>

          {/* Device indicator for development (remove in production) */}
          {process.env.NODE_ENV === 'development' && (
            <div className="fixed top-4 right-4 bg-black/50 text-white px-2 py-1 rounded text-xs">
              {isMobile ? 'Mobile' : 'Desktop'} View
            </div>
          )}
        </motion.div>
      </div>
    </section>
  );
};

export default HeroSection;