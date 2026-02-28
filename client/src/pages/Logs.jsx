import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FileText,
  Clock,
  LayoutDashboard,
  ArrowLeft,
  Plus,
  GitBranch,
  Calendar,
  Layers,
  CheckCircle,
  AlertCircle
} from 'lucide-react';
import { workflowAPI, authAPI } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import NoBrainLogo from "../components/NoBrainLogo";
import { toast } from 'sonner';

/**
 * LogsPage — v2: Converted to Planning Activity Log
 * Shows history of created workflows (Planning Events)
 */
export default function LogsPage() {
  const navigate = useNavigate();
  const { getUserId } = useAuth();
  const [workflows, setWorkflows] = useState([]);
  const [loading, setLoading] = useState(true);

  // Helper to determine workflow status based on structure (same as Dashboard)
  const getWorkflowStatus = (workflow) => {
    const nodeCount = workflow.graph?.nodes?.length || 0;
    if (nodeCount === 0) return 'empty';
    if (nodeCount < 2) return 'draft';
    return 'ready';
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'ready': return 'text-[#34D399] bg-[rgba(52,211,153,0.1)] border-[rgba(52,211,153,0.3)]';
      case 'draft': return 'text-[#FBBF24] bg-[rgba(251,191,36,0.1)] border-[rgba(251,191,36,0.3)]';
      case 'empty': return 'text-[#7E8BA3] bg-[rgba(126,139,163,0.1)] border-[rgba(126,139,163,0.3)]';
      default: return 'text-[#7E8BA3] bg-[rgba(126,139,163,0.1)] border-[rgba(126,139,163,0.3)]';
    }
  };

  const getStatusLabel = (status) => {
    switch (status) {
      case 'ready': return 'Ready to Export';
      case 'draft': return 'Drafting';
      case 'empty': return 'New Plan';
      default: return 'Unknown';
    }
  };

  useEffect(() => {
    const fetchActivity = async () => {
      try {
        const ownerId = getUserId();
        if (!ownerId) return;

        // Fetch workflows as "Planning Activity"
        const response = await workflowAPI.getAll({ ownerId });

        if (response && response.success && Array.isArray(response.data)) {
          // Sort by updated_at or created_at desc
          const sorted = response.data.sort((a, b) =>
            new Date(b.updatedAt || b.createdAt) - new Date(a.updatedAt || a.createdAt)
          );
          setWorkflows(sorted);
        }
      } catch (error) {
        console.error('Failed to fetch activity logs:', error);
        toast.error("Could not load activity history");
      } finally {
        setLoading(false);
      }
    };

    fetchActivity();
  }, [getUserId]);

  return (
    <div className="h-screen flex flex-col overflow-y-auto overflow-x-hidden bg-background text-foreground">
        {/* Header — Floating Island */}
        <header className="relative z-30 mb-8 pt-6 flex-shrink-0 px-4 sm:px-6 lg:px-8">
          <div className="max-w-[1200px] mx-auto">
            <div className="flex items-center justify-between h-16 px-6 bg-[#11172A]/80 border border-[rgba(255,255,255,0.06)] shadow-[var(--shadow-sm)] backdrop-blur-md rounded-[var(--radius-lg)]">
              <div className="flex items-center gap-3">
                <NoBrainLogo />
              </div>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => navigate('/dashboard')}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-[var(--radius-md)] border border-[rgba(255,255,255,0.06)] bg-[#11172A] text-[#B6C2D9] hover:border-[rgba(255,255,255,0.12)] hover:text-[#22D3EE] transition-all text-sm font-medium" style={{ transitionDuration: 'var(--transition-fast)' }}
                >
                  <ArrowLeft className="w-4 h-4" />
                  Dashboard
                </button>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 w-full max-w-[1000px] mx-auto px-4 pb-20 relative z-30">

          {/* Header Section */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
            <div>
              <h1 className="text-3xl font-bold text-[#F3F6FF] mb-2 flex items-center gap-3">
                <FileText className="w-8 h-8 text-[#22D3EE]" />
                Planning Activity
              </h1>
              <p className="text-[#B6C2D9]">
                Track your workflow creation and updates.
                <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded text-xs font-mono font-medium bg-[#11172A] text-[#7E8BA3] border border-[rgba(255,255,255,0.06)]">
                  Planning Trace Log
                </span>
              </p>
            </div>
            {/* New Plan button removed as requested */}
          </div>

          {/* Activity List */}
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20 gap-4">
              <div className="w-8 h-8 border-2 border-[#22D3EE] border-t-transparent rounded-full animate-spin" />
              <p className="text-[#7E8BA3] animate-pulse">Loading activity...</p>
            </div>
          ) : workflows.length === 0 ? (
            <div className="text-center py-20 bg-[#11172A]/60 border border-[rgba(255,255,255,0.06)] rounded-[var(--radius-lg)] backdrop-blur-sm">
              <FileText className="w-16 h-16 text-[#7E8BA3] mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-[#F3F6FF] mb-2">No activity yet</h3>
              <p className="text-[#B6C2D9] mb-6 max-w-sm mx-auto">
                Create your first workflow plan to see activity here.
              </p>
              <button
                onClick={() => navigate('/workflow')}
                className="px-6 py-2 rounded-[var(--radius-md)] border border-[rgba(255,255,255,0.06)] hover:border-[#22D3EE] text-[#22D3EE] hover:text-[#22D3EE]/80 transition-colors"
              >
                Start Planning
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {workflows.map((workflow) => {
                const status = getWorkflowStatus(workflow);
                const nodeCount = workflow.graph?.nodes?.length || 0;
                const lastEdited = new Date(workflow.updatedAt || workflow.createdAt).toLocaleDateString(undefined, {
                  month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
                });

                return (
                  <div
                    key={workflow._id}
                    onClick={() => navigate('/workflow/complete', { state: { workflow: workflow, mode: 'view' } })}
                    className={`group relative flex items-center gap-6 p-5 bg-[#11172A]/60 hover:bg-[#151C33] border border-[rgba(255,255,255,0.06)] hover:border-[rgba(255,255,255,0.12)] rounded-[var(--radius-lg)] cursor-pointer backdrop-blur-sm border-l-2 ${status === 'ready' ? 'border-l-[#34D399]' : status === 'draft' ? 'border-l-[#FBBF24]' : 'border-l-[#7E8BA3]'}`}
                    style={{ transitionDuration: 'var(--transition-normal)', boxShadow: 'var(--shadow-sm)' }}
                  >
                    {/* Icon */}
                    <div className="flex-shrink-0 w-12 h-12 rounded-full bg-[#0E1425] border border-[rgba(255,255,255,0.06)] flex items-center justify-center group-hover:scale-110 transition-transform">
                      <GitBranch className="w-6 h-6 text-[#7E8BA3] group-hover:text-[#22D3EE] transition-colors" />
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <h3 className="text-lg font-semibold text-[#B6C2D9] group-hover:text-[#F3F6FF] truncate pr-4">
                          {workflow.name}
                        </h3>
                        {/* Status Badge */}
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusColor(status)}`}>
                          {status === 'ready' && <CheckCircle className="w-3 h-3" />}
                          {status === 'draft' && <Layers className="w-3 h-3" />}
                          {status === 'empty' && <AlertCircle className="w-3 h-3" />}
                          {getStatusLabel(status)}
                        </span>
                      </div>

                      <div className="flex items-center gap-6 text-sm text-[#7E8BA3] font-mono">
                        <div className="flex items-center gap-1.5">
                          <Calendar className="w-4 h-4" />
                          <span>{lastEdited}</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <Layers className="w-4 h-4" />
                          <span>{nodeCount} nodes</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <Clock className="w-4 h-4" />
                          <span>Planning Event</span>
                        </div>
                      </div>
                    </div>

                    {/* Arrow */}
                    <div className="opacity-0 group-hover:opacity-100 transition-opacity -ml-2">
                      <ArrowLeft className="w-5 h-5 text-[#22D3EE] rotate-180" />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </main>
    </div>
  );
}
