'use client';

import { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowRight, ChevronLeft, ChevronRight } from 'lucide-react';
import { motion, Variants, AnimatePresence } from 'framer-motion';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/dist/ScrollTrigger';
import { useLanguage } from '@/contexts/LanguageContext';

// Register ScrollTrigger plugin
if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

const HeroSection = () => {
  const heroRef = useRef(null);
  const { t } = useLanguage();

  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isMobile, setIsMobile] = useState(false);
  const SLIDE_INTERVAL = 4000;

  // Desktop image slider data with translated alt text
  const desktopImages = [
    { src: '/heroimg1.jpg', alt: t('hero.imageAlt.mountains') },
    { src: '/heroimg2.jpg', alt: t('hero.imageAlt.interior') },
    { src: '/aboutimg.jpg', alt: t('hero.imageAlt.landscape') },
  ];

  // Mobile image slider data with translated alt text
  const mobileImages = [
    { src: '/mobileimg1.jpg', alt: t('hero.imageAlt.mountainsMobile') },
    { src: '/mobileimg2.jpg', alt: t('hero.imageAlt.interiorMobile') },
    { src: '/mobileimg3.jpg', alt: t('hero.imageAlt.landscapeMobile') },
  ];

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

  // Navigation functions
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

      {/* Navigation Arrows - Desktop */}
      <div className="hidden md:block">
        <motion.button
          onClick={goToPrevSlide}
          className="absolute left-4 lg:left-8 top-1/2 -translate-y-1/2 z-20 
                     bg-white/10 backdrop-blur-sm hover:bg-white/20 
                     text-white rounded-full p-3 lg:p-4 
                     transition-all duration-300 group border border-white/20"
          whileHover={{ scale: 1.1, x: -5 }}
          whileTap={{ scale: 0.9 }}
          aria-label="Previous image"
        >
          <ChevronLeft className="w-6 h-6 lg:w-8 lg:h-8 group-hover:scale-110 transition-transform" />
        </motion.button>

        <motion.button
          onClick={goToNextSlide}
          className="absolute right-4 lg:right-8 top-1/2 -translate-y-1/2 z-20 
                     bg-white/10 backdrop-blur-sm hover:bg-white/20 
                     text-white rounded-full p-3 lg:p-4 
                     transition-all duration-300 group border border-white/20"
          whileHover={{ scale: 1.1, x: 5 }}
          whileTap={{ scale: 0.9 }}
          aria-label="Next image"
        >
          <ChevronRight className="w-6 h-6 lg:w-8 lg:h-8 group-hover:scale-110 transition-transform" />
        </motion.button>
      </div>

      {/* Slide Indicators */}
      <div className="absolute bottom-8 md:bottom-12 left-1/2 -translate-x-1/2 z-20 
                      flex gap-2 md:gap-3 px-4">
        {currentImages.map((_, index) => (
          <motion.button
            key={index}
            onClick={() => goToSlide(index)}
            className={`h-1.5 md:h-2 rounded-full transition-all duration-300 
                       ${index === currentImageIndex 
                         ? 'bg-white w-12 md:w-16' 
                         : 'bg-white/40 hover:bg-white/60 w-6 md:w-8'
                       }`}
            whileHover={{ scale: 1.2 }}
            whileTap={{ scale: 0.9 }}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>

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
              {t('hero.title.line1')}
            </motion.span>
            <motion.span
              className="text-accent block bg-accent bg-clip-text"
              variants={textSlideRightVariants}
              initial="hidden"
              animate="visible"
              transition={{ delay: 0.7 }}
            >
              {t('hero.title.line2')}
            </motion.span>
          </motion.h1>

          <motion.p
            className="text-base sm:text-lg md:text-xl lg:text-2xl mb-6 md:mb-8 
                       text-gray-200 max-w-2xl mx-auto px-4 drop-shadow-lg"
            variants={itemVariants}
          >
            {t('hero.description')}
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
                    {t('hero.bookButton')}
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