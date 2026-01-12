import { useState, useEffect, useRef, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { ReactFlowProvider } from "reactflow";
import { workflowAPI, executionAPI, authAPI } from "../services/api";
import { toast } from "sonner";
import { ConfirmationDialog } from "../components/ui/confirmation-dialog";
import { Vortex } from "../components/ui/vortex";
import { GlowingEffect } from "../components/ui/glowing-effect";
import { useAuth } from "../contexts/AuthContext";
import ReactFlowPreview from "../components/ReactFlowPreview";
import NoBrainLogo from "../components/NoBrainLogo";
import {
  Rocket,
  Plus,
  LogOut,
  Zap,
  Brain,
  Activity,
  Loader2,
  CheckCircle,
  Edit,
  Trash2,
  FileText,
  Clock,
  AlertCircle,
  Play,
  ChevronRight,
  Radio
} from "lucide-react";

// Custom Button component
const Button = ({
  children,
  className,
  variant = "default",
  size = "default",
  onClick,
  ...props
}) => {
  const baseClasses =
    "inline-flex items-center justify-center rounded-md text-sm font-medium transition-all duration-300 transform active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-500";

  const variantClasses = {
    default: "bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-white shadow-lg shadow-cyan-500/20",
    outline: "border border-gray-600 hover:bg-gray-800 hover:text-cyan-300 text-gray-300 bg-gray-900/50",
    ghost: "hover:bg-gray-800/50 text-gray-300",
  };

  const sizeClasses = {
    default: "h-10 py-2 px-4",
    sm: "h-8 px-3 text-xs rounded-md",
    xs: "h-6 px-2 text-xs rounded",
  };

  return (
    <button
      className={`${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${className}`}
      onClick={onClick}
      {...props}
    >
      {children}
    </button>
  );
};

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

export default function DashboardPage() {
  const navigate = useNavigate();
  const { getUserId, logout } = useAuth();
  const [currentTime, setCurrentTime] = useState(new Date());
  const [showWorkflowModal, setShowWorkflowModal] = useState(false);
  const [workflows, setWorkflows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deletingWorkflow, setDeletingWorkflow] = useState(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [workflowToDelete, setWorkflowToDelete] = useState(null);
  const modalRef = useRef();

  // Selected workflow for Hero display
  const [selectedWorkflowId, setSelectedWorkflowId] = useState(null);
  const [recentExecutions, setRecentExecutions] = useState([]);

  const [userStats, setUserStats] = useState({
    totalWorkflows: 0,
    totalExecutions: 0,
    successfulExecutions: 0,
    failedExecutions: 0,
    totalNodes: 0,
    userName: ''
  });
  const [loadingStats, setLoadingStats] = useState(true);

  // Selected workflow for Hero (defaults to first/most recent)
  const selectedWorkflow = useMemo(() => {
    if (workflows.length === 0) return null;
    if (selectedWorkflowId) {
      return workflows.find(w => w._id === selectedWorkflowId) || workflows[0];
    }
    // Default to most recently updated
    return [...workflows].sort((a, b) =>
      new Date(b.updatedAt || b.createdAt) - new Date(a.updatedAt || a.createdAt)
    )[0];
  }, [workflows, selectedWorkflowId]);

  // Fetch workflows from backend
  useEffect(() => {
    fetchWorkflows();
    fetchUserStats();
  }, []);

  const fetchWorkflows = async () => {
    try {
      setLoading(true);
      const ownerId = getUserId();

      if (!ownerId) {
        toast.error("Please login to view your workflows");
        navigate("/login");
        return;
      }

      const response = await workflowAPI.getAll({ ownerId });
      if (response && response.success && response.data) {
        setWorkflows(Array.isArray(response.data) ? response.data : []);
        fetchUserStats();
      }
    } catch (error) {
      console.error('Error fetching workflows:', error);
      toast.error("Failed to load workflows");
    } finally {
      setLoading(false);
    }
  };

  const fetchUserStats = async () => {
    try {
      setLoadingStats(true);
      const ownerId = getUserId();

      if (!ownerId) return;

      let userName = '';
      try {
        const userResponse = await authAPI.getCurrentUser();
        if (userResponse && userResponse.success && userResponse.data) {
          userName = userResponse.data.name || '';
        }
      } catch (error) {
        console.warn('Error fetching user profile:', error);
      }

      const workflowsResponse = await workflowAPI.getAll({ ownerId });
      const workflows = workflowsResponse && workflowsResponse.success && workflowsResponse.data
        ? (Array.isArray(workflowsResponse.data) ? workflowsResponse.data : [])
        : [];

      const totalNodes = workflows.reduce((sum, workflow) => {
        const nodes = workflow.graph?.nodes || [];
        return sum + nodes.length;
      }, 0);

      let totalExecutions = 0;
      let successfulExecutions = 0;
      let failedExecutions = 0;
      let execList = [];

      try {
        const executionsResponse = await executionAPI.getAll({ limit: 1000 });
        if (executionsResponse && executionsResponse.success && executionsResponse.data) {
          let allExecutions = [];

          if (executionsResponse.data.executions && Array.isArray(executionsResponse.data.executions)) {
            allExecutions = executionsResponse.data.executions;
          } else if (Array.isArray(executionsResponse.data)) {
            allExecutions = executionsResponse.data;
          }

          const userWorkflowIds = workflows.map(w => w._id.toString());
          const userExecutions = allExecutions.filter(execution => {
            const workflowId = execution.workflowId?._id || execution.workflowId;
            if (!workflowId) return false;
            return userWorkflowIds.includes(workflowId.toString());
          });

          totalExecutions = userExecutions.length;
          successfulExecutions = userExecutions.filter(e => e.status === 'completed').length;
          failedExecutions = userExecutions.filter(e => e.status === 'failed').length;

          execList = userExecutions
            .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
            .slice(0, 10);
        }
      } catch (error) {
        console.warn('Error fetching executions:', error);
      }

      setUserStats({
        totalWorkflows: workflows.length,
        totalExecutions,
        successfulExecutions,
        failedExecutions,
        totalNodes,
        userName
      });
      setRecentExecutions(execList);
    } catch (error) {
      console.error('Error fetching user stats:', error);
    } finally {
      setLoadingStats(false);
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      toast.success("Logged out successfully");
      navigate("/login");
    } catch (error) {
      console.error("Logout error:", error);
      toast.error("Failed to logout");
    }
  };

  const handleDeleteWorkflow = (workflowId) => {
    setWorkflowToDelete(workflowId);
    setShowDeleteDialog(true);
  };

  const confirmDeleteWorkflow = async () => {
    if (!workflowToDelete) return;

    try {
      setDeletingWorkflow(workflowToDelete);
      await toast.promise(
        workflowAPI.delete(workflowToDelete),
        {
          loading: 'Deleting workflow...',
          success: () => {
            fetchWorkflows();
            return 'Workflow deleted successfully';
          },
          error: 'Failed to delete workflow',
        }
      );
    } catch (error) {
      console.error('Error deleting workflow:', error);
      toast.error('Failed to delete workflow');
    } finally {
      setDeletingWorkflow(null);
      setWorkflowToDelete(null);
    }
  };

  const handleEditWorkflow = (workflow) => {
    navigate('/workflow', {
      state: {
        workflowId: workflow._id,
        workflowData: workflow
      }
    });
  };

  // Modal ESC close support
  useEffect(() => {
    if (!showWorkflowModal) return;
    function handleEsc(e) {
      if (e.key === 'Escape') setShowWorkflowModal(false);
    }
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [showWorkflowModal]);

  // Update time every second
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Get status icon/color for workflow
  const getWorkflowStatus = (workflow) => {
    // Check recent executions for this workflow
    const exec = recentExecutions.find(e =>
      (e.workflowId?._id || e.workflowId) === workflow._id
    );
    if (!exec) return { color: 'bg-gray-500', label: 'Idle' };
    switch (exec.status) {
      case 'completed': return { color: 'bg-green-500', label: 'Done' };
      case 'running': return { color: 'bg-yellow-500 animate-pulse', label: 'Running' };
      case 'failed': return { color: 'bg-red-500', label: 'Failed' };
      default: return { color: 'bg-gray-500', label: 'Idle' };
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'completed': return <CheckCircle className="w-3 h-3 text-green-400" />;
      case 'running': return <Play className="w-3 h-3 text-yellow-400 animate-pulse" />;
      case 'failed': return <AlertCircle className="w-3 h-3 text-red-400" />;
      default: return <Clock className="w-3 h-3 text-gray-400" />;
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
      containerClassName="h-screen w-full overflow-hidden fixed inset-0 bg-black"
    >
      <div
        className={`h-screen flex flex-col overflow-y-auto overflow-x-hidden ${showWorkflowModal ? "modal-blur-bg" : ""}`}
      >

        {/* Dark overlay for modal */}
        {showWorkflowModal && (
          <div className="fixed z-[60] inset-0 pointer-events-none">
            <div className="absolute inset-0 bg-black bg-opacity-60 backdrop-blur-md transition-all duration-200" />
          </div>
        )}

        {/* Workflow Creation Modal */}
        {showWorkflowModal && (
          <div className="fixed z-[70] inset-0 flex items-center justify-center">
            <div className="absolute inset-0" onClick={() => setShowWorkflowModal(false)}></div>
            <div
              ref={modalRef}
              className="relative z-10 bg-gray-900/90 backdrop-blur-xl shadow-xl border-2 border-gray-700/50 rounded-3xl p-8 px-5 py-10 w-[98vw] max-w-3xl flex flex-col items-center gap-8 scale-in"
              style={{ boxShadow: "0 12px 64px 0 rgba(0,0,0,0.3),0 1.5px 32px 0 rgba(0,0,0,.2)" }}
              onClick={(e) => e.stopPropagation()}
            >
              <button
                onClick={() => setShowWorkflowModal(false)}
                className="absolute top-4 right-6 text-gray-400 hover:text-gray-200 text-2xl font-bold bg-gray-800/70 backdrop-blur rounded-full w-10 h-10 flex items-center justify-center z-20 border border-gray-700/50 transition hover:scale-110"
              >
                <span className="text-white">X</span>
              </button>
              <div className="text-center space-y-2">
                <h2 className="text-3xl font-bold text-white tracking-tight">
                  Start a New Workflow
                </h2>
                <p className="text-gray-400 text-lg">
                  Choose your preferred way to build.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full mt-2">
                <button
                  onClick={() => { setShowWorkflowModal(false); navigate("/workflow"); }}
                  className="group relative flex flex-col items-start p-8 rounded-2xl bg-gray-800/40 border border-gray-700/50 hover:border-cyan-500/50 transition-all duration-300 hover:bg-gray-800/60 overflow-hidden"
                >
                  <div className="absolute top-0 right-0 -mt-4 -mr-4 w-24 h-24 bg-cyan-500/10 rounded-full blur-2xl group-hover:bg-cyan-500/20 transition-colors" />

                  <div className="mb-4 p-3 rounded-xl bg-cyan-500/10 text-cyan-400 group-hover:scale-110 transition-transform duration-300">
                    <Rocket className="w-8 h-8" />
                  </div>

                  <h3 className="text-xl font-bold text-white mb-2">Create Manually</h3>
                  <p className="text-gray-400 text-sm leading-relaxed mb-6">
                    Build step by step with our visual canvas. Drag, drop, and connect nodes to create your logic.
                  </p>

                  <div className="flex flex-wrap gap-2 mt-auto">
                    <span className="px-2.5 py-1 rounded-md bg-gray-900/50 text-gray-400 text-xs font-medium border border-gray-700/50">Visual Editor</span>
                    <span className="px-2.5 py-1 rounded-md bg-gray-900/50 text-gray-400 text-xs font-medium border border-gray-700/50">Full Control</span>
                  </div>
                </button>

                <button
                  onClick={() => { setShowWorkflowModal(false); navigate("/workflow/ai-prompt"); }}
                  className="group relative flex flex-col items-start p-8 rounded-2xl bg-gray-800/40 border border-gray-700/50 hover:border-cyan-500/50 transition-all duration-300 hover:bg-gray-800/60 overflow-hidden"
                >
                  <div className="absolute top-0 right-0 -mt-4 -mr-4 w-24 h-24 bg-cyan-500/10 rounded-full blur-2xl group-hover:bg-cyan-500/20 transition-colors" />

                  <div className="mb-4 p-3 rounded-xl bg-cyan-500/10 text-cyan-400 group-hover:scale-110 transition-transform duration-300">
                    <Zap className="w-8 h-8" />
                  </div>

                  <h3 className="text-xl font-bold text-white mb-2">AI Generated</h3>
                  <p className="text-gray-400 text-sm leading-relaxed mb-6">
                    Describe your goal in plain English and let our AI architect the entire workflow for you.
                  </p>

                  <div className="flex flex-wrap gap-2 mt-auto">
                    <span className="px-2.5 py-1 rounded-md bg-gray-900/50 text-gray-400 text-xs font-medium border border-gray-700/50">AI Powered</span>
                    <span className="px-2.5 py-1 rounded-md bg-gray-900/50 text-gray-400 text-xs font-medium border border-gray-700/50">Instant Setup</span>
                  </div>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Header */}
        <header className="relative z-30 mb-4 pt-4 flex-shrink-0">
          <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              <div className="flex items-center gap-3">
                <NoBrainLogo />
              </div>

              <div className="flex items-center gap-3">
                <Button onClick={() => setShowWorkflowModal(true)}>
                  <Plus className="w-4 h-4 mr-2" />
                  New Workflow
                </Button>

                <Button variant="outline" size="sm" onClick={() => navigate("/logs")}>
                  <FileText className="w-4 h-4 mr-2" />
                  Logs
                </Button>

                <Button variant="outline" size="sm" onClick={handleLogout}>
                  <LogOut className="w-4 h-4 mr-2" />
                  Logout
                </Button>
              </div>
            </div>
          </div>
        </header>

        {/* Main Bento Grid Content */}
        <div className="flex-1 p-4 sm:p-6 lg:p-8">
          <div className="max-w-[1600px] mx-auto">
            {loading ? (
              <div className="flex items-center justify-center py-20">
                <Loader2 className="w-8 h-8 text-gray-400 animate-spin" />
                <span className="ml-3 text-gray-400">Loading dashboard...</span>
              </div>
            ) : (
              <div className="flex flex-col lg:flex-row gap-6">

                {/* Left Column - Hero + Timeline (70%) */}
                <div className="flex-1 lg:w-[70%] flex flex-col gap-4">

                  {/* Hero Workflow Tile */}
                  {selectedWorkflow ? (
                    <BentoTile className="min-h-[320px] bg-gradient-to-br from-gray-900/60 to-gray-800/60">
                      <div className="h-full flex flex-col p-5">
                        {/* Header */}
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex items-center gap-3">
                            <div className="w-12 h-12 rounded-xl flex items-center justify-center bg-gradient-to-br from-cyan-500/20 to-blue-500/20 border border-cyan-500/30">
                              <Brain className="w-6 h-6 text-cyan-400" />
                            </div>
                            <div>
                              <h3 className="text-xl font-bold text-white">
                                {selectedWorkflow.name}
                              </h3>
                              <p className="text-sm text-gray-400">
                                {selectedWorkflow.graph?.nodes?.length || 0} nodes • {selectedWorkflow.graph?.edges?.length || 0} connections
                              </p>
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <Button
                              variant="outline"
                              size="xs"
                              onClick={() => handleEditWorkflow(selectedWorkflow)}
                            >
                              <Edit className="w-3 h-3 mr-1" />
                              Edit
                            </Button>
                            <Button
                              variant="ghost"
                              size="xs"
                              className="hover:text-red-400 hover:bg-red-500/10"
                              onClick={() => handleDeleteWorkflow(selectedWorkflow._id)}
                            >
                              <Trash2 className="w-3 h-3" />
                            </Button>
                          </div>
                        </div>

                        {/* React Flow Workflow Preview */}
                        <div className="flex-1 bg-gray-950/80 rounded-xl border border-gray-700/50 overflow-hidden min-h-[180px]">
                          <ReactFlowProvider>
                            <ReactFlowPreview workflow={selectedWorkflow} />
                          </ReactFlowProvider>
                        </div>
                      </div>
                    </BentoTile>
                  ) : (
                    <BentoTile className="min-h-[320px] bg-gradient-to-br from-gray-900/40 to-gray-800/40">
                      <div className="h-full flex flex-col items-center justify-center p-6 text-center">
                        <div className="w-20 h-20 bg-gray-800/50 rounded-full flex items-center justify-center mb-4">
                          <Brain className="w-10 h-10 text-gray-500" />
                        </div>
                        <h3 className="text-xl font-semibold text-gray-400 mb-2">No Workflows Yet</h3>
                        <p className="text-sm text-gray-500 mb-6">Create your first automation workflow</p>
                        <Button onClick={() => setShowWorkflowModal(true)}>
                          <Plus className="w-4 h-4 mr-2" />
                          Create Workflow
                        </Button>
                      </div>
                    </BentoTile>
                  )}

                  {/* Workflow Timeline Strip */}
                  {workflows.length > 0 && (
                    <BentoTile className="p-4">
                      <div className="flex items-center gap-3 mb-3">
                        <Radio className="w-4 h-4 text-cyan-400" />
                        <span className="text-sm font-semibold text-white">Your Workflows</span>
                        <span className="text-xs text-gray-500">({workflows.length})</span>
                      </div>

                      {/* Timeline Strip */}
                      <div className="flex flex-wrap gap-2 pb-2">
                        {workflows.map((workflow, idx) => {
                          const status = getWorkflowStatus(workflow);
                          const isSelected = selectedWorkflow?._id === workflow._id;

                          return (
                            <button
                              key={workflow._id}
                              onClick={() => setSelectedWorkflowId(workflow._id)}
                              className={`group flex-shrink-0 flex items-center gap-3 px-4 py-3 rounded-xl border transition-all duration-200 ${isSelected
                                ? 'bg-cyan-500/20 border-cyan-500/50 shadow-lg shadow-cyan-500/10'
                                : 'bg-gray-800/40 border-gray-700/50 hover:bg-gray-800/60 hover:border-gray-600/50'
                                }`}
                            >
                              {/* Status Dot */}
                              <div className={`w-2.5 h-2.5 rounded-full ${status.color}`} />

                              {/* Workflow Info */}
                              <div className="text-left min-w-[100px] max-w-[150px]">
                                <p className={`text-sm font-medium truncate ${isSelected ? 'text-cyan-300' : 'text-white'}`}>
                                  {workflow.name}
                                </p>
                                <p className="text-xs text-gray-500">
                                  {workflow.graph?.nodes?.length || 0} nodes
                                </p>
                              </div>

                              {/* Arrow for selected */}
                              {isSelected && (
                                <ChevronRight className="w-4 h-4 text-cyan-400" />
                              )}
                            </button>
                          );
                        })}
                      </div>
                    </BentoTile>
                  )}
                </div>

                {/* Right Column - Stats + Activity (30%) */}
                <div className="w-full lg:w-[30%] flex flex-col gap-4">

                  {/* Stats Grid */}
                  <div className="grid grid-cols-2 gap-4">
                    <BentoTile className="p-4">
                      <div className="h-full flex flex-col items-center justify-center gap-2">
                        <div className="flex items-center gap-2">
                          <div className="p-1.5 bg-cyan-500/20 rounded-lg">
                            <Rocket className="w-4 h-4 text-cyan-400" />
                          </div>
                          <span className="text-xs text-gray-400">Workflows</span>
                        </div>
                        <div className="text-3xl font-bold text-white">{userStats.totalWorkflows}</div>
                      </div>
                    </BentoTile>

                    <BentoTile className="p-4">
                      <div className="h-full flex flex-col items-center justify-center gap-2">
                        <div className="flex items-center gap-2">
                          <div className="p-1.5 bg-blue-500/20 rounded-lg">
                            <Activity className="w-4 h-4 text-blue-400" />
                          </div>
                          <span className="text-xs text-gray-400">Executions</span>
                        </div>
                        <div className="text-3xl font-bold text-white">{userStats.totalExecutions}</div>
                      </div>
                    </BentoTile>

                    <BentoTile className="p-4">
                      <div className="h-full flex flex-col items-center justify-center gap-2">
                        <div className="flex items-center gap-2">
                          <div className="p-1.5 bg-green-500/20 rounded-lg">
                            <CheckCircle className="w-4 h-4 text-green-400" />
                          </div>
                          <span className="text-xs text-gray-400">Success</span>
                        </div>
                        <div className="text-3xl font-bold text-white">{userStats.successfulExecutions}</div>
                      </div>
                    </BentoTile>

                    <BentoTile className="p-4">
                      <div className="h-full flex flex-col items-center justify-center gap-2">
                        <div className="flex items-center gap-2">
                          <div className="p-1.5 bg-cyan-500/20 rounded-lg">
                            <Zap className="w-4 h-4 text-cyan-400" />
                          </div>
                          <span className="text-xs text-gray-400">Nodes</span>
                        </div>
                        <div className="text-3xl font-bold text-white">{userStats.totalNodes}</div>
                      </div>
                    </BentoTile>
                  </div>

                  {/* System Online - Cyan Theme */}
                  <BentoTile className="bg-gradient-to-br from-cyan-500/10 to-blue-500/10 border-cyan-500/30 p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-3 h-3 bg-cyan-400 rounded-full animate-pulse" />
                        <div>
                          <p className="text-sm font-bold text-cyan-200">SYSTEM ONLINE</p>
                          <p className="text-xs text-cyan-300/70 font-mono">IT'S A NO BRAINER</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-mono text-cyan-200">{currentTime.toLocaleTimeString()}</p>
                        <p className="text-xs text-cyan-300/50">{currentTime.toLocaleDateString()}</p>
                      </div>
                    </div>
                  </BentoTile>

                  {/* Activity Log */}
                  <BentoTile className="flex-1 min-h-[200px]">
                    <div className="h-full flex flex-col p-4">
                      <div className="flex items-center gap-2 mb-3 pb-2 border-b border-gray-700/50">
                        <Activity className="w-4 h-4 text-cyan-400" />
                        <span className="text-sm font-semibold text-white">Recent Activity</span>
                      </div>
                      <div className="flex-1 overflow-y-auto space-y-2 scrollbar-thin">
                        {recentExecutions.length > 0 ? (
                          recentExecutions.map((exec, idx) => (
                            <div key={idx} className="flex items-start gap-2 p-2 rounded-lg bg-gray-800/30 hover:bg-gray-800/50 transition-colors">
                              {getStatusIcon(exec.status)}
                              <div className="flex-1 min-w-0">
                                <p className="text-xs text-gray-300 truncate">
                                  {exec.workflowId?.name || 'Workflow'}
                                </p>
                                <p className="text-[10px] text-gray-500">
                                  {new Date(exec.createdAt).toLocaleTimeString()}
                                </p>
                              </div>
                            </div>
                          ))
                        ) : (
                          <div className="flex-1 flex items-center justify-center">
                            <p className="text-xs text-gray-500">No recent activity</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </BentoTile>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Delete Confirmation Dialog */}
        <ConfirmationDialog
          isOpen={showDeleteDialog}
          onClose={() => {
            setShowDeleteDialog(false);
            setWorkflowToDelete(null);
          }}
          onConfirm={confirmDeleteWorkflow}
          title="Delete Workflow"
          message="Are you sure you want to delete this workflow? This action cannot be undone."
          confirmText="Delete"
          cancelText="Cancel"
          variant="danger"
        />

        <style>{`
        @keyframes scaleIn { from { transform:scale(.93); opacity:.35; } to { transform:scale(1); opacity:1; }}
        .scale-in { animation: scaleIn .38s cubic-bezier(.39,.3,.37,1.06); }
        .modal-blur-bg > div:not(.fixed):not(.scale-in):not(.z-\\[70\\]) {
          filter: blur(6px) brightness(.87) grayscale(.12) !important;
          pointer-events: none !important;
          user-select: none !important;
        }
        .scrollbar-thin::-webkit-scrollbar { width: 4px; height: 4px; }
        .scrollbar-thin::-webkit-scrollbar-track { background: transparent; }
        .scrollbar-thin::-webkit-scrollbar-thumb { background: #374151; border-radius: 2px; }
      `}</style>
      </div>
    </Vortex>
  );
}