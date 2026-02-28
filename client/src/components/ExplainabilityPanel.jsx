// client/src/components/ExplainabilityPanel.jsx
// Phase-6: Workflow Explainability Panel
// Deterministic explanation display — execution order, node cards, data flow, dependencies

import { useEffect, useRef } from 'react';
import { X, Brain, ChevronRight, ArrowDown, Layers, GitBranch, BookOpen } from 'lucide-react';
import { Button } from './ui/button';

// Role badge colors (minimal, no gradients, dark theme consistent)
const ROLE_COLORS = {
  trigger: { bg: 'bg-cyan-500/10', text: 'text-cyan-500', border: 'border-cyan-500/20', label: 'Trigger' },
  action: { bg: 'bg-amber-500/10', text: 'text-amber-500', border: 'border-amber-500/20', label: 'Action' },
  control: { bg: 'bg-emerald-500/10', text: 'text-emerald-500', border: 'border-emerald-500/20', label: 'Control' },
};

function getRoleBadge(role) {
  return ROLE_COLORS[role] || ROLE_COLORS.action;
}

export default function ExplainabilityPanel({ data, loading, onClose, selectedNodeId }) {
  const containerRef = useRef(null);

  // Scroll to step when selectedNodeId changes
  useEffect(() => {
    if (selectedNodeId && containerRef.current) {
      const element = containerRef.current.querySelector(`[data-node-id="${selectedNodeId}"]`);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'center' });
        // Optional: add a temporary highlight effect
        element.classList.add('ring-2', 'ring-primary', 'ring-offset-2', 'ring-offset-background');
        setTimeout(() => {
          element.classList.remove('ring-2', 'ring-primary', 'ring-offset-2', 'ring-offset-background');
        }, 1500);
      }
    }
  }, [selectedNodeId, data]);

  if (!data && !loading) return null;

  return (
    <div
      className="explain-panel-slide-in h-full border-l border-border bg-card flex flex-col overflow-hidden shrink-0 shadow-lg"
      style={{ width: 380 }}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-border bg-muted/30">
        <div className="flex items-center gap-3">
          <BookOpen className="w-5 h-5 text-primary" />
          <span className="font-semibold text-base text-foreground tracking-tight">
            Workflow Explanation
          </span>
        </div>
        <Button
          size="sm"
          variant="ghost"
          className="text-muted-foreground hover:text-foreground hover:bg-muted p-1 h-auto transition-colors"
          onClick={onClose}
        >
          <X className="w-4 h-4" />
        </Button>
      </div>

      {/* Content */}
      <div ref={containerRef} className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-border scrollbar-track-transparent px-5 py-6 space-y-8">
        {loading ? (
          <LoadingSkeleton />
        ) : data?.success ? (
          <>
            {/* Narrative Summary */}
            <section>
              <SectionHeader icon={<Brain className="w-4 h-4" />} title="Workflow Summary" />
              <p className="text-sm text-muted-foreground leading-relaxed mt-3 explanation-body">
                {data.narrative}
              </p>
            </section>

            {/* Execution Order */}
            <section>
              <SectionHeader icon={<ChevronRight className="w-4 h-4" />} title="Step-by-Step Breakdown" />
              <div className="mt-4 space-y-0">
                {(data.executionOrder || []).map((step, idx) => (
                  <div key={step.nodeId} className="flex items-start gap-3">
                    {/* Step connector */}
                    <div className="flex flex-col items-center mt-0.5" style={{ width: 24 }}>
                      <div className="w-6 h-6 rounded-full bg-muted border border-border flex items-center justify-center text-[10px] font-bold text-foreground">
                        {step.step}
                      </div>
                      {idx < data.executionOrder.length - 1 && (
                        <div className="w-px h-6 bg-border my-1" />
                      )}
                    </div>
                    <span className="text-sm text-foreground py-1 font-medium">{step.label}</span>
                  </div>
                ))}
              </div>
            </section>

            {/* Node Explanations */}
            <section>
              <SectionHeader icon={<Layers className="w-4 h-4" />} title="Node Details" />
              <div className="mt-4 space-y-3">
                {(data.nodeExplanations || []).map((node) => {
                  const badge = getRoleBadge(node.role);
                  return (
                    <div
                      key={node.nodeId}
                      data-node-id={node.nodeId}
                      className="rounded-xl border border-border bg-background p-4 transition-all duration-300 hover:border-primary/30 shadow-sm group"
                    >
                      {/* Node header */}
                      <div className="flex items-center gap-2 mb-3">
                        <span className="text-xs font-mono text-muted-foreground bg-muted px-1.5 py-0.5 rounded">#{node.executionStep}</span>
                        <span className="text-sm font-semibold text-foreground">{node.label}</span>
                        <span className={`text-[10px] font-medium px-2 py-0.5 rounded border ml-auto ${badge.bg} ${badge.text} ${badge.border}`}>
                          {badge.label}
                        </span>
                      </div>

                      {/* Explanation */}
                      <p className="text-sm text-muted-foreground leading-relaxed mb-4">
                        {node.explanation}
                      </p>

                      {/* Connections */}
                      <div className="flex flex-wrap gap-4 text-xs">
                        {node.inputFrom.length > 0 && (
                          <div className="flex items-center gap-1.5 text-muted-foreground">
                            <span className="text-border">←</span>
                            <span>{node.inputFrom.join(', ')}</span>
                          </div>
                        )}
                        {node.outputTo.length > 0 && (
                          <div className="flex items-center gap-1.5 text-muted-foreground">
                            <span className="text-border">→</span>
                            <span>{node.outputTo.join(', ')}</span>
                          </div>
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
                <SectionHeader icon={<ArrowDown className="w-4 h-4" />} title="Data Flow Visualization" />
                <div className="mt-4 space-y-3 p-4 rounded-xl border border-border bg-background">
                  {data.layeredFlow.trigger?.length > 0 && (
                    <FlowLayer label="Trigger" items={data.layeredFlow.trigger} color="text-cyan-500" />
                  )}
                  {data.layeredFlow.processing?.length > 0 && (
                    <FlowLayer label="Processing" items={data.layeredFlow.processing} color="text-amber-500" />
                  )}
                  {data.layeredFlow.output?.length > 0 && (
                    <FlowLayer label="Output" items={data.layeredFlow.output} color="text-emerald-500" />
                  )}
                </div>
              </section>
            )}

            {/* Dependencies */}
            {data.dependencySummary?.length > 0 && (
              <section>
                <SectionHeader icon={<GitBranch className="w-4 h-4" />} title="System Dependencies" />
                <ul className="mt-3 space-y-2 p-4 rounded-xl border border-border bg-background">
                  {data.dependencySummary.map((dep, idx) => (
                    <li key={idx} className="text-sm text-muted-foreground flex items-start gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-border mt-1.5 shrink-0" />
                      <span className="leading-snug">{dep}</span>
                    </li>
                  ))}
                </ul>
              </section>
            )}
          </>
        ) : (
          /* Error state */
          <div className="text-center py-12 px-4">
            <div className="w-12 h-12 rounded-full bg-destructive/10 flex items-center justify-center mx-auto mb-4">
              <X className="w-6 h-6 text-destructive" />
            </div>
            <p className="text-sm font-medium text-foreground mb-2">Detailed explanation unavailable</p>
            <p className="text-xs text-muted-foreground">{data?.error || 'Failed to generate explanation.'}</p>
            {data?.details && (
              <ul className="mt-4 text-xs text-muted-foreground space-y-1 text-left bg-muted p-3 rounded-lg border border-border">
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
    <div className="flex items-center gap-2 text-foreground mb-1">
      <div className="p-1 rounded bg-muted/50 text-muted-foreground">
        {icon}
      </div>
      <h3 className="text-xs font-bold uppercase tracking-widest text-muted-foreground">{title}</h3>
    </div>
  );
}

function FlowLayer({ label, items, color }) {
  return (
    <div className="flex flex-col gap-1 text-sm border-l-2 border-border pl-3 ml-1 py-1">
      <span className={`${color} font-semibold uppercase tracking-wider text-[10px]`}>{label}</span>
      <span className="text-foreground">{items.join(', ')}</span>
    </div>
  );
}

function LoadingSkeleton() {
  return (
    <div className="space-y-8 animate-pulse">
      <div className="space-y-3">
        <div className="h-4 bg-muted rounded w-1/4" />
        <div className="h-3 bg-muted rounded w-full" />
        <div className="h-3 bg-muted rounded w-full" />
        <div className="h-3 bg-muted rounded w-3/4" />
      </div>
      <div className="space-y-4">
        <div className="h-4 bg-muted rounded w-1/3" />
        <div className="flex gap-3">
          <div className="w-6 h-6 rounded-full bg-muted shrink-0" />
          <div className="h-3 bg-muted rounded w-1/2 mt-1.5" />
        </div>
        <div className="flex gap-3">
          <div className="w-6 h-6 rounded-full bg-muted shrink-0" />
          <div className="h-3 bg-muted rounded w-2/3 mt-1.5" />
        </div>
      </div>
      <div className="mt-8 space-y-4">
        {[1, 2, 3].map(i => (
          <div key={i} className="rounded-xl border border-border p-4 space-y-3">
            <div className="flex justify-between">
              <div className="h-4 bg-muted rounded w-1/3" />
              <div className="h-4 bg-muted rounded w-12" />
            </div>
            <div className="h-3 bg-muted rounded w-full" />
            <div className="h-3 bg-muted rounded w-5/6" />
          </div>
        ))}
      </div>
    </div>
  );
}
