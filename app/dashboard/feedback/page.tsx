'use client';

import { useState, useEffect } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  MessageSquare,
  Search,
  MoreHorizontal,
  Check,
  X,
  Trash2,
  Eye,
  Clock,
  CheckCircle,
  XCircle,
  Phone,
  User,
} from 'lucide-react';
import { IFeedback } from '@/types';
import { toast } from 'sonner';

export default function FeedbacksPage() {
  const { hasPermission } = useAuth();
  const [feedbacks, setFeedbacks] = useState<IFeedback[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('all');
  const [filteredFeedbacks, setFilteredFeedbacks] = useState<IFeedback[]>([]);
  
  // Modal states
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedFeedback, setSelectedFeedback] = useState<IFeedback | null>(null);

  useEffect(() => {
    if (hasPermission('feedbacks:read')) {
      fetchFeedbacks();
    }
  }, [hasPermission]);

  useEffect(() => {
    let filtered = feedbacks;

    // Filter by tab
    if (activeTab !== 'all') {
      filtered = filtered.filter(feedback => feedback.status === activeTab);
    }

    // Filter by search
    if (searchTerm) {
      filtered = filtered.filter(feedback =>
        feedback.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        feedback.mobile.includes(searchTerm) ||
        feedback.feedback.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredFeedbacks(filtered);
  }, [feedbacks, activeTab, searchTerm]);

  const fetchFeedbacks = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/feedback', {
        credentials: 'include'
      });

      if (response.ok) {
        const data = await response.json();
        setFeedbacks(data.data.feedbacks);
      } else {
        toast.error('Failed to fetch feedbacks');
      }
    } catch (error) {
      console.error('Error fetching feedbacks:', error);
      toast.error('Network error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleViewFeedback = (feedback: IFeedback) => {
    setSelectedFeedback(feedback);
    setIsViewModalOpen(true);
  };

  const handleApproveFeedback = async (feedbackId: string) => {
    try {
      const response = await fetch(`/api/feedback/${feedbackId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ status: 'approved' })
      });

      if (response.ok) {
        toast.success('Feedback approved successfully');
        fetchFeedbacks();
      } else {
        const data = await response.json();
        toast.error(data.message || 'Failed to approve feedback');
      }
    } catch (error) {
      console.error('Error approving feedback:', error);
      toast.error('Network error occurred');
    }
  };

  const handleRejectFeedback = async (feedbackId: string) => {
    try {
      const response = await fetch(`/api/feedback/${feedbackId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ status: 'rejected' })
      });

      if (response.ok) {
        toast.success('Feedback rejected');
        fetchFeedbacks();
      } else {
        const data = await response.json();
        toast.error(data.message || 'Failed to reject feedback');
      }
    } catch (error) {
      console.error('Error rejecting feedback:', error);
      toast.error('Network error occurred');
    }
  };

  const handleDeleteFeedback = (feedback: IFeedback) => {
    setSelectedFeedback(feedback);
    setIsDeleteDialogOpen(true);
  };

  const confirmDeleteFeedback = async () => {
    if (!selectedFeedback) return;

    try {
      const response = await fetch(`/api/feedback/${selectedFeedback._id}`, {
        method: 'DELETE',
        credentials: 'include'
      });

      if (response.ok) {
        toast.success('Feedback deleted successfully');
        setIsDeleteDialogOpen(false);
        fetchFeedbacks();
      } else {
        const data = await response.json();
        toast.error(data.message || 'Failed to delete feedback');
      }
    } catch (error) {
      console.error('Error deleting feedback:', error);
      toast.error('Network error occurred');
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'approved':
        return (
          <Badge className="bg-green-100 text-green-800">
            <CheckCircle className="w-3 h-3 mr-1" />
            Approved
          </Badge>
        );
      case 'rejected':
        return (
          <Badge className="bg-red-100 text-red-800">
            <XCircle className="w-3 h-3 mr-1" />
            Rejected
          </Badge>
        );
      default:
        return (
          <Badge className="bg-yellow-100 text-yellow-800">
            <Clock className="w-3 h-3 mr-1" />
            Pending
          </Badge>
        );
    }
  };

  const stats = {
    total: feedbacks.length,
    pending: feedbacks.filter(f => f.status === 'pending').length,
    approved: feedbacks.filter(f => f.status === 'approved').length,
    rejected: feedbacks.filter(f => f.status === 'rejected').length,
  };

  if (!hasPermission('feedbacks:read')) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <p className="text-gray-500">You don't have permission to view feedbacks.</p>
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
            <h1 className="text-2xl font-bold text-gray-800">Feedback Management</h1>
            <p className="text-gray-600">Review and manage customer feedbacks</p>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card className='rounded-sm border-none'>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Feedbacks</CardTitle>
              <MessageSquare className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.total}</div>
            </CardContent>
          </Card>
          <Card className='rounded-sm border-none'>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending</CardTitle>
              <Clock className="h-4 w-4 text-yellow-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-600">{stats.pending}</div>
            </CardContent>
          </Card>
          <Card className='rounded-sm border-none'>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Approved</CardTitle>
              <CheckCircle className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{stats.approved}</div>
            </CardContent>
          </Card>
          <Card className='rounded-sm border-none'>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Rejected</CardTitle>
              <XCircle className="h-4 w-4 text-red-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">{stats.rejected}</div>
            </CardContent>
          </Card>
        </div>

        {/* Feedbacks Table */}
        <Card className='rounded-sm border-none'>
          <CardHeader>
            <div className="flex items-center justify-between">
              <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <div className="flex items-center justify-between">
                  <TabsList>
                    <TabsTrigger value="all">All</TabsTrigger>
                    <TabsTrigger value="pending">
                      Pending {stats.pending > 0 && `(${stats.pending})`}
                    </TabsTrigger>
                    <TabsTrigger value="approved">Approved</TabsTrigger>
                    <TabsTrigger value="rejected">Rejected</TabsTrigger>
                  </TabsList>
                  <div className="relative w-64">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <Input
                      type="search"
                      placeholder="Search feedbacks..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
              </Tabs>
            </div>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex items-center justify-center h-32">
                <p className="text-gray-500">Loading feedbacks...</p>
              </div>
            ) : filteredFeedbacks.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-32 text-gray-500">
                <MessageSquare className="w-12 h-12 mb-2 opacity-20" />
                <p>No feedbacks found</p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Customer</TableHead>
                    <TableHead>Feedback</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredFeedbacks.map((feedback) => (
                    <TableRow key={feedback._id}>
                      <TableCell>
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center">
                            <User className="w-5 h-5 text-white" />
                          </div>
                          <div>
                            <p className="font-medium">{feedback.name}</p>
                            <p className="text-sm text-gray-500 flex items-center">
                              <Phone className="w-3 h-3 mr-1" />
                              {feedback.mobile}
                            </p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="max-w-md">
                        <p className="truncate text-gray-700">
                          {feedback.feedback.length > 100
                            ? `${feedback.feedback.substring(0, 100)}...`
                            : feedback.feedback}
                        </p>
                      </TableCell>
                      <TableCell>{getStatusBadge(feedback.status)}</TableCell>
                      <TableCell>
                        {new Date(feedback.createdAt).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => handleViewFeedback(feedback)}>
                              <Eye className="w-4 h-4 mr-2" />
                              View Details
                            </DropdownMenuItem>
                            {hasPermission('feedbacks:write') && feedback.status === 'pending' && (
                              <>
                                <DropdownMenuItem
                                  onClick={() => handleApproveFeedback(feedback._id)}
                                  className="text-green-600"
                                >
                                  <Check className="w-4 h-4 mr-2" />
                                  Approve
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  onClick={() => handleRejectFeedback(feedback._id)}
                                  className="text-orange-600"
                                >
                                  <X className="w-4 h-4 mr-2" />
                                  Reject
                                </DropdownMenuItem>
                              </>
                            )}
                            {hasPermission('feedbacks:delete') && (
                              <DropdownMenuItem
                                onClick={() => handleDeleteFeedback(feedback)}
                                className="text-red-600 hover:text-red-700"
                              >
                                <Trash2 className="w-4 h-4 mr-2" />
                                Delete
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

        {/* View Feedback Modal */}
        <Dialog open={isViewModalOpen} onOpenChange={setIsViewModalOpen}>
          <DialogContent className="sm:max-w-[600px] bg-sky-50">
            <DialogHeader>
              <DialogTitle>Feedback Details</DialogTitle>
              <DialogDescription>
                Review complete feedback information
              </DialogDescription>
            </DialogHeader>
            {selectedFeedback && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-medium text-gray-500">Customer Name</p>
                    <p className="text-lg font-semibold">{selectedFeedback.name}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">Mobile Number</p>
                    <p className="text-lg font-semibold">{selectedFeedback.mobile}</p>
                  </div>
                </div>
                
                <div>
                  <p className="text-sm font-medium text-gray-500 mb-2">Status</p>
                  {getStatusBadge(selectedFeedback.status)}
                </div>

                <div>
                  <p className="text-sm font-medium text-gray-500 mb-2">Feedback</p>
                  <div className="bg-white p-4 rounded-lg border">
                    <p className="text-gray-700 whitespace-pre-wrap">{selectedFeedback.feedback}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 pt-4 border-t">
                  <div>
                    <p className="text-sm font-medium text-gray-500">Submitted On</p>
                    <p className="text-sm">
                      {new Date(selectedFeedback.createdAt).toLocaleString()}
                    </p>
                  </div>
                  {selectedFeedback.approvedAt && (
                    <div>
                      <p className="text-sm font-medium text-gray-500">Approved On</p>
                      <p className="text-sm">
                        {new Date(selectedFeedback.approvedAt).toLocaleString()}
                      </p>
                    </div>
                  )}
                </div>

                {selectedFeedback.approvedBy && (
                  <div>
                    <p className="text-sm font-medium text-gray-500">Approved By</p>
                    <p className="text-sm">
                      {selectedFeedback.approvedBy.firstName} {selectedFeedback.approvedBy.lastName}
                    </p>
                  </div>
                )}

                {hasPermission('feedbacks:write') && selectedFeedback.status === 'pending' && (
                  <div className="flex space-x-2 pt-4">
                    <Button
                      onClick={() => {
                        handleApproveFeedback(selectedFeedback._id);
                        setIsViewModalOpen(false);
                      }}
                      className="flex-1 bg-green-600 hover:bg-green-700"
                    >
                      <Check className="w-4 h-4 mr-2" />
                      Approve
                    </Button>
                    <Button
                      onClick={() => {
                        handleRejectFeedback(selectedFeedback._id);
                        setIsViewModalOpen(false);
                      }}
                      className="flex-1 bg-orange-600 hover:bg-orange-700"
                    >
                      <X className="w-4 h-4 mr-2" />
                      Reject
                    </Button>
                  </div>
                )}
              </div>
            )}
          </DialogContent>
        </Dialog>

        {/* Delete Confirmation Dialog */}
        <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Are you sure?</AlertDialogTitle>
              <AlertDialogDescription>
                This action cannot be undone. This will permanently delete the feedback
                {selectedFeedback && ` from "${selectedFeedback.name}"`}.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={confirmDeleteFeedback}
                className="bg-red-600 hover:bg-red-700"
              >
                Delete Feedback
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </DashboardLayout>
  );
}