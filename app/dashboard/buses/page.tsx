'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import {
    Plus,
    Edit2,
    Trash2,
    Search,
    Bus as BusIcon,
    Users,
    Clock,
    MoreHorizontal,
    Info,
    RefreshCw,
    Filter,
    Loader2,
    MapPin,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import {
    ContextMenu,
    ContextMenuContent,
    ContextMenuItem,
    ContextMenuTrigger,
    ContextMenuSeparator,
} from '@/components/ui/context-menu';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Checkbox } from '@/components/ui/checkbox';
import { toast } from 'sonner';
import { IBus, IRoute, CreateBusRequest } from '@/types';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { cn } from '@/lib/utils';

const BUS_TYPES = [
    { value: 'luxury', label: 'Luxury' },
    { value: 'semi_luxury', label: 'Semi Luxury' },
    { value: 'normal', label: 'Normal' },
];

const COMMON_AMENITIES = ['AC', 'WiFi', 'TV', 'USB Charging', 'Water Bottle', 'Blanket'];

export default function BusesPage() {
    const { hasPermission } = useAuth();
    const router = useRouter();
    const [buses, setBuses] = useState<IBus[]>([]);
    const [routes, setRoutes] = useState<IRoute[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [typeFilter, setTypeFilter] = useState<string>('all');
    const [statusFilter, setStatusFilter] = useState<string>('all');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const [editingBus, setEditingBus] = useState<IBus | null>(null);
    const [selectedBus, setSelectedBus] = useState<IBus | null>(null);
    const [formData, setFormData] = useState<CreateBusRequest>({
        busNumber: '',
        type: 'normal',
        capacity: 40,
        amenities: [],
        departureTime: '08:00',
        routeId: '',
    });
    const [formLoading, setFormLoading] = useState(false);
    const [errors, setErrors] = useState<Record<string, string>>({});

    useEffect(() => {
        if (!hasPermission('buses:read')) {
            router.push('/dashboard');
            return;
        }
        fetchBuses();
        fetchRoutes();
    }, [hasPermission, router]);

    const fetchBuses = async () => {
        try {
            setLoading(true);
            const response = await fetch('/api/buses', {
                headers: { 'Content-Type': 'application/json' },
            });
            const data = await response.json();
            if (data.success) {
                setBuses(data.data);
            }
        } catch (error) {
            toast.error('Failed to fetch buses');
        } finally {
            setLoading(false);
        }
    };

    const fetchRoutes = async () => {
        try {
            const response = await fetch('/api/routes', {
                headers: { 'Content-Type': 'application/json' },
            });
            const data = await response.json();
            if (data.success) {
                setRoutes(data.data.filter((route: IRoute) => route.isActive));
            }
        } catch (error) {
            toast.error('Failed to fetch routes');
        }
    };

    const validateForm = () => {
        const newErrors: Record<string, string> = {};

        if (!formData.busNumber || !formData.busNumber.trim()) {
            newErrors.busNumber = 'Bus number is required';
        }

        if (!formData.capacity || formData.capacity <= 0) {
            newErrors.capacity = 'Capacity must be greater than 0';
        }

        if (!formData.departureTime) {
            newErrors.departureTime = 'Departure time is required';
        } else {
            const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;
            if (!timeRegex.test(formData.departureTime)) {
                newErrors.departureTime = 'Invalid time format';
            }
        }

        if (!formData.routeId) {
            newErrors.routeId = 'Route is required';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!validateForm()) {
            toast.error('Please fill all required fields correctly');
            return;
        }

        setFormLoading(true);

        try {
            const url = editingBus ? `/api/buses/${editingBus._id}` : '/api/buses';
            const method = editingBus ? 'PUT' : 'POST';

            const payload: CreateBusRequest = {
                busNumber: formData.busNumber.trim(),
                type: formData.type,
                capacity: Number(formData.capacity),
                amenities: formData.amenities || [],
                departureTime: formData.departureTime || '08:00',
                routeId: formData.routeId,
            };

            const response = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            });

            const data = await response.json();

            if (data.success) {
                toast.success(editingBus ? 'Bus updated successfully' : 'Bus created successfully');
                await fetchBuses();
                resetForm();
            } else {
                toast.error(data.message || 'Operation failed');
            }
        } catch (error) {
            toast.error('Operation failed');
        } finally {
            setFormLoading(false);
        }
    };

    const handleViewDetails = (bus: IBus) => {
        setSelectedBus(bus);
        setIsDetailModalOpen(true);
    };

    const handleDelete = (bus: IBus) => {
        setSelectedBus(bus);
        setIsDeleteDialogOpen(true);
        setIsDetailModalOpen(false);
    };

    const confirmDeleteBus = async () => {
        if (!selectedBus) return;

        try {
            const response = await fetch(`/api/buses/${selectedBus._id}`, {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' },
            });

            const data = await response.json();
            if (data.success) {
                toast.success('Bus deleted successfully');
                setIsDeleteDialogOpen(false);
                setSelectedBus(null);
                fetchBuses();
            } else {
                toast.error(data.message);
            }
        } catch (error) {
            toast.error('Failed to delete bus');
        }
    };

    const handleEdit = (bus: IBus) => {
        setEditingBus(bus);
        setFormData({
            busNumber: bus.busNumber,
            type: bus.type,
            capacity: bus.capacity,
            amenities: bus.amenities || [],
            departureTime: bus.departureTime || '08:00',
            routeId: typeof bus.routeId === 'object' ? bus.routeId._id : bus.routeId || '',
        });
        setIsModalOpen(true);
        setIsDetailModalOpen(false);
    };

    const handleCreateBus = () => {
        resetForm();
        setIsModalOpen(true);
    };

    const resetForm = () => {
        setFormData({
            busNumber: '',
            type: 'normal',
            capacity: 40,
            amenities: [],
            departureTime: '08:00',
            routeId: '',
        });
        setEditingBus(null);
        setIsModalOpen(false);
        setErrors({});
    };

    const toggleAmenity = (amenity: string) => {
        setFormData({
            ...formData,
            amenities: formData.amenities.includes(amenity)
                ? formData.amenities.filter((a) => a !== amenity)
                : [...formData.amenities, amenity],
        });
    };

    const filteredBuses = buses.filter((bus) => {
        const matchesSearch =
            bus.busNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
            bus.type.toLowerCase().includes(searchTerm.toLowerCase());

        const matchesType = typeFilter === 'all' || bus.type === typeFilter;

        const matchesStatus =
            statusFilter === 'all' ||
            (statusFilter === 'active' && bus.isActive) ||
            (statusFilter === 'inactive' && !bus.isActive);

        return matchesSearch && matchesType && matchesStatus;
    });

    const getBusTypeColor = (type: string) => {
        switch (type) {
            case 'luxury':
                return 'default';
            case 'semi_luxury':
                return 'secondary';
            default:
                return 'outline';
        }
    };

    const formatTime = (time?: string) => {
        if (!time) return 'Not set';

        try {
            const [hours, minutes] = time.split(':');
            const hour = parseInt(hours);

            if (isNaN(hour)) {
                return 'Not set';
            }

            const ampm = hour >= 12 ? 'PM' : 'AM';
            const displayHour = hour % 12 || 12;
            return `${displayHour}:${minutes} ${ampm}`;
        } catch (error) {
            return 'Not set';
        }
    };

    // Calculate stats
    const activeBuses = buses.filter((bus) => bus.isActive).length;
    const luxuryBuses = buses.filter((bus) => bus.type === 'luxury').length;
    const totalCapacity = buses.reduce((sum, bus) => sum + bus.capacity, 0);

    if (!hasPermission('buses:read')) {
        return (
            <DashboardLayout>
                <Card>
                    <CardContent className="flex items-center justify-center h-64">
                        <div className="text-center">
                            <BusIcon className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                            <p className="text-gray-600">You don't have permission to view buses.</p>
                        </div>
                    </CardContent>
                </Card>
            </DashboardLayout>
        );
    }

    return (
        <DashboardLayout>
            <div className="space-y-6">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Bus Management</h1>
                        <p className="text-sm text-gray-600 mt-1">Manage your fleet of buses</p>
                    </div>
                    <div className="block space-y-3 md:space-y-0 items-center gap-5 md:flex">
                        <Button variant="outline" size="sm" onClick={fetchBuses} className="w-full sm:w-auto">
                            <RefreshCw className="w-4 h-4 mr-2" />
                            Refresh
                        </Button>
                        {hasPermission('buses:write') && (
                            <Button onClick={handleCreateBus} size="sm" className="w-full sm:w-auto">
                                <Plus className="w-4 h-4 mr-2" />
                                Add Bus
                            </Button>
                        )}
                    </div>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
                    <Card className="rounded-sm border-none">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Total Buses</CardTitle>
                            <BusIcon className="h-4 w-4 text-gray-600" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{buses.length}</div>
                            <p className="text-xs text-gray-600 mt-1">All registered buses</p>
                        </CardContent>
                    </Card>
                    <Card className="rounded-sm border-none">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Active Buses</CardTitle>
                            <BusIcon className="h-4 w-4 text-green-600" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{activeBuses}</div>
                            <p className="text-xs text-gray-600 mt-1">Currently active</p>
                        </CardContent>
                    </Card>
                    <Card className="rounded-sm border-none">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Luxury Buses</CardTitle>
                            <BusIcon className="h-4 w-4 text-blue-600" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{luxuryBuses}</div>
                            <p className="text-xs text-gray-600 mt-1">Premium category</p>
                        </CardContent>
                    </Card>
                    <Card className="rounded-sm border-none">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Total Capacity</CardTitle>
                            <Users className="h-4 w-4 text-orange-600" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{totalCapacity}</div>
                            <p className="text-xs text-gray-600 mt-1">Total seats available</p>
                        </CardContent>
                    </Card>
                </div>

                {/* Search and Buses Table */}
                <Card className="rounded-sm border-none">
                    <CardHeader>
                        <CardTitle className="text-lg">Bus List</CardTitle>
                        <CardDescription>View and manage all buses in the fleet</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="flex flex-col gap-4 mb-6">
                            <div className="relative flex-1">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                                <Input
                                    type="search"
                                    placeholder="Search buses by number or type..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="pl-10"
                                />
                            </div>
                            <div className="flex flex-col sm:flex-row gap-2">
                                <Select value={typeFilter} onValueChange={setTypeFilter}>
                                    <SelectTrigger className="w-full sm:w-[160px]">
                                        <Filter className="w-4 h-4 mr-2" />
                                        <SelectValue placeholder="Type" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">All Types</SelectItem>
                                        <SelectItem value="luxury">Luxury</SelectItem>
                                        <SelectItem value="semi_luxury">Semi Luxury</SelectItem>
                                        <SelectItem value="normal">Normal</SelectItem>
                                    </SelectContent>
                                </Select>
                                <Select value={statusFilter} onValueChange={setStatusFilter}>
                                    <SelectTrigger className="w-full sm:w-[160px]">
                                        <SelectValue placeholder="Status" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">All Status</SelectItem>
                                        <SelectItem value="active">Active</SelectItem>
                                        <SelectItem value="inactive">Inactive</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        {loading ? (
                            <div className="flex items-center justify-center h-64">
                                <div className="text-center">
                                    <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-primary" />
                                    <p className="text-gray-600">Loading buses...</p>
                                </div>
                            </div>
                        ) : filteredBuses.length === 0 ? (
                            <div className="flex items-center justify-center h-64">
                                <div className="text-center">
                                    <BusIcon className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                                    <p className="text-gray-600">No buses found</p>
                                    <p className="text-sm text-gray-500 mt-1">
                                        Try adjusting your search or filters
                                    </p>
                                </div>
                            </div>
                        ) : (
                            <div className="overflow-x-auto">
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Bus Number</TableHead>
                                            <TableHead className="hidden md:table-cell">Type</TableHead>
                                            <TableHead className="hidden lg:table-cell">Capacity</TableHead>
                                            <TableHead className="hidden lg:table-cell">Route</TableHead>
                                            <TableHead className="hidden lg:table-cell">Departure</TableHead>
                                            <TableHead className="hidden md:table-cell">Status</TableHead>
                                            <TableHead>Actions</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {filteredBuses.map((bus) => (
                                            <ContextMenu key={bus._id}>
                                                <ContextMenuTrigger asChild>
                                                    <TableRow className="cursor-context-menu hover:bg-gray-50">
                                                        <TableCell>
                                                            <div className="flex items-center gap-3">
                                                                <div className="w-10 h-10 bg-primary text-white rounded-full flex items-center justify-center flex-shrink-0">
                                                                    <BusIcon className="w-5 h-5" />
                                                                </div>
                                                                <div className="min-w-0">
                                                                    <p className="font-medium text-gray-900 truncate">
                                                                        {bus.busNumber}
                                                                    </p>
                                                                    <p className="text-sm text-gray-600 truncate md:hidden">
                                                                        {bus.type.replace('_', ' ')} • {bus.capacity} seats
                                                                    </p>
                                                                    <div className="flex gap-2 mt-1 md:hidden">
                                                                        <Badge variant={getBusTypeColor(bus.type)}>
                                                                            {bus.type.replace('_', ' ')}
                                                                        </Badge>
                                                                        <Badge variant={bus.isActive ? 'default' : 'secondary'}>
                                                                            {bus.isActive ? 'Active' : 'Inactive'}
                                                                        </Badge>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </TableCell>
                                                        <TableCell className="hidden md:table-cell">
                                                            <Badge variant={getBusTypeColor(bus.type)}>
                                                                {bus.type.replace('_', ' ')}
                                                            </Badge>
                                                        </TableCell>
                                                        <TableCell className="hidden lg:table-cell">
                                                            <div className="flex items-center">
                                                                <Users className="w-4 h-4 mr-1 text-gray-400" />
                                                                {bus.capacity} seats
                                                            </div>
                                                        </TableCell>
                                                        <TableCell className="hidden lg:table-cell">
                                                            {typeof bus.routeId === 'object' && bus.routeId ? (
                                                                <div className="space-y-1">
                                                                    <p className="font-medium text-gray-900">
                                                                        {bus.routeId.name}
                                                                    </p>
                                                                    <p className="text-sm text-gray-600">
                                                                        {bus.routeId.fromLocation} → {bus.routeId.toLocation}
                                                                    </p>
                                                                </div>
                                                            ) : (
                                                                <span className="text-gray-400">No route assigned</span>
                                                            )}
                                                        </TableCell>
                                                        <TableCell className="hidden lg:table-cell">
                                                            <div className="flex items-center">
                                                                <Clock className="w-4 h-4 mr-1 text-gray-400" />
                                                                {formatTime(bus.departureTime)}
                                                            </div>
                                                        </TableCell>
                                                        <TableCell className="hidden md:table-cell">
                                                            <Badge variant={bus.isActive ? 'default' : 'secondary'}>
                                                                {bus.isActive ? 'Active' : 'Inactive'}
                                                            </Badge>
                                                        </TableCell>
                                                        <TableCell>
                                                            <DropdownMenu>
                                                                <DropdownMenuTrigger asChild>
                                                                    <Button variant="ghost" className="h-8 w-8 p-0">
                                                                        <MoreHorizontal className="h-4 w-4" />
                                                                    </Button>
                                                                </DropdownMenuTrigger>
                                                                <DropdownMenuContent align="end">
                                                                    <DropdownMenuItem onClick={() => handleViewDetails(bus)}>
                                                                        <Info className="w-4 h-4 mr-2" />
                                                                        View Details
                                                                    </DropdownMenuItem>
                                                                    {hasPermission('buses:write') && (
                                                                        <DropdownMenuItem onClick={() => handleEdit(bus)}>
                                                                            <Edit2 className="w-4 h-4 mr-2" />
                                                                            Edit Bus
                                                                        </DropdownMenuItem>
                                                                    )}
                                                                    {hasPermission('buses:delete') && (
                                                                        <>
                                                                            <Separator className="my-1" />
                                                                            <DropdownMenuItem
                                                                                onClick={() => handleDelete(bus)}
                                                                                className="text-red-600 focus:text-red-600"
                                                                            >
                                                                                <Trash2 className="w-4 h-4 mr-2" />
                                                                                Delete Bus
                                                                            </DropdownMenuItem>
                                                                        </>
                                                                    )}
                                                                </DropdownMenuContent>
                                                            </DropdownMenu>
                                                        </TableCell>
                                                    </TableRow>
                                                </ContextMenuTrigger>
                                                <ContextMenuContent className="w-56">
                                                    <ContextMenuItem onClick={() => handleViewDetails(bus)}>
                                                        <Info className="w-4 h-4 mr-2" />
                                                        View Details
                                                    </ContextMenuItem>
                                                    {hasPermission('buses:write') && (
                                                        <ContextMenuItem onClick={() => handleEdit(bus)}>
                                                            <Edit2 className="w-4 h-4 mr-2" />
                                                            Edit Bus
                                                        </ContextMenuItem>
                                                    )}
                                                    {hasPermission('buses:delete') && (
                                                        <>
                                                            <ContextMenuSeparator />
                                                            <ContextMenuItem
                                                                onClick={() => handleDelete(bus)}
                                                                className="text-red-600 focus:text-red-600"
                                                            >
                                                                <Trash2 className="w-4 h-4 mr-2" />
                                                                Delete Bus
                                                            </ContextMenuItem>
                                                        </>
                                                    )}
                                                </ContextMenuContent>
                                            </ContextMenu>
                                        ))}
                                    </TableBody>
                                </Table>
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Bus Details Modal */}
                <Dialog open={isDetailModalOpen} onOpenChange={setIsDetailModalOpen}>
                    <DialogContent className="sm:max-w-[525px]">
                        <DialogHeader>
                            <DialogTitle>Bus Details</DialogTitle>
                            <DialogDescription>Complete bus information</DialogDescription>
                        </DialogHeader>
                        {selectedBus && (
                            <ScrollArea className="max-h-[60vh]">
                                <div className="grid gap-4 py-4">
                                    <div className="flex flex-col items-center text-center pb-4 border-b">
                                        <div className="w-20 h-20 bg-primary text-white rounded-full flex items-center justify-center mb-3">
                                            <BusIcon className="w-10 h-10" />
                                        </div>
                                        <h3 className="text-xl font-bold text-gray-900">
                                            {selectedBus.busNumber}
                                        </h3>
                                        <p className="text-sm text-gray-600 mt-1">
                                            {selectedBus.type.replace('_', ' ')}
                                        </p>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-1">
                                            <p className="text-sm text-gray-500">Bus Type</p>
                                            <Badge variant={getBusTypeColor(selectedBus.type)}>
                                                {selectedBus.type.replace('_', ' ')}
                                            </Badge>
                                        </div>
                                        <div className="space-y-1">
                                            <p className="text-sm text-gray-500">Status</p>
                                            <Badge variant={selectedBus.isActive ? 'default' : 'secondary'}>
                                                {selectedBus.isActive ? 'Active' : 'Inactive'}
                                            </Badge>
                                        </div>
                                        <div className="space-y-1">
                                            <p className="text-sm text-gray-500">Capacity</p>
                                            <div className="flex items-center gap-2">
                                                <Users className="w-4 h-4 text-gray-400" />
                                                <p className="text-sm font-medium">{selectedBus.capacity} seats</p>
                                            </div>
                                        </div>
                                        <div className="space-y-1">
                                            <p className="text-sm text-gray-500">Departure Time</p>
                                            <div className="flex items-center gap-2">
                                                <Clock className="w-4 h-4 text-gray-400" />
                                                <p className="text-sm font-medium">
                                                    {formatTime(selectedBus.departureTime)}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="space-y-1 col-span-2">
                                            <p className="text-sm text-gray-500">Assigned Route</p>
                                            {typeof selectedBus.routeId === 'object' && selectedBus.routeId ? (
                                                <div className="space-y-1">
                                                    <p className="text-sm font-medium">{selectedBus.routeId.name}</p>
                                                    <div className="flex items-center gap-2 text-sm text-gray-600">
                                                        <MapPin className="w-3 h-3" />
                                                        {selectedBus.routeId.fromLocation} →{' '}
                                                        {selectedBus.routeId.toLocation}
                                                    </div>
                                                </div>
                                            ) : (
                                                <p className="text-sm text-gray-500">No route assigned</p>
                                            )}
                                        </div>
                                        <div className="space-y-1 col-span-2">
                                            <p className="text-sm text-gray-500">Amenities</p>
                                            <div className="flex flex-wrap gap-2">
                                                {selectedBus.amenities && selectedBus.amenities.length > 0 ? (
                                                    selectedBus.amenities.map((amenity, index) => (
                                                        <Badge key={index} variant="secondary">
                                                            {amenity}
                                                        </Badge>
                                                    ))
                                                ) : (
                                                    <p className="text-sm text-gray-500">No amenities</p>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </ScrollArea>
                        )}
                        <DialogFooter className="gap-2">
                            {hasPermission('buses:write') && selectedBus && (
                                <Button
                                    variant="outline"
                                    onClick={() => handleEdit(selectedBus)}
                                    className="w-full sm:w-auto"
                                >
                                    <Edit2 className="w-4 h-4 mr-2" />
                                    Edit Bus
                                </Button>
                            )}
                            {hasPermission('buses:delete') && selectedBus && (
                                <Button
                                    variant="destructive"
                                    onClick={() => handleDelete(selectedBus)}
                                    className="w-full sm:w-auto"
                                >
                                    <Trash2 className="w-4 h-4 mr-2" />
                                    Delete Bus
                                </Button>
                            )}
                        </DialogFooter>
                    </DialogContent>
                </Dialog>

                {/* Create/Edit Bus Modal */}
                <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
                    <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
                        <DialogHeader>
                            <DialogTitle>{editingBus ? 'Edit Bus' : 'Add New Bus'}</DialogTitle>
                            <DialogDescription>
                                {editingBus
                                    ? 'Update bus information and settings.'
                                    : 'Add a new bus to your fleet.'}
                            </DialogDescription>
                        </DialogHeader>
                        <form onSubmit={handleSubmit}>
                            <div className="space-y-4 py-4">
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="busNumber">
                                            Bus Number <span className="text-red-500">*</span>
                                        </Label>
                                        <Input
                                            id="busNumber"
                                            value={formData.busNumber}
                                            onChange={(e) =>
                                                setFormData({ ...formData, busNumber: e.target.value })
                                            }
                                            placeholder="e.g., VT-001"
                                            className={errors.busNumber ? 'border-red-500' : ''}
                                        />
                                        {errors.busNumber && (
                                            <p className="text-xs text-red-600">{errors.busNumber}</p>
                                        )}
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="type">
                                            Bus Type <span className="text-red-500">*</span>
                                        </Label>
                                        <Select
                                            value={formData.type}
                                            onValueChange={(value) =>
                                                setFormData({ ...formData, type: value as any })
                                            }
                                        >
                                            <SelectTrigger>
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {BUS_TYPES.map((type) => (
                                                    <SelectItem key={type.value} value={type.value}>
                                                        {type.label}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="capacity">
                                            Capacity (seats) <span className="text-red-500">*</span>
                                        </Label>
                                        <Input
                                            id="capacity"
                                            type="number"
                                            value={formData.capacity}
                                            onChange={(e) =>
                                                setFormData({ ...formData, capacity: Number(e.target.value) })
                                            }
                                            min="1"
                                            max="100"
                                            className={errors.capacity ? 'border-red-500' : ''}
                                        />
                                        {errors.capacity && (
                                            <p className="text-xs text-red-600">{errors.capacity}</p>
                                        )}
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="departureTime">
                                            Departure Time <span className="text-red-500">*</span>
                                        </Label>
                                        <Input
                                            id="departureTime"
                                            type="time"
                                            value={formData.departureTime}
                                            onChange={(e) =>
                                                setFormData({ ...formData, departureTime: e.target.value })
                                            }
                                            className={errors.departureTime ? 'border-red-500' : ''}
                                        />
                                        {errors.departureTime && (
                                            <p className="text-xs text-red-600">{errors.departureTime}</p>
                                        )}
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="routeId">
                                        Route <span className="text-red-500">*</span>
                                    </Label>
                                    <Select
                                        value={formData.routeId}
                                        onValueChange={(value) => setFormData({ ...formData, routeId: value })}
                                    >
                                        <SelectTrigger className={errors.routeId ? 'border-red-500' : ''}>
                                            <SelectValue placeholder="Select a route" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {routes.map((route) => (
                                                <SelectItem key={route._id} value={route._id}>
                                                    {route.name} ({route.fromLocation} → {route.toLocation})
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    {errors.routeId && <p className="text-xs text-red-600">{errors.routeId}</p>}
                                </div>

                                <div className="space-y-2">
                                    <Label>Amenities</Label>
                                    <div className="grid grid-cols-2 gap-3">
                                        {COMMON_AMENITIES.map((amenity) => (
                                            <div key={amenity} className="flex items-center space-x-2">
                                                <Checkbox
                                                    id={amenity}
                                                    checked={formData.amenities.includes(amenity)}
                                                    onCheckedChange={() => toggleAmenity(amenity)}
                                                />
                                                <Label htmlFor={amenity} className="cursor-pointer text-sm">
                                                    {amenity}
                                                </Label>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                            <DialogFooter className="gap-2">
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={resetForm}
                                    disabled={formLoading}
                                    className="w-full sm:w-auto"
                                >
                                    Cancel
                                </Button>
                                <Button type="submit" disabled={formLoading} className="w-full sm:w-auto">
                                    {formLoading ? (
                                        <>
                                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                            {editingBus ? 'Updating...' : 'Creating...'}
                                        </>
                                    ) : editingBus ? (
                                        'Update Bus'
                                    ) : (
                                        'Create Bus'
                                    )}
                                </Button>
                            </DialogFooter>
                        </form>
                    </DialogContent>
                </Dialog>

                {/* Delete Confirmation Dialog */}
                <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
                    <AlertDialogContent>
                        <AlertDialogHeader>
                            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                            <AlertDialogDescription>
                                This action cannot be undone. This will permanently delete the bus
                                {selectedBus && (
                                    <span className="font-semibold"> "{selectedBus.busNumber}"</span>
                                )}{' '}
                                and remove it from the system.
                            </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction
                                onClick={confirmDeleteBus}
                                className="bg-red-600 hover:bg-red-700"
                            >
                                Delete Bus
                            </AlertDialogAction>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>
            </div>
        </DashboardLayout>
    );
}