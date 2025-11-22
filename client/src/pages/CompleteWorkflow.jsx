// import { useState, useEffect } from 'react';
// import { useNavigate } from 'react-router-dom';
// import { Button } from '../components/ui/button';
// import { Card } from '../components/ui/card';
// import ReactFlow, {
//   MiniMap,
//   Controls,
//   Background,
//   Handle,
//   Position,
//   ReactFlowProvider,
// } from 'reactflow';
// import 'reactflow/dist/style.css';
// import { 
//   CheckCircle, 
//   Settings,
//   BarChart3,
//   Calendar,
//   Zap,
//   Bot,
//   Mail,
//   Linkedin,
//   Rss
// } from 'lucide-react';

// // Custom Node Component for the workflow chart
// const CustomNode = ({ data, selected = false }) => {
//   const baseBorderStyle = '1px solid rgba(59, 130, 246, 0.5)';
//   const selectedBorderStyle = '1px solid rgba(59, 130, 246, 1)';
//   const baseShadowStyle = '0 0 10px rgba(59, 130, 246, 0.4), inset 0 0 5px rgba(59, 130, 246, 0.2)';
//   const selectedShadowStyle = '0 0 15px rgba(59, 130, 246, 0.7), inset 0 0 8px rgba(59, 130, 246, 0.4)';

//   return (
//     <Card
//       className="relative p-3 min-w-[150px] bg-gray-800/70 rounded-lg flex items-center gap-3 cursor-pointer transition-all duration-200"
//       style={{
//         border: selected ? selectedBorderStyle : baseBorderStyle,
//         boxShadow: selected ? selectedShadowStyle : baseShadowStyle,
//       }}
//     >
//       <Handle type="target" position={Position.Left} className="!w-2 !h-2 !bg-purple-500" />
//       <div className={`p-1.5 bg-gray-700/50 rounded-md ${data.color}`}>
//         {data.icon}
//       </div>
//       <span className="font-semibold text-gray-200">{data.label}</span>
//       <Handle type="source" position={Position.Right} className="!w-2 !h-2 !bg-blue-500" />
//     </Card>
//   );
// };

// const nodeTypes = {
//   custom: CustomNode,
// };

// export default function CompleteWorkflowPage() {
//   const navigate = useNavigate();
//   const [workflowData, setWorkflowData] = useState({
//     nodes: [],
//     edges: []
//   });

//   // Mock workflow data - in a real app, this would come from the previous steps
//   useEffect(() => {
//     const mockNodes = [
//       {
//         id: 'node-1',
//         type: 'custom',
//         position: { x: 100, y: 100 },
//         data: { 
//           label: 'RSS Feed', 
//           icon: <Rss className="w-4 h-4" />,
//           color: 'text-orange-300'
//         },
//       },
//       {
//         id: 'node-2',
//         type: 'custom',
//         position: { x: 400, y: 100 },
//         data: { 
//           label: 'GPT-4 Agent', 
//           icon: <Bot className="w-4 h-4" />,
//           color: 'text-green-300'
//         },
//       },
//       {
//         id: 'node-3',
//         type: 'custom',
//         position: { x: 100, y: 300 },
//         data: { 
//           label: 'Email Service', 
//           icon: <Mail className="w-4 h-4" />,
//           color: 'text-red-300'
//         },
//       },
//       {
//         id: 'node-4',
//         type: 'custom',
//         position: { x: 400, y: 300 },
//         data: { 
//           label: 'LinkedIn API', 
//           icon: <Linkedin className="w-4 h-4" />,
//           color: 'text-blue-300'
//         },
//       },
//     ];

//     const mockEdges = [
//       {
//         id: 'edge-1-2',
//         source: 'node-1',
//         target: 'node-2',
//         type: 'smoothstep',
//       },
//       {
//         id: 'edge-2-3',
//         source: 'node-2',
//         target: 'node-3',
//         type: 'smoothstep',
//       },
//       {
//         id: 'edge-2-4',
//         source: 'node-2',
//         target: 'node-4',
//         type: 'smoothstep',
//       },
//     ];

//     setWorkflowData({ nodes: mockNodes, edges: mockEdges });
//   }, []);

//   const workflowStats = {
//     totalNodes: workflowData.nodes.length,
//     totalConnections: workflowData.edges.length,
//     estimatedRuns: '24/7',
//     lastRun: 'Just now',
//     successRate: '98.5%'
//   };

