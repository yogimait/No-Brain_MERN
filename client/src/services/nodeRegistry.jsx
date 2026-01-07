// Centralized Node Registry - Single Source of Truth
// All node definitions with handler, label, icon, category, and color

import React from 'react';
import {
    Plug,
    Rows,
    Edit,
    MessageSquare,
    Bot,
    Text,
    Mail,
    Brain,
    Database,
    FileText,
    Camera,
    Settings,
    Target,
    Timer,
    Calendar,
    RefreshCw,
    Link,
    Twitter,
    Linkedin,
    Instagram,
    Zap,
    Upload,
    Rss
} from 'lucide-react';

/**
 * NODE_REGISTRY - Complete node definitions
 * Key: handler (used for node type identification)
 * Value: { handler, label, icon, category, color }
 */
export const NODE_REGISTRY = {
    // AI Agents
    aiSummarizer: {
        handler: 'aiSummarizer',
        label: 'AI Summarizer',
        iconName: 'Rows',
        category: 'AI Agents',
        color: 'text-sky-400'
    },
    aiTextGenerator: {
        handler: 'aiTextGenerator',
        label: 'AI Text Generator',
        iconName: 'Bot',
        category: 'AI Agents',
        color: 'text-cyan-300'
    },
    sentimentAnalyzer: {
        handler: 'sentimentAnalyzer',
        label: 'Sentiment Analyzer',
        iconName: 'Text',
        category: 'AI Agents',
        color: 'text-rose-400'
    },
    contentPolisher: {
        handler: 'contentPolisher',
        label: 'Content Polisher',
        iconName: 'Edit',
        category: 'AI Agents',
        color: 'text-fuchsia-400'
    },

    // Platforms
    twitterApi: {
        handler: 'twitterApi',
        label: 'X API',
        iconName: 'Twitter',
        category: 'Platforms',
        color: 'text-blue-400'
    },
    linkedinApi: {
        handler: 'linkedinApi',
        label: 'LinkedIn API',
        iconName: 'Linkedin',
        category: 'Platforms',
        color: 'text-blue-500'
    },
    instagramApi: {
        handler: 'instagramApi',
        label: 'Instagram API',
        iconName: 'Instagram',
        category: 'Platforms',
        color: 'text-pink-500'
    },
    emailGenerator: {
        handler: 'emailGenerator',
        label: 'Email Generator',
        iconName: 'Mail',
        category: 'Platforms',
        color: 'text-red-400'
    },
    slackSender: {
        handler: 'slackSender',
        label: 'Slack Message',
        iconName: 'MessageSquare',
        category: 'Platforms',
        color: 'text-purple-400'
    },
    smsSender: {
        handler: 'smsSender',
        label: 'SMS Sender',
        iconName: 'MessageSquare',
        category: 'Platforms',
        color: 'text-yellow-400'
    },
    googleSheets: {
        handler: 'googleSheets',
        label: 'Google Sheets',
        iconName: 'FileText',
        category: 'Platforms',
        color: 'text-green-300'
    },
    calendarEvent: {
        handler: 'calendarEvent',
        label: 'Calendar Event',
        iconName: 'Calendar',
        category: 'Platforms',
        color: 'text-blue-300'
    },
    pagerDuty: {
        handler: 'pagerDuty',
        label: 'PagerDuty',
        iconName: 'Link',
        category: 'Platforms',
        color: 'text-purple-400'
    },

    // Data Sources
    dataFetcher: {
        handler: 'dataFetcher',
        label: 'Data Fetcher',
        iconName: 'Plug',
        category: 'Data Sources',
        color: 'text-blue-400'
    },
    webScraper: {
        handler: 'webScraper',
        label: 'Web Scraper',
        iconName: 'Plug',
        category: 'Data Sources',
        color: 'text-lime-400'
    },
    rssFeed: {
        handler: 'rssFeed',
        label: 'RSS Feed',
        iconName: 'Rss',
        category: 'Data Sources',
        color: 'text-orange-400'
    },
    webhook: {
        handler: 'webhook',
        label: 'Webhook',
        iconName: 'Zap',
        category: 'Data Sources',
        color: 'text-yellow-400'
    },
    database: {
        handler: 'database',
        label: 'Database',
        iconName: 'Database',
        category: 'Data Sources',
        color: 'text-cyan-400'
    },
    fileUpload: {
        handler: 'fileUpload',
        label: 'File Upload',
        iconName: 'Upload',
        category: 'Data Sources',
        color: 'text-green-400'
    },
    s3Upload: {
        handler: 's3Upload',
        label: 'S3 Upload',
        iconName: 'Upload',
        category: 'Data Sources',
        color: 'text-amber-400'
    },

    // Processing
    textProcessor: {
        handler: 'textProcessor',
        label: 'Text Processor',
        iconName: 'FileText',
        category: 'Processing',
        color: 'text-purple-400'
    },
    imageProcessor: {
        handler: 'imageProcessor',
        label: 'Image Processor',
        iconName: 'Camera',
        category: 'Processing',
        color: 'text-indigo-400'
    },
    dataTransformer: {
        handler: 'dataTransformer',
        label: 'Data Transformer',
        iconName: 'Settings',
        category: 'Processing',
        color: 'text-teal-400'
    },
    conditionCheck: {
        handler: 'conditionCheck',
        label: 'Condition Check',
        iconName: 'Target',
        category: 'Processing',
        color: 'text-red-500'
    },

    // Control
    delay: {
        handler: 'delay',
        label: 'Delay',
        iconName: 'Timer',
        category: 'Control',
        color: 'text-amber-400'
    },
    schedule: {
        handler: 'schedule',
        label: 'Schedule',
        iconName: 'Calendar',
        category: 'Control',
        color: 'text-blue-300'
    },
    loop: {
        handler: 'loop',
        label: 'Loop',
        iconName: 'RefreshCw',
        category: 'Control',
        color: 'text-violet-400'
    },
    merge: {
        handler: 'merge',
        label: 'Merge',
        iconName: 'Link',
        category: 'Control',
        color: 'text-emerald-400'
    }
};

