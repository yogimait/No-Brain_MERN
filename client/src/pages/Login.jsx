// import { Link, useNavigate } from "react-router-dom";
// import { Lock, LogIn, Brain, Eye, EyeOff, Mail } from "lucide-react";
// import { useState } from "react";
// import { BackgroundBeams } from "../components/ui/background-beams";

// export default function Login() {
//   const navigate = useNavigate();
//   const [showPassword, setShowPassword] = useState(false);
//   const [formData, setFormData] = useState({
//     email: "",
//     password: ""
//   });

//   const handleChange = (e) => {
//     setFormData({
//       ...formData,
//       [e.target.name]: e.target.value
//     });
//   };

//   const handleSubmit = (e) => {
//     e.preventDefault();
//     navigate("/dashboard");
//   };

//   return (
//     <div className="min-h-screen flex items-center justify-center bg-black relative overflow-hidden">
//       {/* Animated Background Elements */}
//       <div className="absolute inset-0 bg-black"></div>
//       <BackgroundBeams />
      
//       {/* Floating Particles
//       <div className="absolute inset-0">
//         {[...Array(20)].map((_, i) => (
//           <div
//             key={i}
//             className="absolute w-1 h-1 bg-blue-400/30 rounded-full animate-float"
//             style={{
//               left: `${Math.random() * 100}%`,
//               top: `${Math.random() * 100}%`,
//               animationDelay: `${Math.random() * 5}s`,
//               animationDuration: `${15 + Math.random() * 10}s`
//             }}
//           />
//         ))}
//       </div> */}

//       {/* Glowing Orbs */}
//       {/* <div className="absolute -top-40 -left-40 w-80 h-80 bg-blue-600/10 rounded-full blur-3xl animate-pulse"></div> */}
//       {/* <div className="absolute -bottom-40 -right-40 w-80 h-80 bg-purple-600/10 rounded-full blur-3xl animate-pulse delay-1000"></div> */}

//       <div className="max-w-md w-full mx-4 relative z-10">
//         {/* Header with Logo */}
//         <div className="text-center mb-8">
//           <div className="flex items-center justify-center gap-3 mb-4">
//             <div className="relative">
//               <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/25">
//                 <Brain className="w-6 h-6 text-white" />
//               </div>
//               <div className="absolute -inset-1 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl blur opacity-30 animate-pulse"></div>
//             </div>
//             <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
//               NoBrain
//             </h1>
//           </div>
//           <p className="text-gray-400 text-sm">Intelligent Solutions for Modern Problems</p>
//         </div>

//         {/* Login Card */}
//         <div className="bg-gray-900/80 backdrop-blur-xl rounded-2xl border border-gray-800 shadow-2xl overflow-hidden">
//           {/* Card Header */}
//           <div className="relative p-8 border-b border-gray-800">
//             <div className="flex items-center gap-3 mb-2">
//               <div className="p-2 bg-blue-500/10 rounded-lg border border-blue-500/20">
//                 <Lock className="w-5 h-5 text-blue-400" />
//               </div>
//               <h2 className="text-2xl font-bold text-white">Welcome Back</h2>
//             </div>
//             <p className="text-gray-400">Sign in to continue your journey</p>
            
//             {/* Animated underline */}
//             <div className="absolute bottom-0 left-0 w-full h-0.5 bg-gradient-to-r from-transparent via-blue-500 to-transparent animate-shimmer"></div>
//           </div>

//           {/* Form */}
//           <form className="p-8" onSubmit={handleSubmit}>
//             {/* Email Field */}
//             <div className="mb-6">
//               <label className="block text-gray-300 mb-3 font-medium text-sm uppercase tracking-wide">
//                 Email Address
//               </label>
//               <div className="relative">
//                 <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
//                   <Mail className="h-5 w-5 text-gray-500" />
//                 </div>
//                 <input
//                   type="email"
//                   name="email"
//                   value={formData.email}
//                   onChange={handleChange}
//                   placeholder="Enter your email"
//                   className="w-full pl-10 pr-4 py-3 bg-gray-800/50 border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all duration-200"
//                 />
//               </div>
//             </div>

