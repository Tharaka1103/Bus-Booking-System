'use client';

import { useState, useEffect } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
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
  RefreshCw,
  Loader2,
  Calendar,
  Info,
} from 'lucide-react';
import { IFeedback } from '@/types';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

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
      filtered = filtered.filter((feedback) => feedback.status === activeTab);
    }

    // Filter by search
    if (searchTerm) {
      filtered = filtered.filter(
        (feedback) =>
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
        credentials: 'include',
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
        body: JSON.stringify({ status: 'approved' }),
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
        body: JSON.stringify({ status: 'rejected' }),
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
    setIsViewModalOpen(false);
  };

  const confirmDeleteFeedback = async () => {
    if (!selectedFeedback) return;

    try {
      const response = await fetch(`/api/feedback/${selectedFeedback._id}`, {
        method: 'DELETE',
        credentials: 'include',
      });

      if (response.ok) {
        toast.success('Feedback deleted successfully');
        setIsDeleteDialogOpen(false);
        setSelectedFeedback(null);
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
    pending: feedbacks.filter((f) => f.status === 'pending').length,
    approved: feedbacks.filter((f) => f.status === 'approved').length,
    rejected: feedbacks.filter((f) => f.status === 'rejected').length,
  };

  if (!hasPermission('feedbacks:read')) {
    return (
      <DashboardLayout>
        <Card>
          <CardContent className="flex items-center justify-center h-64">
            <div className="text-center">
              <MessageSquare className="w-12 h-12 mx-auto mb-4 text-gray-400" />
              <p className="text-gray-600">You don't have permission to view feedbacks.</p>
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
            <h1 className="text-2xl font-bold text-gray-900">Feedback Management</h1>
            <p className="text-sm text-gray-600 mt-1">Review and manage customer feedbacks</p>
          </div>
          <Button variant="outline" size="sm" onClick={fetchFeedbacks} className="w-full sm:w-auto">
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
          <Card className="rounded-sm border-none">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Feedbacks</CardTitle>
              <MessageSquare className="h-4 w-4 text-gray-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.total}</div>
              <p className="text-xs text-gray-600 mt-1">All submitted feedbacks</p>
            </CardContent>
          </Card>
          <Card className="rounded-sm border-none">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending</CardTitle>
              <Clock className="h-4 w-4 text-yellow-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-600">{stats.pending}</div>
              <p className="text-xs text-gray-600 mt-1">Awaiting review</p>
            </CardContent>
          </Card>
          <Card className="rounded-sm border-none">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Approved</CardTitle>
              <CheckCircle className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{stats.approved}</div>
              <p className="text-xs text-gray-600 mt-1">Approved feedbacks</p>
            </CardContent>
          </Card>
          <Card className="rounded-sm border-none">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Rejected</CardTitle>
              <XCircle className="h-4 w-4 text-red-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">{stats.rejected}</div>
              <p className="text-xs text-gray-600 mt-1">Rejected feedbacks</p>
            </CardContent>
          </Card>
        </div>

        {/* Feedbacks Table */}
        <Card className="rounded-sm border-none">
          <CardHeader>
            <CardTitle className="text-lg">Feedback List</CardTitle>
            <CardDescription>Review and manage customer feedback submissions</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col gap-4 mb-6">
              <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList className="grid w-full grid-cols-4">
                  <TabsTrigger value="all">All</TabsTrigger>
                  <TabsTrigger value="pending">
                    Pending {stats.pending > 0 && `(${stats.pending})`}
                  </TabsTrigger>
                  <TabsTrigger value="approved">Approved</TabsTrigger>
                  <TabsTrigger value="rejected">Rejected</TabsTrigger>
                </TabsList>
              </Tabs>
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  type="search"
                  placeholder="Search feedbacks by name, mobile, or content..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            {loading ? (
              <div className="flex items-center justify-center h-64">
                <div className="text-center">
                  <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-primary" />
                  <p className="text-gray-600">Loading feedbacks...</p>
                </div>
              </div>
            ) : filteredFeedbacks.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-64 text-gray-500">
                <MessageSquare className="w-12 h-12 mb-4 text-gray-400" />
                <p className="text-gray-600">No feedbacks found</p>
                <p className="text-sm text-gray-500 mt-1">Try adjusting your search or filters</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Customer</TableHead>
                      <TableHead className="hidden lg:table-cell">Feedback</TableHead>
                      <TableHead className="hidden md:table-cell">Status</TableHead>
                      <TableHead className="hidden lg:table-cell">Date</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredFeedbacks.map((feedback) => (
                      <ContextMenu key={feedback._id}>
                        <ContextMenuTrigger asChild>
                          <TableRow className="cursor-context-menu hover:bg-gray-50">
                            <TableCell>
                              <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-primary text-white rounded-full flex items-center justify-center flex-shrink-0">
                                  <User className="w-5 h-5" />
                                </div>
                                <div className="min-w-0">
                                  <p className="font-medium text-gray-900 truncate">
                                    {feedback.name}
                                  </p>
                                  <p className="text-sm text-gray-600 flex items-center truncate">
                                    <Phone className="w-3 h-3 mr-1 flex-shrink-0" />
                                    {feedback.mobile}
                                  </p>
                                  <div className="flex gap-2 mt-1 md:hidden">
                                    {getStatusBadge(feedback.status)}
                                  </div>
                                </div>
                              </div>
                            </TableCell>
                            <TableCell className="hidden lg:table-cell max-w-md">
                              <p className="truncate text-gray-700">
                                {feedback.feedback.length > 100
                                  ? `${feedback.feedback.substring(0, 100)}...`
                                  : feedback.feedback}
                              </p>
                            </TableCell>
                            <TableCell className="hidden md:table-cell">
                              {getStatusBadge(feedback.status)}
                            </TableCell>
                            <TableCell className="hidden lg:table-cell">
                              <div className="flex items-center gap-2 text-sm text-gray-600">
                                <Calendar className="w-3 h-3" />
                                {new Date(feedback.createdAt).toLocaleDateString()}
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
                                  <DropdownMenuItem onClick={() => handleViewFeedback(feedback)}>
                                    <Eye className="w-4 h-4 mr-2" />
                                    View Details
                                  </DropdownMenuItem>
                                  {hasPermission('feedbacks:write') &&
                                    feedback.status === 'pending' && (
                                      <>
                                        <DropdownMenuItem
                                          onClick={() => handleApproveFeedback(feedback._id)}
                                          className="text-green-600 focus:text-green-600"
                                        >
                                          <Check className="w-4 h-4 mr-2" />
                                          Approve
                                        </DropdownMenuItem>
                                        <DropdownMenuItem
                                          onClick={() => handleRejectFeedback(feedback._id)}
                                          className="text-orange-600 focus:text-orange-600"
                                        >
                                          <X className="w-4 h-4 mr-2" />
                                          Reject
                                        </DropdownMenuItem>
                                      </>
                                    )}
                                  {hasPermission('feedbacks:delete') && (
                                    <>
                                      <Separator className="my-1" />
                                      <DropdownMenuItem
                                        onClick={() => handleDeleteFeedback(feedback)}
                                        className="text-red-600 focus:text-red-600"
                                      >
                                        <Trash2 className="w-4 h-4 mr-2" />
                                        Delete
                                      </DropdownMenuItem>
                                    </>
                                  )}
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </TableCell>
                          </TableRow>
                        </ContextMenuTrigger>
                        <ContextMenuContent className="w-56">
                          <ContextMenuItem onClick={() => handleViewFeedback(feedback)}>
                            <Eye className="w-4 h-4 mr-2" />
                            View Details
                          </ContextMenuItem>
                          {hasPermission('feedbacks:write') && feedback.status === 'pending' && (
                            <>
                              <ContextMenuItem
                                onClick={() => handleApproveFeedback(feedback._id)}
                                className="text-green-600 focus:text-green-600"
                              >
                                <Check className="w-4 h-4 mr-2" />
                                Approve
                              </ContextMenuItem>
                              <ContextMenuItem
                                onClick={() => handleRejectFeedback(feedback._id)}
                                className="text-orange-600 focus:text-orange-600"
                              >
                                <X className="w-4 h-4 mr-2" />
                                Reject
                              </ContextMenuItem>
                            </>
                          )}
                          {hasPermission('feedbacks:delete') && (
                            <>
                              <ContextMenuSeparator />
                              <ContextMenuItem
                                onClick={() => handleDeleteFeedback(feedback)}
                                className="text-red-600 focus:text-red-600"
                              >
                                <Trash2 className="w-4 h-4 mr-2" />
                                Delete
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

        {/* View Feedback Modal */}
        <Dialog open={isViewModalOpen} onOpenChange={setIsViewModalOpen}>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>Feedback Details</DialogTitle>
              <DialogDescription>Review complete feedback information</DialogDescription>
            </DialogHeader>
            {selectedFeedback && (
              <ScrollArea className="max-h-[60vh]">
                <div className="space-y-4 py-4">
                  <div className="flex flex-col items-center text-center pb-4 border-b">
                    <div className="w-20 h-20 bg-primary text-white rounded-full flex items-center justify-center mb-3">
                      <MessageSquare className="w-10 h-10" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900">{selectedFeedback.name}</h3>
                    <p className="text-sm text-gray-600 mt-1 flex items-center gap-1">
                      <Phone className="w-3 h-3" />
                      {selectedFeedback.mobile}
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <p className="text-sm text-gray-500">Customer Name</p>
                      <p className="text-sm font-medium">{selectedFeedback.name}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm text-gray-500">Mobile Number</p>
                      <p className="text-sm font-medium">{selectedFeedback.mobile}</p>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <p className="text-sm text-gray-500">Status</p>
                    {getStatusBadge(selectedFeedback.status)}
                  </div>

                  <div className="space-y-2">
                    <p className="text-sm text-gray-500">Feedback</p>
                    <div className="bg-gray-50 p-4 rounded-lg border">
                      <p className="text-gray-700 whitespace-pre-wrap">{selectedFeedback.feedback}</p>
                    </div>
                  </div>

                  <Separator />

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <p className="text-sm text-gray-500">Submitted On</p>
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-gray-400" />
                        <p className="text-sm font-medium">
                          {new Date(selectedFeedback.createdAt).toLocaleString()}
                        </p>
                      </div>
                    </div>
                    {selectedFeedback.approvedAt && (
                      <div className="space-y-1">
                        <p className="text-sm text-gray-500">Approved On</p>
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4 text-gray-400" />
                          <p className="text-sm font-medium">
                            {new Date(selectedFeedback.approvedAt).toLocaleString()}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>

                  {selectedFeedback.approvedBy && (
                    <div className="space-y-1">
                      <p className="text-sm text-gray-500">Approved By</p>
                      <p className="text-sm font-medium">
                        {selectedFeedback.approvedBy.firstName} {selectedFeedback.approvedBy.lastName}
                      </p>
                    </div>
                  )}
                </div>
              </ScrollArea>
            )}
            <DialogFooter className="gap-2">
              {hasPermission('feedbacks:write') &&
                selectedFeedback &&
                selectedFeedback.status === 'pending' && (
                  <>
                    <Button
                      onClick={() => {
                        handleApproveFeedback(selectedFeedback._id);
                        setIsViewModalOpen(false);
                      }}
                      className="w-full sm:w-auto bg-green-600 hover:bg-green-700"
                    >
                      <Check className="w-4 h-4 mr-2" />
                      Approve
                    </Button>
                    <Button
                      onClick={() => {
                        handleRejectFeedback(selectedFeedback._id);
                        setIsViewModalOpen(false);
                      }}
                      className="w-full sm:w-auto bg-orange-600 hover:bg-orange-700"
                    >
                      <X className="w-4 h-4 mr-2" />
                      Reject
                    </Button>
                  </>
                )}
              {hasPermission('feedbacks:delete') && selectedFeedback && (
                <Button
                  variant="destructive"
                  onClick={() => handleDeleteFeedback(selectedFeedback)}
                  className="w-full sm:w-auto"
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Delete
                </Button>
              )}
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Delete Confirmation Dialog */}
        <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
              <AlertDialogDescription>
                This action cannot be undone. This will permanently delete the feedback
                {selectedFeedback && (
                  <span className="font-semibold"> from "{selectedFeedback.name}"</span>
                )}
                .
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