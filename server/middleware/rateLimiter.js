const rateLimit = {};

export const createRateLimiter = (options = {}) => {
  const {
    windowMs = 15 * 60 * 1000,
    max = 100, 
    message = 'Too many requests, please try again later',
    keyGenerator = (req) => req.ip || req.connection.remoteAddress,
    skip = () => false // Function to skip rate limiting
  } = options;

  return (req, res, next) => {
    // Skip rate limiting if skip function returns true
    if (skip(req)) {
      return next();
    }

    const key = keyGenerator(req);
    const now = Date.now();
    
    if (!rateLimit[key]) {
      rateLimit[key] = {
        count: 1,
        resetTime: now + windowMs
      };
      return next();
    }

    if (now > rateLimit[key].resetTime) {
      rateLimit[key] = {
        count: 1,
        resetTime: now + windowMs
      };
      return next();
    }

    if (rateLimit[key].count >= max) {
      return res.status(429).json({
        error: message,
        retryAfter: Math.ceil((rateLimit[key].resetTime - now) / 1000)
      });
    }

    rateLimit[key].count++;
    next();
  };
};

export const authLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000,
  max: process.env.NODE_ENV === 'production' ? 5 : 1000, // Very lenient in development
  message: 'Too many login attempts, please try again after 15 minutes',
  // Skip rate limiting in development
  skip: (req) => {
    if (process.env.NODE_ENV !== 'production') {
      return true; // Skip all rate limiting in development
    }
    return false;
  }
});

export const apiLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000,
  max: process.env.NODE_ENV === 'production' ? 100 : 5000, // Very lenient in development (5000 requests per 15 min)
  message: 'Too many requests from this IP, please try again later',
  // Skip rate limiting completely in development mode
  skip: (req) => {
    // Disable rate limiting in development
    if (process.env.NODE_ENV !== 'production') {
      return true; // Skip all rate limiting in development
    }
    return false;
  }
});

// Function to clear rate limit for a specific IP (useful for development)
export const clearRateLimit = (ip) => {
  if (ip) {
    delete rateLimit[ip];
  } else {
    // Clear all if no IP specified
    Object.keys(rateLimit).forEach(key => delete rateLimit[key]);
  }
};

export const transactionLimiter = createRateLimiter({
  windowMs: 60 * 1000,
  max: process.env.NODE_ENV === 'production' ? 10 : 1000, // Very lenient in development
  message: 'Too many transactions, please slow down',
  // Skip rate limiting in development
  skip: (req) => {
    if (process.env.NODE_ENV !== 'production') {
      return true; // Skip all rate limiting in development
    }
    return false;
  }
});

setInterval(() => {
  const now = Date.now();
  Object.keys(rateLimit).forEach(key => {
    if (now > rateLimit[key].resetTime) {
      delete rateLimit[key];
    }
  });
}, 60 * 60 * 1000);
