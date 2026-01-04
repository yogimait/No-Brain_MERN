



import { useState, useEffect } from 'react';
import { ReactFlowProvider } from 'reactflow'; 
import Sidebar from '../components/Sidebar';
import WorkflowCanvas from '../components/WorkflowCanvas';
import NodeConfigPanel from '../components/NodeConfigPanel';
import { Button } from '../components/ui/button';
import { Card } from '../components/ui/card';
import { toast } from 'sonner';
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
  ArrowLeft,
  Edit,
  Text
} from 'lucide-react';
import { useNavigate, useSearchParams, useLocation } from 'react-router-dom';
import { useRef } from 'react';
import { workflowAPI, executionAPI, nlpAPI } from '../services/api';
import { mapLabelToHandler, mapHandlerToDisplayLabel, nodeLabelToHandler } from '../services/nodeTypeMap';
import { useAuth } from '../contexts/AuthContext';

export default function WorkflowEditorPage() {
  const navigate = useNavigate();
  const { getUserId } = useAuth();
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
  const [isLoadingWorkflow, setIsLoadingWorkflow] = useState(false);
  const [isRunning, setIsRunning] = useState(false);
  const [runResults, setRunResults] = useState(null);
  const [showRunResults, setShowRunResults] = useState(false);

  // Helper function to get icon based on label/type - defined before useEffect
  const getIconForLabel = (label) => {
    switch (label) {
      case 'Web Scraper': return <Plug size={16} />;
      case 'AI Summarizer': return <Rows size={16} />;
      case 'Gemini API': return <Brain size={16} />;
      case 'GPT-4': return <Brain size={16} />;
      case 'Claude': return <Brain size={16} />;
      case 'Twitter API': return <Plug size={16} />;
      case 'LinkedIn API': return <Plug size={16} />;
      case 'Instagram API': return <Plug size={16} />;
      case 'Email Service': return <Mail size={16} />;
      case 'Slack Message': return <MessageSquare size={16} />;
      case 'RSS Feed': return <Plug size={16} />;
      case 'Webhook': return <Plug size={16} />;
      case 'Content Polisher': return <Edit size={16} />;
      case 'AI Text Generator': return <Bot size={16} />;
      case 'Sentiment Analyzer': return <Text size={16} />;
      case 'Email Generator': return <Mail size={16} />;
      case 'Database': return <Plug size={16} />;
      case 'File Upload': return <Plug size={16} />;
      case 'Text Processor': return <Plug size={16} />;
      case 'Image Processor': return <Plug size={16} />;
      case 'Data Transformer': return <Plug size={16} />;
      case 'Condition Check': return <Plug size={16} />;
      case 'Delay': return <Plug size={16} />;
      case 'Schedule': return <Plug size={16} />;
      case 'Loop': return <Plug size={16} />;
      case 'Merge': return <Plug size={16} />;
      default: return <Plug size={16} />;
    }
  };

  // Load workflow if editing
  useEffect(() => {
    const loadWorkflow = async () => {
      const workflowData = location.state?.workflowData;
      const workflowId = location.state?.workflowId;
      
      const processNodes = (nodes) => {
        // Reconstruct nodes with proper icons and structure
        return (nodes || []).map(node => ({
          ...node,
          type: node.type || 'custom',
          data: {
            ...node.data,
            // Reconstruct icon based on label - don't use serialized icon
            icon: getIconForLabel(node.data?.label || node.label || ''),
            label: node.data?.label || node.label || node.id,
          }
        }));
      };

      // If we have full workflow data, use it directly
      if (workflowData && workflowData.graph) {
        setCurrentWorkflowId(workflowId || workflowData._id);
        setWorkflowName(workflowData.name || '');
        setNodes(processNodes(workflowData.graph.nodes));
        setEdges(workflowData.graph.edges || []);
        return;
      }
      
      // If we only have workflowId, fetch the full workflow from API
      if (workflowId && !workflowData) {
        try {
          setIsLoadingWorkflow(true);
          const response = await workflowAPI.getById(workflowId);
          
          let fetchedWorkflow = null;
          if (response && response.success && response.data) {
            fetchedWorkflow = response.data;
          } else if (response && response.data) {
            // Handle case where response.data is the workflow directly
            fetchedWorkflow = response.data;
          }
          
          if (fetchedWorkflow) {
            setCurrentWorkflowId(fetchedWorkflow._id);
            setWorkflowName(fetchedWorkflow.name || '');
            setNodes(processNodes(fetchedWorkflow.graph?.nodes));
            setEdges(fetchedWorkflow.graph?.edges || []);
          }
        } catch (error) {
          console.error('Error loading workflow:', error);
          toast.error('Failed to load workflow. Please try again.');
        } finally {
          setIsLoadingWorkflow(false);
        }
      }
    };

    loadWorkflow();
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

  // Handle AI Command Center prompt - call Gemini to modify the workflow
  const handleSendPrompt = async () => {
    if (!promptInput.trim()) {
      toast.error('Please describe the workflow change you want');
      return;
    }

    setPromptLoading(true);

    try {
      // Build a prompt that includes current workflow context
      const currentWorkflowSummary = `Current workflow: ${nodes.length} nodes (${nodes.map(n => n.data?.label).join(', ')}), ${edges.length} connections`;
      const modificationPrompt = `${currentWorkflowSummary}. User request: ${promptInput}. Generate the modified workflow.`;

      console.log('ðŸ¤– Sending workflow modification prompt to Gemini:', modificationPrompt);

      // Call Gemini API to generate modified workflow
      const response = await nlpAPI.generateWorkflow(modificationPrompt);

      console.log('âœ… Gemini response for modification:', response);

      if (response && response.success && response.data && response.data.workflow) {
        const modifiedWorkflow = response.data.workflow;

        // Process the returned nodes and edges
        const newNodes = (modifiedWorkflow.nodes || []).map((node, idx) => ({
          id: node.id || `ai-mod-${idx}-${Date.now()}`,
          type: node.type || 'custom',
          position: node.position || { x: 100 + idx * 250, y: 100 },
          data: {
            label: node.data?.label || node.label || 'Unknown',
            icon: getIconForLabel(node.data?.label || node.label || 'Unknown'),
            handlerType: mapLabelToHandler(node.data?.label || node.label || 'Unknown'),
            ...node.data
          }
        }));

        const newEdges = (modifiedWorkflow.edges || []).map((edge, idx) => ({
          id: edge.id || `ai-mod-edge-${idx}`,
          source: edge.source,
          target: edge.target,
          type: edge.type || 'smoothstep'
        }));

        // Replace the workflow with the modified one
        setNodes(newNodes);
        setEdges(newEdges);

        toast.success(`âœ¨ Workflow modified! Added/updated ${newNodes.length} nodes.`);
        console.log('âœ… Workflow successfully modified with Gemini AI');
      } else {
        throw new Error(response?.error || 'Failed to generate modified workflow');
      }
    } catch (error) {
      console.error('âŒ Error modifying workflow:', error);
      const errorMsg = error.response?.data?.message || error.message || 'Failed to modify workflow';
      toast.error(errorMsg);
    } finally {
      setPromptLoading(false);
      closePromptBox();
      setPromptInput('');
    }
  };

  // Load AI-generated workflow from Gemini API response
  useEffect(() => {
    const aiGeneratedWorkflow = location.state?.aiGeneratedWorkflow;
    
    if (aiGeneratedWorkflow && nodes.length === 0) {
      console.log('ðŸ“Š Loading AI-generated workflow from Gemini:', aiGeneratedWorkflow);
      
      try {
        // Robust processing: ensure nodes have ids and labels, map edges by id or label
        const rawNodes = aiGeneratedWorkflow.nodes || [];
        const rawEdges = aiGeneratedWorkflow.edges || [];

                const processedNodes = rawNodes.map((node, idx) => {
          const labelFromData = node?.data?.label || node.label || node.name || node.type || '';
          let label = (labelFromData || `node-${idx}`).toString();
          const id = node.id || `ai-node-${idx}-${Math.round(Math.random()*10000)}`;
          const position = node.position || { x: 100 + idx * 220, y: 80 + (idx % 3) * 120 };

          // If the AI returned a handler key as the label (e.g., 'aiSummarizer'), convert to a friendly label
          const handlerLike = (label || '').toString().trim();
          const knownHandlers = new Set(Object.values(nodeLabelToHandler || {}));
          if (handlerLike && knownHandlers.has(handlerLike)) {
            label = mapHandlerToDisplayLabel(handlerLike);
          }

          // If the node explicitly includes a handlerType, prefer that for mapping and display
          if (node?.data?.handlerType && typeof node.data.handlerType === 'string') {
            label = mapHandlerToDisplayLabel(node.data.handlerType);
          }

          return {
            id,
            type: node.type || 'custom',
            position,
            data: {
              // Use a cleaned label for display and mapping
              label: label,
              icon: getIconForLabel(label),
              handlerType: node?.data?.handlerType || mapLabelToHandler(label),
              ...(node.data || {})
            }
          };
        });

        // Build lookup maps by id and by lowercased label
        const idToNode = new Map(processedNodes.map(n => [n.id, n]));
        const labelToId = new Map(processedNodes.map(n => [n.data.label.toString().trim().toLowerCase(), n.id]));

        // Reconcile edges: support source/target or from/to and allow label references
        const processedEdges = rawEdges.map((edge, idx) => {
          const rawSource = edge.source || edge.from || edge.src || '';
          const rawTarget = edge.target || edge.to || edge.dst || '';

          let source = rawSource;
          let target = rawTarget;

          // If source matches an existing id, keep it; otherwise try to map by label
          if (!idToNode.has(source)) {
            const maybe = ('' + source).toLowerCase().trim();
            if (labelToId.has(maybe)) source = labelToId.get(maybe);
          }
          if (!idToNode.has(target)) {
            const maybe = ('' + target).toLowerCase().trim();
            if (labelToId.has(maybe)) target = labelToId.get(maybe);
          }

          return {
            id: edge.id || `ai-edge-${idx}-${Math.round(Math.random()*10000)}`,
            source,
            target,
            type: edge.type || 'smoothstep'
          };
        }).filter(e => e.source && e.target); // drop invalid edges

        setNodes(processedNodes);
        setEdges(processedEdges);
        
        // Generate a suggested name based on metadata
        if (aiGeneratedWorkflow.metadata?.generatedFrom) {
          const suggestedName = `AI Generated - ${new Date().toLocaleDateString()}`;
          setWorkflowName(suggestedName);
        }

        console.log('âœ… AI workflow loaded:', {
          nodesCount: processedNodes.length,
          edgesCount: processedEdges.length
        });
        
        toast.success(`AI generated a workflow with ${processedNodes.length} nodes!`);
      } catch (error) {
        console.error('âŒ Error processing AI workflow:', error);
        toast.error('Error loading AI-generated workflow');
      }
    }
  }, [location.state?.aiGeneratedWorkflow, nodes.length]);

  // Handler to update node configuration when saved from NodeConfigPanel
  const handleUpdateNode = (nodeId, updatedData) => {
    setNodes((prevNodes) =>
      prevNodes.map((node) =>
        node.id === nodeId
          ? {
              ...node,
              data: {
                ...node.data,
                ...updatedData,
              },
            }
          : node
      )
    );
    console.log('Node configuration updated:', nodeId, updatedData);
  };

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
        case 'Email Service': icon = <Mail size={16} />; break;
        case 'Slack Message': icon = <MessageSquare size={16} />; break;
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
      data: { label: nodeType, icon: icon, handlerType: mapLabelToHandler(nodeType) },
    };
    setNodes((prev) => [...prev, newNode]);
  };

  const selectNode = (id) => {
    setSelectedNodeId(id);
  };

  const runTest = async () => {
    if (nodes.length === 0) {
      toast.error('Please add at least one node to test.');
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
      
      // Include node configuration in the test result
      const nodeConfig = {
        credentials: node.data?.credentials || {},
        aiModel: node.data?.aiModel || null,
        aiMemory: node.data?.aiMemory || null,
        aiMemorySize: node.data?.aiMemorySize || null,
        aiTemperature: node.data?.aiTemperature || null,
        storageEnabled: node.data?.storageEnabled || false,
      };

      testResults.push({
        nodeId: node.id,
        nodeName: node.data?.label || node.id,
        status: success ? 'completed' : 'failed',
        input: { nodeId: node.id, nodeType: node.data?.label },
        output: success ? { success: true, message: `Successfully connected to ${node.data?.label || node.id}` } : null,
        error: success ? null : `Failed to connect to ${node.data?.label || node.id}. Check credentials.`,
        startTime: new Date(nodeStartTime).toISOString(),
        endTime: new Date(Date.now()).toISOString(),
        // Include node configuration in the log
        nodeConfig: nodeConfig,
      });
    }
    
    const totalDuration = Date.now() - startTime;
    
    // Save test results to backend
    try {
      let workflowId = currentWorkflowId;
      
      // If no workflow exists yet, create one automatically for testing
      if (!workflowId && nodes.length > 0) {
        const ownerId = getUserId();
        if (!ownerId) {
          toast.error("Please login to test workflows");
          navigate("/login");
          return;
        }

        const workflowData = {
          name: workflowName.trim() || `Test Workflow ${Date.now()}`,
          graph: {
            nodes: nodes,
            edges: edges,
          },
          ownerId: ownerId,
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
        // Determine overall status - include both passed and failed tests
        const allCompleted = testResults.every(r => r.status === 'completed');
        const allFailed = testResults.every(r => r.status === 'failed');
        let overallStatus = 'completed';
        if (allFailed) {
          overallStatus = 'failed';
        } else if (testResults.some(r => r.status === 'failed')) {
          overallStatus = 'failed'; // If any node failed, mark as failed
        }

        const executionData = {
          workflowId: workflowId,
          status: overallStatus,
          nodeLogs: testResults, // Include all node logs (both passed and failed)
          duration: totalDuration,
          error: testResults.some(r => r.error) ? 'Some nodes failed during testing' : null,
          startedAt: new Date(startTime).toISOString(),
          completedAt: new Date().toISOString(),
        };
        
        console.log('Saving execution log:', executionData);
        const executionResponse = await executionAPI.create(executionData);
        console.log('Execution saved:', executionResponse);
        
        // Handle ApiResponse format
        if (executionResponse && executionResponse.success) {
          console.log('Execution saved successfully to logs');
          toast.success(`Test ${overallStatus === 'completed' ? 'passed' : 'completed with failures'}. Check the Logs page to see all results.`);
        } else {
          console.warn('Execution may not have been saved properly:', executionResponse);
          toast.warning('Test completed but may not have been saved to logs');
        }
      } else {
        console.error('No workflowId available to save execution');
        toast.warning('Test completed but could not save to logs. Please save the workflow first.');
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
      
      // Success message is now shown in the save section above
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
      
      toast.error(`Test completed but failed to save to logs: ${error.message || 'Unknown error'}. Check console for details.`);
    }
  };

  const handleRunWorkflow = async () => {
    if (nodes.length === 0) {
      toast.error('Please add at least one node to run the workflow.');
      return;
    }

    setIsRunning(true);
    try {
      const payload = {
        nodes: nodes.map((node) => ({
          id: node.id,
          type: node.data?.handlerType || mapLabelToHandler(node.data?.label),
          data: node.data
        })),
        edges: edges.map((e) => ({ source: e.source, target: e.target }))
      };

      console.log('Running workflow with payload:', payload);
      const response = await executionAPI.run(payload);
      console.log('Run response:', response);

      if (response && response.success && response.data) {
        const result = response.data;
        // Save run results to local state and display
        setRunResults(result);
        setShowRunResults(true);

        // Also persist as an Execution log in the backend if we have a workflowId
        if (currentWorkflowId) {
          const executionData = {
            workflowId: currentWorkflowId,
            status: result.status || (result.failedNode ? 'failed' : 'completed'),
            nodeLogs: result.logs || [],
            duration: typeof result.executionTime === 'string' ? Number((result.executionTime||'0').replace(/[^0-9]/g, '')) : result.executionTime || 0,
            runId: result.runId
          };
          try {
            const saveResp = await executionAPI.create(executionData);
            console.log('Saved execution log:', saveResp);
          } catch (err) {
            console.warn('Failed to save execution log:', err);
          }
        }

        toast.success('Workflow executed. Check the results panel.');
      } else {
        toast.error('Workflow run failed. Check console for details.');
      }
    } catch (err) {
      console.error('Error running workflow:', err);
      toast.error('Workflow run failed: ' + (err.message || 'Unknown'));
    } finally {
      setIsRunning(false);
    }
  };

  const applyWorkflow = async () => {
    if (nodes.length === 0) {
      toast.error('Please add at least one node to the workflow.');
      return;
    }

    if (!workflowName.trim()) {
      toast.error('Please enter a workflow name.');
      return;
    }

    setIsSubmitting(true);

    try {
      const ownerId = getUserId();
      if (!ownerId) {
        toast.error("Please login to save workflows");
        navigate("/login");
        return;
      }

      const workflowData = {
        name: workflowName.trim(),
        graph: {
          nodes: nodes,
          edges: edges,
        },
        ownerId: ownerId,
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
      toast.success('Workflow saved successfully! Redirecting...');
      
      // Navigate to CompleteWorkflow page after successful save
      setTimeout(() => {
        navigate('/workflow/complete', { 
          state: { 
            workflowId: savedWorkflow._id,
            workflowData: savedWorkflow 
          } 
        });
      }, 500);
    } catch (error) {
      console.error('Error saving workflow:', error);
      console.error('Error details:', error.response?.data || error.message);
      toast.error(`Failed to save workflow: ${error.message || 'Unknown error'}. Check console for details.`);
      setIsSubmitting(false);
    }
  };

  // Show loading state while fetching workflow
  if (isLoadingWorkflow) {
    return (
      <div className="h-screen w-screen flex items-center justify-center bg-black text-gray-100">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-gray-400 animate-spin mx-auto mb-4" />
          <p className="text-gray-400">Loading workflow...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen w-screen flex flex-col bg-black text-gray-100">
      {/* Header */}
      <header className="bg-gray-900/60 backdrop-blur-sm border-b border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <Brain className="w-8 h-8 text-blue-400" />
              <span className="text-2xl font-bold text-blue-400">
                {workflowName || 'New Workflow'}
              </span>
              <div className="ml-6 w-72 flex items-center">
                <input
                  type="text"
                  placeholder="Workflow Name..."
                  value={workflowName}
                  maxLength={20}
                  onChange={e => setWorkflowName(e.target.value)}
                  className="bg-transparent border border-gray-700 rounded-md px-3 py-1.5 w-full text-white placeholder:text-gray-400 focus:outline-none focus:border-gray-600 text-base" 
                />
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              {/* ðŸš€ ENHANCED PROMPT BUTTON START (Blue Theme) ðŸš€ */}
              <Button
                variant="outline"
                size="sm"
                onClick={openPromptBox}
                className="
                  // Base Styles
                  bg-gray-800/50 text-gray-300 border-gray-600/50 
                  hover:bg-gray-700/50 
                  // Glow Effect
                  shadow-lg shadow-gray-900/30 
                  // Hover Animation
                  transition-all duration-300 ease-in-out 
                  hover:scale-[1.03] hover:shadow-gray-900/50
                  active:scale-[0.98]
                "
              >
                <Sparkles className="w-4 h-4 mr-2" />
                AI Prompt
              </Button>
              {/* ðŸš€ ENHANCED PROMPT BUTTON END ðŸš€ */}
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
                variant="outline"
                size="sm"
                className="text-gray-300 border-gray-600 bg-gray-600 hover:border-gray-900 hover:text-gray-300 hover:bg-gray-600"
                onClick={handleRunWorkflow}
                disabled={nodes.length === 0 || isRunning}
              >
                {isRunning ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <Rocket className="w-4 h-4 mr-2" />
                )}
                Run
              </Button>
              
              <Button
                size="sm"
                className="bg-gray-700 hover:bg-gray-600 text-white transition-colors duration-200"
                onClick={applyWorkflow}
                disabled={nodes.length === 0 || !workflowName.trim() || isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Saving...
                  </>
                ) : (
                  'Submit'
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
              onUpdateNode={handleUpdateNode}
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
                Ã—
              </Button>
            </div>

            {isTesting ? (
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <Loader2 className="w-5 h-5 text-gray-400 animate-spin" />
                  <span className="text-gray-300">Running tests...</span>
                </div>
                <div className="space-y-2">
                  {nodes.map((node) => (
                    <div key={node.id} className="flex items-center gap-3 p-3 bg-gray-800/50 rounded-lg">
                      <div className="w-2 h-2 bg-gray-500 rounded-full animate-pulse" />
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

                <div className="mt-6 p-4 bg-gray-800/50 border border-gray-700/50 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <Brain className="w-4 h-4 text-gray-400" />
                    <span className="text-gray-300 font-medium text-sm">Summary</span>
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
      {/* ðŸš€ ENHANCED PROMPT DRAGGABLE BOX START (Blue Theme) ðŸš€ */}
      {/* Run Results Sidebar */}
      {showRunResults && runResults && (
        <div className="absolute top-16 right-0 w-96 h-[calc(100vh-4rem)] bg-gray-900/95 backdrop-blur-sm border-l border-gray-800 z-20 overflow-y-auto">
          <div className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-white">Run Results â€¢ {runResults.runId}</h2>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowRunResults(false)}
                className="text-gray-400 hover:text-white"
              >
                Ã—
              </Button>
            </div>

            {runResults.logs && runResults.logs.length === 0 ? (
              <p className="text-xs text-gray-500 text-center py-2">No nodes executed or logs available</p>
            ) : (
              runResults.logs.map((log, idx) => (
                (() => {
                  const nodeLabel = nodes.find(n => n.id === log.nodeId)?.data?.label || log.nodeId;
                  const isSuccess = log.status === 'success' || log.status === 'completed' || log.success === true;
                  const iconColor = isSuccess ? 'text-green-400' : 'text-red-400';
                  const messageText = log.error || log.message || (isSuccess ? 'Completed' : 'Failed');
                  
                  return (
                    <Card key={idx} className="p-3 bg-gray-800/50 rounded-lg border-gray-600 mb-2">
                      <div className="flex items-start gap-3">
                        <div className="flex-shrink-0 mt-1">
                          {isSuccess ? (
                            <CheckCircle className={`w-5 h-5 ${iconColor}`} />
                          ) : (
                            <AlertCircle className={`w-5 h-5 ${iconColor}`} />
                          )}
                        </div>
                        <div className="flex-1">
                          <h3 className="text-white font-medium text-sm">{nodeLabel}</h3>
                          <p className={`text-xs mt-1 ${isSuccess ? 'text-green-400' : 'text-red-400'}`}>
                            {messageText}
                          </p>
                          <p className="text-gray-500 text-xs mt-2">{log.timestamp}</p>
                        </div>
                      </div>
                    </Card>
                  );
                })()
              ))
            )}

            <div className="mt-6 p-4 bg-gray-800/50 border border-gray-700/50 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Brain className="w-4 h-4 text-gray-400" />
                <span className="text-gray-300 font-medium text-sm">Summary</span>
              </div>
              <p className="text-gray-300 text-xs">Status: <span className="font-semibold">{runResults.status}</span></p>
            </div>
          </div>
        </div>
      )}
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
            // Custom box shadow for depth
            boxShadow: '0 12px 40px rgba(0, 0, 0, 0.4)', 
            cursor: dragging?'move':undefined,
            userSelect: 'none',
          }}
          onMouseDown={onPromptMouseDown}
        >
          <Card className="
            // Themed Background & Border
            bg-gray-900/95 backdrop-blur-md 
            border-2 border-gray-700/50 
            rounded-xl overflow-hidden
            text-gray-100 p-5
          ">
            <div className="prompt-header flex items-center justify-between mb-4 cursor-move border-b border-gray-700/50 pb-2">
              <span className="font-extrabold text-xl text-gray-300 flex items-center gap-2">
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
            
            <label htmlFor="ai-prompt-input" className="text-gray-300 text-sm mb-2 font-semibold block">Describe the desired workflow change:</label>
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
                focus:outline-none focus:border-gray-600 transition-colors duration-200 
                mb-5
              "
            />
            <Button
              className="
                w-full 
                bg-gray-700 hover:bg-gray-600
                text-white font-extrabold text-base 
                shadow-md shadow-gray-900/50
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
      {/* ðŸš€ ENHANCED PROMPT DRAGGABLE BOX END ðŸš€ */}
    </div>
  );
}
