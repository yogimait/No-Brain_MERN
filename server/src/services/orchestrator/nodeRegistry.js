// server/src/services/orchestrator/nodeRegistry.js

import aiSummarizerHandler from './handlers/aiSummarizer.handler.js';
import slackSenderHandler from './handlers/slackSender.handler.js';
import dataFetcherHandler from './handlers/dataFetcher.handler.js';
import webScraperHandler from './handlers/webScraper.handler.js';
import sentimentAnalyzerHandler from './handlers/sentimentAnalyzer.handler.js';
import contentPolisherHandler from './handlers/contentPolisher.handler.js';
import aiTextGeneratorHandler from './handlers/aiTextGenerator.handler.js';
import textProcessorHandler from './handlers/textProcessor.handler.js';
import imageProcessorHandler from './handlers/imageProcessor.handler.js';
import emailGeneratorHandler from './handlers/emailGenerator.handler.js';
import webhookHandler from './handlers/webhook.handler.js';
import rssFeedHandler from './handlers/rssFeed.handler.js';
import twitterApiHandler from './handlers/twitterApi.handler.js';
import linkedinApiHandler from './handlers/linkedinApi.handler.js';
import instagramApiHandler from './handlers/instagramApi.handler.js';
import databaseHandler from './handlers/database.handler.js';
import fileUploadHandler from './handlers/fileUpload.handler.js';
import dataTransformerHandler from './handlers/dataTransformer.handler.js';
import conditionCheckHandler from './handlers/conditionCheck.handler.js';
import delayHandler from './handlers/delay.handler.js';
import scheduleHandler from './handlers/schedule.handler.js';
import loopHandler from './handlers/loop.handler.js';
import mergeHandler from './handlers/merge.handler.js';

/**
 * Node Registry - Central registry of all node handlers
 * Maps node type to its execution handler
 * 
 * To add a new node type:
 * 1. Create handler in handlers/ folder
 * 2. Import it here
 * 3. Add to nodeHandlers object
 */

const nodeHandlers = {
  dataFetcher: dataFetcherHandler,
  aiSummarizer: aiSummarizerHandler,
  slackSender: slackSenderHandler,
  webScraper: webScraperHandler,
  sentimentAnalyzer: sentimentAnalyzerHandler,
  contentPolisher: contentPolisherHandler,
  aiTextGenerator: aiTextGeneratorHandler,
  textProcessor: textProcessorHandler,
  imageProcessor: imageProcessorHandler,
  emailGenerator: emailGeneratorHandler,
  webhook: webhookHandler,
  rssFeed: rssFeedHandler,
  twitterApi: twitterApiHandler,
  linkedinApi: linkedinApiHandler,
  instagramApi: instagramApiHandler,
  database: databaseHandler,
  fileUpload: fileUploadHandler,
  dataTransformer: dataTransformerHandler,
  conditionCheck: conditionCheckHandler,
  delay: delayHandler,
  schedule: scheduleHandler,
  loop: loopHandler,
  merge: mergeHandler,
  
  // Add more node types here as you build them:
  // webScraper: webScraperHandler,
  // emailSender: emailSenderHandler,
  // imageGenerator: imageGeneratorHandler,
};

/**
 * Get handler function for a node type
 * @param {string} nodeType - Type of node (e.g., 'aiSummarizer')
 * @returns {Function|null} - Handler function or null if not found
 */
function getNodeHandler(nodeType) {
  const handler = nodeHandlers[nodeType];
  
  if (!handler) {
    console.warn(`⚠️  No handler found for node type: ${nodeType}`);
    return null;
  }
  
  return handler;
}

/**
 * Get list of all available node types
 * @returns {Array<string>} - Array of node type names
 */
function getAvailableNodeTypes() {
  return Object.keys(nodeHandlers);
}

/**
 * Check if a node type is supported
 * @param {string} nodeType - Type to check
 * @returns {boolean}
 */
function isNodeTypeSupported(nodeType) {
  return nodeHandlers.hasOwnProperty(nodeType);
}

export {
  getNodeHandler,
  getAvailableNodeTypes,
  isNodeTypeSupported
};
