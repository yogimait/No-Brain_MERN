import { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import {
  CheckCircle,
  XCircle,
  Loader2,
  Clock,
  Activity,
  Zap,
  TrendingUp,
  RotateCw,
  ZoomIn,
  ZoomOut,
  Maximize2
} from 'lucide-react';
import { executionAPI } from '../services/api';

// Node status types
const NODE_STATUS = {
  PENDING: 'pending',
  RUNNING: 'running',
  COMPLETED: 'completed',
  FAILED: 'failed'
};

// Workflow Pipeline Component - Running Work Status Board with Flowchart Layout
export default function WorkflowPipeline({ workflow }) {
  const [executionStatus, setExecutionStatus] = useState(null);
  const [nodeStatuses, setNodeStatuses] = useState({});
  const [loading, setLoading] = useState(true);
  const [simulationCycle, setSimulationCycle] = useState(0);
  const [activeSteps, setActiveSteps] = useState([]);
  const [executionOrder, setExecutionOrder] = useState([]);
  const [executionLog, setExecutionLog] = useState([]);

  // Pan and Zoom state
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const containerRef = useRef(null);

  const graph = workflow?.graph || { nodes: [], edges: [] };
  const nodes = graph.nodes || [];
  const edges = graph.edges || [];

  // Fetch latest execution for this workflow
  useEffect(() => {
    const fetchExecutionStatus = async () => {
      try {
        if (!workflow?._id) {
          setLoading(false);
          return;
        }
        const response = await executionAPI.getByWorkflow(workflow._id, { limit: 1 });
        if (response && response.success && response.data) {
          const executions = Array.isArray(response.data)
            ? response.data
            : (response.data.executions || []);
          if (executions.length > 0) {
            setExecutionStatus(executions[0]);
          }
        }
      } catch (error) {
        console.error('Error fetching execution status:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchExecutionStatus();
  }, [workflow?._id]);

  // When a real execution is present, map node logs to statuses to update the UI
  useEffect(() => {
    if (!executionStatus || !executionStatus.nodeLogs) return;

    const logs = executionStatus.nodeLogs || executionStatus.logs || [];
    const statusMap = {};
    logs.forEach((log) => {
      const nodeId = log.nodeId || log.nodeId;
      const status = log.status === 'failed' || log.status === 'error' ? NODE_STATUS.FAILED : (log.status === 'running' ? NODE_STATUS.RUNNING : NODE_STATUS.COMPLETED);
      if (nodeId) statusMap[nodeId] = status;
    });

    // Set unfound nodes to pending
    nodes.forEach(node => {
      if (!statusMap[node.id]) statusMap[node.id] = NODE_STATUS.PENDING;
    });

    setNodeStatuses(statusMap);
    setLoading(false);
  }, [executionStatus]);

  // Simple grid-based layout to ensure no overlapping
  const { nodePositions, containerWidth, containerHeight } = useMemo(() => {
    if (nodes.length === 0) {
      return {
        nodePositions: new Map(),
        containerWidth: 1000,
        containerHeight: 500
      };
    }

    const positions = new Map();
    const nodeWidth = 280;
    const nodeHeight = 140;
    const horizontalSpacing = 320;
    const verticalSpacing = 180;

    // Simple grid layout - 3 nodes per row maximum
    const nodesPerRow = Math.min(3, Math.ceil(Math.sqrt(nodes.length)));

    nodes.forEach((node, index) => {
      const row = Math.floor(index / nodesPerRow);
      const col = index % nodesPerRow;

      const x = col * horizontalSpacing;
      const y = row * verticalSpacing;

      positions.set(node.id, { x, y });
    });

    // Calculate container size based on grid
    const rows = Math.ceil(nodes.length / nodesPerRow);
    const containerWidth = Math.min(nodesPerRow * horizontalSpacing, 1200);
    const containerHeight = Math.max(rows * verticalSpacing, 400);

    return {
      nodePositions: positions,
      containerWidth,
      containerHeight
    };
  }, [nodes]);

  // Build execution order
  const { executionOrder: order } = useMemo(() => {
    if (nodes.length === 0) {
      return { executionOrder: [] };
    }

    const nodeMap = new Map();
    const inDegree = new Map();

    nodes.forEach(node => {
      nodeMap.set(node.id, node);
      inDegree.set(node.id, 0);
    });

    edges.forEach(edge => {
      const current = inDegree.get(edge.target) || 0;
      inDegree.set(edge.target, current + 1);
    });

    const order = [];
    const queue = [];
    const visited = new Set();

    // Find starting nodes
    inDegree.forEach((degree, nodeId) => {
      if (degree === 0) {
        queue.push(nodeId);
      }
    });

    // Build execution order
    while (queue.length > 0) {
      const nodeId = queue.shift();
      if (visited.has(nodeId)) continue;

      visited.add(nodeId);
      order.push(nodeId);

      edges.forEach(edge => {
        if (edge.source === nodeId) {
          const newDegree = (inDegree.get(edge.target) || 0) - 1;
          inDegree.set(edge.target, newDegree);
          if (newDegree === 0 && !visited.has(edge.target)) {
            queue.push(edge.target);
          }
        }
      });
    }

    nodes.forEach(node => {
      if (!visited.has(node.id)) {
        order.push(node.id);
      }
    });

    return { executionOrder: order };
  }, [nodes, edges]);

  // Simulate running work status
  useEffect(() => {
    if (nodes.length === 0 || loading || order.length === 0) return;

    setExecutionOrder(order);

    const initialStatuses = {};
    nodes.forEach(node => {
      initialStatuses[node.id] = NODE_STATUS.PENDING;
    });
    setNodeStatuses(initialStatuses);

    let completedSteps = [];
    let runningSteps = [];
    let stepIndex = 0;
    const nodeFailures = new Map();
    let cycleComplete = false;

    const simulateExecution = () => {
      const newStatuses = {};
      const newLog = [];

      // Initialize all nodes
      nodes.forEach(node => {
        newStatuses[node.id] = NODE_STATUS.PENDING;
      });

      // Mark completed steps as green
      completedSteps.forEach(nodeId => {
        const node = nodes.find(n => n.id === nodeId);
        if (!node) return;

        if (!nodeFailures.has(nodeId)) {
          nodeFailures.set(nodeId, Math.random() < 0.1);
        }
        const shouldFail = nodeFailures.get(nodeId);
        newStatuses[nodeId] = shouldFail ? NODE_STATUS.FAILED : NODE_STATUS.COMPLETED;
      });

      // Mark running steps as yellow
      runningSteps.forEach(nodeId => {
        newStatuses[nodeId] = NODE_STATUS.RUNNING;
        const node = nodes.find(n => n.id === nodeId);
        if (node) {
          newLog.push({
            nodeId,
            nodeName: node.data?.label || nodeId,
            status: NODE_STATUS.RUNNING,
            timestamp: new Date(),
            message: 'Processing...'
          });
        }
      });

      setNodeStatuses(newStatuses);
      setActiveSteps([...runningSteps]);

      // Update log
      if (newLog.length > 0) {
        setExecutionLog(prev => [...prev, ...newLog].slice(-15));
      }

      // Move execution forward
      if (stepIndex < order.length) {
        // Complete previous running steps
        runningSteps.forEach(nodeId => {
          completedSteps.push(nodeId);
        });

        // Start next batch of steps
        runningSteps = [];
        const batchSize = Math.min(2, order.length - stepIndex);

        for (let i = 0; i < batchSize && stepIndex < order.length; i++) {
          runningSteps.push(order[stepIndex]);
          stepIndex++;
        }
      } else {
        // Cycle complete
        cycleComplete = true;
        completedSteps.forEach(nodeId => {
          const node = nodes.find(n => n.id === nodeId);
          if (node) {
            setExecutionLog(prev => [...prev, {
              nodeId,
              nodeName: node.data?.label || nodeId,
              status: NODE_STATUS.COMPLETED,
              timestamp: new Date(),
              message: 'One work done'
            }].slice(-15));
          }
        });

        // Add cycle completion message
        setExecutionLog(prev => [...prev, {
          nodeId: 'cycle',
          nodeName: 'Workflow Cycle',
          status: 'completed',
          timestamp: new Date(),
          message: 'Another yet to trigger...'
        }].slice(-15));

        // Reset for next cycle
        setTimeout(() => {
          completedSteps = [];
          runningSteps = [];
          stepIndex = 0;
          nodeFailures.clear();
          cycleComplete = false;
          setSimulationCycle(prev => prev + 1);
        }, 3000);
      }

      if (!cycleComplete) {
        setTimeout(simulateExecution, 2500);
      }
    };

    const startTimeout = setTimeout(simulateExecution, 1000);
    return () => clearTimeout(startTimeout);
  }, [nodes, edges, loading, simulationCycle, order]);

  const getNodeStatus = (nodeId) => {
    return nodeStatuses[nodeId] || NODE_STATUS.PENDING;
  };

  const getStatusColor = (status) => {
    switch (status) {
      case NODE_STATUS.COMPLETED:
        return {
          bg: 'bg-green-500/10',
          border: 'border-green-500',
          text: 'text-green-400',
          icon: 'text-green-500',
          pulse: false
        };
      case NODE_STATUS.FAILED:
        return {
          bg: 'bg-red-500/10',
          border: 'border-red-500',
          text: 'text-red-400',
          icon: 'text-red-500',
          pulse: false
        };
      case NODE_STATUS.RUNNING:
        return {
          bg: 'bg-yellow-500/10',
          border: 'border-yellow-500',
          text: 'text-yellow-400',
          icon: 'text-yellow-500',
          pulse: true
        };
      default:
        return {
          bg: 'bg-gray-800/50',
          border: 'border-gray-600',
          text: 'text-gray-400',
          icon: 'text-gray-500',
          pulse: false
        };
    }
  };

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
    setPan({
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y
    });
  }, [isDragging, dragStart]);

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  // Zoom handlers
  const handleWheel = useCallback((e) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? -0.1 : 0.1;
    setZoom(prev => Math.max(0.3, Math.min(2, prev + delta)));
  }, []);

  const handleZoomIn = useCallback(() => {
    setZoom(prev => Math.min(2, prev + 0.2));
  }, []);

  const handleZoomOut = useCallback(() => {
    setZoom(prev => Math.max(0.3, prev - 0.2));
  }, []);

  const handleResetView = useCallback(() => {
    setZoom(1);
    setPan({ x: 0, y: 0 });
  }, []);

  // Attach mouse event listeners
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

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="w-6 h-6 text-blue-400 animate-spin" />
        <span className="ml-2 text-gray-400">Loading workflow status...</span>
      </div>
    );
  }

  if (nodes.length === 0) {
    return (
      <div className="text-center py-8 text-gray-400">
        <p>No nodes in this workflow</p>
      </div>
    );
  }

  const completedCount = Object.values(nodeStatuses).filter(s => s === NODE_STATUS.COMPLETED).length;
  const runningCount = Object.values(nodeStatuses).filter(s => s === NODE_STATUS.RUNNING).length;

  return (
    <div className="w-full space-y-4">
      {/* Execution Header */}
      <div className="bg-gradient-to-r from-gray-900/80 to-gray-800/80 rounded-lg border border-gray-700/50 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="relative">
              <Activity className="w-5 h-5 text-blue-400 animate-pulse" />
              <div className="absolute -top-1 -right-1 w-2 h-2 bg-green-500 rounded-full animate-ping" />
            </div>
            <div>
              <p className="text-sm font-bold text-white">EXECUTION STATUS</p>
              <p className="text-xs text-gray-400 font-mono">
                Cycle #{simulationCycle + 1} • {completedCount} Complete • {runningCount} Running
              </p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 bg-green-500/20 px-3 py-1.5 rounded border border-green-500/30">
              <CheckCircle className="w-4 h-4 text-green-400" />
              <span className="text-xs font-semibold text-green-400">{completedCount} Done</span>
            </div>
            <div className="flex items-center gap-2 bg-yellow-500/20 px-3 py-1.5 rounded border border-yellow-500/30">
              <Loader2 className="w-4 h-4 text-yellow-400 animate-spin" />
              <span className="text-xs font-semibold text-yellow-400">{runningCount} Ongoing</span>
            </div>
          </div>
        </div>
      </div>

      {/* Canvas Layout with Status Cards - Pan & Zoom */}
      <div
        ref={containerRef}
        className="relative bg-gray-950/50 rounded-lg border border-gray-700/50 overflow-hidden min-h-[400px] custom-scrollbar"
        onMouseDown={handleMouseDown}
        onWheel={handleWheel}
        style={{ cursor: isDragging ? 'grabbing' : 'grab', userSelect: 'none' }}
      >
        {/* Zoom Controls */}
        <div className="absolute top-4 right-4 z-20 flex flex-col gap-2">
          <button
            onClick={handleZoomIn}
            className="bg-gray-800/90 hover:bg-gray-700 border border-gray-600 rounded-lg p-2 text-gray-300 hover:text-white transition-all"
            title="Zoom In"
          >
            <ZoomIn className="w-4 h-4" />
          </button>
          <button
            onClick={handleZoomOut}
            className="bg-gray-800/90 hover:bg-gray-700 border border-gray-600 rounded-lg p-2 text-gray-300 hover:text-white transition-all"
            title="Zoom Out"
          >
            <ZoomOut className="w-4 h-4" />
          </button>
          <button
            onClick={handleResetView}
            className="bg-gray-800/90 hover:bg-gray-700 border border-gray-600 rounded-lg p-2 text-gray-300 hover:text-white transition-all"
            title="Reset View"
          >
            <Maximize2 className="w-4 h-4" />
          </button>
        </div>

        {/* Zoom Indicator */}
        <div className="absolute top-4 left-4 z-20 bg-gray-800/90 border border-gray-600 rounded-lg px-3 py-1.5">
          <span className="text-xs font-mono text-gray-300">
            {Math.round(zoom * 100)}%
          </span>
        </div>

        {/* Status Cards Container - Transformable with Pan & Zoom */}
        <div
          className="relative w-full h-full pan-area"
          style={{
            width: '100%',
            height: '100%',
            minHeight: '500px'
          }}
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
              const nodeStatus = getNodeStatus(node.id);
              const nodeLabel = node.data?.label || node.id;
              const statusColors = getStatusColor(nodeStatus);
              const isActive = activeSteps.includes(node.id);
              const progress = nodeStatus === NODE_STATUS.COMPLETED ? 100 :
                nodeStatus === NODE_STATUS.RUNNING ? 75 : 0;

              return (
                <div
                  key={node.id}
                  className={`
                    absolute rounded-lg border-2 transition-all duration-300
                    ${statusColors.bg} ${statusColors.border}
                    ${isActive ? 'shadow-lg shadow-yellow-500/50 scale-105 z-10' : 'shadow-md'}
                    ${statusColors.pulse ? 'animate-pulse' : ''}
                    hover:z-20 hover:shadow-xl hover:shadow-blue-500/30
                  `}
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
                      <div className={`
                        w-7 h-7 rounded-full flex items-center justify-center font-bold text-xs
                        ${nodeStatus === NODE_STATUS.RUNNING ? 'bg-yellow-500 text-white' :
                          nodeStatus === NODE_STATUS.COMPLETED ? 'bg-green-500 text-white' :
                            nodeStatus === NODE_STATUS.FAILED ? 'bg-red-500 text-white' :
                              'bg-gray-700 text-gray-400'}
                      `}>
                        {nodeStatus === NODE_STATUS.RUNNING && <Loader2 className="w-4 h-4 animate-spin" />}
                        {nodeStatus === NODE_STATUS.COMPLETED && <CheckCircle className="w-4 h-4" />}
                        {nodeStatus === NODE_STATUS.FAILED && <XCircle className="w-4 h-4" />}
                        {nodeStatus === NODE_STATUS.PENDING && <Clock className="w-4 h-4" />}
                      </div>
                      <span className={`text-xs font-semibold ${statusColors.text} truncate max-w-[160px]`}>
                        {nodeLabel}
                      </span>
                    </div>
                    {isActive && (
                      <div className="flex items-center gap-1 bg-yellow-500/20 px-2 py-0.5 rounded">
                        <div className="w-1.5 h-1.5 bg-yellow-500 rounded-full animate-pulse" />
                        <span className="text-[10px] font-bold text-yellow-400">LIVE</span>
                      </div>
                    )}
                  </div>

                  {/* Node Content */}
                  <div className="p-4">
                    <p className="text-xs text-gray-400 mb-3 truncate">
                      {nodeStatus === NODE_STATUS.RUNNING && 'Processing in progress...'}
                      {nodeStatus === NODE_STATUS.COMPLETED && 'Execution completed successfully'}
                      {nodeStatus === NODE_STATUS.FAILED && 'Execution failed'}
                      {nodeStatus === NODE_STATUS.PENDING && 'Waiting for execution...'}
                    </p>

                    {/* Progress Bar */}
                    <div className="w-full bg-gray-700/50 rounded-full h-2 overflow-hidden">
                      <div
                        className={`
                          h-full rounded-full transition-all duration-500
                          ${nodeStatus === NODE_STATUS.COMPLETED ? 'bg-green-500' :
                            nodeStatus === NODE_STATUS.FAILED ? 'bg-red-500' :
                              nodeStatus === NODE_STATUS.RUNNING ? 'bg-yellow-500' :
                                'bg-gray-600'}
                        `}
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Execution Log - Recent Activity */}
      <div className="bg-gray-900/50 rounded-lg border border-gray-700/50 p-4">
        <div className="flex items-center gap-2 mb-3">
          <RotateCw className="w-4 h-4 text-blue-400" />
          <p className="text-sm font-semibold text-gray-300">RECENT ACTIVITY</p>
        </div>
        <div className="space-y-2 max-h-32 overflow-y-auto custom-scrollbar">
          {executionLog.length === 0 ? (
            <p className="text-xs text-gray-500 text-center py-2">No activity yet</p>
          ) : (
            executionLog.slice().reverse().map((log, idx) => (
              <div
                key={idx}
                className="flex items-center gap-2 text-xs bg-gray-800/50 rounded px-2 py-1.5"
              >
                <div className={`
                  w-1.5 h-1.5 rounded-full
                  ${log.status === NODE_STATUS.COMPLETED ? 'bg-green-500' :
                    log.status === NODE_STATUS.FAILED ? 'bg-red-500' :
                      log.status === NODE_STATUS.RUNNING ? 'bg-yellow-500 animate-pulse' :
                        'bg-gray-500'}
                `} />
                <span className="text-gray-400 font-mono">
                  {log.timestamp.toLocaleTimeString()}
                </span>
                <span className="text-gray-300">
                  {log.nodeName}
                </span>
                {log.message && (
                  <span className="text-gray-400 italic">
                    - {log.message}
                  </span>
                )}
                <span className={`
                  ml-auto font-semibold
                  ${log.status === NODE_STATUS.COMPLETED ? 'text-green-400' :
                    log.status === NODE_STATUS.FAILED ? 'text-red-400' :
                      log.status === NODE_STATUS.RUNNING ? 'text-yellow-400' :
                        'text-gray-400'}
                `}>
                  {log.status.toUpperCase()}
                </span>
              </div>
            ))
          )}
        </div>
      </div>

      {/* CSS for custom scrollbar and line clamp */}
      <style>{`
        /* Custom Scrollbar Styling */
        .custom-scrollbar::-webkit-scrollbar {
          width: 8px;
          height: 8px;
        }
        
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(31, 41, 55, 0.5);
          border-radius: 10px;
        }
        
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: linear-gradient(180deg, #3b82f6 0%, #6366f1 100%);
          border-radius: 10px;
          border: 1px solid rgba(59, 130, 246, 0.3);
        }
        
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: linear-gradient(180deg, #2563eb 0%, #4f46e5 100%);
        }
        
        .custom-scrollbar::-webkit-scrollbar-corner {
          background: rgba(31, 41, 55, 0.5);
        }
        
        /* Firefox scrollbar */
        .custom-scrollbar {
          scrollbar-width: thin;
          scrollbar-color: #3b82f6 rgba(31, 41, 55, 0.5);
        }
      `}</style>
    </div>
  );
}