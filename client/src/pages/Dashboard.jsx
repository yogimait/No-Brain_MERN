
import { useState, useEffect, useRef } from "react";
import { BackgroundBeams } from "../components/ui/background-beams";
import { useNavigate } from "react-router-dom";
import {
  Rocket,
  Plus,
  Settings,
  LogOut,
  Zap,
  Brain,
  Activity,
  TrendingUp,
  Timer,
  ArrowUp,
Loader2
} from "lucide-react";

// Stock market style data for workflows (KEPT - This drives the status cards)
const marketData = {
  activeWorkflows: 4,
  totalRuns: 47,
  timeSaved: 12.5,
  efficiency: 94,
  successRate: 93,
  marketTrend: "up",
  priceChange: "+2.4%",
  volume: "1.2K",
  marketCap: "$2.4M",
};

// Custom Button component (RE-DEFINED based on your original usage)
const Button = ({
  children,
  className,
  variant = "default",
  size = "default",
  onClick,
  ...props
}) => {
  const baseClasses =
    "inline-flex items-center justify-center rounded-md text-sm font-medium transition-all duration-300 transform active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500";

  const variantClasses = {
    default: "bg-blue-600 hover:bg-blue-700 text-white", // Default primary button
    outline: "border border-gray-600 hover:bg-gray-800 hover:text-blue-300 text-gray-300 bg-gray-900/50", // Outline for secondary buttons
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

// Custom Card component (unchanged)
const Card = ({ children, className, ...props }) => {
  return (
    <div
      className={`rounded-lg border text-card-foreground shadow-sm ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};

// =======================================================================
// REVISED DASHBOARD COMPONENT
// =======================================================================
export default function DashboardPage() {


  const navigate = useNavigate();
  const [selectedWorkflow, setSelectedWorkflow] = useState(null);
  const [editingWorkflow, setEditingWorkflow] = useState(null);
  const [refreshKey, setRefreshKey] = useState(0);
  const [hoveredWorkflow, setHoveredWorkflow] = useState(null);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [showWorkflowModal, setShowWorkflowModal] = useState(false);
  const [workflows, setWorkflows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deletingWorkflow, setDeletingWorkflow] = useState(null);
  const modalRef = useRef();

  // Fetch workflows from backend
  useEffect(() => {
    fetchWorkflows();
  }, []);

  const fetchWorkflows = async () => {
    try {
      setLoading(true);
      // For now, use a dummy ownerId - in production, get from auth context
      const ownerId = localStorage.getItem('userId') || '507f1f77bcf86cd799439011';
      const response = await workflowAPI.getAll({ ownerId });
      // Handle ApiResponse format: response is { success, data, message }
      if (response && response.success && response.data) {
        // response.data should be an array of workflows
        setWorkflows(Array.isArray(response.data) ? response.data : []);
      }
    } catch (error) {
      console.error('Error fetching workflows:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteWorkflow = async (workflowId) => {
    if (!confirm('Are you sure you want to delete this workflow?')) return;
    
    try {
      setDeletingWorkflow(workflowId);
      await workflowAPI.delete(workflowId);
      await fetchWorkflows(); // Refresh the list
    } catch (error) {
      console.error('Error deleting workflow:', error);
      alert('Failed to delete workflow');
    } finally {
      setDeletingWorkflow(null);
    }
  };

  const handleEditWorkflow = (workflow) => {
    // Navigate to workflow page with workflow data
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

  // Modal ESC close support
  useEffect(() => {
    if (!showWorkflowModal) return;
    function handleEsc(e) {
      if (e.key === "Escape") setShowWorkflowModal(false);
    }
    window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, [showWorkflowModal]);

  // Update time every second for real-time feel
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div
      className={`min-h-screen relative overflow-hidden ${
        showWorkflowModal ? "modal-blur-bg" : ""
      }`}
    >
        {/* ⭐ FIX: Moved BackgroundBeams here, to cover the entire screen. ⭐ */}
        <BackgroundBeams />

      {/* Dark blurry glass background when modal is up */}
      {showWorkflowModal && (
        <div className="fixed z-[60] inset-0 pointer-events-none">
          <div className="absolute inset-0 bg-black bg-opacity-60 backdrop-blur-md transition-all duration-200" />
        </div>
      )}

      {/* Workflow Creation Modal (KEPT - for 'New Workflow' button) */}
      {showWorkflowModal && (
        <div className="fixed z-[70] inset-0 flex items-center justify-center">
          <div
            className="absolute inset-0"
            onClick={() => setShowWorkflowModal(false)}
          ></div>
          <div
            ref={modalRef}
            className="relative z-10 bg-gray-900/90 backdrop-blur-xl shadow-xl border-2 border-blue-700/30 rounded-3xl p-8 px-5 py-10 w-[98vw] max-w-3xl flex flex-col items-center gap-8 scale-in animate-glowCard"
            style={{
              boxShadow:
                "0 12px 64px 0 rgba(70,80,180,0.22),0 1.5px 32px 0 rgba(99,132,255,.14)",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close (X) */}
            <button
              onClick={() => setShowWorkflowModal(false)}
              className="absolute top-4 right-6 text-gray-400 hover:text-blue-400 text-2xl font-bold bg-gray-800/70 backdrop-blur rounded-full w-10 h-10 flex items-center justify-center z-20 border border-blue-900/30 transition hover:scale-110"
            >
              <span className="text-white">X</span>
            </button>
            <h2 className="text-transparent bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-3xl font-bold tracking-tight mb-4 text-center shadow-blue-400/40 select-none">
              Start a New Workflow
            </h2>
            <p className="text-gray-400 mb-6 text-center text-md max-w-xl">
              How would you like to create your workflow?
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full">
              {/* ⭐ UPDATED: Create Manually Button - Brighter Gradient + Interactive Hover ⭐ */}
              <button
                className="group text-left rounded-xl px-7 py-8 flex flex-col items-start shadow-xl focus:outline-none 
                    // NEW BG/BORDER
                    bg-gradient-to-br from-gray-900/80 to-black/80 border-2 border-blue-700/50 hover:border-blue-400/80 
                    // NEW INTERACTIVITY
                    transition-all duration-300 transform hover:scale-[1.03] hover:shadow-blue-500/50 active:scale-[0.98]"
                onClick={() => {
                  setShowWorkflowModal(false);
                  navigate("/workflow");
                }}
              >
                <div className="flex items-center gap-3 mb-3">
                  <Rocket className="w-7 h-7 text-blue-400 drop-shadow-lg group-hover:scale-110 transition-transform" />
                  <span className="font-bold text-2xl text-white tracking-tight">
                    Create Manually
                  </span>
                </div>
                <p className="text-gray-300 text-[15px] mb-3 pr-1">
                  Build step by step with a visual canvas. Drag, drop, connect,
                  and customize every detail.
                </p>
                <ul className="flex gap-2 text-xs mt-auto">
                  <li className="px-3 py-1 rounded bg-blue-900/40 text-blue-400 font-semibold">
                    Visual Canvas
                  </li>
                  <li className="px-3 py-1 rounded bg-purple-900/40 text-purple-300 font-semibold">
                    Drag & Drop
                  </li>
                  <li className="px-3 py-1 rounded bg-green-900/40 text-green-400 font-semibold">
                    Full Control
                  </li>
                </ul>
              </button>
              
              {/* ⭐ UPDATED: AI Generated Button - Brighter Gradient + Interactive Hover ⭐ */}
              <button
                className="group text-left rounded-xl px-7 py-8 flex flex-col items-start shadow-xl focus:outline-none 
                    // NEW BG/BORDER
                    bg-gradient-to-br from-gray-900/80 to-black/80 border-2 border-purple-700/50 hover:border-purple-400/80 
                    // NEW INTERACTIVITY
                    transition-all duration-300 transform hover:scale-[1.03] hover:shadow-purple-500/50 active:scale-[0.98]"
                onClick={() => {
                  setShowWorkflowModal(false);
                  navigate("/workflow/ai-prompt");
                }}
              >
                <div className="flex items-center gap-3 mb-3">
                  <Zap className="w-7 h-7 text-purple-300 drop-shadow-lg group-hover:scale-110 transition-transform" />
                  <span className="font-bold text-2xl text-white tracking-tight">
                    AI Generated
                  </span>
                </div>
                <p className="text-gray-300 text-[15px] mb-3 pr-1">
                  Describe it, and our AI creates your workflow for you. Provide
                  a summary and let the magic happen!
                </p>
                <ul className="flex gap-2 text-xs mt-auto">
                  <li className="px-3 py-1 rounded bg-purple-900/40 text-purple-300 font-semibold">
                    AI Powered
                  </li>
                  <li className="px-3 py-1 rounded bg-blue-900/40 text-blue-400 font-semibold">
                    Quick Setup
                  </li>
                  <li className="px-3 py-1 rounded bg-green-900/40 text-green-400 font-semibold">
                    Smart
                  </li>
                </ul>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* System Background Elements (KEPT) */}
      <div className="absolute inset-0 bg-black">
        {/* Terminal Grid */}
        <div className="absolute inset-0 opacity-10">
          <svg width="100%" height="100%" className="animate-pulse">
            <defs>
              <pattern
                id="terminalGrid"
                width="30"
                height="30"
                patternUnits="userSpaceOnUse"
              >
                <path
                  d="M 30 0 L 0 0 0 30"
                  fill="none"
                  stroke="#3B82F6"
                  strokeWidth="0.5"
                />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#terminalGrid)" />
          </svg>
        </div>

        {/* Floating Code Elements */}
        {[...Array(15)].map((_, i) => (
          <div
            key={i}
            className="absolute text-xs font-mono animate-pulse text-blue-400"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 5}s`,
              animationDuration: `${2 + Math.random() * 3}s`,
            }}
          >
            {
              ["<div>", "</div>", "{ }", "=>", "()", "[]"][
                Math.floor(Math.random() * 6)
              ]
            }
          </div>
        ))}
      </div>


      {/* Clean Simple Header (KEPT) */}
      <header className="relative z-30 backdrop-blur-sm border-b border-blue-500/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-gradient-to-r from-blue-400 to-purple-400 rounded-lg flex items-center justify-center">
                <Brain className="w-5 h-5 text-white" />
              </div>
              <span className="text-2xl font-bold text-blue-300">NoBrain</span>
            </div>

            <div className="flex items-center gap-3">
              {/* ⭐ UPDATED: New Workflow Button - Enhanced Gradient/Shadow ⭐ */}
              <Button
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white shadow-lg shadow-blue-500/30"
                onClick={() => setShowWorkflowModal(true)}
              >
                <Plus className="w-4 h-4 mr-2" />
                New Workflow
              </Button>


              {/* ⭐ UPDATED: Logout Button - Enhanced Border/Shadow ⭐ */}
              <Button
                variant="outline"
                size="sm"
                className="text-gray-300 border-blue-500/40 hover:border-blue-500 hover:text-blue-300 bg-gray-900/50 shadow-md shadow-black/30"
                onClick={() => navigate("/login")}
              >
                <LogOut className="w-4 h-4 mr-2" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </header>


      {/* Main System Interface */}
      <div className="relative pt-8 pb-6 bg-black">
        {" "}
        {/* Adjusted pt-16 to pt-8 for better top spacing */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Warning Label - NEW POSITION (Moved from absolute top-4) */}
          <div className="mb-8 flex justify-end">
            {" "}
            {/* Added flex and justify-end to align right */}
            <div
              className="bg-gradient-to-br from-blue-600/30 to-green-600/30
    backdrop-blur-xl border border-blue-400/50 rounded-2xl p-6 
    shadow-2xl shadow-blue-500/50 
    hover:shadow-blue-500/50 transition-all duration-300 ease-in-out
    w-64 mx-auto 
    transform hover:scale-[1.03]  [animation:pulse-float_4s_ease-in-out_infinite]"
            >
              <div className="text-center">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                  <span className="text-xs font-mono text-green-400">
                    SYSTEM ONLINE
                  </span>
                </div>
                <div className="text-xs font-mono text-gray-400 mb-1">
                  {currentTime.toLocaleTimeString()}
                </div>
                <div className="text-sm font-bold text-green-400">
                  IT'S TRULY A NO BRAINER
                </div>
              </div>
            </div>
          </div>

          {/* System Status Cards (KEPT) */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {/* Active Workflows */}
            <Card
              className="group bg-gradient-to-br from-blue-600/30 to-green-600/30
    backdrop-blur-xl border border-blue-400/50 rounded-2xl p-6 
    shadow-2xl shadow-blue-500/50 
    hover:shadow-blue-500/50 transition-all duration-300 ease-in-out
    w-64 mx-auto 
    transform hover:scale-[1.03]"
            >
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div
                    className="p-3 bg-blue-500/20 rounded-xl 
                            group-hover:bg-blue-500/40 transition-colors 
                            group-hover:scale-[1.1] duration-300"
                  >
                    <Zap className="w-6 h-6 text-blue-400 animate-pulse" />
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-white">
                      {marketData.activeWorkflows}
                    </p>
                    <p className="text-xs text-blue-400">Active</p>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">Running</span>
                    {/* Added the required states that were implicitly visible in the original cards */}
                    <span className="text-blue-400">+12%</span>
                  </div>
                  <div className="w-full bg-gray-700 rounded-full h-2">
                    <div
                      className="bg-gradient-to-r from-blue-400 to-blue-500 h-2 rounded-full animate-pulse"
                      style={{ width: "75%" }}
                    ></div>
                  </div>
                </div>
              </div>
            </Card>

            {/* Time Saved (Efficiency) */}
            <Card
              className="group bg-gradient-to-br from-blue-600/30 to-green-600/30
    backdrop-blur-xl border border-blue-400/50 rounded-2xl 
    shadow-2xl shadow-blue-500/50 
    hover:shadow-blue-500/50 transition-all duration-300 ease-in-out
    w-64 mx-auto 
    transform hover:scale-[1.03]"
            >
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 bg-green-500/20 rounded-xl group-hover:bg-green-500/30 transition-colors">
                    <Timer
                      className="w-6 h-6 text-green-400 animate-spin"
                      style={{ animationDuration: "3s" }}
                    />
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-white">
                      {marketData.timeSaved}h
                    </p>
                    <p className="text-xs text-green-400">Saved</p>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">Efficiency</span>
                    <span className="text-green-400">
                      {marketData.efficiency}%
                    </span>{" "}
                  </div>
                  <div className="w-full bg-gray-700 rounded-full h-2">
                    <div
                      className="bg-gradient-to-r from-green-400 to-green-500 h-2 rounded-full"
                      style={{ width: `${marketData.efficiency}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            </Card>

            {/* Success Rate (Trend) */}
            <Card
              className="group bg-gradient-to-br from-blue-600/30 to-green-600/30
    backdrop-blur-xl border border-blue-400/50 rounded-2xl 
    shadow-2xl shadow-blue-500/50 
    hover:shadow-blue-500/50 transition-all duration-300 ease-in-out
    w-64 mx-auto 
    transform hover:scale-[1.03]"
            >
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 bg-purple-500/20 rounded-xl group-hover:bg-purple-500/30 transition-colors">
                    <TrendingUp className="w-6 h-6 text-purple-400" />
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-white">
                      {marketData.successRate}%
                    </p>
                    <p className="text-xs text-purple-400">Success</p>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">Trend</span>
                    <span className="flex items-center gap-1 text-purple-400">
                      <ArrowUp className="w-3 h-3" />
                      +5.2% {/* Bolded as requested */}
                    </span>
                  </div>
                  <div className="w-full bg-gray-700 rounded-full h-2">
                    <div
                      className="bg-gradient-to-r from-purple-400 to-purple-500 h-2 rounded-full"
                      style={{ width: `${marketData.successRate}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            </Card>

            {/* Total Runs (Volume) */}
            <Card
              className="group bg-gradient-to-br from-blue-600/30 to-green-600/30
    backdrop-blur-xl border border-blue-400/50 rounded-2xl 
    shadow-2xl shadow-blue-500/50 
    hover:shadow-blue-500/50 transition-all duration-300 ease-in-out
    w-64 mx-auto 
    transform hover:scale-[1.03]"
            >
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 bg-yellow-500/20 rounded-xl group-hover:bg-yellow-500/30 transition-colors">
                    <Activity className="w-6 h-6 text-yellow-400" />
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-white">
                      {marketData.totalRuns}
                    </p>
                    <p className="text-xs text-yellow-400">Runs Today</p>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">Volume</span>
                    <span className="text-yellow-400">+18%</span>{" "}
                    {/* Bolded as requested */}
                  </div>
                  <div className="flex gap-1 h-2">
                    {[...Array(12)].map((_, i) => (
                      <div
                        key={i}
                        className="bg-yellow-400 rounded-sm animate-pulse"
                        style={{
                          width: "8px",
                          height: `${Math.random() * 100}%`,
                          animationDelay: `${i * 0.1}s`,
                        }}
                      ></div>
                    ))}
                  </div>
                </div>
              </div>
            </Card>
          </div>



          {/* Horizontal Workflow Streams */}
          <div className="space-y-8">
            {loading ? (
              <div className="flex items-center justify-center py-20">
                <Loader2 className="w-8 h-8 text-blue-400 animate-spin" />
                <span className="ml-3 text-gray-400">Loading workflows...</span>
              </div>
            ) : workflows.length === 0 ? (
              <div className="text-center py-20 bg-gray-800">
                <div className="w-24 h-24 bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Brain className="w-12 h-12 text-gray-500" />
                </div>
                <h3 className="text-2xl font-semibold text-gray-400 mb-4">
                  No Workflows Yet
                </h3>
                <p className="text-gray-500 mb-8 max-w-md mx-auto">
                  Create your first automation workflow to start the magic.
                  <span className="font-bold"> IT'S A NO-BRAINER!</span>
                </p>
                <Button 
                  className="bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-500/25"
                  onClick={() => setShowWorkflowModal(true)}
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Create First Workflow
                </Button>
              </div>
            ) : (
              workflows.map((workflow) => {
                // Convert workflow data to display format
                const graph = workflow.graph || { nodes: [], edges: [] };
                const status = 'completed'; // Default status for saved workflows
                const progress = 100;
                
                return (
              <div key={workflow._id} className="relative bg-gray-900/20 backdrop-blur-sm rounded-lg border border-gray-700/50 p-6 hover:border-blue-500/50 transition-all duration-300">
                
                {/* Workflow Header */}
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl flex items-center justify-center bg-green-500/20">
                      <CheckCircle className="w-6 h-6 text-green-400" />
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold text-white">
                        {workflow.name}
                      </h3>
                      <p className="text-sm text-gray-400">
                        {workflow.description || 'No description'} • Created: {new Date(workflow.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <p className="text-lg font-bold text-white">
                        {graph.nodes?.length || 0} nodes
                      </p>
                      <p className="text-sm text-gray-400">
                        {graph.edges?.length || 0} connections
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-gray-300 border-gray-600 hover:border-blue-500 hover:text-blue-300"
                        onClick={() => handleEditWorkflow(workflow)}
                        disabled={deletingWorkflow === workflow._id}
                      >
                        <Edit className="w-4 h-4 mr-2" />
                        Edit
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-gray-300 border-gray-600 hover:border-red-500 hover:text-red-300"
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
                </div>

                {/* Simple Node Preview */}
                <div className="mb-4 pt-4 border-t border-gray-700/50">
                  <p className="text-sm text-gray-400 mb-2">
                    Nodes in workflow: {graph.nodes?.length || 0}
                  </p>
                  {graph.nodes && graph.nodes.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {graph.nodes.slice(0, 6).map((node, idx) => (
                        <div key={idx} className="px-2 py-1 bg-gray-800/50 rounded text-xs text-gray-300">
                          {node.data?.label || node.id}
                        </div>
                      ))}
                      {graph.nodes.length > 6 && (
                        <div className="px-2 py-1 bg-gray-800/50 rounded text-xs text-gray-300">
                          +{graph.nodes.length - 6} more
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
                );
              })
            )}
          </div>

        </div>
      </div>
      <style>{`
  @keyframes scaleIn { from { transform:scale(.93); opacity:.35; } to { transform:scale(1); opacity:1; }}
  .scale-in { animation: scaleIn .38s cubic-bezier(.39,.3,.37,1.06); }
  .animate-glowCard { box-shadow:0 1.5px 24px #4787e644,0 1.5px 40px #8133f229 !important;}
  .modal-blur-bg > div:not(.fixed):not(.scale-in):not(.z-[70]) {
    filter: blur(6px) brightness(.87) grayscale(.12) !important;
    pointer-events: none !important;
    user-select: none !important;
  }
`}</style>
    </div>
  );
}