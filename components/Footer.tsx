'use client';

import Link from 'next/link';
import { Facebook, Twitter, Instagram, Phone, Mail, MapPin, Clock, Heart, Send, ArrowRight } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

const Footer = () => {
  const footerRef = useRef(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.1 }
    );

    if (footerRef.current) {
      observer.observe(footerRef.current);
    }

    return () => {
      if (footerRef.current) {
        observer.unobserve(footerRef.current);
      }
    };
  }, []);

  return (
    <footer ref={footerRef} className="bg-gradient-to-b from-gray-50 to-white text-black relative overflow-hidden">

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Main Footer Content */}
        <div className="py-12">
          
          {/* Top Section - Brand */}
          <div className={`text-center mb-12 md:mb-16 transition-all duration-1000 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold bg-gradient-to-r from-primary via-primary to-accent bg-clip-text text-transparent mb-4 md:mb-6">
              Wijitha Travels
            </h2>
            <p className="text-base md:text-lg lg:text-xl text-gray-700 max-w-3xl mx-auto leading-relaxed px-4">
              Sri Lanka's most trusted bus service provider, connecting cities with comfort, safety, and reliability since 1995
            </p>
          </div>

          {/* Middle Section - Grid Layout */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12 mb-12 md:mb-16">
            
            {/* Quick Links */}
            <div className={`transition-all duration-1000 delay-100 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
              <h3 className="text-xl font-bold text-gray-900 mb-6 relative inline-block">
                Quick Links
                <span className="absolute -bottom-2 left-0 w-12 h-1 bg-gradient-to-r from-primary to-accent rounded-full"></span>
              </h3>
              <ul className="space-y-3">
                {['Home', 'About Us', 'Our Fleet', 'Book Now', 'Contact'].map((item, index) => (
                  <li key={index}>
                    <Link 
                      href={`/${item.toLowerCase().replace(' ', '-')}`}
                      className="text-gray-700 hover:text-primary transition-all duration-300 flex items-center group"
                    >
                      <ArrowRight className="w-4 h-4 mr-2 opacity-0 -ml-6 group-hover:opacity-100 group-hover:ml-0 transition-all duration-300" />
                      <span>{item}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Services */}
            <div className={`transition-all duration-1000 delay-200 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
              <h3 className="text-xl font-bold text-gray-900 mb-6 relative inline-block">
                Services
                <span className="absolute -bottom-2 left-0 w-12 h-1 bg-gradient-to-r from-primary to-accent rounded-full"></span>
              </h3>
              <ul className="space-y-3">
                {['City Routes', 'Express Services', 'Corporate Travel', 'School Transport', 'Special Tours'].map((item, index) => (
                  <li key={index}>
                    <Link 
                      href={`/services/${item.toLowerCase().replace(' ', '-')}`}
                      className="text-gray-700 hover:text-primary transition-all duration-300 flex items-center group"
                    >
                      <ArrowRight className="w-4 h-4 mr-2 opacity-0 -ml-6 group-hover:opacity-100 group-hover:ml-0 transition-all duration-300" />
                      <span>{item}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Contact Information */}
            <div className={`transition-all duration-1000 delay-300 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
              <h3 className="text-xl font-bold text-gray-900 mb-6 relative inline-block">
                Contact Us
                <span className="absolute -bottom-2 left-0 w-12 h-1 bg-gradient-to-r from-primary to-accent rounded-full"></span>
              </h3>
              <div className="space-y-4">
                <a href="tel:+94112345678" className="flex items-start space-x-3 group hover:translate-x-1 transition-transform duration-300">
                  <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center group-hover:bg-primary/20 transition-colors flex-shrink-0">
                    <Phone className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 uppercase tracking-wide">Phone</p>
                    <p className="text-gray-900 font-medium">+94 11 234 5678</p>
                  </div>
                </a>

                <a href="mailto:info@Wijithatravels.lk" className="flex items-start space-x-3 group hover:translate-x-1 transition-transform duration-300">
                  <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center group-hover:bg-primary/20 transition-colors flex-shrink-0">
                    <Mail className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 uppercase tracking-wide">Email</p>
                    <p className="text-gray-900 font-medium break-all">info@Wijithatravels.lk</p>
                  </div>
                </a>

                <div className="flex items-start space-x-3 group">
                  <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center group-hover:bg-primary/20 transition-colors flex-shrink-0">
                    <MapPin className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 uppercase tracking-wide">Address</p>
                    <p className="text-gray-900 font-medium">123 Main Street, Colombo 07</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Business Hours & Social */}
            <div className={`transition-all duration-1000 delay-[400ms] ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
              <h3 className="text-xl font-bold text-gray-900 mb-6 relative inline-block">
                Business Hours
                <span className="absolute -bottom-2 left-0 w-12 h-1 bg-gradient-to-r from-primary to-accent rounded-full"></span>
              </h3>
              <div className="flex items-start space-x-3 mb-6">
                <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Clock className="w-5 h-5 text-primary" />
                </div>
                <div className="text-gray-900">
                  <p className="font-medium">Mon - Sat</p>
                  <p className="text-sm text-gray-600">6:00 AM - 10:00 PM</p>
                  <p className="font-medium mt-2">Sunday</p>
                  <p className="text-sm text-gray-600">7:00 AM - 9:00 PM</p>
                </div>
              </div>

              {/* Social Media */}
              <div>
                <h4 className="text-sm font-semibold text-gray-700 mb-3 uppercase tracking-wide">Follow Us</h4>
                <div className="flex space-x-3">
                  <a 
                    href="#" 
                    aria-label="Facebook"
                    className="w-11 h-11 bg-gradient-to-br from-blue-600 to-blue-700 rounded-xl flex items-center justify-center hover:shadow-lg hover:shadow-blue-500/50 transition-all duration-300 transform hover:scale-110 hover:-rotate-6"
                  >
                    <Facebook className="w-5 h-5 text-white" />
                  </a>
                  <a 
                    href="#" 
                    aria-label="Twitter"
                    className="w-11 h-11 bg-gradient-to-br from-sky-400 to-sky-500 rounded-xl flex items-center justify-center hover:shadow-lg hover:shadow-sky-400/50 transition-all duration-300 transform hover:scale-110 hover:-rotate-6"
                  >
                    <Twitter className="w-5 h-5 text-white" />
                  </a>
                  <a 
                    href="#" 
                    aria-label="Instagram"
                    className="w-11 h-11 bg-gradient-to-br from-purple-600 via-pink-600 to-orange-500 rounded-xl flex items-center justify-center hover:shadow-lg hover:shadow-pink-500/50 transition-all duration-300 transform hover:scale-110 hover:-rotate-6"
                  >
                    <Instagram className="w-5 h-5 text-white" />
                  </a>
                </div>
              </div>
            </div>

          </div>
        </div>

        {/* Bottom Section */}
        <div className="">
          <div className={`flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0 transition-all duration-1000 delay-600 ${isVisible ? 'opacity-100' : 'opacity-0'}`}>
            
            {/* Copyright */}
            <p className="text-gray-600 text-sm md:text-base text-center md:text-left">
              © 2025 Wijitha Travels. All rights reserved.
            </p>

            {/* Links */}
            <div className="flex flex-wrap justify-center items-center gap-4 md:gap-6 text-sm md:text-base">
              <Link href="/privacy" className="text-gray-600 hover:text-primary transition-colors duration-300 relative group">
                Privacy Policy
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-primary group-hover:w-full transition-all duration-300"></span>
              </Link>
              <span className="text-gray-400">•</span>
              <Link href="/terms" className="text-gray-600 hover:text-primary transition-colors duration-300 relative group">
                Terms of Service
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-primary group-hover:w-full transition-all duration-300"></span>
              </Link>
              <span className="text-gray-400">•</span>
              <Link href="/refund" className="text-gray-600 hover:text-primary transition-colors duration-300 relative group">
                Refund Policy
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-primary group-hover:w-full transition-all duration-300"></span>
              </Link>
            </div>
          </div>

          {/* Developer Credit */}
          <div className={`m-6 pt-6 transition-all duration-1000 delay-700 ${isVisible ? 'opacity-100' : 'opacity-0'}`}>
            <p className="text-gray-600 text-sm flex items-center justify-center flex-wrap gap-2">
              <span>Crafted with</span>
              <Heart className="w-4 h-4 text-red-500 fill-current animate-pulse" />
              <span>by</span>
              <a 
                href="trimids.com" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-transparent bg-primary bg-clip-text font-bold hover:from-accent hover:to-primary transition-all duration-300"
              >
                Trimids (Pvt) Ltd
              </a>
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;