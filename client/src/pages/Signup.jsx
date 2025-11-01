

// import { Link, useNavigate } from "react-router-dom";
// import { Lock, UserPlus, Brain, Eye, EyeOff, Mail, User } from "lucide-react";
// import { useState } from "react";
// import { Label } from "../components/ui/Label";
// import { Input } from "../components/ui/Input";
// // 1. Import BackgroundBeams component
// import { BackgroundBeams } from "../components/ui/background-beams"; 

// export default function Signup() {
//   const navigate = useNavigate();
//   const [showPassword, setShowPassword] = useState(false);
//   const [showConfirmPassword, setShowConfirmPassword] = useState(false);
//   const [formData, setFormData] = useState({
//     firstName: "",
//     lastName: "",
//     email: "",
//     password: "",
//     confirmPassword: "",
//     agreeToTerms: false
//   });

//   const handleChange = (e) => {
//     const { name, value, type, checked } = e.target;
//     setFormData({
//       ...formData,
//       [name]: type === "checkbox" ? checked : value
//     });
//   };

//   const handleSubmit = (e) => {
//     e.preventDefault();
//     // Add your signup logic here
//     console.log("Signup data:", formData);
//     navigate("/dashboard");
//   };

//   return (
//     // 2. Add 'relative' to the container for BackgroundBeams positioning
//     <div className="min-h-screen flex items-center justify-center bg-black relative overflow-hidden">
      
//       {/* 3. Render BackgroundBeams with absolute positioning */}
//       <BackgroundBeams /> 
      
//       {/* REMOVED: Animated Background Elements, Floating Particles, and Glowing Orbs */}
      
//       <div className="max-w-md w-full mx-4 relative z-10">
//         {/* Header with Logo */}
//         <div className="text-center mb-8">
//           <div className="flex items-center justify-center gap-3 mb-4">
//             <div className="relative ">
//               <div className="w-12 h-12  bg-gradient-to-br from-green-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-green-500/25">
//                 <Brain className="w-6 h-6 text-white" />
//               </div>
//               <div className="absolute -inset-1 bg-gradient-to-r from-green-500 to-blue-600 rounded-xl blur opacity-30 animate-pulse"></div>
//             </div>
//             <h1 className="text-4xl font-bold bg-gradient-to-r from-green-400 to-blue-400 bg-clip-text text-transparent">
//               NoBrain
//             </h1>
//           </div>
          
//         </div>

//         {/* Signup Card */}
//         <div className="bg-gray-900/80 backdrop-blur-xl rounded-2xl border border-gray-800 shadow-2xl overflow-hidden">
//           {/* Card Header */}
//           <div className="relative p-8 border-b bg-black border-gray-800">
//             <div className="flex items-center gap-3 mb-2">
//               <div className="p-2 bg-green-500/10 rounded-lg border border-green-500/20">
//                 <UserPlus className="w-5 h-5 text-green-400" />
//               </div>
//               <h2 className="text-2xl font-bold text-white">Create Account</h2>
//             </div>
//             <p className="text-gray-400">Start your journey with us</p>
            
//             {/* Animated underline */}
//             <div className="absolute bottom-0 left-0 w-full h-0.5 bg-gradient-to-r from-transparent via-green-500 to-transparent animate-shimmer"></div>
//           </div>

