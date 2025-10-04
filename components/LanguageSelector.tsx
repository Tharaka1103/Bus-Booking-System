// components/LanguageSelector.tsx
'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Language, useLanguage } from '@/contexts/LanguageContext';
import { Globe, Check } from 'lucide-react';
import { Preloader } from './Preloader';

interface LanguageSelectorProps {
  onLanguageSelected: () => void;
}

export default function LanguageSelector({ onLanguageSelected }: LanguageSelectorProps) {
  const { setLanguage } = useLanguage();
  const [selectedLang, setSelectedLang] = useState<Language | null>(null);
  const [isAnimating, setIsAnimating] = useState(false);

  const languages = [
    {
      code: 'en' as Language,
      name: 'English',
      nativeName: 'English',
      flag: '🇬🇧',
      description: 'Continue in English',
    },
    {
      code: 'si' as Language,
      name: 'Sinhala',
      nativeName: 'සිංහල',
      flag: '🇱🇰',
      description: 'සිංහලෙන් දිගටම කරගෙන යන්න',
    },
  ];

  const handleLanguageSelect = (lang: Language) => {
    setSelectedLang(lang);
    setIsAnimating(true);

    setTimeout(() => {
      setLanguage(lang);
      onLanguageSelected();
    }, 800);
  };

  return (
    <div className="fixed inset-0 z-[100] bg-white flex items-center justify-center p-4 md:overflow-hidden overflow-y-auto">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <motion.div
          className="absolute top-20 left-10 w-72 h-72 bg-sky-200 rounded-full mix-blend-multiply filter blur-xl opacity-30"
          animate={{
            x: [0, 100, 0],
            y: [0, 50, 0],
          }}
          transition={{
            duration: 10,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
        <motion.div
          className="absolute top-40 right-10 w-72 h-72 bg-blue-200 rounded-full mix-blend-multiply filter blur-xl opacity-30"
          animate={{
            x: [0, -100, 0],
            y: [0, 100, 0],
          }}
          transition={{
            duration: 12,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
      </div>

      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="relative max-w-4xl w-full md:mt-0 mt-32"
      >
        {/* Header */}
        <div className="text-center mb-12">
          <motion.div
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-sky-400 to-blue-500 rounded-full mb-6 shadow-lg"
          >
            <Globe className="w-10 h-10 text-white" />
          </motion.div>

          <motion.h1
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="text-4xl md:text-5xl font-bold text-gray-800 mb-4"
          >
            Welcome • සාදරයෙන් පිළිගනිමු
          </motion.h1>

          <motion.p
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="text-lg md:text-xl text-gray-600"
          >
            Choose your preferred language • ඔබගේ භාෂාව තෝරන්න
          </motion.p>
        </div>

        {/* Language Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-3xl mx-auto">
          {languages.map((lang, index) => (
            <motion.button
              key={lang.code}
              initial={{ y: 50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.5 + index * 0.1 }}
              onClick={() => handleLanguageSelect(lang.code)}
              disabled={isAnimating}
              className={`
                relative group overflow-hidden rounded-2xl p-8 text-left
                transition-all duration-300 transform hover:scale-105
                ${selectedLang === lang.code
                  ? 'bg-gradient-to-br from-sky-500 to-blue-600 shadow-2xl scale-105'
                  : 'bg-white/80 backdrop-blur-sm shadow-xl hover:shadow-2xl border-2 border-gray-100'
                }
              `}
            >
              {/* Ripple Effect on Hover */}
              <div className="absolute inset-0 bg-gradient-to-r from-sky-400/0 via-sky-400/20 to-sky-400/0 transform -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />

              {/* Content */}
              <div className="relative z-10">
                {/* Flag and Check */}
                <div className="flex items-start justify-between mb-6">
                  <motion.span
                    className="text-6xl"
                    whileHover={{ scale: 1.2, rotate: 10 }}
                    transition={{ type: "spring", stiffness: 300 }}
                  >
                    {lang.flag}
                  </motion.span>

                  <AnimatePresence>
                    {selectedLang === lang.code && (
                      <motion.div
                        initial={{ scale: 0, rotate: -180 }}
                        animate={{ scale: 1, rotate: 0 }}
                        exit={{ scale: 0, rotate: 180 }}
                        className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-lg"
                      >
                        <Check className="w-6 h-6 text-sky-500" />
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* Language Name */}
                <h3
                  className={`text-3xl md:text-4xl font-bold mb-2 transition-colors ${
                    selectedLang === lang.code ? 'text-white' : 'text-gray-800'
                  }`}
                >
                  {lang.nativeName}
                </h3>

                <p
                  className={`text-lg transition-colors ${
                    selectedLang === lang.code ? 'text-white/90' : 'text-gray-600'
                  }`}
                >
                  {lang.description}
                </p>

                {/* Decorative Element */}
                <div
                  className={`mt-6 h-1 w-20 rounded-full transition-colors ${
                    selectedLang === lang.code ? 'bg-white' : 'bg-gradient-to-r from-sky-400 to-blue-500'
                  }`}
                />
              </div>

              {/* Animated Border */}
              {selectedLang !== lang.code && (
                <div className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity">
                  <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-sky-400 via-blue-500 to-sky-400 animate-pulse" style={{ padding: '2px' }}>
                    <div className="w-full h-full bg-white rounded-2xl" />
                  </div>
                </div>
              )}
            </motion.button>
          ))}
        </div>

        {/* Loading Animation */}
        <AnimatePresence>
          {isAnimating && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-white backdrop-blur-sm flex items-center justify-center rounded-3xl"
            >
                <Preloader/>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Footer Note */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="text-center text-sm text-gray-500 mt-8"
        >
          Your preference will be saved for 24 hours • ඔබගේ මනාපය පැය 24ක් සඳහා සුරකිනු ඇත
        </motion.p>
      </motion.div>
    </div>
  );
}