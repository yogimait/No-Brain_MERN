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

const RELEVANCE_STOPWORDS = new Set([
    'a', 'an', 'the', 'and', 'or', 'to', 'of', 'for', 'in', 'on', 'at', 'by', 'with', 'from',
    'is', 'are', 'be', 'this', 'that', 'it', 'as', 'into', 'then', 'than', 'if', 'when',
    'workflow', 'automation', 'automate', 'create', 'build', 'make', 'please', 'my', 'me'
]);

const RELEVANCE_SYNONYMS = {
    email: ['email', 'mail', 'gmail', 'imap', 'smtp', 'outlook'],
    whatsapp: ['whatsapp', 'wa', 'twilio', 'sms', 'message', 'chat'],
    slack: ['slack', 'notify', 'notification'],
    schedule: ['schedule', 'cron', 'daily', 'weekly', 'hourly', 'interval', 'trigger'],
    sheet: ['sheet', 'sheets', 'spreadsheet', 'excel'],
    summarize: ['summarize', 'summary', 'digest', 'condense', 'ai', 'llm']
};

const DEFAULT_FALLBACK_LABELS = [
    'Schedule Trigger',
    'Webhook',
    'Manual Trigger',
    'HTTP Request',
    'Set',
    'IF',
    'Merge',
    'Wait'
];

function tokenizeForRelevance(text) {
    return String(text || '')
        .toLowerCase()
        .replace(/([a-z])([A-Z])/g, '$1 $2')
        .replace(/[^a-z0-9\s]/g, ' ')
        .split(/\s+/)
        .filter(token => token.length > 1 && !RELEVANCE_STOPWORDS.has(token));
}

function expandQueryTokens(rawTokens) {
    const expanded = new Set(rawTokens);

    for (const [root, variants] of Object.entries(RELEVANCE_SYNONYMS)) {
        const matched = expanded.has(root) || variants.some(token => expanded.has(token));
        if (!matched) continue;

        expanded.add(root);
        variants.forEach(token => expanded.add(token));
    }

    return expanded;
}

function scoreNodeForPrompt(node, queryTokens) {
    const label = String(node?.label || '');
    const lowerLabel = label.toLowerCase();
    const labelTokens = new Set(tokenizeForRelevance(label));
    let score = 0;

    for (const token of queryTokens) {
        if (labelTokens.has(token)) score += 4;
        if (token.length > 3 && lowerLabel.includes(token)) score += 2;
    }

    if (node?.type === 'trigger' && (queryTokens.has('trigger') || queryTokens.has('schedule'))) {
        score += 2;
    }

    return score;
}

function buildFallbackSubset(nodes, maxNodes) {
    const selected = [];
    const used = new Set();

    const pushNode = (node) => {
        if (!node || used.has(node.label)) return;
        used.add(node.label);
        selected.push({ label: node.label, type: node.type });
    };

    // Prefer broadly useful core nodes first.
    for (const fallbackLabel of DEFAULT_FALLBACK_LABELS) {
        const matched = nodes.find(node => node.label.toLowerCase() === fallbackLabel.toLowerCase());
        pushNode(matched);
        if (selected.length >= maxNodes) return selected;
    }

    // Ensure we have a balanced baseline if specific labels are missing.
    for (const node of nodes) {
        if (node.type === 'trigger') {
            pushNode(node);
            if (selected.length >= maxNodes) return selected;
        }
    }

    for (const node of nodes) {
        pushNode(node);
        if (selected.length >= maxNodes) return selected;
    }

    return selected;
}

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
 * Returns a ranked subset of node labels/types relevant to a user prompt.
 * This keeps prompt size small and avoids sending the full platform catalog.
 *
 * @param {string} platform - Platform identifier
 * @param {string} userPrompt - User request text
 * @param {{maxNodes?: number, minScore?: number}} options - Relevance tuning
 * @returns {Array<{label: string, type: string}>}
 */
export function getRelevantNodeLabelsWithTypes(platform, userPrompt, options = {}) {
    const catalog = loadCatalog(platform);
    if (!catalog) return [];

    const maxNodes = Math.min(Math.max(options.maxNodes ?? 28, 8), 120);
    const minScore = Math.max(options.minScore ?? 2, 0);
    const nodes = catalog.nodes.map(node => ({ label: node.label, type: node.type }));

    const queryTokens = expandQueryTokens(tokenizeForRelevance(userPrompt));
    if (queryTokens.size === 0) {
        return buildFallbackSubset(nodes, maxNodes);
    }

    const ranked = nodes
        .map(node => ({ ...node, score: scoreNodeForPrompt(node, queryTokens) }))
        .filter(node => node.score >= minScore)
        .sort((a, b) => b.score - a.score);

    const selected = [];
    const selectedLabels = new Set();

    for (const node of ranked) {
        if (selectedLabels.has(node.label)) continue;
        selectedLabels.add(node.label);
        selected.push({ label: node.label, type: node.type });
        if (selected.length >= maxNodes) break;
    }

    if (selected.length === 0) {
        return buildFallbackSubset(nodes, maxNodes);
    }

    if (!selected.some(node => node.type === 'trigger')) {
        const topTrigger = ranked.find(node => node.type === 'trigger') || nodes.find(node => node.type === 'trigger');
        if (topTrigger && !selectedLabels.has(topTrigger.label)) {
            selected.unshift({ label: topTrigger.label, type: topTrigger.type });
            selectedLabels.add(topTrigger.label);
        }
    }

    if (selected.length < maxNodes) {
        const fallback = buildFallbackSubset(nodes, maxNodes);
        for (const node of fallback) {
            if (selected.length >= maxNodes) break;
            if (selectedLabels.has(node.label)) continue;
            selected.push(node);
            selectedLabels.add(node.label);
        }
    }

    return selected.slice(0, maxNodes);
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
