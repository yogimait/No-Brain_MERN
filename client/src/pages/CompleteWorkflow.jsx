import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { Card } from '../components/ui/card';
import { Vortex } from '../components/ui/vortex';
import { GlowingEffect } from '../components/ui/glowing-effect';
import ReactFlow, {
  MiniMap,
  Controls,
  Background,
  Handle,
  Position,
  ReactFlowProvider,
} from 'reactflow';
import 'reactflow/dist/style.css';
import {
  CheckCircle,
  Settings,
  BarChart3,
  Calendar,
  Zap,
  Bot,
  Mail,
  Linkedin,
  Rss,
  LayoutDashboard,
  Plug,
  Rows,
  MessageSquare,
  Edit,
  Text,
  Brain,
  AlertCircle,
  ThumbsUp,
  Info,
  Activity,
  ArrowLeft
} from 'lucide-react';
import { workflowAPI } from '../services/api';
import { nodeLabelToHandler } from '../services/nodeTypeMap';

// Bento Tile component with GlowingEffect
const BentoTile = ({ children, className, ...props }) => {
  return (
    <div
      className={`relative rounded-xl border border-gray-700/50 bg-gray-900/40 backdrop-blur-xl overflow-hidden transition-all duration-300 hover:border-cyan-500/30 ${className}`}
      {...props}
    >
      <GlowingEffect
        spread={40}
        glow={true}
        disabled={false}
        proximity={64}
        inactiveZone={0.01}
      />
      <div className="relative z-10 h-full">
        {children}
      </div>
    </div>
  );
};

// Custom Node Component for the workflow chart
const CustomNode = ({ data, selected = false }) => {
  const baseBorderStyle = '1px solid rgba(59, 130, 246, 0.5)';
  const selectedBorderStyle = '1px solid rgba(59, 130, 246, 0.9)';
  const baseShadowStyle = '0 0 10px rgba(59, 130, 246, 0.3), inset 0 0 5px rgba(59, 130, 246, 0.2)';
  const selectedShadowStyle = '0 0 15px rgba(59, 130, 246, 0.5), inset 0 0 8px rgba(59, 130, 246, 0.3)';

  return (
    <Card
      className="relative p-3 min-w-[150px] bg-gray-800/70 rounded-lg flex items-center gap-3 cursor-pointer transition-all duration-200"
      style={{
        border: selected ? selectedBorderStyle : baseBorderStyle,
        boxShadow: selected ? selectedShadowStyle : baseShadowStyle,
      }}
    >
      <Handle type="target" position={Position.Left} className="!w-2 !h-2 !bg-gray-600" />
      <div className={`p-1.5 bg-gray-700/50 rounded-md ${data.color}`}>
        {data.icon}
      </div>
      <span className="font-semibold text-gray-200">{data.label}</span>
      <Handle type="source" position={Position.Right} className="!w-2 !h-2 !bg-gray-600" />
    </Card>
  );
};

// Build nodeTypes mapping
const knownHandlers = new Set(Object.values(nodeLabelToHandler));
['twitterApi', 's3Upload', 'smsSender', 'googleSheets', 'calendarEvent', 'pagerDuty', 'emailGenerator', 'database', 'fileUpload'].forEach(h => knownHandlers.add(h));

const nodeTypes = Array.from(knownHandlers).reduce((acc, handler) => {
  acc[handler] = CustomNode;
  return acc;
}, { custom: CustomNode });

