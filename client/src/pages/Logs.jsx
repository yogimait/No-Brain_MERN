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
import { Vortex } from '../components/ui/vortex';
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
      case 'ready': return 'text-green-400 bg-green-500/10 border-green-500/30';
      case 'draft': return 'text-amber-400 bg-amber-500/10 border-amber-500/30';
      case 'empty': return 'text-gray-400 bg-gray-500/10 border-gray-500/30';
      default: return 'text-gray-400 bg-gray-500/10 border-gray-500/30';
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
      <div className="h-screen flex flex-col overflow-y-auto overflow-x-hidden">
        {/* Header */}
        <header className="relative z-30 mb-8 pt-4 flex-shrink-0">
          <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              <div className="flex items-center gap-3">
                <NoBrainLogo />
              </div>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => navigate('/dashboard')}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-gray-600 bg-gray-900/50 text-gray-300 hover:bg-gray-800 hover:text-cyan-300 transition-all text-sm font-medium"
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
              <h1 className="text-3xl font-bold text-white mb-2 flex items-center gap-3">
                <FileText className="w-8 h-8 text-cyan-400" />
                Planning Activity
              </h1>
              <p className="text-gray-400">
                Track your workflow creation and updates.
                <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-800 text-gray-500 border border-gray-700">
                  Execution Logs: Deprecated
                </span>
              </p>
            </div>
            {/* New Plan button removed as requested */}
          </div>

          {/* Activity List */}
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20 gap-4">
              <div className="w-8 h-8 border-2 border-cyan-500 border-t-transparent rounded-full animate-spin" />
              <p className="text-gray-500 animate-pulse">Loading activity...</p>
            </div>
          ) : workflows.length === 0 ? (
            <div className="text-center py-20 bg-gray-900/40 border border-gray-800 rounded-2xl backdrop-blur-sm">
              <FileText className="w-16 h-16 text-gray-600 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-white mb-2">No activity yet</h3>
              <p className="text-gray-400 mb-6 max-w-sm mx-auto">
                Create your first workflow plan to see activity here.
              </p>
              <button
                onClick={() => navigate('/workflow')}
                className="px-6 py-2 rounded-lg border border-gray-700 hover:border-cyan-500 text-cyan-400 hover:text-cyan-300 transition-colors"
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
                    className="group relative flex items-center gap-6 p-5 bg-gray-900/60 hover:bg-gray-800/80 border border-gray-800 hover:border-cyan-500/30 rounded-xl transition-all cursor-pointer backdrop-blur-sm"
                  >
                    {/* Icon */}
                    <div className="flex-shrink-0 w-12 h-12 rounded-full bg-gray-800/80 border border-gray-700 flex items-center justify-center group-hover:scale-110 transition-transform">
                      <GitBranch className="w-6 h-6 text-gray-400 group-hover:text-cyan-400 transition-colors" />
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <h3 className="text-lg font-semibold text-gray-200 group-hover:text-white truncate pr-4">
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

                      <div className="flex items-center gap-6 text-sm text-gray-500">
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
                      <ArrowLeft className="w-5 h-5 text-cyan-500 rotate-180" />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </main>
      </div>
    </Vortex>
  );
}
