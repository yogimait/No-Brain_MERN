// Map between human readable labels and backend handler keys
export const nodeLabelToHandler = {
  'AI Summarizer': 'aiSummarizer',
  'Web Scraper': 'webScraper',
  'Slack Message': 'slackSender',
  'Data Fetcher': 'dataFetcher',
  'Content Polisher': 'contentPolisher',
  'AI Text Generator': 'aiTextGenerator',
  'Sentiment Analyzer': 'sentimentAnalyzer',
  'Email Generator': 'emailGenerator',
  'AI Agent': 'aiSummarizer',
  'Gemini API': 'aiSummarizer',
  'GPT-4': 'aiSummarizer',
  'Claude': 'aiSummarizer',
  'Text Processor': 'textProcessor',
  'Image Processor': 'imageProcessor',
  'Data Transformer': 'dataTransformer',
  'Condition Check': 'conditionCheck',
  'Delay': 'delay',
  'Schedule': 'schedule',
  'Loop': 'loop',
  'Merge': 'merge',
  'Twitter API': 'twitterApi',
  'LinkedIn API': 'linkedinApi',
  'Instagram API': 'instagramApi',
  'Email Service': 'emailGenerator',
  'RSS Feed': 'rssFeed',
  'Webhook': 'webhook',
  'Database': 'database',
  'File Upload': 'fileUpload',
};

export function mapLabelToHandler(label) {
  // If label is already a handler key, return it
  if (!label) return 'dataFetcher';
  if (typeof label !== 'string') return 'dataFetcher';
  if (Object.values(nodeLabelToHandler).includes(label)) return label;
  // Normalize
  const normalized = label.trim();
  return nodeLabelToHandler[normalized] || 'dataFetcher';
}
