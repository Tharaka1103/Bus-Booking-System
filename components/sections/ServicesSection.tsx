import Image from 'next/image';
import { Bus, Shield, Snowflake } from 'lucide-react';

const ServicesSection = () => {
  const services = [
    {
      icon: <Bus className="w-8 h-8 text-blue-600" />,
      title: "Luxury Buses",
      description: "Modern, comfortable buses with reclining seats and ample legroom for the ultimate travel experience",
      image: "/businside.jpg" // Add luxury bus interior image
    },
    {
      icon: <Shield className="w-8 h-8 text-blue-600" />,
      title: "Safe Travel",
      description: "Experienced drivers and regular vehicle maintenance for your safety with 24/7 monitoring systems",
      image: "/safety.jpg" // Add safety/driver image
    },
    {
      icon: <Snowflake className="w-8 h-8 text-blue-600" />,
      title: "Air Conditioning",
      description: "Climate-controlled environment for comfortable travel in all weather conditions",
      image: "/ac.jpg" // Add AC/comfort image
    }
  ];

  return (
    <section className="py-16 lg:py-24 bg-white" id="services">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h1 className="text-3xl md:text-5xl text-accent font-bold mb-4">
            Our Premium Services
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Experience world-class amenities and services designed to make your 
            journey across Sri Lanka comfortable and memorable.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {services.map((service, index) => (
            <div 
              key={index}
              className="group bg-white shadow-lg rounded-2xl overflow-hidden hover:shadow-xl transition-all duration-500 transform hover:-translate-y-2"
            >
              {/* Service Image */}
              <div className="relative h-48 w-full overflow-hidden">
                <Image
                  src={service.image}
                  alt={service.title}
                  fill
                  className="object-cover transition-transform duration-500 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
                
              </div>

              {/* Service Content */}
              <div className="p-6">
                <h3 className="text-xl font-bold text-gray-800 mb-3 group-hover:text-primary transition-colors duration-300">
                  {service.title}
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  {service.description}
                </p>
                
                {/* Learn More Button */}
                <div className="mt-4">
                  <button className="text-primary font-semibold hover:text-secondary transition-colors duration-200 group-hover:underline">
                    Learn More →
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Additional CTA Section */}
        <div className="text-center mt-16">
          <div className="bg-accent rounded-2xl p-8 max-w-4xl mx-auto">
            <h3 className="text-2xl font-bold text-gray-800 mb-4">
              Ready to Experience Premium Travel?
            </h3>
            <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
              Book your journey today and enjoy our world-class services that make 
              every trip a comfortable and safe experience.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button className="bg-primary hover:secondary text-white px-8 py-3 cursor-pointer rounded-full font-semibold transition-all duration-200 transform hover:scale-105 shadow-md hover:shadow-lg">
                Book Your Trip
              </button>
              <button className="border-2 border-primary text-primary bg-white cursor-pointer px-8 py-3 rounded-full font-semibold transition-all duration-200 hover:scale-105">
                View All Routes
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ServicesSection;