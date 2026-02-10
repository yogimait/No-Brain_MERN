// server/src/agents/intentParser.js
// Rule-based intent parsing without AI dependency

import { logDecision } from './agentContext.js';
import { INTENT_CONFIDENCE_THRESHOLD } from './constants.js';

/**
 * Keyword dictionaries for action detection
 * Each action has synonyms with confidence weights
 */
const ACTION_KEYWORDS = {
    fetch: {
        keywords: ['fetch', 'get', 'retrieve', 'collect', 'pull', 'obtain', 'grab', 'connect', 'read', 'load'],
        baseConfidence: 0.9
    },
    scrape: {
        keywords: ['scrape', 'crawl', 'extract', 'mine', 'harvest', 'webscraper', 'web scraper', 'scraper', 'scraping'],
        baseConfidence: 0.9
    },
    summarize: {
        keywords: ['summarize', 'summary', 'shorten', 'condense', 'digest', 'brief', 'tldr', 'summarization'],
        baseConfidence: 0.9
    },
    analyze: {
        keywords: ['analyze', 'analysis', 'examine', 'study', 'evaluate', 'sentiment', 'understand'],
        baseConfidence: 0.85
    },
    transform: {
        keywords: ['transform', 'convert', 'process', 'format', 'change', 'modify', 'information'],
        baseConfidence: 0.85
    },
    generate: {
        keywords: ['generate', 'create', 'write', 'compose', 'produce', 'make', 'build'],
        baseConfidence: 0.85
    },
    send: {
        keywords: ['send', 'deliver', 'transmit', 'forward', 'dispatch', 'share'],
        baseConfidence: 0.9
    },
    notify: {
        keywords: ['notify', 'alert', 'inform', 'warn', 'remind', 'notification'],
        baseConfidence: 0.85
    },
    post: {
        keywords: ['post', 'publish', 'share', 'broadcast', 'upload'],
        baseConfidence: 0.9
    },
    email: {
        keywords: ['email', 'mail', 'inbox', 'gmail'],
        baseConfidence: 0.95
    },
    slack: {
        keywords: ['slack', 'channel', 'workspace'],
        baseConfidence: 0.95
    },
    twitter: {
        keywords: ['twitter', 'tweet', 'x.com'],
        baseConfidence: 0.95
    },
    instagram: {
        keywords: ['instagram', 'insta', 'ig'],
        baseConfidence: 0.95
    },
    sms: {
        keywords: ['sms', 'text message', 'mobile'],
        baseConfidence: 0.95
    },
    upload: {
        keywords: ['upload', 'store', 'save', 'backup'],
        baseConfidence: 0.85
    },
    filter: {
        keywords: ['filter', 'select', 'pick', 'choose', 'exclude'],
        baseConfidence: 0.8
    },
    merge: {
        keywords: ['merge', 'combine', 'join', 'concatenate', 'union'],
        baseConfidence: 0.85
    },
    loop: {
        keywords: ['loop', 'repeat', 'iterate', 'each', 'every', 'for each'],
        baseConfidence: 0.85
    },
    delay: {
        keywords: ['delay', 'wait', 'pause', 'sleep'],
        baseConfidence: 0.9
    },
    condition: {
        keywords: ['if', 'when', 'condition', 'check', 'unless', 'only if'],
        baseConfidence: 0.85
    }
};

/**
 * Source detection keywords
 */
const SOURCE_KEYWORDS = {
    api: ['api', 'endpoint', 'rest', 'graphql', 'service'],
    web: ['website', 'webpage', 'site', 'url', 'link', 'page'],
    blog: ['blog', 'post', 'article', 'content'],
    rss: ['rss', 'feed', 'news'],
    database: ['database', 'db', 'table', 'records'],
    file: ['file', 'csv', 'json', 'excel', 'spreadsheet'],
    social: ['social', 'facebook', 'instagram', 'linkedin']
};

/**
 * Output detection keywords
 */
