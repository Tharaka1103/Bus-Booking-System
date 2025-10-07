'use client';

import { useState, useEffect } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
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
import { Checkbox } from '@/components/ui/checkbox';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Users,
  Plus,
  Search,
  Edit,
  Trash2,
  Shield,
  UserCheck,
  UserX,
  Eye,
  EyeOff,
  Loader2,
  Mail,
  Phone,
  Calendar,
  Filter,
  RefreshCw,
  MoreHorizontal,
  Info,
} from 'lucide-react';
import { IUser } from '@/types';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

export default function UsersPage() {
  const { hasPermission } = useAuth();
  const [users, setUsers] = useState<IUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredUsers, setFilteredUsers] = useState<IUser[]>([]);
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  // Modal states
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<IUser | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [changePassword, setChangePassword] = useState(false);

  // Form states
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    role: '',
    isActive: true,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [formLoading, setFormLoading] = useState(false);

  useEffect(() => {
    if (hasPermission('users:read')) {
      fetchUsers();
    }
  }, [hasPermission]);

  useEffect(() => {
    let filtered = users.filter(
      (user) =>
        user.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.role.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (roleFilter !== 'all') {
      filtered = filtered.filter((user) => user.role === roleFilter);
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter((user) =>
        statusFilter === 'active' ? user.isActive : !user.isActive
      );
    }

    setFilteredUsers(filtered);
  }, [users, searchTerm, roleFilter, statusFilter]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/users', {
        credentials: 'include',
      });

      if (response.ok) {
        const data = await response.json();
        setUsers(data.data.users);
      } else {
        toast.error('Failed to fetch users');
      }
    } catch (error) {
      console.error('Error fetching users:', error);
      toast.error('Network error occurred');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      password: '',
      confirmPassword: '',
      role: '',
      isActive: true,
    });
    setErrors({});
    setChangePassword(false);
    setShowPassword(false);
  };

  const handleCreateUser = () => {
    resetForm();
    setIsCreateModalOpen(true);
  };

  const handleViewDetails = (user: IUser) => {
    setSelectedUser(user);
    setIsDetailModalOpen(true);
  };

  const handleEditUser = (user: IUser) => {
    setSelectedUser(user);
    setFormData({
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      phone: user.phone,
      password: '',
      confirmPassword: '',
      role: user.role,
      isActive: user.isActive,
    });
    setIsEditModalOpen(true);
    setIsDetailModalOpen(false);
  };

  const handleDeleteUser = (user: IUser) => {
    setSelectedUser(user);
    setIsDeleteDialogOpen(true);
    setIsDetailModalOpen(false);
  };

  const handleSubmitCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormLoading(true);
    setErrors({});

    const newErrors: Record<string, string> = {};

    if (!formData.firstName.trim()) newErrors.firstName = 'First name is required';
    if (!formData.lastName.trim()) newErrors.lastName = 'Last name is required';
    if (!formData.email.trim()) newErrors.email = 'Email is required';
    if (!formData.phone.trim()) newErrors.phone = 'Phone is required';
    if (!formData.password) newErrors.password = 'Password is required';
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }
    if (!formData.role) newErrors.role = 'Role is required';

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      setFormLoading(false);
      return;
    }

    try {
      const response = await fetch('/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          firstName: formData.firstName,
          lastName: formData.lastName,
          email: formData.email,
          phone: formData.phone,
          password: formData.password,
          role: formData.role,
        }),
      });

      const data = await response.json();

      if (data.success) {
        toast.success('User created successfully');
        setIsCreateModalOpen(false);
        fetchUsers();
        resetForm();
      } else {
        if (data.errors) {
          const errorMap: Record<string, string> = {};
          data.errors.forEach((error: any) => {
            errorMap[error.field] = error.message;
          });
          setErrors(errorMap);
        } else {
          toast.error(data.message);
        }
      }
    } catch (error) {
      console.error('Error creating user:', error);
      toast.error('Network error occurred');
    } finally {
      setFormLoading(false);
    }
  };

  const handleSubmitEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUser) return;

    setFormLoading(true);
    setErrors({});

    const newErrors: Record<string, string> = {};

    if (!formData.firstName.trim()) newErrors.firstName = 'First name is required';
    if (!formData.lastName.trim()) newErrors.lastName = 'Last name is required';
    if (!formData.email.trim()) newErrors.email = 'Email is required';
    if (!formData.phone.trim()) newErrors.phone = 'Phone is required';
    if (!formData.role) newErrors.role = 'Role is required';

    if (changePassword) {
      if (!formData.password) newErrors.password = 'Password is required';
      if (formData.password !== formData.confirmPassword) {
        newErrors.confirmPassword = 'Passwords do not match';
      }
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      setFormLoading(false);
      return;
    }

    try {
      const updateData: any = {
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        phone: formData.phone,
        role: formData.role,
        isActive: formData.isActive,
      };

      if (changePassword && formData.password) {
        updateData.password = formData.password;
      }

      const response = await fetch(`/api/users/${selectedUser._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(updateData),
      });

      const data = await response.json();

      if (data.success) {
        toast.success('User updated successfully');
        setIsEditModalOpen(false);
        fetchUsers();
        resetForm();
      } else {
        if (data.errors) {
          const errorMap: Record<string, string> = {};
          data.errors.forEach((error: any) => {
            errorMap[error.field] = error.message;
          });
          setErrors(errorMap);
        } else {
          toast.error(data.message);
        }
      }
    } catch (error) {
      console.error('Error updating user:', error);
      toast.error('Network error occurred');
    } finally {
      setFormLoading(false);
    }
  };

  const confirmDeleteUser = async () => {
    if (!selectedUser) return;

    try {
      const response = await fetch(`/api/users/${selectedUser._id}`, {
        method: 'DELETE',
        credentials: 'include',
      });

      if (response.ok) {
        toast.success('User deleted successfully');
        setIsDeleteDialogOpen(false);
        setSelectedUser(null);
        fetchUsers();
      } else {
        const data = await response.json();
        toast.error(data.message || 'Failed to delete user');
      }
    } catch (error) {
      console.error('Error deleting user:', error);
      toast.error('Network error occurred');
    }
  };

  const handleToggleStatus = async (userId: string, isActive: boolean) => {
    try {
      const response = await fetch(`/api/users/${userId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ isActive: !isActive }),
      });

      if (response.ok) {
        toast.success(`User ${!isActive ? 'activated' : 'deactivated'} successfully`);
        fetchUsers();
      } else {
        toast.error('Failed to update user status');
      }
    } catch (error) {
      console.error('Error updating user status:', error);
      toast.error('Network error occurred');
    }
  };

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'super_admin':
        return 'bg-red-100 text-red-800';
      case 'admin':
        return 'bg-blue-100 text-blue-800';
      case 'manager':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (!hasPermission('users:read')) {
    return (
      <DashboardLayout>
        <Card>
          <CardContent className="flex items-center justify-center h-64">
            <div className="text-center">
              <Shield className="w-12 h-12 mx-auto mb-4 text-gray-400" />
              <p className="text-gray-600">You don't have permission to view users.</p>
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
            <h1 className="text-2xl font-bold text-gray-900">User Management</h1>
            <p className="text-sm text-gray-600 mt-1">
              Manage system users and their permissions
            </p>
          </div>
          <div className="block space-y-3 md:space-y-0 items-center gap-5 md:flex">
            <Button variant="outline" size="sm" onClick={fetchUsers} className="w-full sm:w-auto">
              <RefreshCw className="w-4 h-4 mr-2" />
              Refresh
            </Button>
            {hasPermission('users:write') && (
              <Button onClick={handleCreateUser} size="sm" className="w-full sm:w-auto">
                <Plus className="w-4 h-4 mr-2" />
                Create User
              </Button>
            )}
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
          <Card className="rounded-sm border-none">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Users</CardTitle>
              <Users className="h-4 w-4 text-gray-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{users.length}</div>
              <p className="text-xs text-gray-600 mt-1">All registered users</p>
            </CardContent>
          </Card>
          <Card className="rounded-sm border-none">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Users</CardTitle>
              <UserCheck className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {users.filter((user) => user.isActive).length}
              </div>
              <p className="text-xs text-gray-600 mt-1">Currently active</p>
            </CardContent>
          </Card>
          <Card className="rounded-sm border-none">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Inactive Users</CardTitle>
              <UserX className="h-4 w-4 text-red-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {users.filter((user) => !user.isActive).length}
              </div>
              <p className="text-xs text-gray-600 mt-1">Deactivated accounts</p>
            </CardContent>
          </Card>
          <Card className="rounded-sm border-none">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Admins</CardTitle>
              <Shield className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {users.filter((user) => user.role === 'admin' || user.role === 'super_admin').length}
              </div>
              <p className="text-xs text-gray-600 mt-1">Admin users</p>
            </CardContent>
          </Card>
        </div>

        {/* Search and Users Table */}
        <Card className="rounded-sm border-none">
          <CardHeader>
            <CardTitle className="text-lg">User List</CardTitle>
            <CardDescription>View and manage all users in the system</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col gap-4 mb-6">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  type="search"
                  placeholder="Search users by name, email, or role..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <div className="flex flex-col sm:flex-row gap-2">
                <Select value={roleFilter} onValueChange={setRoleFilter}>
                  <SelectTrigger className="w-full sm:w-[160px]">
                    <Filter className="w-4 h-4 mr-2" />
                    <SelectValue placeholder="Role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Roles</SelectItem>
                    <SelectItem value="super_admin">Super Admin</SelectItem>
                    <SelectItem value="admin">Admin</SelectItem>
                    <SelectItem value="manager">Manager</SelectItem>
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
                  <p className="text-gray-600">Loading users...</p>
                </div>
              </div>
            ) : filteredUsers.length === 0 ? (
              <div className="flex items-center justify-center h-64">
                <div className="text-center">
                  <Users className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                  <p className="text-gray-600">No users found</p>
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
                      <TableHead>User</TableHead>
                      <TableHead className="hidden lg:table-cell">Contact</TableHead>
                      <TableHead className="hidden md:table-cell">Role</TableHead>
                      <TableHead className="hidden md:table-cell">Status</TableHead>
                      <TableHead className="hidden lg:table-cell">2FA</TableHead>
                      <TableHead className="hidden lg:table-cell">Last Login</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredUsers.map((user) => (
                      <ContextMenu key={user._id}>
                        <ContextMenuTrigger asChild>
                          <TableRow className="cursor-context-menu hover:bg-gray-50">
                            <TableCell>
                              <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-primary text-white rounded-full flex items-center justify-center flex-shrink-0">
                                  <span className="text-sm font-semibold">
                                    {user.firstName.charAt(0)}
                                    {user.lastName.charAt(0)}
                                  </span>
                                </div>
                                <div className="min-w-0">
                                  <p className="font-medium text-gray-900 truncate">
                                    {user.firstName} {user.lastName}
                                  </p>
                                  <p className="text-sm text-gray-600 truncate md:hidden">
                                    {user.email}
                                  </p>
                                  <div className="flex gap-2 mt-1 md:hidden">
                                    <Badge className={getRoleBadgeColor(user.role)} variant="secondary">
                                      {user.role.replace('_', ' ').toUpperCase()}
                                    </Badge>
                                    <Badge variant={user.isActive ? 'default' : 'secondary'}>
                                      {user.isActive ? 'Active' : 'Inactive'}
                                    </Badge>
                                  </div>
                                </div>
                              </div>
                            </TableCell>
                            <TableCell className="hidden lg:table-cell">
                              <div className="space-y-1">
                                <div className="flex items-center gap-2 text-sm">
                                  <Mail className="w-3 h-3 text-gray-400" />
                                  <span className="text-gray-600 truncate">{user.email}</span>
                                </div>
                                <div className="flex items-center gap-2 text-sm">
                                  <Phone className="w-3 h-3 text-gray-400" />
                                  <span className="text-gray-600">{user.phone}</span>
                                </div>
                              </div>
                            </TableCell>
                            <TableCell className="hidden md:table-cell">
                              <Badge className={getRoleBadgeColor(user.role)}>
                                {user.role.replace('_', ' ').toUpperCase()}
                              </Badge>
                            </TableCell>
                            <TableCell className="hidden md:table-cell">
                              <Badge variant={user.isActive ? 'default' : 'secondary'}>
                                {user.isActive ? 'Active' : 'Inactive'}
                              </Badge>
                            </TableCell>
                            <TableCell className="hidden lg:table-cell">
                              <Badge variant={user.twoFactorEnabled ? 'default' : 'outline'}>
                                {user.twoFactorEnabled ? 'Enabled' : 'Disabled'}
                              </Badge>
                            </TableCell>
                            <TableCell className="hidden lg:table-cell">
                              <div className="flex items-center gap-2 text-sm text-gray-600">
                                <Calendar className="w-3 h-3" />
                                {user.lastLogin
                                  ? new Date(user.lastLogin).toLocaleDateString()
                                  : 'Never'}
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
                                  <DropdownMenuItem onClick={() => handleViewDetails(user)}>
                                    <Info className="w-4 h-4 mr-2" />
                                    View Details
                                  </DropdownMenuItem>
                                  {hasPermission('users:write') && (
                                    <>
                                      <DropdownMenuItem onClick={() => handleEditUser(user)}>
                                        <Edit className="w-4 h-4 mr-2" />
                                        Edit User
                                      </DropdownMenuItem>
                                      <DropdownMenuItem
                                        onClick={() => handleToggleStatus(user._id, user.isActive)}
                                      >
                                        {user.isActive ? (
                                          <>
                                            <UserX className="w-4 h-4 mr-2" />
                                            Deactivate
                                          </>
                                        ) : (
                                          <>
                                            <UserCheck className="w-4 h-4 mr-2" />
                                            Activate
                                          </>
                                        )}
                                      </DropdownMenuItem>
                                    </>
                                  )}
                                  {hasPermission('users:delete') && user.role !== 'super_admin' && (
                                    <>
                                      <Separator className="my-1" />
                                      <DropdownMenuItem
                                        onClick={() => handleDeleteUser(user)}
                                        className="text-red-600 focus:text-red-600"
                                      >
                                        <Trash2 className="w-4 h-4 mr-2" />
                                        Delete User
                                      </DropdownMenuItem>
                                    </>
                                  )}
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </TableCell>
                          </TableRow>
                        </ContextMenuTrigger>
                        <ContextMenuContent className="w-56">
                          <ContextMenuItem onClick={() => handleViewDetails(user)}>
                            <Info className="w-4 h-4 mr-2" />
                            View Details
                          </ContextMenuItem>
                          {hasPermission('users:write') && (
                            <>
                              <ContextMenuItem onClick={() => handleEditUser(user)}>
                                <Edit className="w-4 h-4 mr-2" />
                                Edit User
                              </ContextMenuItem>
                              <ContextMenuItem onClick={() => handleToggleStatus(user._id, user.isActive)}>
                                {user.isActive ? (
                                  <>
                                    <UserX className="w-4 h-4 mr-2" />
                                    Deactivate
                                  </>
                                ) : (
                                  <>
                                    <UserCheck className="w-4 h-4 mr-2" />
                                    Activate
                                  </>
                                )}
                              </ContextMenuItem>
                            </>
                          )}
                          {hasPermission('users:delete') && user.role !== 'super_admin' && (
                            <>
                              <ContextMenuSeparator />
                              <ContextMenuItem
                                onClick={() => handleDeleteUser(user)}
                                className="text-red-600 focus:text-red-600"
                              >
                                <Trash2 className="w-4 h-4 mr-2" />
                                Delete User
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

        {/* User Details Modal */}
        <Dialog open={isDetailModalOpen} onOpenChange={setIsDetailModalOpen}>
          <DialogContent className="sm:max-w-[525px]">
            <DialogHeader>
              <DialogTitle>User Details</DialogTitle>
              <DialogDescription>Complete user information</DialogDescription>
            </DialogHeader>
            {selectedUser && (
              <ScrollArea className="max-h-[60vh]">
                <div className="grid gap-4 py-4">
                  <div className="flex flex-col items-center text-center pb-4 border-b">
                    <div className="w-20 h-20 bg-primary text-white rounded-full flex items-center justify-center mb-3">
                      <span className="text-2xl font-bold">
                        {selectedUser.firstName.charAt(0)}
                        {selectedUser.lastName.charAt(0)}
                      </span>
                    </div>
                    <h3 className="text-xl font-bold text-gray-900">
                      {selectedUser.firstName} {selectedUser.lastName}
                    </h3>
                    <p className="text-sm text-gray-600 mt-1">{selectedUser.email}</p>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <p className="text-sm text-gray-500">Email Address</p>
                      <div className="flex items-center gap-2">
                        <Mail className="w-4 h-4 text-gray-400" />
                        <p className="text-sm font-medium truncate">{selectedUser.email}</p>
                      </div>
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm text-gray-500">Phone Number</p>
                      <div className="flex items-center gap-2">
                        <Phone className="w-4 h-4 text-gray-400" />
                        <p className="text-sm font-medium">{selectedUser.phone}</p>
                      </div>
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm text-gray-500">Role</p>
                      <Badge className={getRoleBadgeColor(selectedUser.role)}>
                        {selectedUser.role.replace('_', ' ').toUpperCase()}
                      </Badge>
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm text-gray-500">Account Status</p>
                      <Badge variant={selectedUser.isActive ? 'default' : 'secondary'}>
                        {selectedUser.isActive ? 'Active' : 'Inactive'}
                      </Badge>
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm text-gray-500">Two-Factor Auth</p>
                      <Badge variant={selectedUser.twoFactorEnabled ? 'default' : 'outline'}>
                        {selectedUser.twoFactorEnabled ? 'Enabled' : 'Disabled'}
                      </Badge>
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm text-gray-500">Last Login</p>
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-gray-400" />
                        <p className="text-sm font-medium">
                          {selectedUser.lastLogin
                            ? new Date(selectedUser.lastLogin).toLocaleDateString()
                            : 'Never'}
                        </p>
                      </div>
                    </div>
                    <div className="space-y-1 col-span-2">
                      <p className="text-sm text-gray-500">Created At</p>
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-gray-400" />
                        <p className="text-sm font-medium">
                          {new Date(selectedUser.createdAt).toLocaleString()}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </ScrollArea>
            )}
            <DialogFooter className="gap-2">
              {hasPermission('users:write') && selectedUser && (
                <>
                  <Button
                    variant="outline"
                    onClick={() => handleEditUser(selectedUser)}
                    className="w-full sm:w-auto"
                  >
                    <Edit className="w-4 h-4 mr-2" />
                    Edit User
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => handleToggleStatus(selectedUser._id, selectedUser.isActive)}
                    className="w-full sm:w-auto"
                  >
                    {selectedUser.isActive ? (
                      <>
                        <UserX className="w-4 h-4 mr-2" />
                        Deactivate
                      </>
                    ) : (
                      <>
                        <UserCheck className="w-4 h-4 mr-2" />
                        Activate
                      </>
                    )}
                  </Button>
                </>
              )}
              {hasPermission('users:delete') && selectedUser?.role !== 'super_admin' && (
                <Button
                  variant="destructive"
                  onClick={() => selectedUser && handleDeleteUser(selectedUser)}
                  className="w-full sm:w-auto"
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Delete User
                </Button>
              )}
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Create User Modal */}
        <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
          <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Create New User</DialogTitle>
              <DialogDescription>Add a new user to the system. All fields are required.</DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmitCreate}>
              <div className="space-y-4 py-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="firstName">
                      First Name <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="firstName"
                      value={formData.firstName}
                      onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                      className={errors.firstName ? 'border-red-500' : ''}
                    />
                    {errors.firstName && <p className="text-xs text-red-600">{errors.firstName}</p>}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lastName">
                      Last Name <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="lastName"
                      value={formData.lastName}
                      onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                      className={errors.lastName ? 'border-red-500' : ''}
                    />
                    {errors.lastName && <p className="text-xs text-red-600">{errors.lastName}</p>}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">
                    Email Address <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className={errors.email ? 'border-red-500' : ''}
                  />
                  {errors.email && <p className="text-xs text-red-600">{errors.email}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone">
                    Phone Number <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="phone"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className={errors.phone ? 'border-red-500' : ''}
                  />
                  {errors.phone && <p className="text-xs text-red-600">{errors.phone}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="role">
                    Role <span className="text-red-500">*</span>
                  </Label>
                  <Select
                    value={formData.role}
                    onValueChange={(value) => setFormData({ ...formData, role: value })}
                  >
                    <SelectTrigger className={errors.role ? 'border-red-500' : ''}>
                      <SelectValue placeholder="Select a role" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="admin">Admin</SelectItem>
                      <SelectItem value="manager">Manager</SelectItem>
                    </SelectContent>
                  </Select>
                  {errors.role && <p className="text-xs text-red-600">{errors.role}</p>}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="password">
                      Password <span className="text-red-500">*</span>
                    </Label>
                    <div className="relative">
                      <Input
                        id="password"
                        type={showPassword ? 'text' : 'password'}
                        value={formData.password}
                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                        className={cn(errors.password ? 'border-red-500' : '', 'pr-10')}
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-0 top-0 h-full px-3"
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </Button>
                    </div>
                    {errors.password && <p className="text-xs text-red-600">{errors.password}</p>}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword">
                      Confirm Password <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="confirmPassword"
                      type="password"
                      value={formData.confirmPassword}
                      onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                      className={errors.confirmPassword ? 'border-red-500' : ''}
                    />
                    {errors.confirmPassword && (
                      <p className="text-xs text-red-600">{errors.confirmPassword}</p>
                    )}
                  </div>
                </div>
              </div>
              <DialogFooter className="gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setIsCreateModalOpen(false);
                    resetForm();
                  }}
                  className="w-full sm:w-auto"
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={formLoading} className="w-full sm:w-auto">
                  {formLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Creating...
                    </>
                  ) : (
                    'Create User'
                  )}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>

        {/* Edit User Modal */}
        <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
          <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Edit User</DialogTitle>
              <DialogDescription>Update user information and settings.</DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmitEdit}>
              <div className="space-y-4 py-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="edit-firstName">
                      First Name <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="edit-firstName"
                      value={formData.firstName}
                      onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                      className={errors.firstName ? 'border-red-500' : ''}
                    />
                    {errors.firstName && <p className="text-xs text-red-600">{errors.firstName}</p>}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="edit-lastName">
                      Last Name <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="edit-lastName"
                      value={formData.lastName}
                      onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                      className={errors.lastName ? 'border-red-500' : ''}
                    />
                    {errors.lastName && <p className="text-xs text-red-600">{errors.lastName}</p>}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="edit-email">
                    Email Address <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="edit-email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className={errors.email ? 'border-red-500' : ''}
                  />
                  {errors.email && <p className="text-xs text-red-600">{errors.email}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="edit-phone">
                    Phone Number <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="edit-phone"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className={errors.phone ? 'border-red-500' : ''}
                  />
                  {errors.phone && <p className="text-xs text-red-600">{errors.phone}</p>}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="edit-role">
                      Role <span className="text-red-500">*</span>
                    </Label>
                    <Select
                      value={formData.role}
                      onValueChange={(value) => setFormData({ ...formData, role: value })}
                    >
                      <SelectTrigger className={errors.role ? 'border-red-500' : ''}>
                        <SelectValue placeholder="Select a role" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="admin">Admin</SelectItem>
                        <SelectItem value="manager">Manager</SelectItem>
                      </SelectContent>
                    </Select>
                    {errors.role && <p className="text-xs text-red-600">{errors.role}</p>}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="edit-status">Status</Label>
                    <Select
                      value={formData.isActive ? 'active' : 'inactive'}
                      onValueChange={(value) =>
                        setFormData({ ...formData, isActive: value === 'active' })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="active">Active</SelectItem>
                        <SelectItem value="inactive">Inactive</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <Separator />

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="change-password"
                    checked={changePassword}
                    onCheckedChange={(checked) => {
                      setChangePassword(!!checked);
                      if (!checked) {
                        setFormData({ ...formData, password: '', confirmPassword: '' });
                        setErrors({ ...errors, password: '', confirmPassword: '' });
                      }
                    }}
                  />
                  <Label htmlFor="change-password" className="cursor-pointer font-medium">
                    Change Password
                  </Label>
                </div>

                {changePassword && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="edit-password">
                        New Password <span className="text-red-500">*</span>
                      </Label>
                      <div className="relative">
                        <Input
                          id="edit-password"
                          type={showPassword ? 'text' : 'password'}
                          value={formData.password}
                          onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                          className={cn(errors.password ? 'border-red-500' : '', 'pr-10')}
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-0 top-0 h-full px-3"
                        >
                          {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </Button>
                      </div>
                      {errors.password && <p className="text-xs text-red-600">{errors.password}</p>}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="edit-confirmPassword">
                        Confirm Password <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        id="edit-confirmPassword"
                        type="password"
                        value={formData.confirmPassword}
                        onChange={(e) =>
                          setFormData({ ...formData, confirmPassword: e.target.value })
                        }
                        className={errors.confirmPassword ? 'border-red-500' : ''}
                      />
                      {errors.confirmPassword && (
                        <p className="text-xs text-red-600">{errors.confirmPassword}</p>
                      )}
                    </div>
                  </div>
                )}
              </div>
              <DialogFooter className="gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setIsEditModalOpen(false);
                    resetForm();
                  }}
                  className="w-full sm:w-auto"
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={formLoading} className="w-full sm:w-auto">
                  {formLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Updating...
                    </>
                  ) : (
                    'Update User'
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
                This action cannot be undone. This will permanently delete the user
                {selectedUser && (
                  <span className="font-semibold">
                    {' '}
                    "{selectedUser.firstName} {selectedUser.lastName}"
                  </span>
                )}{' '}
                and remove all their data from the system.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={confirmDeleteUser} className="bg-red-600 hover:bg-red-700">
                Delete User
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </DashboardLayout>
  );
}