import { useState, useEffect, useRef, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { ReactFlowProvider } from "reactflow";
import { workflowAPI, authAPI } from "../services/api";
import { toast } from "sonner";
import { ConfirmationDialog } from "../components/ui/confirmation-dialog";
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
  Radio,
  X,
  BookOpen
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
  // Blueprint Studio CTA system
  const baseClasses =
    "inline-flex items-center justify-center text-sm font-medium active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent-primary)]";

  const variantClasses = {
    default: "bg-gradient-to-br from-[#22D3EE] to-[#A78BFA] hover:brightness-110 text-white hover:-translate-y-0.5 active:translate-y-0",
    outline: "border border-border hover:border-[var(--border-hover)] hover:bg-[var(--bg-elevated)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]",
    ghost: "hover:bg-[var(--bg-elevated)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]",
  };

  const sizeClasses = {
    default: "h-10 py-2 px-4",
    sm: "h-8 px-3 text-xs",
    xs: "h-6 px-2 text-xs",
  };

  return (
    <button
      className={`${baseClasses} rounded-[var(--radius-md)] ${variantClasses[variant] || variantClasses.default} ${sizeClasses[size] || sizeClasses.default} ${variant === 'default' ? 'shadow-[var(--shadow-sm)] hover:shadow-[var(--shadow-md)]' : ''} ${className}`}
      style={{ transitionDuration: 'var(--transition-fast)' }}
      onClick={onClick}
      {...props}
    >
      {children}
    </button>
  );
};

