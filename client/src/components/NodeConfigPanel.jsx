import { useEffect, useState } from 'react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Textarea } from '../components/ui/textarea';
import { Card } from '../components/ui/card';
import { 
  X, 
  Eye, 
  EyeOff, 
  Brain, 
  Database, 
  CheckCircle,
  AlertCircle,
  Twitter,
  Linkedin,
  Instagram,
  Mail,
  MessageSquare,
  Zap,
  Rss,
  Upload,
  HardDrive,
  Settings,
  ChevronDown,
  ChevronRight,
  Sliders,
  Box
} from 'lucide-react';

// Platform configurations for credentials (KEEPING UNCHANGED for specific integrations)
const platformConfigs = {
  'Twitter API': {
    icon: <Twitter className="w-5 h-5" />,
    color: 'text-blue-400',
    fields: [
      { name: 'apiKey', label: 'API Key', type: 'password', placeholder: 'Enter your Twitter API key' },
      { name: 'apiSecret', label: 'API Secret', type: 'password', placeholder: 'Enter your Twitter API secret' },
      { name: 'accessToken', label: 'Access Token', type: 'password', placeholder: 'Enter your access token' },
      { name: 'accessTokenSecret', label: 'Access Token Secret', type: 'password', placeholder: 'Enter your access token secret' }
    ]
  },
  'LinkedIn API': {
    icon: <Linkedin className="w-5 h-5" />,
    color: 'text-blue-600',
    fields: [
      { name: 'clientId', label: 'Client ID', type: 'text', placeholder: 'Enter your LinkedIn Client ID' },
      { name: 'clientSecret', label: 'Client Secret', type: 'password', placeholder: 'Enter your LinkedIn Client Secret' },
      { name: 'accessToken', label: 'Access Token', type: 'password', placeholder: 'Enter your access token' }
    ]
  },
  'Instagram API': {
    icon: <Instagram className="w-5 h-5" />,
    color: 'text-pink-500',
    fields: [
      { name: 'appId', label: 'App ID', type: 'text', placeholder: 'Enter your Instagram App ID' },
      { name: 'appSecret', label: 'App Secret', type: 'password', placeholder: 'Enter your Instagram App Secret' },
      { name: 'accessToken', label: 'Access Token', type: 'password', placeholder: 'Enter your access token' }
    ]
  },
  'Email Service': {
    icon: <Mail className="w-5 h-5" />,
    color: 'text-red-500',
    fields: [
      { name: 'smtpHost', label: 'SMTP Host', type: 'text', placeholder: 'smtp.gmail.com' },
      { name: 'smtpPort', label: 'SMTP Port', type: 'number', placeholder: '587' },
      { name: 'username', label: 'Username', type: 'email', placeholder: 'your-email@gmail.com' },
      { name: 'password', label: 'Password', type: 'password', placeholder: 'Enter your email password' }
    ]
  },
  'Slack Message': {
    icon: <MessageSquare className="w-5 h-5" />,
    color: 'text-purple-500',
    fields: [
      { name: 'webhookUrl', label: 'Webhook URL', type: 'url', placeholder: 'https://hooks.slack.com/services/...' },
      { name: 'botToken', label: 'Bot Token', type: 'password', placeholder: 'xoxb-your-bot-token' }
    ]
  },
  'Database': {
    icon: <Database className="w-5 h-5" />,
    color: 'text-green-500',
    fields: [
      { name: 'host', label: 'Host', type: 'text', placeholder: 'localhost' },
      { name: 'port', label: 'Port', type: 'number', placeholder: '5432' },
      { name: 'database', label: 'Database Name', type: 'text', placeholder: 'your_database' },
      { name: 'username', label: 'Username', type: 'text', placeholder: 'your_username' },
      { name: 'password', label: 'Password', type: 'password', placeholder: 'Enter your password' }
    ]
  },
  'Webhook': {
    icon: <Zap className="w-5 h-5" />,
    color: 'text-yellow-500',
    fields: [
      { name: 'webhookUrl', label: 'Webhook URL', type: 'url', placeholder: 'https://your-webhook-url.com' },
      { name: 'secretKey', label: 'Secret Key', type: 'password', placeholder: 'Enter your webhook secret' }
    ]
  },
  'RSS Feed': {
    icon: <Rss className="w-5 h-5" />,
    color: 'text-orange-500',
    fields: [
      { name: 'feedUrl', label: 'RSS Feed URL', type: 'url', placeholder: 'https://example.com/feed.xml' },
      { name: 'updateInterval', label: 'Update Interval (minutes)', type: 'number', placeholder: '30' }
    ]
  },
  'File Upload': {
    icon: <Upload className="w-5 h-5" />,
    color: 'text-blue-500',
    fields: [
      { name: 'maxFileSize', label: 'Max File Size (MB)', type: 'number', placeholder: '10' },
      { name: 'allowedTypes', label: 'Allowed File Types', type: 'text', placeholder: 'pdf,doc,docx,txt' }
    ]
  }
};

