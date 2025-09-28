// app/login/page.tsx

'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Eye, EyeOff, Mail, Lock, ArrowLeft, Bus, Shield, Users, Star, ChevronRight, KeyRound } from 'lucide-react';
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
          setRequiresTwoFactor(false);
        }
      } else {
        toast.success('Login successful!');
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
    <div className="min-h-screen bg-gradient-to-br from-sky-50 to-white relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0">
        <div className="absolute top-0 -left-4 w-72 h-72 bg-sky-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob"></div>
        <div className="absolute top-0 -right-4 w-72 h-72 bg-sky-200 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000"></div>
        <div className="absolute -bottom-8 left-20 w-72 h-72 bg-sky-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-4000"></div>
      </div>

      <div className="flex min-h-screen relative z-10">
        {/* Left Side - Features Showcase */}
        <div className="hidden lg:flex lg:w-1/2 relative">
          <div className="w-full p-12 flex items-center justify-center">
            <div className="max-w-lg">
              {/* Logo and Brand */}
              <div className="mb-12">
                
                
                <h2 className="text-5xl font-bold text-gray-800 leading-tight mb-6">
                  Welcome to Your
                  <span className="text-sky-500 block">Command Center</span>
                </h2>
                <p className="text-xl text-gray-600 leading-relaxed">
                  Streamline your operations with our powerful management dashboard. 
                  Built for efficiency, designed for growth.
                </p>
              </div>

              {/* Feature Cards */}
              <div className="grid grid-cols-2 gap-6 mb-12">
                <div className="bg-white/60 backdrop-blur-lg rounded-2xl p-6 border border-sky-100 hover:border-sky-300 transition-all hover:shadow-lg">
                  <div className="w-12 h-12 bg-sky-100 rounded-xl flex items-center justify-center mb-4">
                    <Users className="w-6 h-6 text-sky-600" />
                  </div>
                  <h3 className="font-semibold text-gray-800 mb-2">User Management</h3>
                  <p className="text-sm text-gray-600">Control access and permissions</p>
                </div>
                
                <div className="bg-white/60 backdrop-blur-lg rounded-2xl p-6 border border-sky-100 hover:border-sky-300 transition-all hover:shadow-lg">
                  <div className="w-12 h-12 bg-sky-100 rounded-xl flex items-center justify-center mb-4">
                    <Shield className="w-6 h-6 text-sky-600" />
                  </div>
                  <h3 className="font-semibold text-gray-800 mb-2">Secure Access</h3>
                  <p className="text-sm text-gray-600">2FA authentication enabled</p>
                </div>
                
                <div className="bg-white/60 backdrop-blur-lg rounded-2xl p-6 border border-sky-100 hover:border-sky-300 transition-all hover:shadow-lg">
                  <div className="w-12 h-12 bg-sky-100 rounded-xl flex items-center justify-center mb-4">
                    <Bus className="w-6 h-6 text-sky-600" />
                  </div>
                  <h3 className="font-semibold text-gray-800 mb-2">Fleet Control</h3>
                  <p className="text-sm text-gray-600">Manage buses and routes</p>
                </div>
                
                <div className="bg-white/60 backdrop-blur-lg rounded-2xl p-6 border border-sky-100 hover:border-sky-300 transition-all hover:shadow-lg">
                  <div className="w-12 h-12 bg-sky-100 rounded-xl flex items-center justify-center mb-4">
                    <Star className="w-6 h-6 text-sky-600" />
                  </div>
                  <h3 className="font-semibold text-gray-800 mb-2">Premium Support</h3>
                  <p className="text-sm text-gray-600">24/7 assistance available</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side - Login Form */}
        <div className="w-full lg:w-1/2 flex items-center justify-center p-6 lg:p-12">
          <div className="w-full max-w-md">
            

            {/* Login Card */}
            <div className="bg-white rounded-3xl shadow-xl p-8 lg:p-10 border border-sky-100">
              {/* Form Header */}
              <div className="text-center mb-8">
                {requiresTwoFactor ? (
                  <>
                    <div className="w-20 h-20 bg-gradient-to-br from-sky-400 to-sky-500 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
                      <Shield className="w-10 h-10 text-white" />
                    </div>
                    <h2 className="text-3xl font-bold text-gray-800 mb-3">
                      Two-Factor Authentication
                    </h2>
                    <p className="text-gray-600">
                      Enter your 6-digit code to continue
                    </p>
                  </>
                ) : (
                  <>
                    <h2 className="text-3xl font-bold text-gray-800 mb-3">
                      Sign In
                    </h2>
                    <p className="text-gray-600">
                      Access your management dashboard
                    </p>
                  </>
                )}
              </div>

              {/* Error Message */}
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl mb-6 flex items-start">
                  <div className="w-5 h-5 bg-red-500 rounded-full flex items-center justify-center mr-3 flex-shrink-0 mt-0.5">
                    <span className="text-white text-xs font-bold">!</span>
                  </div>
                  <span className="text-sm">{error}</span>
                </div>
              )}

              {/* Form */}
              <form onSubmit={handleSubmit} className="space-y-5">
                {!requiresTwoFactor ? (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Email Address
                      </label>
                      <div className="relative">
                        <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <Input
                          type="email"
                          required
                          value={formData.email}
                          onChange={(e) => setFormData({...formData, email: e.target.value})}
                          className="pl-12 h-12 rounded-xl border border-gray-300 focus:border-sky-400 focus:ring-2 focus:ring-sky-100 transition-all"
                          placeholder="you@example.com"
                          disabled={loading}
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Password
                      </label>
                      <div className="relative">
                        <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <Input
                          type={showPassword ? 'text' : 'password'}
                          required
                          value={formData.password}
                          onChange={(e) => setFormData({...formData, password: e.target.value})}
                          className="pl-12 pr-12 h-12 rounded-xl border border-gray-300 focus:border-sky-400 focus:ring-2 focus:ring-sky-100 transition-all"
                          placeholder="••••••••"
                          disabled={loading}
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-sky-600 transition-colors"
                          disabled={loading}
                        >
                          {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                        </button>
                      </div>
                      <div className="mt-2 text-right">
                        <Link href="/forgot-password" className="text-sm text-sky-600 hover:text-sky-700 font-medium">
                          Forgot Password?
                        </Link>
                      </div>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="bg-sky-50 border border-sky-200 rounded-xl p-4 mb-6">
                      <div className="flex items-center">
                        <div className="w-10 h-10 bg-sky-500 rounded-full flex items-center justify-center mr-3">
                          <span className="text-white text-sm font-bold">
                            {formData.email.charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-800">Signed in as:</p>
                          <p className="text-sm text-sky-600">{formData.email}</p>
                        </div>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Authentication Code
                      </label>
                      <div className="relative">
                        <KeyRound className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <Input
                          type="text"
                          required
                          maxLength={6}
                          value={formData.twoFactorCode}
                          onChange={(e) => {
                            const newCode = e.target.value.replace(/\D/g, '');
                            setFormData({...formData, twoFactorCode: newCode});
                          }}
                          className="pl-12 h-12 rounded-xl border border-gray-300 focus:border-sky-400 focus:ring-2 focus:ring-sky-100 text-center text-2xl tracking-widest font-mono transition-all"
                          placeholder="000000"
                          disabled={loading}
                          autoFocus
                        />
                      </div>
                      <p className="text-xs text-gray-500 text-center mt-2">
                        Enter the 6-digit code from your authenticator app
                      </p>
                    </div>
                  </>
                )}

                <Button 
                  type="submit" 
                  disabled={loading || (requiresTwoFactor && formData.twoFactorCode.length !== 6)}
                  className="w-full h-12 bg-gradient-to-r from-sky-400 to-sky-500 hover:from-sky-500 hover:to-sky-600 text-white rounded-xl font-medium transition-all shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <div className="flex items-center justify-center">
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-3"></div>
                      {requiresTwoFactor ? 'Verifying...' : 'Signing In...'}
                    </div>
                  ) : (
                    <>
                      {requiresTwoFactor ? 'Verify Code' : 'Sign In'}
                      <ChevronRight className="w-5 h-5 ml-2" />
                    </>
                  )}
                </Button>

                {requiresTwoFactor && (
                  <Button 
                    type="button"
                    variant="outline"
                    onClick={handleBackToCredentials}
                    disabled={loading}
                    className="w-full h-12 border border-gray-300 hover:border-sky-400 rounded-xl bg-white font-medium transition-all disabled:opacity-50"
                  >
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Back to Login
                  </Button>
                )}
              </form>

              {/* Divider */}
              <div className="relative my-8">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-200"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-4 bg-white text-gray-500">Need help?</span>
                </div>
              </div>

              {/* Support Links */}
              <div className="text-center space-y-3">
                <p className="text-sm text-gray-600">
                  Having trouble signing in?{' '}
                  <Link href="/support" className="font-medium text-sky-600 hover:text-sky-700">
                    Contact Support
                  </Link>
                </p>
                
                {/* Back to Home Button */}
                <Link href="/">
                  <Button 
                    variant="outline" 
                    className="w-full h-12 border border-gray-300 hover:border-sky-400 bg-white hover:bg-sky-50 transition-all rounded-xl font-medium"
                  >
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Back to Home
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Add custom animations */}
      <style jsx>{`
        @keyframes blob {
          0% {
            transform: translate(0px, 0px) scale(1);
          }
          33% {
            transform: translate(30px, -50px) scale(1.1);
          }
          66% {
            transform: translate(-20px, 20px) scale(0.9);
          }
          100% {
            transform: translate(0px, 0px) scale(1);
          }
        }
        .animate-blob {
          animation: blob 7s infinite;
        }
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        .animation-delay-4000 {
          animation-delay: 4s;
        }
      `}</style>
    </div>
  );
}