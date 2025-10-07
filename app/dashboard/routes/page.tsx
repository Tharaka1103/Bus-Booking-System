'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import {
    Plus,
    Edit2,
    Trash2,
    Search,
    MapPin,
    Clock,
    Route as RouteIcon,
    X,
    MoreHorizontal,
    DollarSign,
    Info,
    RefreshCw,
    Filter,
    Loader2,
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
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';
import { IRoute, CreateRouteRequest } from '@/types';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { cn } from '@/lib/utils';

export default function RoutesPage() {
    const { hasPermission } = useAuth();
    const router = useRouter();
    const [routes, setRoutes] = useState<IRoute[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState<string>('all');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const [editingRoute, setEditingRoute] = useState<IRoute | null>(null);
    const [selectedRoute, setSelectedRoute] = useState<IRoute | null>(null);
    const [formData, setFormData] = useState<CreateRouteRequest>({
        name: '',
        fromLocation: '',
        toLocation: '',
        pickupLocations: [],
        distance: 0,
        duration: 0,
        price: 0,
    });
    const [newPickupLocation, setNewPickupLocation] = useState('');
    const [formLoading, setFormLoading] = useState(false);
    const [errors, setErrors] = useState<Record<string, string>>({});

    useEffect(() => {
        if (!hasPermission('routes:read')) {
            router.push('/dashboard');
            return;
        }
        fetchRoutes();
    }, [hasPermission, router]);

    const fetchRoutes = async () => {
        try {
            setLoading(true);
            const response = await fetch('/api/routes', {
                headers: { 'Content-Type': 'application/json' },
            });
            const data = await response.json();
            if (data.success) {
                setRoutes(data.data);
            }
        } catch (error) {
            toast.error('Failed to fetch routes');
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setFormLoading(true);
        setErrors({});

        // Client-side validation
        const newErrors: Record<string, string> = {};
        if (!formData.name.trim()) newErrors.name = 'Route name is required';
        if (!formData.fromLocation.trim()) newErrors.fromLocation = 'From location is required';
        if (!formData.toLocation.trim()) newErrors.toLocation = 'To location is required';
        if (formData.distance <= 0) newErrors.distance = 'Distance must be greater than 0';
        if (formData.duration <= 0) newErrors.duration = 'Duration must be greater than 0';
        if (formData.price <= 0) newErrors.price = 'Price must be greater than 0';

        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            setFormLoading(false);
            return;
        }

        try {
            const url = editingRoute ? `/api/routes/${editingRoute._id}` : '/api/routes';
            const method = editingRoute ? 'PUT' : 'POST';

            const response = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData),
            });

            const data = await response.json();
            if (data.success) {
                toast.success(
                    editingRoute ? 'Route updated successfully' : 'Route created successfully'
                );
                fetchRoutes();
                resetForm();
            } else {
                toast.error(data.message);
            }
        } catch (error) {
            toast.error('Operation failed');
        } finally {
            setFormLoading(false);
        }
    };

    const handleViewDetails = (route: IRoute) => {
        setSelectedRoute(route);
        setIsDetailModalOpen(true);
    };

    const handleDelete = (route: IRoute) => {
        setSelectedRoute(route);
        setIsDeleteDialogOpen(true);
        setIsDetailModalOpen(false);
    };

    const confirmDeleteRoute = async () => {
        if (!selectedRoute) return;

        try {
            const response = await fetch(`/api/routes/${selectedRoute._id}`, {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' },
            });

            const data = await response.json();
            if (data.success) {
                toast.success('Route deleted successfully');
                setIsDeleteDialogOpen(false);
                setSelectedRoute(null);
                fetchRoutes();
            } else {
                toast.error(data.message);
            }
        } catch (error) {
            toast.error('Failed to delete route');
        }
    };

    const handleEdit = (route: IRoute) => {
        setEditingRoute(route);
        setFormData({
            name: route.name,
            fromLocation: route.fromLocation,
            toLocation: route.toLocation,
            pickupLocations: route.pickupLocations,
            distance: route.distance,
            duration: route.duration,
            price: route.price || 0,
        });
        setIsModalOpen(true);
        setIsDetailModalOpen(false);
    };

    const handleCreateRoute = () => {
        resetForm();
        setIsModalOpen(true);
    };

    const resetForm = () => {
        setFormData({
            name: '',
            fromLocation: '',
            toLocation: '',
            pickupLocations: [],
            distance: 0,
            duration: 0,
            price: 0,
        });
        setEditingRoute(null);
        setIsModalOpen(false);
        setNewPickupLocation('');
        setErrors({});
    };

    const addPickupLocation = () => {
        if (newPickupLocation.trim()) {
            setFormData({
                ...formData,
                pickupLocations: [...formData.pickupLocations, newPickupLocation.trim()],
            });
            setNewPickupLocation('');
        }
    };

    const removePickupLocation = (index: number) => {
        setFormData({
            ...formData,
            pickupLocations: formData.pickupLocations.filter((_, i) => i !== index),
        });
    };

    const filteredRoutes = routes.filter((route) => {
        const matchesSearch =
            route.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            route.fromLocation.toLowerCase().includes(searchTerm.toLowerCase()) ||
            route.toLocation.toLowerCase().includes(searchTerm.toLowerCase());

        const matchesStatus =
            statusFilter === 'all' ||
            (statusFilter === 'active' && route.isActive) ||
            (statusFilter === 'inactive' && !route.isActive);

        return matchesSearch && matchesStatus;
    });

    // Calculate stats
    const totalRevenue = routes.reduce((sum, route) => sum + (route.price || 0), 0);
    const activeRoutes = routes.filter((route) => route.isActive).length;
    const avgDuration =
        routes.length > 0
            ? Math.round(routes.reduce((sum, route) => sum + route.duration, 0) / routes.length)
            : 0;

    if (!hasPermission('routes:read')) {
        return (
            <DashboardLayout>
                <Card>
                    <CardContent className="flex items-center justify-center h-64">
                        <div className="text-center">
                            <RouteIcon className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                            <p className="text-gray-600">You don't have permission to view routes.</p>
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
                        <h1 className="text-2xl font-bold text-gray-900">Route Management</h1>
                        <p className="text-sm text-gray-600 mt-1">
                            Manage bus routes and pickup locations
                        </p>
                    </div>
                    <div className="block space-y-3 md:space-y-0 items-center gap-5 md:flex">
                        <Button variant="outline" size="sm" onClick={fetchRoutes} className="w-full sm:w-auto">
                            <RefreshCw className="w-4 h-4 mr-2" />
                            Refresh
                        </Button>
                        {hasPermission('routes:write') && (
                            <Button onClick={handleCreateRoute} size="sm" className="w-full sm:w-auto">
                                <Plus className="w-4 h-4 mr-2" />
                                Add Route
                            </Button>
                        )}
                    </div>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
                    <Card className="rounded-sm border-none">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Total Routes</CardTitle>
                            <RouteIcon className="h-4 w-4 text-gray-600" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{routes.length}</div>
                            <p className="text-xs text-gray-600 mt-1">All registered routes</p>
                        </CardContent>
                    </Card>
                    <Card className="rounded-sm border-none">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Active Routes</CardTitle>
                            <RouteIcon className="h-4 w-4 text-green-600" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{activeRoutes}</div>
                            <p className="text-xs text-gray-600 mt-1">Currently active</p>
                        </CardContent>
                    </Card>
                    <Card className="rounded-sm border-none">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Avg Price</CardTitle>
                            <DollarSign className="h-4 w-4 text-blue-600" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">
                                LKR {routes.length > 0 ? (totalRevenue / routes.length).toFixed(2) : '0.00'}
                                /=
                            </div>
                            <p className="text-xs text-gray-600 mt-1">Average route price</p>
                        </CardContent>
                    </Card>
                    <Card className="rounded-sm border-none">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Avg Duration</CardTitle>
                            <Clock className="h-4 w-4 text-orange-600" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{avgDuration} min</div>
                            <p className="text-xs text-gray-600 mt-1">Average travel time</p>
                        </CardContent>
                    </Card>
                </div>

                {/* Search and Routes Table */}
                <Card className="rounded-sm border-none">
                    <CardHeader>
                        <CardTitle className="text-lg">Route List</CardTitle>
                        <CardDescription>View and manage all routes in the system</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="flex flex-col gap-4 mb-6">
                            <div className="relative flex-1">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                                <Input
                                    type="search"
                                    placeholder="Search routes by name or location..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="pl-10"
                                />
                            </div>
                            <div className="flex flex-col sm:flex-row gap-2">
                                <Select value={statusFilter} onValueChange={setStatusFilter}>
                                    <SelectTrigger className="w-full sm:w-[160px]">
                                        <Filter className="w-4 h-4 mr-2" />
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
                                    <p className="text-gray-600">Loading routes...</p>
                                </div>
                            </div>
                        ) : filteredRoutes.length === 0 ? (
                            <div className="flex items-center justify-center h-64">
                                <div className="text-center">
                                    <RouteIcon className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                                    <p className="text-gray-600">No routes found</p>
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
                                            <TableHead>Route</TableHead>
                                            <TableHead className="hidden lg:table-cell">From - To</TableHead>
                                            <TableHead className="hidden md:table-cell">Pickup Locations</TableHead>
                                            <TableHead className="hidden lg:table-cell">Distance</TableHead>
                                            <TableHead className="hidden lg:table-cell">Duration</TableHead>
                                            <TableHead className="hidden md:table-cell">Price</TableHead>
                                            <TableHead className="hidden md:table-cell">Status</TableHead>
                                            <TableHead>Actions</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {filteredRoutes.map((route) => (
                                            <ContextMenu key={route._id}>
                                                <ContextMenuTrigger asChild>
                                                    <TableRow className="cursor-context-menu hover:bg-gray-50">
                                                        <TableCell>
                                                            <div className="flex items-center gap-3">
                                                                <div className="w-10 h-10 bg-primary text-white rounded-full flex items-center justify-center flex-shrink-0">
                                                                    <RouteIcon className="w-5 h-5" />
                                                                </div>
                                                                <div className="min-w-0">
                                                                    <p className="font-medium text-gray-900 truncate">
                                                                        {route.name}
                                                                    </p>
                                                                    <p className="text-sm text-gray-600 truncate md:hidden">
                                                                        {route.fromLocation} → {route.toLocation}
                                                                    </p>
                                                                    <div className="flex gap-2 mt-1 md:hidden">
                                                                        <Badge variant={route.isActive ? 'default' : 'secondary'}>
                                                                            {route.isActive ? 'Active' : 'Inactive'}
                                                                        </Badge>
                                                                        <Badge variant="outline">LKR {route.price?.toFixed(2)}</Badge>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </TableCell>
                                                        <TableCell className="hidden lg:table-cell">
                                                            <div className="space-y-1">
                                                                <p className="font-medium text-gray-900">
                                                                    {route.fromLocation} → {route.toLocation}
                                                                </p>
                                                                <p className="text-sm text-gray-600">
                                                                    {route.distance} km • {route.duration} min
                                                                </p>
                                                            </div>
                                                        </TableCell>
                                                        <TableCell className="hidden md:table-cell">
                                                            <div className="flex flex-wrap gap-1">
                                                                {route.pickupLocations?.slice(0, 2).map((location, index) => (
                                                                    <Badge key={index} variant="secondary" className="text-xs">
                                                                        <MapPin className="w-3 h-3 mr-1" />
                                                                        {location}
                                                                    </Badge>
                                                                ))}
                                                                {route.pickupLocations?.length > 2 && (
                                                                    <Badge variant="outline" className="text-xs">
                                                                        +{route.pickupLocations.length - 2} more
                                                                    </Badge>
                                                                )}
                                                            </div>
                                                        </TableCell>
                                                        <TableCell className="hidden lg:table-cell">
                                                            {route.distance} km
                                                        </TableCell>
                                                        <TableCell className="hidden lg:table-cell">
                                                            <div className="flex items-center">
                                                                <Clock className="w-4 h-4 mr-1 text-gray-400" />
                                                                {route.duration} min
                                                            </div>
                                                        </TableCell>
                                                        <TableCell className="hidden md:table-cell">
                                                            <div className="flex items-center font-medium">
                                                                <DollarSign className="w-4 h-4 mr-1 text-gray-400" />
                                                                {route.price?.toFixed(2) || '0.00'}
                                                            </div>
                                                        </TableCell>
                                                        <TableCell className="hidden md:table-cell">
                                                            <Badge variant={route.isActive ? 'default' : 'secondary'}>
                                                                {route.isActive ? 'Active' : 'Inactive'}
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
                                                                    <DropdownMenuItem onClick={() => handleViewDetails(route)}>
                                                                        <Info className="w-4 h-4 mr-2" />
                                                                        View Details
                                                                    </DropdownMenuItem>
                                                                    {hasPermission('routes:write') && (
                                                                        <DropdownMenuItem onClick={() => handleEdit(route)}>
                                                                            <Edit2 className="w-4 h-4 mr-2" />
                                                                            Edit Route
                                                                        </DropdownMenuItem>
                                                                    )}
                                                                    {hasPermission('routes:delete') && (
                                                                        <>
                                                                            <Separator className="my-1" />
                                                                            <DropdownMenuItem
                                                                                onClick={() => handleDelete(route)}
                                                                                className="text-red-600 focus:text-red-600"
                                                                            >
                                                                                <Trash2 className="w-4 h-4 mr-2" />
                                                                                Delete Route
                                                                            </DropdownMenuItem>
                                                                        </>
                                                                    )}
                                                                </DropdownMenuContent>
                                                            </DropdownMenu>
                                                        </TableCell>
                                                    </TableRow>
                                                </ContextMenuTrigger>
                                                <ContextMenuContent className="w-56">
                                                    <ContextMenuItem onClick={() => handleViewDetails(route)}>
                                                        <Info className="w-4 h-4 mr-2" />
                                                        View Details
                                                    </ContextMenuItem>
                                                    {hasPermission('routes:write') && (
                                                        <ContextMenuItem onClick={() => handleEdit(route)}>
                                                            <Edit2 className="w-4 h-4 mr-2" />
                                                            Edit Route
                                                        </ContextMenuItem>
                                                    )}
                                                    {hasPermission('routes:delete') && (
                                                        <>
                                                            <ContextMenuSeparator />
                                                            <ContextMenuItem
                                                                onClick={() => handleDelete(route)}
                                                                className="text-red-600 focus:text-red-600"
                                                            >
                                                                <Trash2 className="w-4 h-4 mr-2" />
                                                                Delete Route
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

                {/* Route Details Modal */}
                <Dialog open={isDetailModalOpen} onOpenChange={setIsDetailModalOpen}>
                    <DialogContent className="sm:max-w-[525px]">
                        <DialogHeader>
                            <DialogTitle>Route Details</DialogTitle>
                            <DialogDescription>Complete route information</DialogDescription>
                        </DialogHeader>
                        {selectedRoute && (
                            <ScrollArea className="max-h-[60vh]">
                                <div className="grid gap-4 py-4">
                                    <div className="flex flex-col items-center text-center pb-4 border-b">
                                        <div className="w-20 h-20 bg-primary text-white rounded-full flex items-center justify-center mb-3">
                                            <RouteIcon className="w-10 h-10" />
                                        </div>
                                        <h3 className="text-xl font-bold text-gray-900">
                                            {selectedRoute.name}
                                        </h3>
                                        <p className="text-sm text-gray-600 mt-1">
                                            {selectedRoute.fromLocation} → {selectedRoute.toLocation}
                                        </p>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-1">
                                            <p className="text-sm text-gray-500">From Location</p>
                                            <div className="flex items-center gap-2">
                                                <MapPin className="w-4 h-4 text-gray-400" />
                                                <p className="text-sm font-medium">{selectedRoute.fromLocation}</p>
                                            </div>
                                        </div>
                                        <div className="space-y-1">
                                            <p className="text-sm text-gray-500">To Location</p>
                                            <div className="flex items-center gap-2">
                                                <MapPin className="w-4 h-4 text-gray-400" />
                                                <p className="text-sm font-medium">{selectedRoute.toLocation}</p>
                                            </div>
                                        </div>
                                        <div className="space-y-1">
                                            <p className="text-sm text-gray-500">Distance</p>
                                            <p className="text-sm font-medium">{selectedRoute.distance} km</p>
                                        </div>
                                        <div className="space-y-1">
                                            <p className="text-sm text-gray-500">Duration</p>
                                            <div className="flex items-center gap-2">
                                                <Clock className="w-4 h-4 text-gray-400" />
                                                <p className="text-sm font-medium">{selectedRoute.duration} min</p>
                                            </div>
                                        </div>
                                        <div className="space-y-1">
                                            <p className="text-sm text-gray-500">Price</p>
                                            <div className="flex items-center gap-2">
                                                <DollarSign className="w-4 h-4 text-gray-400" />
                                                <p className="text-sm font-medium">
                                                    LKR {selectedRoute.price?.toFixed(2) || '0.00'}/=
                                                </p>
                                            </div>
                                        </div>
                                        <div className="space-y-1">
                                            <p className="text-sm text-gray-500">Status</p>
                                            <Badge variant={selectedRoute.isActive ? 'default' : 'secondary'}>
                                                {selectedRoute.isActive ? 'Active' : 'Inactive'}
                                            </Badge>
                                        </div>
                                        <div className="space-y-1 col-span-2">
                                            <p className="text-sm text-gray-500">Pickup Locations</p>
                                            <div className="flex flex-wrap gap-2">
                                                {selectedRoute.pickupLocations?.length > 0 ? (
                                                    selectedRoute.pickupLocations.map((location, index) => (
                                                        <Badge key={index} variant="secondary">
                                                            <MapPin className="w-3 h-3 mr-1" />
                                                            {location}
                                                        </Badge>
                                                    ))
                                                ) : (
                                                    <p className="text-sm text-gray-500">No pickup locations</p>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </ScrollArea>
                        )}
                        <DialogFooter className="gap-2">
                            {hasPermission('routes:write') && selectedRoute && (
                                <Button
                                    variant="outline"
                                    onClick={() => handleEdit(selectedRoute)}
                                    className="w-full sm:w-auto"
                                >
                                    <Edit2 className="w-4 h-4 mr-2" />
                                    Edit Route
                                </Button>
                            )}
                            {hasPermission('routes:delete') && selectedRoute && (
                                <Button
                                    variant="destructive"
                                    onClick={() => handleDelete(selectedRoute)}
                                    className="w-full sm:w-auto"
                                >
                                    <Trash2 className="w-4 h-4 mr-2" />
                                    Delete Route
                                </Button>
                            )}
                        </DialogFooter>
                    </DialogContent>
                </Dialog>

                {/* Create/Edit Route Modal */}
                <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
                    <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
                        <DialogHeader>
                            <DialogTitle>{editingRoute ? 'Edit Route' : 'Add New Route'}</DialogTitle>
                            <DialogDescription>
                                {editingRoute
                                    ? 'Update route information.'
                                    : 'Create a new bus route with pickup locations.'}
                            </DialogDescription>
                        </DialogHeader>
                        <form onSubmit={handleSubmit}>
                            <div className="space-y-4 py-4">
                                <div className="space-y-2">
                                    <Label htmlFor="name">
                                        Route Name <span className="text-red-500">*</span>
                                    </Label>
                                    <Input
                                        id="name"
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        placeholder="Enter route name"
                                        className={errors.name ? 'border-red-500' : ''}
                                    />
                                    {errors.name && <p className="text-xs text-red-600">{errors.name}</p>}
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="fromLocation">
                                            From Location <span className="text-red-500">*</span>
                                        </Label>
                                        <Input
                                            id="fromLocation"
                                            value={formData.fromLocation}
                                            onChange={(e) =>
                                                setFormData({ ...formData, fromLocation: e.target.value })
                                            }
                                            placeholder="Starting point"
                                            className={errors.fromLocation ? 'border-red-500' : ''}
                                        />
                                        {errors.fromLocation && (
                                            <p className="text-xs text-red-600">{errors.fromLocation}</p>
                                        )}
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="toLocation">
                                            To Location <span className="text-red-500">*</span>
                                        </Label>
                                        <Input
                                            id="toLocation"
                                            value={formData.toLocation}
                                            onChange={(e) =>
                                                setFormData({ ...formData, toLocation: e.target.value })
                                            }
                                            placeholder="Destination"
                                            className={errors.toLocation ? 'border-red-500' : ''}
                                        />
                                        {errors.toLocation && (
                                            <p className="text-xs text-red-600">{errors.toLocation}</p>
                                        )}
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label>Pickup Locations</Label>
                                    <div className="flex gap-2">
                                        <Input
                                            value={newPickupLocation}
                                            onChange={(e) => setNewPickupLocation(e.target.value)}
                                            placeholder="Enter pickup location"
                                            className="flex-1"
                                            onKeyPress={(e) => {
                                                if (e.key === 'Enter') {
                                                    e.preventDefault();
                                                    addPickupLocation();
                                                }
                                            }}
                                        />
                                        <Button type="button" onClick={addPickupLocation} variant="outline">
                                            Add
                                        </Button>
                                    </div>
                                    <div className="flex flex-wrap gap-2 mt-2">
                                        {formData.pickupLocations?.map((location, index) => (
                                            <Badge key={index} variant="secondary" className="py-1 px-3">
                                                {location}
                                                <button
                                                    type="button"
                                                    onClick={() => removePickupLocation(index)}
                                                    className="ml-2 text-red-500 hover:text-red-700"
                                                >
                                                    <X className="w-3 h-3" />
                                                </button>
                                            </Badge>
                                        ))}
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="distance">
                                            Distance (km) <span className="text-red-500">*</span>
                                        </Label>
                                        <Input
                                            id="distance"
                                            type="number"
                                            value={formData.distance}
                                            onChange={(e) =>
                                                setFormData({ ...formData, distance: Number(e.target.value) })
                                            }
                                            min="0"
                                            step="0.1"
                                            className={errors.distance ? 'border-red-500' : ''}
                                        />
                                        {errors.distance && (
                                            <p className="text-xs text-red-600">{errors.distance}</p>
                                        )}
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="duration">
                                            Duration (min) <span className="text-red-500">*</span>
                                        </Label>
                                        <Input
                                            id="duration"
                                            type="number"
                                            value={formData.duration}
                                            onChange={(e) =>
                                                setFormData({ ...formData, duration: Number(e.target.value) })
                                            }
                                            min="0"
                                            className={errors.duration ? 'border-red-500' : ''}
                                        />
                                        {errors.duration && (
                                            <p className="text-xs text-red-600">{errors.duration}</p>
                                        )}
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="price">
                                            Price (LKR) <span className="text-red-500">*</span>
                                        </Label>
                                        <Input
                                            id="price"
                                            type="number"
                                            value={formData.price}
                                            onChange={(e) =>
                                                setFormData({ ...formData, price: Number(e.target.value) })
                                            }
                                            min="0"
                                            step="0.01"
                                            className={errors.price ? 'border-red-500' : ''}
                                        />
                                        {errors.price && <p className="text-xs text-red-600">{errors.price}</p>}
                                    </div>
                                </div>
                            </div>
                            <DialogFooter className="gap-2">
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={resetForm}
                                    className="w-full sm:w-auto"
                                >
                                    Cancel
                                </Button>
                                <Button type="submit" disabled={formLoading} className="w-full sm:w-auto">
                                    {formLoading ? (
                                        <>
                                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                            {editingRoute ? 'Updating...' : 'Creating...'}
                                        </>
                                    ) : editingRoute ? (
                                        'Update Route'
                                    ) : (
                                        'Create Route'
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
                                This action cannot be undone. This will permanently delete the route
                                {selectedRoute && (
                                    <span className="font-semibold"> "{selectedRoute.name}"</span>
                                )}{' '}
                                and remove it from the system.
                            </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction
                                onClick={confirmDeleteRoute}
                                className="bg-red-600 hover:bg-red-700"
                            >
                                Delete Route
                            </AlertDialogAction>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>
            </div>
        </DashboardLayout>
    );
}