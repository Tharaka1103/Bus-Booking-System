'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Eye, EyeOff, Mail, Lock, User, Phone, ArrowLeft, Bus, Shield, Users, Star, Award } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/contexts/AuthContext';
import {toast} from 'sonner';
export default function RegisterPage() {
  const { register } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: ''
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<any[]>([]);
  const [generalError, setGeneralError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (formData.password !== formData.confirmPassword) {
      setGeneralError('Passwords do not match');
      return;
    }

    setLoading(true);
    setErrors([]);
    setGeneralError('');

    const result = await register({
      firstName: formData.firstName,
      lastName: formData.lastName,
      email: formData.email,
      phone: formData.phone,
      password: formData.password
    });
    
    if (!result.success) {
      if (result.errors) {
        setErrors(result.errors);
        toast.error('Please fix the highlighted errors and try again.');
      } else {
        setGeneralError(result.message);
        toast.error("")
      }
    }
    toast.success('Account created successfully! You can now log in.');
    setLoading(false);
  };

  const getFieldError = (fieldName: string) => {
    const error = errors.find(err => err.field === fieldName);
    return error ? error.message : '';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute top-20 left-20 w-72 h-72 bg-accent rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 right-20 w-96 h-96 bg-primary rounded-full blur-3xl animate-pulse delay-1000"></div>
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
          <div className="w-full bg-gradient-to-br from-accent via-primary to-accent p-12 flex flex-col justify-center relative overflow-hidden">
            {/* Decorative Elements */}
            <div className="absolute inset-0 opacity-10">
              <div className="absolute top-1/4 right-1/4 w-64 h-64 bg-white rounded-full blur-2xl"></div>
              <div className="absolute bottom-1/4 left-1/4 w-48 h-48 bg-white rounded-full blur-2xl"></div>
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
                  Join Our
                  <br />
                  <span className="text-white/80">Travel Family</span>
                </h2>
                <p className="text-xl text-white/90 leading-relaxed">
                  Create your account and unlock exclusive benefits, easy bookings, 
                  and personalized travel experiences across Sri Lanka.
                </p>
              </div>

              {/* Benefits */}
              <div className="grid grid-cols-2 gap-6 mb-12">
                <div className="text-center">
                  <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center mx-auto mb-3">
                    <Award className="w-6 h-6" />
                  </div>
                  <div className="text-lg font-bold">Exclusive</div>
                  <div className="text-sm text-white/80">Member Discounts</div>
                </div>
                <div className="text-center">
                  <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center mx-auto mb-3">
                    <Shield className="w-6 h-6" />
                  </div>
                  <div className="text-lg font-bold">Priority</div>
                  <div className="text-sm text-white/80">Booking Support</div>
                </div>
                <div className="text-center">
                  <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center mx-auto mb-3">
                    <Users className="w-6 h-6" />
                  </div>
                  <div className="text-lg font-bold">Loyalty</div>
                  <div className="text-sm text-white/80">Rewards Program</div>
                </div>
                <div className="text-center">
                  <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center mx-auto mb-3">
                    <Star className="w-6 h-6" />
                  </div>
                  <div className="text-lg font-bold">Premium</div>
                  <div className="text-sm text-white/80">Travel Experience</div>
                </div>
              </div>

              {/* Member Benefits */}
              <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
                <h4 className="text-lg font-semibold mb-4">🎉 New Member Benefits</h4>
                <div className="space-y-3">
                  <div className="flex items-center space-x-3">
                    <div className="w-2 h-2 bg-white rounded-full"></div>
                    <span className="text-white/90 text-sm">20% off on your first booking</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="w-2 h-2 bg-white rounded-full"></div>
                    <span className="text-white/90 text-sm">Free seat selection and cancellation</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="w-2 h-2 bg-white rounded-full"></div>
                    <span className="text-white/90 text-sm">Instant booking confirmations</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side - Registration Form */}
        <div className="w-full lg:w-1/2 xl:w-2/5 flex items-center justify-center p-6 lg:p-12">
          <div className="w-full max-w-md">
            {/* Mobile Header */}
            <div className="lg:hidden text-center mb-8">
              <div className="flex items-center justify-center space-x-3 mb-4">
                <div className="w-12 h-12 bg-primary rounded-xl flex items-center justify-center">
                  <Bus className="w-6 h-6 text-white" />
                </div>
                <h1 className="text-2xl font-bold text-gray-800">Vijitha Travels</h1>
              </div>
            </div>

            {/* Registration Form Card */}
            <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/30 p-8 lg:p-10">
              {/* Form Header */}
              <div className="text-center mb-8">
                <h2 className="text-3xl lg:text-4xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent mb-3">
                  Create Account
                </h2>
                <p className="text-gray-600 text-lg">Join thousands of happy travelers</p>
              </div>

              {/* Error Messages */}
              {generalError && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-xl mb-6">
                  {generalError}
                </div>
              )}

              {/* Form */}
              <form onSubmit={handleSubmit} className="space-y-5">
                {/* Name Fields */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="block text-sm font-semibold text-gray-700">
                      First Name
                    </label>
                    <div className="relative group">
                      <User className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-primary transition-colors" />
                      <Input
                        type="text"
                        required
                        value={formData.firstName}
                        onChange={(e) => setFormData({...formData, firstName: e.target.value})}
                        className={`pl-12 h-12 rounded-xl border-2 ${getFieldError('firstName') ? 'border-red-300' : 'border-gray-200'} focus:border-primary bg-white/50 backdrop-blur-sm text-gray-800 placeholder-gray-400`}
                        placeholder="First name"
                      />
                    </div>
                    {getFieldError('firstName') && (
                      <p className="text-red-500 text-xs mt-1">{getFieldError('firstName')}</p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <label className="block text-sm font-semibold text-gray-700">
                      Last Name
                    </label>
                    <div className="relative group">
                      <User className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-primary transition-colors" />
                      <Input
                        type="text"
                        required
                        value={formData.lastName}
                        onChange={(e) => setFormData({...formData, lastName: e.target.value})}
                        className={`pl-12 h-12 rounded-xl border-2 ${getFieldError('lastName') ? 'border-red-300' : 'border-gray-200'} focus:border-primary bg-white/50 backdrop-blur-sm text-gray-800 placeholder-gray-400`}
                        placeholder="Last name"
                      />
                    </div>
                    {getFieldError('lastName') && (
                      <p className="text-red-500 text-xs mt-1">{getFieldError('lastName')}</p>
                    )}
                  </div>
                </div>

                {/* Email */}
                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-gray-700">
                    Email Address
                  </label>
                  <div className="relative group">
                    <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-primary transition-colors" />
                    <Input
                      type="email"
                      required
                      value={formData.email}
                      onChange={(e) => setFormData({...formData, email: e.target.value})}
                      className={`pl-12 h-12 rounded-xl border-2 ${getFieldError('email') ? 'border-red-300' : 'border-gray-200'} focus:border-primary bg-white/50 backdrop-blur-sm text-gray-800 placeholder-gray-400`}
                      placeholder="Enter your email address"
                    />
                  </div>
                  {getFieldError('email') && (
                    <p className="text-red-500 text-xs mt-1">{getFieldError('email')}</p>
                  )}
                </div>

                {/* Phone */}
                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-gray-700">
                    Phone Number
                  </label>
                  <div className="relative group">
                    <Phone className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-primary transition-colors" />
                    <Input
                      type="tel"
                      required
                      value={formData.phone}
                      onChange={(e) => setFormData({...formData, phone: e.target.value})}
                      className={`pl-12 h-12 rounded-xl border-2 ${getFieldError('phone') ? 'border-red-300' : 'border-gray-200'} focus:border-primary bg-white/50 backdrop-blur-sm text-gray-800 placeholder-gray-400`}
                      placeholder="+94 XX XXX XXXX"
                    />
                  </div>
                  {getFieldError('phone') && (
                    <p className="text-red-500 text-xs mt-1">{getFieldError('phone')}</p>
                  )}
                </div>

                {/* Password */}
                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-gray-700">
                    Password
                  </label>
                  <div className="relative group">
                    <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-primary transition-colors" />
                    <Input
                      type={showPassword ? 'text' : 'password'}
                      required
                      value={formData.password}
                      onChange={(e) => setFormData({...formData, password: e.target.value})}
                      className={`pl-12 pr-12 h-12 rounded-xl border-2 ${getFieldError('password') ? 'border-red-300' : 'border-gray-200'} focus:border-primary bg-white/50 backdrop-blur-sm text-gray-800 placeholder-gray-400`}
                      placeholder="Create a strong password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-primary transition-colors"
                    >
                      {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                  {getFieldError('password') && (
                    <p className="text-red-500 text-xs mt-1">{getFieldError('password')}</p>
                  )}
                </div>

                {/* Confirm Password */}
                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-gray-700">
                    Confirm Password
                  </label>
                  <div className="relative group">
                    <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-primary transition-colors" />
                    <Input
                      type={showConfirmPassword ? 'text' : 'password'}
                      required
                      value={formData.confirmPassword}
                      onChange={(e) => setFormData({...formData, confirmPassword: e.target.value})}
                      className="pl-12 pr-12 h-12 rounded-xl border-2 border-gray-200 focus:border-primary bg-white/50 backdrop-blur-sm text-gray-800 placeholder-gray-400"
                      placeholder="Confirm your password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-primary transition-colors"
                    >
                      {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                </div>

                {/* Terms & Conditions */}
                <div className="flex items-start space-x-3">
                  <input
                    id="terms"
                    type="checkbox"
                    required
                    className="mt-1 h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
                  />
                  <label htmlFor="terms" className="text-sm text-gray-700 leading-relaxed">
                    I agree to the{' '}
                    <Link href="/terms" className="font-medium text-primary hover:text-accent transition-colors">
                      Terms of Service
                    </Link>{' '}
                    and{' '}
                    <Link href="/privacy" className="font-medium text-primary hover:text-accent transition-colors">
                      Privacy Policy
                    </Link>
                  </label>
                </div>

                <Button 
                  type="submit" 
                  disabled={loading}
                  className="w-full h-14 bg-gradient-to-r from-primary to-accent hover:from-accent hover:to-primary text-white rounded-xl text-lg font-semibold transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                >
                  {loading ? 'Creating Account...' : 'Create Your Account'}
                </Button>
              </form>

              {/* Divider */}
              <div className="my-6">
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-gray-300" />
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="px-4 bg-white text-gray-500 font-medium">Or sign up with</span>
                  </div>
                </div>
              </div>

              {/* Social Login */}
              <div className="grid grid-cols-2 gap-4">
                <Button 
                  variant="outline" 
                  className="h-12 border-2 border-gray-200 hover:border-gray-300 rounded-xl bg-white/50 backdrop-blur-sm font-medium"
                >
                  <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                    <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                    <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                    <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                  </svg>
                  Google
                </Button>
                <Button 
                  variant="outline" 
                  className="h-12 border-2 border-gray-200 hover:border-gray-300 rounded-xl bg-white/50 backdrop-blur-sm font-medium"
                >
                  <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                  </svg>
                  Facebook
                </Button>
              </div>

              {/* Sign in link */}
              <div className="mt-6 text-center">
                <p className="text-gray-600">
                  Already have an account?{' '}
                  <Link href="/login" className="font-semibold text-primary hover:text-accent transition-colors">
                    Sign in here
                  </Link>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}