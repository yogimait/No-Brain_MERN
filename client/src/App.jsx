import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "sonner";
import { AuthProvider } from "./contexts/AuthContext";
import { ProtectedRoute } from "./components/ProtectedRoute";
import LandingPage from "./pages/LandingPage.jsx";
import Login from "./pages/Login.jsx";
import Signup from "./pages/Signup.jsx";
import Dashboard from "./pages/Dashboard.jsx";
import Workflow from "./pages/Workflow.jsx";
import AIPromptPage from './pages/aiPrompt';
import CompleteWorkflowPage from "./pages/CompleteWorkflow.jsx";
import WorkflowsListPage from "./pages/WorkflowsList.jsx";
import Logs from "./pages/Logs.jsx";

function App() {
  return (
    <AuthProvider>
      <Router>
        <Toaster position="top-right" richColors />
        <Routes>
          {/* Public routes */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          
          {/* Protected routes */}
          <Route 
            path="/dashboard" 
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/workflow" 
            element={
              <ProtectedRoute>
                <Workflow />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/workflow/ai-prompt" 
            element={
              <ProtectedRoute>
                <AIPromptPage />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/workflow/complete" 
            element={
              <ProtectedRoute>
                <CompleteWorkflowPage />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/workflows-list" 
            element={
              <ProtectedRoute>
                <WorkflowsListPage />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/logs" 
            element={
              <ProtectedRoute>
                <Logs />
              </ProtectedRoute>
            } 
          />

          {/* Catch all - redirect to home */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
