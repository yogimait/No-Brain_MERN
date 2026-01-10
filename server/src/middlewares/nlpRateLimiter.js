/**
 * nlpRateLimiter.js - Rate limiting middleware for NLP/Gemini API endpoints
 * 
 * Implements:
 * - Per-user rate limiting (5 requests/minute)
 * - Global rate limiting (30 requests/minute)
 * - Cooldown period after generation
 */

// Rate limit configuration
const PER_USER_LIMIT = 5;           // Max requests per user per window
const GLOBAL_LIMIT = 30;             // Max total requests per window
const WINDOW_MS = 60 * 1000;         // 1 minute window
const COOLDOWN_MS = 30 * 1000;       // 30 second cooldown between requests

// In-memory tracking stores
const userRequests = new Map();      // userId -> { count, windowStart, lastRequest }
const globalState = {
    count: 0,
    windowStart: Date.now()
};

/**
 * Get user identifier from request
 * Uses user ID if authenticated, otherwise IP address
 */
function getUserIdentifier(req) {
    return req.user?.id || req.ip || 'anonymous';
}

/**
 * Reset window if expired
 */
function resetWindowIfExpired(state) {
    const now = Date.now();
    if (now - state.windowStart >= WINDOW_MS) {
        state.count = 0;
        state.windowStart = now;
    }
}

/**
 * Rate limiting middleware for NLP endpoints
 */
export function nlpRateLimiter(req, res, next) {
    const now = Date.now();
    const userId = getUserIdentifier(req);

    // Check global rate limit
    resetWindowIfExpired(globalState);
    if (globalState.count >= GLOBAL_LIMIT) {
        const retryAfter = Math.ceil((WINDOW_MS - (now - globalState.windowStart)) / 1000);
        console.warn(`🚫 Global rate limit exceeded. Retry after ${retryAfter}s`);

        return res.status(429).json({
            success: false,
            error: 'Service is experiencing high demand. Please try again shortly.',
            retryAfter,
            rateLimitType: 'global'
        });
    }

    // Get or create user state
    let userState = userRequests.get(userId);
    if (!userState) {
        userState = { count: 0, windowStart: now, lastRequest: 0 };
        userRequests.set(userId, userState);
    }

    // Reset user window if expired
    resetWindowIfExpired(userState);

    // Check per-user rate limit
    if (userState.count >= PER_USER_LIMIT) {
        const retryAfter = Math.ceil((WINDOW_MS - (now - userState.windowStart)) / 1000);
        console.warn(`🚫 User ${userId} rate limited. ${userState.count}/${PER_USER_LIMIT} requests. Retry after ${retryAfter}s`);

        return res.status(429).json({
            success: false,
            error: `Rate limit exceeded. You can make ${PER_USER_LIMIT} requests per minute.`,
            retryAfter,
            rateLimitType: 'user',
            remaining: 0
        });
    }

    // Check cooldown period
    const timeSinceLastRequest = now - userState.lastRequest;
    if (userState.lastRequest > 0 && timeSinceLastRequest < COOLDOWN_MS) {
        const cooldownRemaining = Math.ceil((COOLDOWN_MS - timeSinceLastRequest) / 1000);
        console.warn(`⏳ User ${userId} in cooldown. Wait ${cooldownRemaining}s`);

        return res.status(429).json({
            success: false,
            error: `Please wait ${cooldownRemaining} seconds before generating another workflow.`,
            retryAfter: cooldownRemaining,
            rateLimitType: 'cooldown'
        });
    }

    // Increment counters
    userState.count++;
    userState.lastRequest = now;
    globalState.count++;

    // Add rate limit headers
    res.set({
        'X-RateLimit-Limit': PER_USER_LIMIT,
        'X-RateLimit-Remaining': Math.max(0, PER_USER_LIMIT - userState.count),
        'X-RateLimit-Reset': Math.ceil((userState.windowStart + WINDOW_MS) / 1000)
    });

    console.log(`✅ Rate limit OK for user ${userId}: ${userState.count}/${PER_USER_LIMIT} (global: ${globalState.count}/${GLOBAL_LIMIT})`);

    next();
}

/**
 * Get rate limit statistics
 */
export function getRateLimitStats() {
    const now = Date.now();
    return {
        global: {
            count: globalState.count,
            limit: GLOBAL_LIMIT,
            windowMs: WINDOW_MS,
            resetsIn: Math.max(0, WINDOW_MS - (now - globalState.windowStart))
        },
        activeUsers: userRequests.size,
        config: {
            perUserLimit: PER_USER_LIMIT,
            globalLimit: GLOBAL_LIMIT,
            windowMs: WINDOW_MS,
            cooldownMs: COOLDOWN_MS
        }
    };
}

/**
 * Clear rate limit state (for testing)
 */
export function clearRateLimitState() {
    userRequests.clear();
    globalState.count = 0;
    globalState.windowStart = Date.now();
    console.log('🧹 Rate limit state cleared');
}
