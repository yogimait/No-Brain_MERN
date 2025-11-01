



import { useState, useEffect } from 'react';
import { ReactFlowProvider } from 'reactflow'; 
import Sidebar from '../components/Sidebar';
import WorkflowCanvas from '../components/WorkflowCanvas';
import NodeConfigPanel from '../components/NodeConfigPanel';
import { Button } from '../components/ui/button';
import { Card } from '../components/ui/card';
import { 
  Plug, 
  Rows, 
  Rocket, 
  Brain, 
  Bot, 
  Mail, 
  MessageSquare, 
  Play, 
  CheckCircle, 
  AlertCircle, 
  Loader2,
  Sparkles,
  X,
  ArrowLeft
} from 'lucide-react';
import { useNavigate, useSearchParams, useLocation } from 'react-router-dom';
import { useRef } from 'react';
import { workflowAPI, executionAPI } from '../services/api';

export default function WorkflowEditorPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const isAIGenerated = searchParams.get('mode') === 'ai-generated';
  
  const [nodes, setNodes] = useState([]);
  const [edges, setEdges] = useState([]);
  const [selectedNodeId, setSelectedNodeId] = useState(null);
  const [showTestResults, setShowTestResults] = useState(false);
  const [isTesting, setIsTesting] = useState(false);
  const [testResults, setTestResults] = useState([]);
  const [workflowName, setWorkflowName] = useState("");
  const [showPromptBox, setShowPromptBox] = useState(false);
  const [isPromptBoxVisible, setIsPromptBoxVisible] = useState(false); 
  const [promptInput, setPromptInput] = useState("");
  const [promptLoading, setPromptLoading] = useState(false);
  const promptBoxRef = useRef(null);
  const [promptPos, setPromptPos] = useState({ x: 400, y: 120 });
  const [dragging, setDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });

  const location = useLocation();
  const [currentWorkflowId, setCurrentWorkflowId] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Load workflow if editing
  useEffect(() => {
    const workflowData = location.state?.workflowData;
    const workflowId = location.state?.workflowId;
    
    if (workflowData && workflowData.graph) {
      setCurrentWorkflowId(workflowId);
      setWorkflowName(workflowData.name || '');
      setNodes(workflowData.graph.nodes || []);
      setEdges(workflowData.graph.edges || []);
    }
  }, [location.state]);

  // Handle drag
  const onPromptMouseDown = (e) => {
    if (e.target.closest('.prompt-header')) {
      setDragging(true);
      setDragOffset({
        x: e.clientX - promptPos.x,
        y: e.clientY - promptPos.y,
      });
      document.body.style.userSelect = 'none';
    }
  };
  const onPromptMouseMove = (e) => {
    if (!dragging) return;
    setPromptPos({ x: e.clientX - dragOffset.x, y: e.clientY - dragOffset.y });
  };
  const onPromptMouseUp = () => {
    setDragging(false);
    document.body.style.userSelect = '';
  };
  useEffect(() => {
    if (!dragging) return;
    window.addEventListener('mousemove', onPromptMouseMove);
    window.addEventListener('mouseup', onPromptMouseUp);
    return () => {
      window.removeEventListener('mousemove', onPromptMouseMove);
      window.removeEventListener('mouseup', onPromptMouseUp);
    };
  }, [dragging, dragOffset]);

  // Animation control functions
  const openPromptBox = () => {
      setShowPromptBox(true);
      setTimeout(() => setIsPromptBoxVisible(true), 10);
  };
  
  const closePromptBox = () => {
      setIsPromptBoxVisible(false);
      setTimeout(() => setShowPromptBox(false), 300);
  };

  // Utility for random node addition
  function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }
  const handleSendPrompt = async () => {
    setPromptLoading(true);
    await new Promise(r => setTimeout(r, 1200)); // Simulate request

    // Sample from 3-5 node types and connect them
    const types = [
      { label: 'Web Scraper', icon: <Plug size={16} /> },
      { label: 'AI Summarizer', icon: <Rows size={16} /> },
      { label: 'Slack Message', icon: <MessageSquare size={16} /> },
      { label: 'Email Service', icon: <Mail size={16} /> },
    ];
    let num = getRandomInt(1, 2);
    let newNodes = [], newEdges = [];
    for (let i = 0; i < num; i++) {
      const idx = getRandomInt(0, types.length - 1);
      const nodeId = `ai-${Date.now()}-${i}-${Math.round(Math.random()*1000)}`;
      newNodes.push({
        id: nodeId,
        type: 'custom',
        position: { x: 200 + i*60 + getRandomInt(-30,30), y: 250 + i*50 + getRandomInt(-30,30) },
        data: types[idx]
      });
      if (i > 0) {
        newEdges.push({
          id: `e${newNodes[i-1].id}-${nodeId}`,
          source: newNodes[i-1].id,
          target: nodeId,
          type: 'smoothstep',
        });
      }
    }
    setNodes(ns => [...ns, ...newNodes]);
    setEdges(es => [...es, ...newEdges]);
    setPromptLoading(false);
    closePromptBox();
    setPromptInput("");
  };

  // Initialize with dummy workflow if AI-generated
  useEffect(() => {
    if (isAIGenerated && nodes.length === 0) {
      const dummyNodes = [
        {
          id: 'node-1',
          type: 'custom',
          position: { x: 100, y: 100 },
          data: { 
            label: 'RSS Feed', 
            icon: <Plug size={16} /> 
          },
        },
        {
          id: 'node-2',
          type: 'custom',
          position: { x: 400, y: 100 },
          data: { 
            label: 'AI Summarizer', 
            icon: <Rows size={16} /> 
          },
        },
        {
          id: 'node-3',
          type: 'custom',
          position: { x: 100, y: 300 },
          data: { 
            label: 'Email Service', 
            icon: <Mail size={16} /> 
          },
        },
        {
          id: 'node-4',
          type: 'custom',
          position: { x: 400, y: 300 },
          data: { 
            label: 'Slack Message', 
            icon: <MessageSquare size={16} /> 
          },
        },
        {
          id: 'node-5',
          type: 'custom',
          position: { x: 250, y: 200 },
          data: {
            label: 'Scheduler',
            icon: <Rocket size={16} />
          }
        }
      ];

      const dummyEdges = [
        {
          id: 'edge-1-2',
          source: 'node-1',
          target: 'node-2',
          type: 'smoothstep',
        },
        {
          id: 'edge-2-3',
          source: 'node-2',
          target: 'node-3',
          type: 'smoothstep',
        },
        {
          id: 'edge-2-4',
          source: 'node-2',
          target: 'node-4',
          type: 'smoothstep',
        },
        {
          id: 'edge-5-1',
          source: 'node-5',
          target: 'node-1',
          type: 'smoothstep',
        }
      ];

      setNodes(dummyNodes);
      setEdges(dummyEdges);
    }
  }, [isAIGenerated, nodes.length]);

  // Detect if entered from /workflow/ai-prompt
  useEffect(() => {
    const isAIPromptMode = location?.pathname?.includes('/workflow') && location?.state?.fromAIPrompt;
    if (isAIPromptMode && nodes.length === 0) {
      // Generate 4-5 connected nodes
      const types = [
        { label: 'RSS Feed', icon: <Plug size={16} /> },
        { label: 'AI Summarizer', icon: <Rows size={16} /> },
        { label: 'Slack Message', icon: <MessageSquare size={16} /> },
        { label: 'Email Service', icon: <Mail size={16} /> },
        { label: 'Gemini API', icon: <Brain size={16} /> },
        { label: 'GPT-4', icon: <Brain size={16} /> },
        { label: 'AI Text Generator', icon: <Brain size={16} /> },
        { label: 'Content Polisher', icon: <Plug size={16} /> },
      ];
      let nodesCount = Math.floor(Math.random()*2)+4; // 4 or 5
      let pickedTypes = types.slice(0);
      // Shuffle types
      for (let i = pickedTypes.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [pickedTypes[i], pickedTypes[j]] = [pickedTypes[j], pickedTypes[i]];
      }
      let used = pickedTypes.slice(0, nodesCount);
      let aiNodes = used.map((t, i) => ({
        id: `ai-gen-${i}-${Math.round(Math.random()*99999)}`,
        type: 'custom',
        position: { x: 170 + 220*(i%2), y: 120 + 110*Math.floor(i/2) },
        data: t
      }));
      let aiEdges = [];
      for (let i = 0; i < aiNodes.length-1; ++i) aiEdges.push({ id: `aiedge${i}`, source: aiNodes[i].id, target: aiNodes[i+1].id, type: 'smoothstep' });
      setNodes(aiNodes);
      setEdges(aiEdges);
    }
  // eslint-disable-next-line
  }, [location.pathname, location.state, nodes.length]);

  const addNode = (nodeType) => {
    let icon;
    switch (nodeType) {
        case 'Web Scraper': icon = <Plug size={16} />; break;
        case 'AI Summarizer': icon = <Rows size={16} />; break;
        case 'Gemini API': icon = <Brain size={16} />; break;
        case 'GPT-4': icon = <Brain size={16} />; break;
        case 'Claude': icon = <Brain size={16} />; break;
        case 'Twitter API': icon = <Plug size={16} />; break;
        case 'LinkedIn API': icon = <Plug size={16} />; break;
        case 'Instagram API': icon = <Plug size={16} />; break;
        case 'Email Service': icon = <Plug size={16} />; break;
        case 'Slack Message': icon = <Plug size={16} />; break;
        case 'RSS Feed': icon = <Plug size={16} />; break;
        case 'Webhook': icon = <Plug size={16} />; break;
        case 'Database': icon = <Plug size={16} />; break;
        case 'File Upload': icon = <Plug size={16} />; break;
        case 'Text Processor': icon = <Plug size={16} />; break;
        case 'Image Processor': icon = <Plug size={16} />; break;
        case 'Data Transformer': icon = <Plug size={16} />; break;
        case 'Condition Check': icon = <Plug size={16} />; break;
        case 'Delay': icon = <Plug size={16} />; break;
        case 'Schedule': icon = <Plug size={16} />; break;
        case 'Loop': icon = <Plug size={16} />; break;
        case 'Merge': icon = <Plug size={16} />; break;
        case 'AI Text Generator': icon = <Brain size={16} />; break;
        case 'Content Polisher': icon = <Plug size={16} />; break;
        case 'Sentiment Analyzer': icon = <Plug size={16} />; break;
        case 'Email Generator': icon = <Plug size={16} />; break;
        default: icon = <Plug size={16} />;
    }
    const newNode = {
      id: String(Date.now() + Math.random()),
      type: 'custom',
      position: { x: 250, y: 50 + nodes.length * 50 },
      data: { label: nodeType, icon: icon },
    };
    setNodes((prev) => [...prev, newNode]);
  };

  const selectNode = (id) => {
    setSelectedNodeId(id);
  };

  const runTest = async () => {
    if (nodes.length === 0) {
      alert('Please add at least one node to test.');
      return;
    }
    
    setIsTesting(true);
    setShowTestResults(true);
    
    const startTime = Date.now();
    
    // Simulate test execution for each node
    const testResults = [];
    
    for (const node of nodes) {
      const nodeStartTime = Date.now();
      // Simulate test delay
      await new Promise(resolve => setTimeout(resolve, Math.random() * 1000 + 500));
      
      const success = Math.random() > 0.2; // 80% success rate
      
      testResults.push({
        nodeId: node.id,
        nodeName: node.data?.label || node.id,
        status: success ? 'completed' : 'failed',
        input: { nodeId: node.id, nodeType: node.data?.label },
        output: success ? { success: true, message: `Successfully connected to ${node.data?.label || node.id}` } : null,
        error: success ? null : `Failed to connect to ${node.data?.label || node.id}. Check credentials.`,
        startTime: new Date(nodeStartTime).toISOString(),
        endTime: new Date(Date.now()).toISOString(),
      });
    }
    
    const totalDuration = Date.now() - startTime;
    
    // Save test results to backend
    try {
      let workflowId = currentWorkflowId;
      
      // If no workflow exists yet, create one automatically for testing
      if (!workflowId && nodes.length > 0) {
        const workflowData = {
          name: workflowName.trim() || `Test Workflow ${Date.now()}`,
          graph: {
            nodes: nodes,
            edges: edges,
          },
          ownerId: localStorage.getItem('userId') || '507f1f77bcf86cd799439011',
          description: `Auto-created for testing with ${nodes.length} nodes`,
        };
        
        console.log('Creating workflow for testing:', workflowData);
        const response = await workflowAPI.create(workflowData);
        console.log('Workflow created:', response);
        
        // Handle ApiResponse format: response is { success, data, message }
        // The workflow object is in response.data
        if (response && response.success && response.data) {
          workflowId = response.data._id;
          setCurrentWorkflowId(workflowId);
          if (!workflowName.trim()) {
            setWorkflowName(workflowData.name);
          }
        } else {
          throw new Error('Failed to create workflow: ' + JSON.stringify(response));
        }
      }
      
      if (workflowId) {
        const executionData = {
          workflowId: workflowId,
          status: testResults.every(r => r.status === 'completed') ? 'completed' : 'failed',
          nodeLogs: testResults,
          duration: totalDuration,
          error: testResults.some(r => r.error) ? 'Some nodes failed during testing' : null,
        };
        
        console.log('Saving execution log:', executionData);
        const executionResponse = await executionAPI.create(executionData);
        console.log('Execution saved:', executionResponse);
        
        // Handle ApiResponse format
        if (executionResponse && executionResponse.success) {
          console.log('Execution saved successfully to logs');
        } else {
          console.warn('Execution may not have been saved properly:', executionResponse);
        }
      } else {
        console.error('No workflowId available to save execution');
        alert('Warning: Test completed but could not save to logs. Please save the workflow first.');
      }
      
      // Convert to display format
      const displayResults = testResults.map(r => ({
        id: r.nodeId,
        name: r.nodeName,
        status: r.status === 'completed' ? 'success' : 'error',
        message: r.output?.message || r.error || 'Unknown error',
        duration: Date.parse(r.endTime) - Date.parse(r.startTime),
        timestamp: r.startTime,
      }));
      
      setTestResults(displayResults);
      setIsTesting(false);
      
      // Show success message
      alert('Test completed! Check the Logs page to see the results.');
    } catch (error) {
      console.error('Error saving test results:', error);
      console.error('Error details:', error.response?.data || error.message);
      
      // Still show results even if saving failed
      const displayResults = testResults.map(r => ({
        id: r.nodeId,
        name: r.nodeName,
        status: r.status === 'completed' ? 'success' : 'error',
        message: r.output?.message || r.error || 'Unknown error',
        duration: Date.parse(r.endTime) - Date.parse(r.startTime),
        timestamp: r.startTime,
      }));
      setTestResults(displayResults);
      setIsTesting(false);
      
      alert(`Test completed but failed to save to logs: ${error.message || 'Unknown error'}. Check console for details.`);
    }
  };

  const applyWorkflow = async () => {
    if (nodes.length === 0) {
      alert('Please add at least one node to the workflow.');
      return;
    }

    if (!workflowName.trim()) {
      alert('Please enter a workflow name.');
      return;
    }

    setIsSubmitting(true);

    try {
      const workflowData = {
        name: workflowName.trim(),
        graph: {
          nodes: nodes,
          edges: edges,
        },
        ownerId: localStorage.getItem('userId') || '507f1f77bcf86cd799439011', // Get from auth context in production
        description: `Workflow with ${nodes.length} nodes`,
      };

      console.log('Saving workflow:', workflowData);
      let savedWorkflow;
      
      if (currentWorkflowId) {
        // Update existing workflow
        console.log('Updating existing workflow:', currentWorkflowId);
        const response = await workflowAPI.update(currentWorkflowId, workflowData);
        console.log('Update response:', response);
        
        // Handle ApiResponse format: response is { success, data, message }
        if (response && response.success && response.data) {
          savedWorkflow = response.data;
        } else {
          throw new Error('Update failed: ' + JSON.stringify(response));
        }
      } else {
        // Create new workflow
        console.log('Creating new workflow');
        const response = await workflowAPI.create(workflowData);
        console.log('Create response:', response);
        
        // Handle ApiResponse format: response is { success, data, message }
        if (response && response.success && response.data) {
          savedWorkflow = response.data;
          setCurrentWorkflowId(response.data._id);
        } else {
          throw new Error('Create failed: ' + JSON.stringify(response));
        }
      }

      console.log('Workflow saved successfully:', savedWorkflow);
      
      // Show success message
      alert('Workflow saved successfully! Redirecting to dashboard...');
      
      // Navigate to dashboard after successful save
      setTimeout(() => {
        navigate('/dashboard');
      }, 500);
    } catch (error) {
      console.error('Error saving workflow:', error);
      console.error('Error details:', error.response?.data || error.message);
      alert(`Failed to save workflow: ${error.message || 'Unknown error'}. Check console for details.`);
      setIsSubmitting(false);
    }
  };

  return (
    <div className="h-screen w-screen flex flex-col bg-gradient-to-br from-gray-950 to-purple-950/20 text-gray-100">
      {/* Header */}
      <header className="bg-gray-900/60 backdrop-blur-sm border-b border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <Brain className="w-8 h-8 text-cyan-400" /> {/* Blue/Cyan Accent */}
              <span className="text-2xl font-bold text-cyan-300"> {/* Blue/Cyan Accent */}
                {workflowName}
              </span>
              <div className="ml-6 w-72 flex items-center">
                <input
                  type="text"
                  placeholder="Workflow Name..."
                  value={workflowName}
                  maxLength={20}
                  onChange={e => setWorkflowName(e.target.value)}
                  className="bg-transparent border border-gray-700 rounded-md px-3 py-1.5 w-full text-white placeholder:text-gray-400 focus:outline-none focus:border-cyan-400 text-base" 
                />
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              {/* 🚀 ENHANCED PROMPT BUTTON START (Blue Theme) 🚀 */}
              <Button
                variant="outline"
                size="sm"
                onClick={openPromptBox}
                className="
                  // Base Styles
                  bg-cyan-600/10 text-cyan-300 border-cyan-500/50 
                  hover:bg-cyan-700/20 
                  // Glow Effect
                  shadow-lg shadow-cyan-500/30 
                  // Hover Animation
                  transition-all duration-300 ease-in-out 
                  hover:scale-[1.03] hover:shadow-cyan-500/50
                  active:scale-[0.98]
                "
              >
                <Sparkles className="w-4 h-4 mr-2 animate-pulse" />
                AI Prompt
              </Button>
              {/* 🚀 ENHANCED PROMPT BUTTON END 🚀 */}
              <Button
                variant="outline"
                size="sm"
                className="text-gray-300 border-gray-600 bg-gray-600 hover:border-gray-900 hover:text-gray-300 hover:bg-gray-600"
                onClick={runTest}
                disabled={nodes.length === 0 || isTesting}
              >
                {isTesting ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <Play className="w-4 h-4 mr-2" />
                )}
                Test
              </Button>
              
              <Button
                size="sm"
                className="bg-blue-600 hover:bg-blue-700 text-white transition-colors duration-200"
                onClick={applyWorkflow}
                disabled={nodes.length === 0 || !workflowName.trim() || isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    Submit
                    <Rocket className="w-4 h-4 ml-2" />
                  </>
                )}
              </Button>
              <Button
                size="sm"
                className="bg-gray-700 hover:bg-gray-600 text-white transition-colors duration-200"
                onClick={() => navigate('/dashboard')}
              >
                Back
                <ArrowLeft className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main content area that fills the remaining space */}
      <main className="flex flex-1 overflow-hidden">
        <ReactFlowProvider>
          <Sidebar addNode={addNode} />
          <div className="flex-1 relative">
            {/* AI Generated Banner */}
            {isAIGenerated && (
              <div className="absolute top-4 left-4 right-4 z-10">
                <Card className="bg-gradient-to-r from-cyan-500/20 to-blue-500/20 border-cyan-500/30 p-4"> {/* Blue/Cyan Accent */}
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-cyan-500/20 rounded-lg"> {/* Blue/Cyan Accent */}
                      <Bot className="w-5 h-5 text-cyan-400" /> {/* Blue/Cyan Accent */}
                    </div>
                    <div className="flex-1">
                      <h3 className="text-cyan-400 font-semibold">AI-Generated Workflow</h3> {/* Blue/Cyan Accent */}
                      <p className="text-gray-300 text-sm">This workflow was created by our AI. You can edit, add, or remove nodes as needed.</p>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-gray-400 hover:text-white"
                      onClick={() => {
                        // Clear the AI-generated flag and reset to empty workflow
                        navigate('/workflow');
                      }}
                    >
                      Start Fresh
                    </Button>
                  </div>
                </Card>
              </div>
            )}
            
            <WorkflowCanvas
              nodes={nodes}
              setNodes={setNodes}
              edges={edges}
              setEdges={setEdges}
              onNodeClick={selectNode}
            />
          </div>
          {selectedNodeId && (
            <NodeConfigPanel
              node={nodes.find((n) => n.id === selectedNodeId) || null}
              onClose={() => setSelectedNodeId(null)}
            />
          )}
        </ReactFlowProvider>
      </main>

      {/* Test Results Sidebar (Using Blue/Cyan Accents) */}
      {showTestResults && (
        <div className="absolute top-16 right-0 w-96 h-[calc(100vh-4rem)] bg-gray-900/95 backdrop-blur-sm border-l border-gray-800 z-20 overflow-y-auto">
          <div className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-white">Test Results</h2>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowTestResults(false)}
                className="text-gray-400 hover:text-white"
              >
                ×
              </Button>
            </div>

            {isTesting ? (
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <Loader2 className="w-5 h-5 text-cyan-400 animate-spin" /> {/* Blue/Cyan Accent */}
                  <span className="text-gray-300">Running tests...</span>
                </div>
                <div className="space-y-2">
                  {nodes.map((node) => (
                    <div key={node.id} className="flex items-center gap-3 p-3 bg-gray-800/50 rounded-lg">
                      <div className="w-2 h-2 bg-cyan-400 rounded-full animate-pulse" /> {/* Blue/Cyan Accent */}
                      <span className="text-gray-300 text-sm">{node.data.label}</span>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex items-center gap-2 mb-4">
                  <CheckCircle className="w-5 h-5 text-green-400" />
                  <span className="text-gray-300">Test completed</span>
                </div>
                
                {testResults.map((result) => (
                  <Card key={result.id} className="p-4 bg-gray-800/50 border-gray-600">
                    <div className="flex items-start gap-3">
                      <div className="flex-shrink-0 mt-1">
                        {result.status === 'success' ? (
                          <CheckCircle className="w-5 h-5 text-green-400" />
                        ) : (
                          <AlertCircle className="w-5 h-5 text-red-400" />
                        )}
                      </div>
                      <div className="flex-1">
                        <h3 className="text-white font-medium text-sm">{result.name}</h3>
                        <p className={`text-xs mt-1 ${
                          result.status === 'success' ? 'text-green-400' : 'text-red-400'
                        }`}>
                          {result.message}
                        </p>
                        <p className="text-gray-500 text-xs mt-2">
                          Duration: {result.duration}ms
                        </p>
                      </div>
                    </div>
                  </Card>
                ))}

                <div className="mt-6 p-4 bg-blue-500/10 border border-blue-500/30 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <Brain className="w-4 h-4 text-blue-400" />
                    <span className="text-blue-400 font-medium text-sm">Summary</span>
                  </div>
                  <p className="text-gray-300 text-xs">
                    {testResults.filter(r => r.status === 'success').length} of {testResults.length} tests passed
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
      {/* 🚀 ENHANCED PROMPT DRAGGABLE BOX START (Blue Theme) 🚀 */}
      {showPromptBox && (
        <div
          ref={promptBoxRef}
          style={{
            top: promptPos.y,
            left: promptPos.x,
            zIndex: 50,
            position: 'absolute',
            minWidth: 350,
            maxWidth: 440,
            // Dynamic transition based on state
            transform: isPromptBoxVisible ? 'scale(1) translate(0, 0)' : 'scale(0.8) translate(-10px, -10px)',
            opacity: isPromptBoxVisible ? 1 : 0,
            transition: 'transform 0.3s cubic-bezier(0.25, 0.8, 0.5, 1.2), opacity 0.3s ease-out',
            // Custom box shadow for depth - Using a deep blue glow
            boxShadow: '0 12px 40px rgba(0, 191, 255, 0.35)', 
            cursor: dragging?'move':undefined,
            userSelect: 'none',
          }}
          onMouseDown={onPromptMouseDown}
        >
          <Card className="
            // Themed Background & Border - Using Cyan
            bg-gray-900/95 backdrop-blur-md 
            border-2 border-cyan-500/50 
            rounded-xl overflow-hidden
            text-gray-100 p-5
          ">
            <div className="prompt-header flex items-center justify-between mb-4 cursor-move border-b border-cyan-500/20 pb-2"> {/* Cyan Border */}
              <span className="font-extrabold text-xl text-cyan-400 flex items-center gap-2"> {/* Cyan Text */}
                <Brain className="w-5 h-5" /> AI Command Center
              </span>
              <Button 
                size="sm" 
                variant="ghost" 
                className="text-gray-300 hover:text-white transition-colors p-1 h-auto" 
                onClick={closePromptBox}
              >
                <X className="w-5 h-5" />
              </Button>
            </div>
            
            <label htmlFor="ai-prompt-input" className="text-cyan-300 text-sm mb-2 font-semibold block">Describe the desired workflow change:</label> {/* Cyan Text */}
            <textarea
              id="ai-prompt-input"
              rows={4}
              value={promptInput}
              onChange={e => setPromptInput(e.target.value)}
              disabled={promptLoading}
              placeholder="e.g., 'Add a step after the Summarizer to check sentiment, and only email if it's negative.'"
              className="
                resize-none rounded-lg border-2 border-gray-700 
                bg-gray-800/50 px-4 py-3 w-full text-base 
                text-white placeholder:text-gray-400 
                focus:outline-none focus:border-cyan-500 transition-colors duration-200 
                mb-5
              "
            />
            <Button
              className="
                w-full 
                // Blue/Cyan Gradient
                bg-gradient-to-r from-cyan-500 to-blue-500 
                hover:from-cyan-600 hover:to-blue-600 
                text-gray-900 font-extrabold text-base 
                shadow-md shadow-cyan-500/50 // Blue/Cyan Shadow
                transition-all duration-300 ease-in-out 
                disabled:opacity-50 disabled:cursor-not-allowed
              "
              disabled={promptInput.trim().length === 0 || promptLoading}
              onClick={handleSendPrompt}
            >
              {promptLoading ? (
                <span className="flex items-center">
                  <Loader2 className="w-4 h-4 mr-2 animate-spin"/>Processing Command...
                </span>
              ) : (
                <span className="flex items-center justify-center">
                    <Sparkles className="w-5 h-5 mr-2" />
                    Generate/Modify Workflow
                </span>
              )}
            </Button>
          </Card>
        </div>
      )}
      {/* 🚀 ENHANCED PROMPT DRAGGABLE BOX END 🚀 */}
    </div>
  );
}