import { useState, useMemo, useRef, useCallback, useEffect } from 'react';
import {
  Zap,
  ZoomIn,
  ZoomOut,
  Maximize2,
  Brain,
  GitBranch
} from 'lucide-react';

/**
 * WorkflowPipeline Component — v2: Static Workflow Structure Viewer
 * 🔴 Execution simulation removed in NoBrain v2.
 * Shows workflow nodes in a grid layout with structure info (no execution status).
 */
export default function WorkflowPipeline({ workflow }) {
  const graph = workflow?.graph || { nodes: [], edges: [] };
  const nodes = graph.nodes || [];
  const edges = graph.edges || [];

  // Pan and Zoom state
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const containerRef = useRef(null);

  // Simple grid-based layout
  const { nodePositions, containerWidth, containerHeight } = useMemo(() => {
    if (nodes.length === 0) {
      return { nodePositions: new Map(), containerWidth: 1000, containerHeight: 500 };
    }

    const positions = new Map();
    const horizontalSpacing = 320;
    const verticalSpacing = 180;
    const nodesPerRow = Math.min(3, Math.ceil(Math.sqrt(nodes.length)));

    nodes.forEach((node, index) => {
      const row = Math.floor(index / nodesPerRow);
      const col = index % nodesPerRow;
      positions.set(node.id, { x: col * horizontalSpacing, y: row * verticalSpacing });
    });

    const rows = Math.ceil(nodes.length / nodesPerRow);
    return {
      nodePositions: positions,
      containerWidth: Math.min(nodesPerRow * horizontalSpacing, 1200),
      containerHeight: Math.max(rows * verticalSpacing, 400)
    };
  }, [nodes]);

  // Build execution order for display numbering
  const executionOrder = useMemo(() => {
    if (nodes.length === 0) return [];
    const inDegree = new Map();
    nodes.forEach(n => inDegree.set(n.id, 0));
    edges.forEach(e => {
      const current = inDegree.get(e.target) || 0;
      inDegree.set(e.target, current + 1);
    });

    const order = [];
    const queue = [];
    const visited = new Set();

    inDegree.forEach((degree, nodeId) => {
      if (degree === 0) queue.push(nodeId);
    });

    while (queue.length > 0) {
      const nodeId = queue.shift();
      if (visited.has(nodeId)) continue;
      visited.add(nodeId);
      order.push(nodeId);

      edges.forEach(edge => {
        if (edge.source === nodeId) {
          const newDegree = (inDegree.get(edge.target) || 0) - 1;
          inDegree.set(edge.target, newDegree);
          if (newDegree === 0 && !visited.has(edge.target)) queue.push(edge.target);
        }
      });
    }

    nodes.forEach(n => { if (!visited.has(n.id)) order.push(n.id); });
    return order;
  }, [nodes, edges]);

  // Pan handlers
  const handleMouseDown = useCallback((e) => {
    if (e.target === containerRef.current || e.target.closest('.pan-area')) {
      if (e.button !== 0) return;
      setIsDragging(true);
      setDragStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
      e.preventDefault();
    }
  }, [pan]);

  const handleMouseMove = useCallback((e) => {
    if (!isDragging) return;
    setPan({ x: e.clientX - dragStart.x, y: e.clientY - dragStart.y });
  }, [isDragging, dragStart]);

  const handleMouseUp = useCallback(() => setIsDragging(false), []);

  const handleWheel = useCallback((e) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? -0.1 : 0.1;
    setZoom(prev => Math.max(0.3, Math.min(2, prev + delta)));
  }, []);

  const handleZoomIn = useCallback(() => setZoom(prev => Math.min(2, prev + 0.2)), []);
  const handleZoomOut = useCallback(() => setZoom(prev => Math.max(0.3, prev - 0.2)), []);
  const handleResetView = useCallback(() => { setZoom(1); setPan({ x: 0, y: 0 }); }, []);

  useEffect(() => {
    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
      return () => {
        window.removeEventListener('mousemove', handleMouseMove);
        window.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isDragging, handleMouseMove, handleMouseUp]);

  if (nodes.length === 0) {
    return (
      <div className="text-center py-8 text-gray-400">
        <p>No nodes in this workflow</p>
      </div>
    );
  }

  // Count node connections
  const getConnectionCount = (nodeId) => {
    const incoming = edges.filter(e => e.target === nodeId).length;
    const outgoing = edges.filter(e => e.source === nodeId).length;
    return { incoming, outgoing };
  };

  return (
    <div className="w-full space-y-4">
      {/* Structure Header */}
      <div className="bg-gradient-to-r from-gray-900/80 to-gray-800/80 rounded-lg border border-gray-700/50 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="relative">
              <Brain className="w-5 h-5 text-cyan-400" />
            </div>
            <div>
              <p className="text-sm font-bold text-white">WORKFLOW STRUCTURE</p>
              <p className="text-xs text-gray-400 font-mono">
                {nodes.length} nodes • {edges.length} connections
              </p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 bg-cyan-500/20 px-3 py-1.5 rounded border border-cyan-500/30">
              <GitBranch className="w-4 h-4 text-cyan-400" />
              <span className="text-xs font-semibold text-cyan-400">{edges.length} Edges</span>
            </div>
            <div className="flex items-center gap-2 bg-blue-500/20 px-3 py-1.5 rounded border border-blue-500/30">
              <Zap className="w-4 h-4 text-blue-400" />
              <span className="text-xs font-semibold text-blue-400">{nodes.length} Steps</span>
            </div>
          </div>
        </div>
      </div>

      {/* Canvas Layout — Pan & Zoom */}
      <div
        ref={containerRef}
        className="relative bg-gray-950/50 rounded-lg border border-gray-700/50 overflow-hidden min-h-[400px] custom-scrollbar"
        onMouseDown={handleMouseDown}
        onWheel={handleWheel}
        style={{ cursor: isDragging ? 'grabbing' : 'grab', userSelect: 'none' }}
      >
        {/* Zoom Controls */}
        <div className="absolute top-4 right-4 z-20 flex flex-col gap-2">
          <button onClick={handleZoomIn} className="bg-gray-800/90 hover:bg-gray-700 border border-gray-600 rounded-lg p-2 text-gray-300 hover:text-white transition-all" title="Zoom In">
            <ZoomIn className="w-4 h-4" />
          </button>
          <button onClick={handleZoomOut} className="bg-gray-800/90 hover:bg-gray-700 border border-gray-600 rounded-lg p-2 text-gray-300 hover:text-white transition-all" title="Zoom Out">
            <ZoomOut className="w-4 h-4" />
          </button>
          <button onClick={handleResetView} className="bg-gray-800/90 hover:bg-gray-700 border border-gray-600 rounded-lg p-2 text-gray-300 hover:text-white transition-all" title="Reset View">
            <Maximize2 className="w-4 h-4" />
          </button>
        </div>

        {/* Zoom Indicator */}
        <div className="absolute top-4 left-4 z-20 bg-gray-800/90 border border-gray-600 rounded-lg px-3 py-1.5">
          <span className="text-xs font-mono text-gray-300">{Math.round(zoom * 100)}%</span>
        </div>

        {/* Node Cards — Static Structure */}
        <div
          className="relative w-full h-full pan-area"
          style={{ width: '100%', height: '100%', minHeight: '500px' }}
        >
          <div
            className="pan-area"
            style={{
              position: 'absolute',
              left: '50%',
              top: '50%',
              transform: `translate(calc(-50% + ${pan.x}px), calc(-50% + ${pan.y}px)) scale(${zoom})`,
              transformOrigin: 'center center',
              transition: isDragging ? 'none' : 'transform 0.1s ease-out',
              width: `${containerWidth}px`,
              height: `${containerHeight}px`
            }}
          >
            {nodes.map((node) => {
              const position = nodePositions.get(node.id) || { x: 0, y: 0 };
              const nodeLabel = node.data?.label || node.id;
              const stepNumber = executionOrder.indexOf(node.id) + 1;
              const connections = getConnectionCount(node.id);

              return (
                <div
                  key={node.id}
                  className="absolute rounded-lg border-2 transition-all duration-300 bg-gray-800/50 border-cyan-500/40 shadow-md hover:z-20 hover:shadow-xl hover:shadow-cyan-500/20 hover:border-cyan-400/60"
                  style={{
                    left: `${position.x}px`,
                    top: `${position.y}px`,
                    width: '280px',
                    minWidth: '280px',
                    pointerEvents: 'auto'
                  }}
                  onMouseDown={(e) => e.stopPropagation()}
                >
                  {/* Step Header */}
                  <div className="flex items-center justify-between p-3 border-b border-gray-700/50">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-full flex items-center justify-center font-bold text-xs bg-cyan-500 text-white">
                        {stepNumber}
                      </div>
                      <span className="text-xs font-semibold text-cyan-300 truncate max-w-[160px]">
                        {nodeLabel}
                      </span>
                    </div>
                    <div className="flex items-center gap-1 bg-gray-700/50 px-2 py-0.5 rounded">
                      <span className="text-[10px] font-medium text-gray-400">Step {stepNumber}</span>
                    </div>
                  </div>

                  {/* Node Info */}
                  <div className="p-4">
                    <p className="text-xs text-gray-400 mb-2">
                      {connections.incoming} input{connections.incoming !== 1 ? 's' : ''} • {connections.outgoing} output{connections.outgoing !== 1 ? 's' : ''}
                    </p>
                    <p className="text-xs text-gray-500">
                      Type: {node.data?.handlerType || node.type || 'custom'}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Structure Summary */}
      <div className="bg-gray-900/50 rounded-lg border border-gray-700/50 p-4">
        <div className="flex items-center gap-2 mb-3">
          <Brain className="w-4 h-4 text-cyan-400" />
          <p className="text-sm font-semibold text-gray-300">WORKFLOW SUMMARY</p>
        </div>
        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <p className="text-2xl font-bold text-white">{nodes.length}</p>
            <p className="text-xs text-gray-500">Total Steps</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-white">{edges.length}</p>
            <p className="text-xs text-gray-500">Connections</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-white">{executionOrder.length > 0 ? executionOrder.length : '—'}</p>
            <p className="text-xs text-gray-500">Step Order</p>
          </div>
        </div>
      </div>

      {/* CSS for custom scrollbar */}
      <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 8px; height: 8px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: rgba(31, 41, 55, 0.5); border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: linear-gradient(180deg, #06b6d4 0%, #3b82f6 100%); border-radius: 10px; border: 1px solid rgba(6, 182, 212, 0.3); }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: linear-gradient(180deg, #0891b2 0%, #2563eb 100%); }
        .custom-scrollbar::-webkit-scrollbar-corner { background: rgba(31, 41, 55, 0.5); }
        .custom-scrollbar { scrollbar-width: thin; scrollbar-color: #06b6d4 rgba(31, 41, 55, 0.5); }
      `}</style>
    </div>
  );
}