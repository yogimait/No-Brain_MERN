// Map between human readable labels and backend handler keys
// Map between human readable labels and backend handler keys
const RAW_NODE_LABEL_TO_HANDLER = {
  'ai summarizer': 'aiSummarizer',
  'web scraper': 'webScraper',
  'slack message': 'slackSender',
  'data fetcher': 'dataFetcher',
  'content polisher': 'contentPolisher',
  'ai text generator': 'aiTextGenerator',
  'sentiment analyzer': 'sentimentAnalyzer',
  'email generator': 'emailGenerator',
  'ai agent': 'aiSummarizer',
  'gemini api': 'aiSummarizer',
  'gpt-4': 'aiSummarizer',
  'claude': 'aiSummarizer',
  'text processor': 'textProcessor',
  'image processor': 'imageProcessor',
  'data transformer': 'dataTransformer',
  'condition check': 'conditionCheck',
  'delay': 'delay',
  'schedule': 'schedule',
  'loop': 'loop',
  'merge': 'merge',
  'twitter api': 'twitterApi',
  's3 upload': 's3Upload',
  's3': 's3Upload',
  'sms': 'smsSender',
  'sms sender': 'smsSender',
  'google sheets': 'googleSheets',
  'sheets': 'googleSheets',
  'calendar': 'calendarEvent',
  'calendar event': 'calendarEvent',
  'pagerduty': 'pagerDuty',
  'pager duty': 'pagerDuty',
  'linkedin api': 'linkedinApi',
  'instagram api': 'instagramApi',
  'email service': 'emailGenerator',
  'rss feed': 'rssFeed',
  'rss': 'rssFeed',
  'webhook': 'webhook',
  'database': 'database',
  'file upload': 'fileUpload',
  'file uploader': 'fileUpload',
  'data transformer': 'dataTransformer'
};

// Build normalized map (lowercase keys)
export const nodeLabelToHandler = Object.freeze(
  Object.keys(RAW_NODE_LABEL_TO_HANDLER).reduce((acc, k) => {
    acc[k.toLowerCase()] = RAW_NODE_LABEL_TO_HANDLER[k];
    return acc;
  }, {})
);

// Authoritative metadata for handler keys (preferred display labels, future icons)
export const handlerToNodeMeta = Object.freeze({
  dataFetcher: { label: 'Data Fetcher' },
  webScraper: { label: 'Web Scraper' },
  aiSummarizer: { label: 'AI Summarizer' },
  slackSender: { label: 'Slack Message' },
  contentPolisher: { label: 'Content Polisher' },
  aiTextGenerator: { label: 'AI Text Generator' },
  sentimentAnalyzer: { label: 'Sentiment Analyzer' },
  emailGenerator: { label: 'Email Generator' },
  twitterApi: { label: 'X API' },
  linkedinApi: { label: 'LinkedIn API' },
  instagramApi: { label: 'Instagram API' },
  database: { label: 'Database' },
  fileUpload: { label: 'File Upload' },
  s3Upload: { label: 'S3 Upload' },
  smsSender: { label: 'SMS Sender' },
  googleSheets: { label: 'Google Sheets' },
  calendarEvent: { label: 'Calendar Event' },
  pagerDuty: { label: 'PagerDuty' },
  dataTransformer: { label: 'Data Transformer' },
  conditionCheck: { label: 'Condition Check' },
  delay: { label: 'Delay' },
  schedule: { label: 'Schedule' },
  loop: { label: 'Loop' },
  merge: { label: 'Merge' }
});

export function getHandlerMeta(handlerKey) {
  if (!handlerKey || typeof handlerKey !== 'string') return null;
  if (handlerToNodeMeta[handlerKey]) return handlerToNodeMeta[handlerKey];
  // fallback to some sensible default label
  const pretty = handlerKey
    .replace(/([a-z0-9])([A-Z])/g, '$1 $2') // camelCase to spaces
    .replace(/[_-]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
  return { label: pretty.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ') };
}

export function mapLabelToHandler(label) {
  if (!label) return 'dataFetcher';
  if (typeof label !== 'string') return 'dataFetcher';

  const normalized = label.trim().toLowerCase();

  // If label is already a known handler key, return it
  const knownHandlers = new Set(Object.values(nodeLabelToHandler));
  if (knownHandlers.has(normalized)) return normalized;

  // Direct match
  if (nodeLabelToHandler[normalized]) return nodeLabelToHandler[normalized];

  // Try to match by partial words (e.g., 'rss' -> 'rssFeed')
  for (const key of Object.keys(nodeLabelToHandler)) {
    if (normalized.includes(key)) return nodeLabelToHandler[key];
  }

  return 'dataFetcher';
}

// Given a handler key like 'aiSummarizer' or 'rssFeed', return a human-friendly display label.
export function mapHandlerToDisplayLabel(handlerKey) {
  if (!handlerKey || typeof handlerKey !== 'string') return 'AI Node';

  // Prefer authoritative metadata label
  const meta = getHandlerMeta(handlerKey);
  if (meta && meta.label) return meta.label;

  // First try to find a label that maps to this handler
  for (const [labelKey, handler] of Object.entries(nodeLabelToHandler)) {
    if (handler === handlerKey) {
      // Return the original labelKey but in Title Case
      return labelKey.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
    }
  }

  // Fallback: prettify handlerKey (camelCase or snake_case)
  const pretty = handlerKey
    .replace(/([a-z0-9])([A-Z])/g, '$1 $2') // camelCase to spaces
    .replace(/[_-]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

  return pretty.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
}