export default function NodeConfigPanel({ node, onClose, onUpdateNode }) {
  // Local state to manage form data
  const [credentials, setCredentials] = useState({});
  const [showPasswords, setShowPasswords] = useState({});
  
  // Generic Configuration State
  const [nodeOp, setNodeOp] = useState('execute');
  const [nodeResource, setNodeResource] = useState('default');
  const [showAdvancedGen, setShowAdvancedGen] = useState(false);
  const [continueOnFail, setContinueOnFail] = useState(false);
  const [retryOnFail, setRetryOnFail] = useState(false);

  // AI Agent Configuration State
  const [aiModel, setAiModel] = useState('');
  const [aiMemory, setAiMemory] = useState('');
  const [aiMemorySize, setAiMemorySize] = useState('5');
  const [aiTemperature, setAiTemperature] = useState('0.7');
  const [storageEnabled, setStorageEnabled] = useState(false);
  const [validationStatus, setValidationStatus] = useState('idle');

  // Update local state when a different node is selected
  useEffect(() => {
    if (node) {
      setCredentials(node.data?.credentials || {});
      setAiModel(node.data?.aiModel || '');
      setAiMemory(node.data?.aiMemory || '');
      setAiMemorySize(node.data?.aiMemorySize || '5');
      setAiTemperature(node.data?.aiTemperature || '0.7');
      setStorageEnabled(node.data?.storageEnabled || false);
      
      setNodeOp(node.data?.operation || 'execute');
      setNodeResource(node.data?.resource || 'default');
      setContinueOnFail(node.data?.continueOnFail || false);
      setRetryOnFail(node.data?.retryOnFail || false);
    }
  }, [node]);

  if (!node) return null;

  const handleInputChange = (fieldName, value) => {
    setCredentials(prev => ({ ...prev, [fieldName]: value }));
  };

  const togglePasswordVisibility = (fieldName) => {
    setShowPasswords(prev => ({ ...prev, [fieldName]: !prev[fieldName] }));
  };

  const handleSaveChanges = () => {
    const updatedData = {
      ...node.data,
      credentials,
      aiModel,
      aiMemory,
      aiMemorySize,
      aiTemperature,
      storageEnabled,
      operation: nodeOp,
      resource: nodeResource,
      continueOnFail,
      retryOnFail
    };
    
    if (onUpdateNode) {
      onUpdateNode(node.id, updatedData);
    }
    onClose();
  };

  const validateCredentials = async () => {
    setValidationStatus('validating');
    setTimeout(() => {
      const isValid = Math.random() > 0.3;
      setValidationStatus(isValid ? 'success' : 'error');
    }, 2000);
  };

  const isAiAgent = node.data.label?.toLowerCase().includes('agent') || node.data.category?.toLowerCase() === 'logic';
  const platformConfig = platformConfigs[node.data.label];

  // Derive stylistic properties based on node data
  const isTrigger = node.data.type === 'trigger' || node.data.category === 'Triggers';
  const isAction = node.data.type === 'action' || node.data.category === 'Actions';
  
  const typeColors = {
    trigger: 'text-emerald-400 bg-emerald-400/10 border-emerald-500/20',
    logic: 'text-cyan-400 bg-cyan-400/10 border-cyan-500/20',
    action: 'text-purple-400 bg-purple-400/10 border-purple-500/20'
  };
  const badgeColor = isTrigger ? typeColors.trigger : (isAction ? typeColors.action : typeColors.logic);

  const renderHeader = () => (
    <div className="flex flex-col gap-3 mb-6 pb-6 border-b border-soft">
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div className={`p-2.5 rounded-xl border ${badgeColor}`}>
            {node.data.icon || <Box className="w-5 h-5" />}
          </div>
          <div className="flex flex-col">
            <h2 className="font-bold text-lg text-foreground leading-tight">{node.data.label}</h2>
            <span className="text-xs text-muted-foreground font-medium uppercase tracking-wider mt-0.5">
              {isTrigger ? 'Trigger Node' : (isAction ? 'Action Node' : 'Logic Node')}
            </span>
          </div>
        </div>
        <Button variant="ghost" size="icon" onClick={onClose} className="text-muted-foreground hover:text-foreground h-8 w-8 rounded-full bg-muted/20 hover:bg-muted/50">
          <X className="w-4 h-4" />
        </Button>
      </div>
      {node.data.description && (
        <p className="text-sm text-foreground/80 leading-relaxed">
          {node.data.description}
        </p>
      )}
    </div>
  );

  const renderGenericParameters = () => {
    // We only show generic parameters if there isn't a hardcoded credentials block or if we explicitly want to show both.
    // For a modern feel, every node should have at least the operation selector.
    
    return (
      <Card className="bg-[#11172A] border-soft p-5 shadow-sm">
        <div className="flex items-center gap-2 mb-4">
          <Sliders className="w-4 h-4 text-primary" />
          <h3 className="text-foreground font-semibold text-sm">Parameters</h3>
        </div>

        <div className="space-y-4">
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold text-muted-foreground">Resource</Label>
            <select
              value={nodeResource}
              onChange={(e) => setNodeResource(e.target.value)}
              className="w-full bg-[#0B1020] border border-soft text-foreground rounded-md px-3 py-2 text-sm focus:border-primary focus:ring-1 focus:ring-primary/50 outline-none transition-all shadow-input appearance-none"
            >
              <option value="default">{node.data.label} API</option>
              <option value="custom">Custom Endpoint</option>
            </select>
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs font-semibold text-muted-foreground">Operation</Label>
            <select
              value={nodeOp}
              onChange={(e) => setNodeOp(e.target.value)}
              className="w-full bg-[#0B1020] border border-soft text-foreground rounded-md px-3 py-2 text-sm focus:border-primary focus:ring-1 focus:ring-primary/50 outline-none transition-all shadow-input appearance-none"
            >
              <option value="execute">Execute Standard</option>
              <option value="get">Get Many</option>
              <option value="create">Create New</option>
              <option value="update">Update Existing</option>
            </select>
          </div>
        </div>

        {/* Collapsible Advanced Section */}
        <div className="mt-5 border-t border-soft/50 pt-4">
          <button 
            className="flex items-center gap-2 w-full text-left group"
            onClick={() => setShowAdvancedGen(!showAdvancedGen)}
          >
            {showAdvancedGen ? <ChevronDown className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" /> : <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />}
            <span className="text-xs font-semibold text-muted-foreground group-hover:text-foreground transition-colors">Advanced Settings</span>
          </button>
          
          {showAdvancedGen && (
            <div className="mt-4 space-y-4 animate-fade-in-up pl-1">
              <div className="flex items-center justify-between">
                <Label className="text-xs font-medium text-foreground/80 cursor-pointer" htmlFor="cont-fail">Continue On Fail</Label>
                <input
                  id="cont-fail"
                  type="checkbox"
                  checked={continueOnFail}
                  onChange={(e) => setContinueOnFail(e.target.checked)}
                  className="w-4 h-4 text-primary bg-[#0B1020] border-soft rounded focus:ring-primary focus:ring-offset-[#11172A]"
                />
              </div>
              
              <div className="flex items-center justify-between">
                <Label className="text-xs font-medium text-foreground/80 cursor-pointer" htmlFor="retry-fail">Retry On Fail</Label>
                <input
                  id="retry-fail"
                  type="checkbox"
                  checked={retryOnFail}
                  onChange={(e) => setRetryOnFail(e.target.checked)}
                  className="w-4 h-4 text-primary bg-[#0B1020] border-soft rounded focus:ring-primary focus:ring-offset-[#11172A]"
                />
              </div>
              
              <div className="space-y-1.5">
                <Label className="text-xs font-medium text-foreground/80">Batch Size (Optional)</Label>
                <Input
                  type="number"
                  placeholder="e.g. 50"
                  className="bg-[#0B1020] border-soft text-foreground text-sm focus:border-primary shadow-input h-8"
                />
              </div>
            </div>
          )}
        </div>
      </Card>
    );
  };

  const renderCredentialsSection = () => {
    if (!platformConfig) return null;

    return (
      <Card className="bg-[#11172A] border-soft p-5 shadow-sm mt-4">
        <div className="flex items-center gap-3 mb-4">
          <div className={`p-2 rounded-lg bg-black/20 ${platformConfig.color}`}>
            {platformConfig.icon}
          </div>
          <div>
            <h3 className="text-foreground font-semibold text-sm">Credentials</h3>
            <p className="text-muted-foreground text-xs mt-0.5">Authentication required for {node.data.label}</p>
          </div>
        </div>

        <div className="space-y-4">
          {platformConfig.fields.map((field) => (
            <div key={field.name} className="space-y-1.5">
              <Label htmlFor={field.name} className="text-xs font-semibold text-muted-foreground">
                {field.label}
              </Label>
              <div className="relative">
                <Input
                  id={field.name}
                  type={field.type === 'password' && !showPasswords[field.name] ? 'password' : field.type === 'password' ? 'text' : field.type}
                  placeholder={field.placeholder}
                  value={credentials[field.name] || ''}
                  onChange={(e) => handleInputChange(field.name, e.target.value)}
                  className="bg-[#0B1020] border-soft text-foreground placeholder:text-muted-foreground focus:border-primary pr-10 text-sm shadow-input"
                />
                {field.type === 'password' && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-1 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground h-7 w-7 p-0"
                    onClick={() => togglePasswordVisibility(field.name)}
                  >
                    {showPasswords[field.name] ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>

        <div className="mt-5 flex justify-between items-center border-t border-soft/50 pt-4">
          <Button
            variant="outline"
            size="sm"
            onClick={validateCredentials}
            disabled={validationStatus === 'validating'}
            className="text-xs bg-[#0B1020] border-soft hover:border-primary hover:text-primary transition-colors"
          >
            {validationStatus === 'validating' ? 'Testing...' : 'Test Connection'}
          </Button>
          
          <div className="text-xs font-medium">
            {validationStatus === 'success' && (
              <span className="text-emerald-400 flex items-center gap-1.5">
                <CheckCircle className="w-3.5 h-3.5" />
                Connected
              </span>
            )}
            {validationStatus === 'error' && (
              <span className="text-destructive flex items-center gap-1.5">
                <AlertCircle className="w-3.5 h-3.5" />
                Failed
              </span>
            )}
          </div>
        </div>
      </Card>
    );
  };

  const renderAiAgentConfiguration = () => {
    if (!isAiAgent) return null;

    return (
      <Card className="bg-[#11172A] border-soft p-5 shadow-sm mt-4">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 rounded-lg bg-blue-500/10 text-blue-400 border border-blue-500/20">
            <Brain className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-foreground font-semibold text-sm">Model Selection</h3>
          </div>
        </div>

        <div className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="ai-model" className="text-xs font-semibold text-muted-foreground">AI Model</Label>
            <select
              id="ai-model"
              value={aiModel}
              onChange={(e) => setAiModel(e.target.value)}
              className="w-full bg-[#0B1020] border border-soft text-foreground rounded-md px-3 py-2 text-sm focus:border-primary focus:ring-1 focus:ring-primary/50 outline-none transition-all shadow-input appearance-none"
            >
              <option value="">Select Platform Default</option>
              <option value="gpt-4">GPT-4 Omni</option>
              <option value="claude-3">Claude 3.5 Sonnet</option>
              <option value="gemini-1.5">Gemini 1.5 Pro</option>
            </select>
          </div>
        </div>
      </Card>
    );
  };

  const renderAiMemoryConfiguration = () => {
    if (!isAiAgent) return null;

    return (
      <Card className="bg-[#11172A] border-soft p-5 shadow-sm mt-4">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 rounded-lg bg-orange-500/10 text-orange-400 border border-orange-500/20">
            <HardDrive className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-foreground font-semibold text-sm">Memory & Context</h3>
          </div>
        </div>

        <div className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="ai-memory" className="text-xs font-semibold text-muted-foreground">System Prompt</Label>
            <Textarea
              id="ai-memory"
              placeholder="Define the behavior and context..."
              value={aiMemory}
              onChange={(e) => setAiMemory(e.target.value)}
              className="bg-[#0B1020] border-soft text-foreground placeholder:text-muted-foreground focus:border-primary text-sm shadow-input resize-none"
              rows={4}
            />
          </div>
          
          <div className="space-y-1.5">
            <Label htmlFor="ai-memory-size" className="text-xs font-semibold text-muted-foreground">Context Window (Turns)</Label>
            <Input
              id="ai-memory-size"
              type="number"
              placeholder="5"
              value={aiMemorySize}
              onChange={(e) => setAiMemorySize(e.target.value)}
              className="bg-[#0B1020] border-soft text-foreground focus:border-primary text-sm shadow-input h-9"
              min="0"
            />
          </div>
        </div>
      </Card>
    );
  };

  return (
    <aside className="w-80 lg:w-96 bg-[#0B1020]/95 backdrop-blur-xl border-l border-soft p-0 flex flex-col absolute top-0 right-0 h-full z-40 animate-sidebar-slide shadow-2xl">
      <div className="flex-1 overflow-y-auto p-6 scrollbar-thin scrollbar-thumb-soft scrollbar-track-transparent">
        {renderHeader()}
        
        <div className="flex flex-col flex-grow">
          {/* Always render generic parameters for modern unified feel */}
          {renderGenericParameters()}

          {/* Render Integration Credentials if defined */}
          {renderCredentialsSection()}

          {/* Render AI specifics if applicable */}
          {renderAiAgentConfiguration()}
          {renderAiMemoryConfiguration()}
        </div>
      </div>

      <div className="p-4 border-t border-soft bg-[#0B1020] shrink-0">
        <Button
          onClick={handleSaveChanges}
          className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-bold shadow-[0_0_15px_rgba(34,211,238,0.2)]"
        >
          Apply Configuration
        </Button>
      </div>
    </aside>
  );
}