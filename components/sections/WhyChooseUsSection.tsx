import { Shield, Clock, DollarSign, Headphones, Award, Users } from 'lucide-react';

const WhyChooseUsSection = () => {
  const reasons = [
    {
      icon: <Shield className="w-12 h-12 text-primary" />,
      title: "Safety First",
      description: "Our top priority is your safety. All our buses undergo regular maintenance and our drivers are thoroughly trained and experienced."
    },
    {
      icon: <Clock className="w-12 h-12 text-primary" />,
      title: "On-Time Guarantee",
      description: "We value your time. Our buses follow strict schedules and we guarantee punctual departures and arrivals."
    },
    {
      icon: <DollarSign className="w-12 h-12 text-primary" />,
      title: "Best Prices",
      description: "Enjoy competitive pricing without compromising on quality. We offer the best value for money in Sri Lanka."
    },
    {
      icon: <Headphones className="w-12 h-12 text-primary" />,
      title: "24/7 Support",
      description: "Our customer service team is available round the clock to assist you with bookings, queries, and support."
    },
    {
      icon: <Award className="w-12 h-12 text-primary" />,
      title: "Award Winning",
      description: "Recognized as Sri Lanka's best bus service provider for three consecutive years by the National Transport Board."
    },
    {
      icon: <Users className="w-12 h-12 text-primary" />,
      title: "Trusted by Millions",
      description: "Over 1 million satisfied customers have chosen us for their travel needs. Join our family of happy travelers."
    }
  ];

  return (
    <section className="py-10 bg-white px-1 md:px-10">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h1 className="text-3xl md:text-5xl font-bold text-accent mb-4">
            Why Choose Vijitha Travels?
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            We're not just a bus service - we're your travel partner committed to 
            making every journey safe, comfortable, and memorable.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {reasons.map((reason, index) => (
            <div 
              key={index}
              className="group text-center p-8 rounded-2xl image-bg hover:bg-gray-50 transition-all duration-300"
            >
              <div className="flex justify-center mb-6">
                <div className="p-4 bg-blue-50 rounded-2xl group-hover:bg-blue-100 transition-colors">
                  {reason.icon}
                </div>
              </div>
              <h3 className="text-xl font-semibold text-gray-800 mb-4">
                {reason.title}
              </h3>
              <p className="text-gray-600 leading-relaxed">
                {reason.description}
              </p>
            </div>
          ))}
        </div>

        {/* CTA Section */}
        <div className="mt-16 text-center">
          <div className="bg-accent rounded-2xl p-8 text-white">
            <h3 className="text-2xl font-bold mb-4">
              Ready to Experience the Difference?
            </h3>
            <p className="text-lg mb-6 opacity-90">
              Join thousands of satisfied customers who trust Vijitha Travels for their journey
            </p>
            <div className="flex flex-col  sm:flex-row gap-4 justify-center">
              <button className="bg-primary hover:scale-105 text-white rounded-full px-8 py-3 font-semibold transition-colors cursor-pointer">
                Book Your Trip
              </button>
              <button className="border hover:scale-105 border-primary text-primary rounded-full bg-white hover:text-primary px-8 py-3 font-semibold transition-colors cursor-pointer">
                Contact Us
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default WhyChooseUsSection;