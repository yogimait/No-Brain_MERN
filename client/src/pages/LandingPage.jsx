import { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import NoBrainLogo from "../components/NoBrainLogo";

/* ─────────────────────────── SVG Wave Divider ─────────────────────────── */
const WaveDivider = () => (
  <div className="absolute top-0 bottom-0 right-0 w-[140px] z-20 pointer-events-none">
    <svg viewBox="0 0 140 800" preserveAspectRatio="none" className="h-full w-full">
      <defs>
        <linearGradient id="waveFade" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#070c18" stopOpacity="0" />
          <stop offset="60%" stopColor="#070c18" stopOpacity="0.7" />
          <stop offset="100%" stopColor="#070c18" stopOpacity="1" />
        </linearGradient>
      </defs>
      <path
        d="M0,0 C70,120 30,250 90,380 C130,470 20,580 80,680 C110,740 40,780 0,800 L140,800 L140,0 Z"
        fill="url(#waveFade)"
      />
    </svg>
  </div>
);

/* ─────────────────────────── Main Component ─────────────────────────── */
export default function LandingPage() {
  const navigate = useNavigate();
  const scrollRef = useRef(null);
  const [activeState, setActiveState] = useState(0);
  const [ctaPrompt, setCtaPrompt] = useState("");
  const [selectedPlatform, setSelectedPlatform] = useState("n8n");
  const [validationStep, setValidationStep] = useState(0);
  const [showDeterminism, setShowDeterminism] = useState([false, false, false]);

  // Track which horizontal state is visible
  const handleScroll = useCallback(() => {
    if (!scrollRef.current) return;
    const scrollLeft = scrollRef.current.scrollLeft;
    const stateWidth = window.innerWidth;
    const newState = Math.round(scrollLeft / stateWidth);
    if (newState !== activeState) setActiveState(newState);
  }, [activeState]);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    el.addEventListener('scroll', handleScroll, { passive: true });
    return () => el.removeEventListener('scroll', handleScroll);
  }, [handleScroll]);

  // Enable mouse-wheel → horizontal scroll
  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    const onWheel = (e) => {
      e.preventDefault();
      // Convert any scroll direction to horizontal
      const delta = Math.abs(e.deltaY) > Math.abs(e.deltaX) ? e.deltaY : e.deltaX;
      el.scrollLeft += delta * 1.5;
    };
    // Capture touch events for trackpad support
    el.addEventListener('wheel', onWheel, { passive: false });
    return () => el.removeEventListener('wheel', onWheel);
  }, []);

  // Compiler validation animation for State 3
  useEffect(() => {
    if (activeState === 2) {
      setValidationStep(0);
      const t1 = setTimeout(() => setValidationStep(1), 600);
      const t2 = setTimeout(() => setValidationStep(2), 1200);
      const t3 = setTimeout(() => setValidationStep(3), 1800);
      const t4 = setTimeout(() => setValidationStep(4), 2400);
      return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); clearTimeout(t4); };
    }
  }, [activeState]);

  // Determinism text animation for State 4
  useEffect(() => {
    if (activeState === 3) {
      setShowDeterminism([false, false, false]);
      const t1 = setTimeout(() => setShowDeterminism([true, false, false]), 300);
      const t2 = setTimeout(() => setShowDeterminism([true, true, false]), 700);
      const t3 = setTimeout(() => setShowDeterminism([true, true, true]), 1100);
      return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); };
    }
  }, [activeState]);

  const handleCTASubmit = (e) => {
    e.preventDefault();
    navigate('/signup');
  };

  const scrollTo = (idx) => {
    scrollRef.current?.scrollTo({ left: idx * window.innerWidth, behavior: 'smooth' });
  };

  /* ─── Structured node positions (used in State 1 aligned + State 2) ─── */
  /* x,y are percentages inside their container. Edges reference pairs by index */
  const structuredNodes = [
    { id: 0, label: "Webhook Trigger", x: 50, y: 8 },
    { id: 1, label: "HTTP Request",    x: 50, y: 22 },
    { id: 2, label: "IF Condition",    x: 50, y: 36 },
    { id: 3, label: "AI Transform",    x: 30, y: 52 },
    { id: 4, label: "Set Data",        x: 70, y: 52 },
    { id: 5, label: "Slack",           x: 30, y: 68 },
    { id: 6, label: "Email Send",      x: 70, y: 68 },
    { id: 7, label: "Google Sheets",   x: 40, y: 84 },
    { id: 8, label: "RSS Feed",        x: 60, y: 84 },
  ];

  const edges = [
    [0, 1], [1, 2], [2, 3], [2, 4], [3, 5], [4, 6], [5, 7], [6, 8],
  ];

  /* ─── Chaos positions (State 1 initial) ─── */
  const chaosPositions = [
    { x: 12, y: 10, rotate: -14 },
    { x: 58, y: 5,  rotate: 9 },
    { x: 32, y: 35, rotate: -6 },
    { x: 68, y: 30, rotate: 16 },
    { x: 18, y: 60, rotate: -20 },
    { x: 52, y: 55, rotate: 7 },
    { x: 78, y: 50, rotate: -11 },
    { x: 38, y: 78, rotate: 13 },
    { x: 72, y: 75, rotate: -9 },
  ];

  const isAligning = activeState >= 1;

  return (
    <div className="h-screen w-screen overflow-hidden bg-[#070c18] relative">
      
      {/* ── BACKGROUND LAYERS ── */}
      <div className="fixed inset-0 z-0 bg-[radial-gradient(ellipse_at_50%_30%,#0e1a35_0%,#070c18_70%)]" />
      <div
        className="fixed inset-0 z-[1] pointer-events-none opacity-[0.06]"
        style={{
          backgroundImage: 'linear-gradient(rgba(34,211,238,1) 1px, transparent 1px), linear-gradient(90deg, rgba(34,211,238,1) 1px, transparent 1px)',
          backgroundSize: '48px 48px',
          animation: 'gridDrift 25s linear infinite',
        }}
      />
      {/* Subtle ambient glow */}
      <div className="fixed inset-0 z-[2] pointer-events-none">
        <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-cyan-500/[0.04] rounded-full blur-[150px]" />
        <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-violet-500/[0.04] rounded-full blur-[150px]" />
      </div>

      {/* ── FLOATING CURVED NAVBAR ── */}
      <nav className="fixed top-4 left-1/2 -translate-x-1/2 z-50 h-12 border border-white/[0.08] bg-[#0a1226]/70 backdrop-blur-xl rounded-full flex items-center justify-between px-6 gap-8 shadow-[0_4px_30px_rgba(0,0,0,0.4)]" style={{ maxWidth: '640px', width: '90vw' }}>
        <NoBrainLogo size="small" />
        <div className="flex items-center gap-4 text-sm font-mono">
          <a href="/login" className="text-gray-400 hover:text-cyan-400 transition-colors tracking-wider text-xs">LOGIN</a>
          <a href="/signup" className="px-4 py-1.5 border border-cyan-500/30 text-cyan-100 rounded-full hover:border-cyan-400/60 hover:bg-cyan-500/10 transition-all tracking-wider text-xs">
            Initialize →
          </a>
        </div>
      </nav>

      {/* ── SCROLL INDICATOR ── */}
      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex gap-2 bg-black/40 backdrop-blur-sm rounded-full px-3 py-2 border border-white/5">
        {["Chaos", "Recognition", "Structuring", "Determinism"].map((label, i) => (
          <button
            key={i}
            onClick={() => scrollTo(i)}
            className={`flex items-center gap-1.5 px-2 py-1 rounded-full text-[9px] font-mono transition-all duration-500 ${
              activeState === i
                ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30'
                : 'text-gray-600 hover:text-gray-400 border border-transparent'
            }`}
          >
            <span className={`w-1.5 h-1.5 rounded-full transition-colors ${activeState === i ? 'bg-cyan-400' : 'bg-gray-700'}`} />
            {label}
          </button>
        ))}
      </div>

      {/* ── HORIZONTAL SCROLL CONTAINER ── */}
      <div
        ref={scrollRef}
        className="h-screen w-screen overflow-x-auto overflow-y-hidden flex landing-scroll-container"
        style={{
          scrollSnapType: 'x mandatory',
          msOverflowStyle: 'none',
          scrollbarWidth: 'none',
        }}
      >

        {/* ════════════════════ STATE 1: CHAOS ════════════════════ */}
        <section className="flex-shrink-0 w-screen h-screen relative flex items-center" style={{ scrollSnapAlign: 'start' }}>
          <div className="w-full h-full flex items-center px-12 lg:px-24 relative z-10">
            {/* Left: Typography */}
            <div className="w-5/12 pr-8">
              <p className="font-mono text-[10px] text-cyan-400/70 tracking-[0.3em] mb-6 uppercase">State_01 // The Problem</p>
              <h1 className="text-5xl lg:text-7xl font-bold text-white leading-[1.1] tracking-tight" style={{ fontFamily: 'Space Grotesk, Inter, sans-serif' }}>
                Automation tools<br />
                show <span className="text-[#94a3b8]">what.</span>
              </h1>
              <p className="mt-8 text-[#6b7a94] text-sm max-w-md leading-relaxed font-mono">
                Dozens of nodes. Zero explanation.<br />You build, break, debug, repeat — never understanding the underlying logic.
              </p>
              <button onClick={() => scrollTo(1)} className="mt-6 text-cyan-500/60 font-mono text-xs tracking-wider hover:text-cyan-400 transition-colors flex items-center gap-2 group">
                SCROLL → <span className="inline-block group-hover:translate-x-1 transition-transform">⟶</span>
              </button>
            </div>

            {/* Right: Animated Chaotic Canvas */}
            <div className="w-7/12 h-[75vh] relative">
              {/* Chaotic connection lines (animated) */}
              <svg className="absolute inset-0 w-full h-full z-0 animate-chaos-lines" stroke="rgba(34,211,238,0.08)" strokeWidth="1" fill="none">
                <path d="M 80 80 Q 250 40 400 200" className="animate-edge-pulse-1" />
                <path d="M 150 30 Q 350 180 500 300" className="animate-edge-pulse-2" />
                <path d="M 60 350 Q 280 250 450 150" className="animate-edge-pulse-3" />
                <path d="M 350 50 Q 180 220 430 380" className="animate-edge-pulse-1" />
                <path d="M 30 270 Q 300 220 480 100" className="animate-edge-pulse-2" />
                <path d="M 200 400 Q 100 300 350 200" className="animate-edge-pulse-3" />
                <path d="M 500 350 Q 300 420 100 300" className="animate-edge-pulse-1" />
              </svg>

              {/* Chaos nodes with float animation */}
              {structuredNodes.map((node, i) => {
                const cp = chaosPositions[i];
                const nx = isAligning ? node.x : cp.x;
                const ny = isAligning ? node.y : cp.y;
                const nr = isAligning ? 0 : cp.rotate;
                return (
                  <div
                    key={i}
                    className={`absolute font-mono text-[11px] border rounded px-3 py-2 backdrop-blur-sm transition-all
                      ${isAligning
                        ? 'border-cyan-500/25 bg-cyan-500/[0.06] text-cyan-300/80'
                        : 'border-white/[0.12] bg-white/[0.04] text-gray-300/70'
                      }`}
                    style={{
                      left: `${nx}%`,
                      top: `${ny}%`,
                      transform: `translate(-50%, -50%) rotate(${nr}deg)`,
                      transitionDuration: '1.2s',
                      transitionTimingFunction: 'cubic-bezier(0.22, 1, 0.36, 1)',
                      transitionDelay: `${i * 80}ms`,
                      animation: isAligning ? 'none' : `nodeFloat${i % 3} 4s ease-in-out ${i * 0.3}s infinite`,
                    }}
                  >
                    <span className={`inline-block w-1.5 h-1.5 rounded-full mr-2 ${isAligning ? 'bg-cyan-400' : 'bg-white/30'}`} />
                    {node.label}
                  </div>
                );
              })}

              {/* Floating error labels in chaos */}
              {!isAligning && (
                <>
                  <div className="absolute left-[15%] bottom-[12%] font-mono text-[9px] text-red-400/50 animate-pulse">ERR: UNDEFINED_PAYLOAD</div>
                  <div className="absolute right-[10%] top-[20%] font-mono text-[9px] text-yellow-500/40 animate-pulse" style={{ animationDelay: '1s' }}>WARN: UNVALIDATED_EDGE</div>
                  <div className="absolute right-[30%] bottom-[25%] font-mono text-[9px] text-red-400/40 animate-pulse" style={{ animationDelay: '2s' }}>ERR: CIRCULAR_REF</div>
                </>
              )}
            </div>
          </div>
          <WaveDivider />
        </section>

        {/* ════════════════════ STATE 2: RECOGNITION ════════════════════ */}
        <section className="flex-shrink-0 w-screen h-screen relative flex items-center" style={{ scrollSnapAlign: 'start' }}>
          <div className="w-full h-full flex items-center px-12 lg:px-24 relative z-10">
            {/* Left: Recognition Text */}
            <div className="w-5/12 pr-8">
              <p className="font-mono text-[10px] text-cyan-400/70 tracking-[0.3em] mb-6 uppercase">State_02 // Recognition</p>
              <h1 className="text-5xl lg:text-7xl font-bold text-white leading-[1.1] tracking-tight" style={{ fontFamily: 'Space Grotesk, Inter, sans-serif' }}>
                NoBrain shows<br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-400">why.</span>
              </h1>
              <div className="mt-8 space-y-3 text-[#6b7a94] text-sm font-mono leading-relaxed max-w-md">
                <p>Visual builders create illusions of simplicity.</p>
                <p>Beneath the GUI is undocumented, tightly-coupled logic that breaks silently.</p>
                <p className="text-cyan-400/60">We expose the constraints and data boundaries before a single webhook fires.</p>
              </div>
              {/* Mini validation badge */}
              <div className="mt-8 inline-flex items-center gap-2 px-3 py-1.5 rounded border border-cyan-500/20 bg-cyan-500/[0.05] text-cyan-400 font-mono text-[10px]">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                STRUCTURE_DETECTED
              </div>
            </div>

            {/* Right: Structured flow with proper edges */}
            <div className="w-7/12 h-[75vh] relative flex items-center justify-center">

              {/* SVG Edges connecting nodes — use viewBox 0 0 100 100 so % coordinates work for both lines and dots */}
              <svg className="absolute inset-0 w-full h-full z-[1]" viewBox="0 0 100 100" preserveAspectRatio="none" fill="none">
                {edges.map(([fromIdx, toIdx], i) => {
                  const from = structuredNodes[fromIdx];
                  const to = structuredNodes[toIdx];
                  return (
                    <line
                      key={i}
                      x1={from.x} y1={from.y + 3}
                      x2={to.x} y2={to.y - 3}
                      stroke="rgba(34,211,238,0.25)"
                      strokeWidth="0.3"
                      className="transition-all duration-700"
                      style={{ transitionDelay: `${i * 100 + 300}ms` }}
                      strokeDasharray={activeState >= 1 ? "0" : "1 1"}
                    />
                  );
                })}
                {/* Animated data flow dots — coordinates match the line endpoints exactly */}
                {activeState >= 1 && edges.map(([fromIdx, toIdx], i) => {
                  const from = structuredNodes[fromIdx];
                  const to = structuredNodes[toIdx];
                  return (
                    <circle key={`dot-${i}`} r="0.6" fill="#22D3EE" opacity="0.8">
                      <animateMotion
                        dur={`${1.8 + i * 0.3}s`}
                        repeatCount="indefinite"
                        path={`M ${from.x},${from.y + 3} L ${to.x},${to.y - 3}`}
                      />
                    </circle>
                  );
                })}
              </svg>

              {/* Structured nodes */}
              {structuredNodes.map((node, i) => (
                <div
                  key={i}
                  className="absolute font-mono text-[11px] border border-cyan-500/30 bg-[#0d1525]/80 rounded px-3 py-2 text-cyan-200/80 backdrop-blur-sm transition-all duration-700 hover:border-cyan-400/50 hover:bg-cyan-500/10 cursor-default"
                  style={{
                    left: `${node.x}%`,
                    top: `${node.y}%`,
                    transform: 'translate(-50%, -50%)',
                    transitionDelay: `${i * 80}ms`,
                    opacity: activeState >= 1 ? 1 : 0.3,
                    boxShadow: activeState >= 1 ? '0 0 15px rgba(34,211,238,0.08)' : 'none',
                  }}
                >
                  <span className="inline-block w-1.5 h-1.5 rounded-full bg-cyan-400 mr-2" />
                  {node.label}
                </div>
              ))}

              {/* Grid background lines */}
              <svg className="absolute inset-0 w-full h-full z-0 opacity-30" stroke="rgba(34,211,238,0.06)" strokeWidth="1" fill="none">
                <line x1="50%" y1="0" x2="50%" y2="100%" strokeDasharray="4 4" />
                <line x1="30%" y1="0" x2="30%" y2="100%" strokeDasharray="4 4" />
                <line x1="70%" y1="0" x2="70%" y2="100%" strokeDasharray="4 4" />
              </svg>
            </div>
          </div>
          <WaveDivider />
        </section>

        {/* ════════════════════ STATE 3: STRUCTURING ════════════════════ */}
        <section className="flex-shrink-0 w-screen h-screen relative flex items-center" style={{ scrollSnapAlign: 'start' }}>
          <div className="w-full h-full flex items-center px-12 lg:px-24 relative z-10">
            {/* Left: Terminal Input + Extra Context */}
            <div className="w-5/12 pr-8 flex flex-col gap-5">
              <p className="font-mono text-[10px] text-cyan-400/70 tracking-[0.3em] uppercase">State_03 // Compilation</p>

              {/* Terminal */}
              <div className="border border-white/[0.08] bg-[#0a0f1e] rounded-lg overflow-hidden shadow-[0_0_40px_rgba(0,0,0,0.5)]">
                <div className="h-8 bg-black/60 border-b border-white/5 flex items-center gap-2 px-4">
                  <div className="w-2.5 h-2.5 rounded-full bg-red-500/50" />
                  <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/50" />
                  <div className="w-2.5 h-2.5 rounded-full bg-green-500/50" />
                  <span className="ml-3 font-mono text-[9px] text-gray-500 uppercase">nobrain_engine // input</span>
                </div>
                <div className="p-5 font-mono text-sm">
                  <div className="flex items-start gap-3">
                    <span className="text-cyan-400 select-none">❯</span>
                    <div className="text-cyan-100/90 leading-relaxed">
                      Fetch RSS feed and send<br />summary to Slack daily
                      <span className="inline-block w-1.5 h-4 bg-cyan-400 ml-1 animate-pulse translate-y-0.5" />
                    </div>
                  </div>
                </div>
              </div>

              {/* Processing log */}
              <div className="border border-white/[0.06] bg-[#0a0f1e] rounded-lg p-4 font-mono text-[10px] text-gray-500 space-y-1.5">
                <p className="text-cyan-500/60">[engine]</p>
                <p className={`transition-opacity duration-500 ${validationStep >= 1 ? 'opacity-100 text-gray-400' : 'opacity-30'}`}>
                  → Parsing natural language intent...
                </p>
                <p className={`transition-opacity duration-500 ${validationStep >= 2 ? 'opacity-100 text-gray-400' : 'opacity-30'}`}>
                  → Matching against NODE_CATALOG v1.2...
                </p>
                <p className={`transition-opacity duration-500 ${validationStep >= 3 ? 'opacity-100 text-gray-400' : 'opacity-30'}`}>
                  → Validating platform constraints (n8n)...
                </p>
                <p className={`transition-opacity duration-500 ${validationStep >= 4 ? 'opacity-100 text-emerald-400' : 'opacity-30'}`}>
                  → ✓ Compilation complete. 0 errors.
                </p>
              </div>

              {/* Workflow metadata */}
              <div className="grid grid-cols-2 gap-2">
                <div className="border border-white/[0.06] bg-white/[0.02] rounded-lg p-3 font-mono text-[10px]">
                  <p className="text-gray-600 mb-1">NODES</p>
                  <p className="text-cyan-300 text-lg font-bold">4</p>
                </div>
                <div className="border border-white/[0.06] bg-white/[0.02] rounded-lg p-3 font-mono text-[10px]">
                  <p className="text-gray-600 mb-1">EDGES</p>
                  <p className="text-violet-300 text-lg font-bold">3</p>
                </div>
              </div>
            </div>

            {/* Right: Compiler Validation + Generated Flow */}
            <div className="w-7/12 pl-4 flex flex-col gap-4">
              {/* Intent Parsed */}
              <div className={`border border-white/[0.08] bg-[#0a0f1e] rounded-lg p-5 transition-all duration-500 ${
                validationStep >= 1 ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
              }`} style={{ transitionTimingFunction: 'cubic-bezier(0.22, 1, 0.36, 1)' }}>
                <p className="font-mono text-[10px] text-gray-500 uppercase mb-3 tracking-wider">Intent Parsed</p>
                <div className="space-y-2 font-mono text-xs">
                  <div className="flex justify-between border-b border-white/5 pb-2"><span className="text-gray-500">Trigger:</span><span className="text-emerald-400">RSS Feed</span></div>
                  <div className="flex justify-between border-b border-white/5 pb-2"><span className="text-gray-500">Transform:</span><span className="text-violet-400">AI Summarizer</span></div>
                  <div className="flex justify-between border-b border-white/5 pb-2"><span className="text-gray-500">Action:</span><span className="text-cyan-400">Slack Message</span></div>
                  <div className="flex justify-between"><span className="text-gray-500">Schedule:</span><span className="text-yellow-400">Cron Daily</span></div>
                </div>
              </div>

              {/* Validation Checks */}
              <div className="space-y-2">
                {[
                  { label: "Catalog Match", desc: "All nodes found in NODE_CATALOG v1.2", step: 2 },
                  { label: "Platform Compatible", desc: "n8n supports all required node types", step: 3 },
                  { label: "Order Correct", desc: "DAG validated: no cycles, correct dependencies", step: 4 },
                ].map(({ label, desc, step }) => (
                  <div
                    key={label}
                    className={`flex items-center gap-3 font-mono text-sm px-4 py-3 border rounded-lg transition-all duration-500 ${
                      validationStep >= step
                        ? 'border-emerald-500/30 bg-emerald-500/[0.06] text-emerald-400 opacity-100 translate-y-0'
                        : 'border-white/5 bg-transparent text-gray-600 opacity-40 translate-y-2'
                    }`}
                    style={{ transitionTimingFunction: 'cubic-bezier(0.22, 1, 0.36, 1)', transitionDelay: `${(step - 2) * 150}ms` }}
                  >
                    <span className={`w-6 h-6 rounded-full border flex items-center justify-center text-xs flex-shrink-0 transition-colors ${
                      validationStep >= step ? 'border-emerald-500 bg-emerald-500/20' : 'border-gray-700'
                    }`}>
                      {validationStep >= step ? '✓' : ''}
                    </span>
                    <div>
                      <span className="font-medium">{label}</span>
                      <p className={`text-[10px] mt-0.5 font-normal ${validationStep >= step ? 'text-emerald-400/60' : 'text-gray-700'}`}>{desc}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Generated mini-flow preview */}
              <div className={`border border-white/[0.08] bg-[#0a0f1e] rounded-lg p-4 transition-all duration-700 ${
                validationStep >= 4 ? 'opacity-100' : 'opacity-0'
              }`}>
                <p className="font-mono text-[10px] text-gray-500 uppercase mb-3 tracking-wider">Generated Graph</p>
                <div className="flex items-center gap-3 font-mono text-[10px]">
                  <div className="px-2 py-1.5 rounded border border-emerald-500/30 bg-emerald-500/10 text-emerald-300">RSS Trigger</div>
                  <span className="text-cyan-500">→</span>
                  <div className="px-2 py-1.5 rounded border border-violet-500/30 bg-violet-500/10 text-violet-300">AI Summarizer</div>
                  <span className="text-cyan-500">→</span>
                  <div className="px-2 py-1.5 rounded border border-cyan-500/30 bg-cyan-500/10 text-cyan-300">Slack Sender</div>
                </div>
              </div>
            </div>
          </div>
          <WaveDivider />
        </section>

        {/* ════════════════════ STATE 4: DETERMINISM ════════════════════ */}
        <section className="flex-shrink-0 w-screen h-screen relative flex flex-col items-center justify-center" style={{ scrollSnapAlign: 'start' }}>
          <div className="relative z-10 text-center px-8 max-w-4xl mx-auto">
            <p className="font-mono text-[10px] text-cyan-400/70 tracking-[0.3em] mb-1 uppercase">State_04 // Resolved</p>

            {/* Big determinism words */}
            <div className="space-y-2 mb-12" style={{ fontFamily: 'Space Grotesk, Inter, sans-serif' }}>
              {["Deterministic.", "Platform-Aware.", "Explainable."].map((word, i) => (
                <h2
                  key={word}
                  className={`text-5xl lg:text-7xl font-bold transition-all duration-700 ${
                    showDeterminism[i] ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'
                  } ${i === 0 ? 'text-white' : i === 1 ? 'text-cyan-400' : 'text-violet-400'}`}
                  style={{ transitionTimingFunction: 'cubic-bezier(0.22, 1, 0.36, 1)' }}
                >
                  {word}
                </h2>
              ))}
            </div>

            {/* System metadata */}
            <div className="flex justify-center gap-8 mb-14 font-mono text-[10px] text-gray-500 tracking-wider">
              <span className="px-2 py-1 bg-white/[0.03] rounded border border-white/5">NODE_CATALOG: v1.2</span>
              <span className="px-2 py-1 bg-white/[0.03] rounded border border-white/5">VALIDATION_MODE: STRICT</span>
              <span className="px-2 py-1 bg-emerald-500/10 rounded border border-emerald-500/20 text-emerald-400">HALLUCINATION_RISK: 0%</span>
            </div>

            {/* Floating CTA */}
            <div className="border border-white/10 bg-[#0a0f1e]/90 backdrop-blur-xl rounded-2xl p-1 shadow-[0_0_60px_rgba(0,0,0,0.5),0_0_30px_rgba(34,211,238,0.05)] max-w-xl mx-auto relative overflow-hidden">
              <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-cyan-500/60 to-transparent" />
              <form onSubmit={handleCTASubmit} className="bg-[#070c18] rounded-xl p-5 flex flex-col gap-3">
                <div className="flex items-center justify-between mb-1">
                  <label className="text-[10px] font-mono text-cyan-400/60 uppercase tracking-wider">Input.Prompt</label>
                  <div className="flex gap-1.5">
                    {["n8n", "Zapier", "Make"].map(p => (
                      <button
                        key={p}
                        type="button"
                        onClick={() => setSelectedPlatform(p)}
                        className={`px-2.5 py-1 rounded text-[9px] font-mono transition-all border ${
                          selectedPlatform === p
                            ? 'border-cyan-500/40 bg-cyan-500/15 text-cyan-400'
                            : 'border-white/5 text-gray-600 hover:text-gray-400 hover:border-white/10'
                        }`}
                      >
                        {p}
                      </button>
                    ))}
                  </div>
                </div>
                <textarea
                  value={ctaPrompt}
                  onChange={(e) => setCtaPrompt(e.target.value)}
                  placeholder="Describe your automation..."
                  rows={3}
                  className="w-full bg-white/[0.02] border border-white/[0.06] rounded-lg p-3 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-cyan-500/40 focus:bg-cyan-500/[0.03] resize-none font-mono transition-colors"
                />
                <button
                  type="submit"
                  className="w-full py-2.5 rounded-lg bg-gradient-to-r from-cyan-500 to-blue-500 text-white font-semibold text-sm hover:brightness-110 transition-all flex items-center justify-center gap-2 font-mono shadow-[0_0_20px_rgba(34,211,238,0.15)]"
                >
                  Compile Architecture →
                </button>
              </form>
            </div>
          </div>

          {/* Footer */}
          <div className="absolute bottom-12 left-0 right-0 text-center font-mono text-[10px] text-gray-600">
            © 2026 NoBrain. Deterministic automation logic.
          </div>
        </section>

      </div>

      {/* ── CSS: keyframes + animations ── */}
      <style>{`
        @keyframes gridDrift {
          0% { background-position: 0px 0px; }
          100% { background-position: 48px 48px; }
        }
        .landing-scroll-container::-webkit-scrollbar { display: none; }

        /* Chaos node float animations */
        @keyframes nodeFloat0 {
          0%, 100% { transform: translate(-50%, -50%) rotate(var(--r, -14deg)) translateY(0px); }
          50% { transform: translate(-50%, -50%) rotate(var(--r, -14deg)) translateY(-8px); }
        }
        @keyframes nodeFloat1 {
          0%, 100% { transform: translate(-50%, -50%) rotate(var(--r, 9deg)) translateX(0px); }
          50% { transform: translate(-50%, -50%) rotate(var(--r, 9deg)) translateX(6px); }
        }
        @keyframes nodeFloat2 {
          0%, 100% { transform: translate(-50%, -50%) rotate(var(--r, -6deg)) translateY(0px) translateX(0px); }
          50% { transform: translate(-50%, -50%) rotate(var(--r, -6deg)) translateY(-5px) translateX(4px); }
        }

        /* Edge pulse animations */
        .animate-edge-pulse-1 {
          animation: edgePulse 3s ease-in-out infinite;
        }
        .animate-edge-pulse-2 {
          animation: edgePulse 3s ease-in-out 1s infinite;
        }
        .animate-edge-pulse-3 {
          animation: edgePulse 3s ease-in-out 2s infinite;
        }
        @keyframes edgePulse {
          0%, 100% { opacity: 0.3; stroke: rgba(34,211,238,0.08); }
          50% { opacity: 1; stroke: rgba(34,211,238,0.2); }
        }
      `}</style>
    </div>
  );
}