//           {/* Form */}
//           <form className="p-8 bg-black" onSubmit={handleSubmit}>
//             {/* Name Fields */}
//             <div className="grid grid-cols-2 gap-4 mb-6">
//               <div>
//                 <Label className="block text-gray-300 mb-3 font-medium text-sm uppercase tracking-wide">
//                   First Name
//                 </Label>
//                 <div className="relative">
//                   <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
//                     <User className="h-5 w-5 text-gray-500" />
//                   </div>
//                   <Input
//                     type="text"
//                     name="firstName"
//                     value={formData.firstName}
//                     onChange={handleChange}
//                     placeholder="First name"
//                     className="w-full pl-10 pr-4 py-3 bg-black border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-green-500/50 focus:border-green-500 transition-all duration-200"
//                     required
//                   />
//                 </div>
//               </div>
//               <div>
//                 <Label className="block text-gray-300 mb-3 font-medium text-sm uppercase tracking-wide">
//                   Last Name
//                 </Label>
//                 <div className="relative">
//                   <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
//                     <User className="h-5 w-5 text-gray-500" />
//                   </div>
//                   <Input
//                     type="text"
//                     name="lastName"
//                     value={formData.lastName}
//                     onChange={handleChange}
//                     placeholder="Last name"
//                     className="w-full pl-10 pr-4 py-3 bg-black border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-green-500/50 focus:border-green-500 transition-all duration-200"
//                     required
//                   />
//                 </div>
//               </div>
//             </div>

//             {/* Email Field */}
//             <div className="mb-6">
//               <Label className="block text-gray-300 mb-3 font-medium text-sm uppercase tracking-wide">
//                 Email Address
//               </Label>
//               <div className="relative">
//                 <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
//                   <Mail className="h-5 w-5 text-gray-500" />
//                 </div>
//                 <Input
//                   type="email"
//                   name="email"
//                   value={formData.email}
//                   onChange={handleChange}
//                   placeholder="Enter your email"
//                   className="w-full pl-10 pr-4 py-3 bg-black border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-green-500/50 focus:border-green-500 transition-all duration-200"
//                   required
//                 />
//               </div>
//             </div>

//             {/* Password Field */}
//             <div className="mb-6">
//               <Label className="block text-gray-300 mb-3 font-medium text-sm uppercase tracking-wide">
//                 Password
//               </Label>
//               <div className="relative">
//                 <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
//                   <Lock className="h-5 w-5 text-gray-500" />
//                 </div>
//                 <Input
//                   type={showPassword ? "text" : "password"}
//                   name="password"
//                   value={formData.password}
//                   onChange={handleChange}
//                   placeholder="Create a password"
//                   className="w-full pl-10 pr-12 py-3 bg-black border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-green-500/50 focus:border-green-500 transition-all duration-200"
//                   required
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

//             {/* Confirm Password Field */}
//             <div className="mb-6">
//               <Label className="block text-gray-300 mb-3 font-medium text-sm uppercase tracking-wide">
//                 Confirm Password
//               </Label>
//               <div className="relative">
//                 <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
//                   <Lock className="h-5 w-5 text-gray-500" />
//                 </div>
//                 <Input
//                   type={showConfirmPassword ? "text" : "password"}
//                   name="confirmPassword"
//                   value={formData.confirmPassword}
//                   onChange={handleChange}
//                   placeholder="Confirm your password"
//                   className="w-full pl-10 pr-12 py-3 bg-black border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-green-500/50 focus:border-green-500 transition-all duration-200"
//                   required
//                 />
//                 <button
//                   type="button"
//                   onClick={() => setShowConfirmPassword(!showConfirmPassword)}
//                   className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-500 hover:text-gray-400 transition-colors"
//                 >
//                   {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
//                 </button>
//               </div>
//             </div>

//             {/* Terms and Conditions */}
//             <div className="mb-6">
//               <Label className="flex items-start">
//                 <Input 
//                   type="checkbox" 
//                   name="agreeToTerms"
//                   checked={formData.agreeToTerms}
//                   onChange={handleChange}
//                   className="rounded bg-black border-gray-700 text-green-500 focus:ring-green-500 focus:ring-offset-gray-900 mt-1" 
//                   required
//                 />
//                 <span className="ml-2 text-gray-400 text-sm">
//                   I agree to the{" "}
//                   <Link to="/terms" className="text-green-400 hover:text-green-300 transition-colors">
//                     Terms of Service
//                   </Link>{" "}
//                   and{" "}
//                   <Link to="/privacy" className="text-green-400 hover:text-green-300 transition-colors">
//                     Privacy Policy
//                   </Link>
//                 </span>
//               </Label>
//             </div>

