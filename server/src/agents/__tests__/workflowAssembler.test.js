// server/src/agents/__tests__/workflowAssembler.test.js
// Unit tests for Workflow Assembler

import { assembleWorkflow, addNodeToWorkflow, removeNodeFromWorkflow } from '../workflowAssembler.js';

describe('WorkflowAssembler', () => {
    describe('assembleWorkflow', () => {
        test('should return empty workflow for empty plan', () => {
            const result = assembleWorkflow([]);

            expect(result.nodes).toEqual([]);
            expect(result.edges).toEqual([]);
            expect(result.metadata.nodeCount).toBe(0);
        });

        test('should create single node without edges', () => {
            const plan = [{
                nodeId: 'dataFetcher',
                label: 'Data Fetcher',
                category: 'input'
            }];

            const result = assembleWorkflow(plan);

            expect(result.nodes.length).toBe(1);
            expect(result.edges.length).toBe(0);
        });

        test('should create sequential edges for multiple nodes', () => {
            const plan = [
                { nodeId: 'dataFetcher', label: 'Data Fetcher', category: 'input' },
                { nodeId: 'aiSummarizer', label: 'AI Summarizer', category: 'process' },
                { nodeId: 'emailGenerator', label: 'Email Generator', category: 'output' }
            ];

            const result = assembleWorkflow(plan);

            expect(result.nodes.length).toBe(3);
            expect(result.edges.length).toBe(2);

            // Check edge connections
            expect(result.edges[0].source).toBe('1');
            expect(result.edges[0].target).toBe('2');
            expect(result.edges[1].source).toBe('2');
            expect(result.edges[1].target).toBe('3');
        });

        test('should use customNode type', () => {
            const plan = [{
                nodeId: 'dataFetcher',
                label: 'Data Fetcher',
                category: 'input'
            }];

            const result = assembleWorkflow(plan);

            expect(result.nodes[0].type).toBe('customNode');
        });

        test('should include nodeId in data', () => {
            const plan = [{
                nodeId: 'dataFetcher',
                label: 'Data Fetcher',
                category: 'input'
            }];

            const result = assembleWorkflow(plan);

            expect(result.nodes[0].data.nodeId).toBe('dataFetcher');
        });

        test('should assign positions to nodes', () => {
            const plan = [
                { nodeId: 'dataFetcher', label: 'Data Fetcher', category: 'input' },
                { nodeId: 'aiSummarizer', label: 'AI Summarizer', category: 'process' }
            ];

            const result = assembleWorkflow(plan);

            result.nodes.forEach(node => {
                expect(node.position).toHaveProperty('x');
                expect(node.position).toHaveProperty('y');
                expect(typeof node.position.x).toBe('number');
                expect(typeof node.position.y).toBe('number');
            });
        });

        test('should space nodes horizontally', () => {
            const plan = [
                { nodeId: 'dataFetcher', label: 'Data Fetcher', category: 'input' },
                { nodeId: 'aiSummarizer', label: 'AI Summarizer', category: 'process' }
            ];

            const result = assembleWorkflow(plan);

            expect(result.nodes[1].position.x).toBeGreaterThan(result.nodes[0].position.x);
        });

        test('should include metadata', () => {
            const plan = [{
                nodeId: 'dataFetcher',
                label: 'Data Fetcher',
                category: 'input'
            }];

            const result = assembleWorkflow(plan, null, { prompt: 'test' });

            expect(result.metadata.prompt).toBe('test');
            expect(result.metadata.nodeCount).toBe(1);
            expect(result.metadata).toHaveProperty('assembledAt');
        });
    });

    describe('addNodeToWorkflow', () => {
        test('should add node to workflow', () => {
            const workflow = {
                nodes: [{
                    id: '1',
                    type: 'customNode',
                    position: { x: 100, y: 100 },
                    data: { nodeId: 'dataFetcher', label: 'Data Fetcher', category: 'input' }
                }],
                edges: [],
                metadata: { nodeCount: 1 }
            };

            const newNode = {
                nodeId: 'aiSummarizer',
                label: 'AI Summarizer',
                category: 'process'
            };

            const result = addNodeToWorkflow(workflow, newNode);

            expect(result.nodes.length).toBe(2);
            expect(result.edges.length).toBe(1);
        });
    });

    describe('removeNodeFromWorkflow', () => {
        test('should remove node and rebuild edges', () => {
            const workflow = {
                nodes: [
                    { id: '1', type: 'customNode', position: { x: 100, y: 100 }, data: { category: 'input' } },
                    { id: '2', type: 'customNode', position: { x: 350, y: 200 }, data: { category: 'process' } }
                ],
                edges: [{ id: 'e1-2', source: '1', target: '2' }],
                metadata: { nodeCount: 2, edgeCount: 1 }
            };

            const result = removeNodeFromWorkflow(workflow, '2');

            expect(result.nodes.length).toBe(1);
            expect(result.edges.length).toBe(0);
        });
    });
});
