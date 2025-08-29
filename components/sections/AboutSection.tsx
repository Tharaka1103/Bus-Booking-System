'use client';

import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { 
  CheckCircle, 
  Award, 
  Users, 
  Clock, 
  Star,
  Shield,
  MapPin,
  ArrowRight,
  Play,
  ChevronRight
} from 'lucide-react';
import { motion, Variants, useMotionValue, useTransform, PanInfo } from 'framer-motion';

const AboutSection = () => {
  const [activeFeature, setActiveFeature] = useState(0);
  const [isVideoLoaded, setIsVideoLoaded] = useState(false);
  const [isSwipeComplete, setIsSwipeComplete] = useState(false);
  const router = useRouter();
  
  // Motion values for the swipe button
  const x = useMotionValue(0);
  const scale = useTransform(x, [0, 200], [1, 1.25]);
  const opacity = useTransform(x, [0, 200], [1, 0.8]);
  const backgroundOpacity = useTransform(x, [0, 200], [0, 1]);
  
  const constraintsRef = useRef<HTMLDivElement>(null);

  const features = [
    {
      icon: <Award className="w-8 h-8" />,
      title: "25+ Years Experience",
      description: "Serving Sri Lanka with excellence since 1995, building trust through reliable service",
      color: "from-blue-500 to-blue-600",
      bgColor: "bg-blue-50",
      textColor: "text-blue-600"
    },
    {
      icon: <Users className="w-8 h-8" />,
      title: "1M+ Happy Customers",
      description: "Trusted by millions of passengers nationwide with 98% satisfaction rate",
      color: "from-green-500 to-green-600",
      bgColor: "bg-green-50",
      textColor: "text-green-600"
    },
    {
      icon: <Shield className="w-8 h-8" />,
      title: "100% Safety Record",
      description: "Maintaining highest safety standards with zero accidents in the last 5 years",
      color: "from-purple-500 to-purple-600",
      bgColor: "bg-purple-50",
      textColor: "text-purple-600"
    },
    {
      icon: <Clock className="w-8 h-8" />,
      title: "24/7 Service",
      description: "Round-the-clock customer support and emergency assistance available",
      color: "from-orange-500 to-orange-600",
      bgColor: "bg-orange-50",
      textColor: "text-orange-600"
    }
  ];

  const stats = [
    { number: "1M+", label: "Happy Passengers" },
    { number: "50+", label: "Routes Covered" },
    { number: "200+", label: "Modern Buses" },
    { number: "25+", label: "Years Experience" }
  ];

  // Handle swipe completion
  const handleDragEnd = (event: any, info: PanInfo) => {
    const threshold = 180; // Minimum distance to complete swipe
    
    if (info.offset.x > threshold) {
      // Complete the swipe
      setIsSwipeComplete(true);
      x.set(200);
      
      // Redirect after animation
      setTimeout(() => {
        router.push('/booking');
      }, 300);
    } else {
      // Reset to original position
      x.set(0);
    }
  };

  const containerVariants: Variants = {
    hidden: { 
      opacity: 0 
    },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2
      }
    }
  };

  const itemVariants: Variants = {
    hidden: { 
      opacity: 0, 
      y: 30 
    },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        ease: "easeOut"
      }
    }
  };

  const headerVariants: Variants = {
    hidden: { 
      opacity: 0, 
      y: 30 
    },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: {
        duration: 0.8,
        ease: "easeOut"
      }
    }
  };

  const imageVariants: Variants = {
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

  const statsVariants: Variants = {
    hidden: { 
      opacity: 0, 
      y: 30 
    },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: {
        duration: 0.8,
        ease: "easeOut"
      }
    }
  };

  const statItemVariants: Variants = {
    hidden: { 
      opacity: 0, 
      scale: 0.5 
    },
    visible: { 
      opacity: 1, 
      scale: 1,
      transition: {
        duration: 0.5,
        ease: "easeOut"
      }
    }
  };

  const floatingCardVariants: Variants = {
    hidden: { 
      opacity: 0, 
      y: 30 
    },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: {
        delay: 0.5, 
        duration: 0.6,
        ease: "easeOut"
      }
    }
  };

  const ctaVariants: Variants = {
    hidden: { 
      opacity: 0, 
      y: 30 
    },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: {
        duration: 0.8,
        ease: "easeOut"
      }
    }
  };

  const expandVariants: Variants = {
    hidden: { 
      opacity: 0, 
      height: 0 
    },
    visible: { 
      opacity: 1, 
      height: "auto",
      transition: {
        duration: 0.3,
        ease: "easeOut"
      }
    }
  };

  return (
    <section className="py-16 lg:py-24 bg-gradient-to-br from-gray-50 via-white to-blue-50 overflow-hidden">
      <div className="container mx-auto px-4">
        {/* Header Section */}
        <motion.div 
          className="text-center mb-16"
          variants={headerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
        >
          <div className="inline-flex items-center gap-2 bg-blue-100 text-blue-800 px-4 py-2 rounded-full text-sm font-medium mb-4">
            <Star className="w-4 h-4" />
            About Vijitha Travels
          </div>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-6 leading-tight">
            Your Trusted Travel Partner
            <span className="block text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">
              Since 1995
            </span>
          </h2>
          <p className="text-lg md:text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            Connecting hearts, destinations, and dreams across the beautiful island of Sri Lanka 
            with safe, comfortable, and reliable transportation services.
          </p>
        </motion.div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center mb-20">
          {/* Content Side */}
          <motion.div 
            className="space-y-8"
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            <motion.div variants={itemVariants} className="space-y-6">
              <div className="flex items-center gap-3">
                <div className="w-1 h-12 bg-gradient-to-b from-blue-500 to-purple-600 rounded-full"></div>
                <h3 className="text-2xl md:text-3xl font-bold text-gray-900">
                  Our Story
                </h3>
              </div>
              
              <div className="space-y-4 text-gray-600 leading-relaxed">
                <p className="text-lg">
                  Founded in 1995, Vijitha Travels began as a small family business with a simple vision: 
                  to provide safe, comfortable, and reliable transportation that brings people closer to 
                  their destinations and dreams.
                </p>
                <p className="text-lg">
                  Today, we've grown into Sri Lanka's premier bus service provider, operating a modern 
                  fleet of over 200 buses and serving more than a million passengers annually across 
                  50+ routes throughout the island.
                </p>
              </div>

              <div className="flex items-center gap-4 p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl border border-blue-100">
                <div className="p-2 bg-white rounded-lg shadow-sm">
                  <MapPin className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <p className="font-semibold text-gray-900">Island-Wide Coverage</p>
                  <p className="text-sm text-gray-600">Connecting all major cities and towns</p>
                </div>
              </div>
            </motion.div>

            {/* Interactive Features */}
            <motion.div variants={itemVariants} className="space-y-4">
              <h4 className="text-xl font-bold text-gray-900 mb-6">Why Choose Vijitha Travels?</h4>
              <div className="space-y-3">
                {features.map((feature, index) => (
                  <motion.div
                    key={index}
                    className={`p-4 rounded-xl border-2 cursor-pointer transition-all duration-300 ${
                      activeFeature === index
                        ? `${feature.bgColor} border-blue-200 shadow-lg`
                        : 'bg-white border-gray-100 hover:border-gray-200 hover:shadow-md'
                    }`}
                    onClick={() => setActiveFeature(index)}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <div className="flex items-start gap-4">
                      <div className={`p-2 rounded-lg ${activeFeature === index ? 'bg-white shadow-sm' : feature.bgColor}`}>
                        <div className={activeFeature === index ? feature.textColor : feature.textColor}>
                          {feature.icon}
                        </div>
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <h5 className="font-semibold text-gray-900">{feature.title}</h5>
                          <ChevronRight className={`w-5 h-5 transition-transform duration-300 ${
                            activeFeature === index ? 'rotate-90 text-blue-600' : 'text-gray-400'
                          }`} />
                        </div>
                        {activeFeature === index && (
                          <motion.p
                            variants={expandVariants}
                            initial="hidden"
                            animate="visible"
                            className="text-gray-600 mt-2 text-sm overflow-hidden"
                          >
                            {feature.description}
                          </motion.p>
                        )}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </motion.div>

          {/* Video Side */}
          <motion.div 
            className="relative"
            variants={imageVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            <div className="relative">
              {/* Main Video Container */}
              <div className="relative h-96 lg:h-[500px] rounded-3xl overflow-hidden shadow-2xl bg-gray-900">
                {/* Video Element */}
                <video
                  className="absolute inset-0 w-full h-full object-cover"
                  autoPlay
                  muted
                  loop
                  playsInline
                  preload="metadata"
                  onLoadedData={() => setIsVideoLoaded(true)}
                  onError={() => setIsVideoLoaded(false)}
                >
                  <source src="/herovideo.webm" type="video/webm" />
                  <source src="/herovideo.mp4" type="video/mp4" />
                  Your browser does not support the video tag.
                </video>

                {/* Loading Placeholder */}
                {!isVideoLoaded && (
                  <div className="absolute inset-0 bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center">
                    <div className="text-center text-white">
                      <div className="w-16 h-16 border-4 border-white/30 border-t-white rounded-full animate-spin mx-auto mb-4"></div>
                      <p className="text-lg font-medium">Loading Video...</p>
                    </div>
                  </div>
                )}

                {/* Video Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-black/20 pointer-events-none"></div>
                
                {/* Video Controls Overlay */}
                <div className="absolute inset-0 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity duration-300">
                  <motion.button
                    className="w-20 h-20 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center shadow-2xl hover:bg-white/30 transition-colors group border border-white/30"
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={(e) => {
                      const video = e.currentTarget.parentElement?.previousElementSibling as HTMLVideoElement;
                      if (video?.paused) {
                        video.play();
                      } else {
                        video?.pause();
                      }
                    }}
                  >
                    <Play className="w-8 h-8 text-white ml-1 group-hover:text-white/90" />
                  </motion.button>
                </div>

                {/* Video Info Badge */}
                <div className="absolute top-4 left-4 bg-black/50 backdrop-blur-sm text-white px-3 py-1 rounded-full text-sm font-medium">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                    Live Preview
                  </div>
                </div>
              </div>

              {/* Floating Stats Card */}
              <motion.div
                className="absolute -bottom-8 -left-8 bg-white rounded-2xl shadow-2xl p-6 border border-gray-100 backdrop-blur-sm"
                variants={floatingCardVariants}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
              >
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                  <span className="text-sm font-medium text-gray-600">Live Status</span>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-2xl font-bold text-blue-600">98%</p>
                    <p className="text-xs text-gray-500">On-Time Rate</p>
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-green-600">4.9★</p>
                    <p className="text-xs text-gray-500">Customer Rating</p>
                  </div>
                </div>
              </motion.div>

              {/* Decorative Elements */}
              <div className="absolute -top-6 -right-6 w-24 h-24 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full opacity-20 blur-xl animate-pulse"></div>
              <div className="absolute -bottom-6 -right-6 w-32 h-32 bg-gradient-to-br from-orange-400 to-pink-500 rounded-full opacity-20 blur-xl animate-pulse"></div>
            </div>
          </motion.div>
        </div>

        {/* Stats Section */}
        <motion.div 
          className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-3xl p-8 lg:p-12 text-white relative overflow-hidden"
          variants={statsVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
        >
          {/* Background Pattern */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-white/20 to-transparent"></div>
            <div className="absolute -top-24 -right-24 w-48 h-48 bg-white/10 rounded-full"></div>
            <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-white/10 rounded-full"></div>
          </div>

          <div className="relative z-10">
            <div className="text-center mb-8">
              <h3 className="text-2xl lg:text-3xl font-bold mb-4">
                Trusted by Thousands Across Sri Lanka
              </h3>
              <p className="text-blue-100 text-lg">
                Numbers that speak for our commitment to excellence
              </p>
            </div>
            
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
              {stats.map((stat, index) => (
                <motion.div
                  key={index}
                  className="text-center"
                  variants={statItemVariants}
                  initial="hidden"
                  whileInView="visible"
                  transition={{ delay: index * 0.1 }}
                  viewport={{ once: true }}
                >
                  <div className="text-3xl lg:text-4xl font-bold mb-2">{stat.number}</div>
                  <div className="text-blue-100 text-sm lg:text-base">{stat.label}</div>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Swipe-to-Book CTA Section */}
        <motion.div 
          className="text-center mt-16"
          variants={ctaVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
        >
          <div className="max-w-md mx-auto">
            {/* Swipe Container */}
            <div 
              ref={constraintsRef}
              className="relative bg-white rounded-2xl p-2 shadow-lg border border-gray-100 hover:shadow-xl transition-shadow duration-300 overflow-hidden"
            >
              {/* Background Progress Bar */}
              <motion.div
                className="absolute inset-2 bg-primary rounded-xl"
                style={{ opacity: backgroundOpacity }}
              />
              
              {/* Instruction Text */}
              <div className="relative z-10 flex items-center justify-between px-4 py-3">
                <span className="pl-20 text-gray-600 font-medium text-sm md:text-base">
                  {isSwipeComplete ? 'Redirecting...' : 'Swipe to start your journey'}
                </span>
                <ArrowRight className="w-5 h-5 text-gray-400" />
              </div>

              {/* Swipeable Button */}
              <motion.div
                ref={constraintsRef}
                className="absolute left-2 top-2 bottom-2 w-16 bg-primary rounded-xl flex items-center justify-center cursor-grab active:cursor-grabbing shadow-lg z-20"
                drag="x"
                dragConstraints={{ left: 0, right: 200 }}
                dragElastic={0.1}
                style={{ 
                  x,
                  scale,
                  opacity: isSwipeComplete ? 0.5 : opacity
                }}
                onDragEnd={handleDragEnd}
                whileDrag={{ 
                  boxShadow: "0 10px 30px rgba(0,0,0,0.3)",
                  cursor: "grabbing"
                }}
              >
                <motion.div
                  animate={{ 
                    rotate: isSwipeComplete ? 360 : 0,
                    scale: isSwipeComplete ? 0.8 : 1
                  }}
                  transition={{ duration: 0.5 }}
                >
                  <ArrowRight className="w-6 h-6 text-white" />
                </motion.div>
              </motion.div>

              {/* Success Animation */}
              {isSwipeComplete && (
                <motion.div
                  className="absolute inset-0 bg-gradient-to-r from-green-500 to-emerald-600 rounded-xl flex items-center justify-center z-30"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.3 }}
                >
                  <div className="text-white font-semibold flex items-center gap-2">
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: 0.2, duration: 0.3 }}
                    >
                      <CheckCircle className="w-6 h-6" />
                    </motion.div>
                    <span>Success!</span>
                  </div>
                </motion.div>
              )}
            </div>

            {/* Helper Text */}
            <p className="text-sm text-gray-500 mt-4">
              Book your next trip with confidence
            </p>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default AboutSection;