//   return (
//     <div className="min-h-screen bg-black">
//       <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
//         {/* Success Message */}
//         <div className="text-center mb-12">
//           <div className="w-20 h-20 bg-gradient-to-r from-green-500 to-blue-500 rounded-full flex items-center justify-center mx-auto mb-6">
//             <CheckCircle className="w-10 h-10 text-white" />
//           </div>
//           <h1 className="text-4xl font-bold text-white mb-4">
//             You just created a NoBrainer! 🎉
//           </h1>
//           <p className="text-gray-400 text-xl max-w-2xl mx-auto">
//             Your workflow is now live and running automatically. It will process data, 
//             make decisions, and execute actions without any manual intervention.
//           </p>
//         </div>

//         {/* Workflow Chart */}
//         <Card className="bg-gray-900/60 border-gray-700/50 p-6 mb-8">
//           <div className="flex items-center justify-between mb-6">
//             <h2 className="text-2xl font-bold text-white">Your Workflow</h2>
//             <div className="flex items-center gap-2">
//               <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse" />
//               <span className="text-green-400 text-sm font-medium">Active</span>
//             </div>
//           </div>
          
//           <div className="h-96 bg-gray-800/50 rounded-lg border border-gray-700 overflow-hidden">
//             <ReactFlowProvider>
//               <ReactFlow
//                 nodes={workflowData.nodes}
//                 edges={workflowData.edges}
//                 nodeTypes={nodeTypes}
//                 fitView
//                 nodesDraggable={false}
//                 nodesConnectable={false}
//                 elementsSelectable={false}
//               >
//                 <Background gap={16} size={1} className="!bg-gray-950" />
//                 <MiniMap nodeColor="#3B82F6" maskColor="rgba(15, 23, 42, 0.7)" />
//                 <Controls className="[&_button]:bg-gray-800 [&_button]:border-gray-700 [&_button:hover]:bg-blue-600" />
//               </ReactFlow>
//             </ReactFlowProvider>
//           </div>
//         </Card>

//         {/* Stats Grid */}
//         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
//           <Card className="bg-gray-900/60 border-gray-700/50 p-6">
//             <div className="flex items-center gap-3">
//               <div className="p-3 bg-blue-500/20 rounded-lg">
//                 <Settings className="w-6 h-6 text-blue-400" />
//               </div>
//               <div>
//                 <p className="text-gray-400 text-sm">Total Nodes</p>
//                 <p className="text-white text-2xl font-bold">{workflowStats.totalNodes}</p>
//               </div>
//             </div>
//           </Card>

//           <Card className="bg-gray-900/60 border-gray-700/50 p-6">
//             <div className="flex items-center gap-3">
//               <div className="p-3 bg-green-500/20 rounded-lg">
//                 <Zap className="w-6 h-6 text-green-400" />
//               </div>
//               <div>
//                 <p className="text-gray-400 text-sm">Connections</p>
//                 <p className="text-white text-2xl font-bold">{workflowStats.totalConnections}</p>
//               </div>
//             </div>
//           </Card>

//           <Card className="bg-gray-900/60 border-gray-700/50 p-6">
//             <div className="flex items-center gap-3">
//               <div className="p-3 bg-purple-500/20 rounded-lg">
//                 <Calendar className="w-6 h-6 text-purple-400" />
//               </div>
//               <div>
//                 <p className="text-gray-400 text-sm">Runs</p>
//                 <p className="text-white text-2xl font-bold">{workflowStats.estimatedRuns}</p>
//               </div>
//             </div>
//           </Card>

//           <Card className="bg-gray-900/60 border-gray-700/50 p-6">
//             <div className="flex items-center gap-3">
//               <div className="p-3 bg-yellow-500/20 rounded-lg">
//                 <BarChart3 className="w-6 h-6 text-yellow-400" />
//               </div>
//               <div>
//                 <p className="text-gray-400 text-sm">Success Rate</p>
//                 <p className="text-white text-2xl font-bold">{workflowStats.successRate}</p>
//               </div>
//             </div>
//           </Card>
//         </div>

//         {/* Success Tips */}
//         <Card className="bg-green-500/10 border-green-500/30 p-6 mt-8">
//           <div className="flex items-start space-x-3">
//             <CheckCircle className="w-6 h-6 text-green-400 mt-1" />
//             <div>
//               <h4 className="text-green-400 font-semibold mb-2">What happens next?</h4>
//               <ul className="text-gray-300 text-sm space-y-1">
//                 <li>• Your workflow is now running automatically in the background</li>
//                 <li>• You'll receive notifications for any issues or important events</li>
//                 <li>• Monitor performance and make adjustments as needed</li>
//                 <li>• Your data is processed securely and efficiently</li>
//               </ul>
//             </div>
//           </div>
//         </Card>
//       </div>
//     </div>
//   );
// }


