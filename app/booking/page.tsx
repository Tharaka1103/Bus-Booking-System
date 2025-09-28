// app/book-ticket/page.tsx

'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  Bus,
  Calendar,
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
import { toast } from 'sonner';
import { IRoute, IBus } from '@/types';
import { motion, AnimatePresence } from 'framer-motion';

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

  useEffect(() => {
    fetchRoutes();
  }, []);

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

  const fetchRoutes = async () => {
    try {
      const response = await fetch('/api/routes');
      const data = await response.json();
      if (data.success) {
        setRoutes(data.data.filter((route: IRoute) => route.isActive));
      }
    } catch (error) {
      toast.error('Failed to fetch routes');
    }
  };

  const fetchBusesByRoute = async (routeId: string) => {
    try {
      const response = await fetch('/api/buses');
      const data = await response.json();
      if (data.success) {
        const routeBuses = data.data.filter((bus: IBus) => {
          const busRouteId = typeof bus.routeId === 'object' ? bus.routeId._id : bus.routeId;
          return busRouteId === routeId && bus.isActive;
        });
        setBuses(routeBuses);
      }
    } catch (error) {
      toast.error('Failed to fetch buses');
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
      toast.error('Failed to fetch available seats');
    } finally {
      setSeatLoading(false);
    }
  };

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
      toast.error('Please fill all required fields');
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
        toast.error(`You can only select ${formData.passengers} seat(s)`);
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
        toast.success('Booking created successfully!');
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error('Failed to create booking');
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

  // Function to handle step navigation
  const handleStepClick = (step: number) => {
    // Validation for step navigation
    if (step === 1) {
      setCurrentStep(1);
      return;
    }
    
    if (step === 2) {
      if (!formData.routeId) {
        toast.error('Please select a route first');
        return;
      }
      setCurrentStep(2);
      return;
    }
    
    if (step === 3) {
      if (!formData.routeId) {
        toast.error('Please select a route first');
        return;
      }
      if (!formData.busId || !formData.travelDate || !formData.pickupLocation) {
        toast.error('Please complete bus and travel details first');
        return;
      }
      const bus = buses.find(b => b._id === formData.busId);
      setSelectedBus(bus || null);
      setCurrentStep(3);
      return;
    }
    
    if (step === 4) {
      if (!formData.routeId) {
        toast.error('Please select a route first');
        return;
      }
      if (!formData.busId || !formData.travelDate || !formData.pickupLocation) {
        toast.error('Please complete bus and travel details first');
        return;
      }
      if (formData.seatNumbers.length !== formData.passengers) {
        toast.error('Please select your seats first');
        return;
      }
      setCurrentStep(4);
      return;
    }
  };

  // Function to check if step is accessible
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
    const seatsPerRow = 4; // Standard 2+2 configuration
    const fullRows = Math.floor(totalSeats / seatsPerRow);
    const remainingSeats = totalSeats % seatsPerRow;

    return (
      <div className="space-y-4">
        {/* Bus Front */}
        <div className="text-center mb-4">
          <div className="inline-flex items-center gap-4 bg-gray-100 px-6 py-2 rounded-t-lg">
            <span className="text-sm font-medium text-gray-600">Driver</span>
            <div className="w-8 h-8 bg-gray-700 rounded"></div>
          </div>
        </div>

        {/* Seat Rows */}
        <div className="bg-gray-50 p-6 rounded-lg">
          {/* Full rows */}
          {Array.from({ length: fullRows }, (_, rowIndex) => {
            const startSeat = rowIndex * seatsPerRow + 1;

            return (
              <div key={rowIndex} className="flex items-center justify-center mb-3">
                {/* Left seats */}
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
                              : 'bg-white border-green-400 hover:border-sky-400 hover:bg-sky-50 text-gray-700'
                          }
                                                `}
                      >
                        {seatNumber}
                      </button>
                    );
                  })}
                </div>

                {/* Aisle */}
                <div className="w-16 flex justify-center">
                  <div className="w-0.5 h-12 bg-gray-300"></div>
                </div>

                {/* Right seats */}
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

          {/* Last row with remaining seats */}
          {remainingSeats > 0 && (
            <div className="flex justify-center mt-4 pt-4 border-t-2 border-gray-300">
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

        {/* Legend */}
        <div className="flex justify-center gap-6 pt-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-white border-2 border-green-400 rounded"></div>
            <span className="text-sm">Available</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-sky-500 border-2 border-sky-500 rounded"></div>
            <span className="text-sm text-white bg-sky-500 px-2 py-1 rounded">Selected</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-red-100 border-2 border-red-300 rounded"></div>
            <span className="text-sm">Booked</span>
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
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Booking Confirmed!</h2>
            <p className="text-gray-600 mb-6">
              Your booking has been successfully created. Please save your booking ID for future reference.
            </p>
            <div className="bg-gray-100 rounded-lg p-4 mb-6">
              <p className="text-sm text-gray-600">Booking ID</p>
              <p className="text-lg font-mono font-bold">{bookingId.slice(-8).toUpperCase()}</p>
            </div>
            <div className="text-sm text-gray-600 mb-6">
              <p><strong>Pickup Location:</strong> {formData.pickupLocation}</p>
            </div>
            <Button onClick={() => router.push('/')} className="w-full">
              Back to Home
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-50 to-white mt-20">
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => currentStep > 1 ? setCurrentStep(currentStep - 1) : router.push('/')}
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back
              </Button>
              <h1 className="text-xl font-bold text-gray-800">Book Your Ticket</h1>
            </div>

            {/* Progress Steps */}
            <div className="hidden md:flex items-center gap-2">
              {[1, 2, 3, 4].map((step) => (
                <div key={step} className="flex items-center">
                  <div 
                    onClick={() => handleStepClick(step)}
                    className={`
                      w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-all
                      ${currentStep >= step
                        ? 'bg-sky-500 text-white'
                        : 'bg-gray-200 text-gray-500'
                      }
                      ${isStepAccessible(step) 
                        ? 'cursor-pointer hover:scale-110 hover:shadow-md' 
                        : 'cursor-not-allowed opacity-60'
                      }
                    `}
                    title={isStepAccessible(step) ? `Go to step ${step}` : 'Complete previous steps first'}
                  >
                    {step}
                  </div>
                  {step < 4 && (
                    <ChevronRight className={`w-4 h-4 mx-2 ${currentStep > step ? 'text-sky-500' : 'text-gray-300'
                      }`} />
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <AnimatePresence mode="wait">
          {/* Step 1: Select Route */}
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
                <h2 className="text-2xl font-bold text-gray-800 mb-2">Select Your Route</h2>
                <p className="text-gray-600">Choose your journey from available routes</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {routes.map((route) => (
                  <Card
                    key={route._id}
                    className="cursor-pointer hover:shadow-lg transition-all hover:scale-105"
                    onClick={() => handleRouteSelect(route)}
                  >
                    <CardHeader>
                      <CardTitle className="text-lg">{route.name}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <div className="flex items-center gap-2 text-sm">
                          <MapPin className="w-4 h-4 text-sky-500" />
                          <span className="text-gray-600">
                            {route.fromLocation} → {route.toLocation}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                          <Clock className="w-4 h-4 text-sky-500" />
                          <span className="text-gray-600">
                            {route.duration} minutes
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                          <DollarSign className="w-4 h-4 text-sky-500" />
                          <span className="font-bold text-lg text-sky-600">
                            LKR: {route.price}/=
                          </span>
                        </div>
                        {route.pickupLocations.length > 0 && (
                          <div className="pt-2 border-t">
                            <p className="text-xs text-gray-500 mb-1">Pickup Points:</p>
                            <div className="flex flex-wrap gap-1">
                              {route.pickupLocations.slice(0, 3).map((location, idx) => (
                                <Badge key={idx} variant="secondary" className="text-xs">
                                  {location}
                                </Badge>
                              ))}
                              {route.pickupLocations.length > 3 && (
                                <Badge variant="outline" className="text-xs">
                                  +{route.pickupLocations.length - 3} more
                                </Badge>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </motion.div>
          )}

          {/* Step 2: Select Bus, Date, Passengers, and Pickup Location */}
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
                <h2 className="text-2xl font-bold text-gray-800 mb-2">Select Bus, Date & Details</h2>
                <p className="text-gray-600">
                  Route: {selectedRoute?.fromLocation} → {selectedRoute?.toLocation}
                </p>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-6">
                  {/* Travel Details */}
                  <Card>
                    <CardHeader>
                      <CardTitle>Travel Details</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <Label>Travel Date *</Label>
                          <Input
                            type="date"
                            value={formData.travelDate}
                            onChange={(e) => setFormData({ ...formData, travelDate: e.target.value })}
                            min={new Date().toISOString().split('T')[0]}
                          />
                        </div>
                        <div>
                          <Label>Number of Passengers *</Label>
                          <select
                            value={formData.passengers}
                            onChange={(e) => setFormData({
                              ...formData,
                              passengers: parseInt(e.target.value),
                              seatNumbers: []
                            })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                          >
                            {[1, 2, 3, 4, 5, 6].map(num => (
                              <option key={num} value={num}>
                                {num} {num === 1 ? 'Passenger' : 'Passengers'}
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>

                      {/* Pickup Location Selection */}
                      <div className="mt-4">
                        <Label>Pickup Location *</Label>
                        <select
                          value={formData.pickupLocation}
                          onChange={(e) => setFormData({ ...formData, pickupLocation: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg mt-1"
                          required
                        >
                          <option value="">Select pickup location</option>
                          <option value={selectedRoute?.fromLocation || ''}>
                            {selectedRoute?.fromLocation} (Starting Point)
                          </option>
                          {selectedRoute?.pickupLocations.map((location, idx) => (
                            <option key={idx} value={location}>
                              {location}
                            </option>
                          ))}
                        </select>
                        {formData.pickupLocation && (
                          <div className="mt-2 flex items-center gap-2 text-sm text-sky-600">
                            <MapPin className="w-4 h-4" />
                            <span>Selected: {formData.pickupLocation}</span>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>

                  {/* Available Buses */}
                  <div>
                    <h3 className="text-lg font-semibold mb-4">Available Buses</h3>
                    {buses.length === 0 ? (
                      <Card>
                        <CardContent className="text-center py-8">
                          <p className="text-gray-500">No buses available on this route</p>
                        </CardContent>
                      </Card>
                    ) : (
                      <div className="space-y-4">
                        {buses.map((bus) => (
                          <Card
                            key={bus._id}
                            className={`cursor-pointer transition-all ${formData.busId === bus._id
                                ? 'ring-2 ring-sky-500 shadow-lg'
                                : 'hover:shadow-md'
                              }`}
                            onClick={() => setFormData({ ...formData, busId: bus._id })}
                          >
                            <CardContent className="p-4">
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                  <div className="w-12 h-12 bg-sky-100 rounded-lg flex items-center justify-center">
                                    <Bus className="w-6 h-6 text-sky-600" />
                                  </div>
                                  <div>
                                    <h4 className="font-semibold text-lg">{bus.busNumber}</h4>
                                    <div className="flex items-center gap-4 text-sm text-gray-600">
                                      <span className="flex items-center gap-1">
                                        <Users className="w-4 h-4" />
                                        {bus.capacity} seats
                                      </span>
                                      <Badge variant={
                                        bus.type === 'luxury' ? 'default' :
                                          bus.type === 'semi_luxury' ? 'secondary' : 'outline'
                                      }>
                                        {bus.type.replace('_', ' ')}
                                      </Badge>
                                    </div>
                                  </div>
                                </div>
                                <div className="text-right">
                                  {formData.busId === bus._id && (
                                    <CheckCircle className="w-6 h-6 text-sky-500" />
                                  )}
                                </div>
                              </div>
                              {bus.amenities.length > 0 && (
                                <div className="flex flex-wrap gap-1 mt-3">
                                  {bus.amenities.map((amenity, idx) => (
                                    <Badge key={idx} variant="outline" className="text-xs">
                                      {amenity}
                                    </Badge>
                                  ))}
                                </div>
                              )}
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                <div>
                  <Card className="sticky top-24">
                    <CardHeader>
                      <CardTitle>Selection Summary</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div>
                        <p className="text-sm text-gray-600">Route</p>
                        <p className="font-medium">
                          {selectedRoute?.fromLocation} → {selectedRoute?.toLocation}
                        </p>
                      </div>
                      {formData.busId && (
                        <div>
                          <p className="text-sm text-gray-600">Selected Bus</p>
                          <p className="font-medium">
                            {buses.find(b => b._id === formData.busId)?.busNumber}
                          </p>
                        </div>
                      )}
                      {formData.travelDate && (
                        <div>
                          <p className="text-sm text-gray-600">Travel Date</p>
                          <p className="font-medium">{formData.travelDate}</p>
                        </div>
                      )}
                      {formData.pickupLocation && (
                        <div>
                          <p className="text-sm text-gray-600">Pickup Location</p>
                          <p className="font-medium">{formData.pickupLocation}</p>
                        </div>
                      )}
                      <div>
                        <p className="text-sm text-gray-600">Passengers</p>
                        <p className="font-medium">{formData.passengers}</p>
                      </div>
                      <div className="pt-4">
                        <Button
                          onClick={handleBusAndDateSelect}
                          disabled={!formData.busId || !formData.travelDate || !formData.pickupLocation}
                          className="w-full"
                        >
                          Continue to Seat Selection
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </motion.div>
          )}

          {/* Step 3: Select Seats */}
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
                <h2 className="text-2xl font-bold text-gray-800 mb-2">Select Your Seats</h2>
                <p className="text-gray-600">
                  Bus: {selectedBus?.busNumber} | Date: {formData.travelDate} | Passengers: {formData.passengers}
                </p>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2">
                  <Card>
                    <CardHeader>
                      <CardTitle>Seat Layout - {selectedBus?.busNumber}</CardTitle>
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
                  <Card>
                    <CardHeader>
                      <CardTitle>Booking Summary</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div>
                        <p className="text-sm text-gray-600">Selected Seats</p>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {formData.seatNumbers.length > 0 ? (
                            formData.seatNumbers.map(seat => (
                              <Badge key={seat} variant="secondary">
                                Seat {seat}
                              </Badge>
                            ))
                          ) : (
                            <p className="text-sm text-gray-500">
                              Select {formData.passengers} seat{formData.passengers > 1 ? 's' : ''}
                            </p>
                          )}
                        </div>
                      </div>

                      <div>
                        <p className="text-sm text-gray-600">Pickup Location</p>
                        <p className="font-medium flex items-center gap-1">
                          <MapPin className="w-4 h-4 text-sky-500" />
                          {formData.pickupLocation}
                        </p>
                      </div>

                      <div>
                        <p className="text-sm text-gray-600">Price per seat</p>
                        <p className="font-bold">LKR: {selectedRoute?.price}/=</p>
                      </div>

                      <div className="pt-4 border-t">
                        <p className="text-sm text-gray-600">Total Amount</p>
                        <p className="text-2xl font-bold text-sky-600">
                          LKR: {getTotalAmount()}/=
                        </p>
                      </div>

                      <Button
                        onClick={() => setCurrentStep(4)}
                        disabled={formData.seatNumbers.length !== formData.passengers}
                        className="w-full"
                      >
                        {formData.seatNumbers.length !== formData.passengers
                          ? `Select ${formData.passengers - formData.seatNumbers.length} more seat(s)`
                          : 'Continue to Details'
                        }
                      </Button>
                    </CardContent>
                  </Card>
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
              transition={{ duration: 0.3 }}
            >
              <div className="mb-8">
                <h2 className="text-2xl font-bold text-gray-800 mb-2">Passenger Details</h2>
                <p className="text-gray-600">Please provide your contact information</p>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2">
                  <Card>
                    <CardContent className="pt-6">
                      <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                          <Label>Full Name *</Label>
                          <div className="relative">
                            <User className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                            <Input
                              required
                              value={formData.passengerName}
                              onChange={(e) => setFormData({ ...formData, passengerName: e.target.value })}
                              placeholder="Enter your full name"
                              className="pl-10"
                            />
                          </div>
                        </div>

                        <div>
                          <Label>Phone Number *</Label>
                          <div className="relative">
                            <Phone className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                            <Input
                              required
                              value={formData.passengerPhone}
                              onChange={(e) => setFormData({ ...formData, passengerPhone: e.target.value })}
                              placeholder="+94 71 234 5678"
                              className="pl-10"
                            />
                          </div>
                        </div>

                        <div>
                          <Label>Email (Optional)</Label>
                          <div className="relative">
                            <Mail className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                            <Input
                              type="email"
                              value={formData.passengerEmail}
                              onChange={(e) => setFormData({ ...formData, passengerEmail: e.target.value })}
                              placeholder="your@email.com"
                              className="pl-10"
                            />
                          </div>
                        </div>

                        <Button
                          type="submit"
                          disabled={loading || !formData.passengerName || !formData.passengerPhone}
                          className="w-full"
                        >
                          {loading ? (
                            <>
                              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                              Processing...
                            </>
                          ) : (
                            'Confirm Booking'
                          )}
                        </Button>
                      </form>
                    </CardContent>
                  </Card>
                </div>

                <div>
                  <Card>
                    <CardHeader>
                      <CardTitle>Booking Details</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3 text-sm">
                      <div>
                        <p className="text-gray-600">Route</p>
                        <p className="font-medium">
                          {selectedRoute?.fromLocation} → {selectedRoute?.toLocation}
                        </p>
                      </div>
                      <div>
                        <p className="text-gray-600">Bus</p>
                        <p className="font-medium">{selectedBus?.busNumber}</p>
                      </div>
                      <div>
                        <p className="text-gray-600">Travel Date</p>
                        <p className="font-medium">{formData.travelDate}</p>
                      </div>
                      <div>
                        <p className="text-gray-600">Pickup Location</p>
                        <p className="font-medium">{formData.pickupLocation}</p>
                      </div>
                      <div>
                        <p className="text-gray-600">Seats</p>
                        <p className="font-medium">{formData.seatNumbers.join(', ')}</p>
                      </div>
                      <div className="pt-3 border-t">
                        <p className="text-gray-600">Total Amount</p>
                        <p className="text-xl font-bold text-sky-600">LKR: {getTotalAmount()}/=</p>
                      </div>
                    </CardContent>
                  </Card>

                  <div className="mt-4 p-4 bg-amber-50 rounded-lg">
                    <div className="flex gap-2">
                      <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0" />
                      <div className="text-sm text-amber-800">
                        <p className="font-medium mb-1">Important</p>
                        <ul className="space-y-1">
                          <li>• Please arrive 15 minutes before departure</li>
                          <li>• Carry a valid ID for verification</li>
                          <li>• Save your booking ID for reference</li>
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