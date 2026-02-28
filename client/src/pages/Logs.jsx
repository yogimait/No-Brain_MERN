import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import {
  FileText, GitBranch, CheckCircle, AlertCircle, Layers,
  ArrowLeft, ChevronRight, Search, SlidersHorizontal, Clock
} from "lucide-react";
import NoBrainLogo from "../components/NoBrainLogo";
import { workflowAPI } from "../services/api";
import { useAuth } from "../contexts/AuthContext";
import { toast } from "sonner";

export default function Logs() {
  const navigate = useNavigate();
  const { getUserId } = useAuth();
  const [workflows, setWorkflows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    const fetchWorkflows = async () => {
      try {
        setLoading(true);
        const userId = getUserId();
        if (!userId) {
          navigate("/login");
          return;
        }
        const response = await workflowAPI.getAll({ userId });
        if (response?.success && response?.data) {
          setWorkflows(response.data);
        } else if (response?.data) {
          setWorkflows(response.data);
        }
      } catch (error) {
        console.error("Error fetching workflows:", error);
        toast.error("Failed to load activity log");
      } finally {
        setLoading(false);
      }
    };
    fetchWorkflows();
  }, [getUserId, navigate]);

  const getStatusInfo = (workflow) => {
    const nodeCount = workflow.graph?.nodes?.length || 0;
    const edgeCount = workflow.graph?.edges?.length || 0;
    if (nodeCount >= 2 && edgeCount >= 1)
      return { label: "Ready to Export", color: "text-emerald-400", bg: "bg-emerald-500/10", border: "border-l-emerald-500", icon: <CheckCircle className="w-3.5 h-3.5 text-emerald-400" /> };
    if (nodeCount >= 1)
      return { label: "Drafting", color: "text-amber-400", bg: "bg-amber-500/10", border: "border-l-amber-500", icon: <Layers className="w-3.5 h-3.5 text-amber-400" /> };
    return { label: "New Plan", color: "text-[#7E8BA3]", bg: "bg-white/5", border: "border-l-[#7E8BA3]", icon: <AlertCircle className="w-3.5 h-3.5 text-[#7E8BA3]" /> };
  };

  const filterPills = ["All", "Ready", "Draft", "New"];

  const filteredWorkflows = workflows.filter(w => {
    const status = getStatusInfo(w);
    const matchesFilter = activeFilter === "All" ||
      (activeFilter === "Ready" && status.label.includes("Ready")) ||
      (activeFilter === "Draft" && status.label.includes("Draft")) ||
      (activeFilter === "New" && status.label.includes("New"));
    const matchesSearch = !searchQuery || w.name?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const formatDate = (dateStr) => {
    if (!dateStr) return "Unknown";
    const d = new Date(dateStr);
    return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) +
      " " + d.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" });
  };

  return (
    <div className="min-h-screen bg-[#0B1020] text-[#F3F6FF] relative">
      {/* Grid overlay */}
      <div className="fixed inset-0 pointer-events-none bg-[linear-gradient(rgba(255,255,255,0.015)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.015)_1px,transparent_1px)] bg-[size:40px_40px]" />

      {/* ═══ NAVBAR ═══ */}
      <nav className="sticky top-0 z-50 flex justify-center pt-4 px-4">
        <div className="max-w-4xl w-full flex items-center justify-between h-14 px-6 bg-[#11172A]/80 border border-[rgba(255,255,255,0.06)] backdrop-blur-xl rounded-full shadow-[var(--shadow-md)]">
          <NoBrainLogo size="small" />
          <button onClick={() => navigate("/dashboard")}
            className="flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/5 border border-white/10 hover:bg-white/10 transition-all text-sm text-[#B6C2D9] font-medium">
            <ArrowLeft className="w-4 h-4" /> Dashboard
          </button>
        </div>
      </nav>

      <main className="max-w-4xl mx-auto px-4 pt-10 pb-16 relative z-10">
        {/* ═══ HEADER ═══ */}
        <div className="flex items-start gap-4 mb-8">
          <div className="p-3 bg-[rgba(34,211,238,0.1)] border border-[rgba(34,211,238,0.2)] rounded-[var(--radius-md)]">
            <FileText className="w-7 h-7 text-[#22D3EE]" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-white flex items-center gap-3" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
              Planning Activity
            </h1>
            <p className="text-[#7E8BA3] mt-1 text-sm">
              Track your workflow creation and updates
              <span className="ml-3 font-mono text-[10px] px-2 py-0.5 bg-violet-500/10 border border-violet-500/30 rounded text-violet-400 uppercase tracking-wider">Planning Trace Log</span>
            </p>
          </div>
        </div>

        {/* ═══ FILTER / SEARCH BAR ═══ */}
        <div className="flex flex-col md:flex-row items-stretch md:items-center gap-3 mb-8 p-4 bg-[#11172A]/70 border border-[rgba(255,255,255,0.06)] rounded-[var(--radius-lg)] backdrop-blur-md">
          <div className="relative flex-1 max-w-xs">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#7E8BA3]" />
            <input
              type="text"
              placeholder="Search workflows..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-[#0E1425] border border-[rgba(255,255,255,0.06)] rounded-[var(--radius-md)] text-sm text-[#F3F6FF] placeholder-[#7E8BA3] focus:outline-none focus:ring-2 focus:ring-[#22D3EE]/30 focus:border-[#22D3EE]/50 transition-all"
            />
          </div>

          <div className="flex items-center gap-2">
            {filterPills.map(pill => (
              <button key={pill} onClick={() => setActiveFilter(pill)}
                className={`px-4 py-1.5 rounded-full text-xs font-medium transition-all ${activeFilter === pill
                  ? "bg-[#22D3EE]/10 text-[#22D3EE] border border-[#22D3EE]/30 shadow-[0_0_8px_rgba(34,211,238,0.15)]"
                  : "bg-white/[0.03] text-[#7E8BA3] border border-white/[0.06] hover:bg-white/[0.06] hover:text-[#B6C2D9]"
                }`}>
                {pill}
              </button>
            ))}
          </div>
        </div>

        {/* ═══ ACTIVITY LIST ═══ */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="w-8 h-8 border-4 border-[#22D3EE] border-t-transparent rounded-full animate-spin" />
          </div>
        ) : filteredWorkflows.length === 0 ? (
          /* Empty state */
          <div className="text-center py-20">
            <FileText className="w-16 h-16 text-[#7E8BA3]/50 mx-auto mb-6" />
            <h3 className="text-xl font-semibold text-white mb-2">
              {searchQuery || activeFilter !== "All" ? "No matching workflows" : "No activity yet"}
            </h3>
            <p className="text-[#7E8BA3] mb-6 text-sm">
              {searchQuery || activeFilter !== "All"
                ? "Try adjusting your filter or search query"
                : "Start planning your first workflow to see it here"
              }
            </p>
            {!searchQuery && activeFilter === "All" && (
              <button onClick={() => navigate("/dashboard")}
                className="px-6 py-3 rounded-xl border border-[#22D3EE]/30 text-[#22D3EE] font-medium hover:bg-[#22D3EE]/10 transition-all text-sm">
                Start Planning
              </button>
            )}
          </div>
        ) : (
          <div className="space-y-3">
            {filteredWorkflows.map((workflow, i) => {
              const status = getStatusInfo(workflow);
              const nodeCount = workflow.graph?.nodes?.length || 0;
              return (
                <button
                  key={workflow._id || i}
                  onClick={() => navigate("/workflow/complete", { state: { workflowId: workflow._id, workflow, mode: "view" } })}
                  className={`w-full text-left p-4 bg-[#11172A]/80 border border-[rgba(255,255,255,0.06)] border-l-2 ${status.border} rounded-[var(--radius-md)] backdrop-blur-sm hover:bg-[#11172A] hover:border-[rgba(255,255,255,0.12)] hover:shadow-[var(--shadow-sm)] group transition-all duration-200 flex items-center gap-4`}
                >
                  {/* Icon */}
                  <div className="p-2 rounded-full bg-white/[0.04] group-hover:bg-[#22D3EE]/10 transition-colors">
                    <GitBranch className="w-5 h-5 text-[#7E8BA3] group-hover:text-[#22D3EE] transition-colors" />
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <h3 className="text-white font-semibold text-sm truncate group-hover:text-[#22D3EE] transition-colors">
                      {workflow.name || "Untitled Workflow"}
                    </h3>
                    <div className="flex items-center gap-3 mt-1 text-xs text-[#7E8BA3]">
                      <span className="font-mono flex items-center gap-1">
                        <Clock className="w-3 h-3" /> {formatDate(workflow.updatedAt || workflow.createdAt)}
                      </span>
                      <span>{nodeCount} nodes</span>
                      <span className="text-[#7E8BA3]/50">• Planning Event</span>
                    </div>
                  </div>

                  {/* Status Badge */}
                  <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full ${status.bg} ${status.color} text-xs font-medium border border-current/10`}>
                    {status.icon}
                    <span className="hidden sm:inline">{status.label}</span>
                  </div>

                  <ChevronRight className="w-4 h-4 text-[#7E8BA3] opacity-0 group-hover:opacity-100 transition-opacity" />
                </button>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}
