'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Eye, EyeOff, Mail, Lock, ArrowLeft, Bus, Shield, Users, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

export default function LoginPage() {
  const { login } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    twoFactorCode: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [requiresTwoFactor, setRequiresTwoFactor] = useState(false);


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const result = await login(
        formData.email, 
        formData.password, 
        requiresTwoFactor ? formData.twoFactorCode : undefined
      );
      

      if (!result.success) {
        if (result.requiresTwoFactor) {
          setRequiresTwoFactor(true);
          toast.info('Please enter your 6-digit authentication code');
        } else {
          setError(result.message);
          toast.error(result.message);
          // Reset 2FA state on login failure
          setRequiresTwoFactor(false);
        }
      } else {
        toast.success('Login successful!');
        // Reset form state on success
        setRequiresTwoFactor(false);
        setFormData({ email: '', password: '', twoFactorCode: '' });
      }
    } catch (error) {
      setError('An unexpected error occurred. Please try again.');
      toast.error('An unexpected error occurred. Please try again.');
      setRequiresTwoFactor(false);
    } finally {
      setLoading(false);
    }
  };

  const handleBackToCredentials = () => {
    setRequiresTwoFactor(false);
    setFormData(prev => ({ ...prev, twoFactorCode: '' }));
    setError('');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 relative overflow-hidden">
      

      {/* Background Elements */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute top-20 left-20 w-72 h-72 bg-blue-600 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 right-20 w-96 h-96 bg-indigo-600 rounded-full blur-3xl animate-pulse delay-1000"></div>
      </div>

      {/* Back Button */}
      <div className="absolute top-6 left-6 z-50">
        <Link href="/" className="group">
          <Button 
            variant="outline" 
            className="bg-white/80 backdrop-blur-md border-white/30 hover:bg-white/90 transition-all duration-300 shadow-lg"
          >
            <ArrowLeft className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform" />
            Back to Home
          </Button>
        </Link>
      </div>

      <div className="flex min-h-screen relative z-10">
        {/* Left Side - Brand Container */}
        <div className="hidden lg:flex lg:w-1/2 xl:w-3/5 relative">
          <div className="w-full bg-gradient-to-br from-blue-600 via-indigo-600 to-blue-700 p-12 flex flex-col justify-center relative overflow-hidden">
            {/* Decorative Elements */}
            <div className="absolute inset-0 opacity-10">
              <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-white rounded-full blur-2xl"></div>
              <div className="absolute bottom-1/4 right-1/4 w-48 h-48 bg-white rounded-full blur-2xl"></div>
            </div>

            {/* Content */}
            <div className="relative z-10 text-white max-w-lg">
              <div className="mb-12">
                <div className="flex items-center space-x-3 mb-8">
                  <div className="w-16 h-16 bg-white/20 backdrop-blur-lg rounded-2xl flex items-center justify-center">
                    <Bus className="w-8 h-8 text-white" />
                  </div>
                  <h1 className="text-4xl font-bold">Vijitha Travels</h1>
                </div>
                <h2 className="text-5xl font-bold leading-tight mb-6">
                  Secure Access
                  <br />
                  <span className="text-white/80">Portal</span>
                </h2>
                <p className="text-xl text-white/90 leading-relaxed">
                  Access your management dashboard with enterprise-grade security 
                  and role-based permissions.
                </p>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-3 gap-6 mb-12">
                <div className="text-center">
                  <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center mx-auto mb-3">
                    <Users className="w-6 h-6" />
                  </div>
                  <div className="text-2xl font-bold">50K+</div>
                  <div className="text-sm text-white/80">Happy Travelers</div>
                </div>
                <div className="text-center">
                  <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center mx-auto mb-3">
                    <Shield className="w-6 h-6" />
                  </div>
                  <div className="text-2xl font-bold">100%</div>
                  <div className="text-sm text-white/80">Secure Access</div>
                </div>
                <div className="text-center">
                  <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center mx-auto mb-3">
                    <Star className="w-6 h-6" />
                  </div>
                  <div className="text-2xl font-bold">24/7</div>
                  <div className="text-sm text-white/80">Support</div>
                </div>
              </div>

              {/* Security Features */}
              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-white rounded-full"></div>
                  <span className="text-white/90">Advanced role-based access control</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-white rounded-full"></div>
                  <span className="text-white/90">Two-factor authentication support</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-white rounded-full"></div>
                  <span className="text-white/90">Secure session management</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side - Login Form */}
        <div className="w-full lg:w-1/2 xl:w-2/5 flex items-center justify-center p-6 lg:p-12">
          <div className="w-full max-w-md">
            {/* Mobile Header */}
            <div className="lg:hidden text-center mb-8">
              <div className="flex items-center justify-center space-x-3 mb-4">
                <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center">
                  <Bus className="w-6 h-6 text-white" />
                </div>
                <h1 className="text-2xl font-bold text-gray-800">Vijitha Travels</h1>
              </div>
            </div>

            {/* Login Form Card */}
            <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/30 p-8 lg:p-10">
              {/* Form Header */}
              <div className="text-center mb-8">
                {requiresTwoFactor ? (
                  <>
                    <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Shield className="w-8 h-8 text-white" />
                    </div>
                    <h2 className="text-3xl lg:text-4xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent mb-3">
                      Two-Factor Authentication
                    </h2>
                    <p className="text-gray-600 text-lg">
                      Your account has 2FA enabled. Please enter your 6-digit authentication code to continue.
                    </p>
                  </>
                ) : (
                  <>
                    <h2 className="text-3xl lg:text-4xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent mb-3">
                      Welcome Back!
                    </h2>
                    <p className="text-gray-600 text-lg">Sign in to access your dashboard</p>
                  </>
                )}
              </div>

              {/* Error Message */}
              {error && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-xl mb-6 flex items-center">
                  <div className="w-5 h-5 bg-red-500 rounded-full flex items-center justify-center mr-3 flex-shrink-0">
                    <span className="text-white text-xs">!</span>
                  </div>
                  <span className="text-sm">{error}</span>
                </div>
              )}

              {/* Form */}
              <form onSubmit={handleSubmit} className="space-y-6">
                {!requiresTwoFactor ? (
                  // Step 1: Email and Password (always shown first)
                  <>
                    <div className="space-y-2">
                      <label className="block text-sm font-semibold text-gray-700">
                        Email Address
                      </label>
                      <div className="relative group">
                        <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-blue-600 transition-colors" />
                        <Input
                          type="email"
                          required
                          value={formData.email}
                          onChange={(e) => setFormData({...formData, email: e.target.value})}
                          className="pl-12 h-14 rounded-xl border-2 border-gray-200 focus:border-blue-600 bg-white/50 backdrop-blur-sm text-gray-800 placeholder-gray-400"
                          placeholder="Enter your email address"
                          disabled={loading}
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="block text-sm font-semibold text-gray-700">
                        Password
                      </label>
                      <div className="relative group">
                        <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-blue-600 transition-colors" />
                        <Input
                          type={showPassword ? 'text' : 'password'}
                          required
                          value={formData.password}
                          onChange={(e) => setFormData({...formData, password: e.target.value})}
                          className="pl-12 pr-12 h-14 rounded-xl border-2 border-gray-200 focus:border-blue-600 bg-white/50 backdrop-blur-sm text-gray-800 placeholder-gray-400"
                          placeholder="Enter your password"
                          disabled={loading}
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-blue-600 transition-colors"
                          disabled={loading}
                        >
                          {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                        </button>
                      </div>
                    </div>
                  </>
                ) : (
                  // Step 2: Two-Factor Code (only shown if user has 2FA enabled)
                  <>
                    <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-6">
                      <div className="flex items-center">
                        <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center mr-3">
                          <span className="text-white text-sm font-medium">
                            {formData.email.charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-blue-800">Signed in as:</p>
                          <p className="text-sm text-blue-600">{formData.email}</p>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="block text-sm font-semibold text-gray-700">
                        Authentication Code
                      </label>
                      <div className="relative group">
                        <Shield className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-blue-600 transition-colors" />
                        <Input
                          type="text"
                          required
                          maxLength={6}
                          value={formData.twoFactorCode}
                          onChange={(e) => {
                            const newCode = e.target.value.replace(/\D/g, '');
                            console.log('🔢 2FA code input:', newCode);
                            setFormData({...formData, twoFactorCode: newCode});
                          }}
                          className="pl-12 h-14 rounded-xl border-2 border-gray-200 focus:border-blue-600 bg-white/50 backdrop-blur-sm text-gray-800 placeholder-gray-400 text-center text-2xl tracking-widest font-mono"
                          placeholder="000000"
                          disabled={loading}
                          autoFocus
                        />
                      </div>
                      <p className="text-xs text-gray-500 text-center">
                        Enter the 6-digit code you created when enabling 2FA
                      </p>
                    </div>
                  </>
                )}

                <Button 
                  type="submit" 
                  disabled={loading || (requiresTwoFactor && formData.twoFactorCode.length !== 6)}
                  className="w-full h-14 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-indigo-600 hover:to-blue-600 text-white rounded-xl text-lg font-semibold transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                >
                  {loading ? (
                    <div className="flex items-center">
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-3"></div>
                      {requiresTwoFactor ? 'Verifying Code...' : 'Signing In...'}
                    </div>
                  ) : (
                    requiresTwoFactor ? 'Verify & Sign In' : 'Sign In to Dashboard'
                  )}
                </Button>

                {requiresTwoFactor && (
                  <Button 
                    type="button"
                    variant="outline"
                    onClick={handleBackToCredentials}
                    disabled={loading}
                    className="w-full h-12 border-2 border-gray-200 hover:border-gray-300 rounded-xl bg-white/50 backdrop-blur-sm font-medium disabled:opacity-50"
                  >
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Back to Login
                  </Button>
                )}
              </form>

              {/* Contact Support */}
              <div className="mt-8 text-center">
                <p className="text-gray-600 text-sm">
                  Need help accessing your account?{' '}
                  <a href="#" className="font-semibold text-blue-600 hover:text-indigo-600 transition-colors">
                    Contact IT Support
                  </a>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}