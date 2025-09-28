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
    DollarSign
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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
import { toast } from 'sonner';
import { IRoute, CreateRouteRequest, UpdateRouteRequest } from '@/types';
import DashboardLayout from '@/components/layout/DashboardLayout';

export default function RoutesPage() {
    const { hasPermission } = useAuth();
    const router = useRouter();
    const [routes, setRoutes] = useState<IRoute[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
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
        price: 0
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
                body: JSON.stringify(formData)
            });

            const data = await response.json();
            if (data.success) {
                toast.success(editingRoute ? 'Route updated successfully' : 'Route created successfully');
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

    const handleDelete = (route: IRoute) => {
        setSelectedRoute(route);
        setIsDeleteDialogOpen(true);
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
            price: route.price || 0
        });
        setIsModalOpen(true);
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
            price: 0
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
                pickupLocations: [...formData.pickupLocations, newPickupLocation.trim()]
            });
            setNewPickupLocation('');
        }
    };

    const removePickupLocation = (index: number) => {
        setFormData({
            ...formData,
            pickupLocations: formData.pickupLocations.filter((_, i) => i !== index)
        });
    };

    const filteredRoutes = routes.filter(route =>
        route.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        route.fromLocation.toLowerCase().includes(searchTerm.toLowerCase()) ||
        route.toLocation.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // Calculate total revenue from all routes
    const totalRevenue = routes.reduce((sum, route) => sum + (route.price || 0), 0);

    if (!hasPermission('routes:read')) {
        return (
            <DashboardLayout>
                <div className="flex items-center justify-center h-64">
                    <p className="text-gray-500">You don't have permission to view routes.</p>
                </div>
            </DashboardLayout>
        );
    }

    return (
        <DashboardLayout>
            <div className="space-y-6">
                {/* Header */}
                <div className="flex justify-between items-center">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-800">Route Management</h1>
                        <p className="text-gray-600">Manage bus routes and pickup locations</p>
                    </div>
                    {hasPermission('routes:write') && (
                        <Button className="bg-primary" onClick={handleCreateRoute}>
                            <Plus className="w-4 h-4 mr-2" />
                            Add Route
                        </Button>
                    )}
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                    <Card className="rounded-sm border-none">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Total Routes</CardTitle>
                            <RouteIcon className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{routes.length}</div>
                        </CardContent>
                    </Card>
                    <Card className="rounded-sm border-none">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Active Routes</CardTitle>
                            <RouteIcon className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">
                                {routes.filter(route => route.isActive).length}
                            </div>
                        </CardContent>
                    </Card>
                    <Card className="rounded-sm border-none">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Avg Price</CardTitle>
                            <DollarSign className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">
                                LKR: {routes.length > 0 
                                    ? (totalRevenue / routes.length).toFixed(2)
                                    : '0.00'
                                }/=
                            </div>
                        </CardContent>
                    </Card>
                    <Card className="rounded-sm border-none">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Avg Duration</CardTitle>
                            <Clock className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">
                                {routes.length > 0 
                                    ? Math.round(routes.reduce((sum, route) => sum + route.duration, 0) / routes.length)
                                    : 0
                                } min
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Search and Routes Table */}
                <Card className="rounded-sm border-none">
                    <CardHeader>
                        <div className="flex items-center space-x-4">
                            <div className="relative flex-1">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                                <Input
                                    type="search"
                                    placeholder="Search routes..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="pl-10"
                                />
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent>
                        {loading ? (
                            <div className="flex items-center justify-center h-32">
                                <p className="text-gray-500">Loading routes...</p>
                            </div>
                        ) : (
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Route</TableHead>
                                        <TableHead>From - To</TableHead>
                                        <TableHead>Pickup Locations</TableHead>
                                        <TableHead>Distance</TableHead>
                                        <TableHead>Duration</TableHead>
                                        <TableHead>Price</TableHead>
                                        <TableHead>Status</TableHead>
                                        <TableHead>Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {filteredRoutes?.map((route) => (
                                        <TableRow key={route._id}>
                                            <TableCell>
                                                <div className="flex items-center space-x-3">
                                                    <RouteIcon className="w-5 h-5 text-gray-400" />
                                                    <span className="font-medium">{route.name}</span>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                {route.fromLocation} → {route.toLocation}
                                            </TableCell>
                                            <TableCell>
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
                                            <TableCell>{route.distance} km</TableCell>
                                            <TableCell>
                                                <div className="flex items-center">
                                                    <Clock className="w-4 h-4 mr-1 text-gray-400" />
                                                    {route.duration} min
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex items-center font-medium">
                                                    <DollarSign className="w-4 h-4 mr-1 text-gray-400" />
                                                    {route.price?.toFixed(2) || '0.00'}
                                                </div>
                                            </TableCell>
                                            <TableCell>
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
                                                        {hasPermission('routes:write') && (
                                                            <DropdownMenuItem onClick={() => handleEdit(route)}>
                                                                <Edit2 className="w-4 h-4 mr-2" />
                                                                Edit Route
                                                            </DropdownMenuItem>
                                                        )}
                                                        {hasPermission('routes:delete') && (
                                                            <DropdownMenuItem
                                                                onClick={() => handleDelete(route)}
                                                                className="text-red-600 hover:text-red-700"
                                                            >
                                                                <Trash2 className="w-4 h-4 mr-2" />
                                                                Delete Route
                                                            </DropdownMenuItem>
                                                        )}
                                                    </DropdownMenuContent>
                                                </DropdownMenu>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        )}
                    </CardContent>
                </Card>

                {/* Modal */}
                <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
                    <DialogContent className="sm:max-w-[525px] bg-sky-100">
                        <DialogHeader>
                            <DialogTitle>{editingRoute ? 'Edit Route' : 'Add New Route'}</DialogTitle>
                            <DialogDescription>
                                {editingRoute ? 'Update route information.' : 'Create a new bus route with pickup locations.'}
                            </DialogDescription>
                        </DialogHeader>
                        <form onSubmit={handleSubmit}>
                            <div className="grid gap-4 py-4">
                                <div className="space-y-2">
                                    <Label htmlFor="name">Route Name</Label>
                                    <Input
                                        id="name"
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        placeholder="Enter route name"
                                        className={errors.name ? 'border-red-500' : ''}
                                    />
                                    {errors.name && (
                                        <p className="text-sm text-red-600">{errors.name}</p>
                                    )}
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="fromLocation">From Location</Label>
                                        <Input
                                            id="fromLocation"
                                            value={formData.fromLocation}
                                            onChange={(e) => setFormData({ ...formData, fromLocation: e.target.value })}
                                            placeholder="Starting point"
                                            className={errors.fromLocation ? 'border-red-500' : ''}
                                        />
                                        {errors.fromLocation && (
                                            <p className="text-sm text-red-600">{errors.fromLocation}</p>
                                        )}
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="toLocation">To Location</Label>
                                        <Input
                                            id="toLocation"
                                            value={formData.toLocation}
                                            onChange={(e) => setFormData({ ...formData, toLocation: e.target.value })}
                                            placeholder="Destination"
                                            className={errors.toLocation ? 'border-red-500' : ''}
                                        />
                                        {errors.toLocation && (
                                            <p className="text-sm text-red-600">{errors.toLocation}</p>
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

                                <div className="grid grid-cols-3 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="distance">Distance (km)</Label>
                                        <Input
                                            id="distance"
                                            type="number"
                                            value={formData.distance}
                                            onChange={(e) => setFormData({ ...formData, distance: Number(e.target.value) })}
                                            min="0"
                                            step="0.1"
                                            className={errors.distance ? 'border-red-500' : ''}
                                        />
                                        {errors.distance && (
                                            <p className="text-sm text-red-600">{errors.distance}</p>
                                        )}
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="duration">Duration (min)</Label>
                                        <Input
                                            id="duration"
                                            type="number"
                                            value={formData.duration}
                                            onChange={(e) => setFormData({ ...formData, duration: Number(e.target.value) })}
                                            min="0"
                                            className={errors.duration ? 'border-red-500' : ''}
                                        />
                                        {errors.duration && (
                                            <p className="text-sm text-red-600">{errors.duration}</p>
                                        )}
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="price">Price (LKR)</Label>
                                        <Input
                                            id="price"
                                            type="number"
                                            value={formData.price}
                                            onChange={(e) => setFormData({ ...formData, price: Number(e.target.value) })}
                                            min="0"
                                            step="0.01"
                                            className={errors.price ? 'border-red-500' : ''}
                                        />
                                        {errors.price && (
                                            <p className="text-sm text-red-600">{errors.price}</p>
                                        )}
                                    </div>
                                </div>
                            </div>
                            <DialogFooter>
                                <Button type="button" onClick={resetForm} className="bg-gray-500 hover:bg-gray-600">
                                    Cancel
                                </Button>
                                <Button type="submit" disabled={formLoading} className="bg-primary">
                                    {formLoading ? (editingRoute ? 'Updating...' : 'Creating...') : (editingRoute ? 'Update Route' : 'Create Route')}
                                </Button>
                            </DialogFooter>
                        </form>
                    </DialogContent>
                </Dialog>

                {/* Delete Confirmation Dialog */}
                <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
                    <AlertDialogContent>
                        <AlertDialogHeader>
                            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                            <AlertDialogDescription>
                                This action cannot be undone. This will permanently delete the route
                                {selectedRoute && ` "${selectedRoute.name}"`} and remove it from the system.
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