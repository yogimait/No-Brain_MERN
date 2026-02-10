// server/src/agents/__tests__/agentPlanner.test.js
// Unit tests for Agent Planner

import { planWorkflow, getAvailableNodeTypes, isValidNodeType, getNodeById } from '../agentPlanner.js';
import { createAgentContext } from '../agentContext.js';

describe('AgentPlanner', () => {
    describe('planWorkflow', () => {
        test('should return empty array for no actions', () => {
            const intent = { actions: [], sources: [], outputs: [] };
            const result = planWorkflow(intent);

            expect(result).toEqual([]);
        });

        test('should match fetch action to dataFetcher', () => {
            const intent = {
                actions: [{ type: 'fetch', confidence: 0.9 }],
                sources: [],
                outputs: []
            };
            const result = planWorkflow(intent);

            expect(result.length).toBeGreaterThan(0);
            expect(result.some(n => n.nodeId === 'dataFetcher' || n.category === 'input')).toBe(true);
        });

        test('should match summarize action to aiSummarizer', () => {
            const intent = {
                actions: [{ type: 'summarize', confidence: 0.9 }],
                sources: [],
                outputs: []
            };
            const result = planWorkflow(intent);

            expect(result.some(n => n.nodeId === 'aiSummarizer')).toBe(true);
        });

        test('should add default input if missing', () => {
            const intent = {
                actions: [{ type: 'summarize', confidence: 0.9 }],
                sources: [],
                outputs: []
            };
            const result = planWorkflow(intent);

            // Should have an input node (default)
            expect(result.some(n => n.category === 'input')).toBe(true);
        });

        test('should add default output if missing', () => {
            const intent = {
                actions: [{ type: 'fetch', confidence: 0.9 }],
                sources: [],
                outputs: []
            };
            const result = planWorkflow(intent);

            // Should have an output node (default)
            expect(result.some(n => n.category === 'output')).toBe(true);
        });

        test('should map explicit outputs to nodes', () => {
            const intent = {
                actions: [{ type: 'fetch', confidence: 0.9 }],
                sources: [],
                outputs: ['email']
            };
            const result = planWorkflow(intent);

            expect(result.some(n => n.nodeId === 'emailGenerator')).toBe(true);
        });

        test('should order nodes by category', () => {
            const intent = {
                actions: [
                    { type: 'email', confidence: 0.9 },
                    { type: 'fetch', confidence: 0.9 },
                    { type: 'summarize', confidence: 0.9 }
                ],
                sources: [],
                outputs: []
            };
            const result = planWorkflow(intent);

            // Find category positions
            const inputIndex = result.findIndex(n => n.category === 'input');
            const processIndex = result.findIndex(n => n.category === 'process');
            const outputIndex = result.findIndex(n => n.category === 'output');

            // Input should come before process if both exist
            if (inputIndex >= 0 && processIndex >= 0) {
                expect(inputIndex).toBeLessThan(processIndex);
            }
            // Process should come before output if both exist
            if (processIndex >= 0 && outputIndex >= 0) {
                expect(processIndex).toBeLessThan(outputIndex);
            }
        });

        test('should include reason for each node', () => {
            const intent = {
                actions: [{ type: 'fetch', confidence: 0.9 }],
                sources: [],
                outputs: []
            };
            const result = planWorkflow(intent);

            result.forEach(node => {
                expect(node).toHaveProperty('reason');
                expect(typeof node.reason).toBe('string');
            });
        });

        test('should log decisions when context provided', () => {
            const context = createAgentContext('test prompt');
            const intent = {
                actions: [{ type: 'fetch', confidence: 0.9 }],
                sources: [],
                outputs: []
            };

            planWorkflow(intent, context);

            expect(context.decisions.length).toBeGreaterThan(0);
            expect(context.decisions.some(d => d.stage === 'planner')).toBe(true);
        });
    });

    describe('getAvailableNodeTypes', () => {
        test('should return array of node IDs', () => {
            const types = getAvailableNodeTypes();

            expect(Array.isArray(types)).toBe(true);
            expect(types.length).toBeGreaterThan(0);
            expect(types).toContain('dataFetcher');
            expect(types).toContain('aiSummarizer');
        });
    });

    describe('isValidNodeType', () => {
        test('should return true for valid types', () => {
            expect(isValidNodeType('dataFetcher')).toBe(true);
            expect(isValidNodeType('aiSummarizer')).toBe(true);
        });

        test('should return false for invalid types', () => {
            expect(isValidNodeType('nonExistentNode')).toBe(false);
            expect(isValidNodeType('')).toBe(false);
        });
    });

    describe('getNodeById', () => {
        test('should return node definition for valid ID', () => {
            const node = getNodeById('dataFetcher');

            expect(node).not.toBeNull();
            expect(node.id).toBe('dataFetcher');
            expect(node.category).toBe('input');
        });

        test('should return null for invalid ID', () => {
            const node = getNodeById('invalidNode');
            expect(node).toBeNull();
        });
    });
});