const OUTPUT_KEYWORDS = {
    email: ['email', 'mail', 'inbox', 'gmail', 'outlook'],
    slack: ['slack', 'channel'],
    sms: ['sms', 'text', 'phone'],
    twitter: ['twitter', 'tweet', 'x post'],
    instagram: ['instagram', 'insta', 'ig'],
    linkedin: ['linkedin', 'li post'],
    sheets: ['sheets', 'spreadsheet', 'google sheets', 'excel'],
    s3: ['s3', 'aws', 'bucket', 'storage'],
    webhook: ['webhook', 'callback', 'endpoint'],
    file: ['file', 'save', 'download', 'export']
};

/**
 * Frequency detection patterns
 */
const FREQUENCY_PATTERNS = [
    { pattern: /\b(every\s*day|daily|each\s*day)\b/i, value: 'daily' },
    { pattern: /\b(every\s*hour|hourly)\b/i, value: 'hourly' },
    { pattern: /\b(every\s*week|weekly)\b/i, value: 'weekly' },
    { pattern: /\b(every\s*month|monthly)\b/i, value: 'monthly' },
    { pattern: /\b(every\s*(\d+)\s*minutes?)\b/i, value: 'custom' },
    { pattern: /\b(real[\s-]?time|instant|immediately)\b/i, value: 'realtime' },
    { pattern: /\b(once|one\s*time)\b/i, value: 'once' }
];

/**
 * Normalize text for matching
 * @param {string} text - Input text
 * @returns {string} - Normalized text
 */
function normalizeText(text) {
    return text.toLowerCase().trim();
}

/**
 * Calculate word match score with position bonus
 * @param {string} text - Normalized text
 * @param {string[]} keywords - Keywords to match
 * @returns {object} - { matched: boolean, score: number }
 */
