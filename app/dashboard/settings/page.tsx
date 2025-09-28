'use client';

import { useState } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { User, Lock, Shield, Save, Eye, EyeOff } from 'lucide-react';
import { toast } from 'sonner';

export default function SettingsPage() {
  const { user, updateProfile, changePassword, setupTwoFactor, disableTwoFactor } = useAuth();
  const [loading, setLoading] = useState(false);
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false
  });

  // Profile form state
  const [profileData, setProfileData] = useState({
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    phone: user?.phone || ''
  });

  // Password form state
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  // Two-factor form state
  const [twoFactorData, setTwoFactorData] = useState({
    pin: '',
    confirmPin: ''
  });

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const result = await updateProfile(profileData);
      if (result.success) {
        toast.success('Profile updated successfully');
      } else {
        toast.error(result.message);
      }
    } catch (error) {
      toast.error('Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error('New passwords do not match');
      setLoading(false);
      return;
    }

    try {
      const result = await changePassword(passwordData.currentPassword, passwordData.newPassword);
      if (result.success) {
        toast.success('Password changed successfully');
        setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
      } else {
        toast.error(result.message);
      }
    } catch (error) {
      toast.error('Failed to change password');
    } finally {
      setLoading(false);
    }
  };

  const handleTwoFactorSetup = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    if (twoFactorData.pin !== twoFactorData.confirmPin) {
      toast.error('PINs do not match');
      setLoading(false);
      return;
    }

    if (!/^[0-9]{6}$/.test(twoFactorData.pin)) {
      toast.error('PIN must be exactly 6 digits');
      setLoading(false);
      return;
    }

    try {
      const result = await setupTwoFactor(twoFactorData.pin);
      if (result.success) {
        toast.success('Two-factor authentication enabled successfully');
        setTwoFactorData({ pin: '', confirmPin: '' });
      } else {
        toast.error(result.message);
      }
    } catch (error) {
      toast.error('Failed to setup two-factor authentication');
    } finally {
      setLoading(false);
    }
  };

  const handleTwoFactorDisable = async () => {
    if (!confirm('Are you sure you want to disable two-factor authentication?')) return;

    setLoading(true);
    try {
      const result = await disableTwoFactor();
      if (result.success) {
        toast.success('Two-factor authentication disabled');
      } else {
        toast.error(result.message);
      }
    } catch (error) {
      toast.error('Failed to disable two-factor authentication');
    } finally {
      setLoading(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Settings</h1>
          <p className="text-gray-600">Manage your account settings and preferences</p>
        </div>

        {/* Settings Tabs */}
        <Tabs defaultValue="profile" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="profile" className="flex items-center space-x-2">
              <User className="w-4 h-4" />
              <span>Profile</span>
            </TabsTrigger>
            <TabsTrigger value="security" className="flex items-center space-x-2">
              <Lock className="w-4 h-4" />
              <span>Security</span>
            </TabsTrigger>
            <TabsTrigger value="two-factor" className="flex items-center space-x-2">
              <Shield className="w-4 h-4" />
              <span>Two-Factor Auth</span>
            </TabsTrigger>
          </TabsList>

          {/* Profile Tab */}
          <TabsContent value="profile">
            <Card>
              <CardHeader>
                <CardTitle>Profile Information</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleProfileUpdate} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="firstName">First Name</Label>
                      <Input
                        id="firstName"
                        value={profileData.firstName}
                        onChange={(e) => setProfileData({...profileData, firstName: e.target.value})}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="lastName">Last Name</Label>
                      <Input
                        id="lastName"
                        value={profileData.lastName}
                        onChange={(e) => setProfileData({...profileData, lastName: e.target.value})}
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="email">Email Address</Label>
                    <Input
                      id="email"
                      type="email"
                      value={user?.email || ''}
                      disabled
                      className="bg-gray-50"
                    />
                    <p className="text-sm text-gray-500">Email cannot be changed</p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone Number</Label>
                    <Input
                      id="phone"
                      value={profileData.phone}
                      onChange={(e) => setProfileData({...profileData, phone: e.target.value})}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="role">Role</Label>
                    <Input
                      id="role"
                      value={user?.role?.replace('_', ' ').toUpperCase() || ''}
                      disabled
                      className="bg-gray-50"
                    />
                    <p className="text-sm text-gray-500">Role cannot be changed</p>
                  </div>

                  <Button type="submit" disabled={loading} className="bg-primary">
                    <Save className="w-4 h-4 mr-2" />
                    {loading ? 'Updating...' : 'Update Profile'}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Security Tab */}
          <TabsContent value="security">
            <Card>
              <CardHeader>
                <CardTitle>Change Password</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handlePasswordChange} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="currentPassword">Current Password</Label>
                    <div className="relative">
                      <Input
                        id="currentPassword"
                        type={showPasswords.current ? 'text' : 'password'}
                        value={passwordData.currentPassword}
                        onChange={(e) => setPasswordData({...passwordData, currentPassword: e.target.value})}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPasswords({...showPasswords, current: !showPasswords.current})}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                      >
                        {showPasswords.current ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="newPassword">New Password</Label>
                    <div className="relative">
                      <Input
                        id="newPassword"
                        type={showPasswords.new ? 'text' : 'password'}
                        value={passwordData.newPassword}
                        onChange={(e) => setPasswordData({...passwordData, newPassword: e.target.value})}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPasswords({...showPasswords, new: !showPasswords.new})}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                      >
                        {showPasswords.new ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword">Confirm New Password</Label>
                    <div className="relative">
                      <Input
                        id="confirmPassword"
                        type={showPasswords.confirm ? 'text' : 'password'}
                        value={passwordData.confirmPassword}
                        onChange={(e) => setPasswordData({...passwordData, confirmPassword: e.target.value})}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPasswords({...showPasswords, confirm: !showPasswords.confirm})}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                      >
                        {showPasswords.confirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  <Button type="submit" disabled={loading} className="bg-primary">
                    <Lock className="w-4 h-4 mr-2" />
                    {loading ? 'Changing...' : 'Change Password'}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Two-Factor Tab */}
          <TabsContent value="two-factor">
            <Card>
              <CardHeader>
                <CardTitle>Two-Factor Authentication</CardTitle>
              </CardHeader>
              <CardContent>
                {user?.twoFactorEnabled ? (
                  <div className="space-y-4">
                    <div className="p-4 bg-green-200 border border-green-500 rounded-lg">
                      <div className="flex items-center space-x-2">
                        <Shield className="w-5 h-5 text-black" />
                        <span className="font-medium text-black">Two-factor authentication is enabled</span>
                      </div>
                      <p className="text-sm text-black mt-1">
                        Your account is protected with an additional security layer.
                      </p>
                    </div>

                    <div className="space-y-4">
                      <Button
                        onClick={handleTwoFactorDisable}
                        disabled={loading}
                        className='bg-red-500'
                        variant="destructive"
                      >
                        {loading ? 'Disabling...' : 'Disable Two-Factor Authentication'}
                      </Button>
                    </div>
                  </div>
                ) : (
                  <form onSubmit={handleTwoFactorSetup} className="space-y-4">
                    <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                      <div className="flex items-center space-x-2">
                        <Shield className="w-5 h-5 text-yellow-600" />
                        <span className="font-medium text-yellow-800">Two-factor authentication is disabled</span>
                      </div>
                      <p className="text-sm text-yellow-700 mt-1">
                        Enable two-factor authentication to add an extra layer of security to your account.
                      </p>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="pin">Create 6-Digit PIN</Label>
                      <Input
                        id="pin"
                        type="password"
                        maxLength={6}
                        value={twoFactorData.pin}
                        onChange={(e) => setTwoFactorData({...twoFactorData, pin: e.target.value.replace(/\D/g, '')})}
                        placeholder="000000"
                        className="text-center text-lg tracking-widest"
                      />
                      <p className="text-sm text-gray-500">
                        This PIN will be required when logging in to your account.
                      </p>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="confirmPin">Confirm PIN</Label>
                      <Input
                        id="confirmPin"
                        type="password"
                        maxLength={6}
                        value={twoFactorData.confirmPin}
                        onChange={(e) => setTwoFactorData({...twoFactorData, confirmPin: e.target.value.replace(/\D/g, '')})}
                        placeholder="000000"
                        className="text-center text-lg tracking-widest"
                      />
                    </div>

                    <Button type="submit" disabled={loading} className="bg-green-600 hover:bg-green-700">
                      <Shield className="w-4 h-4 mr-2" />
                      {loading ? 'Enabling...' : 'Enable Two-Factor Authentication'}
                    </Button>
                  </form>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}