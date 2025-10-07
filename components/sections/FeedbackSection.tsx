'use client';

import { useState, useEffect, useRef } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { MessageSquare, Quote, Star, ChevronLeft, ChevronRight } from 'lucide-react';
import { IFeedback } from '@/types';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';

export default function FeedbackSection() {
  const [feedbacks, setFeedbacks] = useState<IFeedback[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [direction, setDirection] = useState(0);
  const autoPlayRef = useRef<NodeJS.Timeout>(null);

  // Form states
  const [formData, setFormData] = useState({
    name: '',
    mobile: '',
    feedback: ''
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [formLoading, setFormLoading] = useState(false);

  useEffect(() => {
    fetchFeedbacks();
  }, []);

  // Auto-play slider
  useEffect(() => {
    if (feedbacks.length > 0) {
      startAutoPlay();
    }
    return () => {
      if (autoPlayRef.current) {
        clearInterval(autoPlayRef.current);
      }
    };
  }, [feedbacks.length]);

  const startAutoPlay = () => {
    if (autoPlayRef.current) {
      clearInterval(autoPlayRef.current);
    }
    autoPlayRef.current = setInterval(() => {
      nextSlide();
    }, 5000);
  };

  const fetchFeedbacks = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/public/feedback');

      if (response.ok) {
        const data = await response.json();
        setFeedbacks(data.data.feedbacks);
      }
    } catch (error) {
      console.error('Error fetching feedbacks:', error);
    } finally {
      setLoading(false);
    }
  };

  const nextSlide = () => {
    setDirection(1);
    setCurrentIndex((prevIndex) =>
      prevIndex === feedbacks.length - 1 ? 0 : prevIndex + 1
    );
  };

  const prevSlide = () => {
    setDirection(-1);
    setCurrentIndex((prevIndex) =>
      prevIndex === 0 ? feedbacks.length - 1 : prevIndex - 1
    );
  };

  const resetForm = () => {
    setFormData({ name: '', mobile: '', feedback: '' });
    setErrors({});
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormLoading(true);
    setErrors({});

    // Client-side validation
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    }

    if (!formData.mobile.trim()) {
      newErrors.mobile = 'Mobile number is required';
    } else if (!/^[0-9]{10,15}$/.test(formData.mobile.replace(/[\s-]/g, ''))) {
      newErrors.mobile = 'Please enter a valid mobile number';
    }

    if (!formData.feedback.trim()) {
      newErrors.feedback = 'Feedback is required';
    } else if (formData.feedback.trim().length < 10) {
      newErrors.feedback = 'Feedback must be at least 10 characters';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      setFormLoading(false);
      return;
    }

    try {
      const response = await fetch('/api/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      const data = await response.json();

      if (data.success) {
        toast.success(data.message);
        setIsModalOpen(false);
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
      console.error('Error submitting feedback:', error);
      toast.error('Network error occurred');
    } finally {
      setFormLoading(false);
    }
  };

  const slideVariants = {
    enter: (direction: number) => ({
      x: direction > 0 ? 300 : -300,
      opacity: 0
    }),
    center: {
      zIndex: 1,
      x: 0,
      opacity: 1
    },
    exit: (direction: number) => ({
      zIndex: 0,
      x: direction < 0 ? 300 : -300,
      opacity: 0
    })
  };

  if (loading) {
    return (
      <section className="py-12 sm:py-16 md:py-20 bg-gradient-to-br from-sky-50 via-white to-blue-50">
        <div className="container mx-auto px-4">
          <div className="text-center">
            <p className="text-gray-500 text-sm sm:text-base">Loading feedbacks...</p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-12 sm:py-16 md:py-20 bg-gradient-to-br from-sky-50 via-white to-blue-50 relative overflow-hidden">
      {/* Background decorations */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-12 sm:-top-24 -right-12 sm:-right-24 w-48 h-48 sm:w-96 sm:h-96 bg-primary/5 rounded-full blur-3xl" />
        <div className="absolute -bottom-12 sm:-bottom-24 -left-12 sm:-left-24 w-48 h-48 sm:w-96 sm:h-96 bg-blue-500/5 rounded-full blur-3xl" />
      </div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Header */}
        <div className="text-center mb-8 sm:mb-12 md:mb-16">
          <div className="inline-block mb-3 sm:mb-4">
            <div className="flex items-center justify-center w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 bg-primary/10 rounded-xl sm:rounded-2xl">
              <MessageSquare className="w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8 text-primary" />
            </div>
          </div>
          <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-2 sm:mb-3 md:mb-4 px-4">
            What Our Customers Say
          </h2>
          <p className="text-base sm:text-lg md:text-xl text-gray-600 max-w-2xl mx-auto px-4">
            Real feedback from real people who trust our services
          </p>
        </div>

        {/* Testimonial Slider */}
        {feedbacks.length > 0 ? (
          <div className="max-w-5xl mx-auto mb-8 sm:mb-10 md:mb-12">
            <div className="relative px-4 sm:px-8 md:px-12">
              {/* Navigation Buttons */}
              <button
                onClick={() => {
                  prevSlide();
                  startAutoPlay();
                }}
                className="absolute left-0 sm:-left-2 md:-left-4 top-1/2 -translate-y-1/2 z-10 bg-white p-2 sm:p-2.5 md:p-3 rounded-full shadow-lg hover:shadow-xl transition-all hover:bg-primary hover:text-white group disabled:opacity-50"
                aria-label="Previous testimonial"
              >
                <ChevronLeft className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6" />
              </button>
              <button
                onClick={() => {
                  nextSlide();
                  startAutoPlay();
                }}
                className="absolute right-0 sm:-right-2 md:-right-4 top-1/2 -translate-y-1/2 z-10 bg-white p-2 sm:p-2.5 md:p-3 rounded-full shadow-lg hover:shadow-xl transition-all hover:bg-primary hover:text-white group disabled:opacity-50"
                aria-label="Next testimonial"
              >
                <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6" />
              </button>

              {/* Slider Container */}
              <div className="relative overflow-hidden" style={{ minHeight: '400px' }}>
                <AnimatePresence initial={false} custom={direction} mode="wait">
                  <motion.div
                    key={currentIndex}
                    custom={direction}
                    variants={slideVariants}
                    initial="enter"
                    animate="center"
                    exit="exit"
                    transition={{
                      x: { type: 'spring', stiffness: 300, damping: 30 },
                      opacity: { duration: 0.2 }
                    }}
                    className="w-full"
                  >
                    <Card className="bg-white/80 backdrop-blur-sm border-none shadow-xl sm:shadow-2xl p-4 sm:p-6 md:p-8 lg:p-12">
                      <div className="flex flex-col justify-between min-h-[320px] sm:min-h-[280px]">
                        {/* Quote Icon */}
                        <div className="mb-4 sm:mb-6">
                          <Quote className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 text-primary/20" />
                        </div>

                        {/* Feedback Text */}
                        <div className="flex-1 mb-4 sm:mb-6">
                          <p className="text-sm sm:text-base md:text-lg lg:text-xl text-gray-700 leading-relaxed">
                            "{feedbacks[currentIndex].feedback}"
                          </p>
                        </div>

                        {/* Author Info */}
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-t pt-4 sm:pt-6">
                          <div className="flex items-center space-x-3 sm:space-x-4">
                            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-primary to-blue-600 rounded-full flex items-center justify-center flex-shrink-0">
                              <span className="text-white text-base sm:text-lg font-bold">
                                {feedbacks[currentIndex].name.charAt(0).toUpperCase()}
                              </span>
                            </div>
                            <div className="min-w-0">
                              <p className="font-bold text-gray-900 text-sm sm:text-base truncate">
                                {feedbacks[currentIndex].name}
                              </p>
                              <p className="text-xs sm:text-sm text-gray-500">
                                {new Date(feedbacks[currentIndex].createdAt).toLocaleDateString('en-US', {
                                  month: 'long',
                                  year: 'numeric'
                                })}
                              </p>
                            </div>
                          </div>
                          {/* Stars */}
                          <div className="flex space-x-1">
                            {[...Array(5)].map((_, i) => (
                              <Star
                                key={i}
                                className="w-4 h-4 sm:w-5 sm:h-5 fill-yellow-400 text-yellow-400"
                              />
                            ))}
                          </div>
                        </div>
                      </div>
                    </Card>
                  </motion.div>
                </AnimatePresence>
              </div>

              {/* Dots Indicator */}
              <div className="flex justify-center mt-6 sm:mt-8 space-x-2">
                {feedbacks.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => {
                      setDirection(index > currentIndex ? 1 : -1);
                      setCurrentIndex(index);
                      startAutoPlay();
                    }}
                    className={`h-1.5 sm:h-2 rounded-full transition-all ${
                      index === currentIndex
                        ? 'w-6 sm:w-8 bg-primary'
                        : 'w-1.5 sm:w-2 bg-gray-300 hover:bg-gray-400'
                    }`}
                    aria-label={`Go to testimonial ${index + 1}`}
                  />
                ))}
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center py-8 sm:py-12">
            <MessageSquare className="w-12 h-12 sm:w-16 sm:h-16 mx-auto mb-3 sm:mb-4 text-gray-300" />
            <p className="text-gray-500 text-sm sm:text-base">No feedbacks available yet</p>
          </div>
        )}

        {/* CTA Button */}
        <div className="text-center px-4">
          <Button
            onClick={() => setIsModalOpen(true)}
            size="lg"
            className="bg-primary hover:bg-primary/90 text-white px-6 sm:px-8 py-4 sm:py-6 text-base sm:text-lg rounded-full shadow-lg hover:shadow-xl transition-all transform hover:scale-105 w-full sm:w-auto"
          >
            <MessageSquare className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
            Share Your Feedback
          </Button>
        </div>
      </div>

      {/* Feedback Submission Modal */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-[550px] max-h-[90vh] overflow-y-auto bg-gradient-to-br from-white to-sky-50 w-[95vw] sm:w-full mx-auto rounded-lg">
          <DialogHeader className="space-y-2">
            <DialogTitle className="text-xl sm:text-2xl">Share Your Experience</DialogTitle>
            <DialogDescription className="text-sm sm:text-base">
              We'd love to hear about your experience with our services
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid gap-4 sm:gap-6 py-2 sm:py-4">
              <div className="space-y-2">
                <Label htmlFor="name" className="text-sm sm:text-base">
                  Your Name *
                </Label>
                <Input
                  id="name"
                  placeholder="Enter your full name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className={`text-sm sm:text-base h-10 sm:h-11 ${errors.name ? 'border-red-500' : ''}`}
                  disabled={formLoading}
                />
                {errors.name && (
                  <p className="text-xs sm:text-sm text-red-600">{errors.name}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="mobile" className="text-sm sm:text-base">
                  Mobile Number *
                </Label>
                <Input
                  id="mobile"
                  type="tel"
                  placeholder="Enter your mobile number"
                  value={formData.mobile}
                  onChange={(e) => setFormData({ ...formData, mobile: e.target.value })}
                  className={`text-sm sm:text-base h-10 sm:h-11 ${errors.mobile ? 'border-red-500' : ''}`}
                  disabled={formLoading}
                />
                {errors.mobile && (
                  <p className="text-xs sm:text-sm text-red-600">{errors.mobile}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="feedback" className="text-sm sm:text-base">
                  Your Feedback *
                </Label>
                <Textarea
                  id="feedback"
                  placeholder="Tell us about your experience..."
                  rows={4}
                  value={formData.feedback}
                  onChange={(e) => {
                    if (e.target.value.length <= 1000) {
                      setFormData({ ...formData, feedback: e.target.value });
                    }
                  }}
                  className={`text-sm sm:text-base resize-none ${errors.feedback ? 'border-red-500' : ''}`}
                  disabled={formLoading}
                />
                <div className="flex justify-between items-center">
                  <p className="text-xs text-gray-500">
                    Minimum 10 characters
                  </p>
                  <p className="text-xs text-gray-500">
                    {formData.feedback.length}/1000
                  </p>
                </div>
                {errors.feedback && (
                  <p className="text-xs sm:text-sm text-red-600">{errors.feedback}</p>
                )}
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 sm:p-4">
                <p className="text-xs sm:text-sm text-blue-800">
                  <strong>Note:</strong> Your feedback will be reviewed by our team before being published.
                  Thank you for helping us improve!
                </p>
              </div>
            </div>
            <DialogFooter className="flex-col sm:flex-row gap-2 sm:gap-0">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setIsModalOpen(false);
                  resetForm();
                }}
                disabled={formLoading}
                className="w-full sm:w-auto text-sm sm:text-base h-10 sm:h-11"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={formLoading}
                className="w-full sm:w-auto bg-primary hover:bg-primary/90 text-sm sm:text-base h-10 sm:h-11"
              >
                {formLoading ? (
                  <span className="flex items-center justify-center">
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Submitting...
                  </span>
                ) : (
                  'Submit Feedback'
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </section>
  );
}