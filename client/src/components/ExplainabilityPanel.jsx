// client/src/components/ExplainabilityPanel.jsx
// Phase-6: Workflow Explainability Panel
// Deterministic explanation display — execution order, node cards, data flow, dependencies

import { X, Brain, ChevronRight, ArrowDown, Layers, GitBranch, BookOpen } from 'lucide-react';
import { Button } from './ui/button';

// Role badge colors (minimal, no gradients, dark theme consistent)
const ROLE_COLORS = {
  trigger: { bg: 'bg-cyan-500/15', text: 'text-cyan-400', border: 'border-cyan-500/30', label: 'Trigger' },
  action: { bg: 'bg-amber-500/15', text: 'text-amber-400', border: 'border-amber-500/30', label: 'Action' },
  control: { bg: 'bg-emerald-500/15', text: 'text-emerald-400', border: 'border-emerald-500/30', label: 'Control' },
};

function getRoleBadge(role) {
  return ROLE_COLORS[role] || ROLE_COLORS.action;
}

export default function ExplainabilityPanel({ data, loading, onClose }) {
  if (!data && !loading) return null;

  return (
    <div
      className="explain-panel-slide-in h-full border-l border-gray-700/60 bg-gray-900/95 backdrop-blur-md flex flex-col overflow-hidden"
      style={{ width: 370, minWidth: 320, maxWidth: 400 }}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-700/50 bg-gray-800/40">
        <div className="flex items-center gap-2">
          <Brain className="w-5 h-5 text-gray-400" />
          <span className="font-semibold text-base text-gray-200 tracking-tight" style={{ fontFamily: 'var(--font-display, "Space Grotesk", sans-serif)' }}>
            Workflow Explanation
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
      <div className="flex-1 overflow-y-auto scrollbar-gray px-4 py-4 space-y-5">
        {loading ? (
          <LoadingSkeleton />
        ) : data?.success ? (
          <>
            {/* Narrative */}
            <section>
              <SectionHeader icon={<BookOpen className="w-4 h-4" />} title="Summary" />
              <p className="text-sm text-gray-400 leading-relaxed mt-2">
                {data.narrative}
              </p>
            </section>

            {/* Execution Order */}
            <section>
              <SectionHeader icon={<ChevronRight className="w-4 h-4" />} title="Execution Order" />
              <div className="mt-2 space-y-0">
                {(data.executionOrder || []).map((step, idx) => (
                  <div key={step.nodeId} className="flex items-center gap-3">
                    {/* Step connector */}
                    <div className="flex flex-col items-center" style={{ width: 20 }}>
                      <div className="w-5 h-5 rounded-full bg-gray-700 border border-gray-600 flex items-center justify-center text-[10px] font-bold text-gray-300">
                        {step.step}
                      </div>
                      {idx < data.executionOrder.length - 1 && (
                        <div className="w-px h-4 bg-gray-700" />
                      )}
                    </div>
                    <span className="text-sm text-gray-300 py-1">{step.label}</span>
                  </div>
                ))}
              </div>
            </section>

            {/* Node Explanations */}
            <section>
              <SectionHeader icon={<Layers className="w-4 h-4" />} title="Node Details" />
              <div className="mt-2 space-y-3">
                {(data.nodeExplanations || []).map((node) => {
                  const badge = getRoleBadge(node.role);
                  return (
                    <div
                      key={node.nodeId}
                      className="rounded-lg border border-gray-700/50 bg-gray-800/40 p-3 transition-colors hover:border-gray-600/50"
                    >
                      {/* Node header */}
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-xs font-mono text-gray-500">#{node.executionStep}</span>
                        <span className="text-sm font-semibold text-gray-200">{node.label}</span>
                        <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded border ${badge.bg} ${badge.text} ${badge.border}`}>
                          {badge.label}
                        </span>
                      </div>

                      {/* Explanation */}
                      <p className="text-xs text-gray-400 leading-relaxed mb-2">
                        {node.explanation}
                      </p>

                      {/* Connections */}
                      <div className="flex flex-wrap gap-3 text-[11px]">
                        {node.inputFrom.length > 0 && (
                          <span className="text-gray-500">
                            ← <span className="text-gray-400">{node.inputFrom.join(', ')}</span>
                          </span>
                        )}
                        {node.outputTo.length > 0 && (
                          <span className="text-gray-500">
                            → <span className="text-gray-400">{node.outputTo.join(', ')}</span>
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>

            {/* Layered Data Flow */}
            {data.layeredFlow && (
              <section>
                <SectionHeader icon={<ArrowDown className="w-4 h-4" />} title="Data Flow Layers" />
                <div className="mt-2 space-y-2">
                  {data.layeredFlow.trigger?.length > 0 && (
                    <FlowLayer label="Trigger Layer" items={data.layeredFlow.trigger} color="text-cyan-400" />
                  )}
                  {data.layeredFlow.processing?.length > 0 && (
                    <FlowLayer label="Processing Layer" items={data.layeredFlow.processing} color="text-amber-400" />
                  )}
                  {data.layeredFlow.output?.length > 0 && (
                    <FlowLayer label="Output Layer" items={data.layeredFlow.output} color="text-emerald-400" />
                  )}
                </div>
              </section>
            )}

            {/* Dependencies */}
            {data.dependencySummary?.length > 0 && (
              <section>
                <SectionHeader icon={<GitBranch className="w-4 h-4" />} title="Dependencies" />
                <ul className="mt-2 space-y-1">
                  {data.dependencySummary.map((dep, idx) => (
                    <li key={idx} className="text-xs text-gray-400 flex items-start gap-1.5">
                      <span className="text-gray-600 mt-0.5">•</span>
                      {dep}
                    </li>
                  ))}
                </ul>
              </section>
            )}
          </>
        ) : (
          /* Error state */
          <div className="text-center py-8">
            <p className="text-sm text-red-400">{data?.error || 'Failed to generate explanation.'}</p>
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

function SectionHeader({ icon, title }) {
  return (
    <div className="flex items-center gap-2 text-gray-300">
      {icon}
      <h3 className="text-xs font-semibold uppercase tracking-wider">{title}</h3>
    </div>
  );
}

function FlowLayer({ label, items, color }) {
  return (
    <div className="flex items-start gap-2 text-xs">
      <span className={`${color} font-medium whitespace-nowrap min-w-[110px]`}>{label}</span>
      <span className="text-gray-400">{items.join(', ')}</span>
    </div>
  );
}

function LoadingSkeleton() {
  return (
    <div className="space-y-4 animate-pulse">
      <div className="h-3 bg-gray-700/50 rounded w-3/4" />
      <div className="h-3 bg-gray-700/50 rounded w-full" />
      <div className="h-3 bg-gray-700/50 rounded w-2/3" />
      <div className="mt-6 space-y-3">
        {[1, 2, 3].map(i => (
          <div key={i} className="rounded-lg border border-gray-700/30 p-3 space-y-2">
            <div className="h-3 bg-gray-700/50 rounded w-1/2" />
            <div className="h-2 bg-gray-700/30 rounded w-full" />
            <div className="h-2 bg-gray-700/30 rounded w-3/4" />
          </div>
        ))}
      </div>
    </div>
  );
}
