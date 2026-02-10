// server/src/agents/constants.js
// Centralized constants for the agentic workflow system

/**
 * Intent confidence threshold - actions below this are dropped
 * Lowered from 0.4 to 0.25 for better UX with casual prompts
 */
export const INTENT_CONFIDENCE_THRESHOLD = 0.25;

/**
 * API version for response versioning
 */
export const API_VERSION = 'agentic-v1';

/**
 * Default nodes for fallback scenarios
 */
export const DEFAULT_INPUT_NODE = 'dataFetcher';
export const DEFAULT_OUTPUT_NODE = 'outputLogger';
export const DEFAULT_PROCESS_NODE = 'dataTransformer';

/**
 * Category order for pipeline assembly
 */
export const CATEGORY_ORDER = ['input', 'process', 'output'];

/**
 * Node positioning constants
 */
export const NODE_SPACING_X = 250;
export const NODE_POSITION_Y = {
    input: 100,
    process: 200,
    output: 100
};
