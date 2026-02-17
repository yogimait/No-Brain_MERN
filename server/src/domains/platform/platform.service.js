// server/src/domains/platform/platform.service.js
// Phase-2: Platform Domain Layer
// Owns all platform catalog logic. No AI logic here.

import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import levenshtein from 'fast-levenshtein';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// ── Supported platforms (expand enum as new platforms are added) ──
const SUPPORTED_PLATFORMS = ['n8n'];

// ── In-memory catalog cache (lazy-loaded once per platform) ──
const catalogCache = new Map();

/**
 * Returns list of supported platform identifiers.
 */
export function getSupportedPlatforms() {
    return [...SUPPORTED_PLATFORMS];
}

/**
 * Checks if a platform string is supported.
 * Always normalize before calling: platform.trim().toLowerCase()
 */
export function isPlatformSupported(platform) {
    return SUPPORTED_PLATFORMS.includes(platform);
}

/**
 * Load and cache the full catalog JSON for a platform.
 * Fails gracefully — returns null if catalog is missing or corrupt.
 */
export function loadCatalog(platform) {
    if (!isPlatformSupported(platform)) {
        console.warn(`⚠️ [Platform] Unsupported platform requested: "${platform}"`);
        return null;
    }

    // Return from cache if already loaded
    if (catalogCache.has(platform)) {
        return catalogCache.get(platform);
    }

    try {
        const catalogPath = join(__dirname, '..', '..', 'platforms', 'nodes-catalog.json');
        const raw = readFileSync(catalogPath, 'utf-8');
        const catalog = JSON.parse(raw);

        if (!catalog || !Array.isArray(catalog.nodes)) {
            console.error(`❌ [Platform] Catalog for "${platform}" has invalid structure (missing nodes array)`);
            return null;
        }

        // Cache in memory — catalog is static, no runtime changes
        catalogCache.set(platform, catalog);
        console.log(`✅ [Platform] Loaded and cached catalog for "${platform}" (${catalog.nodes.length} nodes)`);
        return catalog;
    } catch (err) {
        console.error(`❌ [Platform] Failed to load catalog for "${platform}":`, err.message);
        return null;
    }
}

/**
 * Returns an array of valid node labels for the platform.
 * Labels are the human-readable names used in the AI prompt.
 */
export function getNodeLabels(platform) {
    const catalog = loadCatalog(platform);
    if (!catalog) return [];
    return catalog.nodes.map(node => node.label);
}

/**
 * Returns node labels with their types for structured prompt injection.
 * Format: [{ label: "Cron", type: "trigger" }, { label: "Slack", type: "action" }, ...]
 */
export function getNodeLabelsWithTypes(platform) {
    const catalog = loadCatalog(platform);
    if (!catalog) return [];
    return catalog.nodes.map(node => ({ label: node.label, type: node.type }));
}

/**
 * Returns the catalog version string (for metadata tracking).
 */
export function getCatalogVersion(platform) {
    const catalog = loadCatalog(platform);
    if (!catalog) return 'unknown';
    return catalog.version || 'unknown';
}

/**
 * Checks if a specific node label exists in the platform catalog.
 * Case-sensitive exact match — AI must produce exact labels.
 */
export function isNodeInCatalog(platform, label) {
    const catalog = loadCatalog(platform);
    if (!catalog) return false;
    return catalog.nodes.some(node => node.label === label);
}

/**
 * Validates an array of node labels against the catalog.
 * Returns { valid: boolean, invalidNodes: string[], corrections: {} }
 * 
 * Fuzzy correction is STRICT:
 * - Only accepts matches with >90% similarity
 * - Short labels (≤6 chars): max distance 1
 * - Medium labels (7-15 chars): max distance 2
 * - Long labels (>15 chars): max distance 3
 * - Never auto-corrects to unrelated nodes
 */
export function validateNodesAgainstCatalog(platform, nodeLabels) {
    const catalog = loadCatalog(platform);
    if (!catalog) {
        return {
            valid: false,
            invalidNodes: [],
            error: `Platform catalog for "${platform}" is unavailable`
        };
    }

    const validLabels = new Set(catalog.nodes.map(n => n.label));
    const invalidNodes = [];
    const corrections = {};

    for (let i = 0; i < nodeLabels.length; i++) {
        let label = nodeLabels[i];

        if (typeof label !== 'string') {
            invalidNodes.push(`[non-string: ${typeof label}]`);
            continue;
        }

        // Exact match — pass immediately
        if (validLabels.has(label)) {
            continue;
        }

        // Strict fuzzy matching: distance threshold based on label length
        let bestMatch = null;
        let minDistance = Infinity;
        const maxThreshold = label.length <= 6 ? 1 : label.length <= 15 ? 2 : 3;

        for (const validLabel of validLabels) {
            const distance = levenshtein.get(label.toLowerCase(), validLabel.toLowerCase());
            if (distance < minDistance) {
                minDistance = distance;
                bestMatch = validLabel;
            }
        }

        if (bestMatch && minDistance <= maxThreshold) {
            console.log(`✨ [Platform] Fuzzy corrected "${label}" → "${bestMatch}" (distance: ${minDistance}, threshold: ${maxThreshold})`);
            corrections[label] = bestMatch;
        } else {
            invalidNodes.push(label);
            if (bestMatch) {
                console.warn(`⚠️ [Platform] Rejected fuzzy match: "${label}" → "${bestMatch}" (distance: ${minDistance}, threshold: ${maxThreshold}) — too different`);
            }
        }
    }

    if (invalidNodes.length > 0) {
        console.warn(`⚠️ [Platform] Hallucinated nodes for "${platform}":`, invalidNodes);
        return {
            valid: false,
            invalidNodes,
            corrections
        };
    }

    return {
        valid: true,
        invalidNodes: [],
        corrections
    };
}
