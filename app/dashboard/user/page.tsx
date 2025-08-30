'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
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
  Filter,
  XCircle,
  Loader2,
  X
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { IUser, IBooking, UserDashboardStats } from '@/types';

interface Inquiry {
  _id: string;
  subject: string;
  message: string;
  status: 'new' | 'in-progress' | 'resolved' | 'closed';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  response?: string;
  createdAt: string;
  updatedAt: string;
}

interface DashboardData {
  stats: UserDashboardStats;
  recentBookings: IBooking[];
}

const UserProfilePage = () => {
  const { user, token, updateProfile, changePassword } = useAuth();
  const [activeSection, setActiveSection] = useState('overview');
  const [showPassword, setShowPassword] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [inquiryText, setInquiryText] = useState('');
  const [inquirySubject, setInquirySubject] = useState('');

  // Dashboard data
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [bookings, setBookings] = useState<IBooking[]>([]);
  const [inquiries, setInquiries] = useState<Inquiry[]>([]);

  // Form states
  const [profileData, setProfileData] = useState({
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    phone: user?.phone || ''
  });

  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const [notifications, setNotifications] = useState({
    emailNotifications: true,
    smsNotifications: true,
    promotionalOffers: false
  });

  // Filter states
  const [bookingFilter, setBookingFilter] = useState('all');
  const [bookingsPagination, setBookingsPagination] = useState({ current: 1, pages: 1, total: 0 });

  const [message, setMessage] = useState({ type: '', text: '' });

  useEffect(() => {
    if (user) {
      setProfileData({
        firstName: user.firstName,
        lastName: user.lastName,
        phone: user.phone
      });
    }
  }, [user]);

  useEffect(() => {
    if (activeSection === 'overview') {
      fetchDashboardData();
    } else if (activeSection === 'bookings') {
      fetchBookings();
    } else if (activeSection === 'inquiries') {
      fetchInquiries();
    }
  }, [activeSection, bookingFilter]);

  // API calls
  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/user/dashboard-stats', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      const data = await response.json();
      if (data.success) {
        setDashboardData(data.data);
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      setMessage({ type: 'error', text: 'Failed to load dashboard data' });
    } finally {
      setLoading(false);
    }
  };

  const fetchBookings = async (page: number = 1) => {
    try {
      setLoading(true);
      const statusParam = bookingFilter !== 'all' ? `&status=${bookingFilter}` : '';
      const response = await fetch(`/api/user/bookings?page=${page}&limit=10${statusParam}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      const data = await response.json();
      if (data.success) {
        setBookings(data.data.bookings);
        setBookingsPagination(data.data.pagination);
      }
    } catch (error) {
      console.error('Error fetching bookings:', error);
      setMessage({ type: 'error', text: 'Failed to load bookings' });
    } finally {
      setLoading(false);
    }
  };

  const fetchInquiries = async () => {
    try {
      setLoading(true);
      // Note: You'll need to create this endpoint in your backend
      const response = await fetch('/api/user/inquiries', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      const data = await response.json();
      if (data.success) {
        setInquiries(data.data.inquiries);
      }
    } catch (error) {
      console.error('Error fetching inquiries:', error);
      setMessage({ type: 'error', text: 'Failed to load inquiries' });
    } finally {
      setLoading(false);
    }
  };

  const handleProfileUpdate = async () => {
    try {
      setLoading(true);
      setMessage({ type: '', text: '' });

      const result = await updateProfile(profileData);

      if (result.success) {
        setMessage({ type: 'success', text: 'Profile updated successfully!' });
        setIsEditing(false);
      } else {
        setMessage({ type: 'error', text: result.message || 'Failed to update profile' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Network error. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordChange = async () => {
    try {
      if (passwordData.newPassword !== passwordData.confirmPassword) {
        setMessage({ type: 'error', text: 'New passwords do not match' });
        return;
      }

      setLoading(true);
      setMessage({ type: '', text: '' });

      const result = await changePassword(passwordData.currentPassword, passwordData.newPassword);

      if (result.success) {
        setMessage({ type: 'success', text: 'Password changed successfully!' });
        setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
      } else {
        setMessage({ type: 'error', text: result.message || 'Failed to change password' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Network error. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitInquiry = async () => {
    if (!inquirySubject.trim() || !inquiryText.trim()) {
      setMessage({ type: 'error', text: 'Please fill in all fields' });
      return;
    }

    try {
      setLoading(true);
      // Note: You'll need to create this endpoint
      const response = await fetch('/api/user/inquiries', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          subject: inquirySubject,
          message: inquiryText
        })
      });

      const data = await response.json();

      if (data.success) {
        setMessage({ type: 'success', text: 'Inquiry submitted successfully!' });
        setInquirySubject('');
        setInquiryText('');
        fetchInquiries(); // Refresh inquiries
      } else {
        setMessage({ type: 'error', text: data.message || 'Failed to submit inquiry' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Network error. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  const downloadTicket = async (bookingId: string) => {
    try {
      // Note: You'll need to create this endpoint
      const response = await fetch(`/api/user/bookings/${bookingId}/ticket`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        }
      });

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `ticket-${bookingId}.pdf`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to download ticket' });
    }
  };

  const cancelBooking = async (bookingId: string) => {
    if (!confirm('Are you sure you want to cancel this booking?')) return;

    try {
      const response = await fetch(`/api/user/bookings/${bookingId}/cancel`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      const data = await response.json();

      if (data.success) {
        setMessage({ type: 'success', text: 'Booking cancelled successfully!' });
        fetchBookings(); // Refresh bookings
      } else {
        setMessage({ type: 'error', text: data.message || 'Failed to cancel booking' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Network error. Please try again.' });
    }
  };

  const sidebarItems = [
    { id: 'overview', label: 'Overview', icon: <User className="w-5 h-5" /> },
    { id: 'settings', label: 'Profile Settings', icon: <Settings className="w-5 h-5" /> },
    { id: 'bookings', label: 'My Bookings', icon: <Calendar className="w-5 h-5" /> },
    { id: 'inquiries', label: 'Inquiries', icon: <MessageCircle className="w-5 h-5" /> }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'confirmed': return 'bg-blue-100 text-blue-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      case 'new': return 'bg-blue-100 text-blue-800';
      case 'in-progress': return 'bg-yellow-100 text-yellow-800';
      case 'resolved': return 'bg-green-100 text-green-800';
      case 'closed': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckCircle className="w-4 h-4" />;
      case 'confirmed': return <CheckCircle className="w-4 h-4" />;
      case 'pending': return <Clock className="w-4 h-4" />;
      case 'cancelled': return <XCircle className="w-4 h-4" />;
      default: return <Clock className="w-4 h-4" />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      <div className="container mx-auto px-4 py-8">
        {/* Message Display */}
        {message.text && (
          <div className={`mb-6 p-4 rounded-lg ${message.type === 'success'
            ? 'bg-green-100 border border-green-400 text-green-700'
            : 'bg-red-100 border border-red-400 text-red-700'
            }`}>
            {message.text}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-xl sticky top-4 border-l-2 border-accent " >
              <div className="p-0">
                {/* Profile Summary */}
                <div className="p-6 text-center border-b">
                  <div className="relative mx-auto w-20 h-20 mb-4">
                    <div className="w-20 h-20 bg-accent rounded-full flex items-center justify-center">
                      <span className="text-white font-bold text-2xl">
                        {user?.firstName?.charAt(0)}{user?.lastName?.charAt(0)}
                      </span>
                    </div>
                  </div>
                  <h3 className="font-semibold text-gray-900">{user?.firstName} {user?.lastName}</h3>
                </div>

                {/* Navigation */}
                <nav className="p-2">
                  {sidebarItems.map((item) => (
                    <button
                      key={item.id}
                      onClick={() => setActiveSection(item.id)}
                      className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-all duration-200 ${activeSection === item.id
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
                      {loading ? (
                        <div className="flex items-center justify-center py-12">
                          <Loader2 className="w-8 h-8 animate-spin text-primary" />
                        </div>
                      ) : (
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                          <div className="bg-sky-500/30 p-6 rounded-lg">
                            <div className="flex items-center justify-between">
                              <div>
                                <p className="text-black">Total Bookings</p>
                                <p className="text-2xl text-black font-bold">{dashboardData?.stats?.totalBookings || 0}</p>
                              </div>
                              <Bus className="w-8 h-8 text-black" />
                            </div>
                          </div>

                          <div className="bg-green-500/30 p-6 rounded-lg">
                            <div className="flex items-center justify-between">
                              <div>
                                <p className="">Completed Trips</p>
                                <p className="text-2xl font-bold">{dashboardData?.stats?.completedBookings || 0}</p>
                              </div>
                              <CheckCircle className="w-8 h-8 " />
                            </div>
                          </div>

                          <div className="bg-yellow-500/30 p-6 rounded-lg">
                            <div className="flex items-center justify-between">
                              <div>
                                <p className="">Upcoming Trips</p>
                                <p className="text-2xl font-bold">{dashboardData?.stats?.confirmedBookings || 0}</p>
                              </div>
                              <Calendar className="w-8 h-8 " />
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Recent Activity */}
                  <div className="bg-white rounded-lg shadow-md">
                    <div className="p-6 border-b">
                      <h2 className="text-xl font-semibold">Recent Activity</h2>
                    </div>
                    <div className="p-6">
                      {loading ? (
                        <div className="flex items-center justify-center py-8">
                          <Loader2 className="w-6 h-6 animate-spin text-primary" />
                        </div>
                      ) : (
                        <div className="space-y-4">
                          {dashboardData?.recentBookings?.slice(0, 3).map((booking) => (
                            <div key={booking._id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                              <div className="flex items-center gap-3">
                                <Bus className="w-5 h-5 text-primary" />
                                <div>
                                  <p className="font-medium">{booking.from} → {booking.to}</p>
                                  <p className="text-sm text-gray-500">
                                    {new Date(booking.departureDate).toLocaleDateString()} • {booking.departureTime}
                                  </p>
                                </div>
                              </div>
                              <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(booking.status)}`}>
                                {booking.status}
                              </span>
                            </div>
                          )) || (
                              <p className="text-center text-gray-500 py-8">No recent bookings found</p>
                            )}
                        </div>
                      )}
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

                        <div className="flex items-center gap-2">
                          {isEditing && (
                            <Button
                              variant="ghost"
                              onClick={() => setIsEditing(false)}
                              disabled={loading}
                              className="flex items-center gap-2"
                            >
                              <X className="w-4 h-4" />
                              Close
                            </Button>
                          )}

                          <Button
                            variant={isEditing ? "default" : "outline"}
                            onClick={() => {
                              if (isEditing) {
                                handleProfileUpdate();
                              } else {
                                setIsEditing(true);
                              }
                            }}
                            disabled={loading}
                            className="flex items-center gap-2"
                          >
                            {loading ? (
                              <Loader2 className="w-4 h-4 animate-spin" />
                            ) : isEditing ? (
                              <Save className="w-4 h-4" />
                            ) : (
                              <Edit3 className="w-4 h-4" />
                            )}
                            {loading ? "Saving..." : isEditing ? "Save Changes" : "Edit Profile"}
                          </Button>
                        </div>
                      </div>
                    </div>
                    <div className="p-6 space-y-6">
                      {/* Profile Image */}
                      <div className="flex items-center gap-6">
                        <div className="relative w-24 h-24">
                          <div className="w-24 h-24 bg-accent rounded-full flex items-center justify-center">
                            <span className="text-white font-bold text-3xl">
                              {user?.firstName?.charAt(0)}{user?.lastName?.charAt(0)}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Personal Information */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            First Name
                          </label>
                          <div className="relative">
                            <User className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                            <Input
                              value={profileData.firstName}
                              onChange={(e) => setProfileData({ ...profileData, firstName: e.target.value })}
                              disabled={!isEditing}
                              className="pl-10"
                            />
                          </div>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Last Name
                          </label>
                          <div className="relative">
                            <User className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                            <Input
                              value={profileData.lastName}
                              onChange={(e) => setProfileData({ ...profileData, lastName: e.target.value })}
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
                              value={user?.email || ''}
                              disabled
                              className="pl-10 bg-gray-50"
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
                              value={profileData.phone}
                              onChange={(e) => setProfileData({ ...profileData, phone: e.target.value })}
                              disabled={!isEditing}
                              className="pl-10"
                            />
                          </div>
                        </div>
                      </div>


                    </div>

                  </div>

                  {/* Password Section */}
                  {isEditing && (
                    <div className="bg-white border border-red-500 rounded-lg p-6">
                      <div className="">
                        <h2 className='pb-5 font-bold text-xl justify-center align-center text-red-500'>Danger Zone</h2>
                        <h3 className="text-lg font-semibold mb-4 text-black">Change Password</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Current Password
                            </label>
                            <div className="relative">
                              <Shield className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                              <Input
                                type={showPassword ? "text" : "password"}
                                value={passwordData.currentPassword}
                                onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
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
                                value={passwordData.newPassword}
                                onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                                className="pl-10"
                              />
                            </div>
                          </div>

                          <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Confirm New Password
                            </label>
                            <div className="relative">
                              <Shield className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                              <Input
                                type={showPassword ? "text" : "password"}
                                value={passwordData.confirmPassword}
                                onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                                className="pl-10"
                              />
                            </div>
                          </div>

                          <div className="md:col-span-2 col-span-1">
                            <Button
                              onClick={handlePasswordChange}
                              disabled={loading || !passwordData.currentPassword || !passwordData.newPassword || !passwordData.confirmPassword}
                              className="w-full md:w-auto bg-primary"
                            >
                              {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                              Change Password
                            </Button>

                            <Button
                              onClick={handlePasswordChange}
                              disabled={loading || !passwordData.currentPassword || !passwordData.newPassword || !passwordData.confirmPassword}
                              className="w-full md:w-auto bg-red-500 md:not-last md:ml-5 mt-5 md:mt-0"
                            >
                              {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                              Delete Account
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
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
                          <select
                            value={bookingFilter}
                            onChange={(e) => setBookingFilter(e.target.value)}
                            className="px-3 py-2 border border-gray-300 rounded-lg"
                          >
                            <option value="all">All Bookings</option>
                            <option value="pending">Pending</option>
                            <option value="confirmed">Confirmed</option>
                            <option value="completed">Completed</option>
                            <option value="cancelled">Cancelled</option>
                          </select>
                        </div>
                      </div>
                    </div>
                    <div className="p-6">
                      {loading ? (
                        <div className="flex items-center justify-center py-12">
                          <Loader2 className="w-8 h-8 animate-spin text-primary" />
                        </div>
                      ) : bookings.length === 0 ? (
                        <div className="text-center py-12">
                          <Bus className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                          <p className="text-gray-500 text-lg">No bookings found</p>
                          <p className="text-gray-400">Book your first trip to get started!</p>
                        </div>
                      ) : (
                        <div className="space-y-4">
                          {bookings.map((booking) => (
                            <div key={booking._id} className="border rounded-lg p-6 hover:shadow-md transition-shadow">
                              <div className="flex items-start justify-between mb-4">
                                <div className="flex items-center gap-3">
                                  <div className="p-2 bg-blue-100 rounded-lg">
                                    <Bus className="w-6 h-6 text-primary" />
                                  </div>
                                  <div>
                                    <h3 className="font-semibold text-lg">{booking.from} → {booking.to}</h3>
                                    <p className="text-gray-500">Booking ID: {booking.bookingReference}</p>
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
                                  <p className="font-medium">{new Date(booking.departureDate).toLocaleDateString()}</p>
                                </div>
                                <div>
                                  <p className="text-sm text-gray-500">Departure Time</p>
                                  <p className="font-medium">{booking.departureTime}</p>
                                </div>
                                <div>
                                  <p className="text-sm text-gray-500">Passengers</p>
                                  <p className="font-medium">{booking.passengers}</p>
                                </div>
                                <div>
                                  <p className="text-sm text-gray-500">Seats</p>
                                  <p className="font-medium">{booking.seatNumbers.join(', ') || 'N/A'}</p>
                                </div>
                              </div>

                              <div className="flex items-center justify-between pt-4 border-t">
                                <div className="flex items-center gap-4">
                                  <span className="text-2xl font-bold text-primary">
                                    Rs. {booking.totalAmount.toLocaleString()}
                                  </span>
                                  <span className="text-sm text-gray-500">
                                    Booked on {new Date(booking.createdAt).toLocaleDateString()}
                                  </span>
                                </div>
                                <div className="flex items-center gap-2">
                                  {booking.status === 'confirmed' && (
                                    <>
                                      <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => cancelBooking(booking._id)}
                                        className="text-red-600 hover:text-red-700"
                                      >
                                        Cancel
                                      </Button>
                                      <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => downloadTicket(booking._id)}
                                      >
                                        <Download className="w-4 h-4 mr-2" />
                                        Ticket
                                      </Button>
                                    </>
                                  )}
                                  {booking.status === 'completed' && (
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      onClick={() => downloadTicket(booking._id)}
                                    >
                                      <Download className="w-4 h-4 mr-2" />
                                      Download
                                    </Button>
                                  )}
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Pagination */}
                      {bookingsPagination.pages > 1 && (
                        <div className="mt-6 flex items-center justify-between">
                          <p className="text-sm text-gray-700">
                            Showing {((bookingsPagination.current - 1) * 10) + 1} to {Math.min(bookingsPagination.current * 10, bookingsPagination.total)} of {bookingsPagination.total} results
                          </p>
                          <div className="flex space-x-2">
                            <Button
                              variant="outline"
                              size="sm"
                              disabled={bookingsPagination.current === 1}
                              onClick={() => fetchBookings(bookingsPagination.current - 1)}
                            >
                              Previous
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              disabled={bookingsPagination.current === bookingsPagination.pages}
                              onClick={() => fetchBookings(bookingsPagination.current + 1)}
                            >
                              Next
                            </Button>
                          </div>
                        </div>
                      )}
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
                          disabled={loading}
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
                          disabled={loading}
                        />
                      </div>
                      <Button
                        onClick={handleSubmitInquiry}
                        disabled={loading || !inquirySubject.trim() || !inquiryText.trim()}
                        className="w-full md:w-auto bg-primary hover:bg-primary"
                      >
                        {loading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Send className="w-4 h-4 mr-2" />}
                        {loading ? 'Submitting...' : 'Submit Inquiry'}
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
                      {loading ? (
                        <div className="flex items-center justify-center py-8">
                          <Loader2 className="w-6 h-6 animate-spin text-primary" />
                        </div>
                      ) : inquiries.length === 0 ? (
                        <div className="text-center py-8">
                          <MessageCircle className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                          <p className="text-gray-500">No inquiries found</p>
                        </div>
                      ) : (
                        <div className="space-y-4">
                          {inquiries.map((inquiry) => (
                            <div key={inquiry._id} className="border rounded-lg p-6">
                              <div className="flex items-start justify-between mb-4">
                                <div>
                                  <h3 className="font-semibold text-lg">{inquiry.subject}</h3>
                                  <p className="text-gray-500 text-sm">
                                    {new Date(inquiry.createdAt).toLocaleDateString()}
                                  </p>
                                </div>
                                <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(inquiry.status)}`}>
                                  {inquiry.status}
                                </span>
                              </div>

                              <div className="bg-gray-50 p-4 rounded-lg mb-4">
                                <p className="text-gray-700">{inquiry.message}</p>
                              </div>

                              {inquiry.response && (
                                <div className="bg-blue-50 p-4 rounded-lg border-l-4 border-primary">
                                  <p className="text-sm font-medium text-blue-800 mb-2">Support Reply:</p>
                                  <p className="text-primary">{inquiry.response}</p>
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      )}
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