import ReactFlow, {
  MiniMap,
  Controls,
  Background,
  addEdge,
  useReactFlow,
  Handle,
  Position,
  applyNodeChanges,
  applyEdgeChanges,
  Panel,
  MarkerType
} from 'reactflow';
import 'reactflow/dist/style.css';
import { useCallback, useMemo, useState } from 'react';
import { getNodeByHandler, getIconForHandler, getAvailableHandlers, isValidHandler, getDisplayLabel } from '../services/nodeRegistry.jsx';
import { mapLabelToHandler } from '../services/nodeTypeMap';
import { Card } from '../components/ui/card';
import { X, Trash2, Wand2 } from 'lucide-react';
import { ConfirmationDialog } from './ui/confirmation-dialog';
import dagre from 'dagre';

// --- Dagre Layout Setup ---
const getLayoutedElements = (nodes, edges, direction = 'LR') => {
  const dagreGraph = new dagre.graphlib.Graph();
  dagreGraph.setDefaultEdgeLabel(() => ({}));
  dagreGraph.setGraph({ rankdir: direction, ranksep: 120, nodesep: 80 });

  nodes.forEach((node) => {
    dagreGraph.setNode(node.id, { width: 250, height: 80 });
  });

  edges.forEach((edge) => {
    dagreGraph.setEdge(edge.source, edge.target);
  });

  dagre.layout(dagreGraph);

  nodes.forEach((node) => {
    const nodeWithPosition = dagreGraph.node(node.id);
    node.targetPosition = direction === 'LR' ? Position.Left : Position.Top;
    node.sourcePosition = direction === 'LR' ? Position.Right : Position.Bottom;

    node.position = {
      x: nodeWithPosition.x - 250 / 2,
      y: nodeWithPosition.y - 80 / 2,
    };
  });

  return { nodes, edges };
};

// --- Custom Node Component ---
const CustomNode = ({ id, data, selected = false }) => {
  const handleDelete = (event) => {
    event.stopPropagation();
    if (data.onDelete) data.onDelete(id);
  };

  // Determine type styling
  const isTrigger = data.type === 'trigger' || data.label?.toLowerCase().includes('trigger') || data.category === 'Triggers';
  const isAction = data.type === 'action' || data.category === 'Actions' || data.category === 'Platforms';
  
  const typeLabel = isTrigger ? 'Trigger' : (isAction ? 'Action' : 'Logic');
  
  const typeColors = {
    trigger: 'border-l-emerald-500 bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    logic: 'border-l-cyan-500 bg-cyan-500/10 text-cyan-400 border-cyan-500/20',
    action: 'border-l-purple-500 bg-purple-500/10 text-purple-400 border-purple-500/20'
  };
  
  const borderClass = isTrigger ? 'border-l-emerald-500' : (isAction ? 'border-l-purple-500' : 'border-l-cyan-500');
  const badgeColor = isTrigger ? typeColors.trigger : (isAction ? typeColors.action : typeColors.logic);

  return (
    <div className={`
      relative p-3 min-w-[220px] bg-[#151C33] flex flex-col justify-center cursor-pointer 
      transition-all duration-300 border-y border-r border-soft shadow-sm rounded-lg
      animate-node-mount 
      border-l-[3px] ${borderClass}
      hover:shadow-md hover:border-r-primary/50 hover:border-y-primary/50
      ${selected ? 'scale-[1.02] shadow-[0_8px_30px_rgba(0,0,0,0.5)] border-r-primary/80 border-y-primary/80 z-50' : ''}
    `}>
      <Handle type="target" position={Position.Left} className="!w-2 !h-2 !bg-muted-foreground !border-none transition-all hover:shadow-[0_0_10px_var(--accent-primary)] hover:scale-125 hover:bg-white" />
      
      <div className="flex items-center gap-3">
        {/* Icon */}
        <div className={`p-2 rounded-md ${badgeColor.split(' ')[1]} ${badgeColor.split(' ')[2]}`}>
          {data.icon}
        </div>
        
        {/* Texts */}
        <div className="flex flex-col flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2">
            <span className="font-semibold text-foreground text-sm truncate">{data.label}</span>
            <span className={`text-[9px] px-1.5 py-0.5 rounded border uppercase tracking-wider font-semibold ${badgeColor}`}>
              {typeLabel}
            </span>
          </div>
          {data.description && (
            <span className="text-xs text-muted-foreground truncate opacity-80 mt-0.5" title={data.description}>{data.description}</span>
          )}
        </div>
      </div>

      <Handle type="source" position={Position.Right} className="!w-2 !h-2 !bg-primary !border-none transition-all hover:shadow-[0_0_10px_var(--accent-primary)] hover:scale-125 hover:bg-white" />

      {selected && (
        <button
          onClick={handleDelete}
          className="absolute -top-3 -right-3 p-1.5 bg-destructive rounded-full text-destructive-foreground hover:bg-destructive/90 transition-colors z-10 shadow-lg"
          aria-label="Remove node"
        >
          <X size={12} />
        </button>
      )}
    </div>
  );
};

