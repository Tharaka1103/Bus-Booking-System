// app/super_admin/dashboard/page.tsx
'use client';

import DashboardLayout from '@/components/layout/DashboardLayout';
import { useAuth } from '@/contexts/AuthContext';
import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Users, Bus, Route, TrendingUp, Calendar, ChevronRight, Loader2 } from 'lucide-react';
import {
    PieChart, Pie, Cell, BarChart, Bar, LineChart, Line,
    XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';

interface DashboardData {
    totalUsers: number;
    totalBuses: number;
    totalRoutes: number;
    revenue: number;
    monthlyBookings: number;
    bookingStats: Array<{ _id: string; count: number; revenue: number }>;
    bookingsByRoute: Array<{ routeName: string; bookings: number; revenue: number; passengers: number }>;
    dailyBookings: Array<{ _id: number; bookings: number; revenue: number }>;
}

interface RouteWithBuses {
    _id: string;
    name: string;
    fromLocation: string;
    toLocation: string;
    buses: Array<{
        _id: string;
        busNumber: string;
        type: string;
        capacity: number;
        bookedSeats: number;
        availableSeats: number;
        occupancyRate: string;
    }>;
}

interface BusSeatDetails {
    bus: any;
    totalSeats: number;
    bookedSeats: number;
    availableSeats: number;
    occupancyRate: string;
    weeklyTrend: Array<{ _id: string; bookings: number }>;
}

const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6'];

export default function SuperAdminDashboard() {
    const { user, hasRole } = useAuth();
    const [loading, setLoading] = useState(true);
    const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
    const [routesWithBuses, setRoutesWithBuses] = useState<RouteWithBuses[]>([]);
    const [selectedBus, setSelectedBus] = useState<string | null>(null);
    const [busDetails, setBusDetails] = useState<BusSeatDetails | null>(null);
    const [showBusModal, setShowBusModal] = useState(false);
    const [expandedRoutes, setExpandedRoutes] = useState<Set<string>>(new Set());

    useEffect(() => {
        if (!hasRole('super_admin')) {
            return;
        }
        fetchDashboardData();
    }, [hasRole]);

    const fetchDashboardData = async () => {
        try {
            setLoading(true);
            const [analyticsResponse, routesResponse] = await Promise.all([
                fetch('/api/dashboard/analysis', { credentials: 'include' }),
                fetch('/api/dashboard/routes-buses', { credentials: 'include' })
            ]);

            if (analyticsResponse.ok && routesResponse.ok) {
                const analyticsData = await analyticsResponse.json();
                const routesData = await routesResponse.json();

                setDashboardData(analyticsData.data);
                setRoutesWithBuses(routesData.data);
            }
        } catch (error) {
            console.error('Error fetching dashboard data:', error);
        } finally {
            setLoading(false);
        }
    };

    // In your dashboard component, make sure you're passing the date correctly
const fetchBusDetails = async (busId: string) => {
  try {
    // Make sure we're using the correct date format
    const today = new Date();
    const todayStr = today.getFullYear() + '-' + 
                    String(today.getMonth() + 1).padStart(2, '0') + '-' + 
                    String(today.getDate()).padStart(2, '0');

    console.log('Fetching bus details for date:', todayStr); // Debug log

    const response = await fetch(`/api/dashboard/bus-seats/${busId}?date=${todayStr}`, {
      credentials: 'include'
    });

    if (response.ok) {
      const data = await response.json();
      console.log('Bus details response:', data); // Debug log
      setBusDetails(data.data);
      setShowBusModal(true);
    }
  } catch (error) {
    console.error('Error fetching bus details:', error);
  }
};

    const toggleRoute = (routeId: string) => {
        const newExpanded = new Set(expandedRoutes);
        if (newExpanded.has(routeId)) {
            newExpanded.delete(routeId);
        } else {
            newExpanded.add(routeId);
        }
        setExpandedRoutes(newExpanded);
    };

    if (loading) {
        return (
            <DashboardLayout>
                <div className="flex items-center justify-center h-64">
                    <Loader2 className="w-8 h-8 animate-spin" />
                </div>
            </DashboardLayout>
        );
    }

    if (!dashboardData) {
        return (
            <DashboardLayout>
                <div className="text-center py-8">Failed to load dashboard data</div>
            </DashboardLayout>
        );
    }

    const pieData = dashboardData.bookingStats.map(stat => ({
        name: stat._id.charAt(0).toUpperCase() + stat._id.slice(1),
        value: stat.count
    }));

    const lineChartData = Array.from({ length: 30 }, (_, i) => {
        const dayData = dashboardData.dailyBookings.find(d => d._id === i + 1);
        return {
            day: i + 1,
            bookings: dayData?.bookings || 0,
            revenue: dayData?.revenue || 0
        };
    });

    return (
        <DashboardLayout>
            <div className="space-y-6">
                {/* Welcome Section */}
                <div className="bg-primary rounded-sm p-8 text-white">
                    <h1 className="text-3xl font-bold mb-2">
                        Welcome back, {user?.firstName} {user?.lastName}!
                    </h1>
                    <p className="text-blue-100 text-lg">
                        System Analytics Dashboard - Real-time insights
                    </p>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                    <Card className="bg-white rounded-sm">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium text-gray-600">Total Users</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{dashboardData.totalUsers}</div>
                        </CardContent>
                    </Card>

                    <Card className="bg-white rounded-sm">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium text-gray-600">Active Buses</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{dashboardData.totalBuses}</div>
                        </CardContent>
                    </Card>

                    <Card className="bg-white rounded-sm">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium text-gray-600">Active Routes</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{dashboardData.totalRoutes}</div>
                        </CardContent>
                    </Card>

                    <Card className="bg-white rounded-sm">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium text-gray-600">Monthly Bookings</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{dashboardData.monthlyBookings}</div>
                        </CardContent>
                    </Card>

                    <Card className="bg-white rounded-sm">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium text-gray-600">Monthly Revenue</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">LKR {dashboardData.revenue.toLocaleString()}</div>
                        </CardContent>
                    </Card>
                </div>

                {/* Charts Section */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Booking Status Pie Chart */}
                    <Card className="bg-white rounded-sm">
                        <CardHeader>
                            <CardTitle>Booking Status Distribution</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <ResponsiveContainer width="100%" height={300}>
                                <PieChart>
                                    <Pie
                                        data={pieData}
                                        cx="50%"
                                        cy="50%"
                                        labelLine={false}
                                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                                        outerRadius={80}
                                        fill="#8884d8"
                                        dataKey="value"
                                    >
                                        {pieData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                        ))}
                                    </Pie>
                                    <Tooltip />
                                </PieChart>
                            </ResponsiveContainer>
                        </CardContent>
                    </Card>

                    {/* Route Performance Bar Chart */}
                    <Card className="bg-white rounded-sm">
                        <CardHeader>
                            <CardTitle>Top Routes by Bookings</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <ResponsiveContainer width="100%" height={300}>
                                <BarChart data={dashboardData.bookingsByRoute.slice(0, 5)}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis dataKey="routeName" angle={-45} textAnchor="end" height={80} />
                                    <YAxis />
                                    <Tooltip />
                                    <Bar dataKey="bookings" fill="#3B82F6" />
                                </BarChart>
                            </ResponsiveContainer>
                        </CardContent>
                    </Card>
                </div>

                {/* Daily Bookings Line Chart */}
                <Card className="bg-white rounded-sm">
                    <CardHeader>
                        <CardTitle>Daily Bookings Trend (This Month)</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <ResponsiveContainer width="100%" height={300}>
                            <LineChart data={lineChartData}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="day" />
                                <YAxis yAxisId="left" />
                                <YAxis yAxisId="right" orientation="right" />
                                <Tooltip />
                                <Legend />
                                <Line yAxisId="left" type="monotone" dataKey="bookings" stroke="#3B82F6" name="Bookings" />
                                <Line yAxisId="right" type="monotone" dataKey="revenue" stroke="#10B981" name="Revenue (LKR)" />
                            </LineChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>

                {/* Routes and Buses Section */}
                <Card className="bg-white rounded-sm">
                    <CardHeader>
                        <CardTitle>Routes and Bus Occupancy</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {routesWithBuses.map((route) => (
                                <div key={route._id} className="border rounded-lg p-4">
                                    <div
                                        className="flex items-center justify-between cursor-pointer"
                                        onClick={() => toggleRoute(route._id)}
                                    >
                                        <div>
                                            <h3 className="font-semibold">{route.name}</h3>
                                            <p className="text-sm text-gray-600">
                                                {route.fromLocation} → {route.toLocation}
                                            </p>
                                        </div>
                                        <div className="flex items-center space-x-2">
                                            <span className="text-sm text-gray-500">{route.buses.length} buses</span>
                                            <ChevronRight
                                                className={`w-5 h-5 transition-transform ${expandedRoutes.has(route._id) ? 'rotate-90' : ''
                                                    }`}
                                            />
                                        </div>
                                    </div>

                                    {expandedRoutes.has(route._id) && (
                                        <div className="mt-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                                            {route.buses.map((bus) => (
                                                <div
                                                    key={bus._id}
                                                    className="bg-gray-50 p-3 rounded-lg cursor-pointer hover:bg-gray-100 transition-colors"
                                                    onClick={() => fetchBusDetails(bus._id)}
                                                >
                                                    <div className="flex justify-between items-start mb-2">
                                                        <div>
                                                            <p className="font-medium">{bus.busNumber}</p>
                                                            <p className="text-xs text-gray-500 capitalize">{bus.type}</p>
                                                        </div>
                                                        <span className={`text-xs px-2 py-1 rounded-full ${parseFloat(bus.occupancyRate) > 80
                                                                ? 'bg-red-100 text-red-700'
                                                                : parseFloat(bus.occupancyRate) > 50
                                                                    ? 'bg-yellow-100 text-yellow-700'
                                                                    : 'bg-green-100 text-green-700'
                                                            }`}>
                                                            {bus.occupancyRate}%
                                                        </span>
                                                    </div>
                                                    <div className="space-y-1">
                                                        <div className="flex justify-between text-xs">
                                                            <span className="text-gray-600">Capacity:</span>
                                                            <span className="font-medium">{bus.capacity}</span>
                                                        </div>
                                                        <div className="flex justify-between text-xs">
                                                            <span className="text-gray-600">Booked:</span>
                                                            <span className="font-medium text-red-600">{bus.bookedSeats}</span>
                                                        </div>
                                                        <div className="flex justify-between text-xs">
                                                            <span className="text-gray-600">Available:</span>
                                                            <span className="font-medium text-green-600">{bus.availableSeats}</span>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>

                {/* Bus Details Modal */}
<Dialog open={showBusModal} onOpenChange={setShowBusModal}>
    <DialogContent className="max-w-4xl">
        <DialogHeader>
            <DialogTitle>
                {busDetails?.bus.busNumber} - Seat Occupancy Details
            </DialogTitle>
        </DialogHeader>
        <div className="space-y-6">
            {busDetails && (
                <>
                    <div className="grid grid-cols-2 gap-6">
                        {/* Seat Occupancy Pie Chart */}
                        <div>
                            <h3 className="text-sm font-medium mb-3">Current Occupancy</h3>
                            <ResponsiveContainer width="100%" height={250}>
                                <PieChart>
                                    <Pie
                                        data={[
                                            { name: 'Booked', value: busDetails.bookedSeats },
                                            { name: 'Available', value: busDetails.availableSeats }
                                        ]}
                                        cx="50%"
                                        cy="50%"
                                        labelLine={false}
                                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                                        outerRadius={80}
                                        fill="#8884d8"
                                        dataKey="value"
                                    >
                                        <Cell fill="#EF4444" />
                                        <Cell fill="#10B981" />
                                    </Pie>
                                    <Tooltip 
                                        formatter={(value) => [value, 'Seats']}
                                    />
                                </PieChart>
                            </ResponsiveContainer>
                            {/* Debug info - remove in production */}
                            <div className="text-xs text-gray-500 mt-2">
                                Debug: Booked: {busDetails.bookedSeats}, Available: {busDetails.availableSeats}
                            </div>
                        </div>

                        {/* Weekly Trend */}
                        <div>
                            <h3 className="text-sm font-medium mb-3">7-Day Booking Trend</h3>
                            <ResponsiveContainer width="100%" height={250}>
                                <LineChart data={busDetails.weeklyTrend}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis 
                                        dataKey="_id" 
                                        tickFormatter={(value) => new Date(value).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                                    />
                                    <YAxis />
                                    <Tooltip 
                                        labelFormatter={(value) => new Date(value).toLocaleDateString()}
                                    />
                                    <Line type="monotone" dataKey="bookings" stroke="#3B82F6" />
                                </LineChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    {/* Bus Details */}
                    <div className="grid grid-cols-4 gap-4">
                        <div className="bg-gray-50 p-3 rounded">
                            <p className="text-xs text-gray-600">Total Seats</p>
                            <p className="text-xl font-bold">{busDetails.totalSeats}</p>
                        </div>
                        <div className="bg-red-50 p-3 rounded">
                            <p className="text-xs text-gray-600">Booked Seats</p>
                            <p className="text-xl font-bold text-red-600">{busDetails.bookedSeats}</p>
                        </div>
                        <div className="bg-green-50 p-3 rounded">
                            <p className="text-xs text-gray-600">Available Seats</p>
                            <p className="text-xl font-bold text-green-600">{busDetails.availableSeats}</p>
                        </div>
                        <div className="bg-blue-50 p-3 rounded">
                            <p className="text-xs text-gray-600">Occupancy Rate</p>
                            <p className="text-xl font-bold text-blue-600">{busDetails.occupancyRate}%</p>
                        </div>
                    </div>
                </>
            )}
        </div>
    </DialogContent>
</Dialog>
            </div>
        </DashboardLayout>
    );
}