// Bento Tile component — Blueprint Studio
const BentoTile = ({ children, className, ...props }) => {
  return (
    <div
      className={`rounded-[var(--radius-lg)] border border-border bg-card text-card-foreground shadow-[var(--shadow-sm)] hover:border-[var(--border-hover)] ${className}`}
      style={{ transitionDuration: 'var(--transition-normal)' }}
      {...props}
    >
      <div className="h-full">
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
  // 🔴 v2: recentExecutions removed — execution deprecated

  const [userStats, setUserStats] = useState({
    totalWorkflows: 0,
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

      // 🔴 v2: Execution fetching removed — planning mode only

      setUserStats({
        totalWorkflows: workflows.length,
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
    <div className="min-h-screen flex flex-col bg-background text-foreground overflow-x-hidden">
      {/* Dark overlay for modal */}
      {showWorkflowModal && (
        <div className="fixed z-[60] inset-0 pointer-events-none">
          <div className="absolute inset-0 bg-background/80 backdrop-blur-sm transition-all duration-200" />
        </div>
      )}

      {/* Plan Creation Modal */}
      {showWorkflowModal && (
        <div className="fixed z-[70] inset-0 flex items-center justify-center">
          <div className="absolute inset-0" onClick={() => setShowWorkflowModal(false)}></div>
          <div
            ref={modalRef}
            className="relative z-10 bg-card shadow-lg border border-border rounded-xl p-8 w-[98vw] max-w-3xl flex flex-col items-center gap-8 scale-in"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setShowWorkflowModal(false)}
              className="absolute top-4 right-4 text-muted-foreground hover:text-foreground p-2 rounded-full hover:bg-muted transition"
            >
              <X className="w-5 h-5" />
            </button>
            <div className="text-center space-y-2">
              <h2 className="text-2xl font-bold tracking-tight">
                Start a New Plan
              </h2>
              <p className="text-muted-foreground">
                Choose your preferred way to build.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full mt-2">
              <button
                onClick={() => { setShowWorkflowModal(false); navigate("/workflow"); }}
                className="group flex flex-col items-start p-6 rounded-xl border border-border bg-background hover:border-primary/50 transition-all duration-200"
              >
                <div className="mb-4 p-3 rounded-lg bg-primary/10 text-primary">
                  <Rocket className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-semibold mb-2">Plan Manually</h3>
                <p className="text-sm text-muted-foreground leading-relaxed mb-6 text-left">
                  Build step by step with our visual canvas. Drag, drop, and connect nodes to create your logic.
                </p>
                <div className="flex flex-wrap gap-2 mt-auto">
                  <span className="px-2 py-1 bg-muted rounded text-xs text-muted-foreground">Visual Editor</span>
                  <span className="px-2 py-1 bg-muted rounded text-xs text-muted-foreground">Full Control</span>
                </div>
              </button>

              <button
                onClick={() => { setShowWorkflowModal(false); navigate("/workflow/ai-prompt"); }}
                className="group flex flex-col items-start p-6 rounded-xl border border-border bg-background hover:border-primary/50 transition-all duration-200"
              >
                <div className="mb-4 p-3 rounded-lg bg-primary/10 text-primary">
                  <Zap className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-semibold mb-2">AI Planned</h3>
                <p className="text-sm text-muted-foreground leading-relaxed mb-6 text-left">
                  Describe your goal in plain English and let our AI architect the entire automation plan for you.
                </p>
                <div className="flex flex-wrap gap-2 mt-auto">
                  <span className="px-2 py-1 bg-muted rounded text-xs text-muted-foreground">AI Powered</span>
                  <span className="px-2 py-1 bg-muted rounded text-xs text-muted-foreground">Instant Setup</span>
                </div>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <header className="relative z-30 pt-6 px-4 sm:px-6 lg:px-8 flex-shrink-0">
        <div className="max-w-[1600px] mx-auto">
          <div className="flex items-center justify-between h-16 px-6 bg-card/80 border border-border/50 shadow-sm backdrop-blur-md rounded-2xl">
            <div className="flex items-center gap-3">
              <NoBrainLogo />
              <span className="text-muted-foreground text-sm font-medium hidden sm:inline-block">Workflow Planner</span>
            </div>

            <div className="flex items-center gap-3">
              <Button onClick={() => setShowWorkflowModal(true)}>
                <Plus className="w-4 h-4 mr-2" />
                New Plan
              </Button>

              <Button variant="outline" size="sm" onClick={() => navigate("/logs")}>
                <FileText className="w-4 h-4 mr-2" />
                Planning History
              </Button>

              <Button variant="ghost" size="sm" onClick={handleLogout}>
                <LogOut className="w-4 h-4 mr-2" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 p-4 sm:p-6 lg:p-8">
        <div className="max-w-[1600px] mx-auto space-y-8">
          
          <div>
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight">
              Welcome back{userStats.userName ? `, ${userStats.userName}` : ''}
            </h1>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="w-8 h-8 text-muted-foreground animate-spin" />
              <span className="ml-3 text-muted-foreground">Loading planner...</span>
            </div>
          ) : (
            <div className="flex flex-col lg:flex-row gap-6">
              
              {/* Left Column - Hero View & Horizontal List */}
              <div className="flex-[2.5] flex flex-col gap-6 w-full lg:w-auto overflow-hidden">
                
                {selectedWorkflow ? (
                  <>
                    {/* Big Hero Canvas tile */}
                    <BentoTile className="p-0 flex flex-col overflow-hidden bg-card border-border shadow-sm min-h-[450px]">
                      {/* Hero Header */}
                      <div className="p-5 flex flex-wrap items-center justify-between border-b border-border bg-background">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 rounded-xl bg-primary/15 border border-primary/20 flex items-center justify-center">
                            <Brain className="w-6 h-6 text-primary" />
                          </div>
                          <div>
                            <h2 className="text-xl font-bold text-foreground">
                              {selectedWorkflow.name}
                            </h2>
                            <p className="text-sm text-muted-foreground mt-0.5">
                              {selectedWorkflow.graph?.nodes?.length || 0} nodes • {selectedWorkflow.graph?.edges?.length || 0} connections
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3 mt-4 sm:mt-0">
                          <Button variant="outline" size="sm" onClick={() => handleEditWorkflow(selectedWorkflow)} className="border-border">
                            <Edit className="w-4 h-4 mr-2 text-muted-foreground" />
                            Edit
                          </Button>
                          <Button variant="ghost" size="sm" onClick={() => handleDeleteWorkflow(selectedWorkflow._id)} className="text-muted-foreground hover:text-destructive hover:bg-destructive/10">
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>

                      {/* Hero Canvas / Preview */}
                      <div className="flex-1 w-full relative min-h-[350px] bg-[var(--bg-canvas)]">
                         {/* Optional background dots pattern for empty states */}
                         <div className="absolute inset-0 z-10 w-full h-full">
                            <ReactFlowPreview workflow={selectedWorkflow} compact={false} />
                         </div>
                      </div>
                    </BentoTile>

                    {/* Your Workflows Grid */}
                    <div className="flex flex-col gap-3 mt-4">
                      <div className="flex items-center gap-2 text-foreground font-semibold px-2 mb-1">
                        <Radio className="w-4 h-4 text-primary" />
                        <h3 className="text-sm">Your Workflows <span className="text-muted-foreground font-normal text-xs ml-1">({workflows.length})</span></h3>
                      </div>
                      
                      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                        {workflows.map((workflow) => {
                          const isSelected = selectedWorkflow?._id === workflow._id;
                          return (
                            <button
                              key={workflow._id}
                              onClick={() => setSelectedWorkflowId(workflow._id)}
                              className={`group flex flex-col items-start p-3 rounded-[var(--radius-lg)] border transition-all text-left w-full hover:-translate-y-1 ${
                                isSelected
                                  ? 'bg-[var(--accent-primary-soft)] border-[var(--accent-primary)]/30 shadow-[var(--shadow-md)]'
                                  : 'bg-card border-border hover:border-[var(--border-hover)] hover:shadow-[var(--shadow-sm)]'
                              }`}
                              style={{ transitionDuration: 'var(--transition-fast)' }}
                            >
                              <div className="flex items-center justify-between w-full mb-2">
                                <div className={`w-1.5 h-1.5 rounded-full ${isSelected ? 'bg-primary' : 'bg-muted-foreground'}`} />
                                <div className="flex items-center gap-2">
                                  {workflow.platform && (
                                    <span className="text-[9px] font-bold text-primary/70 uppercase tracking-tight px-1.5 py-0.5 bg-primary/10 rounded-md border border-primary/20">
                                      {workflow.platform}
                                    </span>
                                  )}
                                  <ChevronRight className={`w-3.5 h-3.5 shrink-0 ${isSelected ? 'text-primary' : 'text-muted-foreground group-hover:text-primary'}`} style={{ transitionDuration: 'var(--transition-fast)' }} />
                                </div>
                              </div>
                              <div className="w-full">
                                <p className={`text-sm font-semibold truncate ${isSelected ? 'text-primary' : 'text-foreground'}`}>
                                  {workflow.name}
                                </p>
                                <p className="text-xs text-muted-foreground mt-0.5">
                                  {workflow.graph?.nodes?.length || 0} nodes
                                </p>
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  </>
                ) : (
                  <BentoTile className="flex-1 flex flex-col items-center justify-center p-12 text-center bg-muted/10 border-dashed border-border min-h-[450px]">
                    <div className="w-16 h-16 bg-muted/50 rounded-full flex items-center justify-center mb-4">
                      <Brain className="w-8 h-8 text-muted-foreground" />
                    </div>
                    <h3 className="text-lg font-medium text-foreground mb-2">No Plans Yet</h3>
                    <p className="text-sm text-muted-foreground mb-6">Create your first automation plan to get started.</p>
                    <Button onClick={() => setShowWorkflowModal(true)}>
                      <Plus className="w-4 h-4 mr-2" />
                      Create New Plan
                    </Button>
                  </BentoTile>
                )}
              </div>

              {/* Right Column - Stats & History */}
              <div className="flex-[1] flex flex-col gap-6 w-full lg:w-auto">
                
                {/* 2x2 Stats Grid */}
                <div className="grid grid-cols-2 gap-4">
                  {/* Workflows Tile */}
                  <BentoTile className="p-6 flex flex-col items-center justify-center gap-3 text-center bg-card shadow-sm border-border">
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Rocket className="w-4 h-4 text-cyan-400" />
                      <span className="text-xs tracking-wide font-medium">Workflows</span>
                    </div>
                    <span className="text-[32px] font-bold text-foreground leading-none">
                      {userStats.totalWorkflows}
                    </span>
                  </BentoTile>

                  {/* Mode Tile */}
                  <BentoTile className="p-6 flex flex-col items-center justify-center gap-3 text-center bg-card shadow-sm border-border">
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Brain className="w-4 h-4 text-primary" />
                      <span className="text-xs tracking-wide font-medium">Mode</span>
                    </div>
                    <span className="text-lg font-bold text-primary tracking-wide">
                      Planning
                    </span>
                  </BentoTile>

                  {/* Status Tile */}
                  <BentoTile className="p-6 flex flex-col items-center justify-center gap-3 text-center bg-card shadow-sm border-border">
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <CheckCircle className="w-4 h-4 text-emerald-400" />
                      <span className="text-xs tracking-wide font-medium">Status</span>
                    </div>
                    <span className="text-lg font-bold text-emerald-400 tracking-wide">
                      Active
                    </span>
                  </BentoTile>

                  {/* Nodes Tile */}
                  <BentoTile className="p-6 flex flex-col items-center justify-center gap-3 text-center bg-card shadow-sm border-border">
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Zap className="w-4 h-4 text-cyan-400" />
                      <span className="text-xs tracking-wide font-medium">Nodes</span>
                    </div>
                    <span className="text-[32px] font-bold text-foreground leading-none">
                      {userStats.totalNodes}
                    </span>
                  </BentoTile>
                </div>

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

                {/* Recent Workflows */}
                <BentoTile className="flex flex-col flex-1 p-0 overflow-hidden bg-card border-border min-h-[250px] shadow-sm">
                  <div className="p-5 border-b border-border flex items-center gap-2 bg-background/50">
                    <Activity className="w-4 h-4 text-primary" />
                    <h3 className="text-sm font-bold text-foreground tracking-wide">Recent Workflows</h3>
                  </div>
                  <div className="flex-1 overflow-y-auto p-4 space-y-3">
                    {workflows.slice(0, 5).map(workflow => (
                      <div 
                        key={workflow._id}
                        className="flex items-center gap-3 p-3 rounded-lg border border-border bg-background hover:bg-muted/30 transition-colors cursor-pointer"
                        onClick={() => setSelectedWorkflowId(workflow._id)}
                      >
                        <div className="w-6 h-6 rounded bg-primary/10 flex items-center justify-center flex-shrink-0">
                           <Brain className="w-3 h-3 text-primary" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-foreground truncate">{workflow.name}</p>
                          <p className="text-[10px] text-muted-foreground mt-0.5">
                            {workflow.graph?.nodes?.length || 0} nodes • {new Date(workflow.updatedAt || workflow.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    ))}
                    {workflows.length === 0 && (
                      <div className="p-4 text-center text-sm text-muted-foreground">
                        No workflows found.
                      </div>
                    )}
                  </div>
                </BentoTile>

              </div>
            </div>
          )}
        </div>
      </div>

      <ConfirmationDialog
        isOpen={showDeleteDialog}
        onClose={() => {
          setShowDeleteDialog(false);
          setWorkflowToDelete(null);
        }}
        onConfirm={confirmDeleteWorkflow}
        title="Delete Plan"
        message="Are you sure you want to delete this plan? This action cannot be undone."
        confirmText="Delete"
        cancelText="Cancel"
        variant="danger"
      />
    </div>
  );
}