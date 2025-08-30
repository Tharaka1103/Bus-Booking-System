import Image from 'next/image';
import { MapPin, Clock, Star, ArrowRight, Zap, Shield, Wifi, Coffee, Car, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

const PopularRoutesSection = () => {
  const routes = [
    {
      from: "Colombo",
      to: "Kaduruwela",
      duration: "3h 30m",
      price: "Rs. 1350",
      rating: 4.8,
      trips: "12 daily trips",
      image: "/habarana.jpg",
      features: ["AC", "WiFi", "Entertainment"],
      highlights: ["Scenic Mountain Views", "Express Service", "Premium Comfort"],
      passengers: "2.3k+ travelers this month",
      savings: "Save 25%"
    },
    {
      from: "Colombo",
      to: "Trincomalee",
      duration: "2h 45m",
      price: "Rs. 1850",
      rating: 4.7,
      trips: "15 daily trips",
      image: "/galle.jpg",
      features: ["AC", "WiFi", "Refreshments"],
      highlights: ["Coastal Highway", "Luxury Seats", "Onboard Service"],
      passengers: "1.8k+ travelers this month",
      savings: "Save 30%"
    }
  ];

  return (
    <section className="py-16 lg:py-24 bg-gradient-to-br from-gray-50 via-white to-blue-50 relative overflow-hidden" id="routes">
      {/* Background Elements */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-20 left-10 w-72 h-72 bg-primary rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-accent rounded-full blur-3xl"></div>
      </div>

      <div className="container mx-auto px-4 relative z-10">
        {/* Header */}
        <div className="text-center mb-20">
          <div className="inline-block">
          </div>
          <h1 className="text-3xl md:text-6xl font-bold bg-black bg-clip-text text-transparent mb-6">
            Journey in <span className='text-accent'>Luxury</span> & <span className='text-accent'>Style</span>
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            Experience Sri Lanka's premium bus travel with world-class comfort,
            stunning routes, and unmatched hospitality
          </p>
        </div>

        {/* Routes - Hidden on mobile */}
        <div className="block">
          <div className="flex flex-col lg:flex-row gap-8 xl:gap-12">
            {routes.map((route, index) => (
              <div
                key={index}
                className="flex-1"
              >
                {/* Route Card */}
                <div className="group relative">
                  {/* Main Card */}
                  <div className="relative bg-white rounded-3xl overflow-hidden shadow-2xl hover:shadow-4xl transition-all duration-700 transform hover:-translate-y-2 border border-gray-100">

                    {/* Rating Badge */}
                    <div className="absolute top-6 right-6 z-20">
                      <div className="bg-white/95 backdrop-blur-md rounded-full px-4 py-2 flex items-center space-x-2 shadow-lg">
                        <Star className="w-5 h-5 text-yellow-500 fill-current" />
                        <span className="font-bold text-gray-800">{route.rating}</span>
                      </div>
                    </div>

                    {/* Route Image */}
                    <div className="relative h-80 overflow-hidden">
                      <Image
                        src={route.image}
                        alt={`${route.from} to ${route.to}`}
                        fill
                        className="object-cover transform group-hover:scale-110 transition-transform duration-700"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent"></div>

                      {/* Floating Elements */}
                      <div className="absolute bottom-6 left-6 right-6">
                        <div className="bg-transparent backdrop-blur-xs rounded-2xl p-4 border border-white/30">
                          <div className="flex items-center justify-between text-white">
                            <div>
                              <p className="text-sm opacity-90">{route.trips}</p>
                              <p className="text-xs opacity-75">{route.passengers}</p>
                            </div>
                            <div className="flex space-x-2">
                              {route.features.slice(0, 3).map((feature, idx) => (
                                <div key={idx} className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                                  {feature === 'AC' && <Zap className="w-4 h-4" />}
                                  {feature === 'WiFi' && <Wifi className="w-4 h-4" />}
                                  {feature === 'Entertainment' && <Coffee className="w-4 h-4" />}
                                  {feature === 'Refreshments' && <Coffee className="w-4 h-4" />}
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Card Content */}
                    <div className="p-8">
                      <div className="flex items-center justify-between mb-6">
                        <div>
                          <h3 className="text-2xl font-bold text-gray-800 mb-2">
                            {route.from} → {route.to}
                          </h3>
                          <div className="flex items-center space-x-4 text-gray-600">
                            <div className="flex items-center">
                              <Clock className="w-4 h-4 mr-2" />
                              {route.duration}
                            </div>
                            <div className="flex items-center">
                              <MapPin className="w-4 h-4 mr-2" />
                              Direct Route
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-2xl font-bold bg-primary bg-clip-text text-transparent">
                            {route.price}
                          </div>
                          <div className="text-sm text-gray-500">per person</div>
                        </div>
                      </div>

                      {/* Features */}
                      <div className="flex flex-wrap gap-2 mb-6">
                        {route.features.map((feature, idx) => (
                          <span
                            key={idx}
                            className="px-4 py-2 bg-gradient-to-r from-sidebar/80 to-sidebar text-gray-700 text-sm rounded-full font-medium border border-gray-200"
                          >
                            {feature}
                          </span>
                        ))}
                      </div>

                      <Link href='/booking'>
                      <Button className="w-full bg-primary hover:from-accent hover:to-primary text-white rounded-2xl py-4 text-lg font-semibold transition-all duration-300 shadow-lg hover:shadow-xl group">
                        Book Your Journey
                        <ArrowRight className="w-5 h-5 ml-2 transform group-hover:translate-x-1 transition-transform" />
                      </Button>
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default PopularRoutesSection;