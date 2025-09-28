'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { MapPin, Clock, Star, ArrowRight, Zap, Shield, Wifi, Coffee, Car, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { IRoute } from '@/types';

const PopularRoutesSection = () => {
  const [routes, setRoutes] = useState<IRoute[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRecentRoutes();
  }, []);

  const fetchRecentRoutes = async () => {
    try {
      const response = await fetch('/api/routes');
      const data = await response.json();
      if (data.success) {
        // Get the 4 most recent active routes
        const recentRoutes = data.data
          .filter((route: IRoute) => route.isActive)
          .sort((a: IRoute, b: IRoute) => new Date(b.createdAt || '').getTime() - new Date(a.createdAt || '').getTime())
          .slice(0, 4);
        setRoutes(recentRoutes);
      }
    } catch (error) {
      console.error('Error fetching routes:', error);
    } finally {
      setLoading(false);
    }
  };

  // Function to get random route image
  const getRouteImage = (index: number) => {
    const images = ["/habarana.jpg", "/galle.jpg", "/habarana.jpg", "/galle.jpg"];
    return images[index % images.length];
  };

  // Function to generate random price based on distance
  const generatePrice = (distance: number) => {
    const basePrice = 50; // Base price per km
    const price = Math.round((distance * basePrice) / 10) * 10; // Round to nearest 10
    return `Rs. ${price.toLocaleString()}`;
  };

  // Function to generate random rating
  const generateRating = () => {
    return (4.5 + Math.random() * 0.4).toFixed(1);
  };

  // Function to get random features
  const getFeatures = (index: number) => {
    const allFeatures = [
      ["AC", "WiFi", "Entertainment"],
      ["AC", "WiFi", "Refreshments"],
      ["AC", "Entertainment", "USB Charging"],
      ["WiFi", "Refreshments", "Premium Seats"]
    ];
    return allFeatures[index % allFeatures.length];
  };

  if (loading) {
    return (
      <section className="py-16 lg:py-24 bg-gradient-to-br from-gray-50 via-white to-blue-50">
        <div className="container mx-auto px-4">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
            <p className="text-gray-600 mt-4">Loading routes...</p>
          </div>
        </div>
      </section>
    );
  }

  if (routes.length === 0) {
    return (
      <section className="py-16 lg:py-24 bg-gradient-to-br from-gray-50 via-white to-blue-50">
        <div className="container mx-auto px-4">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-gray-800 mb-4">No Routes Available</h2>
            <p className="text-gray-600">Check back later for available routes.</p>
          </div>
        </div>
      </section>
    );
  }

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
          <h1 className="text-3xl md:text-6xl font-bold bg-black bg-clip-text text-transparent mb-6">
            Journey in <span className='text-accent'>Luxury</span> & <span className='text-accent'>Style</span>
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            Experience Sri Lanka's premium bus travel with world-class comfort,
            stunning routes, and unmatched hospitality
          </p>
        </div>

        {/* Routes Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-2 gap-8 xl:gap-12">
          {routes.map((route, index) => {
            const features = getFeatures(index);
            const rating = generateRating();
            const price = generatePrice(route.distance);
            const image = getRouteImage(index);

            return (
              <div key={route._id} className="group relative">
                {/* Main Card */}
                <div className="relative bg-white rounded-3xl overflow-hidden shadow-2xl hover:shadow-4xl transition-all duration-700 transform hover:-translate-y-2 border border-gray-100">

                  {/* Card Content */}
                  <div className="p-8">
                    <div className="flex items-center justify-between mb-6">
                      <div>
                        <h3 className="text-2xl font-bold text-gray-800 mb-2">
                          {route.fromLocation} → {route.toLocation}
                        </h3>
                        <div className="flex items-center space-x-4 text-gray-600">
                          <div className="flex items-center">
                            <Clock className="w-4 h-4 mr-2" />
                            {Math.floor(route.duration / 60)}h {route.duration % 60}m
                          </div>
                          <div className="flex items-center">
                            <MapPin className="w-4 h-4 mr-2" />
                            {route.name}
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-bold bg-primary bg-clip-text text-transparent">
                          {price}
                        </div>
                        <div className="text-sm text-gray-500">per person</div>
                      </div>
                    </div>

                    {/* Pickup Locations */}
                    {route.pickupLocations && route.pickupLocations.length > 0 && (
                      <div className="mb-6">
                        <p className="text-sm text-gray-600 mb-2">Pickup Locations:</p>
                        <div className="flex flex-wrap gap-2">
                          {route.pickupLocations.slice(0, 3).map((location, idx) => (
                            <span
                              key={idx}
                              className="px-3 py-1 bg-gray-100 text-gray-700 text-xs rounded-full border"
                            >
                              {location}
                            </span>
                          ))}
                          {route.pickupLocations.length > 3 && (
                            <span className="px-3 py-1 bg-gray-100 text-gray-600 text-xs rounded-full border">
                              +{route.pickupLocations.length - 3} more
                            </span>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Features */}
                    <div className="flex flex-wrap gap-2 mb-6">
                      {features.map((feature, idx) => (
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
            );
          })}
        </div>

        {/* View All Routes Button */}
        <div className="text-center mt-16">
          <Link href="/routes">
            <Button 
              variant="outline" 
              className="px-8 py-4 text-lg font-semibold rounded-2xl border-2 border-primary text-primary hover:bg-primary hover:text-white transition-all duration-300"
            >
              View All Routes
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
};

export default PopularRoutesSection;