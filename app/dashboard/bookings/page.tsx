// app/dashboard/bookings/page.tsx

'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
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
import { 
  Plus, 
  Search, 
  MoreHorizontal, 
  Eye,
  Trash2,
  CreditCard,
  CheckCircle,
  XCircle,
  Ticket
} from 'lucide-react';
import { IBooking } from '@/types';
import { toast } from 'sonner';
import { format } from 'date-fns';

export default function BookingsPage() {
  const router = useRouter();
  const { hasPermission } = useAuth();
  const [bookings, setBookings] = useState<IBooking[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredBookings, setFilteredBookings] = useState<IBooking[]>([]);
  
  // Modal states
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState<IBooking | null>(null);

  useEffect(() => {
    if (hasPermission('bookings:read')) {
      fetchBookings();
    }
  }, [hasPermission]);

  useEffect(() => {
    const filtered = bookings.filter(booking =>
      booking.passengerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      booking.passengerPhone.includes(searchTerm.toLowerCase()) ||
      booking._id.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredBookings(filtered);
  }, [bookings, searchTerm]);

  const fetchBookings = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/bookings', {
        credentials: 'include'
      });

      if (response.ok) {
        const data = await response.json();
        setBookings(data.data);
      } else {
        toast.error('Failed to fetch bookings');
      }
    } catch (error) {
      console.error('Error fetching bookings:', error);
      toast.error('Network error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateBooking = () => {
    router.push('/dashboard/bookings/create');
  };

  const handleViewDetails = (booking: IBooking) => {
    setSelectedBooking(booking);
    setIsDetailModalOpen(true);
  };

  const handleDeleteBooking = (booking: IBooking) => {
    setSelectedBooking(booking);
    setIsDeleteDialogOpen(true);
  };

  const confirmDeleteBooking = async () => {
    if (!selectedBooking) return;

    try {
      const response = await fetch(`/api/bookings/${selectedBooking._id}`, {
        method: 'DELETE',
        credentials: 'include'
      });

      if (response.ok) {
        toast.success('Booking cancelled successfully');
        setIsDeleteDialogOpen(false);
        fetchBookings();
      } else {
        const data = await response.json();
        toast.error(data.message || 'Failed to cancel booking');
      }
    } catch (error) {
      console.error('Error cancelling booking:', error);
      toast.error('Network error occurred');
    }
  };

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case 'confirmed':
        return 'bg-green-100 text-green-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      case 'completed':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getPaymentBadgeColor = (status: string) => {
    switch (status) {
      case 'paid':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'refunded':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (!hasPermission('bookings:read')) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <p className="text-gray-500">You don't have permission to view bookings.</p>
        </div>
      </DashboardLayout>
    );
  }

  // Calculate stats
  const stats = {
    total: bookings.length,
    confirmed: bookings.filter(b => b.status === 'confirmed').length,
    cancelled: bookings.filter(b => b.status === 'cancelled').length,
    revenue: bookings.filter(b => b.paymentStatus === 'paid').reduce((sum, b) => sum + b.totalAmount, 0)
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Bookings Management</h1>
            <p className="text-gray-600">Manage all bookings and reservations</p>
          </div>
          {hasPermission('bookings:write') && (
            <Button className="bg-primary w-full sm:w-auto" onClick={handleCreateBooking}>
              <Plus className="w-4 h-4 mr-2" />
              Create Booking
            </Button>
          )}
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
          <Card className="rounded-sm border-none">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Bookings</CardTitle>
              <Ticket className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.total}</div>
            </CardContent>
          </Card>
          <Card className="rounded-sm border-none">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Confirmed</CardTitle>
              <CheckCircle className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.confirmed}</div>
            </CardContent>
          </Card>
          <Card className="rounded-sm border-none">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Cancelled</CardTitle>
              <XCircle className="h-4 w-4 text-red-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.cancelled}</div>
            </CardContent>
          </Card>
          <Card className="rounded-sm border-none">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Revenue</CardTitle>
              <CreditCard className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${stats.revenue.toLocaleString()}</div>
            </CardContent>
          </Card>
        </div>

        {/* Search and Bookings Table */}
        <Card className="rounded-sm border-none">
          <CardHeader>
            <div className="flex items-center space-x-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  type="search"
                  placeholder="Search bookings..."
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
                <p className="text-gray-500">Loading bookings...</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Booking ID</TableHead>
                      <TableHead>Passenger</TableHead>
                      <TableHead className="hidden md:table-cell">Route</TableHead>
                      <TableHead className="hidden lg:table-cell">Travel Date</TableHead>
                      <TableHead className="hidden sm:table-cell">Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredBookings.map((booking) => (
                      <TableRow key={booking._id}>
                        <TableCell>
                          <div className="font-mono text-xs">
                            #{booking._id.slice(-6).toUpperCase()}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div>
                            <p className="font-medium">{booking.passengerName}</p>
                            <p className="text-sm text-gray-500 md:hidden">{booking.passengerPhone}</p>
                          </div>
                        </TableCell>
                        <TableCell className="hidden md:table-cell">
                          {typeof booking.routeId === 'object' && (
                            <div>
                              <p className="font-medium">{booking.routeId.name}</p>
                              <p className="text-sm text-gray-500">
                                {booking.routeId.fromLocation} → {booking.routeId.toLocation}
                              </p>
                            </div>
                          )}
                        </TableCell>
                        <TableCell className="hidden lg:table-cell">
                          {format(new Date(booking.travelDate), 'dd MMM yyyy')}
                        </TableCell>
                        <TableCell className="hidden sm:table-cell">
                          <div className="space-y-1">
                            <Badge className={getStatusBadgeColor(booking.status)}>
                              {booking.status}
                            </Badge>
                            <Badge className={getPaymentBadgeColor(booking.paymentStatus)}>
                              {booking.paymentStatus}
                            </Badge>
                          </div>
                        </TableCell>
                        <TableCell>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" className="h-8 w-8 p-0">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => handleViewDetails(booking)}>
                                <Eye className="w-4 h-4 mr-2" />
                                View Details
                              </DropdownMenuItem>
                              {hasPermission('bookings:delete') && booking.status !== 'cancelled' && (
                                <DropdownMenuItem
                                  onClick={() => handleDeleteBooking(booking)}
                                  className="text-red-600 hover:text-red-700"
                                >
                                  <Trash2 className="w-4 h-4 mr-2" />
                                  Cancel Booking
                                </DropdownMenuItem>
                              )}
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Booking Details Modal */}
        <Dialog open={isDetailModalOpen} onOpenChange={setIsDetailModalOpen}>
          <DialogContent className="sm:max-w-[525px] bg-sky-100">
            <DialogHeader>
              <DialogTitle>Booking Details</DialogTitle>
              <DialogDescription>
                Complete booking information
              </DialogDescription>
            </DialogHeader>
            {selectedBooking && (
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <p className="text-sm text-gray-500">Booking ID</p>
                    <p className="font-mono font-medium">#{selectedBooking._id.slice(-6).toUpperCase()}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm text-gray-500">Status</p>
                    <div className="flex gap-2">
                      <Badge className={getStatusBadgeColor(selectedBooking.status)}>
                        {selectedBooking.status}
                      </Badge>
                      <Badge className={getPaymentBadgeColor(selectedBooking.paymentStatus)}>
                        {selectedBooking.paymentStatus}
                      </Badge>
                    </div>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm text-gray-500">Passenger Name</p>
                    <p className="font-medium">{selectedBooking.passengerName}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm text-gray-500">Phone</p>
                    <p className="font-medium">{selectedBooking.passengerPhone}</p>
                  </div>
                  {selectedBooking.passengerEmail && (
                    <div className="space-y-1 col-span-2">
                      <p className="text-sm text-gray-500">Email</p>
                      <p className="font-medium">{selectedBooking.passengerEmail}</p>
                    </div>
                  )}
                  <div className="space-y-1">
                    <p className="text-sm text-gray-500">Travel Date</p>
                    <p className="font-medium">
                      {format(new Date(selectedBooking.travelDate), 'dd MMM yyyy')}
                    </p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm text-gray-500">Booking Date</p>
                    <p className="font-medium">
                      {format(new Date(selectedBooking.bookingDate), 'dd MMM yyyy')}
                    </p>
                  </div>
                  {typeof selectedBooking.routeId === 'object' && (
                    <div className="space-y-1 col-span-2">
                      <p className="text-sm text-gray-500">Route</p>
                      <p className="font-medium">{selectedBooking.routeId.name}</p>
                      <p className="text-sm text-gray-600">
                        {selectedBooking.routeId.fromLocation} → {selectedBooking.routeId.toLocation}
                      </p>
                    </div>
                  )}
                  {typeof selectedBooking.busId === 'object' && (
                    <div className="space-y-1">
                      <p className="text-sm text-gray-500">Bus</p>
                      <p className="font-medium">
                        {selectedBooking.busId.busNumber} ({selectedBooking.busId.type})
                      </p>
                    </div>
                  )}
                  <div className="space-y-1">
                    <p className="text-sm text-gray-500">Seats</p>
                    <div className="flex gap-1">
                      {selectedBooking.seatNumbers.map(seat => (
                        <Badge key={seat} variant="secondary">
                          {seat}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm text-gray-500">Pickup Location</p>
                    <p className="font-medium">{selectedBooking.pickupLocation || 'Not specified'}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm text-gray-500">Total Amount</p>
                    <p className="font-medium text-lg">${selectedBooking.totalAmount}</p>
                  </div>
                  {selectedBooking.notes && (
                    <div className="space-y-1 col-span-2">
                      <p className="text-sm text-gray-500">Notes</p>
                      <p className="font-medium">{selectedBooking.notes}</p>
                    </div>
                  )}
                </div>
              </div>
            )}
            <DialogFooter>
              <Button onClick={() => setIsDetailModalOpen(false)} className="bg-gray-500 hover:bg-gray-600">
                Close
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Delete Confirmation Dialog */}
        <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Are you sure?</AlertDialogTitle>
              <AlertDialogDescription>
                This action cannot be undone. This will cancel the booking
                {selectedBooking && ` for ${selectedBooking.passengerName}`}.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={confirmDeleteBooking}
                className="bg-red-600 hover:bg-red-700"
              >
                Cancel Booking
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </DashboardLayout>
  );
}