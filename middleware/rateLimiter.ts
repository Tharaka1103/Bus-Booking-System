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

// Helper function to extract IP address from NextRequest
function getClientIP(request: NextRequest): string {
  // Try to get IP from various headers (in order of preference)
  const forwardedFor = request.headers.get('x-forwarded-for');
  const realIP = request.headers.get('x-real-ip');
  const cfConnectingIP = request.headers.get('cf-connecting-ip'); // Cloudflare
  const remoteAddr = request.headers.get('remote-addr');
  
  // x-forwarded-for can contain multiple IPs, take the first one
  if (forwardedFor) {
    const ips = forwardedFor.split(',').map(ip => ip.trim());
    return ips[0];
  }
  
  // Return the first available IP
  return realIP || cfConnectingIP || remoteAddr || 'unknown';
}

export function rateLimit(windowMs: number = 15 * 60 * 1000, maxRequests: number = 100) {
  return (request: NextRequest): { allowed: boolean; remaining: number; resetTime?: number } => {
    const ip = getClientIP(request);
    const now = Date.now();
    const windowStart = Math.floor(now / windowMs) * windowMs;
    const key = `${ip}:${windowStart}`;
    
    const entry = rateLimitMap.get(key);
    
    if (!entry) {
      const resetTime = windowStart + windowMs;
      rateLimitMap.set(key, { count: 1, resetTime });
      return { 
        allowed: true, 
        remaining: maxRequests - 1,
        resetTime 
      };
    }
    
    if (entry.count >= maxRequests) {
      return { 
        allowed: false, 
        remaining: 0,
        resetTime: entry.resetTime 
      };
    }
    
    entry.count++;
    return { 
      allowed: true, 
      remaining: maxRequests - entry.count,
      resetTime: entry.resetTime 
    };
  };
}

// Enhanced rate limiter with different limits for different endpoints
export function createRateLimiter(config: {
  windowMs?: number;
  maxRequests?: number;
  skipIPs?: string[];
  keyGenerator?: (request: NextRequest) => string;
}) {
  const {
    windowMs = 15 * 60 * 1000, // 15 minutes
    maxRequests = 100,
    skipIPs = [],
    keyGenerator
  } = config;

  return (request: NextRequest): { 
    allowed: boolean; 
    remaining: number; 
    resetTime?: number;
    limit: number;
  } => {
    const ip = getClientIP(request);
    
    // Skip rate limiting for specified IPs
    if (skipIPs.includes(ip)) {
      return {
        allowed: true,
        remaining: maxRequests,
        limit: maxRequests
      };
    }

    const now = Date.now();
    const windowStart = Math.floor(now / windowMs) * windowMs;
    
    // Use custom key generator if provided, otherwise use IP
    const key = keyGenerator ? keyGenerator(request) : `${ip}:${windowStart}`;
    
    const entry = rateLimitMap.get(key);
    
    if (!entry) {
      const resetTime = windowStart + windowMs;
      rateLimitMap.set(key, { count: 1, resetTime });
      return { 
        allowed: true, 
        remaining: maxRequests - 1,
        resetTime,
        limit: maxRequests
      };
    }
    
    if (entry.count >= maxRequests) {
      return { 
        allowed: false, 
        remaining: 0,
        resetTime: entry.resetTime,
        limit: maxRequests
      };
    }
    
    entry.count++;
    return { 
      allowed: true, 
      remaining: maxRequests - entry.count,
      resetTime: entry.resetTime,
      limit: maxRequests
    };
  };
}

// Predefined rate limiters for different use cases
export const authRateLimit = createRateLimiter({
  windowMs: 15 * 60 * 1000, // 15 minutes
  maxRequests: 5, // 5 login attempts per 15 minutes
});

export const apiRateLimit = createRateLimiter({
  windowMs: 15 * 60 * 1000, // 15 minutes
  maxRequests: 100, // 100 API calls per 15 minutes
});

export const strictRateLimit = createRateLimiter({
  windowMs: 60 * 1000, // 1 minute
  maxRequests: 10, // 10 requests per minute
});

// Rate limiter for user-specific actions (uses user ID instead of IP)
export const userRateLimit = (userId: string, windowMs: number = 15 * 60 * 1000, maxRequests: number = 50) => {
  const now = Date.now();
  const windowStart = Math.floor(now / windowMs) * windowMs;
  const key = `user:${userId}:${windowStart}`;
  
  const entry = rateLimitMap.get(key);
  
  if (!entry) {
    const resetTime = windowStart + windowMs;
    rateLimitMap.set(key, { count: 1, resetTime });
    return { 
      allowed: true, 
      remaining: maxRequests - 1,
      resetTime,
      limit: maxRequests
    };
  }
  
  if (entry.count >= maxRequests) {
    return { 
      allowed: false, 
      remaining: 0,
      resetTime: entry.resetTime,
      limit: maxRequests
    };
  }
  
  entry.count++;
  return { 
    allowed: true, 
    remaining: maxRequests - entry.count,
    resetTime: entry.resetTime,
    limit: maxRequests
  };
};

// Helper function to create rate limit response headers
export function getRateLimitHeaders(result: {
  remaining: number;
  resetTime?: number;
  limit: number;
}) {
  const headers = new Headers();
  
  headers.set('X-RateLimit-Limit', result.limit.toString());
  headers.set('X-RateLimit-Remaining', result.remaining.toString());
  
  if (result.resetTime) {
    headers.set('X-RateLimit-Reset', Math.ceil(result.resetTime / 1000).toString());
  }
  
  return headers;
}

// Response helper for rate limit exceeded
export function rateLimitResponse(result: {
  remaining: number;
  resetTime?: number;
  limit: number;
}) {
  const headers = getRateLimitHeaders(result);
  
  return new Response(
    JSON.stringify({
      success: false,
      message: 'Too many requests',
      error: 'Rate limit exceeded',
      retryAfter: result.resetTime ? Math.ceil((result.resetTime - Date.now()) / 1000) : undefined
    }),
    {
      status: 429,
      headers: {
        'Content-Type': 'application/json',
        ...Object.fromEntries(headers.entries())
      }
    }
  );
}