function matchKeywords(text, keywords) {
    let maxScore = 0;
    let matched = false;

    for (const keyword of keywords) {
        // Check for exact word match (word boundary)
        const regex = new RegExp(`\\b${keyword.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'i');
        if (regex.test(text)) {
            matched = true;
            // Higher score for earlier matches (position bonus)
            const index = text.indexOf(keyword.toLowerCase());
            const positionBonus = Math.max(0, 0.1 * (1 - index / text.length));
            // Longer keywords are more specific
            const lengthBonus = Math.min(0.1, keyword.length * 0.01);
            const score = 0.8 + positionBonus + lengthBonus;
            maxScore = Math.max(maxScore, score);
        }
    }

    return { matched, score: matched ? Math.min(1.0, maxScore) : 0 };
}

/**
 * Detect actions from prompt text
 * @param {string} text - Normalized prompt
 * @returns {Array} - Array of { type, confidence }
 */
function detectActions(text) {
    const actions = [];
    const detectedTypes = new Set();

    for (const [actionType, config] of Object.entries(ACTION_KEYWORDS)) {
        const { matched, score } = matchKeywords(text, config.keywords);
        if (matched && !detectedTypes.has(actionType)) {
            const confidence = config.baseConfidence * score;
            actions.push({
                type: actionType,
                confidence: Math.round(confidence * 100) / 100
            });
            detectedTypes.add(actionType);
        }
    }

    // Sort by confidence descending
    actions.sort((a, b) => b.confidence - a.confidence);
    return actions;
}

/**
 * Detect sources from prompt text
 * @param {string} text - Normalized prompt
 * @returns {string[]} - Array of source types
 */
function detectSources(text) {
    const sources = [];
    for (const [sourceType, keywords] of Object.entries(SOURCE_KEYWORDS)) {
        const { matched } = matchKeywords(text, keywords);
        if (matched) {
            sources.push(sourceType);
        }
    }
    return sources;
}

/**
 * Detect outputs from prompt text
 * @param {string} text - Normalized prompt
 * @returns {string[]} - Array of output types
 */
function detectOutputs(text) {
    const outputs = [];
    for (const [outputType, keywords] of Object.entries(OUTPUT_KEYWORDS)) {
        const { matched } = matchKeywords(text, keywords);
        if (matched) {
            outputs.push(outputType);
        }
    }
    return outputs;
}

/**
 * Detect frequency from prompt text
 * @param {string} text - Original prompt text
 * @returns {string|null} - Frequency value or null
 */
function detectFrequency(text) {
    for (const { pattern, value } of FREQUENCY_PATTERNS) {
        if (pattern.test(text)) {
            return value;
        }
    }
    return null;
}

/**
 * Calculate overall confidence based on detected elements
 * @param {Array} actions - Detected actions
 * @param {string[]} sources - Detected sources
 * @param {string[]} outputs - Detected outputs
 * @returns {number} - Overall confidence 0-1
 */
function calculateOverallConfidence(actions, sources, outputs) {
    if (actions.length === 0) return 0;

    // Base confidence from actions
    const avgActionConfidence = actions.reduce((sum, a) => sum + a.confidence, 0) / actions.length;

    // Bonus for complete pipelines (source + action + output)
    let completenessBonus = 0;
    if (sources.length > 0 && outputs.length > 0) {
        completenessBonus = 0.1;
    } else if (sources.length > 0 || outputs.length > 0) {
        completenessBonus = 0.05;
    }

    return Math.min(1.0, Math.round((avgActionConfidence + completenessBonus) * 100) / 100);
}

/**
 * Parse user prompt into structured intent
 * Always returns fixed shape - no optional keys, no undefined
 * 
 * @param {string} prompt - User's natural language prompt
 * @param {object} context - AgentContext for decision logging
 * @returns {object} - Structured intent object
 */
export function parseIntent(prompt, context = null) {
    // Always return fixed shape
    const result = {
        actions: [],
        sources: [],
        outputs: [],
        frequency: null,
        confidence: 0,
        raw: prompt || ''
    };

    // Handle empty/invalid input
    if (!prompt || typeof prompt !== 'string' || prompt.trim().length === 0) {
        if (context) {
            logDecision(context, 'intent', 'empty_prompt', 'Prompt was empty or invalid');
        }
        return result;
    }

    const normalizedText = normalizeText(prompt);

    // Detect all elements
    result.actions = detectActions(normalizedText);
    result.sources = detectSources(normalizedText);
    result.outputs = detectOutputs(normalizedText);
    result.frequency = detectFrequency(prompt);
    result.confidence = calculateOverallConfidence(result.actions, result.sources, result.outputs);

    // Filter out low-confidence actions
    const filteredActions = result.actions.filter(a => a.confidence >= INTENT_CONFIDENCE_THRESHOLD);

    if (context) {
        // Log decisions
        if (filteredActions.length < result.actions.length) {
            const droppedCount = result.actions.length - filteredActions.length;
            logDecision(
                context,
                'intent',
                'filter_low_confidence',
                `Dropped ${droppedCount} action(s) below threshold ${INTENT_CONFIDENCE_THRESHOLD}`
            );
        }

        logDecision(
            context,
            'intent',
            'parse_complete',
            `Detected ${filteredActions.length} action(s), ${result.sources.length} source(s), ${result.outputs.length} output(s)`
        );
    }

    result.actions = filteredActions;

    // FIX 2: Minimum action heuristic
    // If no actions detected but prompt is meaningful (>8 chars), assume data intent
    if (result.actions.length === 0 && prompt.trim().length > 8) {
        result.actions.push({ type: 'fetch', confidence: 0.3 });
        if (context) {
            logDecision(
                context,
                'intent',
                'fallback_action',
                'No actions detected but prompt is meaningful, added fallback fetch action'
            );
        }
    }

    // Debug logging disabled (was causing page lag)
    // if (context && context.decisions) {
    //     console.log('🧩 Intent Parser Decisions:');
    //     console.table(context.decisions.filter(d => d.stage === 'intent'));
    // }

    return result;
}

/**
 * Check if a parsed intent is actionable
 * @param {object} intent - Parsed intent object
 * @returns {boolean} - True if intent can produce a workflow
 */
export function isActionableIntent(intent) {
    return intent && intent.actions && intent.actions.length > 0;
}
