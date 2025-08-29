'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  User, 
  Settings, 
  Calendar, 
  MessageCircle, 
  Edit3, 
  Phone, 
  Mail, 
  MapPin, 
  Eye,
  EyeOff,
  Bus,
  Clock,
  CheckCircle,
  AlertCircle,
  Send,
  Shield,
  Bell,
  Camera,
  Save,
  Download,
  Filter
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface Booking {
  id: string;
  route: string;
  date: string;
  time: string;
  seats: string[];
  status: 'completed' | 'upcoming' | 'cancelled';
  price: number;
  busType: string;
  bookingDate: string;
}

interface Inquiry {
  id: string;
  subject: string;
  message: string;
  date: string;
  status: 'pending' | 'replied' | 'resolved';
  reply?: string;
}

const UserProfilePage = () => {
  const [activeSection, setActiveSection] = useState('overview');
  const [showPassword, setShowPassword] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [inquiryText, setInquiryText] = useState('');
  const [inquirySubject, setInquirySubject] = useState('');

  // Mock user data
  const [userData, setUserData] = useState({
    name: 'Kasun Perera',
    email: 'kasun.perera@email.com',
    phone: '+94 71 234 5678',
    address: 'No. 123, Galle Road, Colombo 03',
    dateOfBirth: '1990-05-15',
    nic: '199012345678',
    profileImage: '/user-avatar.jpg'
  });

  // Mock booking data
  const bookings: Booking[] = [
    {
      id: 'BK001',
      route: 'Colombo → Kandy',
      date: '2024-09-15',
      time: '08:00 AM',
      seats: ['12', '13'],
      status: 'upcoming',
      price: 2500,
      busType: 'AC Luxury',
      bookingDate: '2024-08-20'
    },
    {
      id: 'BK002',
      route: 'Kandy → Galle',
      date: '2024-08-10',
      time: '02:00 PM',
      seats: ['15'],
      status: 'completed',
      price: 1800,
      busType: 'Semi Luxury',
      bookingDate: '2024-08-05'
    },
    {
      id: 'BK003',
      route: 'Colombo → Trincomalee',
      date: '2024-08-25',
      time: '06:00 AM',
      seats: ['8'],
      status: 'cancelled',
      price: 3200,
      busType: 'AC Luxury',
      bookingDate: '2024-08-15'
    }
  ];

  // Mock inquiry data
  const [inquiries, setInquiries] = useState<Inquiry[]>([
    {
      id: 'INQ001',
      subject: 'Booking Cancellation',
      message: 'I need to cancel my booking for tomorrow due to emergency.',
      date: '2024-08-20',
      status: 'replied',
      reply: 'Your booking has been cancelled and refund will be processed within 3-5 business days.'
    },
    {
      id: 'INQ002',
      subject: 'Bus Timing Query',
      message: 'What are the available timings for Colombo to Jaffna route?',
      date: '2024-08-18',
      status: 'resolved'
    }
  ]);

  const sidebarItems = [
    { id: 'overview', label: 'Overview', icon: <User className="w-5 h-5" /> },
    { id: 'settings', label: 'Profile Settings', icon: <Settings className="w-5 h-5" /> },
    { id: 'bookings', label: 'My Bookings', icon: <Calendar className="w-5 h-5" /> },
    { id: 'inquiries', label: 'Inquiries', icon: <MessageCircle className="w-5 h-5" /> }
  ];

  const handleSubmitInquiry = () => {
    if (inquirySubject.trim() && inquiryText.trim()) {
      const newInquiry: Inquiry = {
        id: `INQ${Date.now()}`,
        subject: inquirySubject,
        message: inquiryText,
        date: new Date().toISOString().split('T')[0],
        status: 'pending'
      };
      setInquiries([newInquiry, ...inquiries]);
      setInquirySubject('');
      setInquiryText('');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'upcoming': return 'bg-blue-100 text-blue-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'replied': return 'bg-green-100 text-green-800';
      case 'resolved': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckCircle className="w-4 h-4" />;
      case 'upcoming': return <Clock className="w-4 h-4" />;
      case 'cancelled': return <AlertCircle className="w-4 h-4" />;
      default: return <Clock className="w-4 h-4" />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">


      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-xl sticky top-4 border-l-2 border-accent">
              <div className="p-0">
                {/* Profile Summary */}
                <div className="p-6 text-center border-b">
                  <div className="relative mx-auto w-20 h-20 mb-4">
                    <div className="w-20 h-20 bg-gray-200 rounded-full flex items-center justify-center">
                      <User className="w-10 h-10 text-gray-400" />
                    </div>
                    <button className="absolute bottom-0 right-0 bg-primary text-white p-1 rounded-full hover:bg-primary">
                      <Camera className="w-3 h-3" />
                    </button>
                  </div>
                  <h3 className="font-semibold text-gray-900">{userData.name}</h3>
                  <p className="text-sm text-gray-500">{userData.email}</p>
                </div>

                {/* Navigation */}
                <nav className="p-2">
                  {sidebarItems.map((item) => (
                    <button
                      key={item.id}
                      onClick={() => setActiveSection(item.id)}
                      className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-all duration-200 ${
                        activeSection === item.id
                          ? 'bg-primary text-white'
                          : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                      }`}
                    >
                      {item.icon}
                      <span className="font-medium">{item.label}</span>
                    </button>
                  ))}
                </nav>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            <AnimatePresence mode="wait">
              {/* Overview Section */}
              {activeSection === 'overview' && (
                <motion.div
                  key="overview"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3 }}
                  className="space-y-6"
                >
                  <div className="bg-white rounded-lg shadow-md">
                    <div className="p-6 border-b">
                      <h2 className="text-xl font-semibold flex items-center gap-2">
                        <User className="w-5 h-5 text-primary" />
                        Dashboard Overview
                      </h2>
                    </div>
                    <div className="p-6">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="bg-sky-500/30 p-6 rounded-lg">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="text-black">Total Bookings</p>
                              <p className="text-2xl text-black font-bold">{bookings.length}</p>
                            </div>
                            <Bus className="w-8 h-8 text-black" />
                          </div>
                        </div>
                        
                        <div className="bg-green-500/30 p-6 rounded-lg">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="">Completed Trips</p>
                              <p className="text-2xl font-bold">
                                {bookings.filter(b => b.status === 'completed').length}
                              </p>
                            </div>
                            <CheckCircle className="w-8 h-8 " />
                          </div>
                        </div>
                        
                        <div className="bg-yellow-500/30 p-6 rounded-lg">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="">Upcoming Trips</p>
                              <p className="text-2xl font-bold">
                                {bookings.filter(b => b.status === 'upcoming').length}
                              </p>
                            </div>
                            <Calendar className="w-8 h-8 " />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Recent Activity */}
                  <div className="bg-white rounded-lg shadow-md">
                    <div className="p-6 border-b">
                      <h2 className="text-xl font-semibold">Recent Activity</h2>
                    </div>
                    <div className="p-6">
                      <div className="space-y-4">
                        {bookings.slice(0, 3).map((booking) => (
                          <div key={booking.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                            <div className="flex items-center gap-3">
                              <Bus className="w-5 h-5 text-primary" />
                              <div>
                                <p className="font-medium">{booking.route}</p>
                                <p className="text-sm text-gray-500">{booking.date} • {booking.time}</p>
                              </div>
                            </div>
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(booking.status)}`}>
                              {booking.status}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Profile Settings Section */}
              {activeSection === 'settings' && (
                <motion.div
                  key="settings"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3 }}
                  className="space-y-6"
                >
                  <div className="bg-white rounded-lg shadow-md">
                    <div className="p-6 border-b">
                      <div className="flex items-center justify-between">
                        <h2 className="text-xl font-semibold flex items-center gap-2">
                          <Settings className="w-5 h-5 text-primary" />
                          Profile Settings
                        </h2>
                        <Button
                          variant={isEditing ? "default" : "outline"}
                          onClick={() => setIsEditing(!isEditing)}
                          className="flex items-center gap-2"
                        >
                          {isEditing ? <Save className="w-4 h-4" /> : <Edit3 className="w-4 h-4" />}
                          {isEditing ? 'Save Changes' : 'Edit Profile'}
                        </Button>
                      </div>
                    </div>
                    <div className="p-6 space-y-6">
                      {/* Profile Image */}
                      <div className="flex items-center gap-6">
                        <div className="relative w-24 h-24">
                          <div className="w-24 h-24 bg-gray-200 rounded-full flex items-center justify-center">
                            <User className="w-12 h-12 text-gray-400" />
                          </div>
                          {isEditing && (
                            <button className="absolute bottom-0 right-0 bg-primary text-white p-2 rounded-full hover:bg-primary">
                              <Camera className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                        {isEditing && (
                          <div>
                            <Button variant="outline" className="mb-2">Upload New Photo</Button>
                            <p className="text-xs text-gray-500">JPG, PNG or GIF. Max size 2MB</p>
                          </div>
                        )}
                      </div>

                      {/* Personal Information */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Full Name
                          </label>
                          <div className="relative">
                            <User className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                            <Input
                              value={userData.name}
                              onChange={(e) => setUserData({...userData, name: e.target.value})}
                              disabled={!isEditing}
                              className="pl-10"
                            />
                          </div>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Email Address
                          </label>
                          <div className="relative">
                            <Mail className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                            <Input
                              type="email"
                              value={userData.email}
                              onChange={(e) => setUserData({...userData, email: e.target.value})}
                              disabled={!isEditing}
                              className="pl-10"
                            />
                          </div>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Phone Number
                          </label>
                          <div className="relative">
                            <Phone className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                            <Input
                              value={userData.phone}
                              onChange={(e) => setUserData({...userData, phone: e.target.value})}
                              disabled={!isEditing}
                              className="pl-10"
                            />
                          </div>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Date of Birth
                          </label>
                          <Input
                            type="date"
                            value={userData.dateOfBirth}
                            onChange={(e) => setUserData({...userData, dateOfBirth: e.target.value})}
                            disabled={!isEditing}
                          />
                        </div>

                        <div className="md:col-span-2">
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Address
                          </label>
                          <div className="relative">
                            <MapPin className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                            <Input
                              value={userData.address}
                              onChange={(e) => setUserData({...userData, address: e.target.value})}
                              disabled={!isEditing}
                              className="pl-10"
                            />
                          </div>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            NIC Number
                          </label>
                          <Input
                            value={userData.nic}
                            onChange={(e) => setUserData({...userData, nic: e.target.value})}
                            disabled={!isEditing}
                          />
                        </div>
                      </div>

                      {/* Password Section */}
                      {isEditing && (
                        <div className="border-t pt-6">
                          <h3 className="text-lg font-semibold mb-4">Change Password</h3>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-2">
                                Current Password
                              </label>
                              <div className="relative">
                                <Shield className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                                <Input
                                  type={showPassword ? "text" : "password"}
                                  className="pl-10 pr-10"
                                />
                                <button
                                  type="button"
                                  onClick={() => setShowPassword(!showPassword)}
                                  className="absolute right-3 top-3 text-gray-400"
                                >
                                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                </button>
                              </div>
                            </div>

                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-2">
                                New Password
                              </label>
                              <div className="relative">
                                <Shield className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                                <Input
                                  type={showPassword ? "text" : "password"}
                                  className="pl-10"
                                />
                              </div>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Notification Settings */}
                  <div className="bg-white rounded-lg shadow-md">
                    <div className="p-6 border-b">
                      <h2 className="text-xl font-semibold flex items-center gap-2">
                        <Bell className="w-5 h-5 text-primary" />
                        Notification Preferences
                      </h2>
                    </div>
                    <div className="p-6 space-y-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium">Email Notifications</p>
                          <p className="text-sm text-gray-500">Receive booking confirmations and updates</p>
                        </div>
                        <input 
                          type="checkbox" 
                          className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded" 
                          defaultChecked 
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium">SMS Notifications</p>
                          <p className="text-sm text-gray-500">Get SMS alerts for important updates</p>
                        </div>
                        <input 
                          type="checkbox" 
                          className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded" 
                          defaultChecked 
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium">Promotional Offers</p>
                          <p className="text-sm text-gray-500">Receive special offers and discounts</p>
                        </div>
                        <input 
                          type="checkbox" 
                          className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded" 
                        />
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Bookings Section */}
              {activeSection === 'bookings' && (
                <motion.div
                  key="bookings"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3 }}
                  className="space-y-6"
                >
                  <div className="bg-white rounded-lg shadow-md">
                    <div className="p-6 border-b">
                      <div className="flex items-center justify-between">
                        <h2 className="text-xl font-semibold flex items-center gap-2">
                          <Calendar className="w-5 h-5 text-primary" />
                          My Bookings
                        </h2>
                        <div className="flex items-center gap-2">
                          <Button variant="outline" size="sm">
                            <Filter className="w-4 h-4 mr-2" />
                            Filter
                          </Button>
                          <Button variant="outline" size="sm">
                            <Download className="w-4 h-4 mr-2" />
                            Export
                          </Button>
                        </div>
                      </div>
                    </div>
                    <div className="p-6">
                      <div className="space-y-4">
                        {bookings.map((booking) => (
                          <div key={booking.id} className="border rounded-lg p-6 hover:shadow-md transition-shadow">
                            <div className="flex items-start justify-between mb-4">
                              <div className="flex items-center gap-3">
                                <div className="p-2 bg-blue-100 rounded-lg">
                                  <Bus className="w-6 h-6 text-primary" />
                                </div>
                                <div>
                                  <h3 className="font-semibold text-lg">{booking.route}</h3>
                                  <p className="text-gray-500">Booking ID: {booking.id}</p>
                                </div>
                              </div>
                              <span className={`px-3 py-1 rounded-full text-sm font-medium flex items-center gap-1 ${getStatusColor(booking.status)}`}>
                                {getStatusIcon(booking.status)}
                                {booking.status}
                              </span>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                              <div>
                                <p className="text-sm text-gray-500">Travel Date</p>
                                <p className="font-medium">{booking.date}</p>
                              </div>
                              <div>
                                <p className="text-sm text-gray-500">Departure Time</p>
                                <p className="font-medium">{booking.time}</p>
                              </div>
                              <div>
                                <p className="text-sm text-gray-500">Seats</p>
                                <p className="font-medium">{booking.seats.join(', ')}</p>
                              </div>
                              <div>
                                <p className="text-sm text-gray-500">Bus Type</p>
                                <p className="font-medium">{booking.busType}</p>
                              </div>
                            </div>

                            <div className="flex items-center justify-between pt-4 border-t">
                              <div className="flex items-center gap-4">
                                <span className="text-2xl font-bold text-primary">
                                  LKR {booking.price.toLocaleString()}
                                </span>
                                <span className="text-sm text-gray-500">
                                  Booked on {booking.bookingDate}
                                </span>
                              </div>
                              <div className="flex items-center gap-2">
                                {booking.status === 'upcoming' && (
                                  <>
                                    <Button variant="outline" size="sm">
                                      Modify
                                    </Button>
                                    <Button variant="outline" size="sm" className="text-red-600 hover:text-red-700">
                                      Cancel
                                    </Button>
                                  </>
                                )}
                                <Button variant="outline" size="sm">
                                  <Download className="w-4 h-4 mr-2" />
                                  Ticket
                                </Button>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Inquiries Section */}
              {activeSection === 'inquiries' && (
                <motion.div
                  key="inquiries"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3 }}
                  className="space-y-6"
                >
                  {/* New Inquiry Form */}
                  <div className="bg-white rounded-lg shadow-md">
                    <div className="p-6 border-b">
                      <h2 className="text-xl font-semibold flex items-center gap-2">
                        <Send className="w-5 h-5 text-primary" />
                        Submit New Inquiry
                      </h2>
                    </div>
                    <div className="p-6 space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Subject
                        </label>
                        <Input
                          value={inquirySubject}
                          onChange={(e) => setInquirySubject(e.target.value)}
                          placeholder="Enter inquiry subject"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Message
                        </label>
                        <textarea
                          value={inquiryText}
                          onChange={(e) => setInquiryText(e.target.value)}
                          placeholder="Describe your inquiry or concern..."
                          className="w-full p-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
                          rows={4}
                        />
                      </div>
                      <Button onClick={handleSubmitInquiry} className="w-full md:w-auto bg-primary hover:bg-primary">
                        <Send className="w-4 h-4 mr-2" />
                        Submit Inquiry
                      </Button>
                    </div>
                  </div>

                  {/* Inquiry History */}
                  <div className="bg-white rounded-lg shadow-md">
                    <div className="p-6 border-b">
                      <h2 className="text-xl font-semibold flex items-center gap-2">
                        <MessageCircle className="w-5 h-5 text-primary" />
                        Inquiry History
                      </h2>
                    </div>
                    <div className="p-6">
                      <div className="space-y-4">
                        {inquiries.map((inquiry) => (
                          <div key={inquiry.id} className="border rounded-lg p-6">
                            <div className="flex items-start justify-between mb-4">
                              <div>
                                <h3 className="font-semibold text-lg">{inquiry.subject}</h3>
                                <p className="text-gray-500 text-sm">#{inquiry.id} • {inquiry.date}</p>
                              </div>
                              <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(inquiry.status)}`}>
                                {inquiry.status}
                              </span>
                            </div>

                            <div className="bg-gray-50 p-4 rounded-lg mb-4">
                              <p className="text-gray-700">{inquiry.message}</p>
                            </div>

                            {inquiry.reply && (
                              <div className="bg-blue-50 p-4 rounded-lg border-l-4 border-primary">
                                <p className="text-sm font-medium text-blue-800 mb-2">Support Reply:</p>
                                <p className="text-primary">{inquiry.reply}</p>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserProfilePage;