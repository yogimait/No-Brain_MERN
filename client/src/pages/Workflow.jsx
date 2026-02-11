



import { useState, useEffect } from 'react';
import { ReactFlowProvider } from 'reactflow';
import Sidebar from '../components/Sidebar';
import WorkflowCanvas from '../components/WorkflowCanvas';
import NodeConfigPanel from '../components/NodeConfigPanel';
import { Button } from '../components/ui/button';
import { Card } from '../components/ui/card';
import { toast } from 'sonner';
import NoBrainLogo from '../components/NoBrainLogo';
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
import { workflowAPI, nlpAPI } from '../services/api';
import { mapLabelToHandler, mapHandlerToDisplayLabel, nodeLabelToHandler } from '../services/nodeTypeMap';
import { getNodeByHandler, getIconForHandler, getDisplayLabel, isValidHandler } from '../services/nodeRegistry.jsx';
import { useAuth } from '../contexts/AuthContext';

export default function WorkflowEditorPage() {
  const navigate = useNavigate();
  const { getUserId } = useAuth();
  const [searchParams] = useSearchParams();
  const isAIGenerated = searchParams.get('mode') === 'ai-generated';

  const [nodes, setNodes] = useState([]);
  const [edges, setEdges] = useState([]);
  const [availableNodeTypes, setAvailableNodeTypes] = useState([]);
  const [selectedNodeId, setSelectedNodeId] = useState(null);
  // 🔴 Deprecated in v2 — execution state removed
  // showTestResults, isTesting, testResults removed
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
  // 🔴 Deprecated in v2 — execution state removed
  // isRunning, runResults, showRunResults removed

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

      console.log('📂 Loading workflow:', { workflowId, hasWorkflowData: !!workflowData });

      // fetch available node types once
      let types = [];
      try {
        const available = await nlpAPI.getAvailableNodes();
        types = (available && available.success && available.data && available.data.types) ? available.data.types : [];
        setAvailableNodeTypes(types);
      } catch (err) {
        console.warn('Could not fetch available node types:', err);
      }

      const processNodes = (nodes) => {
        console.log('🔄 Processing nodes:', nodes?.length || 0);
        // Reconstruct nodes with proper icons and structure
        return (nodes || []).map(node => {
          // Get the handler type - use existing type or map from label
          let handler = node.type || node.data?.handlerType;
          if (!handler || (types.length > 0 && !types.includes(handler))) {
            const mapped = mapLabelToHandler(node.data?.label || node.label || '');
            handler = (types.length === 0 || types.includes(mapped)) ? mapped : 'dataFetcher';
          }

          const displayLabel = node.data?.label || mapHandlerToDisplayLabel(handler);
          return {
            ...node,
            type: handler,
            data: {
              ...node.data,
              // Reconstruct icon based on display label
              icon: getIconForLabel(displayLabel),
              label: displayLabel,
              handlerType: handler
            }
          };
        });
      };

      // If we have full workflow data, use it directly
      if (workflowData && workflowData.graph) {
        console.log('✅ Using workflowData from location.state');
        setCurrentWorkflowId(workflowId || workflowData._id);
        setWorkflowName(workflowData.name || '');
        const processedNodes = processNodes(workflowData.graph.nodes);
        console.log('📊 Processed nodes:', processedNodes);
        setNodes(processedNodes);
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

      console.log('🤔 Sending workflow modification prompt to Gemini:', modificationPrompt);

      // Call Gemini API to generate modified workflow
      const response = await nlpAPI.generateWorkflow(modificationPrompt);

      console.log('✅ Gemini response for modification:', response);

      if (response && response.success && response.data && response.data.workflow) {
        const modifiedWorkflow = response.data.workflow;

        // Ensure we have the list of backend-supported node types
        const availableResp = await nlpAPI.getAvailableNodes();
        const availableTypes = (availableResp && availableResp.success && availableResp.data && availableResp.data.types) ? availableResp.data.types : [];

        // Process the returned nodes and edges
        const newNodes = (modifiedWorkflow.nodes || []).map((node, idx) => {
          // Determine handlerKey: prefer explicit handler key if it matches available types
          let handlerKey = node.type;
          if (!handlerKey || !availableTypes.includes(handlerKey)) {
            // Try mapping by label
            const mapped = mapLabelToHandler(node.data?.label || node.label || '');
            handlerKey = availableTypes.includes(mapped) ? mapped : 'dataFetcher';
          }

          if (!availableTypes.includes(handlerKey)) {
            console.warn('Replacing unsupported node type with dataFetcher:', node.type, '-> dataFetcher');
            handlerKey = 'dataFetcher';
          }

          const displayLabel = mapHandlerToDisplayLabel(handlerKey);

          return {
            id: node.id || `ai-mod-${idx}-${Date.now()}`,
            type: handlerKey,
            position: node.position || { x: 100 + idx * 250, y: 100 },
            data: {
              label: displayLabel,
              icon: getIconForLabel(displayLabel),
              handlerType: handlerKey,
              ...node.data
            }
          };
        });

        // Build edge list mapping labels to ids when necessary
        const labelToId = new Map(newNodes.map(n => [n.data.label.toString().trim().toLowerCase(), n.id]));

        const newEdges = (modifiedWorkflow.edges || []).map((edge, idx) => {
          let source = edge.source || edge.from || '';
          let target = edge.target || edge.to || '';

          // If source/target are labels, map to node ids
          if (!newNodes.find(n => n.id === source)) {
            const maybe = ('' + source).toLowerCase().trim();
            if (labelToId.has(maybe)) source = labelToId.get(maybe);
          }
          if (!newNodes.find(n => n.id === target)) {
            const maybe = ('' + target).toLowerCase().trim();
            if (labelToId.has(maybe)) target = labelToId.get(maybe);
          }

          return {
            id: edge.id || `ai-edge-${idx}-${Date.now()}`,
            source,
            target,
            type: edge.type || 'step'
          };
        }).filter(e => e.source && e.target);

        setNodes(newNodes);
        setEdges(newEdges);

        toast.success(`✨ Workflow modified! Added/updated ${newNodes.length} nodes.`);
        console.log('✅ Workflow successfully modified with Gemini AI');
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
          const id = node.id || `ai-node-${idx}-${Math.round(Math.random() * 10000)}`;
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
            id: edge.id || `ai-edge-${idx}-${Math.round(Math.random() * 10000)}`,
            source,
            target,
            type: edge.type || 'step'
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

  // addNode now accepts handler key directly from sidebar (no label mapping needed)
  const addNode = (handlerKey) => {
    // If handlerKey is not valid, try to map it from label (backward compatibility)
    let actualHandler = handlerKey;
    if (!isValidHandler(handlerKey)) {
      actualHandler = mapLabelToHandler(handlerKey);
    }

    // Get node data from registry
    const nodeData = getNodeByHandler(actualHandler);
    const displayLabel = nodeData?.label || getDisplayLabel(actualHandler);
    const icon = getIconForHandler(actualHandler, 16);

    // Position at viewport center with random offset to prevent overlap
    // Default viewport center approximation (will be updated when we have ReactFlow instance)
    const viewportCenterX = 400;
    const viewportCenterY = 300;
    const randomOffsetX = (Math.random() - 0.5) * 150;
    const randomOffsetY = (Math.random() - 0.5) * 150;

    const newNode = {
      id: String(Date.now() + Math.random()),
      type: actualHandler,
      position: {
        x: viewportCenterX + randomOffsetX,
        y: viewportCenterY + randomOffsetY
      },
      data: { label: displayLabel, icon: icon, handlerType: actualHandler },
    };
    setNodes((prev) => [...prev, newNode]);
  };

  const selectNode = (id) => {
    setSelectedNodeId(id);
  };

  // 🔴 v2: Validate Structure replaces Test — validates graph without executing
  const handleValidateStructure = () => {
    if (nodes.length === 0) {
      toast.error('Please add at least one node to validate.');
      return;
    }

    const issues = [];

    // Check for disconnected nodes
    const connectedIds = new Set();
    edges.forEach(e => { connectedIds.add(e.source); connectedIds.add(e.target); });
    const disconnected = nodes.filter(n => !connectedIds.has(n.id) && nodes.length > 1);
    if (disconnected.length > 0) {
      issues.push(`${disconnected.length} disconnected node(s): ${disconnected.map(n => n.data?.label || n.id).join(', ')}`);
    }

    // Check for cycles (simple DFS)
    const adj = new Map();
    nodes.forEach(n => adj.set(n.id, []));
    edges.forEach(e => { if (adj.has(e.source)) adj.get(e.source).push(e.target); });
    const visited = new Set();
    const inStack = new Set();
    let hasCycle = false;
    const dfs = (id) => {
      visited.add(id); inStack.add(id);
      for (const neighbor of (adj.get(id) || [])) {
        if (inStack.has(neighbor)) { hasCycle = true; return; }
        if (!visited.has(neighbor)) dfs(neighbor);
        if (hasCycle) return;
      }
      inStack.delete(id);
    };
    nodes.forEach(n => { if (!visited.has(n.id)) dfs(n.id); });
    if (hasCycle) issues.push('Cycle detected — workflows must be acyclic (DAG).');

    // Check for missing labels
    const unlabeled = nodes.filter(n => !n.data?.label);
    if (unlabeled.length > 0) issues.push(`${unlabeled.length} node(s) without labels.`);

    // Check for entry point
    const hasIncoming = new Set(edges.map(e => e.target));
    const entryPoints = nodes.filter(n => !hasIncoming.has(n.id));
    if (entryPoints.length === 0 && nodes.length > 1) issues.push('No entry point found — every node has incoming edges.');

    if (issues.length === 0) {
      toast.success(`✅ Workflow structure is valid — ${nodes.length} nodes, ${edges.length} connections.`);
    } else {
      issues.forEach(issue => toast.warning(issue));
      toast.info(`Validation found ${issues.length} issue(s).`);
    }
  };

  // 🔴 v2: Preview Logic replaces Run — no execution, planning mode only
  const handlePreviewLogic = () => {
    if (nodes.length === 0) {
      toast.error('Please add at least one node to preview.');
      return;
    }
    toast.info(
      `📋 NoBrain v2 focuses on workflow planning & explanation. ` +
      `Your workflow has ${nodes.length} nodes and ${edges.length} connections. ` +
      `Use "Validate Structure" to check for issues.`
    );
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
              <NoBrainLogo />
              <span className="text-xl font-semibold text-gray-300">
                / {workflowName || 'New Workflow'}
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
                onClick={handleValidateStructure}
                disabled={nodes.length === 0}
              >
                <CheckCircle className="w-4 h-4 mr-2" />
                Validate Structure
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="text-gray-300 border-gray-600 bg-gray-600 hover:border-gray-900 hover:text-gray-300 hover:bg-gray-600"
                onClick={handlePreviewLogic}
                disabled={nodes.length === 0}
              >
                <Brain className="w-4 h-4 mr-2" />
                Preview Logic
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

      {/* 🔴 v2: Test Results Sidebar and Run Results Sidebar removed — execution deprecated */}
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
            cursor: dragging ? 'move' : undefined,
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
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />Processing Command...
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
