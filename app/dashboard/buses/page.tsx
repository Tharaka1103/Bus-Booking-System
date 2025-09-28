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
    Wifi,
    X,
    MoreHorizontal,
    MapPin
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
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
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
import { IBus, IRoute, CreateBusRequest, UpdateBusRequest } from '@/types';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Checkbox } from '@/components/ui/checkbox';

const BUS_TYPES = [
    { value: 'luxury', label: 'Luxury' },
    { value: 'semi_luxury', label: 'Semi Luxury' },
    { value: 'normal', label: 'Normal' }
];

const COMMON_AMENITIES = ['AC', 'WiFi', 'TV', 'USB Charging', 'Water Bottle', 'Blanket'];

export default function BusesPage() {
    const { hasPermission } = useAuth();
    const router = useRouter();
    const [buses, setBuses] = useState<IBus[]>([]);
    const [routes, setRoutes] = useState<IRoute[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const [editingBus, setEditingBus] = useState<IBus | null>(null);
    const [selectedBus, setSelectedBus] = useState<IBus | null>(null);
    const [formData, setFormData] = useState<CreateBusRequest>({
        busNumber: '',
        type: 'normal',
        capacity: 40,
        amenities: [],
        routeId: ''
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

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setFormLoading(true);
        setErrors({});

        // Client-side validation
        const newErrors: Record<string, string> = {};
        if (!formData.busNumber.trim()) newErrors.busNumber = 'Bus number is required';
        if (formData.capacity <= 0) newErrors.capacity = 'Capacity must be greater than 0';

        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            setFormLoading(false);
            return;
        }

        try {
            const url = editingBus ? `/api/buses/${editingBus._id}` : '/api/buses';
            const method = editingBus ? 'PUT' : 'POST';

            const response = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });

            const data = await response.json();
            if (data.success) {
                toast.success(editingBus ? 'Bus updated successfully' : 'Bus created successfully');
                fetchBuses();
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

    const handleDelete = (bus: IBus) => {
        setSelectedBus(bus);
        setIsDeleteDialogOpen(true);
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
            amenities: bus.amenities,
            routeId: typeof bus.routeId === 'object' ? bus.routeId._id : bus.routeId || ''
        });
        setIsModalOpen(true);
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
            routeId: ''
        });
        setEditingBus(null);
        setIsModalOpen(false);
        setErrors({});
    };

    const toggleAmenity = (amenity: string) => {
        setFormData({
            ...formData,
            amenities: formData.amenities.includes(amenity)
                ? formData.amenities.filter(a => a !== amenity)
                : [...formData.amenities, amenity]
        });
    };

    const filteredBuses = buses.filter(bus =>
        bus.busNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        bus.type.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const getBusTypeColor = (type: string) => {
        switch (type) {
            case 'luxury': return 'default';
            case 'semi_luxury': return 'secondary';
            default: return 'outline';
        }
    };

    if (!hasPermission('buses:read')) {
        return (
            <DashboardLayout>
                <div className="flex items-center justify-center h-64">
                    <p className="text-gray-500">You don't have permission to view buses.</p>
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
                        <h1 className="text-2xl font-bold text-gray-800">Bus Management</h1>
                        <p className="text-gray-600">Manage your fleet of buses</p>
                    </div>
                    {hasPermission('buses:write') && (
                        <Button className="bg-primary" onClick={handleCreateBus}>
                            <Plus className="w-4 h-4 mr-2" />
                            Add Bus
                        </Button>
                    )}
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                    <Card className="rounded-sm border-none">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Total Buses</CardTitle>
                            <BusIcon className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{buses.length}</div>
                        </CardContent>
                    </Card>
                    <Card className="rounded-sm border-none">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Active Buses</CardTitle>
                            <BusIcon className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">
                                {buses.filter(bus => bus.isActive).length}
                            </div>
                        </CardContent>
                    </Card>
                    <Card className="rounded-sm border-none">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Luxury Buses</CardTitle>
                            <BusIcon className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">
                                {buses.filter(bus => bus.type === 'luxury').length}
                            </div>
                        </CardContent>
                    </Card>
                    <Card className="rounded-sm border-none">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Total Capacity</CardTitle>
                            <Users className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">
                                {buses.reduce((sum, bus) => sum + bus.capacity, 0)}
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Search and Buses Table */}
                <Card className="rounded-sm border-none">
                    <CardHeader>
                        <div className="flex items-center space-x-4">
                            <div className="relative flex-1">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                                <Input
                                    type="search"
                                    placeholder="Search buses..."
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
                                <p className="text-gray-500">Loading buses...</p>
                            </div>
                        ) : (
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Bus Number</TableHead>
                                        <TableHead>Type</TableHead>
                                        <TableHead>Capacity</TableHead>
                                        <TableHead>Route</TableHead>
                                        <TableHead>Status</TableHead>
                                        <TableHead>Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {filteredBuses.map((bus) => (
                                        <TableRow key={bus._id}>
                                            <TableCell>
                                                <div className="flex items-center space-x-3">
                                                    <BusIcon className="w-5 h-5 text-gray-400" />
                                                    <span className="font-medium">{bus.busNumber}</span>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <Badge variant={getBusTypeColor(bus.type)}>
                                                    {bus.type.replace('_', ' ')}
                                                </Badge>
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex items-center">
                                                    <Users className="w-4 h-4 mr-1 text-gray-400" />
                                                    {bus.capacity} seats
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                {typeof bus.routeId === 'object' ? (
                                                    <span className="font-medium">{bus.routeId?.name}</span>
                                                ) : (
                                                    <span className="text-gray-400">No route assigned</span>
                                                )}
                                            </TableCell>
                                            
                                            <TableCell>
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
                                                        {hasPermission('buses:write') && (
                                                            <DropdownMenuItem onClick={() => handleEdit(bus)}>
                                                                <Edit2 className="w-4 h-4 mr-2" />
                                                                Edit Bus
                                                            </DropdownMenuItem>
                                                        )}
                                                        {hasPermission('buses:delete') && (
                                                            <DropdownMenuItem
                                                                onClick={() => handleDelete(bus)}
                                                                className="text-red-600 hover:text-red-700"
                                                            >
                                                                <Trash2 className="w-4 h-4 mr-2" />
                                                                Delete Bus
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
                            <DialogTitle>{editingBus ? 'Edit Bus' : 'Add New Bus'}</DialogTitle>
                            <DialogDescription>
                                {editingBus ? 'Update bus information and settings.' : 'Add a new bus to your fleet.'}
                            </DialogDescription>
                        </DialogHeader>
                        <form onSubmit={handleSubmit}>
                            <div className="grid gap-4 py-4">
                                <div className="space-y-2">
                                    <Label htmlFor="busNumber">Bus Number</Label>
                                    <Input
                                        id="busNumber"
                                        value={formData.busNumber}
                                        onChange={(e) => setFormData({ ...formData, busNumber: e.target.value })}
                                        placeholder="e.g., VT-001"
                                        className={errors.busNumber ? 'border-red-500' : ''}
                                    />
                                    {errors.busNumber && (
                                        <p className="text-sm text-red-600">{errors.busNumber}</p>
                                    )}
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="type">Bus Type</Label>
                                        <Select value={formData.type} onValueChange={(value) => setFormData({ ...formData, type: value as any })}>
                                            <SelectTrigger>
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {BUS_TYPES.map(type => (
                                                    <SelectItem key={type.value} value={type.value}>
                                                        {type.label}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="capacity">Capacity (seats)</Label>
                                        <Input
                                            id="capacity"
                                            type="number"
                                            value={formData.capacity}
                                            onChange={(e) => setFormData({ ...formData, capacity: Number(e.target.value) })}
                                            min="1"
                                            max="100"
                                            className={errors.capacity ? 'border-red-500' : ''}
                                        />
                                        {errors.capacity && (
                                            <p className="text-sm text-red-600">{errors.capacity}</p>
                                        )}
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="routeId">Route</Label>
                                    <Select value={formData.routeId} onValueChange={(value) => setFormData({ ...formData, routeId: value })}>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select a route (optional)" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="empty">No route assigned</SelectItem>
                                            {routes.map(route => (
                                                <SelectItem key={route._id} value={route._id}>
                                                    {route.name} ({route.fromLocation} → {route.toLocation})
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="space-y-2">
                                    <Label>Amenities</Label>
                                    <div className="grid grid-cols-2 gap-3">
                                        {COMMON_AMENITIES.map(amenity => (
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
                            <DialogFooter>
                                <Button type="button" onClick={resetForm} className="bg-gray-500 hover:bg-gray-600">
                                    Cancel
                                </Button>
                                <Button type="submit" disabled={formLoading} className="bg-primary">
                                    {formLoading ? (editingBus ? 'Updating...' : 'Creating...') : (editingBus ? 'Update Bus' : 'Create Bus')}
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
                                This action cannot be undone. This will permanently delete the bus
                                {selectedBus && ` "${selectedBus.busNumber}"`} and remove it from the system.
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