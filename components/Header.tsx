'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Menu, X, User, LogOut, UserCircle, MapPin, Phone } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userName, setUserName] = useState('');
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    // Check if user is logged in (replace with your auth logic)
    const user = localStorage.getItem('user');
    if (user) {
      setIsLoggedIn(true);
      setUserName(JSON.parse(user).name || 'User');
    }
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY;
      setIsScrolled(scrollPosition > 80);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('user');
    setIsLoggedIn(false);
    setUserName('');
    window.location.href = '/';
  };

  const navItems = [
    { name: 'Home', href: '/' },
    { name: 'Routes', href: '#routes' },
    { name: 'About', href: '#about' },
    { name: 'Services', href: '#services' },
    { name: 'Contact', href: '#contact' },
  ];

  return (
    <header className={`shadow-lg sticky top-0 z-50 transition-all duration-500 ease-in-out ${
      isScrolled ? 'shadow-xl backdrop-blur-lg' : 'shadow-lg'
    }`}>

      {/* Main header */}
      <div className={`container mx-auto px-4 transition-all duration-500 ease-in-out ${
        isScrolled ? 'py-2 md:py-3 bg-transparent backdrop-blur-lg text-white' : 'py-3 md:py-4 px-10 bg-white '
      }`}>
        <div className="flex justify-between items-center h-full">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-3 group">
            <div className="transition-all duration-300 ease-in-out">
              <h1 className={`font-bold text-primary transition-all duration-500 ease-in-out group-hover:text-blue-700 ${
                isScrolled ? 'text-xl' : 'text-2xl'
              }`}>
                Vijitha Travels
              </h1>
              <p className={`text-gray-600 transition-all duration-500 ease-in-out group-hover:text-gray-800 ${
                isScrolled ? 'text-xs opacity-80 hidden' : 'text-sm opacity-100'
              }`}>
                Your Journey, Our Priority
              </p>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center justify-center space-x-8">
            {navItems.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className={`font-medium transition-all duration-300 ease-in-out relative group ${
                  isScrolled 
                    ? 'text-black hover:text-primary text-lg' 
                    : 'text-black hover:text-primary text-md'
                }`}
              >
                {item.name}
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-primary transition-all duration-300 group-hover:w-full"></span>
              </Link>
            ))}
          </nav>

          {/* Auth Section */}
          <div className="hidden lg:flex items-center justify-end space-x-3">
            {isLoggedIn ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button 
                    variant="outline" 
                    className={`flex items-center space-x-2 transition-all duration-500 ease-in-out border-2 hover:border-blue-600 hover:bg-blue-50 ${
                      isScrolled 
                        ? 'h-9 px-3 text-sm shadow-md hover:shadow-lg' 
                        : 'h-10 px-4 text-base shadow-sm hover:shadow-md'
                    }`}
                  >
                    <UserCircle className={`transition-all duration-500 ease-in-out ${
                      isScrolled ? 'w-4 h-4' : 'w-5 h-5'
                    }`} />
                    <span className="font-medium">{userName}</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48 shadow-xl border-0 bg-white/95 backdrop-blur-sm">
                  <DropdownMenuItem className="hover:bg-blue-50 transition-colors duration-200">
                    <User className="w-4 h-4 mr-2 text-blue-600" />
                    <span className="font-medium">Profile</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem className="hover:bg-blue-50 transition-colors duration-200">
                    <MapPin className="w-4 h-4 mr-2 text-blue-600" />
                    <span className="font-medium">My Bookings</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem className="hover:bg-blue-50 transition-colors duration-200">
                    <Phone className="w-4 h-4 mr-2 text-blue-600" />
                    <span className="font-medium">Contact Us</span>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem 
                    onClick={handleLogout}
                    className="hover:bg-red-50 hover:text-red-600 transition-colors duration-200"
                  >
                    <LogOut className="w-4 h-4 mr-2" />
                    <span className="font-medium">Logout</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <div className="flex items-center space-x-3">
                <Link href="/login">
                  <Button 
                    variant="outline"
                    className={`transition-all duration-500 ease-in-out border-2 border-primary hover:border-blue-600 hover:bg-blue-50 bg-transparent font-medium rounded-full ${
                      isScrolled 
                        ? 'h-9 px-3 text-sm text-black shadow-md hover:shadow-lg' 
                        : 'h-10 px-4 text-base shadow-sm hover:shadow-md'
                    }`}
                  >
                    Login
                  </Button>
                </Link>
                <Link href="/register">
                  <Button 
                    className={` bg-primary hover:from-blue-700 hover:to-blue-800 text-white font-medium transition-all duration-500 ease-in-out rounded-full transform hover:scale-105 ${
                      isScrolled 
                        ? 'h-9 px-3 text-sm shadow-lg hover:shadow-xl' 
                        : 'h-10 px-4 text-base shadow-md hover:shadow-lg'
                    }`}
                  >
                    Register
                  </Button>
                </Link>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <button
            className={`lg:hidden p-2 rounded-lg transition-all duration-300 ease-in-out hover:bg-gray-100 ${
              isScrolled ? 'p-1.5' : 'p-2'
            }`}
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            <div className="relative">
              <Menu className={`transition-all duration-300 ease-in-out ${
                isMenuOpen ? 'opacity-0 rotate-45 scale-0' : 'opacity-100 rotate-0 scale-100'
              } ${isScrolled ? 'w-5 h-5' : 'w-6 h-6'}`} />
              <X className={`absolute top-0 left-0 transition-all duration-300 ease-in-out ${
                isMenuOpen ? 'opacity-100 rotate-0 scale-100' : 'opacity-0 -rotate-45 scale-0'
              } ${isScrolled ? 'w-5 h-5' : 'w-6 h-6'}`} />
            </div>
          </button>
        </div>

        {/* Mobile Navigation */}
        <div className={`lg:hidden overflow-hidden transition-all duration-500 ease-in-out ${
          isMenuOpen 
            ? 'max-h-[500px] opacity-100 mt-4 pb-4 border-t border-gray-200' 
            : 'max-h-0 opacity-0 mt-0 pb-0'
        }`}>
          <nav className="flex flex-col space-y-3 mt-4">
            {navItems.map((item, index) => (
              <Link
                key={item.name}
                href={item.href}
                className={`text-gray-700 hover:text-blue-600 font-medium transition-all duration-300 ease-in-out hover:bg-blue-50 px-3 py-2 rounded-lg transform ${
                  isMenuOpen 
                    ? 'translate-x-0 opacity-100' 
                    : '-translate-x-4 opacity-0'
                }`}
                style={{ 
                  transitionDelay: isMenuOpen ? `${index * 50}ms` : '0ms'
                }}
                onClick={() => setIsMenuOpen(false)}
              >
                {item.name}
              </Link>
            ))}
            
            <div className={`pt-4 border-t border-gray-200 transition-all duration-500 ease-in-out ${
              isMenuOpen ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'
            }`}>
              {isLoggedIn ? (
                <div className="space-y-3">
                  <p className="font-semibold text-gray-900 px-3">Welcome, {userName}</p>
                  <div className="flex flex-col space-y-2">
                    <Button 
                      variant="outline" 
                      size="sm"
                      className="justify-start hover:bg-blue-50 transition-all duration-200"
                    >
                      <User className="w-4 h-4 mr-2" />
                      Profile
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm"
                      className="justify-start hover:bg-blue-50 transition-all duration-200"
                    >
                      <MapPin className="w-4 h-4 mr-2" />
                      My Bookings
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm"
                      className="justify-start hover:bg-blue-50 transition-all duration-200"
                    >
                      <Phone className="w-4 h-4 mr-2" />
                      Contact Us
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={handleLogout}
                      className="justify-start hover:bg-red-50 hover:text-red-600 hover:border-red-200 transition-all duration-200"
                    >
                      <LogOut className="w-4 h-4 mr-2" />
                      Logout
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col space-y-2">
                  <Link href="/login" onClick={() => setIsMenuOpen(false)}>
                    <Button 
                      variant="outline" 
                      className="w-full justify-center hover:bg-blue-50 transition-all duration-200 font-medium"
                    >
                      Login
                    </Button>
                  </Link>
                  <Link href="/register" onClick={() => setIsMenuOpen(false)}>
                    <Button 
                      className="w-full justify-center bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 transition-all duration-200 font-medium"
                    >
                      Register
                    </Button>
                  </Link>
                </div>
              )}
            </div>
          </nav>
        </div>
      </div>
    </header>
  );
};

export default Header;