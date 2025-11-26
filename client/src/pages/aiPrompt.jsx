import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { Card } from '../components/ui/card';
import { Textarea } from '../components/ui/textarea';
import { 
  ArrowLeft, 
  ArrowRight, 
  Brain, 
  Bot,
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
                variant="ghost"
                size="sm"
                className="text-gray-300 hover:text-blue-300 hover:bg-transparent p-0"
                onClick={() => navigate('/dashboard')}
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Dashboard
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-blue-500 rounded-full flex items-center justify-center mx-auto mb-4">
            <Bot className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">Describe Your Workflow</h1>
          <p className="text-gray-400 text-lg">Tell our AI what you want your workflow to do</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Form - Expanded to 2/3 width */}
          <div className="lg:col-span-2">
            <Card className="bg-gray-900/60 border-gray-700/50 p-8 h-full">
              <div className="space-y-8 h-full flex flex-col">
                {/* Workflow Type Selection */}
                <div>
                  <label htmlFor="workflow-type" className="text-gray-300 text-lg font-medium mb-4 block">
                    Workflow Type
                  </label>
                  <select
                    id="workflow-type"
                    value={workflowType}
                    onChange={(e) => setWorkflowType(e.target.value)}
                    className="w-full bg-gray-800/50 border border-gray-600 text-white rounded-md px-4 py-3 text-lg focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  >
                    <option value="" className='bg-gray-800'>Select a workflow type</option>
                    {workflowTypes.map((type) => (
                      <option className='bg-gray-800' key={type.value} value={type.value}>
                        {type.label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Workflow Description */}
                <div className="flex-1 flex flex-col">
                  <label htmlFor="summary" className="text-gray-300 text-lg font-medium mb-4 block">
                    Workflow Description
                  </label>
                  <Textarea
                    id="summary"
                    placeholder="Describe your workflow in detail. For example: 'I want to automatically post my blog content to LinkedIn every Monday at 9 AM, and also send a summary email to my team with the post link and engagement metrics.'"
                    value={summary}
                    onChange={(e) => setSummary(e.target.value)}
                    className="bg-gray-800/50 border-gray-600 text-white placeholder-gray-400 focus:border-blue-500 flex-1 text-lg resize-none"
                    rows={12}
                  />
                </div>
              </div>
            </Card>

            {/* Generate Button */}
            <div className="text-center mt-8">
              <Button
                onClick={handleGenerateWorkflow}
                disabled={!summary.trim() || !workflowType || isGenerating}
                className="bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600 text-white px-16 py-6 text-lg font-semibold disabled:opacity-50 w-full max-w-md"
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

          {/* Sidebar - 1/3 width with full height */}
          <div className="lg:col-span-1">
            <Card className="bg-gray-900/60 border-gray-700/50 p-6 h-full">
              <h3 className="text-gray-300 font-semibold text-lg mb-6">How to get the best results</h3>
              <ul className="text-gray-400 space-y-4 text-sm">
                <li className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0" />
                  <span>Mention specific platforms and services you want to connect</span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0" />
                  <span>Include timing and frequency requirements</span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0" />
                  <span>Specify data sources and destinations</span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0" />
                  <span>Mention any conditions or filters needed</span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0" />
                  <span>Describe the expected output or result</span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0" />
                  <span>Include any specific triggers or events</span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0" />
                  <span>Specify data formats if important</span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0" />
                  <span>Mention error handling preferences</span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0" />
                  <span>Include any security or privacy requirements</span>
                </li>
              </ul>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}