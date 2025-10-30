import { Link, useNavigate } from "react-router-dom";
import { Lock, LogIn, Brain, Eye, EyeOff, Mail } from "lucide-react";
import { useState } from "react";

export default function Login() {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    password: ""
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    navigate("/dashboard");
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-black relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-900/20 via-purple-900/10 to-pink-900/15"></div>
      
      {/* Floating Particles */}
      <div className="absolute inset-0">
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 bg-blue-400/30 rounded-full animate-float"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 5}s`,
              animationDuration: `${15 + Math.random() * 10}s`
            }}
          />
        ))}
      </div>

      {/* Glowing Orbs */}
      <div className="absolute -top-40 -left-40 w-80 h-80 bg-blue-600/10 rounded-full blur-3xl animate-pulse"></div>
      <div className="absolute -bottom-40 -right-40 w-80 h-80 bg-purple-600/10 rounded-full blur-3xl animate-pulse delay-1000"></div>

      <div className="max-w-md w-full mx-4 relative z-10">
        {/* Header with Logo */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="relative">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/25">
                <Brain className="w-6 h-6 text-white" />
              </div>
              <div className="absolute -inset-1 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl blur opacity-30 animate-pulse"></div>
            </div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
              NoBrain
            </h1>
          </div>
          <p className="text-gray-400 text-sm">Intelligent Solutions for Modern Problems</p>
        </div>

        {/* Login Card */}
        <div className="bg-gray-900/80 backdrop-blur-xl rounded-2xl border border-gray-800 shadow-2xl overflow-hidden">
          {/* Card Header */}
          <div className="relative p-8 border-b border-gray-800">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-blue-500/10 rounded-lg border border-blue-500/20">
                <Lock className="w-5 h-5 text-blue-400" />
              </div>
              <h2 className="text-2xl font-bold text-white">Welcome Back</h2>
            </div>
            <p className="text-gray-400">Sign in to continue your journey</p>
            
            {/* Animated underline */}
            <div className="absolute bottom-0 left-0 w-full h-0.5 bg-gradient-to-r from-transparent via-blue-500 to-transparent animate-shimmer"></div>
          </div>

          {/* Form */}
          <form className="p-8" onSubmit={handleSubmit}>
            {/* Email Field */}
            <div className="mb-6">
              <label className="block text-gray-300 mb-3 font-medium text-sm uppercase tracking-wide">
                Email Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-gray-500" />
                </div>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="Enter your email"
                  className="w-full pl-10 pr-4 py-3 bg-gray-800/50 border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all duration-200"
                />
              </div>
            </div>

            {/* Password Field */}
            <div className="mb-6">
              <label className="block text-gray-300 mb-3 font-medium text-sm uppercase tracking-wide">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-500" />
                </div>
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Enter your password"
                  className="w-full pl-10 pr-12 py-3 bg-gray-800/50 border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all duration-200"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-500 hover:text-gray-400 transition-colors"
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
            </div>

            {/* Remember Me & Forgot Password */}
            <div className="flex items-center justify-between mb-6">
              <label className="flex items-center">
                <input type="checkbox" className="rounded bg-gray-800 border-gray-700 text-blue-500 focus:ring-blue-500 focus:ring-offset-gray-900" />
                <span className="ml-2 text-gray-400 text-sm">Remember me</span>
              </label>
              <Link to="/forgot-password" className="text-blue-400 hover:text-blue-300 text-sm transition-colors">
                Forgot password?
              </Link>
            </div>

            {/* Login Button */}
            <button
              type="submit"
              className="w-full py-3.5 px-4 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white font-semibold rounded-xl shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40 transition-all duration-200 transform hover:scale-[1.02] flex items-center justify-center gap-2 group"
            >
              <LogIn className="w-5 h-5 transition-transform group-hover:translate-x-0.5" />
              Sign In
            </button>
          </form>

          {/* Footer */}
          <div className="px-8 py-6 bg-gray-900/50 border-t border-gray-800">
            <div className="text-center text-gray-400 text-sm">
              Don't have an account?{" "}
              <Link
                to="/signup"
                className="text-blue-400 hover:text-blue-300 font-semibold transition-colors duration-200 hover:underline"
              >
                Create Account
              </Link>
            </div>
          </div>
        </div>

        {/* Security Note */}
        <div className="text-center mt-6">
          <p className="text-xs text-gray-500 flex items-center justify-center gap-1">
            <Lock className="w-3 h-3" />
            Your data is securely encrypted and protected
          </p>
        </div>
      </div>

      <style jsx>{`
        @keyframes float {
          0%, 100% { transform: translateY(0) rotate(0deg); }
          50% { transform: translateY(-20px) rotate(180deg); }
        }
        @keyframes shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
        .animate-float {
          animation: float linear infinite;
        }
        .animate-shimmer {
          animation: shimmer 3s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
}