import { Brain } from "lucide-react";

function PulseBrain() {
  return (
    <span className="relative inline-flex items-center justify-center">
      <span className="absolute inline-block animate-ping-slow rounded-full bg-blue-600 opacity-40 w-14 h-14" />
      <Brain className="relative w-14 h-14 text-blue-400 drop-shadow" />
    </span>
  );
}

// Side-profile brain mesh as only lines and nodes, highly recognizable
function SideProfileBrainMesh() {
  // Approximate node/curve arrangement of a real human brain from side profile
  // Nodes named for lobe/region hint and approximate position
  // No border. Only lines and dots, glows, and anchor points for badges
  return (
    <div className="relative w-full flex items-center justify-center select-none">
      <svg
        viewBox="0 0 470 400"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-[410px] h-[370px] sm:w-[470px] sm:h-[400px]"
      >
        {/* Frontal Lobe Curve */}
        <line x1="100" y1="170" x2="160" y2="120" stroke="#60a5fa" strokeWidth="3" />
        <line x1="160" y1="120" x2="225" y2="90" stroke="#a78bfa" strokeWidth="2.5" />
        {/* Top curve */}
        <line x1="225" y1="90" x2="310" y2="100" stroke="#34d399" strokeWidth="2.5" />
        <line x1="310" y1="100" x2="370" y2="135" stroke="#fbbf24" strokeWidth="2.5" />
        {/* Parietal & Occipital */}
        <line x1="370" y1="135" x2="410" y2="200" stroke="#818cf8" strokeWidth="2.5" />
        {/* Rear downwards */}
        <line x1="410" y1="200" x2="370" y2="260" stroke="#2dd4bf" strokeWidth="2.5" />
        {/* Underbrain curves */}
        <line x1="370" y1="260" x2="270" y2="340" stroke="#38bdf8" strokeWidth="3" />
        <line x1="270" y1="340" x2="180" y2="300" stroke="#e0e3e6" strokeWidth="2.3" />
        {/* Frontal under backwards */}
        <line x1="180" y1="300" x2="100" y2="170" stroke="#f472b6" strokeWidth="2.4" />
        {/* Mid curves */}
        <line x1="160" y1="120" x2="145" y2="200" stroke="#4fc3f7" strokeWidth="2"/>
        <line x1="225" y1="90" x2="200" y2="200" stroke="#38bdf8" strokeWidth="2"/>
        <line x1="310" y1="100" x2="290" y2="180" stroke="#a78bfa" strokeWidth="2"/>
        <line x1="370" y1="135" x2="340" y2="210" stroke="#818cf8" strokeWidth="2"/>
        <line x1="145" y1="200" x2="290" y2="180" stroke="#22d3ee" strokeWidth="2.2"/>
        <line x1="340" y1="210" x2="200" y2="200" stroke="#fbbf24" strokeWidth="2.1"/>
        <line x1="145" y1="200" x2="200" y2="200" stroke="#2dd4bf" strokeWidth="2.2" />
        <line x1="200" y1="200" x2="290" y2="180" stroke="#a78bfa" strokeWidth="2" />
        <line x1="290" y1="180" x2="340" y2="210" stroke="#60a5fa" strokeWidth="2" />
        <line x1="340" y1="210" x2="370" y2="260" stroke="#06d6a0" strokeWidth="2.1" />
        {/* Lower-middle */}
        <line x1="145" y1="200" x2="180" y2="300" stroke="#a78bfa" strokeWidth="2"/>
        <line x1="200" y1="200" x2="180" y2="300" stroke="#818cf8" strokeWidth="2"/>
        <line x1="290" y1="180" x2="270" y2="340" stroke="#34d399" strokeWidth="2"/>
        <line x1="340" y1="210" x2="270" y2="340" stroke="#a78bfa" strokeWidth="2"/>
        <line x1="270" y1="340" x2="370" y2="135" stroke="#fbbf24" strokeWidth="2" opacity="0.6"/>
        {/* Glowing Dots / Nodes */}
        <circle cx="100" cy="170" r="8" fill="#38bdf8" className="mesh-node animate-pulse"/>
        <circle cx="160" cy="120" r="7.2" fill="#06d6a0" className="mesh-node animate-pulse"/>
        <circle cx="225" cy="90" r="9" fill="#fbbf24" className="mesh-node animate-pulse"/>
        <circle cx="310" cy="100" r="7.5" fill="#818cf8" className="mesh-node animate-pulse"/>
        <circle cx="370" cy="135" r="7.7" fill="#be97fd" className="mesh-node animate-pulse"/>
        <circle cx="410" cy="200" r="8.2" fill="#22d3ee" className="mesh-node animate-pulse"/>
        <circle cx="370" cy="260" r="7.2" fill="#fbbf24" className="mesh-node animate-pulse"/>
        <circle cx="270" cy="340" r="7.8" fill="#7cfaf7" className="mesh-node animate-pulse"/>
        <circle cx="180" cy="300" r="7.5" fill="#a78bfa" className="mesh-node animate-pulse"/>
        <circle cx="145" cy="200" r="7" fill="#38bdf8" className="mesh-node"/>
        <circle cx="200" cy="200" r="7.2" fill="#2dd4bf" className="mesh-node"/>
        <circle cx="290" cy="180" r="7.7" fill="#4fc3f7" className="mesh-node"/>
        <circle cx="340" cy="210" r="7" fill="#e0e3e6" className="mesh-node"/>
      </svg>
      {/* Floating feature badges around brain lobes, positioned contextually */}
      <div className="absolute text-base px-7 py-3 rounded-full bg-blue-700/90 shadow-2xl text-white font-bold left-0 top-10 animate-floatUp">No Code, No Limits</div>
      <div className="absolute text-base px-7 py-3 rounded-full bg-purple-700/90 shadow-2xl text-white font-bold right-2 top-28 animate-floatDown">Text-to-Workflow AI</div>
      <div className="absolute text-base px-7 py-3 rounded-full bg-green-600/90 shadow-2xl text-white font-bold left-7 bottom-12 animate-floatUp2">Realtime Orchestration</div>
      <div className="absolute text-base px-7 py-3 rounded-full bg-yellow-400/90 shadow-2xl text-black font-bold right-7 bottom-4 animate-floatDown2">Drag-and-Drop Canvas</div>
    </div>
  );
}

