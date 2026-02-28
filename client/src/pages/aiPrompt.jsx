import { useState, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { Textarea } from '../components/ui/textarea';
import { toast } from 'sonner';
import {
  ArrowLeft,
  ArrowRight,
  LayoutDashboard,
  Brain,
  Briefcase,
  Sparkles,
  Zap,
  AlertCircle,
  Clock,
  Server,
  Lock,
  Lightbulb
} from 'lucide-react';
import { nlpAPI } from '../services/api';
import NoBrainLogo from '../components/NoBrainLogo';

export default function AISummaryPage() {
  const navigate = useNavigate();
  const [summary, setSummary] = useState('');
  const [workflowType, setWorkflowType] = useState('');
  const [selectedPlatform, setSelectedPlatform] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState('');
  const [retryAfter, setRetryAfter] = useState(0);

  // Debounce ref to prevent rapid clicks
  const lastRequestTime = useRef(0);
  const DEBOUNCE_MS = 2000;

  const handlePlatformChange = (platformValue) => {
    // If user changes platform after generating, clear workflow state
    if (selectedPlatform && selectedPlatform !== platformValue) {
      setSummary('');
      setError('');
    }
    setSelectedPlatform(platformValue);
  };

  const handleGenerateWorkflow = useCallback(async () => {
    if (!summary.trim() || !workflowType || !selectedPlatform) return;

    // Debounce check
    const now = Date.now();
    if (now - lastRequestTime.current < DEBOUNCE_MS) {
      toast.warning('Please wait before generating another workflow');
      return;
    }
    lastRequestTime.current = now;

    setIsGenerating(true);
    setError('');
    setRetryAfter(0);

    try {
      console.log(`🚀 Starting AI workflow generation for platform: ${selectedPlatform}`);

      // Call the AI API with platform constraint
      const response = await nlpAPI.generateWorkflow(summary, 'openai/gpt-oss-20b', selectedPlatform);

      console.log('✅ AI Response:', response);

      if (response && response.success && response.data && response.data.workflow) {
        const generatedWorkflow = response.data.workflow;

        // Check if this is a fallback workflow
        if (response.data.warning) {
          toast.warning(response.data.warning);
        }

        console.log('📊 Generated workflow:', {
          nodes: generatedWorkflow.nodes?.length || 0,
          edges: generatedWorkflow.edges?.length || 0,
          platform: response.data.platform,
          metadata: generatedWorkflow.metadata
        });

        // Navigate to workflow editor with platform info
        navigate('/workflow', {
          state: {
            fromAIGeneration: true,
            aiGeneratedWorkflow: generatedWorkflow,
            prompt: summary,
            workflowType: workflowType,
            platform: selectedPlatform
          }
        });

        toast.success(`Workflow generated for ${selectedPlatform.toUpperCase()}! Let's customize it.`);
      } else if (response && !response.success) {
        // Handle validation errors (hallucinated nodes, etc.)
        const errorMsg = response.data?.error || response.message || 'Failed to generate workflow';
        const invalidNodes = response.data?.invalidNodes;
        if (invalidNodes && invalidNodes.length > 0) {
          setError(`${errorMsg}\n\nInvalid nodes: ${invalidNodes.join(', ')}`);
        } else {
          setError(errorMsg);
        }
        toast.error(errorMsg);
      } else {
        throw new Error(response?.error || 'Failed to generate workflow');
      }
    } catch (err) {
      console.error('❌ Error generating workflow:', err);

      if (err.response?.status === 429) {
        const retrySeconds = err.response?.data?.retryAfter || 60;
        setRetryAfter(retrySeconds);
        setError(`Rate limit reached. Please wait ${retrySeconds} seconds before trying again.`);
        toast.error(`Rate limit reached. Please wait ${retrySeconds} seconds.`);

        const countdownInterval = setInterval(() => {
          setRetryAfter(prev => {
            if (prev <= 1) {
              clearInterval(countdownInterval);
              return 0;
            }
            return prev - 1;
          });
        }, 1000);
      } else if (err.response?.status === 400) {
        const msg = err.response?.data?.message || 'Invalid request. Please check your inputs.';
        setError(msg);
        toast.error(msg);
      } else if (err.response?.status === 503) {
        const msg = err.response?.data?.message || 'Platform catalog temporarily unavailable. Please try again later.';
        setError(msg);
        toast.error(msg);
      } else {
        const errorMessage = err.response?.data?.message || err.message || 'Failed to generate workflow. Please try again.';
        setError(errorMessage);
        toast.error(errorMessage);
      }
    } finally {
      setIsGenerating(false);
    }
  }, [summary, workflowType, selectedPlatform, navigate]);

  const platforms = [
    {
      value: 'n8n',
      label: 'n8n',
      description: 'Open-source workflow automation',
      enabled: true,
      icon: <Server className="w-5 h-5" />
    },
    {
      value: 'zapier',
      label: 'Zapier',
      description: 'Coming soon',
      enabled: false,
      icon: <Zap className="w-5 h-5" />
    },
    {
      value: 'make',
      label: 'Make',
      description: 'Coming soon',
      enabled: false,
      icon: <Sparkles className="w-5 h-5" />
    }
  ];

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

  const tips = [
    'Mention specific platforms and services you want to connect',
    'Include timing and frequency requirements',
    'Specify data sources and destinations',
    'Mention any conditions or filters needed',
    'Describe the expected output or result',
    'Include any specific triggers or events',
    'Specify data formats if important',
    'Mention error handling preferences',
    'Include any security or privacy requirements'
  ];

  return (
    <div className="min-h-screen flex flex-col bg-[#0B1020] text-foreground overflow-x-hidden relative">
      {/* Grid overlay */}
      <div className="fixed inset-0 pointer-events-none bg-[linear-gradient(rgba(34,211,238,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(34,211,238,0.03)_1px,transparent_1px)] bg-[size:40px_40px] z-0" />

      {/* Header */}
      <header className="relative z-30 pt-4 flex-shrink-0">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <NoBrainLogo />
            </div>

            <Button
              className="bg-gradient-to-r from-[#22D3EE] to-[#A78BFA] hover:brightness-110 text-white shadow-lg shadow-[rgba(34,211,238,0.2)]"
              onClick={() => navigate('/dashboard')}
            >
              <LayoutDashboard className="w-4 h-4 mr-2" />
              Back to Dashboard
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 flex flex-col items-center justify-start px-4 sm:px-6 lg:px-8 pt-8 pb-12 overflow-y-auto overflow-x-hidden relative z-10">
        {/* Hero Section */}
        <div className="text-center mb-10 relative z-10">
          <div className="w-16 h-16 rounded-3xl bg-gradient-to-br from-[rgba(34,211,238,0.15)] to-[rgba(167,139,250,0.15)] border border-[rgba(255,255,255,0.1)] flex items-center justify-center mx-auto mb-6 shadow-[0_0_40px_rgba(34,211,238,0.2)] relative">
            <div className="absolute inset-1.5 rounded-2xl border border-dashed border-white/10" />
            <Sparkles className="w-7 h-7 text-cyan-400 drop-shadow-[0_0_10px_rgba(34,211,238,0.5)]" />
          </div>
          <h1 className="text-4xl md:text-5xl font-extrabold text-white mb-3 tracking-tight" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
            Describe Your Workflow
          </h1>
          <p className="text-[#B6C2D9] text-lg max-w-xl mx-auto">
            Select a platform, then tell our AI what you want your workflow to do
          </p>
        </div>

        {/* Main Content Grid */}
        <div className="w-full max-w-6xl grid grid-cols-1 lg:grid-cols-3 gap-8 relative z-10">
          {/* Left Panel - Form */}
          <div className="lg:col-span-2">
            <div className="bg-[#11172A]/60 backdrop-blur-xl border border-[rgba(255,255,255,0.06)] rounded-3xl p-8 lg:p-10 shadow-[0_8px_32px_rgba(0,0,0,0.5)] relative overflow-hidden group">
              {/* Radial glow accent */}
              <div className="absolute top-0 right-0 w-96 h-96 bg-[radial-gradient(circle,rgba(34,211,238,0.05)_0%,transparent_70%)] pointer-events-none" />
              {/* Animated gradient bottom border */}
              <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-cyan-500 via-violet-500 to-cyan-500 bg-[length:200%_auto] animate-gradient opacity-50 group-hover:opacity-100 transition-opacity" />
              {/* Error Alert */}
              {error && (
                <div className="mb-6 p-4 bg-red-900/30 border border-red-500/50 rounded-xl flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-red-300 font-medium text-sm">Generation Error</p>
                    <p className="text-red-200/80 text-xs mt-1 whitespace-pre-line">{error}</p>
                    {retryAfter > 0 && (
                      <div className="mt-2 flex items-center gap-2 text-yellow-400 text-xs">
                        <Clock className="w-4 h-4" />
                        <span>You can retry in {retryAfter} seconds</span>
                      </div>
                    )}
                    <div className="mt-3">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => { setError(''); setRetryAfter(0); }}
                        className="text-red-200 border-red-700/50 hover:bg-red-900/30 text-xs"
                      >
                        Dismiss
                      </Button>
                    </div>
                  </div>
                </div>
              )}

              {/* ── Phase-2: Platform Selection ── */}
              <div className="mb-6">
                <label className="text-gray-200 font-semibold mb-3 block text-lg">
                  Target Platform <span className="text-red-400">*</span>
                </label>
                <div className="grid grid-cols-3 gap-3">
                  {platforms.map((p) => (
                    <button
                      key={p.value}
                      onClick={() => p.enabled && handlePlatformChange(p.value)}
                      disabled={!p.enabled}
                      className={`relative flex flex-col items-center gap-2 p-5 rounded-2xl border transition-all duration-300 ${selectedPlatform === p.value
                        ? 'border-cyan-500/50 bg-[#11172A]/90 shadow-[0_0_20px_rgba(34,211,238,0.15)] -translate-y-1'
                        : p.enabled
                          ? 'border-[rgba(255,255,255,0.06)] bg-[#11172A]/40 hover:border-white/15 hover:bg-[#11172A]/60 hover:-translate-y-1 hover:shadow-[0_8px_24px_rgba(0,0,0,0.4)] cursor-pointer'
                          : 'border-[rgba(255,255,255,0.03)] bg-[#0B1020]/30 opacity-40 cursor-not-allowed'
                        }`}
                    >
                      {!p.enabled && (
                        <div className="absolute top-2 right-2">
                          <Lock className="w-3 h-3 text-gray-600" />
                        </div>
                      )}
                      <div className={`${selectedPlatform === p.value ? 'text-cyan-400' : 'text-gray-400'}`}>
                        {p.icon}
                      </div>
                      <span className={`font-semibold text-sm ${selectedPlatform === p.value ? 'text-white' : 'text-gray-300'}`}>
                        {p.label}
                      </span>
                      <span className="text-xs text-gray-500">{p.description}</span>
                    </button>
                  ))}
                </div>
                {!selectedPlatform && (
                  <p className="text-yellow-500/70 text-xs mt-2 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" />
                    Please select a platform before generating
                  </p>
                )}
              </div>

              {/* Workflow Type Selection */}
              <div className="mb-6">
                <label htmlFor="workflow-type" className="text-gray-200 font-semibold mb-3 block text-lg">
                  Workflow Type
                </label>
                <select
                  id="workflow-type"
                  value={workflowType}
                  onChange={(e) => setWorkflowType(e.target.value)}
                  className="w-full bg-[#0E1425]/80 border border-[rgba(255,255,255,0.06)] text-[#F3F6FF] rounded-xl px-4 py-4 text-base focus:border-cyan-500/50 focus:outline-none focus:ring-1 focus:ring-cyan-500/50 transition-all cursor-pointer appearance-none backdrop-blur-md"
                  style={{
                    backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%237E8BA3' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`,
                    backgroundPosition: 'right 1rem center',
                    backgroundRepeat: 'no-repeat',
                    backgroundSize: '1.2em 1.2em',
                    paddingRight: '3rem'
                  }}
                >
                  <option value="" className='bg-[#0B1020]'>Select a workflow type</option>
                  {workflowTypes.map((type) => (
                    <option className='bg-[#0B1020]' key={type.value} value={type.value}>
                      {type.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Workflow Description */}
              <div className="mb-8">
                <label htmlFor="summary" className="text-gray-200 font-semibold mb-3 block text-lg">
                  Workflow Description
                </label>
                <Textarea
                  id="summary"
                  placeholder={selectedPlatform
                    ? `Describe your ${selectedPlatform.toUpperCase()} workflow. For example: 'When a new row is added in Google Sheets, send a Slack notification to my team with the row data.'`
                    : "Select a platform first, then describe your workflow here..."
                  }
                  value={summary}
                  onChange={(e) => setSummary(e.target.value)}
                  disabled={!selectedPlatform}
                  className="bg-[#0E1425]/80 border-[rgba(255,255,255,0.06)] text-white placeholder-[#7E8BA3] focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/50 text-base resize-none rounded-xl min-h-[200px] disabled:opacity-40 disabled:cursor-not-allowed backdrop-blur-md"
                  rows={8}
                />
              </div>

              {/* Generate Button */}
              <div className="text-center">
                <Button
                  onClick={handleGenerateWorkflow}
                  disabled={!summary.trim() || !workflowType || !selectedPlatform || isGenerating || retryAfter > 0}
                  className="bg-gradient-to-r from-[#22D3EE] to-[#A78BFA] hover:brightness-110 text-white px-10 py-6 text-lg font-semibold disabled:opacity-40 disabled:cursor-not-allowed rounded-xl shadow-[0_0_24px_rgba(34,211,238,0.2)] transition-all duration-300 hover:shadow-[0_0_30px_rgba(34,211,238,0.35)] hover:scale-[1.02]"
                >
                  {isGenerating ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-3" />
                      AI is generating...
                    </>
                  ) : (
                    <>
                      {selectedPlatform
                        ? `Generate for ${selectedPlatform.toUpperCase()}`
                        : 'Generate Workflow'
                      }
                      <ArrowRight className="w-5 h-5 ml-3" />
                    </>
                  )}
                </Button>

                {isGenerating && (
                  <div className="mt-4 text-gray-400 text-sm">
                    <div className="flex items-center justify-center gap-2">
                      <Zap className="w-4 h-4 text-cyan-400 animate-pulse" />
                      <span>Analyzing your requirements using {selectedPlatform.toUpperCase()} node catalog...</span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right Panel - Tips */}
          <div className="lg:col-span-1 relative z-10">
            <div className="bg-[#11172A]/40 backdrop-blur-xl border border-[rgba(255,255,255,0.06)] rounded-3xl p-6 lg:p-8 shadow-[0_8px_32px_rgba(0,0,0,0.3)] hover:border-white/10 hover:shadow-[0_8px_40px_rgba(0,0,0,0.4)] transition-all duration-300">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 rounded-lg bg-cyan-500/10 border border-cyan-500/20 shrink-0">
                  <Lightbulb className="w-5 h-5 text-cyan-400" />
                </div>
                <h3 className="text-white font-semibold text-lg" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
                  Best Practices
                </h3>
              </div>
              <ul className="space-y-4">
                {tips.map((tip, index) => (
                  <li key={index} className="flex items-start gap-3 text-[#B6C2D9] text-sm hover:text-white transition-colors">
                    <div className="w-1.5 h-1.5 bg-cyan-400 rounded-full mt-2 flex-shrink-0" />
                    <span className="leading-relaxed">{tip}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Platform Info */}
            {selectedPlatform && (
              <div className="mt-8 p-4 bg-cyan-900/20 border border-cyan-500/20 rounded-xl">
                <div className="flex items-center gap-2 mb-2">
                  <Server className="w-4 h-4 text-cyan-400" />
                  <span className="text-cyan-300 font-semibold text-sm">Platform: {selectedPlatform.toUpperCase()}</span>
                </div>
                <p className="text-gray-400 text-xs">
                  AI will only use nodes available in the {selectedPlatform} platform catalog.
                  This ensures your workflow is realistic and implementable.
                </p>
              </div>
            )}

            {/* Decorative Star */}
            <div className="mt-12 flex justify-end">
              <Sparkles className="w-10 h-10 text-purple-400/60" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}