import { Sparkles, MousePointerClick, Zap, ArrowRight, Brain, Boxes } from "lucide-react";
import { BackgroundBeams } from "../components/ui/background-beams";
import { BentoGrid, BentoTile } from "../components/ui/BentoGrid";
import { TextToWorkflowPreview } from "../components/ui/TextToWorkflowPreview";
import { SmoothScroll } from "../contexts/LenisContext";
import { useEffect } from "react";

export default function LandingPage() {
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("opacity-100", "translate-y-0");
          }
        });
      },
      { threshold: 0.2 }
    );

    document.querySelectorAll(".reveal").forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  return (
    <SmoothScroll className="w-full relative bg-[#0B1020] overflow-x-hidden">
      <BackgroundBeams />

      {/* ================= HERO ================= */}
      <section className="min-h-screen flex flex-col lg:flex-row items-center justify-between max-w-7xl mx-auto px-6 pt-28 relative z-10">
        <div className="lg:w-1/2 space-y-8">
          <h1 className="text-[46px] md:text-[70px] font-extrabold leading-[1.05] text-white">
            Think Before <br />
            <span className="bg-gradient-to-r from-cyan-400 to-violet-500 text-transparent bg-clip-text">
              You Automate.
            </span>
          </h1>

          <p className="text-lg md:text-xl text-[#B6C2D9] max-w-xl">
            Plan, visualize, and understand automation workflows before building
            them in n8n, Zapier, or Make.
          </p>

          <div className="flex gap-4">
            <a
              href="/signup"
              className="px-8 py-4 rounded-lg bg-gradient-to-r from-cyan-500 to-violet-500 font-semibold text-white hover:brightness-110 transition"
            >
              Start Planning
            </a>
            <a
              href="#how"
              className="px-8 py-4 rounded-lg border border-white/10 text-white hover:border-white/30 transition"
            >
              See How It Works
            </a>
          </div>
        </div>

        <div className="lg:w-1/2 mt-16 lg:mt-0 relative group">
          <div className="absolute inset-0 bg-gradient-to-tr from-cyan-500/20 to-violet-500/20 blur-3xl rounded-full translate-y-8 group-hover:translate-y-4 group-hover:opacity-100 opacity-60 transition-all duration-700"></div>
          <div className="relative p-2 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-xl shadow-[0_0_40px_rgba(34,211,238,0.15)] group-hover:shadow-[0_0_60px_rgba(167,139,250,0.25)] transition-all duration-700 transform group-hover:-translate-y-2">
            <img 
              src="/image.png" 
              alt="NoBrain Workflow Interface" 
              className="w-full rounded-xl object-cover mask-image-bottom opacity-90 group-hover:opacity-100 transition-opacity"
            />
          </div>
        </div>
      </section>

      {/* ================= PROBLEM SECTION ================= */}
      <section className="py-24 max-w-[1400px] mx-auto px-6 relative z-10">
        <div className="text-center mb-16 reveal opacity-0 translate-y-8 transition-all duration-700">
          <h2 className="text-4xl font-bold text-white">
            Automation Shouldn't Feel Confusing
          </h2>
          <p className="text-[#B6C2D9] mt-4 max-w-2xl mx-auto">
            Most tools show what to build. They don’t explain why it works.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 items-center">
          <div className="reveal opacity-0 translate-y-8 transition-all duration-700 space-y-8">
            <div className="bg-white/[0.03] border border-white/10 rounded-2xl p-8 backdrop-blur-md">
              <h3 className="text-white text-2xl font-semibold mb-3">Too many nodes</h3>
              <p className="text-[#B6C2D9]">Beginners struggle to understand workflow structure and data flow when faced with a massive canvas.</p>
            </div>
            <div className="bg-white/[0.03] border border-white/10 rounded-2xl p-8 backdrop-blur-md">
              <h3 className="text-white text-2xl font-semibold mb-3">No explanation of logic</h3>
              <p className="text-[#B6C2D9]">You can see the connections, but you don't know the exact data transformations happening between them.</p>
            </div>
            <div className="bg-white/[0.03] border border-white/10 rounded-2xl p-8 backdrop-blur-md relative overflow-hidden group">
               <div className="absolute inset-0 bg-gradient-to-r from-red-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
              <h3 className="text-white text-2xl font-semibold mb-3">Build → Break → Debug cycle</h3>
              <p className="text-[#B6C2D9]">Endless trial and error because the visual representation doesn't match the execution reality.</p>
            </div>
          </div>
          <div className="reveal opacity-0 translate-y-8 transition-all duration-700 relative group h-full flex flex-col justify-center">
             <div className="absolute inset-0 bg-gradient-to-tr from-rose-500/20 to-orange-500/20 blur-3xl rounded-full translate-y-8 group-hover:translate-y-4 group-hover:opacity-100 opacity-40 transition-all duration-700"></div>
             <div className="relative p-2 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-xl shadow-2xl transition-all duration-700 transform group-hover:-translate-y-2">
                <img src="/image copy 4.png" alt="Complex confusing workflow" className="w-full rounded-xl object-cover opacity-90 group-hover:opacity-100 transition-opacity"/>
             </div>
          </div>
        </div>
      </section>

      {/* ================= HOW IT WORKS ================= */}
      <section id="how" className="py-32 relative z-10 bg-black/40 border-y border-white/5">
        <div className="max-w-7xl mx-auto px-6 grid lg:grid-cols-2 gap-20 items-center">
          
          <div className="space-y-16">
            <div className="reveal opacity-0 translate-y-8 transition-all duration-700">
               <h2 className="text-4xl font-bold text-white mb-12">How NoBrain Solves It</h2>
            </div>
            {[
              {
                title: "1. Describe Your Goal",
                desc: "Tell NoBrain what you want to automate in plain English. No syntax required.",
              },
              {
                title: "2. Get Platform Plan",
                desc: "We generate validated workflows using real platform nodes for n8n, Zapier, etc.",
              },
              {
                title: "3. Understand the Logic",
                desc: "See execution order, dependencies, and data flow clearly before building.",
              },
            ].map((step, i) => (
              <div
                key={i}
                className="reveal opacity-0 translate-y-8 transition-all duration-700 group cursor-default"
              >
                <h3 className="text-2xl font-bold text-white mb-3 group-hover:text-cyan-400 transition-colors">
                  {step.title}
                </h3>
                <p className="text-[#B6C2D9] text-lg">{step.desc}</p>
              </div>
            ))}
          </div>

          <div className="relative group perspective-1000">
            <div className="absolute inset-0 bg-gradient-to-tr from-cyan-500/20 to-violet-500/20 blur-3xl rounded-full translate-y-8 group-hover:translate-y-4 group-hover:opacity-100 opacity-60 transition-all duration-700"></div>
            
            {/* Top Image (Foreground) */}
            <div className="relative p-2 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-xl shadow-2xl transition-all duration-700 transform group-hover:-translate-y-4 group-hover:rotate-1 z-20 top-0 left-0">
               <img src="/image copy 2.png" alt="NoBrain clear execution logic" className="w-full rounded-xl object-cover" />
            </div>

            {/* Bottom Image (Background offset) */}
            <div className="absolute top-12 -right-8 p-2 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-xl shadow-xl transition-all duration-700 transform group-hover:translate-x-4 group-hover:-rotate-2 z-10 opacity-70 group-hover:opacity-90 w-[90%]">
               <img src="/image copy 3.png" alt="Workflow mapping" className="w-full rounded-xl object-cover" />
            </div>
          </div>
        </div>
      </section>

      {/* ================= FEATURES GRID ================= */}
      <section className="py-24 relative z-10">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-white">
            Built for Clarity
          </h2>
        </div>

        <BentoGrid>
          <BentoTile
            icon={<Sparkles className="text-cyan-400"/>}
            title="AI Planning Engine"
            description="Type what you want. Get a structured workflow."
            className="md:col-span-2 relative group overflow-hidden"
          >
             <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/10 to-violet-500/10 opacity-0 group-hover:opacity-100 transition-opacity"></div>
             <div className="mt-6 relative rounded-xl overflow-hidden border border-white/10 shadow-2xl">
                 <img src="/image copy.png" alt="NoBrain Configuration Panel" className="w-full object-cover transform group-hover:scale-[1.02] transition-transform duration-700" />
             </div>
          </BentoTile>

          <BentoTile
            icon={<Brain className="text-violet-400"/>}
            title="Explainability First"
            description="Understand why each node exists before you build it."
            className="group"
          >
             <div className="mt-8 flex flex-col gap-3">
                 <div className="h-2 w-1/2 bg-white/10 rounded-full group-hover:bg-cyan-500/50 transition-colors"></div>
                 <div className="h-2 w-3/4 bg-white/10 rounded-full group-hover:bg-violet-500/50 transition-colors delay-75"></div>
                 <div className="h-2 w-2/3 bg-white/10 rounded-full group-hover:bg-emerald-500/50 transition-colors delay-150"></div>
             </div>
          </BentoTile>
        </BentoGrid>
      </section>

      {/* ================= ARCHITECTURE ================= */}
      <section className="py-24 max-w-5xl mx-auto px-6 text-center relative z-10">
        <h2 className="text-4xl font-bold text-white mb-16 reveal opacity-0 translate-y-8 transition-all duration-700">
          How It Works Internally
        </h2>

        <div className="flex flex-col md:flex-row items-center justify-center gap-4 text-[#B6C2D9] reveal opacity-0 translate-y-8 transition-all duration-700">
          {["AI", "Planning Engine", "Validation", "Explain", "Recreate"].map((step, i) => (
             <div key={step} className="flex items-center gap-4">
                <div className="px-6 py-3 rounded-full bg-white/5 border border-white/10 shadow-lg backdrop-blur-md hover:bg-white/10 hover:text-white hover:border-cyan-500/50 transition-all cursor-default text-sm font-medium">
                   {step}
                </div>
                {i < 4 && <ArrowRight className="w-5 h-5 text-white/20 hidden md:block" />}
                {i < 4 && <ArrowRight className="w-5 h-5 text-white/20 rotate-90 md:hidden my-2" />}
             </div>
          ))}
        </div>
      </section>

      {/* ================= PLATFORM SECTION ================= */}
      <section className="py-24 text-center relative z-10 bg-black/40 border-y border-white/5">
        <h3 className="text-2xl text-white mb-12 reveal opacity-0 translate-y-8 transition-all duration-700">
          Built to Respect Real Platforms
        </h3>
        <div className="flex flex-wrap justify-center gap-6 text-[#B6C2D9] reveal opacity-0 translate-y-8 transition-all duration-700">
          {["n8n", "Zapier", "Make"].map(platform => (
             <div key={platform} className="px-8 py-4 bg-[#11172A] border border-white/10 rounded-xl font-semibold shadow-lg hover:shadow-[0_0_20px_rgba(167,139,250,0.15)] hover:-translate-y-1 transition-all">
                {platform}
             </div>
          ))}
        </div>
      </section>

      {/* ================= CTA ================= */}
      <section className="py-32 text-center relative z-10">
        <h2 className="text-4xl font-bold text-white mb-6">
          Stop Guessing. Start Understanding.
        </h2>
        <a
          href="/signup"
          className="px-10 py-4 bg-gradient-to-r from-cyan-500 to-violet-500 rounded-lg text-white font-semibold hover:brightness-110 transition"
        >
          Get Started Free
        </a>
      </section>

      {/* ================= FOOTER ================= */}
      <footer className="py-12 text-center text-gray-500 border-t border-white/5">
        © {new Date().getFullYear()} NoBrain — Workflow Thinking Assistant.
      </footer>
    </SmoothScroll>
  );
}