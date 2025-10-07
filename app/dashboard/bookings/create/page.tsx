'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Image from 'next/image';
import {
  Bus,
  MapPin,
  Clock,
  DollarSign,
  User,
  Phone,
  Mail,
  ChevronRight,
  ArrowLeft,
  CheckCircle,
  AlertCircle,
  Loader2,
  Users
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from 'sonner';
import { IRoute, IBus } from '@/types';
import { motion, AnimatePresence } from 'framer-motion';
import { useLanguage } from '@/contexts/LanguageContext';

interface BookingFormData {
  routeId: string;
  busId: string;
  passengerName: string;
  passengerPhone: string;
  passengerEmail: string;
  seatNumbers: number[];
  travelDate: string;
  passengers: number;
  pickupLocation: string;
}

export default function BookTicketPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { t } = useLanguage();
  const [currentStep, setCurrentStep] = useState(1);
  const [routes, setRoutes] = useState<IRoute[]>([]);
  const [buses, setBuses] = useState<IBus[]>([]);
  const [availableSeats, setAvailableSeats] = useState<number[]>([]);
  const [bookedSeats, setBookedSeats] = useState<number[]>([]);
  const [loading, setLoading] = useState(false);
  const [seatLoading, setSeatLoading] = useState(false);
  const [bookingSuccess, setBookingSuccess] = useState(false);
  const [bookingId, setBookingId] = useState('');

  const [formData, setFormData] = useState<BookingFormData>({
    routeId: '',
    busId: '',
    passengerName: '',
    passengerPhone: '',
    passengerEmail: '',
    seatNumbers: [],
    travelDate: '',
    passengers: 1,
    pickupLocation: ''
  });

  const [selectedRoute, setSelectedRoute] = useState<IRoute | null>(null);
  const [selectedBus, setSelectedBus] = useState<IBus | null>(null);

  // Helper Functions
  const isBusLocked = (bus: any, travelDate: string) => {
    if (!travelDate || !bus || !bus.departureTime) return false;

    try {
      const selectedDate = new Date(travelDate);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      selectedDate.setHours(0, 0, 0, 0);

      if (selectedDate.getTime() !== today.getTime()) {
        return false;
      }

      const now = new Date();
      const currentTime = now.getHours() * 60 + now.getMinutes();
      
      const [hours, minutes] = bus.departureTime.split(':').map(Number);
      
      if (isNaN(hours) || isNaN(minutes)) {
        return false;
      }
      
      const departureTimeInMinutes = hours * 60 + minutes;
      const timeDifference = departureTimeInMinutes - currentTime;

      return timeDifference < 30 && timeDifference >= 0;
    } catch (error) {
      console.error('Error checking bus lock status:', error);
      return false;
    }
  };

  const getTimeToDeparture = (bus: any, travelDate: string) => {
    if (!travelDate || !bus || !bus.departureTime) return null;

    try {
      const selectedDate = new Date(travelDate);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      selectedDate.setHours(0, 0, 0, 0);

      if (selectedDate.getTime() !== today.getTime()) {
        return null;
      }

      const now = new Date();
      const currentTime = now.getHours() * 60 + now.getMinutes();
      
      const [hours, minutes] = bus.departureTime.split(':').map(Number);
      
      if (isNaN(hours) || isNaN(minutes)) {
        return null;
      }
      
      const departureTimeInMinutes = hours * 60 + minutes;
      const timeDifference = departureTimeInMinutes - currentTime;

      if (timeDifference < 60 && timeDifference >= 0) {
        return `Departs in ${timeDifference} min`;
      }
      
      return null;
    } catch (error) {
      console.error('Error getting time to departure:', error);
      return null;
    }
  };

  const formatTime = (time?: string) => {
    if (!time) return 'Not set';
    
    try {
      const [hours, minutes] = time.split(':');
      const hour = parseInt(hours);
      
      if (isNaN(hour)) {
        return 'Not set';
      }
      
      const ampm = hour >= 12 ? 'PM' : 'AM';
      const displayHour = hour % 12 || 12;
      return `${displayHour}:${minutes} ${ampm}`;
    } catch (error) {
      console.error('Error formatting time:', error);
      return 'Not set';
    }
  };

  const getRouteCardBackground = (route: IRoute) => {
    const fromLocation = route.fromLocation.toLowerCase();
    const toLocation = route.toLocation.toLowerCase();

    if (fromLocation.includes('kaduruwela') || toLocation.includes('kaduruwela')) {
      return '/kaduruwela.webp';
    }

    if (fromLocation.includes('trincomalee') || toLocation.includes('trincomalee')) {
      return '/trincomalee.webp';
    }

    return null;
  };

  const getBackgroundImage = () => {
    if (currentStep === 1 || !selectedRoute) return null;

    const fromLocation = selectedRoute.fromLocation.toLowerCase();
    const toLocation = selectedRoute.toLocation.toLowerCase();

    if (fromLocation.includes('kaduruwela') || toLocation.includes('kaduruwela')) {
      return '/kaduruwela.webp';
    }

    if (fromLocation.includes('trincomalee') || toLocation.includes('trincomalee')) {
      return '/trincomalee.webp';
    }

    return null;
  };

  const backgroundImage = getBackgroundImage();

  // UseEffect Hooks
  useEffect(() => {
    fetchRoutes();
  }, []);

  useEffect(() => {
    const routeId = searchParams.get('routeId');
    
    if (routeId && routes.length > 0 && !selectedRoute) {
      const preSelectedRoute = routes.find(r => r._id === routeId);
      
      if (preSelectedRoute) {
        setSelectedRoute(preSelectedRoute);
        setFormData(prev => ({ 
          ...prev, 
          routeId: routeId,
          busId: '',
          seatNumbers: [],
          pickupLocation: ''
        }));
        
        setCurrentStep(2);
        
        toast.success(`Route selected: ${preSelectedRoute.fromLocation} → ${preSelectedRoute.toLocation}`);
      }
    }
  }, [searchParams, routes, selectedRoute]);

  useEffect(() => {
    if (formData.routeId) {
      fetchBusesByRoute(formData.routeId);
    }
  }, [formData.routeId]);

  useEffect(() => {
    if (formData.busId && formData.travelDate) {
      fetchAvailableSeats();
    }
  }, [formData.busId, formData.travelDate]);

  // API Functions
  const fetchRoutes = async () => {
    try {
      const response = await fetch('/api/routes');
      const data = await response.json();
      if (data.success) {
        setRoutes(data.data.filter((route: IRoute) => route.isActive));
      }
    } catch (error) {
      toast.error(t('booking.failedFetchRoutes'));
    }
  };

  const fetchBusesByRoute = async (routeId: string) => {
    try {
      const response = await fetch(`/api/public/buses?routeId=${routeId}`);
      const data = await response.json();

      if (data.success) {
        setBuses(data.data);
      } else {
        toast.error(data.message || t('booking.failedFetchBuses'));
        setBuses([]);
      }
    } catch (error) {
      console.error('Error fetching buses:', error);
      toast.error(t('booking.failedFetchBuses'));
      setBuses([]);
    }
  };

  const fetchAvailableSeats = async () => {
    setSeatLoading(true);
    try {
      const response = await fetch(
        `/api/public/available-seats?busId=${formData.busId}&travelDate=${formData.travelDate}`
      );
      const data = await response.json();
      if (data.success) {
        setAvailableSeats(data.data.availableSeats);
        setBookedSeats(data.data.bookedSeats);
      }
    } catch (error) {
      toast.error(t('booking.failedFetchSeats'));
    } finally {
      setSeatLoading(false);
    }
  };

  // Handler Functions
  const handleRouteSelect = (route: IRoute) => {
    setSelectedRoute(route);
    setFormData({ ...formData, routeId: route._id, busId: '', seatNumbers: [], pickupLocation: '' });
    setCurrentStep(2);
  };

  const handleBusAndDateSelect = () => {
    if (formData.busId && formData.travelDate && formData.passengers && formData.pickupLocation) {
      const bus = buses.find(b => b._id === formData.busId);
      setSelectedBus(bus || null);
      setCurrentStep(3);
    } else {
      toast.error(t('booking.fillAllFields'));
    }
  };

  const toggleSeatSelection = (seatNumber: number) => {
    const isSelected = formData.seatNumbers.includes(seatNumber);

    if (isSelected) {
      setFormData({
        ...formData,
        seatNumbers: formData.seatNumbers.filter(seat => seat !== seatNumber)
      });
    } else {
      if (formData.seatNumbers.length < formData.passengers) {
        setFormData({
          ...formData,
          seatNumbers: [...formData.seatNumbers, seatNumber].sort((a, b) => a - b)
        });
      } else {
        toast.error(`${t('booking.onlySelect')} ${formData.passengers} ${t('booking.seats')}`);
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch('/api/public/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      const data = await response.json();
      if (data.success) {
        setBookingId(data.data._id);
        setBookingSuccess(true);
        toast.success(t('booking.bookingCreated'));
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(t('booking.failedCreateBooking'));
    } finally {
      setLoading(false);
    }
  };

  const getTotalAmount = () => {
    if (selectedRoute && formData.seatNumbers.length > 0) {
      return selectedRoute.price * formData.seatNumbers.length;
    }
    return 0;
  };

  const handleBackClick = () => {
    if (currentStep > 1) {
      const newStep = currentStep - 1;
      setCurrentStep(newStep);

      if (newStep === 1) {
        router.replace('/booking', { scroll: false });
        setSelectedRoute(null);
        setSelectedBus(null);
        setFormData({
          routeId: '',
          busId: '',
          passengerName: '',
          passengerPhone: '',
          passengerEmail: '',
          seatNumbers: [],
          travelDate: '',
          passengers: 1,
          pickupLocation: ''
        });
      }
    } else {
      router.push('/');
    }
  };

  const handleStepClick = (step: number) => {
    if (step === 1) {
      setCurrentStep(1);
      router.replace('/booking', { scroll: false });
      setSelectedRoute(null);
      setSelectedBus(null);
      setFormData({
        routeId: '',
        busId: '',
        passengerName: '',
        passengerPhone: '',
        passengerEmail: '',
        seatNumbers: [],
        travelDate: '',
        passengers: 1,
        pickupLocation: ''
      });
      return;
    }

    if (step === 2) {
      if (!formData.routeId) {
        toast.error(t('booking.selectRouteFirst'));
        return;
      }
      setCurrentStep(2);
      return;
    }

    if (step === 3) {
      if (!formData.routeId) {
        toast.error(t('booking.selectRouteFirst'));
        return;
      }
      if (!formData.busId || !formData.travelDate || !formData.pickupLocation) {
        toast.error(t('booking.completeBusDetails'));
        return;
      }
      const bus = buses.find(b => b._id === formData.busId);
      setSelectedBus(bus || null);
      setCurrentStep(3);
      return;
    }

    if (step === 4) {
      if (!formData.routeId) {
        toast.error(t('booking.selectRouteFirst'));
        return;
      }
      if (!formData.busId || !formData.travelDate || !formData.pickupLocation) {
        toast.error(t('booking.completeBusDetails'));
        return;
      }
      if (formData.seatNumbers.length !== formData.passengers) {
        toast.error(t('booking.selectSeatsFirst'));
        return;
      }
      setCurrentStep(4);
      return;
    }
  };

  const isStepAccessible = (step: number) => {
    if (step === 1) return true;
    if (step === 2) return formData.routeId !== '';
    if (step === 3) return formData.routeId !== '' && formData.busId !== '' && formData.travelDate !== '' && formData.pickupLocation !== '';
    if (step === 4) return formData.routeId !== '' && formData.busId !== '' && formData.travelDate !== '' && formData.pickupLocation !== '' && formData.seatNumbers.length === formData.passengers;
    return false;
  };

  const renderSeatLayout = () => {
    if (!selectedBus) return null;

    const totalSeats = selectedBus.capacity;
    const seatsPerRow = 4;
    const fullRows = Math.floor(totalSeats / seatsPerRow);
    const remainingSeats = totalSeats % seatsPerRow;

    return (
      <div className="space-y-4">
        <div className="text-center mb-4">
          <div className={`inline-flex items-center gap-4 px-6 py-2 rounded-t-lg ${backgroundImage ? 'bg-white/20 backdrop-blur-sm' : 'bg-gray-100'}`}>
            <span className={`text-sm font-medium ${backgroundImage ? 'text-white' : 'text-gray-600'}`}>{t('booking.driver')}</span>
            <div className="w-8 h-8 bg-gray-700 rounded"></div>
          </div>
        </div>

        <div className={`p-6 rounded-lg ${backgroundImage ? 'bg-white/10 backdrop-blur-sm' : 'bg-gray-50'}`}>
          {Array.from({ length: fullRows }, (_, rowIndex) => {
            const startSeat = rowIndex * seatsPerRow + 1;

            return (
              <div key={rowIndex} className="flex items-center justify-center mb-3">
                <div className="flex gap-2">
                  {[0, 1].map(offset => {
                    const seatNumber = startSeat + offset;
                    const isAvailable = availableSeats.includes(seatNumber);
                    const isSelected = formData.seatNumbers.includes(seatNumber);
                    const isBooked = bookedSeats.includes(seatNumber);

                    return (
                      <button
                        key={seatNumber}
                        type="button"
                        disabled={!isAvailable || isBooked}
                        onClick={() => toggleSeatSelection(seatNumber)}
                        className={`
                          w-12 h-12 rounded-lg border-2 text-sm font-medium transition-all
                          ${isSelected
                            ? 'bg-sky-500 text-white border-sky-500 scale-105 shadow-lg'
                            : isBooked
                              ? 'bg-red-100 border-red-300 cursor-not-allowed text-red-400'
                              : backgroundImage
                                ? 'bg-white/80 backdrop-blur-sm border-white/50 hover:border-sky-400 hover:bg-white text-gray-700'
                                : 'bg-white border-green-400 hover:border-sky-400 hover:bg-sky-50 text-gray-700'
                          }
                        `}
                      >
                        {seatNumber}
                      </button>
                    );
                  })}
                </div>

                <div className="w-16 flex justify-center">
                  <div className={`w-0.5 h-12 ${backgroundImage ? 'bg-white/30' : 'bg-gray-300'}`}></div>
                </div>

                <div className="flex gap-2">
                  {[2, 3].map(offset => {
                    const seatNumber = startSeat + offset;
                    const isAvailable = availableSeats.includes(seatNumber);
                    const isSelected = formData.seatNumbers.includes(seatNumber);
                    const isBooked = bookedSeats.includes(seatNumber);

                    return (
                      <button
                        key={seatNumber}
                        type="button"
                        disabled={!isAvailable || isBooked}
                        onClick={() => toggleSeatSelection(seatNumber)}
                        className={`
                          w-12 h-12 rounded-lg border-2 text-sm font-medium transition-all
                          ${isSelected
                            ? 'bg-sky-500 text-white border-sky-500 scale-105 shadow-lg'
                            : isBooked
                              ? 'bg-red-100 border-red-300 cursor-not-allowed text-red-400'
                              : backgroundImage
                                ? 'bg-white/80 backdrop-blur-sm border-white/50 hover:border-sky-400 hover:bg-white text-gray-700'
                                : 'bg-white border-green-400 hover:border-sky-400 hover:bg-sky-50 text-gray-700'
                          }
                        `}
                      >
                        {seatNumber}
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })}

          {remainingSeats > 0 && (
            <div className={`flex justify-center mt-4 pt-4 ${backgroundImage ? 'border-t-2 border-white/30' : 'border-t-2 border-gray-300'}`}>
              <div className="flex gap-2">
                {Array.from({ length: remainingSeats }, (_, i) => {
                  const seatNumber = fullRows * seatsPerRow + i + 1;
                  const isAvailable = availableSeats.includes(seatNumber);
                  const isSelected = formData.seatNumbers.includes(seatNumber);
                  const isBooked = bookedSeats.includes(seatNumber);

                  return (
                    <button
                      key={seatNumber}
                      type="button"
                      disabled={!isAvailable || isBooked}
                      onClick={() => toggleSeatSelection(seatNumber)}
                      className={`
                        w-12 h-12 rounded-lg border-2 text-sm font-medium transition-all
                        ${isSelected
                          ? 'bg-sky-500 text-white border-sky-500 scale-105 shadow-lg'
                          : isBooked
                            ? 'bg-red-100 border-red-300 cursor-not-allowed text-red-400'
                            : backgroundImage
                              ? 'bg-white/80 backdrop-blur-sm border-white/50 hover:border-sky-400 hover:bg-white text-gray-700'
                              : 'bg-white border-green-400 hover:border-sky-400 hover:bg-sky-50 text-gray-700'
                        }
                      `}
                    >
                      {seatNumber}
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        <div className="flex justify-center gap-6 pt-4">
          <div className="flex items-center gap-2">
            <div className={`w-8 h-8 rounded ${backgroundImage ? 'bg-white/80 border-2 border-white/50' : 'bg-white border-2 border-green-400'}`}></div>
            <span className={`text-sm ${backgroundImage ? 'text-white' : 'text-gray-700'}`}>{t('booking.available')}</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-sky-500 border-2 border-sky-500 rounded"></div>
            <span className="text-sm text-white bg-sky-500 px-2 py-1 rounded">{t('booking.selected')}</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-red-100 border-2 border-red-300 rounded"></div>
            <span className={`text-sm ${backgroundImage ? 'text-white' : 'text-gray-700'}`}>{t('booking.booked')}</span>
          </div>
        </div>
      </div>
    );
  };

  const pageVariants = {
    initial: { opacity: 0, x: 50 },
    in: { opacity: 1, x: 0 },
    out: { opacity: 0, x: -50 }
  };

  if (bookingSuccess) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-sky-50 to-white flex items-center justify-center p-4">
        <Card className="max-w-md w-full">
          <CardContent className="text-center py-12">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="w-10 h-10 text-green-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">{t('booking.bookingConfirmed')}</h2>
            <p className="text-gray-600 mb-6">
              {t('booking.bookingSuccess')}
            </p>
            <div className="bg-gray-100 rounded-lg p-4 mb-6">
              <p className="text-sm text-gray-600">{t('booking.bookingId')}</p>
              <p className="text-lg font-mono font-bold">{bookingId.slice(-8).toUpperCase()}</p>
            </div>
            <div className="text-sm text-gray-600 mb-6">
              <p><strong>{t('booking.pickupLocation')}:</strong> {formData.pickupLocation}</p>
            </div>
            <Button onClick={() => router.push('/')} className="w-full">
              {t('booking.backToHome')}
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen relative">
      {/* Background Image */}
      {backgroundImage && (
        <>
          <div className="fixed inset-0 z-0">
            <Image
              src={backgroundImage}
              alt="Background"
              fill
              priority
              quality={85}
              sizes="100vw"
              className="object-cover"
            />
            <div className="absolute inset-0 bg-black/50"></div>
          </div>
        </>
      )}

      {/* Default background for routes without image */}
      {!backgroundImage && (
        <div className="fixed inset-0 z-0 bg-gradient-to-br from-sky-50 to-white"></div>
      )}

      <header className={`${backgroundImage ? 'bg-white/10 backdrop-blur-md border-b border-white/20' : 'bg-white'} shadow-sm sticky top-0 z-50`}>
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="sm"
                className={`${backgroundImage ? 'text-white hover:bg-white/20' : 'text-primary hover:text-primary/80'}`}
                onClick={handleBackClick}
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                {t('booking.back')}
              </Button>
              <h1 className={`text-xl font-bold ${backgroundImage ? 'text-white' : 'text-primary'}`}>{t('booking.title')}</h1>
            </div>

            <div className="hidden md:flex items-center gap-2">
              {[1, 2, 3, 4].map((step) => (
                <div key={step} className="flex items-center">
                  <div
                    onClick={() => handleStepClick(step)}
                    className={`
                      w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-all
                      ${currentStep >= step
                        ? 'bg-sky-500 text-white'
                        : backgroundImage
                          ? 'bg-white/20 text-white backdrop-blur-sm'
                          : 'bg-gray-200 text-gray-500'
                      }
                      ${isStepAccessible(step)
                        ? 'cursor-pointer hover:scale-110 hover:shadow-md'
                        : 'cursor-not-allowed opacity-60'
                      }
                    `}
                    title={isStepAccessible(step) ? `${t('booking.goToStep')} ${step}` : t('booking.completePrevious')}
                  >
                    {step}
                  </div>
                  {step < 4 && (
                    <ChevronRight className={`w-4 h-4 mx-2 ${currentStep > step
                      ? 'text-sky-500'
                      : backgroundImage
                        ? 'text-white/50'
                        : 'text-gray-300'
                      }`} />
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8 max-w-6xl relative z-10">
        <AnimatePresence mode="wait">
          {currentStep === 1 && (
            <motion.div
              key="step1"
              variants={pageVariants}
              initial="initial"
              animate="in"
              exit="out"
              transition={{ duration: 0.3 }}
            >
              <div className="mb-8">
                <h2 className="text-2xl font-bold mb-2 text-gray-800">
                  {t('booking.selectRoute')}
                </h2>
                <p className="text-gray-600">
                  {t('booking.chooseJourney')}
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {routes.map((route) => {
                  const routeBackground = getRouteCardBackground(route);
                  const hasBackground = !!routeBackground;

                  return (
                    <div
                      key={route._id}
                      className="cursor-pointer transition-all hover:scale-105 rounded-lg overflow-hidden relative group"
                      onClick={() => handleRouteSelect(route)}
                    >
                      {hasBackground && (
                        <>
                          <Image
                            src={routeBackground}
                            alt={route.name}
                            fill
                            sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                            className="object-cover"
                            quality={80}
                          />
                          <div className="absolute inset-0 bg-black/60 group-hover:bg-black/30 transition-all z-10"></div>
                        </>
                      )}

                      <Card className={`${hasBackground ? 'bg-transparent border-white/20' : 'bg-white'} relative z-20`}>
                        <CardHeader>
                          <CardTitle className={`text-lg ${hasBackground ? 'text-white drop-shadow-lg' : 'text-gray-800'}`}>
                            {route.name}
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-3">
                            <div className="flex items-center gap-2 text-sm">
                              <MapPin className={`w-4 h-4 ${hasBackground ? 'text-white drop-shadow' : 'text-sky-500'}`} />
                              <span className={hasBackground ? 'text-white drop-shadow-lg font-medium' : 'text-gray-600'}>
                                {route.fromLocation} → {route.toLocation}
                              </span>
                            </div>
                            <div className="flex items-center gap-2 text-sm">
                              <Clock className={`w-4 h-4 ${hasBackground ? 'text-white drop-shadow' : 'text-sky-500'}`} />
                              <span className={hasBackground ? 'text-white drop-shadow-lg font-medium' : 'text-gray-600'}>
                                {route.duration} {t('booking.minutes')}
                              </span>
                            </div>
                            <div className="flex items-center gap-2 text-sm">
                              <DollarSign className={`w-4 h-4 ${hasBackground ? 'text-white drop-shadow' : 'text-sky-500'}`} />
                              <span className={`font-bold text-lg ${hasBackground ? 'text-white drop-shadow-lg' : 'text-sky-600'}`}>
                                LKR: {route.price}/=
                              </span>
                            </div>
                            {route.pickupLocations.length > 0 && (
                              <div className={`pt-2 ${hasBackground ? 'border-t border-white/30' : 'border-t'}`}>
                                <p className={`text-xs mb-1 ${hasBackground ? 'text-white/90 drop-shadow' : 'text-gray-500'}`}>
                                  {t('booking.pickupPoints')}:
                                </p>
                                <div className="flex flex-wrap gap-1">
                                  {route.pickupLocations.slice(0, 3).map((location, idx) => (
                                    <Badge
                                      key={idx}
                                      variant="secondary"
                                      className={`text-xs ${hasBackground ? 'bg-white/20 text-white border-white/30 backdrop-blur-sm' : ''}`}
                                    >
                                      {location}
                                    </Badge>
                                  ))}
                                  {route.pickupLocations.length > 3 && (
                                    <Badge
                                      variant="outline"
                                      className={`text-xs ${hasBackground ? 'border-white/50 text-white backdrop-blur-sm' : ''}`}
                                    >
                                      +{route.pickupLocations.length - 3} more
                                    </Badge>
                                  )}
                                </div>
                              </div>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  );
                })}
              </div>
            </motion.div>
          )}

          {currentStep === 2 && (
            <motion.div
              key="step2"
              variants={pageVariants}
              initial="initial"
              animate="in"
              exit="out"
              transition={{ duration: 0.3 }}
            >
              <div className="mb-8">
                <h2 className={`text-2xl font-bold mb-2 ${backgroundImage ? 'text-white' : 'text-gray-800'}`}>
                  {t('booking.selectBus')}
                </h2>
                <p className={backgroundImage ? 'text-white/80' : 'text-gray-600'}>
                  {t('booking.route')}: {selectedRoute?.fromLocation} → {selectedRoute?.toLocation}
                </p>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-6">
                  <Card className={backgroundImage ? 'bg-white/10 backdrop-blur-md border-white/20' : 'bg-white'}>
                    <CardHeader>
                      <CardTitle className={backgroundImage ? 'text-white' : 'text-gray-800'}>
                        {t('booking.selectBus')}
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-3">
                          <Label className={backgroundImage ? 'text-white/90 text-sm font-medium' : 'text-gray-700 text-sm font-medium'}>
                            {t('booking.travelDate')} *
                          </Label>
                          <Input
                            type="date"
                            value={formData.travelDate}
                            onChange={(e) => setFormData({ ...formData, travelDate: e.target.value })}
                            min={new Date().toISOString().split('T')[0]}
                            className={backgroundImage ? 'bg-white/20 border-white/30 text-white placeholder:text-white/50 h-11' : 'h-11'}
                          />
                        </div>

                        <div className="space-y-3">
                          <Label className={backgroundImage ? 'text-white/90 text-sm font-medium' : 'text-gray-700 text-sm font-medium'}>
                            {t('booking.passengers')} *
                          </Label>
                          <Select
                            value={formData.passengers.toString()}
                            onValueChange={(value) => setFormData({
                              ...formData,
                              passengers: parseInt(value),
                              seatNumbers: []
                            })}
                          >
                            <SelectTrigger className={backgroundImage ? 'bg-white/20 border-white/30 text-white h-11' : 'h-11'}>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {[1, 2, 3, 4, 5, 6].map(num => (
                                <SelectItem key={num} value={num.toString()}>
                                  {num} {num === 1 ? t('booking.passenger') : t('booking.passengers_plural')}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      </div>

                      <div className="space-y-3">
                        <Label className={backgroundImage ? 'text-white/90 text-sm font-medium' : 'text-gray-700 text-sm font-medium'}>
                          {t('booking.pickupLocation')} *
                        </Label>
                        <Select
                          value={formData.pickupLocation}
                          onValueChange={(value) => setFormData({ ...formData, pickupLocation: value })}
                        >
                          <SelectTrigger className={backgroundImage ? 'bg-white/20 border-white/30 text-white h-11' : 'h-11'}>
                            <SelectValue placeholder={t('booking.selectPickup')} />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value={selectedRoute?.fromLocation || ''}>
                              {selectedRoute?.fromLocation} ({t('booking.startingPoint')})
                            </SelectItem>
                            {selectedRoute?.pickupLocations.map((location, idx) => (
                              <SelectItem key={idx} value={location}>
                                {location}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        {formData.pickupLocation && (
                          <div className={`mt-2 flex items-center gap-2 text-sm ${backgroundImage ? 'text-white' : 'text-sky-600'}`}>
                            <MapPin className="w-4 h-4" />
                            <span>{t('booking.selected')}: {formData.pickupLocation}</span>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>

                  <div>
                    <h3 className={`text-lg font-semibold mb-4 ${backgroundImage ? 'text-white' : 'text-gray-800'}`}>
                      {t('booking.availableBuses')}
                    </h3>
                    {buses.length === 0 ? (
                      <Card className={backgroundImage ? 'bg-white/10 backdrop-blur-md border-white/20' : 'bg-white'}>
                        <CardContent className="text-center py-8">
                          <p className={backgroundImage ? 'text-white/70' : 'text-gray-500'}>{t('booking.noBuses')}</p>
                        </CardContent>
                      </Card>
                    ) : (
                      <div className="space-y-4">
                        {buses.map((bus) => {
                          const locked = isBusLocked(bus, formData.travelDate);
                          const timeWarning = getTimeToDeparture(bus, formData.travelDate);

                          return (
                            <Card
                              key={bus._id}
                              className={`cursor-pointer transition-all ${backgroundImage
                                ? 'bg-white/10 backdrop-blur-md border-white/20 hover:bg-white/20'
                                : 'bg-white hover:shadow-md'
                                } ${formData.busId === bus._id ? 'ring-2 ring-sky-500 shadow-lg' : ''
                                } ${locked ? 'opacity-60 cursor-not-allowed' : ''
                                }`}
                              onClick={() => {
                                if (!locked) {
                                  setFormData({ ...formData, busId: bus._id });
                                } else {
                                  toast.error('This bus is departing soon and cannot be booked');
                                }
                              }}
                            >
                              <CardContent className="p-4">
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center gap-4">
                                    <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${backgroundImage ? 'bg-white/20' : 'bg-sky-100'
                                      }`}>
                                      <Bus className={`w-6 h-6 ${backgroundImage ? 'text-white' : 'text-sky-600'}`} />
                                    </div>
                                    <div>
                                      <h4 className={`font-semibold text-lg ${backgroundImage ? 'text-white' : 'text-gray-800'}`}>
                                        {bus.busNumber}
                                      </h4>
                                      <div className="flex items-center gap-4 text-sm">
                                        <span className={`flex items-center gap-1 ${backgroundImage ? 'text-white/80' : 'text-gray-600'}`}>
                                          <Users className="w-4 h-4" />
                                          {bus.capacity} {t('booking.seats')}
                                        </span>
                                        <span className={`flex items-center gap-1 ${backgroundImage ? 'text-white/80' : 'text-gray-600'}`}>
                                          <Clock className="w-4 h-4" />
                                          {formatTime(bus.departureTime)}
                                        </span>
                                        <Badge variant={
                                          bus.type === 'luxury' ? 'default' :
                                            bus.type === 'semi_luxury' ? 'secondary' : 'outline'
                                        }
                                          className={backgroundImage ? 'bg-white/20 text-white border-white/30' : ''}
                                        >
                                          {bus.type.replace('_', ' ')}
                                        </Badge>
                                      </div>
                                    </div>
                                  </div>
                                  <div className="text-right flex flex-col items-end gap-2">
                                    {formData.busId === bus._id && !locked && (
                                      <CheckCircle className="w-6 h-6 text-sky-500" />
                                    )}
                                    {locked && (
                                      <Badge variant="destructive" className="text-xs">
                                        {t('booking.departureSoon')}
                                      </Badge>
                                    )}
                                    {timeWarning && (
                                      <span className={`text-xs ${backgroundImage ? 'text-yellow-300' : 'text-yellow-600'}`}>
                                        {timeWarning}
                                      </span>
                                    )}
                                  </div>
                                </div>
                                {bus.amenities.length > 0 && (
                                  <div className="flex flex-wrap gap-1 mt-3">
                                    {bus.amenities.map((amenity, idx) => (
                                      <Badge
                                        key={idx}
                                        variant="outline"
                                        className={`text-xs ${backgroundImage ? 'border-white/30 text-white' : ''}`}
                                      >
                                        {amenity}
                                      </Badge>
                                    ))}
                                  </div>
                                )}
                              </CardContent>
                            </Card>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </div>

                <div>
                  <Card className={`sticky top-24 ${backgroundImage ? 'bg-white/10 backdrop-blur-md border-white/20' : 'bg-white'}`}>
                    <CardHeader>
                      <CardTitle className={backgroundImage ? 'text-white' : 'text-gray-800'}>{t('booking.selectionSummary')}</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div>
                        <p className={`text-sm ${backgroundImage ? 'text-white/70' : 'text-gray-600'}`}>{t('booking.route')}</p>
                        <p className={`font-medium ${backgroundImage ? 'text-white' : 'text-gray-800'}`}>
                          {selectedRoute?.fromLocation} → {selectedRoute?.toLocation}
                        </p>
                      </div>
                      {formData.busId && (
                        <div>
                          <p className={`text-sm ${backgroundImage ? 'text-white/70' : 'text-gray-600'}`}>{t('booking.selectedBus')}</p>
                          <p className={`font-medium ${backgroundImage ? 'text-white' : 'text-gray-800'}`}>
                            {buses.find(b => b._id === formData.busId)?.busNumber}
                          </p>
                        </div>
                      )}
                      {formData.travelDate && (
                        <div>
                          <p className={`text-sm ${backgroundImage ? 'text-white/70' : 'text-gray-600'}`}>{t('booking.travelDate')}</p>
                          <p className={`font-medium ${backgroundImage ? 'text-white' : 'text-gray-800'}`}>{formData.travelDate}</p>
                        </div>
                      )}
                      {formData.pickupLocation && (
                        <div>
                          <p className={`text-sm ${backgroundImage ? 'text-white/70' : 'text-gray-600'}`}>{t('booking.pickupLocation')}</p>
                          <p className={`font-medium ${backgroundImage ? 'text-white' : 'text-gray-800'}`}>{formData.pickupLocation}</p>
                        </div>
                      )}
                      <div>
                        <p className={`text-sm ${backgroundImage ? 'text-white/70' : 'text-gray-600'}`}>{t('booking.passengers')}</p>
                        <p className={`font-medium ${backgroundImage ? 'text-white' : 'text-gray-800'}`}>{formData.passengers}</p>
                      </div>
                      <div className="pt-4">
                        <Button
                          onClick={handleBusAndDateSelect}
                          disabled={
                            !formData.busId ||
                            !formData.travelDate ||
                            !formData.pickupLocation ||
                            isBusLocked(buses.find(b => b._id === formData.busId), formData.travelDate)
                          }
                          className="w-full"
                        >
                          {t('booking.continueToSeats')}
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </motion.div>
          )}

          {currentStep === 3 && (
            <motion.div
              key="step3"
              variants={pageVariants}
              initial="initial"
              animate="in"
              exit="out"
              transition={{ duration: 0.3 }}
            >
              <div className="mb-8">
                <h2 className={`text-2xl font-bold mb-2 ${backgroundImage ? 'text-white' : 'text-gray-800'}`}>
                  {t('booking.selectSeats')}
                </h2>
                <p className={backgroundImage ? 'text-white/80' : 'text-gray-600'}>
                  {t('booking.bus')}: {selectedBus?.busNumber} | {t('booking.date')}: {formData.travelDate} | {t('booking.passengers')}: {formData.passengers}
                </p>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2">
                  <Card className={backgroundImage ? 'bg-white/10 backdrop-blur-md border-white/20' : 'bg-white'}>
                    <CardHeader>
                      <CardTitle className={backgroundImage ? 'text-white' : 'text-gray-800'}>
                        {t('booking.seatLayout')} - {selectedBus?.busNumber}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      {seatLoading ? (
                        <div className="flex items-center justify-center h-64">
                          <Loader2 className="w-8 h-8 animate-spin text-sky-500" />
                        </div>
                      ) : (
                        renderSeatLayout()
                      )}
                    </CardContent>
                  </Card>
                </div>

                <div>
                  <Card className={backgroundImage ? 'bg-white/10 backdrop-blur-md border-white/20' : 'bg-white'}>
                    <CardHeader>
                      <CardTitle className={backgroundImage ? 'text-white' : 'text-gray-800'}>{t('booking.bookingSummary')}</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div>
                        <p className={`text-sm ${backgroundImage ? 'text-white/70' : 'text-gray-600'}`}>{t('booking.selectedSeats')}</p>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {formData.seatNumbers.length > 0 ? (
                            formData.seatNumbers.map(seat => (
                              <Badge
                                key={seat}
                                variant="secondary"
                                className={backgroundImage ? 'bg-white/20 text-white border-white/30' : ''}
                              >
                                {t('booking.seat')} {seat}
                              </Badge>
                            ))
                          ) : (
                            <p className={`text-sm ${backgroundImage ? 'text-white/70' : 'text-gray-500'}`}>
                              {t('booking.selectMoreSeats')} {formData.passengers} {t('booking.seats')}
                            </p>
                          )}
                        </div>
                      </div>

                      <div>
                        <p className={`text-sm ${backgroundImage ? 'text-white/70' : 'text-gray-600'}`}>{t('booking.pickupLocation')}</p>
                        <p className={`font-medium flex items-center gap-1 ${backgroundImage ? 'text-white' : 'text-gray-800'}`}>
                          <MapPin className={`w-4 h-4 ${backgroundImage ? 'text-white' : 'text-sky-500'}`} />
                          {formData.pickupLocation}
                        </p>
                      </div>

                      <div>
                        <p className={`text-sm ${backgroundImage ? 'text-white/70' : 'text-gray-600'}`}>{t('booking.pricePerSeat')}</p>
                        <p className={`font-bold ${backgroundImage ? 'text-white' : 'text-gray-800'}`}>
                          LKR: {selectedRoute?.price}/=
                        </p>
                      </div>

                      <div className={`pt-4 ${backgroundImage ? 'border-t border-white/20' : 'border-t'}`}>
                        <p className={`text-sm ${backgroundImage ? 'text-white/70' : 'text-gray-600'}`}>{t('booking.totalAmount')}</p>
                        <p className={`text-2xl font-bold ${backgroundImage ? 'text-white' : 'text-sky-600'}`}>
                          LKR: {getTotalAmount()}/=
                        </p>
                      </div>

                      <Button
                        onClick={() => setCurrentStep(4)}
                        disabled={formData.seatNumbers.length !== formData.passengers}
                        className="w-full"
                      >
                        {formData.seatNumbers.length !== formData.passengers
                          ? `${t('booking.selectMoreSeats')} ${formData.passengers - formData.seatNumbers.length} ${t('booking.moreSeats')}`
                          : t('booking.continueToDetails')
                        }
                      </Button>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </motion.div>
          )}

          {currentStep === 4 && (
            <motion.div
              key="step4"
              variants={pageVariants}
              initial="initial"
              animate="in"
              exit="out"
              transition={{ duration: 0.3 }}
            >
              <div className="mb-8">
                <h2 className={`text-2xl font-bold mb-2 ${backgroundImage ? 'text-white' : 'text-gray-800'}`}>
                  {t('booking.passengerDetails')}
                </h2>
                <p className={backgroundImage ? 'text-white/80' : 'text-gray-600'}>
                  {t('booking.fillAllFields')}
                </p>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2">
                  <Card className={backgroundImage ? 'bg-white/10 backdrop-blur-md border-white/20' : 'bg-white'}>
                    <CardContent className="pt-6">
                      <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="space-y-3">
                          <Label className={backgroundImage ? 'text-white/90 text-sm font-medium' : 'text-gray-700 text-sm font-medium'}>
                            {t('booking.fullName')} *
                          </Label>
                          <div className="relative">
                            <User className={`absolute left-3 top-3.5 w-4 h-4 ${backgroundImage ? 'text-white/50' : 'text-gray-400'}`} />
                            <Input
                              required
                              value={formData.passengerName}
                              onChange={(e) => setFormData({ ...formData, passengerName: e.target.value })}
                              placeholder={t('booking.enterFullName')}
                              className={`pl-10 h-11 ${backgroundImage ? 'bg-white/20 border-white/30 text-white placeholder:text-white/50' : ''}`}
                            />
                          </div>
                        </div>

                        <div className="space-y-3">
                          <Label className={backgroundImage ? 'text-white/90 text-sm font-medium' : 'text-gray-700 text-sm font-medium'}>
                            {t('booking.phoneNumber')} *
                          </Label>
                          <div className="relative">
                            <Phone className={`absolute left-3 top-3.5 w-4 h-4 ${backgroundImage ? 'text-white/50' : 'text-gray-400'}`} />
                            <Input
                              required
                              value={formData.passengerPhone}
                              onChange={(e) => setFormData({ ...formData, passengerPhone: e.target.value })}
                              placeholder={t('booking.enterPhone')}
                              className={`pl-10 h-11 ${backgroundImage ? 'bg-white/20 border-white/30 text-white placeholder:text-white/50' : ''}`}
                            />
                          </div>
                        </div>

                        <div className="space-y-3">
                          <Label className={backgroundImage ? 'text-white/90 text-sm font-medium' : 'text-gray-700 text-sm font-medium'}>
                            {t('booking.email')} ({t('booking.optional')})
                          </Label>
                          <div className="relative">
                            <Mail className={`absolute left-3 top-3.5 w-4 h-4 ${backgroundImage ? 'text-white/50' : 'text-gray-400'}`} />
                            <Input
                              type="email"
                              value={formData.passengerEmail}
                              onChange={(e) => setFormData({ ...formData, passengerEmail: e.target.value })}
                              placeholder={t('booking.enterEmail')}
                              className={`pl-10 h-11 ${backgroundImage ? 'bg-white/20 border-white/30 text-white placeholder:text-white/50' : ''}`}
                            />
                          </div>
                        </div>

                        <Button
                          type="submit"
                          disabled={loading || !formData.passengerName || !formData.passengerPhone}
                          className="w-full h-11"
                        >
                          {loading ? (
                            <>
                              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                              {t('booking.processing')}
                            </>
                          ) : (
                            t('booking.confirmBooking')
                          )}
                        </Button>
                      </form>
                    </CardContent>
                  </Card>
                </div>

                <div>
                  <Card className={backgroundImage ? 'bg-white/10 backdrop-blur-md border-white/20' : 'bg-white'}>
                    <CardHeader>
                      <CardTitle className={backgroundImage ? 'text-white' : 'text-gray-800'}>{t('booking.bookingDetails')}</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3 text-sm">
                      <div>
                        <p className={backgroundImage ? 'text-white/70' : 'text-gray-600'}>{t('booking.route')}</p>
                        <p className={`font-medium ${backgroundImage ? 'text-white' : 'text-gray-800'}`}>
                          {selectedRoute?.fromLocation} → {selectedRoute?.toLocation}
                        </p>
                      </div>
                      <div>
                        <p className={backgroundImage ? 'text-white/70' : 'text-gray-600'}>{t('booking.bus')}</p>
                        <p className={`font-medium ${backgroundImage ? 'text-white' : 'text-gray-800'}`}>{selectedBus?.busNumber}</p>
                      </div>
                      <div>
                        <p className={backgroundImage ? 'text-white/70' : 'text-gray-600'}>{t('booking.travelDate')}</p>
                        <p className={`font-medium ${backgroundImage ? 'text-white' : 'text-gray-800'}`}>{formData.travelDate}</p>
                      </div>
                      <div>
                        <p className={backgroundImage ? 'text-white/70' : 'text-gray-600'}>{t('booking.pickupLocation')}</p>
                        <p className={`font-medium ${backgroundImage ? 'text-white' : 'text-gray-800'}`}>{formData.pickupLocation}</p>
                      </div>
                      <div>
                        <p className={backgroundImage ? 'text-white/70' : 'text-gray-600'}>{t('booking.seats')}</p>
                        <p className={`font-medium ${backgroundImage ? 'text-white' : 'text-gray-800'}`}>{formData.seatNumbers.join(', ')}</p>
                      </div>
                      <div className={`pt-3 ${backgroundImage ? 'border-t border-white/20' : 'border-t'}`}>
                        <p className={backgroundImage ? 'text-white/70' : 'text-gray-600'}>{t('booking.totalAmount')}</p>
                        <p className={`text-xl font-bold ${backgroundImage ? 'text-white' : 'text-sky-600'}`}>
                          LKR: {getTotalAmount()}/=
                        </p>
                      </div>
                    </CardContent>
                  </Card>

                  <div className={`mt-4 p-4 rounded-lg ${backgroundImage ? 'bg-white/10 backdrop-blur-md border border-white/20' : 'bg-amber-50'}`}>
                    <div className="flex gap-2">
                      <AlertCircle className={`w-5 h-5 flex-shrink-0 ${backgroundImage ? 'text-white' : 'text-amber-600'}`} />
                      <div className={`text-sm ${backgroundImage ? 'text-white' : 'text-amber-800'}`}>
                        <p className="font-medium mb-1">{t('booking.important')}</p>
                        <ul className="space-y-1">
                          <li>• {t('booking.arriveEarly')}</li>
                          <li>• {t('booking.carryId')}</li>
                          <li>• {t('booking.saveBookingId')}</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}