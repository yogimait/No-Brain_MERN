import { Link, useNavigate } from "react-router-dom";
import { Lock, UserPlus, Eye, EyeOff, Mail, User, Shield, Zap, CreditCard } from "lucide-react";
import { useState } from "react";
import { Label } from "../components/ui/label";
import { Input } from "../components/ui/input";
import { BackgroundBeams } from "../components/ui/background-beams";
import { useAuth } from "../contexts/AuthContext";
import { toast } from "sonner";

export default function Signup() {
  const navigate = useNavigate();
  const { register } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: "",
    agreeToTerms: false,
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({ ...formData, [name]: type === "checkbox" ? checked : value });
  };

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }
    if (formData.password.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }
    if (!formData.agreeToTerms) {
      toast.error("Please agree to the terms and conditions");
      return;
    }
    try {
      setIsSubmitting(true);
      const name = `${formData.firstName} ${formData.lastName}`;
      await register(formData.email, name, formData.password);
      toast.success("Account created successfully!");
      navigate("/dashboard");
    } catch (error) {
      console.error("Signup error:", error);
      toast.error(error.message || "Failed to create account");
    } finally {
      setIsSubmitting(false);
    }
  };

  const trustBadges = [
    { icon: <Zap className="w-3.5 h-3.5" />, text: "Free to Start" },
    { icon: <CreditCard className="w-3.5 h-3.5" />, text: "No Credit Card" },
    { icon: <Shield className="w-3.5 h-3.5" />, text: "Instant Access" },
  ];

  return (
    <div className="min-h-screen flex bg-[#0B1020] relative overflow-hidden">
      {/* ═══ LEFT BRANDING HALF ═══ */}
      <div className="hidden lg:flex lg:w-1/2 relative flex-col items-center justify-center p-12 overflow-hidden">
        <BackgroundBeams />

        {/* Decorative abstract graph */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <svg className="absolute inset-0 w-full h-full opacity-15" style={{ filter: 'blur(0.5px)' }}>
            <circle cx="30%" cy="30%" r="6" fill="#22D3EE" opacity="0.5" />
            <circle cx="70%" cy="25%" r="5" fill="#A78BFA" opacity="0.5" />
            <circle cx="50%" cy="55%" r="7" fill="#22D3EE" opacity="0.4" />
            <circle cx="25%" cy="70%" r="5" fill="#34D399" opacity="0.4" />
            <circle cx="75%" cy="65%" r="6" fill="#A78BFA" opacity="0.4" />
            <line x1="30%" y1="30%" x2="70%" y2="25%" stroke="#22D3EE" strokeWidth="1" strokeDasharray="4 4" opacity="0.4" />
            <line x1="70%" y1="25%" x2="50%" y2="55%" stroke="#A78BFA" strokeWidth="1" strokeDasharray="4 4" opacity="0.4" />
            <line x1="50%" y1="55%" x2="25%" y2="70%" stroke="#34D399" strokeWidth="1" strokeDasharray="4 4" opacity="0.4" />
            <line x1="50%" y1="55%" x2="75%" y2="65%" stroke="#A78BFA" strokeWidth="1" strokeDasharray="4 4" opacity="0.4" />
          </svg>
        </div>

        {/* Brand content */}
        <div className="relative z-10 text-center max-w-md">
          <img src="/logo.png" alt="NoBrain" className="w-16 h-16 mx-auto mb-6 drop-shadow-[0_0_20px_rgba(34,211,238,0.4)]" />
          <h1 className="text-4xl md:text-5xl font-extrabold text-white mb-4 leading-tight" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
            Start Your{" "}
            <span className="bg-gradient-to-r from-cyan-400 to-violet-500 text-transparent bg-clip-text">
              Automation Journey.
            </span>
          </h1>
          <p className="text-[#B6C2D9] text-lg leading-relaxed mb-8">
            Join thousands of workflow planners building smarter automations with AI.
          </p>

          {/* Trust badges */}
          <div className="flex items-center justify-center gap-3 flex-wrap">
            {trustBadges.map((badge, i) => (
              <div
                key={i}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/[0.04] border border-white/[0.08] text-[#B6C2D9] text-xs font-medium"
              >
                <span className="text-[#22D3EE]">{badge.icon}</span>
                {badge.text}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ═══ RIGHT FORM HALF ═══ */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-4 sm:p-8 relative">
        <div className="lg:hidden absolute inset-0">
          <BackgroundBeams />
        </div>

        <div className="max-w-md w-full relative z-10">
          {/* Mobile logo */}
          <div className="lg:hidden flex items-center justify-center gap-3 mb-6">
            <img src="/logo.png" alt="NoBrain" className="w-10 h-10 drop-shadow-[0_0_12px_rgba(34,211,238,0.5)]" />
            <span className="text-2xl font-bold text-white">NoBrain</span>
          </div>

          <div className="bg-[#11172A]/90 backdrop-blur-xl rounded-[var(--radius-lg)] border border-[rgba(255,255,255,0.06)] shadow-[var(--shadow-lg)] overflow-hidden">
            {/* Card Header */}
            <div className="relative p-5 bg-[#0E1425] border-b border-[rgba(255,255,255,0.06)]">
              <div className="flex items-center gap-3 mb-1">
                <div className="p-2 bg-[rgba(34,211,238,0.1)] rounded-[var(--radius-sm)] border border-[rgba(34,211,238,0.2)]">
                  <UserPlus className="w-5 h-5 text-[#22D3EE]" />
                </div>
                <h2 className="text-2xl font-bold text-white" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>Create Account</h2>
              </div>
              <p className="text-[#7E8BA3] text-sm">Start your journey with us</p>
              <div className="absolute bottom-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-[#A78BFA] to-transparent animate-shimmer" />
            </div>

            {/* Form */}
            <form className="p-5 space-y-4" onSubmit={handleSubmit}>
              {/* Name Fields */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label className="block text-[#B6C2D9] mb-1.5 font-medium text-xs uppercase tracking-widest">First Name</Label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <User className="h-4 w-4 text-[#7E8BA3]" />
                    </div>
                    <Input type="text" name="firstName" value={formData.firstName} onChange={handleChange}
                      placeholder="First" required
                      className="w-full pl-9 pr-3 py-2.5 bg-[#0E1425] border border-[rgba(255,255,255,0.06)] rounded-[var(--radius-md)] text-[#F3F6FF] placeholder-[#7E8BA3] focus:outline-none focus:ring-2 focus:ring-[#22D3EE]/40 focus:border-[#22D3EE] transition-all duration-200 text-sm"
                    />
                  </div>
                </div>
                <div>
                  <Label className="block text-[#B6C2D9] mb-1.5 font-medium text-xs uppercase tracking-widest">Last Name</Label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <User className="h-4 w-4 text-[#7E8BA3]" />
                    </div>
                    <Input type="text" name="lastName" value={formData.lastName} onChange={handleChange}
                      placeholder="Last" required
                      className="w-full pl-9 pr-3 py-2.5 bg-[#0E1425] border border-[rgba(255,255,255,0.06)] rounded-[var(--radius-md)] text-[#F3F6FF] placeholder-[#7E8BA3] focus:outline-none focus:ring-2 focus:ring-[#22D3EE]/40 focus:border-[#22D3EE] transition-all duration-200 text-sm"
                    />
                  </div>
                </div>
              </div>

              {/* Email */}
              <div>
                <Label className="block text-[#B6C2D9] mb-1.5 font-medium text-xs uppercase tracking-widest">Email Address</Label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                    <Mail className="h-4 w-4 text-[#7E8BA3]" />
                  </div>
                  <Input type="email" name="email" value={formData.email} onChange={handleChange}
                    placeholder="you@example.com" required
                    className="w-full pl-10 pr-4 py-2.5 bg-[#0E1425] border border-[rgba(255,255,255,0.06)] rounded-[var(--radius-md)] text-[#F3F6FF] placeholder-[#7E8BA3] focus:outline-none focus:ring-2 focus:ring-[#22D3EE]/40 focus:border-[#22D3EE] transition-all duration-200 text-sm"
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <Label className="block text-[#B6C2D9] mb-1.5 font-medium text-xs uppercase tracking-widest">Password</Label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                    <Lock className="h-4 w-4 text-[#7E8BA3]" />
                  </div>
                  <Input type={showPassword ? "text" : "password"} name="password" value={formData.password} onChange={handleChange}
                    placeholder="Create a password" required
                    className="w-full pl-10 pr-12 py-2.5 bg-[#0E1425] border border-[rgba(255,255,255,0.06)] rounded-[var(--radius-md)] text-[#F3F6FF] placeholder-[#7E8BA3] focus:outline-none focus:ring-2 focus:ring-[#22D3EE]/40 focus:border-[#22D3EE] transition-all duration-200 text-sm"
                  />
                  <button type="button" onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-[#7E8BA3] hover:text-[#B6C2D9] transition-colors">
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              {/* Confirm Password */}
              <div>
                <Label className="block text-[#B6C2D9] mb-1.5 font-medium text-xs uppercase tracking-widest">Confirm Password</Label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                    <Lock className="h-4 w-4 text-[#7E8BA3]" />
                  </div>
                  <Input type={showConfirmPassword ? "text" : "password"} name="confirmPassword" value={formData.confirmPassword} onChange={handleChange}
                    placeholder="Confirm your password" required
                    className="w-full pl-10 pr-12 py-2.5 bg-[#0E1425] border border-[rgba(255,255,255,0.06)] rounded-[var(--radius-md)] text-[#F3F6FF] placeholder-[#7E8BA3] focus:outline-none focus:ring-2 focus:ring-[#22D3EE]/40 focus:border-[#22D3EE] transition-all duration-200 text-sm"
                  />
                  <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-[#7E8BA3] hover:text-[#B6C2D9] transition-colors">
                    {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              {/* Terms */}
              <div>
                <Label className="flex items-start gap-2 cursor-pointer">
                  <Input type="checkbox" name="agreeToTerms" checked={formData.agreeToTerms} onChange={handleChange}
                    className="rounded bg-[#0E1425] border-[rgba(255,255,255,0.06)] text-[#22D3EE] focus:ring-[#22D3EE] focus:ring-offset-[#0B1020] mt-0.5" required
                  />
                  <span className="text-[#7E8BA3] text-xs leading-relaxed">
                    I agree to the{" "}
                    <Link to="/terms" className="text-[#B6C2D9] hover:text-white transition-colors underline">Terms of Service</Link>{" "}
                    and{" "}
                    <Link to="/privacy" className="text-[#B6C2D9] hover:text-white transition-colors underline">Privacy Policy</Link>
                  </span>
                </Label>
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3 px-4 bg-gradient-to-br from-[#22D3EE] to-[#A78BFA] hover:brightness-110 text-white font-semibold rounded-[var(--radius-md)] shadow-[var(--shadow-sm)] hover:shadow-[0_0_24px_rgba(167,139,250,0.3)] hover:-translate-y-0.5 active:translate-y-0 transition-all duration-200 flex items-center justify-center gap-2 group disabled:opacity-50 disabled:cursor-not-allowed text-sm"
              >
                <UserPlus className="w-4 h-4 transition-transform group-hover:scale-110" />
                {isSubmitting ? "Creating Account..." : "Create Account"}
              </button>
            </form>

            {/* Footer */}
            <div className="px-5 py-3 bg-[#0E1425]/50 border-t border-[rgba(255,255,255,0.04)]">
              <p className="text-center text-[#7E8BA3] text-sm">
                Already have an account?{" "}
                <Link to="/login" className="text-[#22D3EE] hover:text-[#22D3EE]/80 font-semibold transition-colors hover:underline">
                  Sign In
                </Link>
              </p>
              <p className="text-xs text-[#7E8BA3]/60 flex items-center justify-center gap-1 mt-2">
                <Lock className="w-3 h-3" />
                Your data is securely encrypted
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
      `}</style>
    </div>
  );
}
