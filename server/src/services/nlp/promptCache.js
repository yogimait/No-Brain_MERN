/**
 * promptCache.js - In-memory LRU cache for Gemini workflow generation
 * 
 * Caches generated workflows to avoid redundant API calls for identical prompts.
 * Cache key includes: prompt + model + node registry version
 */

import crypto from 'crypto';

// Node registry version - increment when node types change
export const NODE_REGISTRY_VERSION = 'v1';

// Cache configuration
const CACHE_TTL_MS = 10 * 60 * 1000; // 10 minutes
const MAX_CACHE_ENTRIES = 100;

// In-memory cache storage
const cache = new Map();
const accessOrder = []; // For LRU tracking

/**
 * Generate a hash key from prompt, model, and registry version
 */
function generateCacheKey(prompt, model) {
    const normalizedPrompt = prompt.trim().toLowerCase();
    const keyString = `${normalizedPrompt}|${model}|${NODE_REGISTRY_VERSION}`;
    return crypto.createHash('sha256').update(keyString).digest('hex').slice(0, 16);
}

/**
 * Get cached workflow result if exists and not expired
 */
export function getCachedWorkflow(prompt, model) {
    const key = generateCacheKey(prompt, model);
    const entry = cache.get(key);

    if (!entry) {
        console.log(`📭 Cache MISS for key: ${key.slice(0, 8)}...`);
        return null;
    }

    // Check if expired
    if (Date.now() > entry.expiresAt) {
        console.log(`⏰ Cache EXPIRED for key: ${key.slice(0, 8)}...`);
        cache.delete(key);
        removeFromAccessOrder(key);
        return null;
    }

    // Update access order (LRU)
    updateAccessOrder(key);

    console.log(`✅ Cache HIT for key: ${key.slice(0, 8)}... (saved an API call!)`);
    return entry.data;
}

/**
 * Store workflow result in cache
 */
export function setCachedWorkflow(prompt, model, workflowResult) {
    const key = generateCacheKey(prompt, model);

    // Evict oldest entries if at capacity
    while (cache.size >= MAX_CACHE_ENTRIES && accessOrder.length > 0) {
        const oldestKey = accessOrder.shift();
        cache.delete(oldestKey);
        console.log(`🗑️ Cache evicted oldest entry: ${oldestKey.slice(0, 8)}...`);
    }

    cache.set(key, {
        data: workflowResult,
        expiresAt: Date.now() + CACHE_TTL_MS,
        createdAt: Date.now()
    });

    accessOrder.push(key);
    console.log(`💾 Cache SET for key: ${key.slice(0, 8)}... (TTL: ${CACHE_TTL_MS / 1000}s)`);
}

/**
 * Clear entire cache
 */
export function clearCache() {
    cache.clear();
    accessOrder.length = 0;
    console.log('🧹 Cache cleared');
}

/**
 * Get cache statistics
 */
export function getCacheStats() {
    const now = Date.now();
    let validEntries = 0;
    let expiredEntries = 0;

    for (const [, entry] of cache) {
        if (now > entry.expiresAt) {
            expiredEntries++;
        } else {
            validEntries++;
        }
    }

    return {
        totalEntries: cache.size,
        validEntries,
        expiredEntries,
        maxEntries: MAX_CACHE_ENTRIES,
        ttlSeconds: CACHE_TTL_MS / 1000,
        nodeRegistryVersion: NODE_REGISTRY_VERSION
    };
}

// Helper functions for LRU tracking
function updateAccessOrder(key) {
    removeFromAccessOrder(key);
    accessOrder.push(key);
}

function removeFromAccessOrder(key) {
    const index = accessOrder.indexOf(key);
    if (index > -1) {
        accessOrder.splice(index, 1);
    }
}
