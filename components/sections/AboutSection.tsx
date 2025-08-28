import Image from 'next/image';
import { CheckCircle, Award, Users, Clock } from 'lucide-react';

const AboutSection = () => {
  const features = [
    {
      icon: <Award className="w-6 h-6 text-blue-600" />,
      title: "25+ Years Experience",
      description: "Serving Sri Lanka with excellence since 1995"
    },
    {
      icon: <Users className="w-6 h-6 text-blue-600" />,
      title: "1M+ Happy Customers",
      description: "Trusted by millions of passengers nationwide"
    },
    {
      icon: <CheckCircle className="w-6 h-6 text-blue-600" />,
      title: "100% Safety Record",
      description: "Maintaining highest safety standards"
    },
    {
      icon: <Clock className="w-6 h-6 text-blue-600" />,
      title: "24/7 Service",
      description: "Round-the-clock customer support"
    }
  ];

  return (
    <section className="py-20 bg-white md:px-20">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Content */}
          <div className='image-bg'>
            <h1 className="text-3xl md:text-5xl text-accent mb-6">
              About Vijitha Travels
            </h1>
            <p className="text-lg text-black mb-6 leading-relaxed">
              Founded in 1995, Vijitha Travels has been Sri Lanka's premier bus service provider, 
              connecting cities and towns across the beautiful island nation. We pride ourselves 
              on delivering safe, comfortable, and reliable transportation services to over a 
              million passengers annually.
            </p>
            <p className="text-lg text-black mb-8 leading-relaxed">
              Our modern fleet of buses and experienced drivers ensure that your journey is not 
              just a means of transportation, but a comfortable experience that showcases the 
              beauty of Sri Lanka.
            </p>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {features.map((feature, index) => (
                <div key={index} className="flex items-start space-x-3">
                  <div className="flex-shrink-0 mt-1">
                    {feature.icon}
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-800 mb-1">
                      {feature.title}
                    </h4>
                    <p className="text-sm text-gray-600">
                      {feature.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Image */}
          <div className="relative image-bg">
            <div className="relative h-96 lg:h-[500px] rounded-2xl overflow-hidden">
              <Image
                src="/bg.jpg" // Add an image of your buses or team
                alt="Vijitha Travels bus and team"
                fill
                className="object-cover z-10"
              />
            </div>
            {/* Decorative elements */}
            <div className="absolute -top-12 -right-12 w-48 h-48 bg-accent rounded-full"></div>
            <div className="absolute -bottom-12 -left-12 w-48 h-48 bg-sidebar rounded-full"></div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default AboutSection;