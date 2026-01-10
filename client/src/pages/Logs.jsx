import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FileText,
  CheckCircle,
  XCircle,
  Clock,
  AlertCircle,
  LayoutDashboard,
  ArrowLeft,
  RefreshCw,
  Brain,
  Play,
  Loader2,
  Trash2
} from 'lucide-react';
import { executionAPI, workflowAPI } from '../services/api';
import { Button } from '../components/ui/button';
import { Card } from '../components/ui/card';
import { Vortex } from '../components/ui/vortex';
import { useAuth } from '../contexts/AuthContext';
import { toast } from 'sonner';
import { ConfirmationDialog } from '../components/ui/confirmation-dialog';
import NoBrainLogo from "../components/NoBrainLogo";

export default function LogsPage() {
  const navigate = useNavigate();
  const { getUserId } = useAuth();
  const [executions, setExecutions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedExecution, setSelectedExecution] = useState(null);
  const [deletingExecution, setDeletingExecution] = useState(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [executionToDelete, setExecutionToDelete] = useState(null);
  const [userWorkflows, setUserWorkflows] = useState([]);
  const [workflowNodesMap, setWorkflowNodesMap] = useState({});

  useEffect(() => {
    fetchUserWorkflows();
  }, []);

  useEffect(() => {
    if (userWorkflows.length >= 0) { // Changed to >= 0 to fetch even if no workflows
      fetchExecutions();
    }
  }, [userWorkflows]);

  // Fetch user's workflows first to filter executions
  const fetchUserWorkflows = async () => {
    try {
      const ownerId = getUserId();
      if (!ownerId) {
        toast.error("Please login to view logs");
        navigate("/login");
        return;
      }

      const response = await workflowAPI.getAll({ ownerId });
      if (response && response.success && response.data) {
        const workflows = Array.isArray(response.data) ? response.data : [];
        setUserWorkflows(workflows);

        // Create a map of workflow nodes for easy lookup
        const nodesMap = {};
        workflows.forEach(workflow => {
          if (workflow.graph && workflow.graph.nodes) {
            workflow.graph.nodes.forEach(node => {
              // Use node ID as key, store the full node data
              nodesMap[node.id] = {
                ...node,
                workflowId: workflow._id,
                workflowName: workflow.name
              };
            });
          }
        });
        setWorkflowNodesMap(nodesMap);
      } else {
        setUserWorkflows([]);
        setWorkflowNodesMap({});
      }
    } catch (error) {
      console.error('Error fetching workflows:', error);
      setUserWorkflows([]);
      setWorkflowNodesMap({});
    }
  };

  const fetchExecutions = async () => {
    try {
      setLoading(true);
      const response = await executionAPI.getAll({ limit: 100 });

      if (response && response.success && response.data) {
        let allExecutions = [];

        // Handle different response formats
        if (response.data.executions && Array.isArray(response.data.executions)) {
          allExecutions = response.data.executions;
        } else if (Array.isArray(response.data)) {
          allExecutions = response.data;
        }

        // Filter executions to only show those belonging to user's workflows
        // Also include all executions (both passed and failed tests)
        const userWorkflowIds = userWorkflows.map(w => w._id.toString());
        const filteredExecutions = allExecutions.filter(execution => {
          const workflowId = execution.workflowId?._id || execution.workflowId;
          if (!workflowId) return false;

          // Check if execution belongs to user's workflow
          const workflowIdStr = workflowId.toString();
          return userWorkflowIds.includes(workflowIdStr);
        });

        // Sort by most recent first
        filteredExecutions.sort((a, b) => {
          const dateA = new Date(a.createdAt || a.startedAt || 0);
          const dateB = new Date(b.createdAt || b.startedAt || 0);
          return dateB - dateA;
        });

        setExecutions(filteredExecutions);
      } else {
        setExecutions([]);
      }
    } catch (error) {
      console.error('Error fetching executions:', error);
      toast.error("Failed to load execution logs");
      setExecutions([]);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteExecution = (execution) => {
    setExecutionToDelete(execution);
    setShowDeleteDialog(true);
  };

  const confirmDeleteExecution = async () => {
    if (!executionToDelete) {
      setShowDeleteDialog(false);
      return;
    }

    try {
      setDeletingExecution(executionToDelete._id);

      // Delete by runId
      const runId = executionToDelete.runId;
      if (!runId) {
        toast.error('Cannot delete: Missing runId');
        setShowDeleteDialog(false);
        setExecutionToDelete(null);
        return;
      }

      const response = await executionAPI.delete(runId);

      if (response && response.success) {
        toast.success('Execution log deleted successfully');
        // Refresh the list
        await fetchExecutions();
        if (selectedExecution?._id === executionToDelete._id) {
          setSelectedExecution(null);
        }
        // Close dialog after successful deletion
        setShowDeleteDialog(false);
      } else {
        throw new Error(response?.message || 'Delete failed');
      }
    } catch (error) {
      console.error('Error deleting execution:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Failed to delete execution log';
      toast.error(errorMessage);
      // Keep dialog open on error so user can retry
    } finally {
      setDeletingExecution(null);
      setExecutionToDelete(null);
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-5 h-5 text-green-400" />;
      case 'failed':
        return <XCircle className="w-5 h-5 text-red-400" />;
      case 'running':
        return <Loader2 className="w-5 h-5 text-gray-400 animate-spin" />;
      case 'pending':
        return <Clock className="w-5 h-5 text-gray-500" />;
      case 'cancelled':
        return <AlertCircle className="w-5 h-5 text-gray-400" />;
      default:
        return <Clock className="w-5 h-5 text-gray-400" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed':
        return 'bg-green-500/20 text-green-400 border-green-500/30';
      case 'failed':
        return 'bg-red-500/20 text-red-400 border-red-500/30';
      case 'running':
        return 'bg-gray-800/50 text-gray-400 border-gray-700/50';
      case 'pending':
        return 'bg-gray-800/50 text-gray-500 border-gray-700/50';
      case 'cancelled':
        return 'bg-gray-800/50 text-gray-500 border-gray-700/50';
      default:
        return 'bg-gray-800/50 text-gray-400 border-gray-700/50';
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleString();
  };

  const formatDuration = (ms) => {
    if (!ms) return 'N/A';
    if (ms < 1000) return `${ms}ms`;
    if (ms < 60000) return `${(ms / 1000).toFixed(2)}s`;
    return `${(ms / 60000).toFixed(2)}m`;
  };

  const getNodeStatusIcon = (status) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-4 h-4 text-green-400" />;
      case 'failed':
        return <XCircle className="w-4 h-4 text-red-400" />;
      case 'running':
        return <Loader2 className="w-4 h-4 text-gray-400 animate-spin" />;
      case 'pending':
        return <Clock className="w-4 h-4 text-gray-500" />;
      case 'skipped':
        return <AlertCircle className="w-4 h-4 text-gray-400" />;
      default:
        return <Clock className="w-4 h-4 text-gray-400" />;
    }
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
      <div className="h-screen flex flex-col overflow-y-auto overflow-x-hidden text-gray-100">
        {/* Header */}

        <header className="relative z-30 mb-4 pt-4 flex-shrink-0">
          <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              <div className="flex items-center gap-3">
                <NoBrainLogo />
              </div>
              <div className="flex items-center gap-3">
                <Button
              className="bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-white shadow-lg shadow-cyan-500/20"
              onClick={() => navigate('/dashboard')}
            >
              <LayoutDashboard className="w-4 h-4 mr-2" />
              Back to Dashboard
            </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="border-gray-600 text-gray-300 bg-gray-900/50 hover:bg-gray-800 hover:text-cyan-300"
                  onClick={fetchExecutions}
                  disabled={loading}
                >
                  <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                  Refresh
                </Button>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="w-8 h-8 text-gray-400 animate-spin" />
              <span className="ml-3 text-gray-400">Loading logs...</span>
            </div>
          ) : executions.length === 0 ? (
            <div className="text-center py-20">
              <div className="w-24 h-24 bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-6">
                <FileText className="w-12 h-12 text-gray-500" />
              </div>
              <h3 className="text-2xl font-semibold text-gray-400 mb-4">
                No Execution Logs
              </h3>
              <p className="text-gray-500 mb-8 max-w-md mx-auto">
                Test your workflows to see execution logs here. Results will appear after running tests.
              </p>
              <Button
                className="bg-gray-700 hover:bg-gray-600 text-white"
                onClick={() => navigate('/workflow')}
              >
                <Play className="w-4 h-4 mr-2" />
                Create Workflow
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
              {/* Executions List */}
              <div className="lg:col-span-3 space-y-4">
                <h2 className="text-xl font-semibold text-white mb-4">All Executions</h2>
                {executions.map((execution) => (
                  <Card
                    key={execution._id}
                    className={`p-6 bg-gray-900/40 backdrop-blur-sm border border-gray-700/50 hover:border-gray-600/50 transition-all ${selectedExecution?._id === execution._id ? 'border-gray-600' : ''
                      }`}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div
                        className="flex-1 cursor-pointer"
                        onClick={() => setSelectedExecution(execution)}
                      >
                        <div className="flex items-center gap-3 mb-3">
                          {getStatusIcon(execution.status)}
                          <div>
                            <h3 className="text-white font-semibold">Run ID: {execution.runId}</h3>
                            <p className="text-sm text-gray-400">
                              Workflow: {execution.workflowId?.name || execution.workflowId?._id || execution.workflowId || 'N/A'}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-4 mt-4">
                          <div className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(execution.status)}`}>
                            {execution.status.toUpperCase()}
                          </div>
                          <div className="text-xs text-gray-400">
                            Duration: {formatDuration(execution.duration)}
                          </div>
                          <div className="text-xs text-gray-400">
                            {formatDate(execution.createdAt)}
                          </div>
                        </div>
                        {execution.nodeLogs && execution.nodeLogs.length > 0 && (
                          <div className="mt-4 pt-4 border-t border-gray-700">
                            <p className="text-sm text-gray-400 mb-2">
                              Nodes: {execution.nodeLogs.length} tested
                            </p>
                            <div className="flex gap-2">
                              {execution.nodeLogs.slice(0, 5).map((nodeLog, idx) => (
                                <div key={idx} className="flex items-center gap-1">
                                  {getNodeStatusIcon(nodeLog.status)}
                                  <span className={`text-xs ${nodeLog.status === 'completed' ? 'text-green-400' :
                                    nodeLog.status === 'failed' ? 'text-red-400' :
                                      'text-gray-500'
                                    }`}>{nodeLog.nodeName}</span>
                                </div>
                              ))}
                              {execution.nodeLogs.length > 5 && (
                                <span className="text-xs text-gray-500">
                                  +{execution.nodeLogs.length - 5} more
                                </span>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                      {/* Delete Button */}
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-gray-300 hover:text-gray-200 bg-transparent hover:bg-gray-800/30 transition-colors shrink-0 p-0"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteExecution(execution);
                        }}
                        disabled={deletingExecution === execution._id}
                      >
                        {deletingExecution === execution._id ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <Trash2 className="w-4 h-4" />
                        )}
                      </Button>
                    </div>
                  </Card>
                ))}
              </div>

              {/* Execution Details Sidebar */}
              <div className="lg:col-span-2">
                <h2 className="text-xl font-semibold text-white mb-4">Details</h2>
                {selectedExecution ? (
                  <Card className="p-6 bg-gray-900/40 backdrop-blur-sm border border-gray-700/50 max-h-[calc(100vh-12rem)] overflow-y-auto">
                    <div className="space-y-6">
                      {/* Status */}
                      <div>
                        <h3 className="text-sm font-medium text-gray-400 mb-2">Status</h3>
                        <div className={`flex items-center gap-2 px-3 py-2 rounded-lg ${getStatusColor(selectedExecution.status)}`}>
                          {getStatusIcon(selectedExecution.status)}
                          <span className="font-semibold">{selectedExecution.status.toUpperCase()}</span>
                        </div>
                      </div>

                      {/* Run ID */}
                      <div>
                        <h3 className="text-sm font-medium text-gray-400 mb-2">Run ID</h3>
                        <p className="text-white font-mono text-sm">{selectedExecution.runId}</p>
                      </div>

                      {/* Duration */}
                      <div>
                        <h3 className="text-sm font-medium text-gray-400 mb-2">Duration</h3>
                        <p className="text-white">{formatDuration(selectedExecution.duration)}</p>
                      </div>

                      {/* Timestamps */}
                      <div>
                        <h3 className="text-sm font-medium text-gray-400 mb-2">Started</h3>
                        <p className="text-white text-sm">{formatDate(selectedExecution.startedAt)}</p>
                      </div>
                      {selectedExecution.completedAt && (
                        <div>
                          <h3 className="text-sm font-medium text-gray-400 mb-2">Completed</h3>
                          <p className="text-white text-sm">{formatDate(selectedExecution.completedAt)}</p>
                        </div>
                      )}

                      {/* Error */}
                      {selectedExecution.error && (
                        <div>
                          <h3 className="text-sm font-medium text-red-400 mb-2">Error</h3>
                          <p className="text-red-300 text-sm bg-red-500/10 p-2 rounded">{selectedExecution.error}</p>
                        </div>
                      )}

                      {/* Node Logs */}
                      {selectedExecution.nodeLogs && selectedExecution.nodeLogs.length > 0 && (
                        <div>
                          <h3 className="text-sm font-medium text-gray-400 mb-3">
                            Node Logs ({selectedExecution.nodeLogs.length})
                          </h3>
                          <div className="space-y-4">
                            {selectedExecution.nodeLogs.map((nodeLog, idx) => {
                              // Find the corresponding node from workflow to get its configuration
                              const nodeId = nodeLog.nodeId;
                              const workflowNode = workflowNodesMap[nodeId];

                              return (
                                <div
                                  key={idx}
                                  className="p-4 bg-gray-800/50 rounded-lg border border-gray-700/50"
                                >
                                  <div className="flex items-start gap-2 mb-3">
                                    {getNodeStatusIcon(nodeLog.status)}
                                    <div className="flex-1">
                                      <p className="text-white font-medium text-sm">
                                        {nodeLog.nodeName || nodeLog.nodeId}
                                      </p>
                                      <p className={`text-xs mt-1 ${nodeLog.status === 'completed' ? 'text-green-400' :
                                        nodeLog.status === 'failed' ? 'text-red-400' :
                                          'text-gray-400'
                                        }`}>
                                        Status: {nodeLog.status}
                                      </p>
                                    </div>
                                  </div>

                                  {/* Node Configuration - from execution log or workflow */}
                                  {(nodeLog.nodeConfig || (workflowNode && workflowNode.data)) && (
                                    <div className="mt-3 pt-3 border-t border-gray-700/50">
                                      <p className="text-xs font-semibold text-gray-300 mb-2">Node Configuration:</p>
                                      <div className="space-y-2 text-xs">
                                        {/* Use nodeConfig from execution log if available, otherwise use workflow node data */}
                                        {(() => {
                                          const config = nodeLog.nodeConfig || (workflowNode && workflowNode.data);
                                          if (!config) return null;

                                          return (
                                            <>
                                              {config.credentials && Object.keys(config.credentials).length > 0 && (
                                                <div>
                                                  <p className="text-gray-400 mb-1">Credentials:</p>
                                                  <div className="bg-gray-900/50 p-2 rounded text-gray-300">
                                                    {Object.entries(config.credentials).map(([key, value]) => (
                                                      <div key={key} className="mb-1">
                                                        <span className="text-gray-500">{key}:</span>{' '}
                                                        <span className="text-gray-300">
                                                          {typeof value === 'string' && value.length > 50
                                                            ? value.substring(0, 50) + '...'
                                                            : String(value)}
                                                        </span>
                                                      </div>
                                                    ))}
                                                  </div>
                                                </div>
                                              )}
                                              {config.aiModel && (
                                                <div>
                                                  <span className="text-gray-400">AI Model:</span>{' '}
                                                  <span className="text-gray-300">{config.aiModel}</span>
                                                </div>
                                              )}
                                              {config.aiTemperature && (
                                                <div>
                                                  <span className="text-gray-400">Temperature:</span>{' '}
                                                  <span className="text-gray-300">{config.aiTemperature}</span>
                                                </div>
                                              )}
                                              {config.aiMemory && (
                                                <div>
                                                  <span className="text-gray-400">Memory:</span>{' '}
                                                  <span className="text-gray-300">{config.aiMemory}</span>
                                                </div>
                                              )}
                                              {config.aiMemorySize && (
                                                <div>
                                                  <span className="text-gray-400">Memory Size:</span>{' '}
                                                  <span className="text-gray-300">{config.aiMemorySize}</span>
                                                </div>
                                              )}
                                              {config.storageEnabled !== undefined && (
                                                <div>
                                                  <span className="text-gray-400">Storage Enabled:</span>{' '}
                                                  <span className="text-gray-300">{config.storageEnabled ? 'Yes' : 'No'}</span>
                                                </div>
                                              )}
                                              {config.config && Object.keys(config.config).length > 0 && (
                                                <div>
                                                  <p className="text-gray-400 mb-1">Additional Config:</p>
                                                  <pre className="text-xs bg-gray-900/50 p-2 rounded text-gray-300 overflow-x-auto">
                                                    {JSON.stringify(config.config, null, 2)}
                                                  </pre>
                                                </div>
                                              )}
                                            </>
                                          );
                                        })()}
                                      </div>
                                    </div>
                                  )}

                                  {nodeLog.input && (
                                    <div className="mt-3 pt-3 border-t border-gray-700/50">
                                      <p className="text-xs text-gray-400 mb-1 font-semibold">Execution Input:</p>
                                      <pre className="text-xs bg-gray-900/50 p-2 rounded text-gray-300 overflow-x-auto">
                                        {JSON.stringify(nodeLog.input, null, 2)}
                                      </pre>
                                    </div>
                                  )}
                                  {nodeLog.output && (
                                    <div className="mt-3 pt-3 border-t border-gray-700/50">
                                      <p className="text-xs text-gray-400 mb-1 font-semibold">Execution Output:</p>
                                      <pre className="text-xs bg-gray-900/50 p-2 rounded text-gray-300 overflow-x-auto">
                                        {JSON.stringify(nodeLog.output, null, 2)}
                                      </pre>
                                    </div>
                                  )}
                                  {nodeLog.error && (
                                    <div className="mt-3 pt-3 border-t border-red-500/30">
                                      <p className="text-xs text-red-400 mb-1 font-semibold">Error:</p>
                                      <p className="text-xs text-red-300 bg-red-500/10 p-2 rounded">{nodeLog.error}</p>
                                    </div>
                                  )}
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      )}
                    </div>
                  </Card>
                ) : (
                  <Card className="p-6 bg-gray-900/40 backdrop-blur-sm border border-gray-700/50">
                    <div className="text-center py-8">
                      <Brain className="w-12 h-12 text-gray-500 mx-auto mb-4" />
                      <p className="text-gray-400">Select an execution to view details</p>
                    </div>
                  </Card>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Delete Confirmation Dialog */}
        <ConfirmationDialog
          isOpen={showDeleteDialog}
          onClose={() => {
            setShowDeleteDialog(false);
            setExecutionToDelete(null);
          }}
          onConfirm={confirmDeleteExecution}
          title="Delete Execution Log"
          message="Are you sure you want to delete this execution log? This action cannot be undone."
          confirmText="Delete"
          cancelText="Cancel"
          variant="danger"
        />
      </div>
    </Vortex>
  );
}
