import { MapPin, Phone, Mail, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

const ContactSection = () => {
  return (
    <section className="py-16 lg:py-24 bg-white " id="contact">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h1 className="text-3xl md:text-5xl font-bold text-accent mb-4">
            Get in Touch
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Have questions or need assistance? Our friendly team is ready to help 
            you plan your perfect journey.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Contact Info */}
          <div>
            <h3 className="text-3xl font-bold text-gray-800 mb-8">
              Contact Information
            </h3>
            
            <div className="space-y-6">
              <div className="flex items-start space-x-4">
                <div className="flex-shrink-0 w-12 h-12 bg-accent rounded-lg flex items-center justify-center">
                  <MapPin className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h4 className="font-semibold text-gray-800 mb-1">Head Office</h4>
                  <p className="text-gray-600">
                    123 Main Street, Colombo 07<br />
                    Sri Lanka
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <div className="flex-shrink-0 w-12 h-12 bg-accent rounded-lg flex items-center justify-center">
                  <Phone className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h4 className="font-semibold text-gray-800 mb-1">Phone Numbers</h4>
                  <p className="text-gray-600">
                    Hotline: +94 11 234 5678<br />
                    Mobile: +94 77 123 4567
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <div className="flex-shrink-0 w-12 h-12 bg-accent rounded-lg flex items-center justify-center">
                  <Mail className="w-6 h-6 primary" />
                </div>
                <div>
                  <h4 className="font-semibold text-gray-800 mb-1">Email</h4>
                  <p className="text-gray-600">
                    info@Wijithatravels.lk<br />
                    support@Wijithatravels.lk
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <div className="flex-shrink-0 w-12 h-12 bg-accent rounded-lg flex items-center justify-center">
                  <Clock className="w-6 h-6 primary" />
                </div>
                <div>
                  <h4 className="font-semibold text-gray-800 mb-1">Office Hours</h4>
                  <p className="text-gray-600">
                    Monday - Saturday: 6:00 AM - 10:00 PM<br />
                    Sunday: 7:00 AM - 9:00 PM
                  </p>
                </div>
              </div>
            </div>

            {/* Map placeholder */}
            <div className="mt-8 h-64 bg-gray-200 rounded-lg flex items-center justify-center">
              <p className="text-gray-500">Interactive Map Coming Soon</p>
            </div>
          </div>

          {/* Contact Form */}
          <div className=''>
            <h3 className="text-3xl font-bold text-gray-800 mb-8">
              Send us a Message
            </h3>
            
            <form className="space-y-6 bg-accent rounded-3xl p-10">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-medium text-white text-lg mb-2">
                    First Name
                  </label>
                  <Input placeholder="Your first name" className=' border border-primary' />
                </div>
                <div>
                  <label className="block font-medium text-white text-lg mb-2">
                    Last Name
                  </label>
                  <Input placeholder="Your last name" className=' border border-primary' />
                </div>
              </div>

              <div>
                <label className="block font-medium text-white text-lg mb-2">
                  Email Address
                </label>
                <Input type="email" placeholder="your.email@example.com" className=' border border-primary' />
              </div>

              <div>
                <label className="block font-medium text-white text-lg mb-2">
                  Phone Number
                </label>
                <Input placeholder="+94 XX XXX XXXX" className=' border border-primary' />
              </div>

              <div>
                <label className="block font-medium text-white text-lg mb-2">
                  Subject
                </label>
                <select className="w-full h-10 px-3 border border-primary rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500">
                  <option value="">Select a subject</option>
                  <option value="booking">Booking Inquiry</option>
                  <option value="complaint">Complaint</option>
                  <option value="suggestion">Suggestion</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <div>
                <label className="block font-medium text-white text-lg mb-2">
                  Message
                </label>
                <textarea 
                  rows={5}
                  className="w-full px-3 py-2 border border-primary rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Tell us how we can help you..."
                ></textarea>
              </div>

              <Button className="w-full rounded-full bg-primary text-white h-12">
                Send Message
              </Button>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ContactSection;