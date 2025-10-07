'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { MapPin, Clock, ArrowRight, Users, Calendar, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { IRoute } from '@/types';

const PopularRoutesSection = () => {
  const router = useRouter();
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
        const recentRoutes = data.data
          .filter((route: IRoute) => route.isActive)
          .sort((a: IRoute, b: IRoute) => 
            new Date(b.createdAt || '').getTime() - new Date(a.createdAt || '').getTime()
          )
          .slice(0, 4);
        setRoutes(recentRoutes);
      }
    } catch (error) {
      console.error('Error fetching routes:', error);
    } finally {
      setLoading(false);
    }
  };

  const getRouteImage = (route: IRoute) => {
    const fromLocation = route.fromLocation.toLowerCase();
    const toLocation = route.toLocation.toLowerCase();

    if (fromLocation.includes('kaduruwela') || toLocation.includes('kaduruwela')) {
      return '/kaduruwela.webp';
    }
    if (fromLocation.includes('trincomalee') || toLocation.includes('trincomalee')) {
      return '/trincomalee.webp';
    }
    return '/habarana.jpg';
  };

  const handleBookRoute = (routeId: string) => {
    router.push(`/booking?routeId=${routeId}`);
  };

  if (loading) {
    return (
      <section className="py-12 sm:py-16 lg:py-24 bg-gradient-to-br from-gray-50 via-white to-blue-50">
        <div className="container mx-auto px-4">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
            <p className="text-gray-600 mt-4 text-sm sm:text-base">Loading routes...</p>
          </div>
        </div>
      </section>
    );
  }

  if (routes.length === 0) {
    return (
      <section className="py-12 sm:py-16 lg:py-24 bg-gradient-to-br from-gray-50 via-white to-blue-50">
        <div className="container mx-auto px-4">
          <div className="text-center">
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-4">No Routes Available</h2>
            <p className="text-gray-600 text-sm sm:text-base">Check back later for available routes.</p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-12 sm:py-16 lg:py-24 bg-gradient-to-br from-sky-50 via-white to-blue-50 relative overflow-hidden" id="routes">
      {/* Background Decorations */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-24 -right-24 w-72 h-72 sm:w-96 sm:h-96 bg-primary/5 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-24 -left-24 w-72 h-72 sm:w-96 sm:h-96 bg-blue-500/5 rounded-full blur-3xl"></div>
      </div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Header */}
        <div className="text-center mb-10 sm:mb-14 lg:mb-20">
          <div className="inline-block mb-3 sm:mb-4">
            <div className="flex items-center justify-center w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 bg-primary/10 rounded-xl sm:rounded-2xl">
              <Sparkles className="w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8 text-primary" />
            </div>
          </div>
          <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 mb-3 sm:mb-4 md:mb-6 px-4">
            Popular <span className="text-primary">Routes</span>
          </h2>
          <p className="text-base sm:text-lg md:text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed px-4">
            Choose from our most traveled routes and experience premium comfort
          </p>
        </div>

        {/* Routes Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6 sm:gap-8 lg:gap-10 mb-10 sm:mb-12 lg:mb-16">
          {routes.map((route) => {
            const routeImage = getRouteImage(route);

            return (
              <div
                key={route._id}
                className="group cursor-pointer"
                onClick={() => handleBookRoute(route._id)}
              >
                <Card className="overflow-hidden border-none shadow-xl hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 bg-white">
                  {/* Image Section */}
                  <div className="relative h-48 sm:h-56 md:h-64 lg:h-72 overflow-hidden">
                    <Image
                      src={routeImage}
                      alt={route.name}
                      fill
                      sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                      className="object-cover transition-transform duration-700 group-hover:scale-110"
                      quality={90}
                      priority={true}
                    />
                    {/* Gradient Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent"></div>
                    
                    {/* Route Title Overlay */}
                    <div className="absolute bottom-0 left-0 right-0 p-4 sm:p-5 md:p-6">
                      <h3 className="text-xl sm:text-2xl md:text-3xl font-bold text-white mb-1 sm:mb-2 drop-shadow-lg">
                        {route.fromLocation}
                      </h3>
                      <div className="flex items-center text-white/90 mb-2">
                        <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 mx-2" />
                        <span className="text-lg sm:text-xl md:text-2xl font-semibold drop-shadow-lg">
                          {route.toLocation}
                        </span>
                      </div>
                      <Badge className="bg-white/20 text-white border-white/30 backdrop-blur-sm text-xs sm:text-sm">
                        {route.name}
                      </Badge>
                    </div>

                    {/* Price Badge */}
                    <div className="absolute top-4 right-4">
                      <div className="bg-white rounded-full px-3 sm:px-4 py-2 shadow-lg">
                        <p className="text-xs text-gray-600 font-medium">Starting from</p>
                        <p className="text-lg sm:text-xl md:text-2xl font-bold text-primary">
                          LKR {route.price}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Content Section */}
                  <CardContent className="p-4 sm:p-5 md:p-6 space-y-4 sm:space-y-5">
                    {/* Route Info */}
                    <div className="grid grid-cols-2 gap-3 sm:gap-4">
                      <div className="flex items-center gap-2 text-gray-600">
                        <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg bg-sky-50 flex items-center justify-center flex-shrink-0">
                          <Clock className="w-4 h-4 sm:w-5 sm:h-5 text-sky-600" />
                        </div>
                        <div className="min-w-0">
                          <p className="text-xs text-gray-500">Duration</p>
                          <p className="text-sm sm:text-base font-semibold text-gray-800 truncate">
                            {Math.floor(route.duration / 60)}h {route.duration % 60}m
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 text-gray-600">
                        <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg bg-sky-50 flex items-center justify-center flex-shrink-0">
                          <MapPin className="w-4 h-4 sm:w-5 sm:h-5 text-sky-600" />
                        </div>
                        <div className="min-w-0">
                          <p className="text-xs text-gray-500">Distance</p>
                          <p className="text-sm sm:text-base font-semibold text-gray-800 truncate">
                            {route.distance} km
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Pickup Locations */}
                    {route.pickupLocations && route.pickupLocations.length > 0 && (
                      <div className="space-y-2">
                        <p className="text-xs sm:text-sm font-medium text-gray-700">
                          Pickup Points:
                        </p>
                        <div className="flex flex-wrap gap-1.5 sm:gap-2">
                          {route.pickupLocations.slice(0, 3).map((location, idx) => (
                            <Badge
                              key={idx}
                              variant="outline"
                              className="text-xs bg-gray-50 text-gray-700 border-gray-200"
                            >
                              {location}
                            </Badge>
                          ))}
                          {route.pickupLocations.length > 3 && (
                            <Badge
                              variant="outline"
                              className="text-xs bg-primary/5 text-primary border-primary/20"
                            >
                              +{route.pickupLocations.length - 3} more
                            </Badge>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Book Button */}
                    <Button 
                      className="w-full bg-primary hover:bg-primary/90 text-white rounded-xl py-5 sm:py-6 text-sm sm:text-base font-semibold shadow-lg hover:shadow-xl transition-all duration-300 group"
                      onClick={() => handleBookRoute(route._id)}
                    >
                      <Calendar className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
                      Book This Route
                      <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 ml-2 transform group-hover:translate-x-1 transition-transform" />
                    </Button>
                  </CardContent>
                </Card>
              </div>
            );
          })}
        </div>

        {/* View All Routes Button */}
        <div className="text-center px-4">
          <Link href="/routes">
            <Button 
              variant="outline" 
              size="lg"
              className="w-full sm:w-auto px-6 sm:px-8 py-4 sm:py-6 text-base sm:text-lg font-semibold rounded-xl sm:rounded-2xl border-2 border-primary text-primary hover:bg-primary hover:text-white transition-all duration-300 shadow-md hover:shadow-lg"
            >
              Explore All Routes
              <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 ml-2" />
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
};

export default PopularRoutesSection;