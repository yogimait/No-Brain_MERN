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
  BookOpen,
  FolderOpen,
  Filter,
  BarChart2,
  GitMerge,
  Lightbulb,
  ExternalLink,
  Search,
  CheckCircle2,
  TrendingUp,
  Database,
  History
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
  const [showComparePlatforms, setShowComparePlatforms] = useState(false);
  const [showTemplates, setShowTemplates] = useState(false);
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

      setUserStats({
        totalWorkflows: workflows.length,
        totalNodes,
        userName,
        mostUsedPlatform: getMostUsedPlatform(workflows),
        commonNodeType: getCommonNodeType(workflows),
        growthRate: calculateGrowth(workflows)
      });
    } catch (error) {
      console.error('Error fetching user stats:', error);
    } finally {
      setLoadingStats(false);
    }
  };

  const getMostUsedPlatform = (workflows) => {
    if (!workflows || workflows.length === 0) return "None";
    const counts = workflows.reduce((acc, w) => {
      const p = w.platform || "Unknown";
      acc[p] = (acc[p] || 0) + 1;
      return acc;
    }, {});
    return Object.keys(counts).reduce((a, b) => counts[a] > counts[b] ? a : b);
  };

  const getCommonNodeType = (workflows) => {
    // simplified mock logic since node types vary widely
    let types = { "Webhook": 0, "HTTP Request": 0, "AI Transform": 0 };
    workflows.forEach(w => {
       w.graph?.nodes?.forEach(n => {
          if (n.data?.label?.includes("Trigger")) types["Webhook"]++;
          else if (n.data?.label?.includes("HTTP")) types["HTTP Request"]++;
          else types["AI Transform"]++;
       });
    });
    return Object.keys(types).reduce((a, b) => types[a] > types[b] ? a : b) || "Trigger";
  };

  const calculateGrowth = (workflows) => {
      // Dummy logic for visual demonstration
      if (workflows.length === 0) return "+0%";
      return "+" + Math.min(Math.round(workflows.length * 1.5), 100) + "%";
  };

  const [activeFilter, setActiveFilter] = useState("All");
  const [complexityFilter, setComplexityFilter] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("Recent");

  const filteredWorkflows = workflows.filter(w => {
    const matchesPlatform = activeFilter === "All" || w.platform === activeFilter;
    const matchesSearch = !searchQuery || w.name?.toLowerCase().includes(searchQuery.toLowerCase());
    // simplified complexity filter
    const nodeCount = w.graph?.nodes?.length || 0;
    const matchesComplexity = complexityFilter === "All" ||
        (complexityFilter === "Basic" && nodeCount <= 3) ||
         (complexityFilter === "Advanced" && nodeCount > 3);

    return matchesPlatform && matchesSearch && matchesComplexity;
  }).sort((a, b) => {
      if (sortBy === "Recent") return new Date(b.updatedAt || b.createdAt) - new Date(a.updatedAt || a.createdAt);
      if (sortBy === "Most Complex") return (b.graph?.nodes?.length || 0) - (a.graph?.nodes?.length || 0);
      return 0;
  });

  const getComplexityLevel = (nodeCount) => {
      if (nodeCount <= 2) return { label: "Basic", color: "text-emerald-400 border-emerald-400/30 bg-emerald-400/10" };
      if (nodeCount <= 5) return { label: "Intermediate", color: "text-blue-400 border-blue-400/30 bg-blue-400/10" };
      return { label: "Advanced", color: "text-violet-400 border-violet-400/30 bg-violet-400/10" };
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

  return (
    <div className="min-h-screen flex flex-col bg-[#0B1020] text-foreground overflow-x-hidden relative">
      {/* Soft Grid overlay with slight parallax illusion */}
      <div className="fixed inset-0 pointer-events-none bg-[linear-gradient(rgba(34,211,238,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(34,211,238,0.03)_1px,transparent_1px)] bg-[size:40px_40px] z-0" style={{ transform: 'translateZ(-1px) scale(1.1)' }} />
      {/* Dark overlay for modal */}
      {showWorkflowModal && (
        <div className="fixed z-[60] inset-0 pointer-events-none">
          <div className="absolute inset-0 bg-[#0B1020]/80 backdrop-blur-sm transition-all duration-200" />
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

      {/* Compare Platforms Modal */}
      {showComparePlatforms && (
        <div className="fixed z-[70] inset-0 flex items-center justify-center">
          <div className="absolute inset-0 bg-[#0B1020]/80 backdrop-blur-sm" onClick={() => setShowComparePlatforms(false)} />
          <div className="relative z-10 bg-card shadow-lg border border-border rounded-xl p-8 w-[98vw] max-w-3xl flex flex-col gap-6 scale-in max-h-[85vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <button onClick={() => setShowComparePlatforms(false)} className="absolute top-4 right-4 text-muted-foreground hover:text-foreground p-2 rounded-full hover:bg-muted transition">
              <X className="w-5 h-5" />
            </button>
            <div className="text-center space-y-2">
              <h2 className="text-2xl font-bold tracking-tight flex items-center justify-center gap-2">
                <GitMerge className="w-5 h-5 text-cyan-400" /> Platform Comparison
              </h2>
              <p className="text-muted-foreground text-sm">
                See how NoBrain plans workflows across platforms.
              </p>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-white/10">
                    <th className="text-left py-3 px-4 text-muted-foreground font-medium">Feature</th>
                    <th className="text-center py-3 px-4 text-cyan-400 font-semibold">n8n</th>
                    <th className="text-center py-3 px-4 text-violet-400 font-semibold">Zapier</th>
                    <th className="text-center py-3 px-4 text-emerald-400 font-semibold">Make</th>
                  </tr>
                </thead>
                <tbody className="text-white/80">
                  {[
                    { feature: "Self-hosted", n8n: "✓", zapier: "✗", make: "✗" },
                    { feature: "Visual workflow editor", n8n: "✓", zapier: "✓", make: "✓" },
                    { feature: "AI node support", n8n: "✓", zapier: "✓", make: "✓" },
                    { feature: "Custom code nodes", n8n: "✓", zapier: "Limited", make: "✓" },
                    { feature: "Branching & conditionals", n8n: "✓", zapier: "✓", make: "✓" },
                    { feature: "Webhook triggers", n8n: "✓", zapier: "✓", make: "✓" },
                    { feature: "Open source", n8n: "✓", zapier: "✗", make: "✗" },
                    { feature: "NoBrain planning support", n8n: "Full", zapier: "Full", make: "Full" },
                  ].map((row, i) => (
                    <tr key={i} className="border-b border-white/5 hover:bg-white/[0.02]">
                      <td className="py-3 px-4 text-muted-foreground">{row.feature}</td>
                      <td className="text-center py-3 px-4">{row.n8n}</td>
                      <td className="text-center py-3 px-4">{row.zapier}</td>
                      <td className="text-center py-3 px-4">{row.make}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="text-center pt-2">
              <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-violet-500/10 border border-violet-500/20 text-violet-300 text-xs font-mono">
                <Lightbulb className="w-3 h-3" /> Deep comparison & migration guide — Coming Soon
              </span>
            </div>
          </div>
        </div>
      )}

      {/* View Templates Modal */}
      {showTemplates && (
        <div className="fixed z-[70] inset-0 flex items-center justify-center">
          <div className="absolute inset-0 bg-[#0B1020]/80 backdrop-blur-sm" onClick={() => setShowTemplates(false)} />
          <div className="relative z-10 bg-card shadow-lg border border-border rounded-xl p-8 w-[98vw] max-w-4xl flex flex-col gap-6 scale-in max-h-[85vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <button onClick={() => setShowTemplates(false)} className="absolute top-4 right-4 text-muted-foreground hover:text-foreground p-2 rounded-full hover:bg-muted transition">
              <X className="w-5 h-5" />
            </button>
            <div className="text-center space-y-2">
              <h2 className="text-2xl font-bold tracking-tight flex items-center justify-center gap-2">
                <BookOpen className="w-5 h-5 text-cyan-400" /> Starter Templates
              </h2>
              <p className="text-muted-foreground text-sm">
                Pick a template to auto-generate a workflow plan with AI.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {[
                { title: "RSS to Slack", desc: "Fetch RSS feed and send daily summaries to a Slack channel.", icon: "📡", platform: "n8n", prompt: "Fetch RSS feed and send a summary to Slack every day" },
                { title: "Email Digest", desc: "Collect emails, summarize with AI, and store in Google Sheets.", icon: "📧", platform: "Zapier", prompt: "Collect incoming emails, summarize them with AI, and log to Google Sheets" },
                { title: "Lead Scoring", desc: "Score leads from a form submission using AI classification.", icon: "🎯", platform: "n8n", prompt: "When a form is submitted, use AI to score the lead and notify sales on Slack" },
                { title: "Social Monitor", desc: "Monitor Twitter mentions and create Notion entries.", icon: "🔍", platform: "Make", prompt: "Monitor Twitter for brand mentions and create entries in a Notion database" },
                { title: "Data Sync", desc: "Sync CRM contacts with a database on a schedule.", icon: "🔄", platform: "n8n", prompt: "Every hour, sync new contacts from HubSpot CRM to a PostgreSQL database" },
                { title: "Support Bot", desc: "Auto-respond to support tickets using AI classification.", icon: "🤖", platform: "Zapier", prompt: "When a support ticket is created, classify urgency with AI and auto-respond" },
              ].map((tpl, i) => (
                <button
                  key={i}
                  onClick={() => {
                    setShowTemplates(false);
                    navigate(`/workflow/ai-prompt`, { state: { prefill: tpl.prompt, platform: tpl.platform } });
                  }}
                  className="group flex flex-col items-start p-5 rounded-xl border border-border bg-background hover:border-primary/50 hover:bg-white/[0.03] transition-all duration-200 text-left"
                >
                  <div className="flex items-center gap-3 mb-3 w-full">
                    <span className="text-2xl">{tpl.icon}</span>
                    <div className="flex-1">
                      <h3 className="text-sm font-semibold text-white">{tpl.title}</h3>
                      <span className="text-[10px] font-mono text-muted-foreground uppercase">{tpl.platform}</span>
                    </div>
                    <ChevronRight className="w-4 h-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                  <p className="text-xs text-muted-foreground leading-relaxed">{tpl.desc}</p>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      <header className="relative z-30 pt-6 px-4 sm:px-6 lg:px-8 flex-shrink-0">
        <div className="max-w-7xl mx-auto flex justify-center">
          <div className="flex items-center justify-between h-14 px-6 bg-[#11172A]/80 border border-[rgba(255,255,255,0.06)] shadow-[0_4px_30px_rgba(0,0,0,0.5)] backdrop-blur-xl rounded-full w-full">
            <div className="flex items-center gap-3">
              <NoBrainLogo size="small" />
              <span className="text-[#B6C2D9] text-sm font-medium hidden sm:inline-block border-l border-white/10 pl-3">Command Center</span>
            </div>

            <div className="flex items-center gap-3">
              <Button variant="ghost" size="sm" onClick={() => navigate("/logs")}>
                <History className="w-4 h-4 mr-2" />
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
      <div className="flex-1 p-4 sm:p-6 lg:p-8 relative z-10">
        <div className="max-w-7xl mx-auto space-y-8">
          
          {/* Quick Actions Row */}
          <div className="flex flex-wrap items-center justify-center gap-4">
             <button onClick={() => setShowWorkflowModal(true)} className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-gradient-to-r from-[rgba(34,211,238,0.15)] to-[rgba(167,139,250,0.15)] border border-[rgba(34,211,238,0.3)] text-white text-sm font-semibold hover:bg-[rgba(34,211,238,0.25)] hover:shadow-[0_0_20px_rgba(34,211,238,0.2)] hover:-translate-y-0.5 transition-all duration-300 backdrop-blur-md">
                <Plus className="w-4 h-4 text-cyan-400" /> New Plan
             </button>
             <button onClick={() => setShowComparePlatforms(true)} className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-white/[0.03] border border-white/[0.08] text-[#B6C2D9] text-sm font-medium hover:bg-white/[0.08] hover:text-white hover:-translate-y-0.5 transition-all duration-300 backdrop-blur-md">
                <GitMerge className="w-4 h-4" /> Compare Platforms
             </button>
             <button onClick={() => setShowTemplates(true)} className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-white/[0.03] border border-white/[0.08] text-[#B6C2D9] text-sm font-medium hover:bg-white/[0.08] hover:text-white hover:-translate-y-0.5 transition-all duration-300 backdrop-blur-md">
                <BookOpen className="w-4 h-4" /> View Templates
             </button>
             {selectedWorkflow && (
                 <button onClick={() => handleEditWorkflow(selectedWorkflow)} className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-white/[0.03] border border-white/[0.08] text-[#B6C2D9] text-sm font-medium hover:bg-white/[0.08] hover:text-white hover:-translate-y-0.5 transition-all duration-300 backdrop-blur-md">
                    <Edit className="w-4 h-4" /> Continue Last Plan
                 </button>
             )}
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="w-8 h-8 text-muted-foreground animate-spin" />
              <span className="ml-3 text-muted-foreground">Loading planner...</span>
            </div>
          ) : (
            <div className="flex flex-col gap-6">
              
              {/* Central Hero Brain Panel */}
              {selectedWorkflow ? (
                  <BentoTile className="p-0 flex flex-col overflow-hidden bg-[#11172A]/80 backdrop-blur-xl border border-[rgba(255,255,255,0.08)] shadow-[0_8px_32px_rgba(0,0,0,0.5)] relative group">
                    {/* Animated gradient bottom border */}
                    <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-cyan-500 via-violet-500 to-cyan-500 bg-[length:200%_auto] animate-gradient" />
                    {/* Radial glow accent */}
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(34,211,238,0.08)_0%,transparent_50%)] pointer-events-none" />
                    
                    <div className="p-8 pb-10 relative z-10 flex flex-col md:flex-row items-center md:items-start gap-8">
                        {/* Central Brain Icon */}
                        <div className="w-32 h-32 rounded-3xl bg-gradient-to-br from-[rgba(34,211,238,0.15)] to-[rgba(167,139,250,0.15)] border border-[rgba(255,255,255,0.1)] flex items-center justify-center shadow-[0_0_40px_rgba(34,211,238,0.15)] shrink-0 group-hover:shadow-[0_0_60px_rgba(34,211,238,0.25)] transition-shadow duration-500 relative">
                            <div className="absolute inset-2 rounded-2xl border border-dashed border-white/10" />
                            <img src="/logo.png" alt="Brain" className="w-16 h-16 drop-shadow-[0_0_15px_rgba(34,211,238,0.6)]" />
                        </div>

                        {/* Info Section */}
                        <div className="flex-1 text-center md:text-left">
                            <div className="flex items-center justify-center md:justify-start gap-3 mb-3">
                                <span className="px-2.5 py-1 rounded bg-[#22D3EE]/10 border border-[#22D3EE]/30 text-[#22D3EE] text-[10px] font-bold uppercase tracking-widest flex items-center gap-1.5">
                                    <Activity className="w-3 h-3" /> Active Planning Session
                                </span>
                                {selectedWorkflow.platform && (
                                   <span className="px-2.5 py-1 rounded bg-white/5 border border-white/10 text-[#B6C2D9] text-[10px] font-bold tracking-widest uppercase">
                                       {selectedWorkflow.platform}
                                   </span>
                                )}
                            </div>

                            <h2 className="text-3xl font-extrabold text-white mb-2" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
                                {selectedWorkflow.name}
                            </h2>

                            {(() => {
                                const stats = getComplexityLevel(selectedWorkflow.graph?.nodes?.length || 0);
                                return (
                                  <div className="flex items-center justify-center md:justify-start gap-4 mb-5 text-sm">
                                      <span className="text-[#7E8BA3] flex items-center gap-1.5">
                                          <GitMerge className="w-4 h-4" /> {selectedWorkflow.graph?.nodes?.length || 0} Nodes
                                      </span>
                                      <span className={`px-2 py-0.5 rounded border text-[10px] font-bold uppercase tracking-wider ${stats.color}`}>
                                          {stats.label}
                                      </span>
                                  </div>
                                )
                            })()}

                            <p className="text-[#B6C2D9] max-w-2xl mb-8 leading-relaxed">
                                {selectedWorkflow.description || "This workflow connects your services to automate data transfer and processing. It handles logic conditionally based on node output."}
                            </p>

                            <div className="flex items-center justify-center md:justify-start gap-4">
                                <Button className="bg-gradient-to-r from-[#22D3EE] to-[#A78BFA] hover:brightness-110 text-white shadow-[0_0_16px_rgba(34,211,238,0.25)] hover:shadow-[0_0_24px_rgba(34,211,238,0.4)] transition-all px-8 py-2.5 h-auto text-sm font-semibold rounded-lg" onClick={() => handleEditWorkflow(selectedWorkflow)}>
                                    <FolderOpen className="w-4 h-4 mr-2" /> Open Planner
                                </Button>
                                <Button variant="outline" className="border-white/10 hover:bg-white/5 text-white bg-transparent h-auto py-2.5 px-6 rounded-lg shadow-none" onClick={() => { if (selectedWorkflow) navigate(`/workflow/complete?id=${selectedWorkflow._id}`); }}>
                                    <BookOpen className="w-4 h-4 mr-2 text-[#7E8BA3]" /> View Explanation
                                </Button>
                            </div>
                        </div>

                        {/* Top-right subtle controls */}
                        <div className="absolute top-6 right-6 flex gap-2">
                             <Button variant="ghost" size="sm" onClick={() => handleDeleteWorkflow(selectedWorkflow._id)} className="text-[#7E8BA3] hover:text-red-400 hover:bg-red-500/10 h-8 w-8 p-0 shrink-0 border border-transparent hover:border-red-500/20 rounded-md">
                                <Trash2 className="w-4 h-4" />
                             </Button>
                        </div>
                    </div>
                  </BentoTile>
              ) : (
                  <BentoTile className="flex flex-col items-center justify-center p-16 text-center bg-[#11172A]/50 backdrop-blur-md border border-dashed border-white/20 min-h-[350px]">
                    <div className="w-20 h-20 bg-white/5 rounded-3xl flex items-center justify-center mb-6 border border-white/10 shadow-[0_0_30px_rgba(255,255,255,0.05)]">
                      <img src="/logo.png" alt="Brain" className="w-10 h-10 opacity-50 grayscale" />
                    </div>
                    <h3 className="text-xl font-bold text-white mb-2" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>No Active Plans</h3>
                    <p className="text-[#7E8BA3] mb-8 max-w-sm">Initiate an AI planning session or start manually on the canvas to map out your logic.</p>
                    <Button onClick={() => setShowWorkflowModal(true)} className="bg-gradient-to-r from-[#22D3EE] to-[#A78BFA] text-white">
                      <Plus className="w-4 h-4 mr-2" /> Start Planning
                    </Button>
                  </BentoTile>
              )}

              {/* Planning Insights Row */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-[#11172A]/60 backdrop-blur-md border border-[rgba(255,255,255,0.06)] rounded-2xl p-4 flex items-start gap-4 shadow-sm hover:bg-[#11172A]/80 transition-colors">
                      <div className="p-2.5 rounded-xl bg-violet-500/10 border border-violet-500/20 shrink-0 mt-0.5">
                          <Lightbulb className="w-5 h-5 text-violet-400" />
                      </div>
                      <div>
                          <p className="text-white font-semibold text-sm mb-1">Architecture Tip</p>
                          <p className="text-[#7E8BA3] text-sm">Most users create 3-5 node workflows. Keep logic modular to avoid complexity debt.</p>
                      </div>
                  </div>
                  <div className="bg-[#11172A]/60 backdrop-blur-md border border-[rgba(255,255,255,0.06)] rounded-2xl p-4 flex items-start gap-4 shadow-sm hover:bg-[#11172A]/80 transition-colors">
                      <div className="p-2.5 rounded-xl bg-cyan-500/10 border border-cyan-500/20 shrink-0 mt-0.5">
                          <BarChart2 className="w-5 h-5 text-cyan-400" />
                      </div>
                      <div>
                          <p className="text-white font-semibold text-sm mb-1">Planning Insight</p>
                          <p className="text-[#7E8BA3] text-sm">You frequently use Trigger nodes. Try utilizing AI Transform for cleaner data ingestion.</p>
                      </div>
                  </div>
              </div>

              {/* Contextual Stats Row */}
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                  {[
                      { l: "Total Plans Created", v: userStats.totalWorkflows, i: <BookOpen className="w-4 h-4" />, c: "text-blue-400" },
                      { l: "Avg Complexity", v: getComplexityLevel(userStats.totalNodes / (userStats.totalWorkflows || 1)).label, i: <Zap className="w-4 h-4" />, c: "text-amber-400" },
                      { l: "Most Used Platform", v: userStats.mostUsedPlatform, i: <Database className="w-4 h-4" />, c: "text-emerald-400" },
                      { l: "Common Node", v: userStats.commonNodeType, i: <GitMerge className="w-4 h-4" />, c: "text-violet-400" },
                      { l: "Planning Growth", v: userStats.growthRate, i: <TrendingUp className="w-4 h-4" />, c: "text-cyan-400" }
                  ].map((stat, idx) => (
                      <div key={idx} className="bg-[#11172A]/80 backdrop-blur-md border border-[rgba(255,255,255,0.06)] rounded-xl p-4 hover:-translate-y-1 hover:shadow-[0_8px_20px_rgba(0,0,0,0.3)] hover:border-white/10 transition-all duration-300">
                          <div className={`flex items-center gap-2 mb-3 text-xs font-semibold ${stat.c}`}>
                              {stat.i} <span className="opacity-90 tracking-wide uppercase">{stat.l}</span>
                          </div>
                          <p className="text-xl font-bold text-white truncate">{stat.v}</p>
                      </div>
                  ))}
              </div>

              {/* Filtering Row */}
              <div className="flex flex-col md:flex-row items-center justify-between gap-4 bg-[#11172A]/80 backdrop-blur-md border border-[rgba(255,255,255,0.06)] rounded-2xl p-3">
                  <div className="flex items-center gap-2 w-full md:w-auto overflow-x-auto pb-1 md:pb-0 scrollbar-hide">
                      <div className="px-3 py-1.5 border-r border-white/10 mr-1 flex items-center">
                          <Filter className="w-4 h-4 text-[#7E8BA3]" />
                      </div>
                      {["All", "n8n", "Zapier", "Make"].map(p => (
                          <button key={p} onClick={() => setActiveFilter(p)} className={`px-4 py-1.5 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${activeFilter === p ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30' : 'bg-transparent text-[#7E8BA3] border border-transparent hover:bg-white/5'}`}>
                              {p}
                          </button>
                      ))}
                      <div className="w-px h-6 bg-white/10 mx-2 hidden md:block" />
                      {["All", "Basic", "Advanced"].map(c => (
                          <button key={c} onClick={() => setComplexityFilter(c)} className={`px-4 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors ${complexityFilter === c ? 'bg-violet-500/20 text-violet-400 border border-violet-500/30' : 'bg-transparent text-[#7E8BA3] border border-transparent hover:bg-white/5'}`}>
                              {c}
                          </button>
                      ))}
                  </div>

                  <div className="flex items-center gap-3 w-full md:w-auto">
                      <div className="relative flex-1 md:w-64">
                          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#7E8BA3]" />
                          <input type="text" placeholder="Search plans..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="w-full pl-9 pr-4 py-2 bg-[#0E1425] border border-[rgba(255,255,255,0.06)] rounded-lg text-sm text-[#F3F6FF] placeholder-[#7E8BA3] focus:outline-none focus:border-cyan-500/50" />
                      </div>
                      <select value={sortBy} onChange={(e) => setSortBy(e.target.value)} className="bg-[#0E1425] border border-[rgba(255,255,255,0.06)] rounded-lg px-3 py-2 text-sm text-[#F3F6FF] focus:outline-none focus:border-cyan-500/50 cursor-pointer appearance-none pr-8 relative bg-[url('data:image/svg+xml;charset=US-ASCII,%3Csvg%20width%3D%2224%22%20height%3D%2224%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20fill%3D%22none%22%20stroke%3D%22%237E8BA3%22%20stroke-width%3D%222%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%3E%3Cpolyline%20points%3D%226%209%2012%2015%2018%209%22%2F%3E%3C%2Fsvg%3E')] bg-no-repeat bg-[center_right_0.4rem] bg-[length:14px_14px]">
                          <option>Recent</option>
                          <option>Most Complex</option>
                      </select>
                  </div>
              </div>

              {/* Workflow Library Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
                  {filteredWorkflows.map(workflow => (
                      <div key={workflow._id} onClick={() => setSelectedWorkflowId(workflow._id)} className={`relative group p-5 bg-[#11172A]/60 backdrop-blur-xl border rounded-2xl cursor-pointer hover:-translate-y-1 transition-all duration-300 ${selectedWorkflowId === workflow._id ? 'border-cyan-500/50 shadow-[0_0_20px_rgba(34,211,238,0.15)] bg-[#11172A]/90' : 'border-[rgba(255,255,255,0.06)] hover:border-white/15 hover:shadow-[0_8px_24px_rgba(0,0,0,0.4)]'}`}>
                          {/* Mini Linear Preview Icon */}
                          <div className="flex items-center justify-between mb-4">
                              <div className="flex items-center gap-1 opacity-60">
                                  <div className="w-4 h-4 rounded bg-cyan-500/20 border border-cyan-500/40" />
                                  <div className="w-3 h-[1px] bg-white/20" />
                                  <div className="w-4 h-4 rounded bg-violet-500/20 border border-violet-500/40" />
                                  <div className="w-3 h-[1px] bg-white/20" />
                                  <div className="w-4 h-4 rounded bg-emerald-500/20 border border-emerald-500/40" />
                              </div>
                              {workflow.platform && (
                                  <span className="text-[9px] font-bold text-white/50 bg-white/5 border border-white/10 px-2 py-0.5 rounded-full uppercase tracking-wider">
                                      {workflow.platform}
                                  </span>
                              )}
                          </div>
                          
                          <h3 className={`font-semibold text-lg mb-1 truncate ${selectedWorkflowId === workflow._id ? 'text-cyan-400' : 'text-white'}`}>
                              {workflow.name}
                          </h3>
                          
                          <div className="flex items-center gap-3 text-xs text-[#7E8BA3] mt-3">
                              <span className="flex items-center gap-1.5"><GitMerge className="w-3 h-3" /> {workflow.graph?.nodes?.length || 0}</span>
                              <span className="w-1 h-1 rounded-full bg-white/20" />
                              <span>{new Date(workflow.updatedAt || workflow.createdAt).toLocaleDateString()}</span>
                          </div>

                          {/* Status Badge */}
                          <div className="absolute top-5 right-5 opacity-0 group-hover:opacity-100 transition-opacity">
                              <ExternalLink className="w-4 h-4 text-[#7E8BA3]" />
                          </div>
                      </div>
                  ))}
                  {filteredWorkflows.length === 0 && (
                      <div className="col-span-full py-16 text-center border border-dashed border-white/10 rounded-2xl bg-white/[0.02]">
                          <Search className="w-8 h-8 text-[#7E8BA3] mx-auto mb-3 opacity-50" />
                          <p className="text-white font-medium mb-1">No plans match your filters</p>
                          <p className="text-[#7E8BA3] text-sm">Try adjusting your search criteria or create a new plan.</p>
                      </div>
                  )}
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