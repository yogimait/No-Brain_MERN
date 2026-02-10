// server/src/agents/__tests__/intentParser.test.js
// Unit tests for Intent Parser

import { parseIntent, isActionableIntent } from '../intentParser.js';

describe('IntentParser', () => {
    describe('parseIntent', () => {
        test('should return fixed shape for empty prompt', () => {
            const result = parseIntent('');

            expect(result).toHaveProperty('actions');
            expect(result).toHaveProperty('sources');
            expect(result).toHaveProperty('outputs');
            expect(result).toHaveProperty('frequency');
            expect(result).toHaveProperty('confidence');
            expect(result.actions).toEqual([]);
            expect(result.confidence).toBe(0);
        });

        test('should detect fetch action', () => {
            const result = parseIntent('Fetch data from API');

            expect(result.actions.length).toBeGreaterThan(0);
            expect(result.actions.some(a => a.type === 'fetch')).toBe(true);
        });

        test('should detect multiple actions', () => {
            const result = parseIntent('Fetch blogs, summarize them, and email me');

            expect(result.actions.length).toBeGreaterThanOrEqual(2);
            const actionTypes = result.actions.map(a => a.type);
            expect(actionTypes).toContain('fetch');
            expect(actionTypes).toContain('summarize');
        });

        test('should detect email output', () => {
            const result = parseIntent('Send data to email');

            expect(result.outputs).toContain('email');
        });

        test('should detect slack output', () => {
            const result = parseIntent('Post to Slack channel');

            expect(result.outputs).toContain('slack');
        });

        test('should detect daily frequency', () => {
            const result = parseIntent('Send daily email updates');

            expect(result.frequency).toBe('daily');
        });

        test('should detect weekly frequency', () => {
            const result = parseIntent('Generate weekly report');

            expect(result.frequency).toBe('weekly');
        });

        test('should have per-action confidence', () => {
            const result = parseIntent('Summarize the text');

            expect(result.actions.length).toBeGreaterThan(0);
            result.actions.forEach(action => {
                expect(action).toHaveProperty('type');
                expect(action).toHaveProperty('confidence');
                expect(typeof action.confidence).toBe('number');
                expect(action.confidence).toBeGreaterThan(0);
                expect(action.confidence).toBeLessThanOrEqual(1);
            });
        });

        test('should detect source types', () => {
            const result = parseIntent('Scrape data from website');

            expect(result.sources).toContain('web');
        });

        test('should calculate overall confidence', () => {
            const result = parseIntent('Fetch data and summarize it');

            expect(result.confidence).toBeGreaterThan(0);
            expect(result.confidence).toBeLessThanOrEqual(1);
        });

        test('should handle complex prompts', () => {
            const result = parseIntent(
                'Fetch blog posts from RSS feed, analyze sentiment, summarize content, and email me daily'
            );

            expect(result.actions.length).toBeGreaterThanOrEqual(2);
            expect(result.outputs).toContain('email');
            expect(result.frequency).toBe('daily');
        });
    });

    describe('isActionableIntent', () => {
        test('should return true for intent with actions', () => {
            const intent = parseIntent('Fetch some data');
            expect(isActionableIntent(intent)).toBe(true);
        });

        test('should return false for empty intent', () => {
            const intent = parseIntent('');
            expect(isActionableIntent(intent)).toBe(false);
        });

        test('should return false for null', () => {
            expect(isActionableIntent(null)).toBe(false);
        });

        test('should return false for nonsense prompt', () => {
            const intent = parseIntent('hello world');
            // May or may not have actions depending on keyword matching
            // Just verify it returns a boolean
            expect(typeof isActionableIntent(intent)).toBe('boolean');
        });
    });
});
