import { NextRequest } from 'next/server';

interface RateLimitEntry {
  count: number;
  resetTime: number;
}

const rateLimitMap = new Map<string, RateLimitEntry>();

// Clean up expired entries every hour
setInterval(() => {
  const now = Date.now();
  for (const [key, entry] of rateLimitMap.entries()) {
    if (now > entry.resetTime) {
      rateLimitMap.delete(key);
    }
  }
}, 60 * 60 * 1000);

export function rateLimit(windowMs: number = 15 * 60 * 1000, maxRequests: number = 100) {
  return (request: NextRequest): { allowed: boolean; remaining: number } => {
    const ip = request.ip || request.headers.get('x-forwarded-for') || 'unknown';
    const now = Date.now();
    const key = `${ip}:${Math.floor(now / windowMs)}`;
    
    const entry = rateLimitMap.get(key);
    
    if (!entry) {
      rateLimitMap.set(key, { count: 1, resetTime: now + windowMs });
      return { allowed: true, remaining: maxRequests - 1 };
    }
    
    if (entry.count >= maxRequests) {
      return { allowed: false, remaining: 0 };
    }
    
    entry.count++;
    return { allowed: true, remaining: maxRequests - entry.count };
  };
}