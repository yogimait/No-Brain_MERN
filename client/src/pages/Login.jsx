import { Link, useNavigate, useLocation } from "react-router-dom";
import { Lock, Eye, EyeOff, Mail, ArrowRight, Workflow, Sparkles } from "lucide-react";
import { useState } from "react";
import { Label } from "../components/ui/label";
import { Input } from "../components/ui/input";
import { BackgroundBeams } from "../components/ui/background-beams";
import { useAuth } from "../contexts/AuthContext";
import { toast } from "sonner";

export default function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setIsSubmitting(true);
      await login(formData.email, formData.password);
      toast.success("Logged in successfully!");
      const from = location.state?.from?.pathname || "/dashboard";
      navigate(from, { replace: true });
    } catch (error) {
      console.error("Login error:", error);
      toast.error(error.message || "Failed to login");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-[#0B1020] relative overflow-hidden">
      {/* ═══ LEFT BRANDING HALF ═══ */}
      <div className="hidden lg:flex lg:w-1/2 relative flex-col items-center justify-center p-12 overflow-hidden">
        <BackgroundBeams />

        {/* Decorative floating workflow nodes */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          {/* Node 1 */}
          <div className="absolute top-[20%] left-[15%] w-32 h-10 rounded-lg bg-white/[0.03] border border-white/[0.08] backdrop-blur-sm flex items-center gap-2 px-3 animate-float-slow">
            <div className="w-5 h-5 rounded bg-cyan-500/20 flex items-center justify-center">
              <Workflow className="w-3 h-3 text-cyan-400" />
            </div>
            <span className="text-[11px] text-white/40 font-medium">HTTP Request</span>
          </div>
          {/* Node 2 */}
          <div className="absolute top-[35%] right-[10%] w-28 h-10 rounded-lg bg-white/[0.03] border border-white/[0.08] backdrop-blur-sm flex items-center gap-2 px-3 animate-float-slow" style={{ animationDelay: '1.5s' }}>
            <div className="w-5 h-5 rounded bg-violet-500/20 flex items-center justify-center">
              <Sparkles className="w-3 h-3 text-violet-400" />
            </div>
            <span className="text-[11px] text-white/40 font-medium">AI Filter</span>
          </div>
          {/* Node 3 */}
          <div className="absolute bottom-[25%] left-[20%] w-30 h-10 rounded-lg bg-white/[0.03] border border-white/[0.08] backdrop-blur-sm flex items-center gap-2 px-3 animate-float-slow" style={{ animationDelay: '3s' }}>
            <div className="w-5 h-5 rounded bg-emerald-500/20 flex items-center justify-center">
              <Mail className="w-3 h-3 text-emerald-400" />
            </div>
            <span className="text-[11px] text-white/40 font-medium">Send Email</span>
          </div>
          {/* Glowing connection lines */}
          <svg className="absolute inset-0 w-full h-full opacity-20" style={{ filter: 'blur(1px)' }}>
            <line x1="25%" y1="25%" x2="75%" y2="38%" stroke="#22D3EE" strokeWidth="1" strokeDasharray="6 6" />
            <line x1="75%" y1="38%" x2="30%" y2="70%" stroke="#A78BFA" strokeWidth="1" strokeDasharray="6 6" />
          </svg>
        </div>

        {/* Brand content */}
        <div className="relative z-10 text-center max-w-md">
          <img src="/logo.png" alt="NoBrain" className="w-16 h-16 mx-auto mb-6 drop-shadow-[0_0_20px_rgba(34,211,238,0.4)]" />
          <h1 className="text-4xl md:text-5xl font-extrabold text-white mb-4 leading-tight" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
            Think Before{" "}
            <span className="bg-gradient-to-r from-cyan-400 to-violet-500 text-transparent bg-clip-text">
              You Automate.
            </span>
          </h1>
          <p className="text-[#B6C2D9] text-lg leading-relaxed">
            Plan, visualize, and understand automation workflows before building them in n8n, Zapier, or Make.
          </p>
        </div>
      </div>

      {/* ═══ RIGHT FORM HALF ═══ */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-4 sm:p-8 relative">
        {/* Mobile-only background beams */}
        <div className="lg:hidden absolute inset-0">
          <BackgroundBeams />
        </div>

        <div className="max-w-md w-full relative z-10">
          {/* Mobile logo */}
          <div className="lg:hidden flex items-center justify-center gap-3 mb-8">
            <img src="/logo.png" alt="NoBrain" className="w-10 h-10 drop-shadow-[0_0_12px_rgba(34,211,238,0.5)]" />
            <span className="text-2xl font-bold text-white">NoBrain</span>
          </div>

          <div className="bg-[#11172A]/90 backdrop-blur-xl rounded-[var(--radius-lg)] border border-[rgba(255,255,255,0.06)] shadow-[var(--shadow-lg)] overflow-hidden">
            {/* Card Header */}
            <div className="relative p-6 bg-[#0E1425] border-b border-[rgba(255,255,255,0.06)]">
              <div className="flex items-center gap-3 mb-1">
                <div className="p-2 bg-[rgba(34,211,238,0.1)] rounded-[var(--radius-sm)] border border-[rgba(34,211,238,0.2)]">
                  <Lock className="w-5 h-5 text-[#22D3EE]" />
                </div>
                <h2 className="text-2xl font-bold text-white" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>Sign In</h2>
              </div>
              <p className="text-[#7E8BA3] text-sm">Welcome back to your dashboard</p>
              <div className="absolute bottom-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-[#22D3EE] to-transparent animate-shimmer" />
            </div>

            {/* Form */}
            <form className="p-6 space-y-5" onSubmit={handleSubmit}>
              {/* Email */}
              <div>
                <Label className="block text-[#B6C2D9] mb-2 font-medium text-xs uppercase tracking-widest">
                  Email Address
                </Label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                    <Mail className="h-4 w-4 text-[#7E8BA3]" />
                  </div>
                  <Input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="you@example.com"
                    className="w-full pl-10 pr-4 py-3 bg-[#0E1425] border border-[rgba(255,255,255,0.06)] rounded-[var(--radius-md)] text-[#F3F6FF] placeholder-[#7E8BA3] focus:outline-none focus:ring-2 focus:ring-[#22D3EE]/40 focus:border-[#22D3EE] transition-all duration-200 text-sm"
                    required
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <Label className="block text-[#B6C2D9] mb-2 font-medium text-xs uppercase tracking-widest">
                  Password
                </Label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                    <Lock className="h-4 w-4 text-[#7E8BA3]" />
                  </div>
                  <Input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="Your password"
                    className="w-full pl-10 pr-12 py-3 bg-[#0E1425] border border-[rgba(255,255,255,0.06)] rounded-[var(--radius-md)] text-[#F3F6FF] placeholder-[#7E8BA3] focus:outline-none focus:ring-2 focus:ring-[#22D3EE]/40 focus:border-[#22D3EE] transition-all duration-200 text-sm"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-[#7E8BA3] hover:text-[#B6C2D9] transition-colors"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3 px-4 bg-gradient-to-br from-[#22D3EE] to-[#A78BFA] hover:brightness-110 text-white font-semibold rounded-[var(--radius-md)] shadow-[var(--shadow-sm)] hover:shadow-[0_0_24px_rgba(34,211,238,0.3)] hover:-translate-y-0.5 active:translate-y-0 transition-all duration-200 flex items-center justify-center gap-2 group disabled:opacity-50 disabled:cursor-not-allowed text-sm"
              >
                <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
                {isSubmitting ? "Signing In..." : "Sign In"}
              </button>
            </form>

            {/* Footer */}
            <div className="px-6 py-4 bg-[#0E1425]/50 border-t border-[rgba(255,255,255,0.04)]">
              <p className="text-center text-[#7E8BA3] text-sm">
                Don't have an account?{" "}
                <Link to="/signup" className="text-[#22D3EE] hover:text-[#22D3EE]/80 font-semibold transition-colors hover:underline">
                  Sign Up
                </Link>
              </p>
              <p className="text-xs text-[#7E8BA3]/60 flex items-center justify-center gap-1 mt-2">
                <Lock className="w-3 h-3" />
                Your connection is secure
              </p>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
        .animate-shimmer { animation: shimmer 3s ease-in-out infinite; }
        @keyframes floatSlow {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-12px) rotate(1deg); }
        }
        .animate-float-slow { animation: floatSlow 6s ease-in-out infinite; }
      `}</style>
    </div>
  );
}
