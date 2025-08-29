import Image from 'next/image';
import { MapPin, Clock, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';

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
      features: ["AC", "WiFi", "Entertainment"]
    },
    {
      from: "Colombo",
      to: "Trincomalee",
      duration: "2h 45m",
      price: "Rs. 1850",
      rating: 4.7,
      trips: "15 daily trips",
      image: "/galle.jpg",
      features: ["AC", "WiFi", "Refreshments"]
    }
  ];

  return (
    <section className="py-10 bg-white">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h1 className="text-3xl md:text-5xl font-bold text-accent mb-4">
            Most Popular Routes
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Discover Sri Lanka's most traveled routes with comfortable buses 
            and unbeatable prices. Book your journey today!
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:px-28">
          {routes.map((route, index) => (
            <div 
              key={index}
              className="bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300"
            >
              {/* Route Image */}
              <div className="relative h-56">
                <Image
                  src={route.image}
                  alt={`${route.from} to ${route.to}`}
                  fill
                  className="object-cover"
                />
                <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm rounded-full px-3 py-1 flex items-center space-x-1">
                  <Star className="w-4 h-4 text-yellow-400 fill-current" />
                  <span className="text-sm font-medium">{route.rating}</span>
                </div>
              </div>

              {/* Route Details */}
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-bold text-gray-800">
                      {route.from} → {route.to}
                    </h3>
                    <p className="text-sm text-gray-600">{route.trips}</p>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-primary">{route.price}</div>
                    <div className="text-sm text-gray-500">per person</div>
                  </div>
                </div>

                <div className="flex items-center space-x-4 mb-4 text-sm text-gray-600">
                  <div className="flex items-center">
                    <Clock className="w-4 h-4 mr-1" />
                    {route.duration}
                  </div>
                  <div className="flex items-center">
                    <MapPin className="w-4 h-4 mr-1" />
                    Direct
                  </div>
                </div>

                {/* Features */}
                <div className="flex flex-wrap gap-1 mb-4">
                  {route.features.map((feature, idx) => (
                    <span 
                      key={idx}
                      className="px-2 py-1 bg-sidebar text-black text-xs rounded-full"
                    >
                      {feature}
                    </span>
                  ))}
                </div>

                <Button className="w-full bg-primary text-white rounded-full">
                  Book Now
                </Button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default PopularRoutesSection;