
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
  Panel
} from 'reactflow';
import 'reactflow/dist/style.css';
import { useCallback, useMemo, useState } from 'react';
import { mapLabelToHandler, mapHandlerToDisplayLabel } from '../services/nodeTypeMap';
import { Card } from '../components/ui/card';
import { Plug, Rows, Edit, MessageSquare, Bot, Trash2, Text, Mail, X } from 'lucide-react';
import { ConfirmationDialog } from './ui/confirmation-dialog';

// --- Custom Node Component ---
const CustomNode = ({ id, data, selected = false }) => {
  const baseBorderStyle = '1px solid rgba(59, 130, 246, 0.5)'; // Blue border
  const selectedBorderStyle = '1px solid rgba(59, 130, 246, 0.9)'; // Brighter blue when selected
  const baseShadowStyle = '0 0 10px rgba(59, 130, 246, 0.3), inset 0 0 5px rgba(59, 130, 246, 0.2)';
  const selectedShadowStyle = '0 0 15px rgba(59, 130, 246, 0.5), inset 0 0 8px rgba(59, 130, 246, 0.3)';

  const handleDelete = (event) => {
    event.stopPropagation();
    console.log('Deleting node:', id);
    console.log('onDelete function available:', !!data.onDelete); // Debug log
    if (data.onDelete) {
      data.onDelete(id);
    } else {
      console.error('onDelete function not found in data');
    }
  };

  return (
    <Card
      className="relative p-3 min-w-[150px] bg-gray-800/70 rounded-lg flex items-center gap-3 cursor-pointer transition-all duration-200"
      style={{
        border: selected ? selectedBorderStyle : baseBorderStyle,
        boxShadow: selected ? selectedShadowStyle : baseShadowStyle,
      }}
    >
      <Handle type="target" position={Position.Left} className="!w-2 !h-2 !bg-pink-500" />
      <div className="p-1.5 bg-gray-700/50 rounded-md text-gray-400">
        {data.icon}
      </div>
      <span className="font-semibold text-gray-200">{data.label}</span>
      <Handle type="source" position={Position.Right} className="!w-2 !h-2 !bg-blue-500" />

      {selected && (
        <button
          onClick={handleDelete}
          className="absolute -top-2 -right-2 p-1 bg-red-600 rounded-full text-white hover:bg-red-500 transition-colors z-10"
          aria-label="Remove node"
        >
          <X size={12} />
        </button>
      )}
    </Card>
  );
};

import { nodeLabelToHandler } from '../services/nodeTypeMap';

// Build nodeTypes mapping dynamically so that known handler keys use the CustomNode renderer
const knownHandlersCanvas = new Set(Object.values(nodeLabelToHandler));
['twitterApi','s3Upload','smsSender','googleSheets','calendarEvent','pagerDuty','emailGenerator','database','fileUpload'].forEach(h => knownHandlersCanvas.add(h));

const nodeTypes = Array.from(knownHandlersCanvas).reduce((acc, handler) => {
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

  // Delete node function
  const onDeleteNode = useCallback((nodeId) => {
    console.log('Deleting node with ID:', nodeId); // Debug log
    setNodes((nds) => nds.filter((node) => node.id !== nodeId));
    setEdges((eds) => eds.filter((edge) => edge.source !== nodeId && edge.target !== nodeId));
  }, [setNodes, setEdges]);

  // 🆕 New Handler: Function to clear all nodes and edges
  const handleClearAll = useCallback(() => {
    setShowClearDialog(true);
  }, []);

  const confirmClearAll = useCallback(() => {
    setNodes([]);
    setEdges([]);
    setShowClearDialog(false);
  }, [setNodes, setEdges]);

  const onDragOver = useCallback((event) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  }, []);

  const onDrop = useCallback((event) => {
    event.preventDefault();
    const type = event.dataTransfer.getData('application/reactflow');
    if (typeof type === 'undefined' || !type) return;

    const position = reactFlowInstance.screenToFlowPosition({ x: event.clientX, y: event.clientY });

    const handlerKey = mapLabelToHandler(type);
    const displayLabel = mapHandlerToDisplayLabel(handlerKey);

    let icon = <Plug size={16} />;
    switch (displayLabel) {
      case 'Web Scraper': icon = <Plug size={16} />; break;
      case 'AI Summarizer': icon = <Rows size={16} />; break;
      case 'Slack Message': icon = <MessageSquare size={16} />; break;
      case 'Content Polisher': icon = <Edit size={16} />; break;
      case 'AI Text Generator': icon = <Bot size={16} />; break;
      case 'Sentiment Analyzer': icon = <Text size={16} />; break;
      case 'Email Generator': icon = <Mail size={16} />; break;
      default: icon = <Plug size={16} />;
    }

    const newNode = {
      id: `${handlerKey}-${+new Date()}`,
      type: handlerKey,
      position,
      data: {
        label: displayLabel,
        icon: icon,
        handlerType: handlerKey,
        onDelete: onDeleteNode
      },
      selectable: true,
    };

    console.log('Creating new node with onDelete:', !!onDeleteNode); // Debug log
    setNodes((nds) => nds.concat(newNode));
  }, [reactFlowInstance, setNodes, onDeleteNode]);

  // Also add the onDelete function to existing nodes when they're selected
  // Use useMemo to prevent recreating the array on every render
  const updatedNodes = useMemo(() => nodes.map(node => ({
    ...node,
    data: {
      ...node.data,
      onDelete: onDeleteNode
    }
  })), [nodes, onDeleteNode]);

  return (
    <>
      <div className="reactflow-wrapper flex-1 h-full" onDrop={onDrop} onDragOver={onDragOver}>
        <Panel position="top-right" className="!p-0 !m-0">
          <button
            onClick={handleClearAll}
            className="flex items-center space-x-2 px-3 py-2 text-sm font-medium text-white bg-gray-800/80 hover:bg-gray-700 rounded-lg shadow-lg transition-colors mr-14 mt-2 border border-gray-700/50"
            title="Clear all nodes and edges from the canvas"
          >
            <Trash2 size={16} />
            <span>Clear All</span>
          </button>
        </Panel>
        <ReactFlow
          nodes={updatedNodes} // Use updated nodes with onDelete function
          edges={edges}
          onConnect={onConnect}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onNodeClick={onNodeClickHandler}
          nodeTypes={nodeTypes}
          fitView
          deleteKeyCode={['Delete', 'Backspace']}
        >
          <Background gap={16} size={1} className="!bg-gray-950" />
          <MiniMap nodeColor="#3B82F6" maskColor="rgba(15, 23, 42, 0.7)" />
          <Controls className="[&_button]:bg-gray-800 [&_button]:border-gray-700 [&_button:hover]:bg-gray-700" />
        </ReactFlow>
      </div>

      {/* Clear All Confirmation Dialog */}
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
