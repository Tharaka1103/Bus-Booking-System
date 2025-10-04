// contexts/LanguageContext.tsx
'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export type Language = 'en' | 'si';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

const STORAGE_KEY = 'preferred_language';
const EXPIRY_KEY = 'language_expiry';

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<Language>('en');
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    const storedLanguage = sessionStorage.getItem(STORAGE_KEY);
    const expiryTime = sessionStorage.getItem(EXPIRY_KEY);

    if (storedLanguage && expiryTime) {
      const now = new Date().getTime();
      const expiry = parseInt(expiryTime, 10);

      if (now < expiry) {
        setLanguageState(storedLanguage as Language);
      } else {
        sessionStorage.removeItem(STORAGE_KEY);
        sessionStorage.removeItem(EXPIRY_KEY);
      }
    }
    setIsInitialized(true);
  }, []);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    const expiryTime = new Date().getTime() + (24 * 60 * 60 * 1000);
    sessionStorage.setItem(STORAGE_KEY, lang);
    sessionStorage.setItem(EXPIRY_KEY, expiryTime.toString());
  };

  const t = (key: string): string => {
    const keys = key.split('.');
    let value: any = translations[language];

    for (const k of keys) {
      value = value?.[k];
    }

    return value || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}

export function hasStoredLanguage(): boolean {
  if (typeof window === 'undefined') return false;
  
  const storedLanguage = sessionStorage.getItem(STORAGE_KEY);
  const expiryTime = sessionStorage.getItem(EXPIRY_KEY);

  if (!storedLanguage || !expiryTime) return false;

  const now = new Date().getTime();
  const expiry = parseInt(expiryTime, 10);

  return now < expiry;
}