//             {/* Password Field */}
//             <div className="mb-6">
//               <label className="block text-gray-300 mb-3 font-medium text-sm uppercase tracking-wide">
//                 Password
//               </label>
//               <div className="relative">
//                 <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
//                   <Lock className="h-5 w-5 text-gray-500" />
//                 </div>
//                 <input
//                   type={showPassword ? "text" : "password"}
//                   name="password"
//                   value={formData.password}
//                   onChange={handleChange}
//                   placeholder="Enter your password"
//                   className="w-full pl-10 pr-12 py-3 bg-gray-800/50 border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all duration-200"
//                 />
//                 <button
//                   type="button"
//                   onClick={() => setShowPassword(!showPassword)}
//                   className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-500 hover:text-gray-400 transition-colors"
//                 >
//                   {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
//                 </button>
//               </div>
//             </div>

//             {/* Remember Me & Forgot Password */}
//             <div className="flex items-center justify-between mb-6">
//               <label className="flex items-center">
//                 <input type="checkbox" className="rounded bg-gray-800 border-gray-700 text-blue-500 focus:ring-blue-500 focus:ring-offset-gray-900" />
//                 <span className="ml-2 text-gray-400 text-sm">Remember me</span>
//               </label>
//               <Link to="/forgot-password" className="text-blue-400 hover:text-blue-300 text-sm transition-colors">
//                 Forgot password?
//               </Link>
//             </div>

//             {/* Login Button */}
//             <button
//               type="submit"
//               className="w-full py-3.5 px-4 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white font-semibold rounded-xl shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40 transition-all duration-200 transform hover:scale-[1.02] flex items-center justify-center gap-2 group"
//             >
//               <LogIn className="w-5 h-5 transition-transform group-hover:translate-x-0.5" />
//               Sign In
//             </button>
//           </form>

//           {/* Footer */}
//           <div className="px-8 py-6 bg-gray-900/50 border-t border-gray-800">
//             <div className="text-center text-gray-400 text-sm">
//               Don't have an account?{" "}
//               <Link
//                 to="/signup"
//                 className="text-blue-400 hover:text-blue-300 font-semibold transition-colors duration-200 hover:underline"
//               >
//                 Create Account
//               </Link>
//             </div>
//           </div>
//         </div>

//         {/* Security Note */}
//         <div className="text-center mt-6">
//           <p className="text-xs text-gray-500 flex items-center justify-center gap-1">
//             <Lock className="w-3 h-3" />
//             Your data is securely encrypted and protected
//           </p>
//         </div>
//       </div>

//       <style jsx>{`
//         @keyframes float {
//           0%, 100% { transform: translateY(0) rotate(0deg); }
//           50% { transform: translateY(-20px) rotate(180deg); }
//         }
//         @keyframes shimmer {
//           0% { transform: translateX(-100%); }
//           100% { transform: translateX(100%); }
//         }
//         .animate-float {
//           animation: float linear infinite;
//         }
//         .animate-shimmer {
//           animation: shimmer 3s ease-in-out infinite;
//         }
//       `}</style>
//     </div>
//   );
// }

