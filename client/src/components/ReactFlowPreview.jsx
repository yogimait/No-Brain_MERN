import { useMemo } from "react";
import ReactFlow, {
    Background,
    Controls,
    Handle,
    Position
} from "reactflow";
import "reactflow/dist/style.css";
import { Brain, Database, FileText, Zap, Globe, Mail, Code, Settings, Plug } from "lucide-react";

/**
 * Custom Node component for the preview
 */
const PreviewNode = ({ data }) => {
    const getIcon = () => {
        const label = (data.label || '').toLowerCase();
        if (label.includes('database') || label.includes('data')) return <Database className="w-4 h-4" />;
        if (label.includes('text') || label.includes('file')) return <FileText className="w-4 h-4" />;
        if (label.includes('ai') || label.includes('summar') || label.includes('transform')) return <Zap className="w-4 h-4" />;
        if (label.includes('web') || label.includes('scraper') || label.includes('http') || label.includes('rss')) return <Globe className="w-4 h-4" />;
        if (label.includes('email') || label.includes('mail')) return <Mail className="w-4 h-4" />;
        if (label.includes('code') || label.includes('script')) return <Code className="w-4 h-4" />;
        if (label.includes('instagram') || label.includes('twitter') || label.includes('linkedin')) return <Plug className="w-4 h-4" />;
        return <Brain className="w-4 h-4" />;
    };

    const getColor = () => {
        const label = (data.label || '').toLowerCase();
        if (label.includes('database') || label.includes('data')) return { bg: 'bg-purple-500/30', border: 'border-purple-500', text: 'text-purple-300' };
        if (label.includes('text') || label.includes('file') || label.includes('processor')) return { bg: 'bg-blue-500/30', border: 'border-blue-500', text: 'text-blue-300' };
        if (label.includes('ai') || label.includes('summar') || label.includes('transform')) return { bg: 'bg-yellow-500/30', border: 'border-yellow-500', text: 'text-yellow-300' };
        if (label.includes('web') || label.includes('scraper') || label.includes('rss')) return { bg: 'bg-green-500/30', border: 'border-green-500', text: 'text-green-300' };
        if (label.includes('email') || label.includes('mail')) return { bg: 'bg-red-500/30', border: 'border-red-500', text: 'text-red-300' };
        if (label.includes('instagram')) return { bg: 'bg-pink-500/30', border: 'border-pink-500', text: 'text-pink-300' };
        return { bg: 'bg-cyan-500/30', border: 'border-cyan-500', text: 'text-cyan-300' };
    };

    const colors = getColor();

    return (
        <div className={`px-3 py-2 rounded-lg ${colors.bg} border ${colors.border} shadow-lg min-w-[100px]`}>
            <Handle type="target" position={Position.Left} className="!w-2 !h-2 !bg-cyan-400" />
            <div className="flex items-center gap-2">
                <span className={colors.text}>{getIcon()}</span>
                <span className={`text-xs font-medium ${colors.text}`}>
                    {data.label || 'Node'}
                </span>
            </div>
            <Handle type="source" position={Position.Right} className="!w-2 !h-2 !bg-cyan-400" />
        </div>
    );
};

// Node types for React Flow
const nodeTypes = {
    custom: PreviewNode,
    default: PreviewNode,
};

// Add all known handler types to use PreviewNode
const knownHandlers = [
    'dataFetcher', 'webScraper', 'aiSummarizer', 'contentPolisher',
    'aiTextGenerator', 'sentimentAnalyzer', 'emailGenerator', 'slackMessage',
    'twitterApi', 'instagramApi', 'linkedinApi', 'rssFeed', 'webhook',
    'database', 'fileUpload', 'textProcessor', 'imageProcessor', 'dataTransformer',
    'conditionCheck', 'delay', 'schedule', 'loop', 'merge', 'geminiApi', 'gpt4', 'claude'
];

knownHandlers.forEach(handler => {
    nodeTypes[handler] = PreviewNode;
});

/**
 * ReactFlowPreview - Renders actual React Flow canvas in read-only mode
 * This shows the exact nodes and edges as created by the user
 * Uses key prop on ReactFlow to force re-render when workflow changes
 */
const ReactFlowPreview = ({ workflow, compact = false }) => {
    const graph = workflow?.graph || { nodes: [], edges: [] };
    const workflowId = workflow?._id || 'default';

    // Process nodes to ensure they have the right format for React Flow
    const nodes = useMemo(() => {
        return (graph.nodes || []).map((node, idx) => ({
            id: node.id || `node-${idx}`,
            type: node.type || 'custom',
            position: node.position || { x: 100 + idx * 200, y: 100 },
            data: {
                label: node.data?.label || node.label || node.type || 'Node',
                ...node.data
            }
        }));
    }, [graph.nodes]);

    // Process edges with proper styling
    const edges = useMemo(() => {
        return (graph.edges || []).map((edge, idx) => ({
            id: edge.id || `edge-${idx}`,
            source: edge.source,
            target: edge.target,
            type: 'smoothstep',
            animated: true,
            style: {
                stroke: '#22d3ee',
                strokeWidth: 2
            }
        }));
    }, [graph.edges]);

    // Calculate initial viewport to fit all nodes
    const defaultViewport = useMemo(() => {
        if (nodes.length === 0) return { x: 0, y: 0, zoom: 1 };

        const xs = nodes.map(n => n.position.x);
        const ys = nodes.map(n => n.position.y);
        const minX = Math.min(...xs);
        const maxX = Math.max(...xs);
        const minY = Math.min(...ys);
        const maxY = Math.max(...ys);

        const centerX = (minX + maxX) / 2;
        const centerY = (minY + maxY) / 2;

        // Offset to center the nodes
        return {
            x: -centerX + 200,
            y: -centerY + 80,
            zoom: compact ? 0.6 : 0.7
        };
    }, [nodes, compact]);

    if (nodes.length === 0) {
        return (
            <div className="h-full flex items-center justify-center">
                <p className="text-sm text-gray-500">No nodes in this workflow</p>
            </div>
        );
    }

    return (
        <div className="w-full h-full" style={{ minHeight: compact ? '120px' : '180px' }}>
            {/* Key prop forces React Flow to re-render when workflow changes */}
            <ReactFlow
                key={workflowId}
                nodes={nodes}
                edges={edges}
                nodeTypes={nodeTypes}
                defaultViewport={defaultViewport}
                fitView
                fitViewOptions={{ padding: 0.3 }}
                nodesDraggable={false}
                nodesConnectable={false}
                elementsSelectable={false}
                panOnDrag={!compact}
                zoomOnScroll={!compact}
                zoomOnPinch={!compact}
                preventScrolling={true}
                proOptions={{ hideAttribution: true }}
            >
                <Background color="#374151" gap={16} size={1} />
                {!compact && <Controls showInteractive={false} />}
            </ReactFlow>
        </div>
    );
};

export default ReactFlowPreview;
