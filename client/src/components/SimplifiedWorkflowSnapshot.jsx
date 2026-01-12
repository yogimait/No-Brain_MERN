import { Brain } from "lucide-react";

/**
 * SimplifiedWorkflowSnapshot - Lightweight visual representation for non-hovered workflow tiles
 * Shows a static view with node icons and status indicator
 */
const SimplifiedWorkflowSnapshot = ({ workflow }) => {
    const graph = workflow.graph || { nodes: [], edges: [] };
    const nodeCount = graph.nodes?.length || 0;
    const edgeCount = graph.edges?.length || 0;

    // Get unique node types for display
    const nodeTypes = [...new Set(graph.nodes?.map(n => n.data?.label || n.type) || [])].slice(0, 4);

    // Determine status color
    const getStatusColor = () => {
        if (workflow.lastExecution?.status === 'completed') return 'bg-green-500';
        if (workflow.lastExecution?.status === 'running') return 'bg-yellow-500 animate-pulse';
        if (workflow.lastExecution?.status === 'failed') return 'bg-red-500';
        return 'bg-gray-500';
    };

    return (
        <div className="h-full flex flex-col justify-between p-2">
            {/* Node icons visualization */}
            <div className="flex items-center justify-center flex-1">
                <div className="flex items-center gap-1">
                    {nodeTypes.map((type, idx) => (
                        <div key={idx} className="relative">
                            <div className="w-8 h-8 rounded-lg bg-gray-800/80 border border-gray-700/50 flex items-center justify-center">
                                <Brain className="w-4 h-4 text-cyan-400/70" />
                            </div>
                            {idx < nodeTypes.length - 1 && (
                                <div className="absolute top-1/2 -right-1 w-2 h-0.5 bg-cyan-500/30" />
                            )}
                        </div>
                    ))}
                    {nodeCount > 4 && (
                        <div className="w-8 h-8 rounded-lg bg-gray-800/60 border border-gray-700/30 flex items-center justify-center">
                            <span className="text-xs text-gray-500">+{nodeCount - 4}</span>
                        </div>
                    )}
                </div>
            </div>

            {/* Status bar */}
            <div className="flex items-center justify-between mt-2 pt-2 border-t border-gray-700/30">
                <div className="flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full ${getStatusColor()}`} />
                    <span className="text-xs text-gray-400">{nodeCount} nodes</span>
                </div>
                <span className="text-xs text-gray-500">{edgeCount} links</span>
            </div>
        </div>
    );
};

export default SimplifiedWorkflowSnapshot;