// Icon mapping for rendering
const ICON_MAP = {
    Plug: Plug,
    Rows: Rows,
    Edit: Edit,
    MessageSquare: MessageSquare,
    Bot: Bot,
    Text: Text,
    Mail: Mail,
    Brain: Brain,
    Database: Database,
    FileText: FileText,
    Camera: Camera,
    Settings: Settings,
    Target: Target,
    Timer: Timer,
    Calendar: Calendar,
    RefreshCw: RefreshCw,
    Link: Link,
    Twitter: Twitter,
    Linkedin: Linkedin,
    Instagram: Instagram,
    Zap: Zap,
    Upload: Upload,
    Rss: Rss
};

/**
 * Get node data by handler key
 * @param {string} handler - The handler key (e.g., 'aiSummarizer')
 * @returns {object|null} Node definition or null if not found
 */
export function getNodeByHandler(handler) {
    if (!handler || typeof handler !== 'string') return null;
    return NODE_REGISTRY[handler] || null;
}

/**
 * Get React icon component for a handler
 * @param {string} handler - The handler key
 * @param {number} size - Icon size (default: 16)
 * @returns {React.Element} React icon component
 */
export function getIconForHandler(handler, size = 16) {
    const nodeData = getNodeByHandler(handler);
    const iconName = nodeData?.iconName || 'Plug';
    const IconComponent = ICON_MAP[iconName] || Plug;
    return <IconComponent size={size} />;
}

/**
 * Get all nodes as an array
 * @returns {Array} Array of node definitions
 */
export function getAllNodes() {
    return Object.values(NODE_REGISTRY);
}

/**
 * Get nodes grouped by category
 * @returns {object} Object with category names as keys and arrays of nodes as values
 */
export function getNodesByCategory() {
    const grouped = {};
    for (const node of Object.values(NODE_REGISTRY)) {
        if (!grouped[node.category]) {
            grouped[node.category] = [];
        }
        grouped[node.category].push(node);
    }
    return grouped;
}

/**
 * Get all available handler keys
 * @returns {Array<string>} Array of handler keys
 */
export function getAvailableHandlers() {
    return Object.keys(NODE_REGISTRY);
}

/**
 * Check if a handler is valid/supported
 * @param {string} handler - The handler key to check
 * @returns {boolean}
 */
export function isValidHandler(handler) {
    return handler && NODE_REGISTRY.hasOwnProperty(handler);
}

/**
 * Get display label for a handler (for backward compatibility)
 * @param {string} handler - The handler key
 * @returns {string} Display label
 */
export function getDisplayLabel(handler) {
    const node = getNodeByHandler(handler);
    if (node) return node.label;

    // Fallback: prettify the handler key
    return handler
        .replace(/([a-z0-9])([A-Z])/g, '$1 $2')
        .replace(/[_-]/g, ' ')
        .split(' ')
        .map(w => w.charAt(0).toUpperCase() + w.slice(1))
        .join(' ');
}

/**
 * Get icon component for sidebar display (with className support)
 * @param {string} handler - The handler key
 * @param {string} className - CSS class name
 * @returns {React.Element}
 */
export function getSidebarIcon(handler, className = 'w-4 h-4') {
    const nodeData = getNodeByHandler(handler);
    const iconName = nodeData?.iconName || 'Plug';
    const IconComponent = ICON_MAP[iconName] || Plug;
    return <IconComponent className={className} />;
}