//             {/* Signup Button */}
//             <button
//               type="submit"
//               className="w-full py-3.5 px-4 bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-500 hover:to-blue-500 text-white font-semibold rounded-xl shadow-lg shadow-green-500/25 hover:shadow-green-500/40 transition-all duration-200 transform hover:scale-[1.02] flex items-center justify-center gap-2 group"
//             >
//               <UserPlus className="w-5 h-5 transition-transform group-hover:scale-110" />
//               Create Account
//             </button>
//           </form>

//           {/* Footer */}
//           <div className="px-8 py-6 bg-gray-900/50 border-t border-gray-800">
//             <div className="text-center text-gray-400 text-sm">
//               Already have an account?{" "}
//               <Link
//                 to="/login"
//                 className="text-green-400 hover:text-green-300 font-semibold transition-colors duration-200 hover:underline"
//               >
//                 Sign In
//               </Link>

//                <p className="text-xs text-gray-500 flex items-center justify-center gap-1">
//             <Lock className="w-3 h-3" />
//             Your data is securely encrypted and protected
//           </p>
//             </div>
//           </div>
//         </div>

//         {/* Security Note */}
//         <div className="text-center mt-6">
         
//         </div>
//       </div>

//       <style jsx>{`
//         /* Removed @keyframes float and .animate-float as they were for the old Floating Particles */
//         @keyframes shimmer {
//           0% { transform: translateX(-100%); }
//           100% { transform: translateX(100%); }
//         }
//         .animate-shimmer {
//           animation: shimmer 3s ease-in-out infinite;
//         }
//       `}</style>
//     </div>
//   );
// }

import { Link, useNavigate } from "react-router-dom";
import { Lock, UserPlus, Brain, Eye, EyeOff, Mail, User } from "lucide-react";
import { useState } from "react";
import { Label } from "../components/ui/Label";
import { Input } from "../components/ui/Input";
// 1. Import BackgroundBeams component
import { BackgroundBeams } from "../components/ui/background-beams"; 

