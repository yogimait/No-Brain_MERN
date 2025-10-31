import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  FileText, 
  CheckCircle, 
  XCircle, 
  Clock, 
  AlertCircle,
  ArrowLeft,
  RefreshCw,
  Brain,
  Play,
  Loader2
} from 'lucide-react';
import { executionAPI } from '../services/api';
import { Button } from '../components/ui/button';
import { Card } from '../components/ui/card';

export default function LogsPage() {
  const navigate = useNavigate();
  const [executions, setExecutions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedExecution, setSelectedExecution] = useState(null);

  useEffect(() => {
    fetchExecutions();
  }, []);

  const fetchExecutions = async () => {
    try {
      setLoading(true);
      const response = await executionAPI.getAll({ limit: 100 });
      // Handle ApiResponse format: response is { success, data, message }
      if (response && response.success && response.data) {
        // response.data might be an object with executions array or directly an array
        if (response.data.executions && Array.isArray(response.data.executions)) {
          setExecutions(response.data.executions);
        } else if (Array.isArray(response.data)) {
          setExecutions(response.data);
        } else {
          setExecutions([]);
        }
      } else {
        setExecutions([]);
      }
    } catch (error) {
      console.error('Error fetching executions:', error);
      setExecutions([]);
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-5 h-5 text-green-400" />;
      case 'failed':
        return <XCircle className="w-5 h-5 text-red-400" />;
      case 'running':
        return <Loader2 className="w-5 h-5 text-blue-400 animate-spin" />;
      case 'pending':
        return <Clock className="w-5 h-5 text-yellow-400" />;
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
        return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
      case 'pending':
        return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
      case 'cancelled':
        return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
      default:
        return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
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
        return <Loader2 className="w-4 h-4 text-blue-400 animate-spin" />;
      case 'pending':
        return <Clock className="w-4 h-4 text-yellow-400" />;
      case 'skipped':
        return <AlertCircle className="w-4 h-4 text-gray-400" />;
      default:
        return <Clock className="w-4 h-4 text-gray-400" />;
    }
  };

  return (
    <div className="min-h-screen bg-black text-gray-100">
      {/* Header */}
      <header className="bg-gray-900/60 backdrop-blur-sm border-b border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <Button
                variant="outline"
                size="sm"
                className="text-gray-300 border-gray-600 hover:border-blue-500 hover:text-blue-300"
                onClick={() => navigate('/dashboard')}
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Dashboard
              </Button>
              <div className="flex items-center gap-3">
                <FileText className="w-6 h-6 text-blue-400" />
                <span className="text-2xl font-bold text-blue-300">Execution Logs</span>
              </div>
            </div>
            <Button
              variant="outline"
              size="sm"
              className="text-gray-300 border-gray-600 hover:border-blue-500 hover:text-blue-300"
              onClick={fetchExecutions}
              disabled={loading}
            >
              <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 text-blue-400 animate-spin" />
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
              className="bg-blue-600 hover:bg-blue-700 text-white"
              onClick={() => navigate('/workflow')}
            >
              <Play className="w-4 h-4 mr-2" />
              Create Workflow
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Executions List */}
            <div className="lg:col-span-2 space-y-4">
              <h2 className="text-xl font-semibold text-white mb-4">All Executions</h2>
              {executions.map((execution) => (
                <Card
                  key={execution._id}
                  className={`p-6 bg-gray-900/40 backdrop-blur-sm border border-gray-700/50 hover:border-blue-500/50 transition-all cursor-pointer ${
                    selectedExecution?._id === execution._id ? 'border-blue-500' : ''
                  }`}
                  onClick={() => setSelectedExecution(execution)}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-3">
                        {getStatusIcon(execution.status)}
                        <div>
                          <h3 className="text-white font-semibold">Run ID: {execution.runId}</h3>
                          <p className="text-sm text-gray-400">
                            Workflow ID: {execution.workflowId?._id || execution.workflowId || 'N/A'}
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
                                <span className="text-xs text-gray-500">{nodeLog.nodeName}</span>
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
                  </div>
                </Card>
              ))}
            </div>

            {/* Execution Details Sidebar */}
            <div className="lg:col-span-1">
              <h2 className="text-xl font-semibold text-white mb-4">Details</h2>
              {selectedExecution ? (
                <Card className="p-6 bg-gray-900/40 backdrop-blur-sm border border-gray-700/50">
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
                        <h3 className="text-sm font-medium text-gray-400 mb-2">Error</h3>
                        <p className="text-red-400 text-sm">{selectedExecution.error}</p>
                      </div>
                    )}

                    {/* Node Logs */}
                    {selectedExecution.nodeLogs && selectedExecution.nodeLogs.length > 0 && (
                      <div>
                        <h3 className="text-sm font-medium text-gray-400 mb-3">
                          Node Logs ({selectedExecution.nodeLogs.length})
                        </h3>
                        <div className="space-y-3 max-h-96 overflow-y-auto">
                          {selectedExecution.nodeLogs.map((nodeLog, idx) => (
                            <div
                              key={idx}
                              className="p-3 bg-gray-800/50 rounded-lg border border-gray-700"
                            >
                              <div className="flex items-start gap-2 mb-2">
                                {getNodeStatusIcon(nodeLog.status)}
                                <div className="flex-1">
                                  <p className="text-white font-medium text-sm">
                                    {nodeLog.nodeName || nodeLog.nodeId}
                                  </p>
                                  <p className="text-xs text-gray-400 mt-1">
                                    Status: {nodeLog.status}
                                  </p>
                                </div>
                              </div>
                              {nodeLog.input && (
                                <div className="mt-2">
                                  <p className="text-xs text-gray-400 mb-1">Input:</p>
                                  <pre className="text-xs bg-gray-900/50 p-2 rounded text-gray-300 overflow-x-auto">
                                    {JSON.stringify(nodeLog.input, null, 2)}
                                  </pre>
                                </div>
                              )}
                              {nodeLog.output && (
                                <div className="mt-2">
                                  <p className="text-xs text-gray-400 mb-1">Output:</p>
                                  <pre className="text-xs bg-gray-900/50 p-2 rounded text-gray-300 overflow-x-auto">
                                    {JSON.stringify(nodeLog.output, null, 2)}
                                  </pre>
                                </div>
                              )}
                              {nodeLog.error && (
                                <div className="mt-2">
                                  <p className="text-xs text-red-400 mb-1">Error:</p>
                                  <p className="text-xs text-red-300">{nodeLog.error}</p>
                                </div>
                              )}
                            </div>
                          ))}
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
    </div>
  );
}