export default function LandingPage() {
  return (
    <div className="min-h-screen w-full bg-black flex flex-col justify-between">
      <main className="flex flex-col md:flex-row items-center justify-between min-h-[92vh] w-full max-w-7xl mx-auto px-4 pb-2 pt-12 md:pt-4">
        {/* Left section */}
        <section className="flex flex-col items-start md:items-start justify-center gap-8 w-full md:w-6/12 md:pr-6 relative z-10">
          <PulseBrain />
          <h1 className="text-4xl md:text-6xl font-bold tracking-tight text-white mb-2">
            <span className="inline-block text-blue-400">NoBrain</span>
            <span className="block text-2xl md:text-4xl pt-2 text-white font-semibold">It's truly a <span className="bg-linear-to-r from-green-400 via-blue-400 to-purple-500 bg-clip-text text-transparent font-black animate-glow">No-Brainer</span></span>
          </h1>
          <div className="max-w-xl text-lg md:text-xl text-gray-300 mt-2 mb-1">
            Turn your thoughts into powerful automations <span className="font-bold">instantly</span>. Just describe your goal, drag-and-drop, and let our AI build the perfect workflow.
          </div>
          <a
            href="/signup"
            className="inline-block px-10 py-3 mt-2 rounded-lg bg-linear-to-r from-blue-700 to-purple-700 hover:from-blue-800 hover:to-purple-800 text-white text-lg font-bold shadow-lg shadow-blue-900/20 transition-all duration-200"
          >
            Get Started Free
          </a>
          <div className="text-xs text-gray-500 mt-2">No coding | No hassle | Pure AI power</div>
        </section>
        {/* Right section */}
        <aside className="w-full md:w-7/12 flex flex-col items-center justify-center h-full pt-8 md:pt-2 relative min-h-[370px]">
          <SideProfileBrainMesh />
        </aside>
      </main>
      <footer className="py-4 text-center text-gray-600 text-xs opacity-60">
        &copy; {new Date().getFullYear()} NoBrain — Smarter Automation. Effortless AI.
      </footer>
      {/* Custom Animations */}
      <style>{`
        .animate-ping-slow { animation: ping 2.4s cubic-bezier(0, 0, 0.2, 1) infinite; }
        @keyframes ping { 75%, 100% { transform: scale(1.3); opacity: 0; } }
        .animate-glow { text-shadow: 0 0 10px #3b82f6, 0 0 22px #a78bfa; }
        .mesh-node { filter: drop-shadow(0 0 8px #38bdf8) drop-shadow(0 0 12px #811af9);}
        .animate-floatUp { animation: floatUp 3.5s infinite alternate ease-in-out; }
        @keyframes floatUp { 0% { transform: translateY(0); } 100% { transform: translateY(-22px); } }
        .animate-floatDown { animation: floatDown 3.2s infinite alternate-reverse ease-in-out; }
        @keyframes floatDown { 0% { transform: translateY(0); } 100% { transform: translateY(20px); } }
        .animate-floatUp2 { animation: floatUp2 4.0s infinite alternate ease-in-out; }
        @keyframes floatUp2 { 0% { transform: translateY(0); } 100% { transform: translateY(-15px); } }
        .animate-floatDown2 { animation: floatDown2 3.7s infinite alternate-reverse ease-in; }
        @keyframes floatDown2 { 0% { transform: translateY(0); } 100% { transform: translateY(16px); } }
      `}</style>
    </div>
  );
}