import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { Card } from '../components/ui/card';
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
  Info
} from 'lucide-react';
import { workflowAPI } from '../services/api';

// Custom Node Component for the workflow chart
const CustomNode = ({ data, selected = false }) => {
  const baseBorderStyle = '1px solid rgba(59, 130, 246, 0.5)'; // Blue border
  const selectedBorderStyle = '1px solid rgba(59, 130, 246, 0.9)'; // Brighter blue when selected
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

const nodeTypes = {
  custom: CustomNode,
};

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
        icon: <AlertCircle className="w-5 h-5" />,
        title: 'Empty Workflow',
        message: 'Your workflow has no nodes. Consider adding some nodes to make it functional.'
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
        icon: <Info className="w-5 h-5" />,
        title: 'Disconnected Nodes',
        message: `You have ${disconnectedNodes.length} node(s) that aren't connected. Connect them to ensure data flows properly.`
      });
    }

    // Check workflow structure
    if (nodes.length >= 2 && edges.length >= 1) {
      comments.push({
        type: 'success',
        icon: <ThumbsUp className="w-5 h-5" />,
        title: 'Well Structured',
        message: 'Your workflow has a good structure with multiple nodes and connections. This will work efficiently!'
      });
    }

    // Check for data flow
    const hasStartNode = nodes.some(node => {
      // A start node is one that has no incoming edges
      return !edges.some(edge => edge.target === node.id);
    });

    if (hasStartNode) {
      comments.push({
        type: 'success',
        icon: <CheckCircle className="w-5 h-5" />,
        title: 'Good Data Flow',
        message: 'Your workflow has a clear starting point. Data will flow from the first node through the chain.'
      });
    }

    // Check node types
    const aiNodes = nodes.filter(node => 
      node.data?.label?.includes('AI') || 
      node.data?.label?.includes('GPT') || 
      node.data?.label?.includes('Gemini')
    );
    
    if (aiNodes.length > 0) {
      comments.push({
        type: 'info',
        icon: <Brain className="w-5 h-5" />,
        title: 'AI Integration',
        message: `You're using ${aiNodes.length} AI-powered node(s). Make sure you have the necessary API keys configured.`
      });
    }

    // General workflow tips
    if (nodes.length >= 3) {
      comments.push({
        type: 'success',
        icon: <Zap className="w-5 h-5" />,
        title: 'Complex Workflow',
        message: 'This is a well-designed workflow with multiple steps. It will automate complex tasks effectively!'
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
          // Process nodes to reconstruct icons
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

          // Generate review comments
          const comments = generateReviewComments(processedNodes, workflow.graph.edges || []);
          setReviewComments(comments);
        } else {
          // Fallback to empty state
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

  // Function to handle navigation
  const goToDashboard = () => {
    navigate('/dashboard');
  };

  const workflowStats = {
    totalNodes: workflowData.nodes.length,
    totalConnections: workflowData.edges.length,
    estimatedRuns: '24/7',
    lastRun: 'Just now',
    successRate: '98.5%'
  };

  const getCommentColor = (type) => {
    switch (type) {
      case 'success': return 'bg-gray-800/50 border-gray-700/50 text-gray-300';
      case 'warning': return 'bg-gray-800/50 border-gray-700/50 text-gray-300';
      case 'info': return 'bg-gray-800/50 border-gray-700/50 text-gray-300';
      default: return 'bg-gray-800/50 border-gray-700/50 text-gray-400';
    }
  };

  return (
    <div className="min-h-screen bg-black">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 relative"> {/* Added 'relative' here */}
        
        {/* Button on Top Right Corner */}
        <div className="absolute top-8 right-4 sm:right-6 lg:right-8 z-10">
          <Button 
            onClick={goToDashboard} 
            className="bg-gray-700 hover:bg-gray-600 text-white font-semibold py-2 px-4 rounded-lg shadow-lg transition-all duration-200 flex items-center gap-2"
          >
            <LayoutDashboard className="w-4 h-4" />
            Go to Dashboard
          </Button>
        </div>

        {/* Main Content starts here */}
        <div className="pt-16 sm:pt-12"> {/* Added padding top to account for the button */}
        
          {/* Success Message */}
          <div className="text-center mb-12">
            <div className="w-20 h-20 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="w-10 h-10 text-white" />
            </div>
            <h1 className="text-4xl font-bold text-white mb-4">
              Your Workflow is Ready and Started !!
            </h1>
            <p className="text-gray-400 text-xl max-w-2xl mx-auto mb-2">
              <span className="text-gray-300 font-semibold">{workflowData.name}</span> is now live and running automatically.
            </p>
            {workflowData.description && (
              <p className="text-gray-500 text-sm max-w-2xl mx-auto">
                {workflowData.description}
              </p>
            )}
          </div>

          {loading ? (
            <div className="text-center py-20">
              <div className="w-12 h-12 border-4 border-gray-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-gray-400">Loading workflow...</p>
            </div>
          ) : (
            <>
              {/* Workflow Chart */}
              <Card className="bg-gray-900/60 border-gray-700/50 p-6 mb-8">
                  <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-white">Your Workflow</h2>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse" />
                    <span className="text-green-400 text-sm font-medium">Active</span>
                  </div>
                </div>

                {workflowData.nodes.length === 0 ? (
                  <div className="h-96 bg-gray-800/50 rounded-lg border border-gray-700 flex items-center justify-center">
                    <div className="text-center">
                      <AlertCircle className="w-12 h-12 text-gray-500 mx-auto mb-4" />
                      <p className="text-gray-400">No workflow data available</p>
                    </div>
                  </div>
                ) : (
                  <div className="h-96 bg-gray-800/50 rounded-lg border border-gray-700 overflow-hidden">
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
                        <MiniMap nodeColor="#3B82F6" maskColor="rgba(15, 23, 42, 0.7)" />
                        <Controls className="[&_button]:bg-gray-800 [&_button]:border-gray-700 [&_button:hover]:bg-gray-700" />
                      </ReactFlow>
                    </ReactFlowProvider>
                  </div>
                )}
              </Card>

              {/* Review Comments Section */}
              {reviewComments.length > 0 && (
                <Card className="bg-gray-900/60 border-gray-700/50 p-6 mb-8">
                  <h2 className="text-2xl font-bold text-white mb-6">Workflow Review</h2>
                  <div className="space-y-4">
                    {reviewComments.map((comment, index) => (
                      <div
                        key={index}
                        className={`p-4 rounded-lg border ${getCommentColor(comment.type)}`}
                      >
                        <div className="flex items-start gap-3">
                          <div className="mt-0.5">
                            {comment.icon}
                          </div>
                          <div className="flex-1">
                            <h3 className="font-semibold mb-1">{comment.title}</h3>
                            <p className="text-sm opacity-90">{comment.message}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </Card>
              )}
            </>
          )}

          {/* Stats Grid */}
{/*           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <Card className="bg-gray-900/60 border-gray-700/50 p-6">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-blue-500/20 rounded-lg">
                  <Settings className="w-6 h-6 text-blue-400" />
                </div>
                <div>
                  <p className="text-gray-400 text-sm">Total Nodes</p>
                  <p className="text-white text-2xl font-bold">{workflowStats.totalNodes}</p>
                </div>
              </div>
            </Card>

            <Card className="bg-gray-900/60 border-gray-700/50 p-6">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-green-500/20 rounded-lg">
                  <Zap className="w-6 h-6 text-green-400" />
                </div>
                <div>
                  <p className="text-gray-400 text-sm">Connections</p>
                  <p className="text-white text-2xl font-bold">{workflowStats.totalConnections}</p>
                </div>
              </div>
            </Card>

            <Card className="bg-gray-900/60 border-gray-700/50 p-6">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-purple-500/20 rounded-lg">
                  <Calendar className="w-6 h-6 text-purple-400" />
                </div>
                <div>
                  <p className="text-gray-400 text-sm">Runs</p>
                  <p className="text-white text-2xl font-bold">{workflowStats.estimatedRuns}</p>
                </div>
              </div>
            </Card>

            <Card className="bg-gray-900/60 border-gray-700/50 p-6">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-yellow-500/20 rounded-lg">
                  <BarChart3 className="w-6 h-6 text-yellow-400" />
                </div>
                <div>
                  <p className="text-gray-400 text-sm">Success Rate</p>
                  <p className="text-white text-2xl font-bold">{workflowStats.successRate}</p>
                </div>
              </div>
            </Card>
          </div> */}

        </div>
      </div>
    </div>
  );
}