export default function CompleteWorkflowPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const [workflowData, setWorkflowData] = useState({
    nodes: [],
    edges: [],
    name: '',
    description: ''
  });
  const [loading, setLoading] = useState(true);
  const [reviewComments, setReviewComments] = useState([]);

  // Helper function to get icon based on label
  const getIconForLabel = (label) => {
    switch (label) {
      case 'Web Scraper': return <Plug className="w-4 h-4" />;
      case 'AI Summarizer': return <Rows className="w-4 h-4" />;
      case 'Gemini API': return <Brain className="w-4 h-4" />;
      case 'GPT-4': return <Brain className="w-4 h-4" />;
      case 'Claude': return <Brain className="w-4 h-4" />;
      case 'Email Service': return <Mail className="w-4 h-4" />;
      case 'Slack Message': return <MessageSquare className="w-4 h-4" />;
      case 'RSS Feed': return <Rss className="w-4 h-4" />;
      case 'Content Polisher': return <Edit className="w-4 h-4" />;
      case 'AI Text Generator': return <Bot className="w-4 h-4" />;
      case 'Sentiment Analyzer': return <Text className="w-4 h-4" />;
      case 'Email Generator': return <Mail className="w-4 h-4" />;
      default: return <Plug className="w-4 h-4" />;
    }
  };

  // Generate review comments based on workflow
  const generateReviewComments = (nodes, edges) => {
    const comments = [];

    if (nodes.length === 0) {
      comments.push({
        type: 'warning',
        icon: <AlertCircle className="w-5 h-5 text-yellow-400" />,
        title: 'Empty Workflow',
        message: 'Your workflow has no nodes.'
      });
      return comments;
    }

    // Check for disconnected nodes
    const connectedNodeIds = new Set();
    edges.forEach(edge => {
      connectedNodeIds.add(edge.source);
      connectedNodeIds.add(edge.target);
    });

    const disconnectedNodes = nodes.filter(node =>
      !connectedNodeIds.has(node.id) && nodes.length > 1
    );

    if (disconnectedNodes.length > 0) {
      comments.push({
        type: 'info',
        icon: <Info className="w-5 h-5 text-blue-400" />,
        title: 'Disconnected Nodes',
        message: `${disconnectedNodes.length} node(s) not connected.`
      });
    }

    if (nodes.length >= 2 && edges.length >= 1) {
      comments.push({
        type: 'success',
        icon: <ThumbsUp className="w-5 h-5 text-green-400" />,
        title: 'Well Structured',
        message: 'Good structure with proper connections.'
      });
    }

    const hasStartNode = nodes.some(node => {
      return !edges.some(edge => edge.target === node.id);
    });

    if (hasStartNode) {
      comments.push({
        type: 'success',
        icon: <CheckCircle className="w-5 h-5 text-green-400" />,
        title: 'Clear Entry Point',
        message: 'Data flow has a defined starting point.'
      });
    }

    const aiNodes = nodes.filter(node =>
      node.data?.label?.includes('AI') ||
      node.data?.label?.includes('GPT') ||
      node.data?.label?.includes('Gemini')
    );

    if (aiNodes.length > 0) {
      comments.push({
        type: 'info',
        icon: <Brain className="w-5 h-5 text-purple-400" />,
        title: 'AI Powered',
        message: `Using ${aiNodes.length} AI node(s).`
      });
    }

    return comments;
  };

  // Load workflow data
  useEffect(() => {
    const loadWorkflow = async () => {
      try {
        setLoading(true);
        const workflowDataFromState = location.state?.workflowData;
        const workflowId = location.state?.workflowId;

        let workflow = null;

        if (workflowDataFromState) {
          workflow = workflowDataFromState;
        } else if (workflowId) {
          const response = await workflowAPI.getById(workflowId);
          if (response && response.success && response.data) {
            workflow = response.data;
          } else if (response && response.data) {
            workflow = response.data;
          }
        }

        if (workflow && workflow.graph) {
          const processedNodes = (workflow.graph.nodes || []).map(node => ({
            ...node,
            type: node.type || 'custom',
            data: {
              ...node.data,
              icon: getIconForLabel(node.data?.label || node.label || ''),
              label: node.data?.label || node.label || node.id,
              color: 'text-gray-400'
            }
          }));

          setWorkflowData({
            nodes: processedNodes,
            edges: workflow.graph.edges || [],
            name: workflow.name || 'Untitled Workflow',
            description: workflow.description || ''
          });

          const comments = generateReviewComments(processedNodes, workflow.graph.edges || []);
          setReviewComments(comments);
        } else {
          setWorkflowData({
            nodes: [],
            edges: [],
            name: 'No Workflow Data',
            description: ''
          });
        }
      } catch (error) {
        console.error('Error loading workflow:', error);
        setWorkflowData({
          nodes: [],
          edges: [],
          name: 'Error Loading Workflow',
          description: ''
        });
      } finally {
        setLoading(false);
      }
    };

    loadWorkflow();
  }, [location.state]);

  const goToDashboard = () => {
    navigate('/dashboard');
  };

  const workflowStats = {
    totalNodes: workflowData.nodes.length,
    totalConnections: workflowData.edges.length,
    estimatedRuns: '24/7',
    successRate: '98.5%'
  };

  return (
    <Vortex
      backgroundColor="#000000"
      rangeY={800}
      particleCount={500}
      baseHue={170}
      rangeHue={50}
      baseSpeed={0.0}
      rangeSpeed={0.4}
      baseRadius={1}
      rangeRadius={2}
      containerClassName="fixed inset-0 w-full h-screen bg-black"
    >
      <div className="h-screen flex flex-col overflow-y-auto overflow-x-hidden bg-transparent">
        {/* Header */}
        <header className="relative z-30 pt-4 flex-shrink-0">
          <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <Brain className="w-6 h-6 text-cyan-400" />
                  <span className="text-xl font-bold text-white">NoBrain</span>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-green-500/10 border border-green-500/30">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                  <span className="text-green-400 text-sm font-medium">Live</span>
                </div>
                <Button onClick={goToDashboard} className="bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-white shadow-lg shadow-cyan-500/20">
                  <LayoutDashboard className="w-4 h-4 mr-2" />
                  Dashboard
                </Button>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 pb-16">
          <div className="max-w-[1200px] mx-auto">
            {loading ? (
              <div className="flex items-center justify-center py-20">
                <div className="w-8 h-8 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin" />
                <span className="ml-3 text-gray-400">Loading workflow...</span>
              </div>
            ) : (
              <div className="space-y-6">
                {/* Success Hero Banner - Centered */}
                <div className="flex justify-center">
                  <BentoTile className="p-6 md:p-8 bg-gradient-to-br from-cyan-500/10 to-blue-500/10 border-cyan-500/30 max-w-2xl w-full">
                    <div className="flex flex-col items-center text-center gap-4">
                      <div className="w-20 h-20 bg-gradient-to-br from-cyan-500 to-blue-500 rounded-2xl flex items-center justify-center shadow-lg shadow-cyan-500/30">
                        <CheckCircle className="w-10 h-10 text-white" />
                      </div>
                      <div>
                        <h1 className="text-2xl md:text-3xl font-bold text-white mb-2">
                          Workflow is Live!
                        </h1>
                        <p className="text-xl text-cyan-300 font-semibold">
                          {workflowData.name}
                        </p>
                        {workflowData.description && (
                          <p className="text-gray-400 text-sm mt-2 max-w-md mx-auto">
                            {workflowData.description}
                          </p>
                        )}
                      </div>
                    </div>
                  </BentoTile>
                </div>

                {/* Bento Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6">

                  {/* Workflow Preview - Large Tile */}
                  <BentoTile className="lg:col-span-2 p-0">
                    <div className="p-4 border-b border-gray-700/50 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-cyan-500/20 rounded-lg">
                          <Brain className="w-5 h-5 text-cyan-400" />
                        </div>
                        <div>
                          <h3 className="text-lg font-bold text-white">Workflow Preview</h3>
                          <p className="text-xs text-gray-500">{workflowStats.totalNodes} nodes • {workflowStats.totalConnections} connections</p>
                        </div>
                      </div>
                    </div>
                    <div className="h-80 md:h-96">
                      {workflowData.nodes.length === 0 ? (
                        <div className="h-full flex items-center justify-center">
                          <div className="text-center">
                            <AlertCircle className="w-12 h-12 text-gray-500 mx-auto mb-4" />
                            <p className="text-gray-400">No workflow data available</p>
                          </div>
                        </div>
                      ) : (
                        <ReactFlowProvider>
                          <ReactFlow
                            nodes={workflowData.nodes}
                            edges={workflowData.edges}
                            nodeTypes={nodeTypes}
                            fitView
                            nodesDraggable={false}
                            nodesConnectable={false}
                            elementsSelectable={false}
                            defaultViewport={{ x: 0, y: 0, zoom: 1 }}
                          >
                            <Background gap={16} size={1} className="!bg-gray-950" />
                            <MiniMap nodeColor="#06b6d4" maskColor="rgba(15, 23, 42, 0.7)" className="!bg-gray-900" />
                            <Controls className="[&_button]:bg-gray-800 [&_button]:border-gray-700 [&_button:hover]:bg-gray-700" />
                          </ReactFlow>
                        </ReactFlowProvider>
                      )}
                    </div>
                  </BentoTile>

                  {/* Stats Column */}
                  <div className="flex flex-col gap-4">
                    {/* Stats Grid */}
                    <div className="grid grid-cols-2 gap-4">
                      <BentoTile className="p-4">
                        <div className="flex flex-col gap-2">
                          <div className="flex items-center gap-2">
                            <div className="p-1.5 bg-cyan-500/20 rounded-lg">
                              <Settings className="w-4 h-4 text-cyan-400" />
                            </div>
                            <span className="text-xs text-gray-400">Nodes</span>
                          </div>
                          <div className="text-2xl font-bold text-white">{workflowStats.totalNodes}</div>
                        </div>
                      </BentoTile>

                      <BentoTile className="p-4">
                        <div className="flex flex-col gap-2">
                          <div className="flex items-center gap-2">
                            <div className="p-1.5 bg-blue-500/20 rounded-lg">
                              <Zap className="w-4 h-4 text-blue-400" />
                            </div>
                            <span className="text-xs text-gray-400">Connections</span>
                          </div>
                          <div className="text-2xl font-bold text-white">{workflowStats.totalConnections}</div>
                        </div>
                      </BentoTile>

                      <BentoTile className="p-4">
                        <div className="flex flex-col gap-2">
                          <div className="flex items-center gap-2">
                            <div className="p-1.5 bg-green-500/20 rounded-lg">
                              <Activity className="w-4 h-4 text-green-400" />
                            </div>
                            <span className="text-xs text-gray-400">Uptime</span>
                          </div>
                          <div className="text-2xl font-bold text-white">{workflowStats.estimatedRuns}</div>
                        </div>
                      </BentoTile>

                      <BentoTile className="p-4">
                        <div className="flex flex-col gap-2">
                          <div className="flex items-center gap-2">
                            <div className="p-1.5 bg-purple-500/20 rounded-lg">
                              <BarChart3 className="w-4 h-4 text-purple-400" />
                            </div>
                            <span className="text-xs text-gray-400">Success</span>
                          </div>
                          <div className="text-2xl font-bold text-white">{workflowStats.successRate}</div>
                        </div>
                      </BentoTile>
                    </div>

                    {/* System Status */}
                    <BentoTile className="p-4 bg-gradient-to-br from-cyan-500/10 to-blue-500/10 border-cyan-500/30">
                      <div className="flex items-center gap-3">
                        <div className="w-3 h-3 bg-cyan-400 rounded-full animate-pulse" />
                        <div>
                          <p className="text-sm font-bold text-cyan-200">SYSTEM ONLINE</p>
                          <p className="text-xs text-cyan-300/70 font-mono">IT'S A NO BRAINER</p>
                        </div>
                      </div>
                    </BentoTile>
                  </div>
                </div>

                {/* Review Comments */}
                {reviewComments.length > 0 && (
                  <BentoTile className="p-6">
                    <div className="flex items-center gap-3 mb-4 pb-4 border-b border-gray-700/50">
                      <div className="p-2 bg-blue-500/20 rounded-lg">
                        <MessageSquare className="w-5 h-5 text-blue-400" />
                      </div>
                      <h3 className="text-lg font-bold text-white">Workflow Analysis</h3>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {reviewComments.map((comment, index) => (
                        <div
                          key={index}
                          className="flex items-start gap-3 p-4 rounded-xl bg-gray-800/30 border border-gray-700/30"
                        >
                          <div className="flex-shrink-0 mt-0.5">
                            {comment.icon}
                          </div>
                          <div>
                            <h4 className="font-semibold text-white text-sm">{comment.title}</h4>
                            <p className="text-xs text-gray-400 mt-1">{comment.message}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </BentoTile>
                )}
              </div>
            )}
          </div>
        </main>
      </div>
    </Vortex>
  );
}