// Build nodeTypes mapping dynamically from the centralized registry
const allHandlers = getAvailableHandlers();
const nodeTypes = allHandlers.reduce((acc, handler) => {
  acc[handler] = CustomNode;
  return acc;
}, { custom: CustomNode });

export default function WorkflowCanvas({ nodes, setNodes, edges, setEdges, onNodeClick }) {
  const reactFlowInstance = useReactFlow();
  const [showClearDialog, setShowClearDialog] = useState(false);

  const onNodesChange = useCallback((changes) => setNodes((nds) => applyNodeChanges(changes, nds)), [setNodes]);
  const onEdgesChange = useCallback((changes) => setEdges((eds) => applyEdgeChanges(changes, eds)), [setEdges]);
  const onConnect = useCallback((params) => setEdges((eds) => addEdge({ ...params, type: 'step' }, eds)), [setEdges]);
  const onNodeClickHandler = useCallback((event, node) => onNodeClick(node.id), [onNodeClick]);

  const onDeleteNode = useCallback((nodeId) => {
    setNodes((nds) => nds.filter((node) => node.id !== nodeId));
    setEdges((eds) => eds.filter((edge) => edge.source !== nodeId && edge.target !== nodeId));
  }, [setNodes, setEdges]);

  const handleClearAll = useCallback(() => {
    setShowClearDialog(true);
  }, []);

  const confirmClearAll = useCallback(() => {
    setNodes([]);
    setEdges([]);
    setShowClearDialog(false);
  }, [setNodes, setEdges]);

  // Dagre Auto-Layout triggering
  const onLayout = useCallback(() => {
    const { nodes: layoutedNodes, edges: layoutedEdges } = getLayoutedElements(nodes, edges);
    setNodes([...layoutedNodes]);
    setEdges([...layoutedEdges]);
    window.requestAnimationFrame(() => {
      reactFlowInstance.fitView({ padding: 0.2, duration: 800 });
    });
  }, [nodes, edges, setNodes, setEdges, reactFlowInstance]);

  const onDragOver = useCallback((event) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  }, []);

  const onDrop = useCallback((event) => {
    event.preventDefault();
    const type = event.dataTransfer.getData('application/reactflow');
    if (typeof type === 'undefined' || !type) return;

    const position = reactFlowInstance.screenToFlowPosition({ x: event.clientX, y: event.clientY });

    // Parse specific node data passed from Sidebar (which contains full JSON object)
    let nodeDataRaw = event.dataTransfer.getData('application/json');
    let parsedNodeData = null;
    let desc = '';
    let category = '';
    let nodeType = '';

    if (nodeDataRaw) {
      try {
        parsedNodeData = JSON.parse(nodeDataRaw);
        desc = parsedNodeData.description || '';
        category = parsedNodeData.category || '';
        nodeType = parsedNodeData.type || '';
      } catch (e) { console.error('Error parsing dropping node config'); }
    }

    let handlerKey = type;
    if (!isValidHandler(type)) {
      handlerKey = mapLabelToHandler(type);
    }

    const baseNodeData = getNodeByHandler(handlerKey) || {};
    const displayLabel = parsedNodeData?.label || baseNodeData?.label || getDisplayLabel(handlerKey);
    const icon = getIconForHandler(handlerKey, 16);

    const newNode = {
      id: `${handlerKey}-${+new Date()}`,
      type: handlerKey,
      position,
      data: {
        label: displayLabel,
        description: desc,
        category: category,
        type: nodeType,
        icon: icon,
        handlerType: handlerKey,
        onDelete: onDeleteNode,
        originalNode: parsedNodeData || baseNodeData
      },
      selectable: true,
    };

    setNodes((nds) => nds.concat(newNode));
  }, [reactFlowInstance, setNodes, onDeleteNode]);

  // Selection mapping & Dynamic Styling
  const selectedNodeId = nodes.find(n => n.selected)?.id;

  const styledEdges = useMemo(() => {
    return edges.map((edge) => {
      const isConnectedToSelected = selectedNodeId 
        ? (edge.source === selectedNodeId || edge.target === selectedNodeId)
        : false;
      
      const isDimmed = selectedNodeId && !isConnectedToSelected;
      const isActive = selectedNodeId && isConnectedToSelected;

      let edgeClass = 'react-flow__edge-path';
      if (isActive) edgeClass += ' edge-active';
      if (isDimmed) edgeClass += ' edge-dimmed';

      return {
        ...edge,
        className: edgeClass,
        style: isDimmed ? { stroke: 'rgba(255,255,255,0.08)' } : { stroke: '#475569', strokeWidth: 2 },
        markerEnd: {
          type: MarkerType.ArrowClosed,
          color: isDimmed ? 'rgba(255, 255, 255, 0.08)' : (isActive ? '#22D3EE' : '#475569')
        }
      };
    });
  }, [edges, selectedNodeId]);

  const styledNodes = useMemo(() => {
    return nodes.map((node) => {
      const isDimmed = selectedNodeId && node.id !== selectedNodeId && !edges.some(e => 
        (e.source === selectedNodeId && e.target === node.id) || 
        (e.target === selectedNodeId && e.source === node.id)
      );
      
      return {
        ...node,
        style: {
          ...node.style,
          opacity: isDimmed ? 0.4 : 1,
          transition: 'all 0.3s ease'
        },
        data: {
          ...node.data,
          onDelete: onDeleteNode
        }
      };
    });
  }, [nodes, edges, selectedNodeId, onDeleteNode]);

  return (
    <>
      <div className="reactflow-wrapper flex-1 h-full relative" onDrop={onDrop} onDragOver={onDragOver}>
        <div className="canvas-lighting-anchor" />
        
        <Panel position="top-right" className="!p-0 !m-0 !mt-2 !mr-4 flex flex-col gap-2 z-10">
          <button
            onClick={onLayout}
            className="flex items-center space-x-2 px-3 py-2 text-sm font-medium text-white bg-[#151C33] hover:bg-[#1A2340] rounded-lg shadow-md transition-all border border-soft hover:border-primary/50"
            title="Auto-layout graph"
          >
            <Wand2 size={16} className="text-primary" />
            <span>Auto Layout</span>
          </button>
          <button
            onClick={handleClearAll}
            className="flex items-center space-x-2 px-3 py-2 text-sm font-medium text-white bg-[#151C33] hover:bg-destructive/20 hover:text-red-400 rounded-lg shadow-md transition-all border border-soft hover:border-destructive/50"
            title="Clear all nodes and edges from the canvas"
          >
            <Trash2 size={16} />
            <span>Clear All</span>
          </button>
        </Panel>
        
        <ReactFlow
          nodes={styledNodes}
          edges={styledEdges}
          onConnect={onConnect}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onNodeClick={onNodeClickHandler}
          nodeTypes={nodeTypes}
          fitView
          deleteKeyCode={['Delete', 'Backspace']}
        >
          <Background gap={16} size={1} className="!bg-[transparent]" />
          <MiniMap nodeColor="#3B82F6" maskColor="rgba(15, 23, 42, 0.7)" />
          <Controls className="[&_button]:bg-[#151C33] [&_button]:border-soft [&_button:hover]:bg-[#1A2340] text-muted-foreground" />
        </ReactFlow>
      </div>

      <ConfirmationDialog
        isOpen={showClearDialog}
        onClose={() => setShowClearDialog(false)}
        onConfirm={confirmClearAll}
        title="Clear Canvas"
        message="Are you sure you want to clear the entire canvas? This will remove all nodes and edges. This action cannot be undone."
        confirmText="Clear All"
        cancelText="Cancel"
        variant="danger"
      />
    </>
  );
}