export default function Signup() {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: "",
    agreeToTerms: false
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === "checkbox" ? checked : value
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Add your signup logic here
    console.log("Signup data:", formData);
    navigate("/dashboard");
  };

  return (
    // ⭐ UPDATED: Use flex items-center justify-center to center the main content/form
    <div className="min-h-screen flex items-center justify-center bg-black relative overflow-hidden p-4">
      
      {/* 3. Render BackgroundBeams with absolute positioning */}
      <BackgroundBeams /> 
      
      {/* ⭐ NEW LEFT SECTION: Logo/Header on Middle-Left (Absolute Positioning) ⭐ */}
{/*       <div className="absolute left-0 top-1/2 pb-40 -translate-y-1/2 p-8 z-20 pointer-events-none">
        <div className="text-left">
         
          <div className="flex items-center gap-4">
            <div className="relative">
              <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-blue-600 rounded-2xl flex items-center justify-center shadow-2xl shadow-green-500/25">
                <Brain className="w-8 h-8 text-white" />
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


      {/* Form Card Container (Centered by the parent div) */}
      <div className="max-w-md w-full relative z-10 flex-shrink-0">
        
        {/* Signup Card */}
        <div className="bg-gray-900/80 backdrop-blur-xl rounded-2xl border border-gray-800 shadow-2xl overflow-hidden">
          {/* Card Header */}
          <div className="relative p-4 border-black bg-black border-gray-800">
                {/* RESTORED: Original simple card header design */}
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-500/10 rounded-lg border border-green-500/20">
                <UserPlus className="w-5 h-5 text-green-400" />
              </div>
              <h2 className="text-2xl font-bold text-white">Create Account</h2>
            </div>
            <p className="text-gray-400">Start your journey with us</p>
            
            {/* Animated underline */}
            <div className="absolute bottom-0 left-0 w-full h-0.5 bg-gradient-to-r from-transparent via-green-500 to-transparent animate-shimmer"></div>
          </div>

          {/* Form */}
          <form className="p-8 bg-black" onSubmit={handleSubmit}>
            {/* Name Fields */}
            <div className="grid grid-cols-2 gap-4 mb-2">
              <div>
                <Label className="block text-gray-300 mb-1 font-medium text-sm uppercase tracking-wide">
                  First Name
                </Label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <User className="h-5 w-5 text-gray-500" />
                  </div>
                  <Input
                    type="text"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleChange}
                    placeholder="First name"
                    className="w-full pl-10 pr-4 py-3 bg-black border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-green-500/50 focus:border-green-500 transition-all duration-200"
                    required
                  />
                </div>
              </div>
              <div>
                <Label className="block text-gray-300 mb-2 font-medium text-sm uppercase tracking-wide">
                  Last Name
                </Label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <User className="h-5 w-5 text-gray-500" />
                </div>
                  <Input
                    type="text"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleChange}
                    placeholder="Last name"
                    className="w-full pl-10 pr-4 py-3 bg-black border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-green-500/50 focus:border-green-500 transition-all duration-200"
                    required
                  />
                </div>
              </div>
            </div>

            {/* Email Field */}
            <div className="mb-2">
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
                  className="w-full pl-10 pr-4 py-3 bg-black border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-green-500/50 focus:border-green-500 transition-all duration-200"
                  required
                />
              </div>
            </div>

            {/* Password Field */}
            <div className="mb-2">
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
                  placeholder="Create a password"
                  className="w-full pl-10 pr-12 py-3 bg-black border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-green-500/50 focus:border-green-500 transition-all duration-200"
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

            {/* Confirm Password Field */}
            <div className="mb-2">
              <Label className="block text-gray-300 mb-2 font-medium text-sm uppercase tracking-wide">
                Confirm Password
              </Label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-500" />
                </div>
                <Input
                  type={showConfirmPassword ? "text" : "password"}
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  placeholder="Confirm your password"
                  className="w-full pl-10 pr-12 py-3 bg-black border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-green-500/50 focus:border-green-500 transition-all duration-200"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-500 hover:text-gray-400 transition-colors"
                >
                  {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
            </div>

            {/* Terms and Conditions */}
            <div className="mb-2">
              <Label className="flex items-start">
                <Input 
                  type="checkbox" 
                  name="agreeToTerms"
                  checked={formData.agreeToTerms}
                  onChange={handleChange}
                  className="rounded bg-black border-gray-700 text-green-500 focus:ring-green-500 focus:ring-offset-gray-900" 
                  required
                />
                <span className="ml-2 mt-3 text-gray-400 text-sm">
                  I agree to the{" "}
                  <Link to="/terms" className="text-green-400 hover:text-green-300 transition-colors">
                    Terms of Service
                  </Link>{" "}
                  and{" "}
                  <Link to="/privacy" className="text-green-400 hover:text-green-300 transition-colors">
                    Privacy Policy
                  </Link>
                </span>
              </Label>
            </div>

            {/* Signup Button */}
            <button
              type="submit"
              className="w-full py-2 px-4 bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-500 hover:to-blue-500 text-white font-semibold rounded-xl shadow-lg shadow-green-500/25 hover:shadow-green-500/40 transition-all duration-200 transform hover:scale-[1.02] flex items-center justify-center gap-2 group"
            >
              <UserPlus className="w-5 h-5 transition-transform group-hover:scale-110" />
              Create Account
            </button>
          </form>

          {/* Footer */}
          <div className="px-8 py-1 bg-gray-900/50 border-t border-gray-800">
            <div className="text-center text-gray-400 text-sm">
              Already have an account?{" "}
              <Link
                to="/login"
                className="text-green-400 hover:text-green-300 font-semibold transition-colors duration-200 hover:underline"
              >
                Sign In
              </Link>

               <p className="text-xs text-gray-500 flex items-center justify-center gap-1">
            <Lock className="w-3 h-3" />
            Your data is securely encrypted and protected
          </p>
            </div>
          </div>
        </div>

        
      </div>

      <style jsx>{`
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
