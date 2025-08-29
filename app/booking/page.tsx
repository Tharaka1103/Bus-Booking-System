'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  Calendar, 
  MapPin, 
  Users, 
  ArrowLeftRight, 
  Bus, 
  Clock, 
  Star,
  Wifi,
  Coffee,
  Snowflake,
  Shield,
  CreditCard,
  User,
  Phone,
  Mail,
  ChevronDown,
  Check,
  ArrowLeft
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface BusRoute {
  id: string;
  from: string;
  to: string;
  duration: string;
  price: number;
  departure: string;
  arrival: string;
  busType: string;
  amenities: string[];
  rating: number;
  seats: number;
}

interface BookingData {
  from: string;
  to: string;
  date: string;
  passengers: number;
  selectedBus?: BusRoute;
  selectedSeats: string[];
  passengerDetails: Array<{
    name: string;
    age: string;
    gender: string;
    phone: string;
    email: string;
  }>;
}

const BookingPage = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [bookingData, setBookingData] = useState<BookingData>({
    from: '',
    to: '',
    date: '',
    passengers: 1,
    selectedSeats: [],
    passengerDetails: []
  });

  // Available cities
  const cities = [
    'Colombo', 
    'Kaduruwela', 
    'Trincomalee', 
    'Kandy', 
    'Galle', 
    'Negombo', 
    'Anuradhapura',
    'Batticaloa',
    'Jaffna',
    'Matara'
  ];

  // Available bus routes
  const availableRoutes: BusRoute[] = [
    {
      id: '1',
      from: 'Colombo',
      to: 'Kaduruwela',
      duration: '4h 30m',
      price: 2500,
      departure: '06:00 AM',
      arrival: '10:30 AM',
      busType: 'AC Luxury',
      amenities: ['WiFi', 'AC', 'Refreshments', 'Insurance'],
      rating: 4.8,
      seats: 45
    },
    {
      id: '2',
      from: 'Colombo',
      to: 'Trincomalee',
      duration: '7h 00m',
      price: 2400,
      departure: '11:00 PM',
      arrival: '06:00 AM',
      busType: 'AC Luxury',
      amenities: ['AC', 'Insurance', 'Pillow & Blanket'],
      rating: 4.6,
      seats: 32
    },
    {
      id: '3',
      from: 'Colombo',
      to: 'Trincomalee',
      duration: '7h 00m',
      price: 2400,
      departure: '11:00 PM',
      arrival: '06:00 AM',
      busType: 'AC Luxury',
      amenities: ['AC', 'Insurance', 'Pillow & Blanket'],
      rating: 4.6,
      seats: 32
    },
    {
      id: '4',
      from: 'Kaduruwela',
      to: 'Colombo',
      duration: '4h 30m',
      price: 2500,
      departure: '06:00 AM',
      arrival: '10:30 AM',
      busType: 'AC Luxury',
      amenities: ['WiFi', 'AC', 'Refreshments', 'Insurance'],
      rating: 4.8,
      seats: 45
    },
  ];

  const [availableBuses, setAvailableBuses] = useState<BusRoute[]>([]);
  const [fromDropdownOpen, setFromDropdownOpen] = useState(false);
  const [toDropdownOpen, setToDropdownOpen] = useState(false);

  // Search for available buses
  const searchBuses = () => {
    if (bookingData.from && bookingData.to && bookingData.date) {
      const routes = availableRoutes.filter(
        route => route.from === bookingData.from && route.to === bookingData.to
      );
      setAvailableBuses(routes);
      setCurrentStep(2);
    }
  };

  // Select bus
  const selectBus = (bus: BusRoute) => {
    setBookingData({ ...bookingData, selectedBus: bus });
    setCurrentStep(3);
  };

  // Generate seats
  const generateSeats = () => {
    const seats = [];
    const totalSeats = bookingData.selectedBus?.seats || 40;
    for (let i = 1; i <= totalSeats; i++) {
      seats.push(`${i}`);
    }
    return seats;
  };

  // Select seat
  const selectSeat = (seatNumber: string) => {
    const selectedSeats = [...bookingData.selectedSeats];
    if (selectedSeats.includes(seatNumber)) {
      const index = selectedSeats.indexOf(seatNumber);
      selectedSeats.splice(index, 1);
    } else if (selectedSeats.length < bookingData.passengers) {
      selectedSeats.push(seatNumber);
    }
    setBookingData({ ...bookingData, selectedSeats });
  };

  // Proceed to passenger details
  const proceedToPassengerDetails = () => {
    if (bookingData.selectedSeats.length === bookingData.passengers) {
      const passengerDetails = Array(bookingData.passengers).fill(null).map(() => ({
        name: '',
        age: '',
        gender: '',
        phone: '',
        email: ''
      }));
      setBookingData({ ...bookingData, passengerDetails });
      setCurrentStep(4);
    }
  };

  // Update passenger details
  const updatePassengerDetails = (index: number, field: string, value: string) => {
    const details = [...bookingData.passengerDetails];
    details[index] = { ...details[index], [field]: value };
    setBookingData({ ...bookingData, passengerDetails: details });
  };

  // Animation variants
  const pageVariants = {
    initial: { opacity: 0, x: 50 },
    in: { opacity: 1, x: 0 },
    out: { opacity: 0, x: -50 }
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md border-b  top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl md:text-3xl font-bold text-primary">
              Vijitha Travels. Book your seat
            </h1>
            <div className="flex items-center space-x-2">
              {[1, 2, 3, 4, 5].map((step) => (
                <div
                  key={step}
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium
                    ${currentStep >= step 
                      ? 'bg-primary text-white' 
                      : 'bg-gray-200 text-gray-500'
                    }`}
                >
                  {currentStep > step ? <Check className="w-4 h-4" /> : step}
                </div>
              ))}
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <AnimatePresence mode="wait">
          {/* Step 1: Search Form */}
          {currentStep === 1 && (
            <motion.div
              key="step1"
              variants={pageVariants}
              initial="initial"
              animate="in"
              exit="out"
              transition={{ duration: 0.4 }}
            >
              <Card className="max-w-4xl mx-auto shadow-2xl border-0 bg-sidebar backdrop-blur-sm">
                <CardHeader className="text-center pb-8">
                  <CardTitle className="text-3xl md:text-4xl font-bold text-primary mb-2">
                    Find Your Perfect Journey
                  </CardTitle>
                  <p className="text-gray-600 text-lg">
                    Book comfortable and reliable bus tickets across Sri Lanka
                  </p>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {/* From Dropdown */}
                    <div className="relative">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        From
                      </label>
                      <div className="relative">
                        <MapPin className="absolute left-3 top-3 w-5 h-5 text-gray-400 z-10" />
                        <button
                          onClick={() => setFromDropdownOpen(!fromDropdownOpen)}
                          className="w-full h-12 pl-10 pr-10 bg-sidebar border border-primary rounded-lg 
                                   focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary
                                   text-left flex items-center justify-between"
                        >
                          <span className={bookingData.from ? 'text-gray-900' : 'text-gray-500'}>
                            {bookingData.from || 'Select city'}
                          </span>
                          <ChevronDown className="w-4 h-4" />
                        </button>
                        {fromDropdownOpen && (
                          <div className="absolute top-full left-0 right-0 mt-1 bg-sidebar border border-primary 
                                        rounded-lg shadow-lg z-20 max-h-60 overflow-y-auto">
                            {cities.map((city) => (
                              <button
                                key={city}
                                onClick={() => {
                                  setBookingData({ ...bookingData, from: city });
                                  setFromDropdownOpen(false);
                                }}
                                className="w-full px-4 py-3 text-left hover:bg-gray-50 transition-colors
                                         border-b border-gray-100 last:border-b-0"
                              >
                                {city}
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* To Dropdown */}
                    <div className="relative">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        To
                      </label>
                      <div className="relative">
                        <ArrowLeftRight className="absolute left-3 top-3 w-5 h-5 text-gray-400 z-10" />
                        <button
                          onClick={() => setToDropdownOpen(!toDropdownOpen)}
                          className="w-full h-12 pl-10 pr-10 bg-sidebar border border-primary rounded-lg 
                                   focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary
                                   text-left flex items-center justify-between"
                        >
                          <span className={bookingData.to ? 'text-gray-900' : 'text-gray-500'}>
                            {bookingData.to || 'Select city'}
                          </span>
                          <ChevronDown className="w-4 h-4" />
                        </button>
                        {toDropdownOpen && (
                          <div className="absolute top-full left-0 right-0 mt-1 bg-sidebar border border-primary 
                                        rounded-lg shadow-lg z-20 max-h-60 overflow-y-auto">
                            {cities.filter(city => city !== bookingData.from).map((city) => (
                              <button
                                key={city}
                                onClick={() => {
                                  setBookingData({ ...bookingData, to: city });
                                  setToDropdownOpen(false);
                                }}
                                className="w-full px-4 py-3 text-left hover:bg-gray-50 transition-colors
                                         border-b border-gray-100 last:border-b-0"
                              >
                                {city}
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Date */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Travel Date
                      </label>
                      <div className="relative">
                        <Calendar className="absolute left-3 top-3 w-5 h-5 text-gray-400 z-10" />
                        <Input
                          type="date"
                          value={bookingData.date}
                          min={new Date().toISOString().split('T')[0]}
                          onChange={(e) => setBookingData({ ...bookingData, date: e.target.value })}
                          className="pl-10 h-12 bg-sidebar border-primary focus:border-primary focus:ring-primary"
                        />
                      </div>
                    </div>

                    {/* Passengers */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Passengers
                      </label>
                      <div className="relative">
                        <Users className="absolute left-3 top-3 w-5 h-5 text-gray-400 z-10" />
                        <select
                          value={bookingData.passengers}
                          onChange={(e) => setBookingData({ ...bookingData, passengers: parseInt(e.target.value) })}
                          className="w-full h-12 pl-10 pr-4 bg-sidebar border border-primary rounded-lg 
                                   focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
                        >
                          {[1, 2, 3, 4, 5, 6].map(num => (
                            <option key={num} value={num}>
                              {num} Passenger{num > 1 ? 's' : ''}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                  </div>

                  <Button 
                    onClick={searchBuses}
                    disabled={!bookingData.from || !bookingData.to || !bookingData.date}
                    className="w-full h-14 bg-primary hover:bg-primary/90 text-white rounded-xl text-lg 
                             font-semibold transition-all duration-300 transform hover:scale-[1.02] 
                             shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Bus className="mr-2 w-5 h-5" />
                    Search Available Buses
                  </Button>

                  {/* Popular Routes */}
                  <div className="pt-6 border-t">
                    <p className="text-sm font-medium text-gray-600 mb-4">Popular Routes:</p>
                    <div className="flex flex-wrap gap-3">
                      {[
                        { from: 'Colombo', to: 'Kaduruwela' },
                        { from: 'Colombo', to: 'Trincomalee' }
                      ].map((route, index) => (
                        <button
                          key={index}
                          onClick={() => setBookingData({ 
                            ...bookingData, 
                            from: route.from, 
                            to: route.to 
                          })}
                          className="px-4 py-2 bg-gradient-to-r from-blue-50 to-indigo-50 
                                   hover:from-blue-100 hover:to-indigo-100 border border-blue-200 
                                   rounded-full text-sm font-medium transition-all duration-300 
                                   transform hover:scale-105 text-blue-700"
                        >
                          {route.from} → {route.to}
                        </button>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* Step 2: Available Buses */}
          {currentStep === 2 && (
            <motion.div
              key="step2"
              variants={pageVariants}
              initial="initial"
              animate="in"
              exit="out"
              transition={{ duration: 0.4 }}
            >
              <div className="max-w-6xl mx-auto">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h2 className="text-2xl md:text-3xl font-bold text-primary">
                      Available Buses
                    </h2>
                    <p className="text-gray-600">
                      {bookingData.from} → {bookingData.to} on {bookingData.date}
                    </p>
                  </div>
                  <Button
                    variant="outline"
                    onClick={() => setCurrentStep(1)}
                    className="flex items-center gap-2"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    Back to Search
                  </Button>
                </div>

                <div className="space-y-4">
                  {availableBuses.map((bus, index) => (
                    <motion.div
                      key={bus.id}
                      variants={cardVariants}
                      initial="hidden"
                      animate="visible"
                      transition={{ delay: index * 0.1 }}
                    >
                      <Card className="p-6 hover:shadow-lg transition-all duration-300 border-l-4 border-l-primary">
                        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-center">
                          <div className="lg:col-span-2">
                            <div className="flex items-center justify-between mb-4">
                              <h3 className="text-xl font-bold text-gray-900">{bus.busType}</h3>
                              <div className="flex items-center gap-1">
                                <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                                <span className="text-sm font-medium">{bus.rating}</span>
                              </div>
                            </div>
                            
                            <div className="grid grid-cols-2 gap-4 mb-4">
                              <div>
                                <p className="text-sm text-gray-500">Departure</p>
                                <p className="font-semibold text-lg">{bus.departure}</p>
                              </div>
                              <div>
                                <p className="text-sm text-gray-500">Arrival</p>
                                <p className="font-semibold text-lg">{bus.arrival}</p>
                              </div>
                            </div>

                            <div className="flex items-center gap-4 mb-4">
                              <div className="flex items-center gap-1">
                                <Clock className="w-4 h-4 text-gray-400" />
                                <span className="text-sm text-gray-600">{bus.duration}</span>
                              </div>
                              <div className="flex items-center gap-1">
                                <Users className="w-4 h-4 text-gray-400" />
                                <span className="text-sm text-gray-600">{bus.seats} seats</span>
                              </div>
                            </div>

                            <div className="flex flex-wrap gap-2">
                              {bus.amenities.map((amenity) => (
                                <span
                                  key={amenity}
                                  className="px-2 py-1 bg-blue-50 text-blue-700 text-xs rounded-full
                                           flex items-center gap-1"
                                >
                                  {amenity === 'WiFi' && <Wifi className="w-3 h-3" />}
                                  {amenity === 'AC' && <Snowflake className="w-3 h-3" />}
                                  {amenity === 'Refreshments' && <Coffee className="w-3 h-3" />}
                                  {amenity === 'Insurance' && <Shield className="w-3 h-3" />}
                                  {amenity}
                                </span>
                              ))}
                            </div>
                          </div>

                          <div className="text-center lg:text-right">
                            <p className="text-3xl font-bold text-primary mb-2">
                              LKR {bus.price.toLocaleString()}
                            </p>
                            <p className="text-sm text-gray-500 mb-4">per person</p>
                            <Button
                              onClick={() => selectBus(bus)}
                              className="w-full bg-primary hover:bg-primary/90 text-white"
                            >
                              Select This Bus
                            </Button>
                          </div>
                        </div>
                      </Card>
                    </motion.div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}

          {/* Step 3: Seat Selection */}
          {currentStep === 3 && bookingData.selectedBus && (
  <motion.div
    key="step3"
    variants={pageVariants}
    initial="initial"
    animate="in"
    exit="out"
    transition={{ duration: 0.4 }}
  >
    <div className="max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl md:text-3xl font-bold text-primary">
            Select Your Seats
          </h2>
          <p className="text-gray-600">
            Choose {bookingData.passengers} seat{bookingData.passengers > 1 ? 's' : ''} 
            for {bookingData.selectedBus.busType}
          </p>
        </div>
        <Button
          variant="outline"
          onClick={() => setCurrentStep(2)}
          className="flex items-center gap-2"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Buses
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Bus Layout */}
        <div className="lg:col-span-2">
          <Card className="p-4 md:p-6 bg-gradient-to-b from-blue-50 to-white">
            <div className="bg-white rounded-2xl p-4 md:p-6 shadow-inner">
              {/* Bus Front Section */}
              <div className="mb-6">
                <div className="flex items-center justify-between mb-4 px-20">
                  <div className="flex items-center gap-4">
                    
                    <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white px-3 py-2 md:px-4 md:py-2 rounded-lg shadow-lg">
                      <span className="text-xs md:text-sm font-medium">🚪 Entrance</span>
                    </div>
                  </div>
                  <div className="text-xs md:text-sm text-gray-500 font-medium">
                    Front of Bus
                  </div>
                  <div className="bg-gradient-to-r from-gray-700 to-gray-900 text-white px-3 py-2 md:px-4 md:py-2 rounded-lg shadow-lg">
                      <span className="text-xs md:text-sm font-medium">🚗 Driver</span>
                    </div>
                </div>
                <div className="h-1 bg-gradient-to-r from-gray-300 via-gray-400 to-gray-300 rounded-full mb-6"></div>
              </div>

              {/* Seat Layout */}
              <div className="space-y-3 md:space-y-4">
                {/* Regular Rows (1-11) - 2+2 Configuration */}
                {Array.from({ length: 11 }, (_, rowIndex) => {
                  const rowNumber = rowIndex + 1;
                  const leftSeats = [
                    (rowNumber - 1) * 4 + 1,
                    (rowNumber - 1) * 4 + 2
                  ];
                  const rightSeats = [
                    (rowNumber - 1) * 4 + 3,
                    (rowNumber - 1) * 4 + 4
                  ];

                  return (
                    <div key={rowNumber} className="flex items-center justify-between">
                      {/* Row Number */}
                      <div className="w-6 md:w-8 text-center">
                        <span className="text-xs md:text-sm font-medium text-gray-500">
                          {rowNumber}
                        </span>
                      </div>

                      {/* Left Side Seats */}
                      <div className="flex gap-1 md:gap-2">
                        {leftSeats.map((seatNumber) => {
                          const isSelected = bookingData.selectedSeats.includes(seatNumber.toString());
                          const isBooked = [5, 12, 18, 23, 31, 37, 42].includes(seatNumber); // Simulate some booked seats
                          
                          return (
                            <motion.button
                              key={seatNumber}
                              onClick={() => !isBooked && selectSeat(seatNumber.toString())}
                              disabled={isBooked}
                              whileHover={!isBooked ? { scale: 1.05 } : {}}
                              whileTap={!isBooked ? { scale: 0.95 } : {}}
                              className={`
                                w-8 h-10 md:w-10 md:h-12 rounded-lg border-2 font-medium text-xs md:text-sm
                                transition-all duration-200 shadow-sm
                                ${isSelected 
                                  ? 'bg-gradient-to-br from-primary to-primary/80 text-white border-primary shadow-lg transform scale-105' 
                                  : isBooked 
                                    ? 'bg-gradient-to-br from-red-200 to-red-300 text-red-600 border-red-300 cursor-not-allowed opacity-60'
                                    : 'bg-gradient-to-br from-green-50 to-green-100 border-green-200 hover:border-primary hover:from-blue-50 hover:to-blue-100 text-gray-700'
                                }
                              `}
                            >
                              {seatNumber}
                            </motion.button>
                          );
                        })}
                      </div>

                      {/* Aisle */}
                      <div className="w-8 md:w-12 flex justify-center">
                        <div className="w-0.5 h-8 md:h-10 bg-gradient-to-b from-gray-200 to-gray-300 rounded-full"></div>
                      </div>

                      {/* Right Side Seats */}
                      <div className="flex gap-1 md:gap-2">
                        {rightSeats.map((seatNumber) => {
                          const isSelected = bookingData.selectedSeats.includes(seatNumber.toString());
                          const isBooked = [7, 14, 20, 28, 35, 39, 44].includes(seatNumber); // Simulate some booked seats
                          
                          return (
                            <motion.button
                              key={seatNumber}
                              onClick={() => !isBooked && selectSeat(seatNumber.toString())}
                              disabled={isBooked}
                              whileHover={!isBooked ? { scale: 1.05 } : {}}
                              whileTap={!isBooked ? { scale: 0.95 } : {}}
                              className={`
                                w-8 h-10 md:w-10 md:h-12 rounded-lg border-2 font-medium text-xs md:text-sm
                                transition-all duration-200 shadow-sm
                                ${isSelected 
                                  ? 'bg-gradient-to-br from-primary to-primary/80 text-white border-primary shadow-lg transform scale-105' 
                                  : isBooked 
                                    ? 'bg-gradient-to-br from-red-200 to-red-300 text-red-600 border-red-300 cursor-not-allowed opacity-60'
                                    : 'bg-gradient-to-br from-green-50 to-green-100 border-green-200 hover:border-primary hover:from-blue-50 hover:to-blue-100 text-gray-700'
                                }
                              `}
                            >
                              {seatNumber}
                            </motion.button>
                          );
                        })}
                      </div>

                      {/* Row Number (Right) */}
                      <div className="w-6 md:w-8 text-center">
                        <span className="text-xs md:text-sm font-medium text-gray-500">
                          {rowNumber}
                        </span>
                      </div>
                    </div>
                  );
                })}

                {/* Back Row (Row 12) - 5 Seats Configuration */}
                <div className="pt-4 border-t border-gray-200">
                  <div className="flex items-center justify-center">
                    <div className="flex gap-1 md:gap-2">
                      {[45, 46, 47, 48, 49].map((seatNumber) => {
                        const isSelected = bookingData.selectedSeats.includes(seatNumber.toString());
                        const isBooked = [47].includes(seatNumber); // Simulate one booked seat in back row
                        
                        return (
                          <motion.button
                            key={seatNumber}
                            onClick={() => !isBooked && selectSeat(seatNumber.toString())}
                            disabled={isBooked}
                            whileHover={!isBooked ? { scale: 1.05 } : {}}
                            whileTap={!isBooked ? { scale: 0.95 } : {}}
                            className={`
                              w-8 h-10 md:w-10 md:h-12 rounded-lg border-2 font-medium text-xs md:text-sm
                              transition-all duration-200 shadow-sm
                              ${isSelected 
                                ? 'bg-gradient-to-br from-primary to-primary/80 text-white border-primary shadow-lg transform scale-105' 
                                : isBooked 
                                  ? 'bg-gradient-to-br from-red-200 to-red-300 text-red-600 border-red-300 cursor-not-allowed opacity-60'
                                  : 'bg-gradient-to-br from-green-50 to-green-100 border-green-200 hover:border-primary hover:from-blue-50 hover:to-blue-100 text-gray-700'
                              }
                            `}
                          >
                            {seatNumber}
                          </motion.button>
                        );
                      })}
                    </div>
                  </div>
                  <div className="text-center mt-2">
                    <span className="text-xs md:text-sm font-medium text-gray-500">Back Row</span>
                  </div>
                </div>
              </div>

              {/* Bus Rear */}
              <div className="mt-6">
                <div className="h-1 bg-gradient-to-r from-gray-300 via-gray-400 to-gray-300 rounded-full mb-4"></div>
                <div className="text-center">
                  <span className="text-xs md:text-sm text-gray-500 font-medium">Rear of Bus</span>
                </div>
              </div>
            </div>

            {/* Legend */}
            <div className="mt-6 bg-white rounded-xl p-4 shadow-sm">
              <h4 className="font-semibold text-gray-800 mb-3 text-sm md:text-base">Seat Legend</h4>
              <div className="flex flex-wrap justify-center gap-4 md:gap-6 text-xs md:text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-4 h-5 md:w-5 md:h-6 bg-gradient-to-br from-green-50 to-green-100 border-2 border-green-200 rounded"></div>
                  <span className="text-gray-700">Available</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-5 md:w-5 md:h-6 bg-gradient-to-br from-primary to-primary/80 border-2 border-primary rounded"></div>
                  <span className="text-gray-700">Selected</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-5 md:w-5 md:h-6 bg-gradient-to-br from-red-200 to-red-300 border-2 border-red-300 rounded opacity-60"></div>
                  <span className="text-gray-700">Booked</span>
                </div>
              </div>
            </div>
          </Card>
        </div>

        {/* Booking Summary Sidebar */}
        <div className="lg:col-span-1">
          <Card className="p-4 md:p-6 sticky top-4">
            <h3 className="text-lg md:text-xl font-bold text-primary mb-4">
              Booking Summary
            </h3>
            
            <div className="space-y-4">
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-4 rounded-lg">
                <div className="text-sm text-gray-600 mb-1">Route</div>
                <div className="font-semibold text-gray-900">
                  {bookingData.from} → {bookingData.to}
                </div>
              </div>

              <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-4 rounded-lg">
                <div className="text-sm text-gray-600 mb-1">Bus Type</div>
                <div className="font-semibold text-gray-900">
                  {bookingData.selectedBus.busType}
                </div>
              </div>

              <div className="bg-gradient-to-r from-purple-50 to-pink-50 p-4 rounded-lg">
                <div className="text-sm text-gray-600 mb-1">Travel Date</div>
                <div className="font-semibold text-gray-900">{bookingData.date}</div>
              </div>

              <div className="bg-gradient-to-r from-orange-50 to-yellow-50 p-4 rounded-lg">
                <div className="text-sm text-gray-600 mb-1">Departure Time</div>
                <div className="font-semibold text-gray-900">
                  {bookingData.selectedBus.departure}
                </div>
              </div>

              <div className="border-t pt-4">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm text-gray-600">Selected Seats:</span>
                  <span className="font-medium text-gray-900">
                    {bookingData.selectedSeats.length}/{bookingData.passengers}
                  </span>
                </div>
                <div className="flex flex-wrap gap-1 mb-4">
                  {bookingData.selectedSeats.map((seat) => (
                    <span
                      key={seat}
                      className="px-2 py-1 bg-primary text-white text-xs rounded-full"
                    >
                      {seat}
                    </span>
                  ))}
                </div>
              </div>

              <div className="border-t pt-4">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-gray-600">Price per seat</span>
                  <span className="font-medium">
                    LKR {bookingData.selectedBus.price.toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between items-center mb-4">
                  <span className="text-gray-600">
                    Total ({bookingData.selectedSeats.length} seat{bookingData.selectedSeats.length !== 1 ? 's' : ''})
                  </span>
                  <span className="text-xl font-bold text-primary">
                    LKR {(bookingData.selectedBus.price * bookingData.selectedSeats.length).toLocaleString()}
                  </span>
                </div>
              </div>

              <Button
                onClick={proceedToPassengerDetails}
                disabled={bookingData.selectedSeats.length !== bookingData.passengers}
                className="w-full h-12 bg-primary hover:bg-primary/90 text-white 
                         disabled:opacity-50 disabled:cursor-not-allowed
                         disabled:hover:bg-primary transition-all duration-300"
              >
                {bookingData.selectedSeats.length === bookingData.passengers
                  ? 'Continue to Passenger Details'
                  : `Select ${bookingData.passengers - bookingData.selectedSeats.length} more seat${bookingData.passengers - bookingData.selectedSeats.length !== 1 ? 's' : ''}`
                }
              </Button>

              {bookingData.selectedSeats.length !== bookingData.passengers && (
                <p className="text-center text-sm text-amber-600 bg-amber-50 p-2 rounded">
                  Please select {bookingData.passengers} seat{bookingData.passengers !== 1 ? 's' : ''} to continue
                </p>
              )}
            </div>
          </Card>
        </div>
      </div>
    </div>
  </motion.div>
)}

          {/* Step 4: Passenger Details */}
          {currentStep === 4 && (
            <motion.div
              key="step4"
              variants={pageVariants}
              initial="initial"
              animate="in"
              exit="out"
              transition={{ duration: 0.4 }}
            >
              <div className="max-w-4xl mx-auto">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h2 className="text-2xl md:text-3xl font-bold text-primary">
                      Passenger Details
                    </h2>
                    <p className="text-gray-600">
                      Please provide details for all passengers
                    </p>
                  </div>
                  <Button
                    variant="outline"
                    onClick={() => setCurrentStep(3)}
                    className="flex items-center gap-2"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    Back to Seats
                  </Button>
                </div>

                <div className="space-y-6">
                  {Array(bookingData.passengers).fill(null).map((_, index) => (
                    <Card key={index} className="p-6">
                      <h3 className="text-lg font-semibold mb-4 text-primary">
                        Passenger {index + 1} - Seat {bookingData.selectedSeats[index]}
                      </h3>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Full Name *
                          </label>
                          <div className="relative">
                            <User className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                            <Input
                              placeholder="Enter full name"
                              value={bookingData.passengerDetails[index]?.name || ''}
                              onChange={(e) => updatePassengerDetails(index, 'name', e.target.value)}
                              className="pl-10 h-12"
                            />
                          </div>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Age *
                          </label>
                          <Input
                            type="number"
                            placeholder="Age"
                            value={bookingData.passengerDetails[index]?.age || ''}
                            onChange={(e) => updatePassengerDetails(index, 'age', e.target.value)}
                            className="h-12"
                            min="1"
                            max="120"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Gender *
                          </label>
                          <select
                            value={bookingData.passengerDetails[index]?.gender || ''}
                            onChange={(e) => updatePassengerDetails(index, 'gender', e.target.value)}
                            className="w-full h-12 px-3 bg-sidebar border border-primary rounded-lg 
                                     focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
                          >
                            <option value="">Select Gender</option>
                            <option value="Male">Male</option>
                            <option value="Female">Female</option>
                            <option value="Other">Other</option>
                          </select>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Phone Number *
                          </label>
                          <div className="relative">
                            <Phone className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                            <Input
                              placeholder="+94 71 234 5678"
                              value={bookingData.passengerDetails[index]?.phone || ''}
                              onChange={(e) => updatePassengerDetails(index, 'phone', e.target.value)}
                              className="pl-10 h-12"
                            />
                          </div>
                        </div>
                      </div>
                    </Card>
                  ))}

                  <Button
                    onClick={() => setCurrentStep(5)}
                    className="w-full h-12 bg-primary hover:bg-primary/90 text-white"
                  >
                    Proceed to Payment
                  </Button>
                </div>
              </div>
            </motion.div>
          )}

          {/* Step 5: Payment */}
          {currentStep === 5 && bookingData.selectedBus && (
            <motion.div
              key="step5"
              variants={pageVariants}
              initial="initial"
              animate="in"
              exit="out"
              transition={{ duration: 0.4 }}
            >
              <div className="max-w-4xl mx-auto">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                  {/* Booking Summary */}
                  <div className="lg:col-span-2">
                    <Card className="p-6">
                      <h3 className="text-xl font-bold text-primary mb-6">Payment Details</h3>
                      
                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Card Number *
                          </label>
                          <div className="relative">
                            <CreditCard className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                            <Input
                              placeholder="1234 5678 9012 3456"
                              className="pl-10 h-12"
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Expiry Date *
                            </label>
                            <Input
                              placeholder="MM/YY"
                              className="h-12"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              CVV *
                            </label>
                            <Input
                              placeholder="123"
                              className="h-12"
                              maxLength={4}
                            />
                          </div>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Cardholder Name *
                          </label>
                          <Input
                            placeholder="Name on card"
                            className="h-12"
                          />
                        </div>
                      </div>

                      <Button className="w-full h-12 bg-primary hover:bg-primary/90 text-white mt-6">
                        Complete Payment
                      </Button>
                    </Card>
                  </div>

                  {/* Booking Summary */}
                  <div>
                    <Card className="p-6 sticky top-24">
                      <h3 className="text-xl font-bold text-primary mb-6">Booking Summary</h3>
                      
                      <div className="space-y-4 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-600">Route</span>
                          <span className="font-medium">{bookingData.from} → {bookingData.to}</span>
                        </div>
                        
                        <div className="flex justify-between">
                          <span className="text-gray-600">Date</span>
                          <span className="font-medium">{bookingData.date}</span>
                        </div>
                        
                        <div className="flex justify-between">
                          <span className="text-gray-600">Bus Type</span>
                          <span className="font-medium">{bookingData.selectedBus.busType}</span>
                        </div>
                        
                        <div className="flex justify-between">
                          <span className="text-gray-600">Departure</span>
                          <span className="font-medium">{bookingData.selectedBus.departure}</span>
                        </div>
                        
                        <div className="flex justify-between">
                          <span className="text-gray-600">Seats</span>
                          <span className="font-medium">{bookingData.selectedSeats.join(', ')}</span>
                        </div>
                        
                        <div className="flex justify-between">
                          <span className="text-gray-600">Passengers</span>
                          <span className="font-medium">{bookingData.passengers}</span>
                        </div>
                        
                        <hr className="my-4" />
                        
                        <div className="flex justify-between">
                          <span className="text-gray-600">Subtotal</span>
                          <span className="font-medium">
                            LKR {(bookingData.selectedBus.price * bookingData.passengers).toLocaleString()}
                          </span>
                        </div>
                        
                        <div className="flex justify-between">
                          <span className="text-gray-600">Service Fee</span>
                          <span className="font-medium">LKR 200</span>
                        </div>
                        
                        <hr className="my-4" />
                        
                        <div className="flex justify-between text-lg font-bold">
                          <span>Total</span>
                          <span className="text-primary">
                            LKR {(bookingData.selectedBus.price * bookingData.passengers + 200).toLocaleString()}
                          </span>
                        </div>
                      </div>
                    </Card>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default BookingPage;