// --- Login.jsx Template ---
import { Link, useNavigate, useLocation } from "react-router-dom";
import { Lock, Eye, EyeOff, Mail } from "lucide-react";
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
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      setIsSubmitting(true);
      
      await login(formData.email, formData.password);
      
      toast.success("Logged in successfully!");
      
      // Redirect to the page user was trying to access, or dashboard
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
    // 1. Full Screen Centering Container
    <div className="min-h-screen flex items-center justify-center bg-black relative overflow-hidden p-4">
      
      {/* 2. Background Beams */}
      <BackgroundBeams /> 
      
      {/* 3. Left Section: Logo/Header on Middle-Left (Absolute Positioning) */}
{/*       <div className="absolute left-0 top-1/2 pb-40 -translate-y-1/2 p-8 z-20 pointer-events-none">
        <div className="text-left">
          <div className="flex items-center gap-4">
            <div className="relative">
              <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-blue-600 rounded-2xl flex items-center justify-center shadow-2xl shadow-green-500/25">
                
                <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-8 h-8 text-white"><path d="M12 1a2 2 0 0 1 2 2v2a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V3a2 2 0 0 1 2-2h9z"></path><path d="M14 10v2a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2v-2a2 2 0 0 1 2-2h9z"></path><path d="M14 18v2a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2v-2a2 2 0 0 1 2-2h9z"></path></svg>
              </div>
              <div className="absolute -inset-1 bg-gradient-to-r from-green-500 to-blue-600 rounded-2xl blur opacity-30 animate-pulse"></div>
            </div>
            <h1 className="text-5xl font-extrabold tracking-tight bg-gradient-to-r from-green-400 to-blue-400 bg-clip-text text-transparent">
              NoBrain
            </h1>
          </div>
          <p className="text-gray-300 text-xl max-w-sm mt-2">
            Effortless AI Workflow Automation.
          </p>
        </div>
      </div> */}


      {/* 4. Right Section: Form Card (Centered by the parent div) */}
      <div className="max-w-md w-full relative z-10 flex-shrink-0">
        
        <div className="bg-gray-900/80 backdrop-blur-xl rounded-2xl border border-gray-800 shadow-2xl overflow-hidden">
          
          {/* Card Header */}
          <div className="relative p-4 border-black bg-black border-gray-800">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gray-800/50 rounded-lg border border-gray-700/50">
                <Lock className="w-5 h-5 text-gray-400" />
              </div>
              <h2 className="text-2xl font-bold text-white">Sign In</h2>
            </div>
            <p className="text-gray-400">Welcome back to your dashboard</p>
            
            <div className="absolute bottom-0 left-0 w-full h-0.5 bg-gradient-to-r from-transparent via-blue-500 to-transparent animate-shimmer"></div>
          </div>

          {/* Form */}
          <form className="p-8 bg-black" onSubmit={handleSubmit}>
            
            {/* Email Field */}
            <div className="mb-6">
              <Label className="block text-gray-300 mb-2 font-medium text-sm uppercase tracking-wide">
                Email Address
              </Label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-gray-500" />
                </div>
                <Input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="Enter your email"
                  className="w-full pl-10 pr-4 py-3 bg-black border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-gray-500/50 focus:border-gray-600 transition-all duration-200"
                  required
                />
              </div>
            </div>

            {/* Password Field */}
            <div className="mb-6">
              <Label className="block text-gray-300 mb-2 font-medium text-sm uppercase tracking-wide">
                Password
              </Label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-500" />
                </div>
                <Input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Your password"
                  className="w-full pl-10 pr-12 py-3 bg-black border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-gray-500/50 focus:border-gray-600 transition-all duration-200"
                  required
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
            
            {/* Login Button */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-2 px-4 bg-gray-700 hover:bg-gray-600 text-white font-semibold rounded-xl shadow-lg shadow-gray-900/25 hover:shadow-gray-900/40 transition-all duration-200 transform hover:scale-[1.02] flex items-center justify-center gap-2 group disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Lock className="w-5 h-5 transition-transform group-hover:scale-110" />
              {isSubmitting ? "Signing In..." : "Sign In"}
            </button>
          </form>

          {/* Footer */}
          <div className="px-8 py-4 bg-gray-900/50 border-t border-gray-800">
            <div className="text-center text-gray-400 text-sm">
              Don't have an account?{" "}
              <Link
                to="/signup"
                className="text-blue-400 hover:text-blue-300 font-semibold transition-colors duration-200 hover:underline"
              >
                Sign Up
              </Link>

               <p className="text-xs text-gray-500 flex items-center justify-center gap-1 mt-3">
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
        .animate-shimmer {
          animation: shimmer 3s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
}
// --- End Login.jsx Template ---
