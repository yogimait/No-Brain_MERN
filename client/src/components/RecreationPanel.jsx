// client/src/components/RecreationPanel.jsx
// Phase-7: Workflow Recreation Guidance Panel
// Step-by-step recreation instructions for building workflows in platform UI

import { useState } from 'react';
import { X, Hammer, Check, ChevronDown, ChevronRight, Circle, Cable, Sparkles, Info } from 'lucide-react';
import { Button } from './ui/button';

// Role badge colors — consistent with ExplainabilityPanel
const ROLE_COLORS = {
  trigger: { bg: 'bg-cyan-500/15', text: 'text-cyan-400', border: 'border-cyan-500/30', label: 'Trigger' },
  action: { bg: 'bg-amber-500/15', text: 'text-amber-400', border: 'border-amber-500/30', label: 'Action' },
};

function getRoleBadge(role) {
  return ROLE_COLORS[role] || ROLE_COLORS.action;
}

// Step type icons
function getStepIcon(type) {
  switch (type) {
    case 'add-node': return <Circle className="w-3 h-3" />;
    case 'connect': return <Cable className="w-3 h-3" />;
    case 'finalize': return <Sparkles className="w-3 h-3" />;
    default: return <Circle className="w-3 h-3" />;
  }
}

export default function RecreationPanel({ data, loading, onClose }) {
  const [checkedSteps, setCheckedSteps] = useState(new Set());
  const [expandedSteps, setExpandedSteps] = useState(new Set([1])); // First step expanded by default

  if (!data && !loading) return null;

  const toggleCheck = (stepNumber) => {
    setCheckedSteps(prev => {
      const next = new Set(prev);
      if (next.has(stepNumber)) next.delete(stepNumber);
      else next.add(stepNumber);
      return next;
    });
  };

  const toggleExpand = (stepNumber) => {
    setExpandedSteps(prev => {
      const next = new Set(prev);
      if (next.has(stepNumber)) next.delete(stepNumber);
      else next.add(stepNumber);
      return next;
    });
  };

  const completedCount = data?.steps ? checkedSteps.size : 0;
  const totalCount = data?.steps?.length || 0;

  return (
    <div
      className="explain-panel-slide-in h-full border-l border-gray-700/60 bg-gray-900/95 backdrop-blur-md flex flex-col overflow-hidden"
      style={{ width: 380, minWidth: 330, maxWidth: 420 }}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-700/50 bg-gray-800/40">
        <div className="flex items-center gap-2">
          <Hammer className="w-5 h-5 text-gray-400" />
          <span className="font-semibold text-base text-gray-200 tracking-tight" style={{ fontFamily: 'var(--font-display, "Space Grotesk", sans-serif)' }}>
            Recreation Guide
          </span>
        </div>
        <Button
          size="sm"
          variant="ghost"
          className="text-gray-400 hover:text-white p-1 h-auto transition-colors"
          onClick={onClose}
        >
          <X className="w-4 h-4" />
        </Button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto scrollbar-gray px-4 py-4 space-y-4">
        {loading ? (
          <LoadingSkeleton />
        ) : data?.success ? (
          <>
            {/* Overview bar */}
            <div className="flex items-center justify-between rounded-lg border border-gray-700/40 bg-gray-800/30 px-3 py-2">
              <div className="flex items-center gap-3 text-xs">
                <span className="text-gray-400">
                  Platform: <span className="text-gray-200 font-medium uppercase">{data.platform}</span>
                </span>
                <span className="text-gray-600">|</span>
                <span className="text-gray-400">
                  ≈ <span className="text-gray-200 font-medium">{data.estimatedTime}</span>
                </span>
              </div>
              <span className="text-[11px] text-gray-500">
                {completedCount}/{totalCount}
              </span>
            </div>

            {/* Progress bar */}
            <div className="w-full h-1 bg-gray-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-emerald-500/70 transition-all duration-300 rounded-full"
                style={{ width: totalCount > 0 ? `${(completedCount / totalCount) * 100}%` : '0%' }}
              />
            </div>

            {/* Steps checklist */}
            <div className="space-y-2">
              {(data.steps || []).map((step) => {
                const isChecked = checkedSteps.has(step.stepNumber);
                const isExpanded = expandedSteps.has(step.stepNumber);
                const badge = step.nodeRole ? getRoleBadge(step.nodeRole) : null;

                return (
                  <div
                    key={step.stepNumber}
                    className={`rounded-lg border transition-colors ${
                      isChecked
                        ? 'border-emerald-500/20 bg-emerald-500/5'
                        : 'border-gray-700/40 bg-gray-800/30 hover:border-gray-600/50'
                    }`}
                  >
                    {/* Step header — clickable to expand */}
                    <div
                      className="flex items-center gap-2 px-3 py-2.5 cursor-pointer select-none"
                      onClick={() => toggleExpand(step.stepNumber)}
                    >
                      {/* Checkbox */}
                      <button
                        className={`flex-shrink-0 w-5 h-5 rounded border flex items-center justify-center transition-colors ${
                          isChecked
                            ? 'bg-emerald-500/20 border-emerald-500/50 text-emerald-400'
                            : 'border-gray-600 text-transparent hover:border-gray-500'
                        }`}
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleCheck(step.stepNumber);
                        }}
                      >
                        {isChecked && <Check className="w-3 h-3" />}
                      </button>

                      {/* Step icon */}
                      <span className="text-gray-500">
                        {getStepIcon(step.type)}
                      </span>

                      {/* Step title */}
                      <span className={`flex-1 text-sm font-medium ${isChecked ? 'text-gray-500 line-through' : 'text-gray-200'}`}>
                        {step.title}
                      </span>

                      {/* Role badge */}
                      {badge && (
                        <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded border ${badge.bg} ${badge.text} ${badge.border}`}>
                          {badge.label}
                        </span>
                      )}

                      {/* Expand chevron */}
                      {isExpanded 
                        ? <ChevronDown className="w-3.5 h-3.5 text-gray-500" /> 
                        : <ChevronRight className="w-3.5 h-3.5 text-gray-500" />
                      }
                    </div>

                    {/* Expanded content */}
                    {isExpanded && (
                      <div className="px-3 pb-3 pt-0 space-y-2 border-t border-gray-700/30 mt-0">
                        {/* Instructions */}
                        {step.instructions?.length > 0 && (
                          <ol className="space-y-1 mt-2">
                            {step.instructions.map((instr, idx) => (
                              <li key={idx} className="text-xs text-gray-400 flex items-start gap-2">
                                <span className="text-gray-600 font-mono text-[10px] mt-0.5 min-w-[14px]">{idx + 1}.</span>
                                <span>{instr}</span>
                              </li>
                            ))}
                          </ol>
                        )}

                        {/* Config hints */}
                        {step.configHints?.length > 0 && (
                          <div className="mt-2 space-y-1">
                            <span className="text-[10px] uppercase tracking-wider text-gray-500 font-semibold">Configuration</span>
                            {step.configHints.map((hint, idx) => (
                              <p key={idx} className="text-xs text-gray-500 flex items-start gap-1.5">
                                <span className="text-gray-600 mt-0.5">›</span>
                                {hint}
                              </p>
                            ))}
                          </div>
                        )}

                        {/* Mapping hints */}
                        {step.mappingHints?.length > 0 && (
                          <div className="mt-2 space-y-1">
                            <span className="text-[10px] uppercase tracking-wider text-gray-500 font-semibold">Field Mapping</span>
                            {step.mappingHints.map((hint, idx) => (
                              <p key={idx} className="text-xs text-gray-500 flex items-start gap-1.5">
                                <span className="text-amber-500/60 mt-0.5">⟶</span>
                                {hint}
                              </p>
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Platform Notes */}
            {data.platformNotes?.length > 0 && (
              <PlatformNotes notes={data.platformNotes} />
            )}
          </>
        ) : (
          /* Error state */
          <div className="text-center py-8">
            <p className="text-sm text-red-400">{data?.error || 'Failed to generate recreation guide.'}</p>
            {data?.details && (
              <ul className="mt-2 text-xs text-gray-500 space-y-1">
                {data.details.map((d, i) => <li key={i}>{d}</li>)}
              </ul>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

// ── Sub-components ──

function PlatformNotes({ notes }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="rounded-lg border border-gray-700/30 bg-gray-800/20">
      <button
        className="flex items-center gap-2 px-3 py-2 w-full text-left"
        onClick={() => setExpanded(!expanded)}
      >
        <Info className="w-3.5 h-3.5 text-gray-500" />
        <span className="text-[11px] font-semibold uppercase tracking-wider text-gray-500">Platform Tips</span>
        {expanded
          ? <ChevronDown className="w-3 h-3 text-gray-600 ml-auto" />
          : <ChevronRight className="w-3 h-3 text-gray-600 ml-auto" />
        }
      </button>
      {expanded && (
        <div className="px-3 pb-3 space-y-1.5 border-t border-gray-700/20">
          {notes.map((note, idx) => (
            <p key={idx} className="text-xs text-gray-500 mt-1.5">• {note}</p>
          ))}
        </div>
      )}
    </div>
  );
}

function LoadingSkeleton() {
  return (
    <div className="space-y-4 animate-pulse">
      <div className="h-8 bg-gray-700/30 rounded w-full" />
      <div className="h-1 bg-gray-700/30 rounded w-full" />
      <div className="space-y-3">
        {[1, 2, 3, 4].map(i => (
          <div key={i} className="rounded-lg border border-gray-700/20 p-3 space-y-2">
            <div className="h-4 bg-gray-700/30 rounded w-3/4" />
            <div className="h-3 bg-gray-700/20 rounded w-full" />
            <div className="h-3 bg-gray-700/20 rounded w-2/3" />
          </div>
        ))}
      </div>
    </div>
  );
}
