import Link from 'next/link';
import Image from 'next/image';
import { Facebook, Twitter, Instagram, Phone, Mail, MapPin, Clock } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-gray-900 text-white">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Company Info */}
          <div className="space-y-4">
            <div className="flex items-center space-x-3">
              <h1 className="text-xl font-bold">Vijitha Travels</h1>
            </div>
            <p className="text-gray-300 text-sm leading-relaxed">
              Sri Lanka's most trusted bus service provider, connecting cities and towns 
              with comfortable, safe, and reliable transportation since 1995.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="text-gray-400 hover:text-blue-400 transition-colors">
                <Facebook className="w-5 h-5" />
              </a>
              <a href="#" className="text-gray-400 hover:text-blue-400 transition-colors">
                <Twitter className="w-5 h-5" />
              </a>
              <a href="#" className="text-gray-400 hover:text-blue-400 transition-colors">
                <Instagram className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <h4 className="text-lg font-semibold">Quick Links</h4>
            <ul className="space-y-2 text-sm">
              <li><Link href="/" className="text-gray-300 hover:text-white transition-colors">Home</Link></li>
              <li><Link href="/about" className="text-gray-300 hover:text-white transition-colors">About Us</Link></li>
              <li><Link href="/routes" className="text-gray-300 hover:text-white transition-colors">Routes</Link></li>
              <li><Link href="/services" className="text-gray-300 hover:text-white transition-colors">Services</Link></li>
              <li><Link href="/booking" className="text-gray-300 hover:text-white transition-colors">Book Now</Link></li>
              <li><Link href="/contact" className="text-gray-300 hover:text-white transition-colors">Contact</Link></li>
            </ul>
          </div>

          {/* Popular Routes */}
          <div className="space-y-4">
            <h4 className="text-lg font-semibold">Popular Routes</h4>
            <ul className="space-y-2 text-sm">
              <li><span className="text-gray-300">Colombo → Kandy</span></li>
              <li><span className="text-gray-300">Colombo → Galle</span></li>
              <li><span className="text-gray-300">Kandy → Nuwara Eliya</span></li>
              <li><span className="text-gray-300">Colombo → Jaffna</span></li>
              <li><span className="text-gray-300">Galle → Matara</span></li>
              <li><span className="text-gray-300">Colombo → Anuradhapura</span></li>
            </ul>
          </div>

          {/* Contact Info */}
          <div className="space-y-4">
            <h4 className="text-lg font-semibold">Contact Info</h4>
            <div className="space-y-3 text-sm">
              <div className="flex items-start space-x-3">
                <MapPin className="w-4 h-4 mt-1 text-blue-400" />
                <span className="text-gray-300">
                  123 Main Street, Colombo 07, Sri Lanka
                </span>
              </div>
              <div className="flex items-center space-x-3">
                <Phone className="w-4 h-4 text-blue-400" />
                <span className="text-gray-300">+94 11 234 5678</span>
              </div>
              <div className="flex items-center space-x-3">
                <Mail className="w-4 h-4 text-blue-400" />
                <span className="text-gray-300">info@vijithatravels.lk</span>
              </div>
              <div className="flex items-start space-x-3">
                <Clock className="w-4 h-4 mt-1 text-blue-400" />
                <div className="text-gray-300">
                  <p>Mon - Sat: 6:00 AM - 10:00 PM</p>
                  <p>Sunday: 7:00 AM - 9:00 PM</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-gray-800 mt-8 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-gray-400 text-sm">
              © 2025 Vijitha Travels. All rights reserved.
            </p>
            <div className="flex space-x-6 mt-4 md:mt-0">
              <Link href="/privacy" className="text-gray-400 hover:text-white text-sm transition-colors">
                Privacy Policy
              </Link>
              <Link href="/terms" className="text-gray-400 hover:text-white text-sm transition-colors">
                Terms of Service
              </Link>
              <Link href="/refund" className="text-gray-400 hover:text-white text-sm transition-colors">
                Refund Policy
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;