const translations = {
  en: {
    header: {
      home: 'Home',
      about: 'About',
      services: 'Services',
      routes: 'Routes',
      contact: 'Contact',
      bookNow: 'Book Now',
    },
    footer: {
      quickLinks: 'Quick Links',
      followUs: 'Follow Us',
      allRightsReserved: 'All rights reserved',
      privacyPolicy: 'Privacy Policy',
      terms: 'Terms & Conditions',
    },
    booking: {
      title: 'Book Your Ticket',
      selectRoute: 'Select Your Route',
      chooseJourney: 'Choose your journey from available routes',
      selectBus: 'Select Bus, Date & Details',
      selectSeats: 'Select Your Seats',
      passengerDetails: 'Passenger Details',
      travelDate: 'Travel Date',
      passengers: 'Number of Passengers',
      passenger: 'Passenger',
      passengers_plural: 'Passengers',
      pickupLocation: 'Pickup Location',
      selectPickup: 'Select pickup location',
      availableBuses: 'Available Buses',
      noBuses: 'No buses available on this route',
      seats: 'seats',
      seat: 'Seat',
      back: 'Back',
      continue: 'Continue',
      bookingConfirmed: 'Booking Confirmed!',
      bookingSuccess: 'Your booking has been successfully created. Please save your booking ID for future reference.',
      bookingId: 'Booking ID',
      backToHome: 'Back to Home',
      fullName: 'Full Name',
      enterFullName: 'Enter your full name',
      phoneNumber: 'Phone Number',
      enterPhone: '+94 71 234 5678',
      email: 'Email',
      enterEmail: 'your@email.com',
      optional: 'Optional',
      confirmBooking: 'Confirm Booking',
      processing: 'Processing...',
      route: 'Route',
      bus: 'Bus',
      date: 'Date',
      totalAmount: 'Total Amount',
      pricePerSeat: 'Price per seat',
      selectedSeats: 'Selected Seats',
      selectedBus: 'Selected Bus',
      available: 'Available',
      selected: 'Selected',
      booked: 'Booked',
      driver: 'Driver',
      selectionSummary: 'Selection Summary',
      bookingSummary: 'Booking Summary',
      bookingDetails: 'Booking Details',
      important: 'Important',
      arriveEarly: 'Please arrive 15 minutes before departure',
      carryId: 'Carry a valid ID for verification',
      saveBookingId: 'Save your booking ID for reference',
      continueToSeats: 'Continue to Seat Selection',
      continueToDetails: 'Continue to Details',
      selectMoreSeats: 'Select',
      moreSeats: 'more seat(s)',
      pickupPoints: 'Pickup Points',
      minutes: 'minutes',
      startingPoint: 'Starting Point',
      fillAllFields: 'Please fill all required fields',
      selectRouteFirst: 'Please select a route first',
      completeBusDetails: 'Please complete bus and travel details first',
      selectSeatsFirst: 'Please select your seats first',
      onlySelect: 'You can only select',
      failedFetchRoutes: 'Failed to fetch routes',
      failedFetchBuses: 'Failed to fetch buses',
      failedFetchSeats: 'Failed to fetch available seats',
      bookingCreated: 'Booking created successfully!',
      failedCreateBooking: 'Failed to create booking',
      goToStep: 'Go to step',
      completePrevious: 'Complete previous steps first',
      seatLayout: 'Seat Layout',
    },
    common: {
      welcome: 'Welcome',
      loading: 'Loading...',
      error: 'Error',
      success: 'Success',
      cancel: 'Cancel',
      confirm: 'Confirm',
      close: 'Close',
    },
    hero: {
      title: {
        line1: 'Your Journey',
        line2: 'Starts Here'
      },
      description: 'Experience comfortable, safe, and reliable bus travel across beautiful Sri Lanka.',
      bookButton: 'Book Your Journey',
      imageAlt: {
        mountains: 'Sri Lankan bus journey through mountains',
        interior: 'Comfortable bus interior',
        landscape: 'Beautiful Sri Lankan landscape',
        mountainsMobile: 'Sri Lankan bus journey - mobile view',
        interiorMobile: 'Comfortable bus interior - mobile view',
        landscapeMobile: 'Beautiful landscape - mobile view'
      }
    },
  },
  si: {
    header: {
      home: 'මුල් පිටුව',
      about: 'අප ගැන',
      services: 'සේවාවන්',
      routes: 'මාර්ග',
      contact: 'අප හා සම්බන්ධ වන්න',
      bookNow: 'වෙන්කරවා ගන්න',
    },
    footer: {
      quickLinks: 'ඉක්මන් සබැඳි',
      followUs: 'අපව අනුගමනය කරන්න',
      allRightsReserved: 'සියලුම හිමිකම් ඇවිරිණි',
      privacyPolicy: 'රහස්‍යතා ප්‍රතිපත්තිය',
      terms: 'නියම සහ කොන්දේසි',
    },
    booking: {
      title: 'ඔබගේ ටිකට්පත වෙන්කරවා ගන්න',
      selectRoute: 'ඔබගේ මාර්ගය තෝරන්න',
      chooseJourney: 'ලබා ගත හැකි මාර්ග වලින් ඔබගේ ගමන තෝරන්න',
      selectBus: 'දිනය සහ විස්තර තෝරන්න',
      selectSeats: 'ඔබගේ ආසන තෝරන්න',
      passengerDetails: 'මගී විස්තර',
      travelDate: 'ගමන් දිනය',
      passengers: 'මගීන් සංඛ්‍යාව',
      passenger: 'මගී',
      passengers_plural: 'මගීන්',
      pickupLocation: 'ආරම්භක ස්ථානය',
      selectPickup: 'ආරම්භක ස්ථානය තෝරන්න',
      availableBuses: 'බස් රථය තෝරාගන්න',
      noBuses: 'මෙම මාර්ගයේ බස් රථ නොමැත',
      seats: 'ආසන',
      seat: 'ආසනය',
      back: 'ආපසු',
      continue: 'ඉදිරියට',
      bookingConfirmed: 'වෙන්කිරීම තහවුරු කරන ලදී!',
      bookingSuccess: 'ඔබගේ වෙන්කිරීම සාර්ථකව නිර්මාණය කර ඇත. කරුණාකර අනාගත යොමු කිරීම් සඳහා ඔබගේ වෙන්කිරීම් හැඳුනුම්පත සුරකින්න.',
      bookingId: 'වෙන්කිරීම් හැඳුනුම්පත',
      backToHome: 'මුල් පිටුවට',
      fullName: 'සම්පූර්ණ නම',
      enterFullName: 'ඔබගේ සම්පූර්ණ නම ඇතුළත් කරන්න',
      phoneNumber: 'දුරකථන අංකය',
      enterPhone: '+94 71 234 5678',
      email: 'විද්‍යුත් තැපෑල',
      enterEmail: 'your@email.com',
      optional: 'අත්‍යාවශ්‍ය නොවේ',
      confirmBooking: 'වෙන්කිරීම තහවුරු කරන්න',
      processing: 'ක්‍රියාත්මක වෙමින්...',
      route: 'මාර්ගය',
      bus: 'බස්',
      date: 'දිනය',
      totalAmount: 'මුළු මුදල',
      pricePerSeat: 'එක් ආසනයකට මිල',
      selectedSeats: 'තෝරාගත් ආසන',
      selectedBus: 'තෝරාගත් බස්',
      available: 'ලබා ගත හැකි',
      selected: 'තෝරාගත්',
      booked: 'වෙන්කර ඇත',
      driver: 'රියදුරු',
      selectionSummary: 'තෝරාගැනීමේ සාරාංශය',
      bookingSummary: 'වෙන්කිරීමේ සාරාංශය',
      bookingDetails: 'වෙන්කිරීමේ විස්තර',
      important: 'වැදගත්',
      arriveEarly: 'කරුණාකර පිටත්වීමට මිනිත්තු 15කට පෙර පැමිණෙන්න',
      carryId: 'තහවුරු කිරීම සඳහා වලංගු හැඳුනුම්පතක් රැගෙන යන්න',
      saveBookingId: 'යොමු කිරීම සඳහා ඔබගේ වෙන්කිරීම් හැඳුනුම්පත සුරකින්න',
      continueToSeats: 'ආසන තෝරාගැනීමට',
      continueToDetails: 'විස්තර වෙත',
      selectMoreSeats: 'තෝරන්න',
      moreSeats: 'තවත් ආසන',
      pickupPoints: 'ආරම්භක ස්ථාන',
      minutes: 'මිනිත්තු',
      startingPoint: 'ආරම්භක ස්ථානය',
      fillAllFields: 'කරුණාකර අවශ්‍ය සියලුම ක්ෂේත්‍ර පුරවන්න',
      selectRouteFirst: 'කරුණාකර මුලින්ම මාර්ගයක් තෝරන්න',
      completeBusDetails: 'කරුණාකර මුලින්ම බස් සහ ගමන් විස්තර සම්පූර්ණ කරන්න',
      selectSeatsFirst: 'කරුණාකර මුලින්ම ඔබගේ ආසන තෝරන්න',
      onlySelect: 'ඔබට තෝරාගත හැක්කේ',
      failedFetchRoutes: 'මාර්ග ලබා ගැනීමට අසමත් විය',
      failedFetchBuses: 'බස් රථ ලබා ගැනීමට අසමත් විය',
      failedFetchSeats: 'ලබා ගත හැකි ආසන ලබා ගැනීමට අසමත් විය',
      bookingCreated: 'වෙන්කිරීම සාර්ථකව නිර්මාණය කරන ලදී!',
      failedCreateBooking: 'වෙන්කිරීම නිර්මාණය කිරීමට අසමත් විය',
      goToStep: 'පියවරට යන්න',
      completePrevious: 'කරුණාකර පෙර පියවර පළමුව සම්පූර්ණ කරන්න',
      seatLayout: 'ආසන සැලසුම',
    },
    common: {
      welcome: 'සාදරයෙන් පිළිගනිමු',
      loading: 'පූරණය වෙමින්...',
      error: 'දෝෂයකි',
      success: 'සාර්ථකයි',
      cancel: 'අවලංගු කරන්න',
      confirm: 'තහවුරු කරන්න',
      close: 'වසන්න',
    },
    hero: {
      title: {
        line1: 'ඔබේ ගමන',
        line2: 'මෙතැනින් ආරම්භ වේ'
      },
      description: 'ශ්‍රී ලංකාව පුරා සුවපහසු, ආරක්ෂිත සහ විශ්වාසදායක බස් ගමන අත්දැකීම ලබා ගන්න.',
      bookButton: 'ඔබගේ ගමන වෙන්කරවා ගන්න',
      imageAlt: {
        mountains: 'කඳු හරහා ශ්‍රී ලංකික බස් ගමන',
        interior: 'සුවපහසු බස් අභ්‍යන්තරය',
        landscape: 'ලස්සන ශ්‍රී ලංකික භූ දර්ශනය',
        mountainsMobile: 'කඳු හරහා ශ්‍රී ලංකික බස් ගමන - ජංගම දර්ශනය',
        interiorMobile: 'සුවපහසු බස් අභ්‍යන්තරය - ජංගම දර්ශනය',
        landscapeMobile: 'ලස්සන භූ දර්ශනය - ජංගම දර්ශනය'
      }
    },
  },
};