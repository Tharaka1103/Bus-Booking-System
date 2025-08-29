import Link from 'next/link';
import { Facebook, Twitter, Instagram, Phone, Mail, MapPin, Clock, Heart } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-gray-900 text-white relative overflow-hidden">
   

      <div className="container mx-auto px-4 py-16 relative z-10">
        {/* Main Footer Content */}
        <div className="text-center mb-12">
          {/* Logo and Company Name */}
          <div className="mb-8">
            <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent mb-4">
              Vijitha Travels
            </h1>
            <p className="text-xl text-gray-300 max-w-2xl mx-auto leading-relaxed">
              Sri Lanka's most trusted bus service provider, connecting cities with comfort, safety, and reliability since 1995
            </p>
          </div>

          {/* Main Footer Sections - Contact Info and Social Media in Same Row */}
          <div className="flex flex-col lg:flex-row justify-between items-center lg:items-start gap-12 max-w-6xl mx-auto">
            
            {/* Contact Info */}
            <div className="space-y-6 flex-1">
              <div className="space-y-4">
                <div className="flex flex-row items-center justify-center lg:justify-start space-x-3 group">
                  <div className="w-10 h-10 bg-primary/20 rounded-full flex items-center justify-center group-hover:bg-primary/30 transition-colors">
                    <MapPin className="w-5 h-5 text-primary" />
                  </div>
                  <span className="text-gray-300">123 Main Street, Colombo 07</span>
                </div>
                <div className="flex items-center justify-center lg:justify-start space-x-3 group">
                  <div className="w-10 h-10 bg-primary/20 rounded-full flex items-center justify-center group-hover:bg-primary/30 transition-colors">
                    <Phone className="w-5 h-5 text-primary" />
                  </div>
                  <span className="text-gray-300">+94 11 234 5678</span>
                </div>
                <div className="flex items-center justify-center lg:justify-start space-x-3 group">
                  <div className="w-10 h-10 bg-primary/20 rounded-full flex items-center justify-center group-hover:bg-primary/30 transition-colors">
                    <Mail className="w-5 h-5 text-primary" />
                  </div>
                  <span className="text-gray-300">info@vijithatravels.lk</span>
                </div>
                <div className="flex items-start justify-center lg:justify-start space-x-3 group">
                  <div className="w-10 h-10 bg-primary/20 rounded-full flex items-center justify-center group-hover:bg-primary/30 transition-colors mt-1">
                    <Clock className="w-5 h-5 text-primary" />
                  </div>
                  <div className="text-gray-300 text-left">
                    <p>Mon - Sat: 6:00 AM - 10:00 PM</p>
                    <p>Sunday: 7:00 AM - 9:00 PM</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Social Media */}
            <div className="space-y-6 flex-1 lg:flex-initial">
              <h4 className="text-2xl font-semibold text-white mb-6">Stay Connected</h4>
              
              {/* Social Media */}
              <div className="flex justify-center lg:justify-end space-x-4 mb-6">
                <a href="#" className="w-12 h-12 bg-gradient-to-r from-blue-600 to-blue-700 rounded-full flex items-center justify-center hover:from-blue-500 hover:to-blue-600 transition-all duration-300 transform hover:scale-110 hover:rotate-6">
                  <Facebook className="w-6 h-6" />
                </a>
                <a href="#" className="w-12 h-12 bg-sky-400 rounded-full flex items-center justify-center hover:from-cyan-400 hover:to-blue-400 transition-all duration-300 transform hover:scale-110 hover:rotate-6">
                  <Twitter className="w-6 h-6" />
                </a>
                <a href="#" className="w-12 h-12 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full flex items-center justify-center hover:from-purple-500 hover:to-pink-500 transition-all duration-300 transform hover:scale-110 hover:rotate-6">
                  <Instagram className="w-6 h-6" />
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-gray-700 my-8"></div>

        {/* Bottom Section */}
        <div className="text-center space-y-4">
          {/* Copyright and Links */}
          <div className="flex flex-col md:flex-row justify-center items-center space-y-4 md:space-y-0 md:space-x-8">
            <p className="text-gray-400">
              © 2025 Vijitha Travels. All rights reserved.
            </p>
            <div className="flex flex-wrap justify-center space-x-6">
              <Link href="/privacy" className="text-gray-400 hover:text-primary transition-colors">
                Privacy Policy
              </Link>
              <Link href="/terms" className="text-gray-400 hover:text-primary transition-colors">
                Terms of Service
              </Link>
              <Link href="/refund" className="text-gray-400 hover:text-primary transition-colors">
                Refund Policy
              </Link>
            </div>
          </div>

          {/* Developer Credit */}
          <div className="pt-4 border-t border-gray-800">
            <p className="text-gray-500 text-sm flex items-center justify-center space-x-2">
              <span>Crafted with</span>
              <Heart className="w-4 h-4 text-red-500 fill-current animate-pulse" />
              <span>by</span>
              <a 
                href="#" 
                className="text-primary hover:text-accent font-semibold transition-colors"
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