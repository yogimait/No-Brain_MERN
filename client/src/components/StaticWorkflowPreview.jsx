import { useMemo } from "react";
import { Brain, Database, FileText, Zap, Globe, Mail, Code, Settings } from "lucide-react";

/**
 * StaticWorkflowPreview - Shows a static visual representation of the workflow
 * as it appears on the canvas, without execution animations
 */
const StaticWorkflowPreview = ({ workflow, compact = false }) => {
    const graph = workflow?.graph || { nodes: [], edges: [] };
    const nodes = graph.nodes || [];
    const edges = graph.edges || [];

    // Get icon for node type
    const getNodeIcon = (label) => {
        const labelLower = (label || '').toLowerCase();
        if (labelLower.includes('database') || labelLower.includes('data')) return Database;
        if (labelLower.includes('text') || labelLower.includes('file') || labelLower.includes('document')) return FileText;
        if (labelLower.includes('ai') || labelLower.includes('transform')) return Zap;
        if (labelLower.includes('web') || labelLower.includes('scraper') || labelLower.includes('http')) return Globe;
        if (labelLower.includes('email') || labelLower.includes('mail')) return Mail;
        if (labelLower.includes('code') || labelLower.includes('script')) return Code;
        if (labelLower.includes('config') || labelLower.includes('setting')) return Settings;
        return Brain;
    };

    // Get color for node type
    const getNodeColor = (label) => {
        const labelLower = (label || '').toLowerCase();
        if (labelLower.includes('database') || labelLower.includes('data')) return { bg: 'bg-purple-500/20', border: 'border-purple-500/50', text: 'text-purple-400' };
        if (labelLower.includes('text') || labelLower.includes('file')) return { bg: 'bg-blue-500/20', border: 'border-blue-500/50', text: 'text-blue-400' };
        if (labelLower.includes('ai') || labelLower.includes('transform')) return { bg: 'bg-yellow-500/20', border: 'border-yellow-500/50', text: 'text-yellow-400' };
        if (labelLower.includes('web') || labelLower.includes('scraper')) return { bg: 'bg-green-500/20', border: 'border-green-500/50', text: 'text-green-400' };
        if (labelLower.includes('email') || labelLower.includes('mail')) return { bg: 'bg-red-500/20', border: 'border-red-500/50', text: 'text-red-400' };
        return { bg: 'bg-cyan-500/20', border: 'border-cyan-500/50', text: 'text-cyan-400' };
    };

    // Calculate positions for nodes (simple horizontal layout)
    const nodePositions = useMemo(() => {
        if (nodes.length === 0) return [];

        const positions = [];
        const cols = Math.min(nodes.length, compact ? 3 : 5);
        const rows = Math.ceil(nodes.length / cols);

        nodes.forEach((node, idx) => {
            const col = idx % cols;
            const row = Math.floor(idx / cols);
            positions.push({
                node,
                x: (col + 0.5) / cols,
                y: (row + 0.5) / rows,
                col,
                row
            });
        });

        return positions;
    }, [nodes, compact]);

    // Calculate edge connections
    const edgeConnections = useMemo(() => {
        return edges.map(edge => {
            const sourcePos = nodePositions.find(p => p.node.id === edge.source);
            const targetPos = nodePositions.find(p => p.node.id === edge.target);
            return { edge, sourcePos, targetPos };
        }).filter(e => e.sourcePos && e.targetPos);
    }, [edges, nodePositions]);

    if (nodes.length === 0) {
        return (
            <div className="h-full flex items-center justify-center">
                <p className="text-xs text-gray-500">No nodes</p>
            </div>
        );
    }

    const nodeSize = compact ? 'w-16 h-10' : 'w-24 h-14';
    const fontSize = compact ? 'text-[9px]' : 'text-xs';
    const iconSize = compact ? 'w-3 h-3' : 'w-4 h-4';

    return (
        <div className="relative w-full h-full min-h-[120px]">
            {/* SVG for connections */}
            <svg className="absolute inset-0 w-full h-full pointer-events-none">
                {edgeConnections.map(({ edge, sourcePos, targetPos }, idx) => {
                    const x1 = sourcePos.x * 100;
                    const y1 = sourcePos.y * 100;
                    const x2 = targetPos.x * 100;
                    const y2 = targetPos.y * 100;

                    return (
                        <line
                            key={idx}
                            x1={`${x1}%`}
                            y1={`${y1}%`}
                            x2={`${x2}%`}
                            y2={`${y2}%`}
                            stroke="rgba(34, 211, 238, 0.3)"
                            strokeWidth="2"
                            strokeDasharray="4 2"
                        />
                    );
                })}
            </svg>

            {/* Nodes */}
            {nodePositions.map(({ node, x, y }, idx) => {
                const label = node.data?.label || node.type || 'Node';
                const Icon = getNodeIcon(label);
                const colors = getNodeColor(label);

                return (
                    <div
                        key={node.id || idx}
                        className={`absolute transform -translate-x-1/2 -translate-y-1/2 ${nodeSize} ${colors.bg} ${colors.border} border rounded-lg flex flex-col items-center justify-center gap-1 transition-all hover:scale-105`}
                        style={{
                            left: `${x * 100}%`,
                            top: `${y * 100}%`,
                        }}
                    >
                        <Icon className={`${iconSize} ${colors.text}`} />
                        <span className={`${fontSize} text-gray-300 truncate max-w-[90%] px-1`}>
                            {label.length > 12 ? label.substring(0, 10) + '...' : label}
                        </span>
                    </div>
                );
            })}
        </div>
    );
};

export default StaticWorkflowPreview;
