import ReactFlow, {
  MiniMap,
  Controls,
  Background,
  addEdge,
  useReactFlow,
  Handle,
  Position,
  applyNodeChanges,
  applyEdgeChanges
} from 'reactflow';
import 'reactflow/dist/style.css';
import { useCallback } from 'react';
import { Card } from '../components/ui/card';
import { Plug, Rows, Edit, MessageSquare, Bot, Text, Mail } from 'lucide-react';

// --- Custom Node Component ---
const CustomNode = ({ data, selected = false }) => {
  const baseBorderStyle = '1px solid rgba(59, 130, 246, 0.5)';
  const selectedBorderStyle = '1px solid rgba(59, 130, 246, 1)';
  const baseShadowStyle = '0 0 10px rgba(59, 130, 246, 0.4), inset 0 0 5px rgba(59, 130, 246, 0.2)';
  const selectedShadowStyle = '0 0 15px rgba(59, 130, 246, 0.7), inset 0 0 8px rgba(59, 130, 246, 0.4)';
  return (
    <Card
      className="relative p-3 min-w-[150px] bg-gray-800/70 rounded-lg flex items-center gap-3 cursor-pointer transition-all duration-200"
      style={{
        border: selected ? selectedBorderStyle : baseBorderStyle,
        boxShadow: selected ? selectedShadowStyle : baseShadowStyle,
      }}
    >
      <Handle type="target" position={Position.Left} className="!w-2 !h-2 !bg-purple-500" />
      <div className="p-1.5 bg-gray-700/50 rounded-md text-blue-300">
        {data.icon}
      </div>
      <span className="font-semibold text-gray-200">{data.label}</span>
      <Handle type="source" position={Position.Right} className="!w-2 !h-2 !bg-blue-500" />
    </Card>
  );
};
// Move nodeTypes outside the component to avoid React Flow memo warning
const nodeTypes = {
  custom: CustomNode,
};

export default function WorkflowCanvas({ nodes, setNodes, edges, setEdges, onNodeClick }) {
  const reactFlowInstance = useReactFlow();
  const onNodesChange = useCallback((changes) => setNodes((nds) => applyNodeChanges(changes, nds)), [setNodes]);
  const onEdgesChange = useCallback((changes) => setEdges((eds) => applyEdgeChanges(changes, eds)), [setEdges]);
  const onConnect = useCallback((params) => setEdges((eds) => addEdge(params, eds)), [setEdges]);
  const onNodeClickHandler = useCallback((event, node) => onNodeClick(node.id), [onNodeClick]);
  const onDragOver = useCallback((event) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  }, []);
  const onDrop = useCallback((event) => {
    event.preventDefault();
    const type = event.dataTransfer.getData('application/reactflow');
    if (typeof type === 'undefined' || !type) return;
    const position = reactFlowInstance.screenToFlowPosition({ x: event.clientX, y: event.clientY });
    let icon = <Plug size={16} />;
    switch (type) {
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
      id: `dndnode_${+new Date()}`,
      type: 'custom',
      position,
      data: { label: type, icon: icon },
    };
    setNodes((nds) => nds.concat(newNode));
  }, [reactFlowInstance, setNodes]);
  return (
    <div className="reactflow-wrapper flex-1 h-full" onDrop={onDrop} onDragOver={onDragOver}>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onConnect={onConnect}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onNodeClick={onNodeClickHandler}
        nodeTypes={nodeTypes}
        fitView
      >
        <Background gap={16} size={1} className="!bg-gray-950" />
        <MiniMap nodeColor="#3B82F6" maskColor="rgba(15, 23, 42, 0.7)" />
        <Controls className="[&_button]:bg-gray-800 [&_button]:border-gray-700 [&_button:hover]:bg-blue-600" />
      </ReactFlow>
    </div>
  );
}