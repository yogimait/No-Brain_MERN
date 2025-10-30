import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { Card } from '../components/ui/card';
import { Textarea } from '../components/ui/textarea';
import { Label } from '../components/ui/label';
import { 
  ArrowLeft, 
  ArrowRight, 
  Brain, 
  Bot,
  Lightbulb,
  Sparkles,
  Zap
} from 'lucide-react';

export default function AISummaryPage() {
  const navigate = useNavigate();
  const [summary, setSummary] = useState('');
  const [workflowType, setWorkflowType] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);

  const handleGenerateWorkflow = async () => {
    if (!summary.trim() || !workflowType) return;

    setIsGenerating(true);

    // Navigate to workflow page with AI-generated flag and pass prompt
    const params = new URLSearchParams({ mode: 'ai-generated', prompt: summary, type: workflowType });
    navigate(`/workflow?${params.toString()}`);
  };

  const workflowTypes = [
    { value: 'social-media', label: 'Social Media Automation' },
    { value: 'content-creation', label: 'Content Creation' },
    { value: 'data-processing', label: 'Data Processing' },
    { value: 'notification', label: 'Notifications & Alerts' },
    { value: 'marketing', label: 'Marketing Automation' },
    { value: 'customer-support', label: 'Customer Support' },
    { value: 'analytics', label: 'Analytics & Reporting' },
    { value: 'e-commerce', label: 'E-commerce' },
    { value: 'other', label: 'Other' }
  ];

  const examplePrompts = [
    "I want to automatically post my blog content to LinkedIn every Monday at 9 AM, and also send a summary email to my team with the post link and engagement metrics.",
    "Create a workflow that scrapes news from RSS feeds, summarizes the content using AI, and posts it to Twitter with relevant hashtags every morning.",
    "Set up an automation that monitors my email for invoices, extracts the amount and due date, and creates calendar reminders for payment deadlines.",
    "Build a workflow that takes customer feedback from Slack, analyzes sentiment, and automatically creates tickets in our support system for negative feedback."
  ];

  return (
    <div className="min-h-screen bg-black">
      {/* Header */}
      <header className="bg-gray-900/60 backdrop-blur-sm border-b border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <Brain className="w-8 h-8 text-blue-400" />
              <span className="text-2xl font-bold text-blue-300">NoBrain</span>
            </div>
            
            <div className="flex items-center gap-4">
              <Button
                variant="outline"
                size="sm"
                className="text-gray-300 border-gray-600 hover:border-blue-500 hover:text-blue-300"
                onClick={() => navigate('/dashboard')}
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Dashboard
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-blue-500 rounded-full flex items-center justify-center mx-auto mb-4">
            <Bot className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">Describe Your Workflow</h1>
          <p className="text-gray-400 text-lg">Tell our AI what you want your workflow to do</p>
        </div>

        <Card className="bg-gray-900/60 border-gray-700/50 p-8 mb-8">
          <div className="space-y-6">
            {/* Workflow Type Selection */}
            <div>
              <Label htmlFor="workflow-type" className="text-gray-300 text-lg font-medium mb-4 block">
                Workflow Type
              </Label>
              <select
                id="workflow-type"
                value={workflowType}
                onChange={(e) => setWorkflowType(e.target.value)}
                className="w-full bg-gray-800/50 border border-gray-600 text-white rounded-md px-3 py-2 text-lg focus:border-blue-500 focus:outline-none"
              >
                <option value="">Select a workflow type</option>
                {workflowTypes.map((type) => (
                  <option key={type.value} value={type.value}>
                    {type.label}
                  </option>
                ))}
              </select>
              <p className="text-gray-500 text-sm mt-2">
                Choose the category that best describes your workflow
              </p>
            </div>

            {/* Workflow Description */}
            <div>
              <Label htmlFor="summary" className="text-gray-300 text-lg font-medium mb-4 block">
                Workflow Description
              </Label>
              <Textarea
                id="summary"
                placeholder="e.g., 'I want to automatically post my blog content to LinkedIn every Monday at 9 AM, and also send a summary email to my team with the post link and engagement metrics.'"
                value={summary}
                onChange={(e) => setSummary(e.target.value)}
                className="bg-gray-800/50 border-gray-600 text-white placeholder-gray-400 focus:border-blue-500 min-h-[200px] text-lg"
                rows={8}
              />
              <p className="text-gray-500 text-sm mt-2">
                Be as specific as possible. Include timing, platforms, data sources, and any special requirements.
              </p>
            </div>

            {/* Example Prompts */}
            <div>
              <h3 className="text-gray-300 font-medium mb-3">Need inspiration? Try these examples:</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {examplePrompts.map((prompt, index) => (
                  <Card
                    key={index}
                    className="p-4 cursor-pointer transition-all duration-200 hover:scale-105 border border-gray-600 hover:border-blue-500 hover:bg-gray-700/50"
                    onClick={() => setSummary(prompt)}
                  >
                    <p className="text-gray-300 text-sm leading-relaxed">{prompt}</p>
                  </Card>
                ))}
              </div>
            </div>
          </div>
        </Card>

        {/* AI Tips */}
        <Card className="bg-blue-500/10 border-blue-500/30 p-6 mb-8">
          <div className="flex items-start space-x-3">
            <Lightbulb className="w-6 h-6 text-blue-400 mt-1" />
            <div>
              <h4 className="text-blue-400 font-semibold mb-2">AI Tips for Better Results</h4>
              <ul className="text-gray-300 text-sm space-y-1">
                <li>• Mention specific platforms and services you want to connect</li>
                <li>• Include timing and frequency requirements</li>
                <li>• Specify data sources and destinations</li>
                <li>• Mention any conditions or filters needed</li>
                <li>• Describe the expected output or result</li>
              </ul>
            </div>
          </div>
        </Card>

        {/* Generate Button */}
        <div className="text-center">
          <Button
            onClick={handleGenerateWorkflow}
            disabled={!summary.trim() || !workflowType || isGenerating}
            className="bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600 text-white px-12 py-4 text-lg font-semibold disabled:opacity-50"
            style={{ boxShadow: '0 4px 20px rgba(34, 197, 94, 0.4)' }}
          >
            {isGenerating ? (
              <>
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-3" />
                AI is generating your workflow...
              </>
            ) : (
              <>
                <Sparkles className="w-5 h-5 mr-3" />
                Generate Workflow
                <ArrowRight className="w-5 h-5 ml-3" />
              </>
            )}
          </Button>
          
          {isGenerating && (
            <div className="mt-4 text-gray-400 text-sm">
              <div className="flex items-center justify-center gap-2">
                <Zap className="w-4 h-4 text-blue-400 animate-pulse" />
                <span>Our AI is analyzing your requirements and building the perfect workflow...</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}