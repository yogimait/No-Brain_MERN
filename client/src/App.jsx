import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import LandingPage from "./pages/LandingPage.jsx";
import Login from "./pages/Login.jsx";
import Signup from "./pages/Signup.jsx";
import Dashboard from "./pages/Dashboard.jsx";
import Workflow from "./pages/Workflow.jsx";
import AIPromptPage from './pages/aiPrompt';
import CompleteWorkflowPage from "./pages/CompleteWorkflow.jsx";
import WorkflowsListPage from "./pages/WorkflowsList.jsx";




function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup/>} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/workflow" element={<Workflow />} />
        <Route path="/workflow/ai-prompt" element={<AIPromptPage />} />
        <Route path="/workflow/complete" element={<CompleteWorkflowPage />} />
        <Route path="/workflows-list" element={<WorkflowsListPage />} />
      </Routes>
    </Router>
  );
}

export default App;
