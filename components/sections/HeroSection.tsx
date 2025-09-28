'use client';

import { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowRight, ChevronLeft, ChevronRight } from 'lucide-react';
import { motion, Variants, AnimatePresence } from 'framer-motion';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/dist/ScrollTrigger';

// Register ScrollTrigger plugin
if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

const HeroSection = () => {
  const heroRef = useRef(null);

  // Desktop image slider data
  const desktopImages = [
    { src: '/heroimg1.jpg', alt: 'Sri Lankan bus journey through mountains' },
    { src: '/heroimg2.jpg', alt: 'Comfortable bus interior' },
    { src: '/aboutimg.jpg', alt: 'Beautiful Sri Lankan landscape' },
  ];

  // Mobile image slider data (optimized for mobile viewing)
  const mobileImages = [
    { src: '/mobileimg1.jpg', alt: 'Sri Lankan bus journey - mobile view' },
    { src: '/mobileimg2.jpg', alt: 'Comfortable bus interior - mobile view' },
    { src: '/mobileimg3.jpg', alt: 'Beautiful landscape - mobile view' },
  ];

  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isMobile, setIsMobile] = useState(false);
  const SLIDE_INTERVAL = 4000;

  // Check if mobile view
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const currentImages = isMobile ? mobileImages : desktopImages;

  // Auto-slide effect
  useEffect(() => {
    const slideTimer = setInterval(() => {
      setCurrentImageIndex((prevIndex) =>
        prevIndex === currentImages.length - 1 ? 0 : prevIndex + 1
      );
    }, SLIDE_INTERVAL);
    return () => clearInterval(slideTimer);
  }, [currentImages.length, SLIDE_INTERVAL]);

  // Reset index when switching between mobile/desktop
  useEffect(() => {
    setCurrentImageIndex(0);
  }, [isMobile]);

  // Navigation functions (omitted for brevity, assume they work)
  const goToNextSlide = () => setCurrentImageIndex((p) => (p === currentImages.length - 1 ? 0 : p + 1));
  const goToPrevSlide = () => setCurrentImageIndex((p) => (p === 0 ? currentImages.length - 1 : p - 1));
  const goToSlide = (index: number) => setCurrentImageIndex(index);

  // --- GSAP ScrollTrigger for Parallax Effect ---
  useEffect(() => {
    const context = gsap.context(() => {
      // Parallax effect: moves the background image slower than the foreground content
      gsap.to(".hero-background", {
        y: 100,
        ease: "none",
        scrollTrigger: {
          trigger: heroRef.current,
          start: "top top",
          end: "bottom top",
          scrub: 1,
        }
      });

      // Optional: fade and push the content up slightly as the user scrolls
      gsap.to(".hero-content", {
        y: -50,
        opacity: 0.8,
        ease: "none",
        scrollTrigger: {
          trigger: heroRef.current,
          start: "top top",
          end: "center top",
          scrub: 1,
        }
      });

    }, heroRef);

    return () => context.revert();
  }, []);

  // --- Framer Motion Variants ---
  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { delayChildren: 0.3, staggerChildren: 0.2 } }
  };

  const itemVariants: Variants = {
    hidden: { y: 50, opacity: 0 },
    visible: { y: 0, opacity: 1, transition: { duration: 0.8, ease: "easeOut" } }
  };

  const titleVariants: Variants = {
    hidden: { scale: 0.8, opacity: 0 },
    visible: { scale: 1, opacity: 1, transition: { duration: 1, ease: "easeOut" } }
  };

  const buttonVariants: Variants = {
    hidden: { scale: 0, opacity: 0 },
    visible: { scale: 1, opacity: 1, transition: { duration: 0.6, ease: "easeOut", delay: 1.2 } },
    hover: { scale: 1.05, transition: { duration: 0.2, ease: "easeInOut" } },
    tap: { scale: 0.95 }
  };

  const imageVariants: Variants = {
    enter: { opacity: 0 },
    center: { opacity: 1, transition: { duration: 0.8, ease: "easeInOut" } },
    exit: { opacity: 0, transition: { duration: 0.4, ease: "easeInOut" } }
  };

  const textSlideVariants: Variants = {
    hidden: { opacity: 0, x: -50 },
    visible: { opacity: 1, x: 0, transition: { duration: 0.8, ease: "easeOut" } }
  };

  const textSlideRightVariants: Variants = {
    hidden: { opacity: 0, x: 50 },
    visible: { opacity: 1, x: 0, transition: { duration: 0.8, ease: "easeOut" } }
  };

  const arrowVariants: Variants = {
    animate: {
      x: [0, 5, 0],
      transition: { duration: 1.5, repeat: Infinity, ease: "easeInOut", delay: 2 }
    }
  };

  return (
    <section
      className="relative h-screen flex items-center justify-center overflow-hidden bg-black"
      id="hero"
      ref={heroRef}
    >
      {/* Background Image Slider (GSAP Parallax Target) */}
      <div className="absolute inset-0 z-0 bg-black hero-background">
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

      {/* Navigation Arrows & Indicators (omitted for brevity, assume they are correct) */}
      {/* ... */}

      {/* Content (GSAP ScrollTrigger Target) */}
      <div className="relative z-10 container mx-auto px-4 text-center text-white hero-content">
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
                  className="bg-primary 
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

        </motion.div>
      </div>
    </section>
  );
};

export default HeroSection;