import { Brain, Sparkles, MousePointerClick, Zap } from "lucide-react";
import { Boxes } from "lucide-react";

import brain from "../assets/brain.png";
import brainsvg from "../assets/brain.png";
import { BackgroundBeams } from "../components/ui/background-beams";
import { BentoGrid, BentoTile } from "../components/ui/BentoGrid";
import { TextToWorkflowPreview } from "../components/ui/TextToWorkflowPreview";

function PulseBrain() {
  return (
    <span className="relative inline-flex items-center justify-center">
      <span className="absolute inline-block animate-ping-slow rounded-full bg-gray-600 opacity-40 w-14 h-14" />
      <Brain className="relative w-14 h-14 text-gray-400 drop-shadow" />
    </span>
  );
}

import { SmoothScroll } from "../contexts/LenisContext";

export default function LandingPage() {
  return (
    <SmoothScroll className="w-full bg-black relative">
      {/* Background layers - fixed to viewport */}
      <BackgroundBeams />
      <div className="fixed inset-0 z-0 pointer-events-none">
        <Boxes />
      </div>

      {/* Hero Section */}
      <main className="flex flex-col md:flex-row items-center justify-between min-h-screen w-full max-w-7xl mx-auto px-4 pb-2 pt-12 md:pt-4 relative z-10">
        {/* Left section */}
        <section className="flex flex-col items-start md:items-start justify-center gap-8 w-full md:w-6/12 md:pr-6 relative z-10">
          <h1 className="text-4xl md:text-6xl font-bold tracking-tight text-white mb-2">
            <span className="inline-block text-gray-300">
              NoBrain <span><PulseBrain /></span>
            </span>
            <span className="block text-2xl md:text-4xl pt-2 text-white font-semibold">
              It's truly a <span className="text-gray-200 font-black">No-Brainer</span>
            </span>
          </h1>
          <div className="max-w-xl text-lg md:text-xl text-gray-300 mt-2 mb-1">
            Turn your thoughts into powerful automations{" "}
            <span className="font-bold">instantly</span>. Just describe your goal,
            drag-and-drop, and let our AI build the perfect workflow.
          </div>
          <a
            href="/signup"
            className="inline-block px-10 py-3 mt-2 rounded-lg bg-gray-700 hover:bg-gray-600 text-white text-lg font-bold shadow-lg shadow-gray-900/20 transition-all duration-200"
          >
            Get Started Free
          </a>
        </section>

        {/* Right section */}
        <aside className="w-full md:w-7/12 flex flex-col items-center justify-center h-full pt-8 md:pt-2 relative min-h-[370px]">
          <img src={brainsvg} alt="NoBrain Logo" className="w-7/12" />
        </aside>
      </main>

      {/* Bento Grid Feature Showcase */}
      <section className="relative z-10 py-16 md:py-24">
        {/* Section Header */}
        <div className="text-center mb-12 px-4">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Build Smarter, <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-500">Not Harder</span>
          </h2>
          <p className="text-gray-400 text-lg max-w-2xl mx-auto">
            Powerful features that transform how you create automated workflows
          </p>
        </div>

        {/* Bento Grid */}
        <BentoGrid>
          {/* Large Tile: AI Prompting / Text-to-Workflow */}
          <BentoTile
            variant="large"
            icon={<Sparkles className="w-8 h-8" />}
            title="Text → Workflow AI"
            description="Simply describe what you want to automate in plain English. Our AI understands your intent and generates a complete workflow instantly."
            staggerIndex={0}
          >
            <TextToWorkflowPreview />
          </BentoTile>

          {/* Medium Tile: Visual Editor */}
          <BentoTile
            icon={<MousePointerClick className="w-7 h-7" />}
            title="Visual Editor"
            description="Drag, drop, and connect. Build complex automations with an intuitive visual canvas — no code required."
            staggerIndex={1}
          >
            {/* Mini visual preview */}
            <div className="mt-auto pt-4 flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-blue-500/20 border border-blue-500/30 flex items-center justify-center">
                <div className="w-3 h-3 rounded bg-blue-400" />
              </div>
              <div className="w-8 h-0.5 bg-gradient-to-r from-blue-500 to-purple-500" />
              <div className="w-10 h-10 rounded-lg bg-purple-500/20 border border-purple-500/30 flex items-center justify-center">
                <div className="w-3 h-3 rounded bg-purple-400" />
              </div>
              <div className="w-8 h-0.5 bg-gradient-to-r from-purple-500 to-emerald-500" />
              <div className="w-10 h-10 rounded-lg bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center">
                <div className="w-3 h-3 rounded bg-emerald-400" />
              </div>
            </div>
          </BentoTile>

          {/* Medium Tile: Real-time Orchestration */}
          <BentoTile
            icon={<Zap className="w-7 h-7" />}
            title="Real-time Orchestration"
            description="Watch your workflows execute live. Monitor triggers, track data flow, and debug instantly."
            staggerIndex={2}
          >
            {/* Mini status preview */}
            <div className="mt-auto pt-4 space-y-2">
              <div className="flex items-center gap-2">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500" />
                </span>
                <span className="text-xs text-gray-400">Trigger activated</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="relative flex h-2 w-2">
                  <span className="animate-pulse absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500" />
                </span>
                <span className="text-xs text-gray-400">Processing data...</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-gray-600" />
                <span className="text-xs text-gray-500">Awaiting next step</span>
              </div>
            </div>
          </BentoTile>
        </BentoGrid>
      </section>

      {/* Footer */}
      <footer className="py-6 text-center text-gray-600 text-xs opacity-60 relative z-10">
        &copy; {new Date().getFullYear()} NoBrain — Smarter Automation. Effortless AI.
      </footer>

      {/* Custom Animations */}
      <style>{`
        .animate-ping-slow { animation: ping 2.4s cubic-bezier(0, 0, 0.2, 1) infinite; }
        @keyframes ping { 75%, 100% { transform: scale(1.3); opacity: 0; } }
        .animate-floatUp { animation: floatUp 3.5s infinite alternate ease-in-out; }
        @keyframes floatUp { 0% { transform: translateY(0); } 100% { transform: translateY(-22px); } }
        .animate-floatDown { animation: floatDown 3.2s infinite alternate-reverse ease-in-out; }
        @keyframes floatDown { 0% { transform: translateY(0); } 100% { transform: translateY(20px); } }
      `}</style>
    </SmoothScroll>
  );
}