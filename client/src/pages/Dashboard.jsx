import { useState, useEffect, useRef } from "react";

import { useNavigate } from "react-router-dom";
import { workflowAPI, executionAPI, authAPI } from "../services/api";
import { toast } from "sonner";
import { ConfirmationDialog } from "../components/ui/confirmation-dialog";
import { Vortex } from "../components/ui/vortex";
import { GlowingEffect } from "../components/ui/glowing-effect";
import { useAuth } from "../contexts/AuthContext";
import WorkflowPipeline from "../components/WorkflowPipeline";
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
  FileText
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
  };

  const sizeClasses = {
    default: "h-10 py-2 px-4",
    sm: "h-9 px-3 rounded-md",
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

// Custom Card component
const Card = ({ children, className, ...props }) => {
  return (
    <div
      className={`relative rounded-xl border text-card-foreground shadow-sm overflow-hidden ${className}`}
      {...props}
    >
      <GlowingEffect
        spread={40}
        glow={true}
        disabled={false}
        proximity={64}
        inactiveZone={0.01}
      />
      <div className="relative z-10">
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
  const [userStats, setUserStats] = useState({
    totalWorkflows: 0,
    totalExecutions: 0,
    successfulExecutions: 0,
    failedExecutions: 0,
    totalNodes: 0,
    userName: ''
  });
  const [loadingStats, setLoadingStats] = useState(true);

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
      <div className={`h-screen flex flex-col overflow-y-auto overflow-x-hidden ${showWorkflowModal ? "modal-blur-bg" : ""}`}>


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
              <h2 className="text-gray-200 text-3xl font-bold tracking-tight mb-4 text-center select-none">
                Start a New Workflow
              </h2>
              <p className="text-gray-400 mb-6 text-center text-md max-w-xl">
                How would you like to create your workflow?
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full">
                <button
                  className="group text-left rounded-xl px-7 py-8 flex flex-col items-start shadow-xl focus:outline-none bg-gray-900/80 border-2 border-gray-700/50 hover:border-cyan-500/50 transition-all duration-300 transform hover:scale-[1.03] active:scale-[0.98]"
                  onClick={() => { setShowWorkflowModal(false); navigate("/workflow"); }}
                >
                  <div className="flex items-center gap-3 mb-3">
                    <Rocket className="w-7 h-7 text-cyan-400 drop-shadow-lg group-hover:scale-110 transition-transform" />
                    <span className="font-bold text-2xl text-white tracking-tight">Create Manually</span>
                  </div>
                  <p className="text-gray-300 text-[15px] mb-3 pr-1">
                    Build step by step with a visual canvas. Drag, drop, connect, and customize every detail.
                  </p>
                  <ul className="flex gap-2 text-xs mt-auto">
                    <li className="px-3 py-1 rounded bg-gray-800/60 text-gray-300 font-semibold">Visual Canvas</li>
                    <li className="px-3 py-1 rounded bg-gray-800/60 text-gray-300 font-semibold">Drag & Drop</li>
                    <li className="px-3 py-1 rounded bg-gray-800/60 text-gray-300 font-semibold">Full Control</li>
                  </ul>
                </button>

                <button
                  className="group text-left rounded-xl px-7 py-8 flex flex-col items-start shadow-xl focus:outline-none bg-gray-900/80 border-2 border-gray-700/50 hover:border-yellow-500/50 transition-all duration-300 transform hover:scale-[1.03] active:scale-[0.98]"
                  onClick={() => { setShowWorkflowModal(false); navigate("/workflow/ai-prompt"); }}
                >
                  <div className="flex items-center gap-3 mb-3">
                    <Zap className="w-7 h-7 text-yellow-400 drop-shadow-lg group-hover:scale-110 transition-transform" />
                    <span className="font-bold text-2xl text-white tracking-tight">AI Generated</span>
                  </div>
                  <p className="text-gray-300 text-[15px] mb-3 pr-1">
                    Describe it, and our AI creates your workflow for you. Provide a summary and let the magic happen!
                  </p>
                  <ul className="flex gap-2 text-xs mt-auto">
                    <li className="px-3 py-1 rounded bg-gray-800/60 text-gray-300 font-semibold">AI Powered</li>
                    <li className="px-3 py-1 rounded bg-gray-800/60 text-gray-300 font-semibold">Quick Setup</li>
                    <li className="px-3 py-1 rounded bg-gray-800/60 text-gray-300 font-semibold">Smart</li>
                  </ul>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Header */}
        <header className="relative z-30 backdrop-blur-sm border-b border-gray-700/50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              <div className="flex items-center gap-3">
                <NoBrainLogo />
              </div>

              <div className="flex items-center gap-3">
                <Button onClick={() => setShowWorkflowModal(true)}>
                  <Plus className="w-4 h-4 mr-2" />
                  New Workflow
                </Button>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => navigate("/logs")}
                >
                  <FileText className="w-4 h-4 mr-2" />
                  Logs
                </Button>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleLogout}
                >
                  <LogOut className="w-4 h-4 mr-2" />
                  Logout
                </Button>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <div className="relative pt-8 pb-6">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            {/* System Online Box and Stats */}
            <div className="mb-8 flex flex-col lg:flex-row items-start gap-6">
              {/* SYSTEM ONLINE Box */}
              <div className="bg-gradient-to-br from-yellow-500/20 to-orange-500/20 backdrop-blur-xl border border-yellow-500/50 rounded-2xl p-6 shadow-2xl shadow-yellow-900/20 hover:shadow-yellow-900/30 transition-all duration-300 w-full lg:w-64 transform hover:scale-[1.02]">
                <div className="text-center">
                  <div className="flex items-center justify-center gap-2 mb-2">
                    <div className="w-2 h-2 bg-yellow-500 rounded-full animate-pulse"></div>
                    <span className="text-xs font-mono text-yellow-300">SYSTEM ONLINE</span>
                  </div>
                  <div className="text-xs font-mono text-yellow-200 mb-1">
                    {currentTime.toLocaleTimeString()}
                  </div>
                  <div className="text-sm font-bold text-yellow-200">IT'S TRULY A NO BRAINER</div>
                </div>
              </div>

              {/* Stats Cards */}
              <div className="flex-1 grid grid-cols-2 lg:grid-cols-4 gap-4 w-full">
                {loadingStats ? (
                  <div className="col-span-full flex items-center justify-center py-8">
                    <Loader2 className="w-6 h-6 text-gray-400 animate-spin" />
                  </div>
                ) : (
                  <>
                    <Card className="bg-gray-900/40 backdrop-blur-xl border border-gray-700/50 p-4">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-gray-800/50 rounded-lg">
                          <Rocket className="w-5 h-5 text-gray-400" />
                        </div>
                        <div>
                          <p className="text-xs text-gray-400 mb-1">Total Workflows</p>
                          <p className="text-xl font-bold text-white">{userStats.totalWorkflows}</p>
                        </div>
                      </div>
                    </Card>

                    <Card className="bg-gray-900/40 backdrop-blur-xl border border-gray-700/50 p-4">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-gray-800/50 rounded-lg">
                          <Activity className="w-5 h-5 text-gray-400" />
                        </div>
                        <div>
                          <p className="text-xs text-gray-400 mb-1">Total Executions</p>
                          <p className="text-xl font-bold text-white">{userStats.totalExecutions}</p>
                        </div>
                      </div>
                    </Card>

                    <Card className="bg-gray-900/40 backdrop-blur-xl border border-gray-700/50 p-4">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-gray-800/50 rounded-lg">
                          <CheckCircle className="w-5 h-5 text-green-400" />
                        </div>
                        <div>
                          <p className="text-xs text-gray-400 mb-1">Successful</p>
                          <p className="text-xl font-bold text-white">{userStats.successfulExecutions}</p>
                        </div>
                      </div>
                    </Card>

                    <Card className="bg-gray-900/40 backdrop-blur-xl border border-gray-700/50 p-4">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-gray-800/50 rounded-lg">
                          <Zap className="w-5 h-5 text-yellow-400" />
                        </div>
                        <div>
                          <p className="text-xs text-gray-400 mb-1">Total Nodes</p>
                          <p className="text-xl font-bold text-white">{userStats.totalNodes}</p>
                        </div>
                      </div>
                    </Card>
                  </>
                )}
              </div>
            </div>

            {/* Workflow Cards */}
            <div className="space-y-6">
              {loading ? (
                <div className="flex items-center justify-center py-20">
                  <Loader2 className="w-8 h-8 text-gray-400 animate-spin" />
                  <span className="ml-3 text-gray-400">Loading workflows...</span>
                </div>
              ) : workflows.length === 0 ? (
                <div className="text-center py-20 bg-gray-900/30 backdrop-blur-sm rounded-xl border border-gray-700/50">
                  <div className="w-24 h-24 bg-gray-800/50 rounded-full flex items-center justify-center mx-auto mb-6">
                    <Brain className="w-12 h-12 text-gray-500" />
                  </div>
                  <h3 className="text-2xl font-semibold text-gray-400 mb-4">No Workflows Yet</h3>
                  <p className="text-gray-500 mb-8 max-w-md mx-auto">
                    Create your first automation workflow to start the magic.
                    <span className="font-bold"> IT'S A NO-BRAINER!</span>
                  </p>
                  <Button onClick={() => setShowWorkflowModal(true)}>
                    <Plus className="w-4 h-4 mr-2" />
                    Create First Workflow
                  </Button>
                </div>
              ) : (
                workflows.map((workflow) => {
                  const graph = workflow.graph || { nodes: [], edges: [] };

                  return (
                    <div
                      key={workflow._id}
                      className="relative bg-gradient-to-br from-gray-900/60 to-gray-800/60 backdrop-blur-sm rounded-xl border border-gray-700/50 p-6 hover:border-cyan-500/50 hover:shadow-lg hover:shadow-cyan-500/10 transition-all duration-300 overflow-hidden"
                    >
                      <GlowingEffect
                        spread={40}
                        glow={true}
                        disabled={false}
                        proximity={64}
                        inactiveZone={0.01}
                      />
                      <div className="relative z-10">
                        {/* Workflow Header */}
                        <div className="flex items-start justify-between mb-5">
                          <div className="flex items-start gap-4 flex-1">
                            <div className="w-14 h-14 rounded-xl flex items-center justify-center bg-gradient-to-br from-cyan-500/20 to-blue-500/20 border border-cyan-500/30">
                              <Brain className="w-7 h-7 text-cyan-400" />
                            </div>
                            <div className="flex-1">
                              <h3 className="text-xl font-bold text-white mb-1">
                                {workflow.name}
                              </h3>
                              <p className="text-sm text-gray-400 mb-2">
                                {workflow.description || 'No description provided'}
                              </p>
                              <div className="flex items-center gap-4 text-xs text-gray-500">
                                <span>Created: {new Date(workflow.createdAt).toLocaleDateString()}</span>
                                <span>•</span>
                                <span>{graph.nodes?.length || 0} nodes</span>
                                <span>•</span>
                                <span>{graph.edges?.length || 0} connections</span>
                              </div>
                            </div>
                          </div>

                          <div className="flex gap-2 ml-4">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleEditWorkflow(workflow)}
                              disabled={deletingWorkflow === workflow._id}
                            >
                              <Edit className="w-4 h-4 mr-2" />
                              Edit
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              className="hover:border-red-500/50 hover:text-red-400"
                              onClick={() => handleDeleteWorkflow(workflow._id)}
                              disabled={deletingWorkflow === workflow._id}
                            >
                              {deletingWorkflow === workflow._id ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                              ) : (
                                <Trash2 className="w-4 h-4" />
                              )}
                            </Button>
                          </div>
                        </div>

                        {/* Work Execution Status Board */}
                        <div className="pt-5 border-t border-gray-700/50">
                          <div className="mb-4">
                            <div className="flex items-center gap-2 mb-2">
                              <div className="relative">
                                <Activity className="w-5 h-5 text-yellow-400 animate-pulse" />
                                <div className="absolute -top-1 -right-1 w-2 h-2 bg-yellow-500 rounded-full animate-ping" />
                              </div>
                              <div>
                                <p className="text-sm font-bold text-white">WORK EXECUTION STATUS</p>
                                <p className="text-xs text-gray-400 font-mono">
                                  Live monitoring • Continuous workflow execution
                                </p>
                              </div>
                            </div>
                          </div>
                          <div className="bg-gradient-to-br from-gray-950/95 to-black/95 rounded-xl border-2 border-gray-700/50 shadow-2xl overflow-hidden">
                            <div className="p-6">
                              <WorkflowPipeline workflow={workflow} />
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
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
      `}</style>
      </div >
    </Vortex >
  );
}