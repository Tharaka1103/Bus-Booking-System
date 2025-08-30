'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { 
  Users, 
  Calendar, 
  MessageSquare, 
  BarChart3, 
  Settings,
  Plus,
  Edit,
  Trash2,
  Search,
  Filter,
  LogOut,
  User,
  Lock,
  Eye,
  Check,
  X,
  AlertCircle,
  CheckCircle,
  XCircle,
  Clock
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { IUser, IBooking, IInquiry, DashboardStats } from '@/types';

interface AdminDashboardData {
  stats: DashboardStats;
  recentActivity: {
    bookings: IBooking[];
    inquiries: IInquiry[];
  };
}

const AdminDashboard = () => {
  const { user, logout, token } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');
  const [dashboardStats, setDashboardStats] = useState<AdminDashboardData | null>(null);
  const [admins, setAdmins] = useState<IUser[]>([]);
  const [bookings, setBookings] = useState<IBooking[]>([]);
  const [inquiries, setInquiries] = useState<IInquiry[]>([]);
  const [loading, setLoading] = useState(true);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [showAddAdminModal, setShowAddAdminModal] = useState(false);

  // Pagination states
  const [adminsPagination, setAdminsPagination] = useState({ current: 1, pages: 1, total: 0 });
  const [bookingsPagination, setBookingsPagination] = useState({ current: 1, pages: 1, total: 0 });
  const [inquiriesPagination, setInquiriesPagination] = useState({ current: 1, pages: 1, total: 0 });

  // Filter states
  const [bookingFilter, setBookingFilter] = useState('all');
  const [inquiryStatusFilter, setInquiryStatusFilter] = useState('all');
  const [inquiryPriorityFilter, setInquiryPriorityFilter] = useState('all');

  useEffect(() => {
    fetchDashboardStats();
  }, []);

  useEffect(() => {
    if (activeTab === 'admins') {
      fetchAdmins();
    } else if (activeTab === 'bookings') {
      fetchBookings();
    } else if (activeTab === 'inquiries') {
      fetchInquiries();
    }
  }, [activeTab, bookingFilter, inquiryStatusFilter, inquiryPriorityFilter]);

  const fetchDashboardStats = async () => {
    try {
      const response = await fetch('/api/admin/dashboard-stats', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      const data = await response.json();
      if (data.success) {
        setDashboardStats(data.data);
      }
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchAdmins = async (page: number = 1) => {
    try {
      const response = await fetch(`/api/admin/admins?page=${page}&limit=10`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      const data = await response.json();
      console.table(data);
      if (data.success) {
        setAdmins(data.data.admins);
        setAdminsPagination(data.data.pagination);
      }
    } catch (error) {
      console.error('Error fetching admins:', error);
    }
  };

  const fetchBookings = async (page: number = 1) => {
    try {
      const statusParam = bookingFilter !== 'all' ? `&status=${bookingFilter}` : '';
      const response = await fetch(`/api/admin/bookings?page=${page}&limit=10${statusParam}`, {
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
    }
  };

  const fetchInquiries = async (page: number = 1) => {
    try {
      const statusParam = inquiryStatusFilter !== 'all' ? `&status=${inquiryStatusFilter}` : '';
      const priorityParam = inquiryPriorityFilter !== 'all' ? `&priority=${inquiryPriorityFilter}` : '';
      const response = await fetch(`/api/admin/inquiries?page=${page}&limit=10${statusParam}${priorityParam}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      const data = await response.json();
      if (data.success) {
        setInquiries(data.data.inquiries);
        setInquiriesPagination(data.data.pagination);
      }
    } catch (error) {
      console.error('Error fetching inquiries:', error);
    }
  };

  const updateBookingStatus = async (bookingId: string, status: string) => {
    try {
      const response = await fetch(`/api/admin/bookings/${bookingId}/status`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ status })
      });

      if (response.ok) {
        fetchBookings(bookingsPagination.current);
      }
    } catch (error) {
      console.error('Error updating booking status:', error);
    }
  };

  const deleteAdmin = async (adminId: string) => {
    if (!confirm('Are you sure you want to delete this admin?')) return;

    try {
      const response = await fetch(`/api/admin/admins/${adminId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        fetchAdmins(adminsPagination.current);
      }
    } catch (error) {
      console.error('Error deleting admin:', error);
    }
  };

  const tabs = [
    { id: 'overview', label: 'Overview', icon: BarChart3 },
    { id: 'admins', label: 'Manage Admins', icon: Users },
    { id: 'bookings', label: 'Manage Bookings', icon: Calendar },
    { id: 'inquiries', label: 'Manage Inquiries', icon: MessageSquare },
  ];

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-lg text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-xl border-b border-gray-200 sticky top-0 z-40">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                Admin Dashboard
              </h1>
              <p className="text-gray-600">Welcome back, {user?.firstName}!</p>
            </div>
            <div className="flex items-center space-x-4">
              <Button
                onClick={() => setShowProfileModal(true)}
                variant="outline"
                className="bg-white/50 backdrop-blur-sm"
              >
                <User className="w-4 h-4 mr-2" />
                Profile
              </Button>
              <Button
                onClick={logout}
                variant="outline"
                className="bg-white/50 backdrop-blur-sm hover:bg-red-50 hover:text-red-600 hover:border-red-200"
              >
                <LogOut className="w-4 h-4 mr-2" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="flex">
        {/* Sidebar */}
        <div className="w-64 bg-white/80 backdrop-blur-xl border-r border-gray-200 min-h-screen">
          <div className="p-6">
            <nav className="space-y-2">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-left transition-all duration-200 ${
                      activeTab === tab.id
                        ? 'bg-gradient-to-r from-primary to-accent text-white shadow-lg'
                        : 'text-gray-600 hover:bg-gray-100'
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    <span className="font-medium">{tab.label}</span>
                  </button>
                );
              })}
            </nav>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 p-6">
          {activeTab === 'overview' && (
            <OverviewTab dashboardStats={dashboardStats} />
          )}
          {activeTab === 'admins' && (
            <AdminsTab 
              admins={admins}
              pagination={adminsPagination}
              onRefresh={fetchAdmins}
              onDelete={deleteAdmin}
              onAddAdmin={() => setShowAddAdminModal(true)}
            />
          )}
          {activeTab === 'bookings' && (
            <BookingsTab 
              bookings={bookings}
              pagination={bookingsPagination}
              filter={bookingFilter}
              onFilterChange={setBookingFilter}
              onRefresh={fetchBookings}
              onUpdateStatus={updateBookingStatus}
            />
          )}
          {activeTab === 'inquiries' && (
            <InquiriesTab 
              inquiries={inquiries}
              pagination={inquiriesPagination}
              statusFilter={inquiryStatusFilter}
              priorityFilter={inquiryPriorityFilter}
              onStatusFilterChange={setInquiryStatusFilter}
              onPriorityFilterChange={setInquiryPriorityFilter}
              onRefresh={fetchInquiries}
            />
          )}
        </div>
      </div>

      {/* Modals */}
      {showProfileModal && (
        <ProfileModal 
          user={user} 
          onClose={() => setShowProfileModal(false)} 
        />
      )}

      {showAddAdminModal && (
        <AddAdminModal 
          onClose={() => setShowAddAdminModal(false)} 
          onSuccess={() => {
            setShowAddAdminModal(false);
            fetchAdmins();
          }}
          token={token}
        />
      )}
    </div>
  );
};

// Overview Tab Component
const OverviewTab = ({ dashboardStats }: { dashboardStats: AdminDashboardData | null }) => {
  const stats = dashboardStats?.stats;
  const recentActivity = dashboardStats?.recentActivity;

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Users"
          value={stats?.totalUsers || 0}
          icon={Users}
          color="bg-blue-500"
        />
        <StatCard
          title="Total Bookings"
          value={stats?.totalBookings || 0}
          icon={Calendar}
          color="bg-green-500"
        />
        <StatCard
          title="Pending Bookings"
          value={stats?.pendingBookings || 0}
          icon={Calendar}
          color="bg-yellow-500"
        />
        <StatCard
          title="New Inquiries"
          value={stats?.newInquiries || 0}
          icon={MessageSquare}
          color="bg-purple-500"
        />
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white/80 backdrop-blur-xl rounded-2xl p-6 border border-gray-200">
          <h3 className="text-lg font-semibold mb-4">Recent Bookings</h3>
          <div className="space-y-3">
            {recentActivity?.bookings?.map((booking) => (
              <div key={booking._id} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                <div>
                  <p className="font-medium">
                    {(booking.user as IUser)?.firstName} {(booking.user as IUser)?.lastName}
                  </p>
                  <p className="text-sm text-gray-600">{booking.from} → {booking.to}</p>
                </div>
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                  booking.status === 'confirmed' ? 'bg-green-100 text-green-800' : 
                  booking.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                  'bg-gray-100 text-gray-800'
                }`}>
                  {booking.status}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white/80 backdrop-blur-xl rounded-2xl p-6 border border-gray-200">
          <h3 className="text-lg font-semibold mb-4">Recent Inquiries</h3>
          <div className="space-y-3">
            {recentActivity?.inquiries?.map((inquiry) => (
              <div key={inquiry._id} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                <div>
                  <p className="font-medium">{inquiry.name}</p>
                  <p className="text-sm text-gray-600">{inquiry.subject}</p>
                </div>
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                  inquiry.status === 'new' ? 'bg-blue-100 text-blue-800' : 
                  inquiry.status === 'in-progress' ? 'bg-yellow-100 text-yellow-800' :
                  'bg-green-100 text-green-800'
                }`}>
                  {inquiry.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

// Stat Card Component
const StatCard = ({ title, value, icon: Icon, color }: {
  title: string;
  value: number;
  icon: any;
  color: string;
}) => (
  <div className="bg-white/80 backdrop-blur-xl rounded-2xl p-6 border border-gray-200">
    <div className="flex items-center justify-between">
      <div>
        <p className="text-gray-600 text-sm font-medium">{title}</p>
        <p className="text-3xl font-bold text-gray-800 mt-2">{value}</p>
      </div>
      <div className={`w-12 h-12 ${color} rounded-xl flex items-center justify-center`}>
        <Icon className="w-6 h-6 text-white" />
      </div>
    </div>
  </div>
);

// Admins Tab Component
const AdminsTab = ({ 
  admins, 
  pagination, 
  onRefresh, 
  onDelete, 
  onAddAdmin 
}: {
  admins: IUser[];
  pagination: any;
  onRefresh: (page?: number) => void;
  onDelete: (id: string) => void;
  onAddAdmin: () => void;
}) => {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-800">Manage Admins</h2>
        <Button
          onClick={onAddAdmin}
          className="bg-gradient-to-r from-primary to-accent text-white"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Admin
        </Button>
      </div>

      <div className="bg-white/80 backdrop-blur-xl rounded-2xl border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Name</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Email</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Phone</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Status</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {admins.map((admin) => (
                <tr key={admin._id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 text-sm text-gray-900">
                    {admin.firstName} {admin.lastName}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">{admin.email}</td>
                  <td className="px-6 py-4 text-sm text-gray-600">{admin.phone}</td>
                  <td className="px-6 py-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                      admin.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {admin.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm">
                    <div className="flex space-x-2">
                      <Button variant="outline" size="sm">
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="text-red-600 hover:text-red-700"
                        onClick={() => onDelete(admin._id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="px-6 py-4 border-t border-gray-200">
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-700">
              Showing {((pagination.current - 1) * 10) + 1} to {Math.min(pagination.current * 10, pagination.total)} of {pagination.total} results
            </p>
            <div className="flex space-x-2">
              <Button
                variant="outline"
                size="sm"
                disabled={pagination.current === 1}
                onClick={() => onRefresh(pagination.current - 1)}
              >
                Previous
              </Button>
              <Button
                variant="outline"
                size="sm"
                disabled={pagination.current === pagination.pages}
                onClick={() => onRefresh(pagination.current + 1)}
              >
                Next
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Bookings Tab Component
const BookingsTab = ({ 
  bookings, 
  pagination, 
  filter, 
  onFilterChange, 
  onRefresh, 
  onUpdateStatus 
}: {
  bookings: IBooking[];
  pagination: any;
  filter: string;
  onFilterChange: (filter: string) => void;
  onRefresh: (page?: number) => void;
  onUpdateStatus: (id: string, status: string) => void;
}) => {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-800">Manage Bookings</h2>
        <div className="flex space-x-2">
          <select
            value={filter}
            onChange={(e) => onFilterChange(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg bg-white"
          >
            <option value="all">All Bookings</option>
            <option value="pending">Pending</option>
            <option value="confirmed">Confirmed</option>
            <option value="cancelled">Cancelled</option>
            <option value="completed">Completed</option>
          </select>
        </div>
      </div>

      <div className="bg-white/80 backdrop-blur-xl rounded-2xl border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Reference</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Customer</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Route</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Date</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Amount</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Status</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {bookings.map((booking) => (
                <tr key={booking._id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 text-sm font-medium text-gray-900">
                    {booking.bookingReference}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900">
                    {(booking.user as IUser)?.firstName} {(booking.user as IUser)?.lastName}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">
                    {booking.from} → {booking.to}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">
                    {new Date(booking.departureDate).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">
                    Rs. {booking.totalAmount}
                  </td>
                  <td className="px-6 py-4">
                    <select 
                      value={booking.status}
                      onChange={(e) => onUpdateStatus(booking._id, e.target.value)}
                      className={`px-3 py-1 rounded-full text-xs font-medium border-0 ${
                        booking.status === 'confirmed' ? 'bg-green-100 text-green-800' :
                        booking.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                        booking.status === 'cancelled' ? 'bg-red-100 text-red-800' :
                        'bg-blue-100 text-blue-800'
                      }`}
                    >
                      <option value="pending">Pending</option>
                      <option value="confirmed">Confirmed</option>
                      <option value="cancelled">Cancelled</option>
                      <option value="completed">Completed</option>
                    </select>
                  </td>
                  <td className="px-6 py-4 text-sm">
                    <Button variant="outline" size="sm">
                      <Eye className="w-4 h-4 mr-1" />
                      View
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="px-6 py-4 border-t border-gray-200">
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-700">
              Showing {((pagination.current - 1) * 10) + 1} to {Math.min(pagination.current * 10, pagination.total)} of {pagination.total} results
            </p>
            <div className="flex space-x-2">
              <Button
                variant="outline"
                size="sm"
                disabled={pagination.current === 1}
                onClick={() => onRefresh(pagination.current - 1)}
              >
                Previous
              </Button>
              <Button
                variant="outline"
                size="sm"
                disabled={pagination.current === pagination.pages}
                onClick={() => onRefresh(pagination.current + 1)}
              >
                Next
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Inquiries Tab Component
const InquiriesTab = ({ 
  inquiries, 
  pagination, 
  statusFilter, 
  priorityFilter, 
  onStatusFilterChange, 
  onPriorityFilterChange, 
  onRefresh 
}: {
  inquiries: IInquiry[];
  pagination: any;
  statusFilter: string;
  priorityFilter: string;
  onStatusFilterChange: (filter: string) => void;
  onPriorityFilterChange: (filter: string) => void;
  onRefresh: (page?: number) => void;
}) => {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-800">Manage Inquiries</h2>
        <div className="flex space-x-2">
          <select
            value={statusFilter}
            onChange={(e) => onStatusFilterChange(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg bg-white"
          >
            <option value="all">All Status</option>
            <option value="new">New</option>
            <option value="in-progress">In Progress</option>
            <option value="resolved">Resolved</option>
            <option value="closed">Closed</option>
          </select>
          <select
            value={priorityFilter}
            onChange={(e) => onPriorityFilterChange(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg bg-white"
          >
            <option value="all">All Priority</option>
            <option value="urgent">Urgent</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>
        </div>
      </div>

      <div className="bg-white/80 backdrop-blur-xl rounded-2xl border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Name</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Subject</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Priority</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Status</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Date</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {inquiries.map((inquiry) => (
                <tr key={inquiry._id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 text-sm text-gray-900">{inquiry.name}</td>
                  <td className="px-6 py-4 text-sm text-gray-600">{inquiry.subject}</td>
                  <td className="px-6 py-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                      inquiry.priority === 'urgent' ? 'bg-red-100 text-red-800' :
                      inquiry.priority === 'high' ? 'bg-orange-100 text-orange-800' :
                      inquiry.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {inquiry.priority}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                      inquiry.status === 'new' ? 'bg-blue-100 text-blue-800' :
                      inquiry.status === 'in-progress' ? 'bg-yellow-100 text-yellow-800' :
                      inquiry.status === 'resolved' ? 'bg-green-100 text-green-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {inquiry.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">
                    {new Date(inquiry.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 text-sm">
                    <Button variant="outline" size="sm">
                      <Eye className="w-4 h-4 mr-1" />
                      View
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="px-6 py-4 border-t border-gray-200">
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-700">
              Showing {((pagination.current - 1) * 10) + 1} to {Math.min(pagination.current * 10, pagination.total)} of {pagination.total} results
            </p>
            <div className="flex space-x-2">
              <Button
                variant="outline"
                size="sm"
                disabled={pagination.current === 1}
                onClick={() => onRefresh(pagination.current - 1)}
              >
                Previous
              </Button>
              <Button
                variant="outline"
                size="sm"
                disabled={pagination.current === pagination.pages}
                onClick={() => onRefresh(pagination.current + 1)}
              >
                Next
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Add Admin Modal Component
const AddAdminModal = ({ onClose, onSuccess, token }: {
  onClose: () => void;
  onSuccess: () => void;
  token: string | null;
}) => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    password: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/admin/admins', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });

      const data = await response.json();

      if (data.success) {
        onSuccess();
      } else {
        setError(data.message);
      }
    } catch (error) {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl p-8 w-full max-w-md mx-4">
        <h3 className="text-2xl font-bold mb-6">Add New Admin</h3>
        
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <Input
              placeholder="First Name"
              value={formData.firstName}
              onChange={(e) => setFormData({...formData, firstName: e.target.value})}
              required
            />
            <Input
              placeholder="Last Name"
              value={formData.lastName}
              onChange={(e) => setFormData({...formData, lastName: e.target.value})}
              required
            />
          </div>
          <Input
            type="email"
            placeholder="Email"
            value={formData.email}
            onChange={(e) => setFormData({...formData, email: e.target.value})}
            required
          />
          <Input
            placeholder="Phone (+94XXXXXXXXX)"
            value={formData.phone}
            onChange={(e) => setFormData({...formData, phone: e.target.value})}
            required
          />
          <Input
            type="password"
            placeholder="Password"
            value={formData.password}
            onChange={(e) => setFormData({...formData, password: e.target.value})}
            required
          />
          
          <div className="flex space-x-4 pt-4">
            <Button 
              type="button" 
              variant="outline" 
              onClick={onClose}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={loading}
              className="flex-1 bg-gradient-to-r from-primary to-accent"
            >
              {loading ? 'Creating...' : 'Create Admin'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

// Profile Modal Component
const ProfileModal = ({ user, onClose }: { user: any; onClose: () => void }) => {
  const { updateProfile, changePassword } = useAuth();
  const [activeTab, setActiveTab] = useState('profile');
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
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    const result = await updateProfile(profileData);
    setMessage(result.message);
    setLoading(false);

    if (result.success) {
      setTimeout(() => {
        onClose();
      }, 1500);
    }
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setMessage('New passwords do not match');
      return;
    }

    setLoading(true);
    setMessage('');

    const result = await changePassword(passwordData.currentPassword, passwordData.newPassword);
    setMessage(result.message);
    setLoading(false);

    if (result.success) {
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl p-8 w-full max-w-md mx-4">
        <h3 className="text-2xl font-bold mb-6">Profile Settings</h3>
        
        {/* Tab Navigation */}
        <div className="flex mb-6">
          <button
            onClick={() => setActiveTab('profile')}
            className={`flex-1 py-2 px-4 text-center rounded-l-lg ${
              activeTab === 'profile' 
                ? 'bg-primary text-white' 
                : 'bg-gray-100 text-gray-600'
            }`}
          >
            <User className="w-4 h-4 mx-auto mb-1" />
            Profile
          </button>
          <button
            onClick={() => setActiveTab('password')}
            className={`flex-1 py-2 px-4 text-center rounded-r-lg ${
              activeTab === 'password' 
                ? 'bg-primary text-white' 
                : 'bg-gray-100 text-gray-600'
            }`}
          >
            <Lock className="w-4 h-4 mx-auto mb-1" />
            Password
          </button>
        </div>

        {message && (
          <div className={`px-4 py-3 rounded mb-4 ${
            message.includes('success') || message.includes('updated') 
              ? 'bg-green-100 border border-green-400 text-green-700'
              : 'bg-red-100 border border-red-400 text-red-700'
          }`}>
            {message}
          </div>
        )}

        {activeTab === 'profile' ? (
          <form onSubmit={handleProfileUpdate} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <Input
                placeholder="First Name"
                value={profileData.firstName}
                onChange={(e) => setProfileData({...profileData, firstName: e.target.value})}
                required
              />
              <Input
                placeholder="Last Name"
                value={profileData.lastName}
                onChange={(e) => setProfileData({...profileData, lastName: e.target.value})}
                required
              />
            </div>
            <Input
              placeholder="Phone (+94XXXXXXXXX)"
              value={profileData.phone}
              onChange={(e) => setProfileData({...profileData, phone: e.target.value})}
              required
            />
            <Input
              type="email"
              placeholder="Email"
              value={user?.email}
              disabled
              className="bg-gray-50"
            />
            
            <div className="flex space-x-4 pt-4">
              <Button 
                type="button" 
                variant="outline" 
                onClick={onClose}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button 
                type="submit" 
                disabled={loading}
                className="flex-1 bg-gradient-to-r from-primary to-accent"
              >
                {loading ? 'Updating...' : 'Update Profile'}
              </Button>
            </div>
          </form>
        ) : (
          <form onSubmit={handlePasswordChange} className="space-y-4">
            <Input
              type="password"
              placeholder="Current Password"
              value={passwordData.currentPassword}
              onChange={(e) => setPasswordData({...passwordData, currentPassword: e.target.value})}
              required
            />
            <Input
              type="password"
              placeholder="New Password"
              value={passwordData.newPassword}
              onChange={(e) => setPasswordData({...passwordData, newPassword: e.target.value})}
              required
            />
            <Input
              type="password"
              placeholder="Confirm New Password"
              value={passwordData.confirmPassword}
              onChange={(e) => setPasswordData({...passwordData, confirmPassword: e.target.value})}
              required
            />
            
            <div className="flex space-x-4 pt-4">
              <Button 
                type="button" 
                variant="outline" 
                onClick={onClose}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button 
                type="submit" 
                disabled={loading}
                className="flex-1 bg-gradient-to-r from-primary to-accent"
              >
                {loading ? 'Changing...' : 'Change Password'}
              </Button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;