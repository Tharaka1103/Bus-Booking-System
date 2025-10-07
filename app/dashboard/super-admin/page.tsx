'use client';

import DashboardLayout from '@/components/layout/DashboardLayout';
import { useAuth } from '@/contexts/AuthContext';
import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import {
    Users,
    Bus,
    Route,
    TrendingUp,
    ChevronRight,
    Loader2,
    DollarSign,
    Calendar,
    BarChart3,
    PieChart as PieChartIcon,
    RefreshCw,
    ChevronDown,
    ArrowUpRight,
    ArrowDownRight,
} from 'lucide-react';
import {
    PieChart,
    Pie,
    Cell,
    BarChart,
    Bar,
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer,
} from 'recharts';
import { cn } from '@/lib/utils';

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
                fetch('/api/dashboard/routes-buses', { credentials: 'include' }),
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

    const fetchBusDetails = async (busId: string) => {
        try {
            const today = new Date();
            const todayStr =
                today.getFullYear() +
                '-' +
                String(today.getMonth() + 1).padStart(2, '0') +
                '-' +
                String(today.getDate()).padStart(2, '0');

            const response = await fetch(`/api/dashboard/bus-seats/${busId}?date=${todayStr}`, {
                credentials: 'include',
            });

            if (response.ok) {
                const data = await response.json();
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
                <div className="flex items-center justify-center h-screen">
                    <div className="text-center">
                        <Loader2 className="w-12 h-12 animate-spin mx-auto mb-4 text-primary" />
                        <p className="text-gray-600">Loading dashboard analytics...</p>
                    </div>
                </div>
            </DashboardLayout>
        );
    }

    if (!dashboardData) {
        return (
            <DashboardLayout>
                <Card>
                    <CardContent className="flex items-center justify-center h-64">
                        <div className="text-center">
                            <BarChart3 className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                            <p className="text-gray-600">Failed to load dashboard data</p>
                            <Button onClick={fetchDashboardData} variant="outline" className="mt-4">
                                <RefreshCw className="w-4 h-4 mr-2" />
                                Retry
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </DashboardLayout>
        );
    }

    const pieData = dashboardData.bookingStats.map((stat) => ({
        name: stat._id.charAt(0).toUpperCase() + stat._id.slice(1),
        value: stat.count,
    }));

    const lineChartData = Array.from({ length: 30 }, (_, i) => {
        const dayData = dashboardData.dailyBookings.find((d) => d._id === i + 1);
        return {
            day: i + 1,
            bookings: dayData?.bookings || 0,
            revenue: dayData?.revenue || 0,
        };
    });

    return (
        <DashboardLayout>
            <div className="space-y-6">
                {/* Welcome Section */}
                <Card className="bg-gradient-to-r from-primary to-blue-600 border-none text-white overflow-hidden relative">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-32 -mt-32" />
                    <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/10 rounded-full -ml-24 -mb-24" />
                    <CardContent className="relative z-10 p-6 sm:p-8">
                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                            <div>
                                <h1 className="text-2xl sm:text-3xl font-bold mb-2">
                                    Welcome back, {user?.firstName}! 👋
                                </h1>
                                <p className="text-blue-100 text-sm sm:text-base">
                                    System Analytics Dashboard - Real-time insights and performance metrics
                                </p>
                            </div>
                            <Button
                                onClick={fetchDashboardData}
                                variant="secondary"
                                size="sm"
                                className="flex-shrink-0"
                            >
                                <RefreshCw className="w-4 h-4 mr-2" />
                                Refresh
                            </Button>
                        </div>
                    </CardContent>
                </Card>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
                    <Card className="hover:shadow-lg transition-shadow">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium text-gray-600">Total Users</CardTitle>
                            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                                <Users className="h-5 w-5 text-blue-600" />
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{dashboardData.totalUsers}</div>
                            <p className="text-xs text-gray-500 mt-1">Registered users</p>
                        </CardContent>
                    </Card>

                    <Card className="hover:shadow-lg transition-shadow">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium text-gray-600">Active Buses</CardTitle>
                            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                                <Bus className="h-5 w-5 text-green-600" />
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{dashboardData.totalBuses}</div>
                            <p className="text-xs text-gray-500 mt-1">In fleet</p>
                        </CardContent>
                    </Card>

                    <Card className="hover:shadow-lg transition-shadow">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium text-gray-600">Active Routes</CardTitle>
                            <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                                <Route className="h-5 w-5 text-purple-600" />
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{dashboardData.totalRoutes}</div>
                            <p className="text-xs text-gray-500 mt-1">Operational routes</p>
                        </CardContent>
                    </Card>

                    <Card className="hover:shadow-lg transition-shadow">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium text-gray-600">
                                Monthly Bookings
                            </CardTitle>
                            <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                                <Calendar className="h-5 w-5 text-orange-600" />
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{dashboardData.monthlyBookings}</div>
                            <p className="text-xs text-gray-500 mt-1">This month</p>
                        </CardContent>
                    </Card>

                    <Card className="hover:shadow-lg transition-shadow">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium text-gray-600">
                                Monthly Revenue
                            </CardTitle>
                            <div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center">
                                <DollarSign className="h-5 w-5 text-emerald-600" />
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">
                                LKR {dashboardData.revenue.toLocaleString()}
                            </div>
                            <p className="text-xs text-gray-500 mt-1">Total revenue</p>
                        </CardContent>
                    </Card>
                </div>

                {/* Charts Section */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Booking Status Pie Chart */}
                    <Card>
                        <CardHeader>
                            <div className="flex items-center justify-between">
                                <div>
                                    <CardTitle>Booking Status Distribution</CardTitle>
                                    <CardDescription className="mt-1">
                                        Overview of all booking statuses
                                    </CardDescription>
                                </div>
                                <PieChartIcon className="h-5 w-5 text-gray-400" />
                            </div>
                        </CardHeader>
                        <CardContent>
                            <ResponsiveContainer width="100%" height={350}>
                                <PieChart>
                                    <Pie
                                        data={pieData}
                                        cx="50%"
                                        cy="50%"
                                        labelLine={false}
                                        label={({ name, percent }) =>
                                            `${name} ${(percent * 100).toFixed(0)}%`
                                        }
                                        outerRadius={120}
                                        fill="#8884d8"
                                        dataKey="value"
                                    >
                                        {pieData.map((entry, index) => (
                                            <Cell
                                                key={`cell-${index}`}
                                                fill={COLORS[index % COLORS.length]}
                                            />
                                        ))}
                                    </Pie>
                                    <Tooltip />
                                    <Legend />
                                </PieChart>
                            </ResponsiveContainer>
                        </CardContent>
                    </Card>

                    {/* Route Performance Bar Chart */}
                    <Card>
                        <CardHeader>
                            <div className="flex items-center justify-between">
                                <div>
                                    <CardTitle>Top Routes by Bookings</CardTitle>
                                    <CardDescription className="mt-1">
                                        Most popular routes this month
                                    </CardDescription>
                                </div>
                                <BarChart3 className="h-5 w-5 text-gray-400" />
                            </div>
                        </CardHeader>
                        <CardContent>
                            <ResponsiveContainer width="100%" height={350}>
                                <BarChart data={dashboardData.bookingsByRoute.slice(0, 5)}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                                    <XAxis
                                        dataKey="routeName"
                                        angle={-20}
                                        textAnchor="end"
                                        height={100}
                                        tick={{ fontSize: 12 }}
                                    />
                                    <YAxis tick={{ fontSize: 12 }} />
                                    <Tooltip
                                        contentStyle={{
                                            backgroundColor: 'white',
                                            border: '1px solid #e5e7eb',
                                            borderRadius: '8px',
                                        }}
                                    />
                                    <Legend />
                                    <Bar dataKey="bookings" fill="#3B82F6" name="Bookings" radius={[8, 8, 0, 0]} />
                                </BarChart>
                            </ResponsiveContainer>
                        </CardContent>
                    </Card>
                </div>

                {/* Daily Bookings Line Chart */}
                <Card>
                    <CardHeader>
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                            <div>
                                <CardTitle>Daily Bookings & Revenue Trend</CardTitle>
                                <CardDescription className="mt-1">
                                    Performance overview for this month
                                </CardDescription>
                            </div>
                            <Badge variant="outline" className="self-start sm:self-center">
                                <TrendingUp className="w-3 h-3 mr-1" />
                                Last 30 days
                            </Badge>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <ResponsiveContainer width="100%" height={400}>
                            <LineChart data={lineChartData}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                                <XAxis dataKey="day" tick={{ fontSize: 12 }} label={{ value: 'Day of Month', position: 'insideBottom', offset: -5 }} />
                                <YAxis yAxisId="left" tick={{ fontSize: 12 }} />
                                <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 12 }} />
                                <Tooltip
                                    contentStyle={{
                                        backgroundColor: 'white',
                                        border: '1px solid #e5e7eb',
                                        borderRadius: '8px',
                                    }}
                                />
                                <Legend />
                                <Line
                                    yAxisId="left"
                                    type="monotone"
                                    dataKey="bookings"
                                    stroke="#3B82F6"
                                    strokeWidth={2}
                                    name="Bookings"
                                    dot={{ r: 3 }}
                                    activeDot={{ r: 5 }}
                                />
                                <Line
                                    yAxisId="right"
                                    type="monotone"
                                    dataKey="revenue"
                                    stroke="#10B981"
                                    strokeWidth={2}
                                    name="Revenue (LKR)"
                                    dot={{ r: 3 }}
                                    activeDot={{ r: 5 }}
                                />
                            </LineChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>

                {/* Routes and Buses Section */}
                <Card>
                    <CardHeader>
                        <div className="flex items-center justify-between">
                            <div>
                                <CardTitle>Routes & Bus Occupancy</CardTitle>
                                <CardDescription className="mt-1">
                                    Real-time seat availability and occupancy rates
                                </CardDescription>
                            </div>
                            <Badge variant="secondary">{routesWithBuses.length} Routes</Badge>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <ScrollArea className="h-[600px] pr-4">
                            <div className="space-y-4">
                                {routesWithBuses.map((route) => (
                                    <Card key={route._id} className="border-2 hover:border-primary/50 transition-all">
                                        <CardHeader
                                            className="cursor-pointer hover:bg-gray-50 transition-colors"
                                            onClick={() => toggleRoute(route._id)}
                                        >
                                            <div className="flex items-center justify-between">
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-center gap-2 mb-1">
                                                        <Route className="w-5 h-5 text-primary flex-shrink-0" />
                                                        <h3 className="font-semibold text-lg truncate">
                                                            {route.name}
                                                        </h3>
                                                    </div>
                                                    <p className="text-sm text-gray-600 flex items-center gap-1">
                                                        <span className="truncate">{route.fromLocation}</span>
                                                        <ArrowUpRight className="w-3 h-3 flex-shrink-0" />
                                                        <span className="truncate">{route.toLocation}</span>
                                                    </p>
                                                </div>
                                                <div className="flex items-center gap-3 flex-shrink-0">
                                                    <Badge variant="outline">{route.buses.length} buses</Badge>
                                                    <ChevronDown
                                                        className={cn(
                                                            'w-5 h-5 text-gray-400 transition-transform duration-200',
                                                            expandedRoutes.has(route._id) && 'rotate-180'
                                                        )}
                                                    />
                                                </div>
                                            </div>
                                        </CardHeader>

                                        {expandedRoutes.has(route._id) && (
                                            <CardContent className="pt-0">
                                                <Separator className="mb-4" />
                                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                                                    {route.buses.map((bus) => {
                                                        const occupancy = parseFloat(bus.occupancyRate);
                                                        return (
                                                            <Card
                                                                key={bus._id}
                                                                className="cursor-pointer hover:shadow-md transition-all hover:border-primary/50"
                                                                onClick={() => fetchBusDetails(bus._id)}
                                                            >
                                                                <CardContent className="p-4">
                                                                    <div className="flex justify-between items-start mb-3">
                                                                        <div className="flex items-center gap-2">
                                                                            <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                                                                                <Bus className="w-5 h-5 text-primary" />
                                                                            </div>
                                                                            <div>
                                                                                <p className="font-semibold">
                                                                                    {bus.busNumber}
                                                                                </p>
                                                                                <p className="text-xs text-gray-500 capitalize">
                                                                                    {bus.type}
                                                                                </p>
                                                                            </div>
                                                                        </div>
                                                                        <Badge
                                                                            className={cn(
                                                                                'text-xs font-semibold',
                                                                                occupancy > 80
                                                                                    ? 'bg-red-100 text-red-700'
                                                                                    : occupancy > 50
                                                                                    ? 'bg-yellow-100 text-yellow-700'
                                                                                    : 'bg-green-100 text-green-700'
                                                                            )}
                                                                        >
                                                                            {bus.occupancyRate}%
                                                                        </Badge>
                                                                    </div>

                                                                    <div className="space-y-2">
                                                                        <div className="flex justify-between text-sm">
                                                                            <span className="text-gray-600">
                                                                                Capacity:
                                                                            </span>
                                                                            <span className="font-medium">
                                                                                {bus.capacity} seats
                                                                            </span>
                                                                        </div>
                                                                        <div className="flex justify-between text-sm">
                                                                            <span className="text-gray-600">Booked:</span>
                                                                            <span className="font-medium text-red-600">
                                                                                {bus.bookedSeats} seats
                                                                            </span>
                                                                        </div>
                                                                        <div className="flex justify-between text-sm">
                                                                            <span className="text-gray-600">
                                                                                Available:
                                                                            </span>
                                                                            <span className="font-medium text-green-600">
                                                                                {bus.availableSeats} seats
                                                                            </span>
                                                                        </div>

                                                                        {/* Visual Progress Bar */}
                                                                        <div className="mt-3">
                                                                            <div className="w-full bg-gray-200 rounded-full h-2">
                                                                                <div
                                                                                    className={cn(
                                                                                        'h-2 rounded-full transition-all',
                                                                                        occupancy > 80
                                                                                            ? 'bg-red-500'
                                                                                            : occupancy > 50
                                                                                            ? 'bg-yellow-500'
                                                                                            : 'bg-green-500'
                                                                                    )}
                                                                                    style={{ width: `${occupancy}%` }}
                                                                                />
                                                                            </div>
                                                                        </div>
                                                                    </div>
                                                                </CardContent>
                                                            </Card>
                                                        );
                                                    })}
                                                </div>
                                            </CardContent>
                                        )}
                                    </Card>
                                ))}
                            </div>
                        </ScrollArea>
                    </CardContent>
                </Card>

                {/* Bus Details Modal */}
                <Dialog open={showBusModal} onOpenChange={setShowBusModal}>
                    <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
                        <DialogHeader>
                            <DialogTitle className="flex items-center gap-2">
                                <Bus className="w-5 h-5" />
                                {busDetails?.bus.busNumber} - Seat Occupancy Details
                            </DialogTitle>
                            <DialogDescription>
                                Real-time seat availability and booking trends
                            </DialogDescription>
                        </DialogHeader>
                        <div className="space-y-6 py-4">
                            {busDetails && (
                                <>
                                    {/* Summary Stats */}
                                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                                        <Card>
                                            <CardContent className="p-4">
                                                <p className="text-xs text-gray-600 mb-1">Total Seats</p>
                                                <p className="text-2xl font-bold">{busDetails.totalSeats}</p>
                                            </CardContent>
                                        </Card>
                                        <Card className="bg-red-50">
                                            <CardContent className="p-4">
                                                <p className="text-xs text-gray-600 mb-1">Booked Seats</p>
                                                <p className="text-2xl font-bold text-red-600">
                                                    {busDetails.bookedSeats}
                                                </p>
                                            </CardContent>
                                        </Card>
                                        <Card className="bg-green-50">
                                            <CardContent className="p-4">
                                                <p className="text-xs text-gray-600 mb-1">Available Seats</p>
                                                <p className="text-2xl font-bold text-green-600">
                                                    {busDetails.availableSeats}
                                                </p>
                                            </CardContent>
                                        </Card>
                                        <Card className="bg-blue-50">
                                            <CardContent className="p-4">
                                                <p className="text-xs text-gray-600 mb-1">Occupancy Rate</p>
                                                <p className="text-2xl font-bold text-blue-600">
                                                    {busDetails.occupancyRate}%
                                                </p>
                                            </CardContent>
                                        </Card>
                                    </div>

                                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                        {/* Seat Occupancy Pie Chart */}
                                        <Card>
                                            <CardHeader>
                                                <CardTitle className="text-base">Current Occupancy</CardTitle>
                                                <CardDescription>Seat distribution overview</CardDescription>
                                            </CardHeader>
                                            <CardContent>
                                                <ResponsiveContainer width="100%" height={300}>
                                                    <PieChart>
                                                        <Pie
                                                            data={[
                                                                { name: 'Booked', value: busDetails.bookedSeats },
                                                                {
                                                                    name: 'Available',
                                                                    value: busDetails.availableSeats,
                                                                },
                                                            ]}
                                                            cx="50%"
                                                            cy="50%"
                                                            labelLine={false}
                                                            label={({ name, percent }) =>
                                                                `${name} ${(percent * 100).toFixed(0)}%`
                                                            }
                                                            outerRadius={100}
                                                            fill="#8884d8"
                                                            dataKey="value"
                                                        >
                                                            <Cell fill="#EF4444" />
                                                            <Cell fill="#10B981" />
                                                        </Pie>
                                                        <Tooltip formatter={(value) => [value, 'Seats']} />
                                                        <Legend />
                                                    </PieChart>
                                                </ResponsiveContainer>
                                            </CardContent>
                                        </Card>

                                        {/* Weekly Trend */}
                                        <Card>
                                            <CardHeader>
                                                <CardTitle className="text-base">7-Day Booking Trend</CardTitle>
                                                <CardDescription>Historical booking pattern</CardDescription>
                                            </CardHeader>
                                            <CardContent>
                                                <ResponsiveContainer width="100%" height={300}>
                                                    <LineChart data={busDetails.weeklyTrend}>
                                                        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                                                        <XAxis
                                                            dataKey="_id"
                                                            tickFormatter={(value) =>
                                                                new Date(value).toLocaleDateString('en-US', {
                                                                    month: 'short',
                                                                    day: 'numeric',
                                                                })
                                                            }
                                                            tick={{ fontSize: 12 }}
                                                        />
                                                        <YAxis tick={{ fontSize: 12 }} />
                                                        <Tooltip
                                                            labelFormatter={(value) =>
                                                                new Date(value).toLocaleDateString()
                                                            }
                                                            contentStyle={{
                                                                backgroundColor: 'white',
                                                                border: '1px solid #e5e7eb',
                                                                borderRadius: '8px',
                                                            }}
                                                        />
                                                        <Legend />
                                                        <Line
                                                            type="monotone"
                                                            dataKey="bookings"
                                                            stroke="#3B82F6"
                                                            strokeWidth={2}
                                                            name="Bookings"
                                                            dot={{ r: 4 }}
                                                            activeDot={{ r: 6 }}
                                                        />
                                                    </LineChart>
                                                </ResponsiveContainer>
                                            </CardContent>
                                        </Card>
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