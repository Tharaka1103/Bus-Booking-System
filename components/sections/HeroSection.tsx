'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowRight, Play } from 'lucide-react';
import { motion, Variants } from 'framer-motion';

const HeroSection = () => {
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

  const backgroundVariants: Variants = {
    hidden: { 
      scale: 1.1, 
      opacity: 0 
    },
    visible: {
      scale: 1,
      opacity: 1,
      transition: {
        duration: 1.5,
        ease: "easeOut"
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
    <section className="relative h-screen flex items-center justify-center overflow-hidden">
      {/* Background Image */}
      <motion.div 
        className="absolute inset-0 z-0"
        variants={backgroundVariants}
        initial="hidden"
        animate="visible"
      >
        <Image
          src="/busnew.jpg"
          alt="Sri Lankan landscape with bus"
          fill
          className="object-cover"
          priority
        />
        <motion.div 
          className="absolute inset-0 bg-black/50"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 0.5 }}
        />
      </motion.div>

      {/* Animated Background Elements */}
      <motion.div
        className="absolute top-20 left-10 w-4 h-4 bg-yellow-400 rounded-full opacity-60"
        variants={floatingElementVariants}
        animate="animate"
      />
      <motion.div
        className="absolute bottom-32 right-16 w-6 h-6 bg-blue-400 rounded-full opacity-40"
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
            className="text-5xl md:text-7xl font-bold mb-6 leading-tight"
            variants={titleVariants}
          >
            <motion.span
              variants={textSlideVariants}
              initial="hidden"
              animate="visible"
              transition={{ delay: 0.5 }}
            >
              Your Journey
            </motion.span>
            <motion.span 
              className="text-accent block"
              variants={textSlideRightVariants}
              initial="hidden"
              animate="visible"
              transition={{ delay: 0.7 }}
            >
              Starts Here
            </motion.span>
          </motion.h1>

          <motion.p 
            className="text-xl md:text-2xl mb-8 text-gray-200 max-w-2xl mx-auto"
            variants={itemVariants}
          >
            Experience comfortable, safe, and reliable bus travel across beautiful Sri Lanka.
          </motion.p>
          
          <motion.div 
            className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12"
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
                  className="bg-primary hover:bg-primary/90 text-white rounded-full px-8 py-4 text-lg cursor-pointer shadow-2xl transition-all duration-300"
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
                    <ArrowRight className="ml-2 w-5 h-5" />
                  </motion.div>
                </Button>
              </motion.div>
            </Link>

            <motion.div
              variants={buttonVariants}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="ml-4"
            >
              <Button 
                variant="outline" 
                size="lg"
                className="bg-transparent border-2 border-white text-white hover:bg-white hover:text-gray-900 rounded-full px-8 py-4 text-lg transition-all duration-300"
              >
                <Play className="mr-2 w-5 h-5" />
                Watch Tour
              </Button>
            </motion.div>
          </motion.div>

          {/* Additional Info */}
          <motion.div
            className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center"
            variants={containerVariants}
          >
            <motion.div variants={itemVariants} className="space-y-2">
              <motion.div 
                className="text-3xl font-bold text-accent"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 2, duration: 0.5 }}
              >
                500+
              </motion.div>
              <p className="text-gray-300">Daily Routes</p>
            </motion.div>
            
            <motion.div variants={itemVariants} className="space-y-2">
              <motion.div 
                className="text-3xl font-bold text-accent"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 2.2, duration: 0.5 }}
              >
                1M+
              </motion.div>
              <p className="text-gray-300">Happy Travelers</p>
            </motion.div>
            
            <motion.div variants={itemVariants} className="space-y-2">
              <motion.div 
                className="text-3xl font-bold text-accent"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 2.4, duration: 0.5 }}
              >
                24/7
              </motion.div>
              <p className="text-gray-300">Support</p>
            </motion.div>
          </motion.div>
        </motion.div>
      </div>

      {/* Scroll Indicator */}
      <motion.div
        className="absolute bottom-8 left-1/2 transform -translate-x-1/2"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 3, duration: 0.8 }}
      >
        <motion.div
          className="w-6 h-10 border-2 border-white rounded-full flex justify-center"
          animate={{ y: [0, 5, 0] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
        >
          <motion.div
            className="w-1 h-3 bg-white rounded-full mt-2"
            animate={{ y: [0, 8, 0] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          />
        </motion.div>
        <p className="text-white text-sm mt-2 opacity-70">Scroll to explore</p>
      </motion.div>
    </section>
  );
};

export default HeroSection;