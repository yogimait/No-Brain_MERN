// server/src/agents/__tests__/workflowValidator.test.js
// Unit tests for Workflow Validator

import { validateWorkflow, autoRepairWorkflow, validateAndRepair } from '../workflowValidator.js';
import { createAgentContext } from '../agentContext.js';

describe('WorkflowValidator', () => {
    describe('validateWorkflow', () => {
        test('should return invalid for empty workflow', () => {
            const result = validateWorkflow({ nodes: [], edges: [] });

            expect(result.valid).toBe(false);
            expect(result.issues.some(i => i.type === 'no_nodes')).toBe(true);
        });

        test('should detect missing input node', () => {
            const workflow = {
                nodes: [{
                    id: '1',
                    type: 'customNode',
                    data: { category: 'output', nodeId: 'outputLogger' }
                }],
                edges: []
            };

            const result = validateWorkflow(workflow);

            expect(result.issues.some(i => i.type === 'no_input')).toBe(true);
        });

        test('should detect missing output node', () => {
            const workflow = {
                nodes: [{
                    id: '1',
                    type: 'customNode',
                    data: { category: 'input', nodeId: 'dataFetcher' }
                }],
                edges: []
            };

            const result = validateWorkflow(workflow);

            expect(result.issues.some(i => i.type === 'no_output')).toBe(true);
        });

        test('should pass valid workflow', () => {
            const workflow = {
                nodes: [
                    { id: '1', type: 'customNode', data: { category: 'input', nodeId: 'dataFetcher' } },
                    { id: '2', type: 'customNode', data: { category: 'output', nodeId: 'outputLogger' } }
                ],
                edges: [{ source: '1', target: '2' }]
            };

            const result = validateWorkflow(workflow);

            expect(result.valid).toBe(true);
            expect(result.issues.length).toBe(0);
        });

        test('should detect duplicate process nodes', () => {
            const workflow = {
                nodes: [
                    { id: '1', type: 'customNode', data: { category: 'input', nodeId: 'dataFetcher' } },
                    { id: '2', type: 'customNode', data: { category: 'process', nodeId: 'aiSummarizer' } },
                    { id: '3', type: 'customNode', data: { category: 'process', nodeId: 'aiSummarizer' } },
                    { id: '4', type: 'customNode', data: { category: 'output', nodeId: 'outputLogger' } }
                ],
                edges: [
                    { source: '1', target: '2' },
                    { source: '2', target: '3' },
                    { source: '3', target: '4' }
                ]
            };

            const result = validateWorkflow(workflow);

            expect(result.issues.some(i => i.type === 'duplicate_nodes')).toBe(true);
        });
    });

    describe('autoRepairWorkflow', () => {
        test('should add missing input node', () => {
            const workflow = {
                nodes: [{
                    id: '1',
                    type: 'customNode',
                    position: { x: 100, y: 100 },
                    data: { category: 'process', nodeId: 'aiSummarizer', label: 'AI Summarizer' }
                }],
                edges: [],
                metadata: {}
            };

            const context = createAgentContext('test');
            const result = autoRepairWorkflow(workflow, context);

            expect(result.repaired).toBe(true);
            expect(result.repairs.length).toBeGreaterThan(0);
        });

        test('should add missing output node', () => {
            const workflow = {
                nodes: [{
                    id: '1',
                    type: 'customNode',
                    position: { x: 100, y: 100 },
                    data: { category: 'input', nodeId: 'dataFetcher', label: 'Data Fetcher' }
                }],
                edges: [],
                metadata: {}
            };

            const context = createAgentContext('test');
            const result = autoRepairWorkflow(workflow, context);

            expect(result.repaired).toBe(true);
        });

        test('should not repair valid workflow', () => {
            const workflow = {
                nodes: [
                    { id: '1', type: 'customNode', position: { x: 100, y: 100 }, data: { category: 'input', nodeId: 'dataFetcher' } },
                    { id: '2', type: 'customNode', position: { x: 350, y: 100 }, data: { category: 'output', nodeId: 'outputLogger' } }
                ],
                edges: [{ source: '1', target: '2' }],
                metadata: {}
            };

            const result = autoRepairWorkflow(workflow);

            expect(result.repaired).toBe(false);
            expect(result.repairs.length).toBe(0);
        });
    });

    describe('validateAndRepair', () => {
        test('should return valid workflow after repair', () => {
            const workflow = {
                nodes: [{
                    id: '1',
                    type: 'customNode',
                    position: { x: 100, y: 200 },
                    data: { category: 'process', nodeId: 'aiSummarizer', label: 'AI Summarizer' }
                }],
                edges: [],
                metadata: {}
            };

            const context = createAgentContext('test');
            const result = validateAndRepair(workflow, context);

            // After repair, should have input and output nodes
            expect(result.workflow.nodes.some(n => n.data.category === 'input')).toBe(true);
            expect(result.workflow.nodes.some(n => n.data.category === 'output')).toBe(true);
        });

        test('should log decisions to context', () => {
            const workflow = {
                nodes: [],
                edges: [],
                metadata: {}
            };

            const context = createAgentContext('test');
            validateAndRepair(workflow, context);

            expect(context.decisions.some(d => d.stage === 'validator')).toBe(true);
        });
    });
});
