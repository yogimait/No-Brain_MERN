


import { Brain } from "lucide-react";
import { Boxes } from "lucide-react";

import brain from "../assets/brain.png"
import brainsvg from "../assets/brain.png"
// 1. Import BackgroundBeams
import { BackgroundBeams } from "../components/ui/background-beams"; 
// Assuming cn utility is also needed if BackgroundBeams uses it and it's not imported inside the component itself.
// The BackgroundBeams component imports 'cn' from '../lib/utils', so we don't need it here.



function PulseBrain() {
  return (
    <span className="relative inline-flex items-center justify-center">
      <span className="absolute inline-block animate-ping-slow rounded-full bg-gray-600 opacity-40 w-14 h-14" />
      <Brain className="relative w-14 h-14 text-gray-400 drop-shadow" />
    </span>
  );
}

// Side-profile brain mesh as only lines and nodes, highly recognizable
function SideProfileBrainMesh() {
  // ... (keep all the existing SideProfileBrainMesh code exactly as is)
}



export default function LandingPage() {
  return (

    <div className="min-h-screen w-full bg-black flex flex-col justify-between relative overflow-hidden"> {/* Added relative and overflow-hidden */}
      {/* Add Boxes background component */}
      <BackgroundBeams />
      <div className="absolute inset-0 z-0">
        <Boxes />
      </div>
      
      
      <main className="flex flex-col md:flex-row items-center justify-between min-h-[92vh] w-full max-w-7xl mx-auto px-4 pb-2 pt-12 md:pt-4 relative z-10"> {/* Added relative z-10 */}

        {/* Left section */}
        <section className="flex flex-col items-start md:items-start justify-center gap-8 w-full md:w-6/12 md:pr-6 relative z-10">
          {/* <PulseBrain /> */}
          <h1 className="text-4xl md:text-6xl font-bold tracking-tight text-white mb-2">
            <span className="inline-block text-gray-300">NoBrain <span><PulseBrain /> </span></span>
            <span className="block text-2xl md:text-4xl pt-2 text-white font-semibold">It's truly a <span className="text-gray-200 font-black">No-Brainer</span></span>
          </h1>
          <div className="max-w-xl text-lg md:text-xl text-gray-300 mt-2 mb-1">
            Turn your thoughts into powerful automations <span className="font-bold">instantly</span>. Just describe your goal, drag-and-drop, and let our AI build the perfect workflow.
          </div>
          <a
            href="/signup"
            className="inline-block px-10 py-3 mt-2 rounded-lg bg-gray-700 hover:bg-gray-600 text-white text-lg font-bold shadow-lg shadow-gray-900/20 transition-all duration-200"
          >
            Get Started Free
          </a>
          {/* <div className="text-xs text-gray-500 mt-2">No coding | No hassle | Pure AI power</div> */}
        </section>
        {/* Right section */}
        <aside className="w-full md:w-7/12 flex flex-col items-center justify-center h-full pt-8 md:pt-2 relative min-h-[370px]">
          {/* <SideProfileBrainMesh /> */}
                    <img src={brainsvg} alt="" className="w-7/12"/>

        </aside>
        
      </main>

      <footer className="py-4 text-center text-gray-600 text-xs opacity-60 relative z-10"> {/* Added relative z-10 */}

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
        .animate-floatUp2 { animation: floatUp2 4.0s infinite alternate ease-in-out; }
        @keyframes floatUp2 { 0% { transform: translateY(0); } 100% { transform: translateY(-15px); } }
        .animate-floatDown2 { animation: floatDown2 3.7s infinite alternate-reverse ease-in; }
        @keyframes floatDown2 { 0% { transform: translateY(0); } 100% { transform: translateY(16px); } }
      `}</style>
    </div>
  );
}