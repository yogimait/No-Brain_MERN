// import { useEffect, useState } from 'react';
// import { Button } from '../components/ui/button';
// import { Input } from '../components/ui/input';
// import { Label } from '../components/ui/label';
// import { Textarea } from '../components/ui/textarea';
// import { Card } from '../components/ui/card';
// import { 
//   X, 
//   Eye, 
//   EyeOff, 
//   Brain, 
//   Database, 
//   CheckCircle,
//   AlertCircle,
//   Twitter,
//   Linkedin,
//   Instagram,
//   Mail,
//   MessageSquare,
//   Zap,
//   Rss,
//   Upload
// } from 'lucide-react';

// // Platform configurations for credentials
// const platformConfigs = {
//   'Twitter API': {
//     icon: <Twitter className="w-5 h-5" />,
//     color: 'text-blue-400',
//     fields: [
//       { name: 'apiKey', label: 'API Key', type: 'password', placeholder: 'Enter your Twitter API key' },
//       { name: 'apiSecret', label: 'API Secret', type: 'password', placeholder: 'Enter your Twitter API secret' },
//       { name: 'accessToken', label: 'Access Token', type: 'password', placeholder: 'Enter your access token' },
//       { name: 'accessTokenSecret', label: 'Access Token Secret', type: 'password', placeholder: 'Enter your access token secret' }
//     ]
//   },
//   'LinkedIn API': {
//     icon: <Linkedin className="w-5 h-5" />,
//     color: 'text-blue-600',
//     fields: [
//       { name: 'clientId', label: 'Client ID', type: 'text', placeholder: 'Enter your LinkedIn Client ID' },
//       { name: 'clientSecret', label: 'Client Secret', type: 'password', placeholder: 'Enter your LinkedIn Client Secret' },
//       { name: 'accessToken', label: 'Access Token', type: 'password', placeholder: 'Enter your access token' }
//     ]
//   },
//   'Instagram API': {
//     icon: <Instagram className="w-5 h-5" />,
//     color: 'text-pink-500',
//     fields: [
//       { name: 'appId', label: 'App ID', type: 'text', placeholder: 'Enter your Instagram App ID' },
//       { name: 'appSecret', label: 'App Secret', type: 'password', placeholder: 'Enter your Instagram App Secret' },
//       { name: 'accessToken', label: 'Access Token', type: 'password', placeholder: 'Enter your access token' }
//     ]
//   },
//   'Email Service': {
//     icon: <Mail className="w-5 h-5" />,
//     color: 'text-red-500',
//     fields: [
//       { name: 'smtpHost', label: 'SMTP Host', type: 'text', placeholder: 'smtp.gmail.com' },
//       { name: 'smtpPort', label: 'SMTP Port', type: 'number', placeholder: '587' },
//       { name: 'username', label: 'Username', type: 'email', placeholder: 'your-email@gmail.com' },
//       { name: 'password', label: 'Password', type: 'password', placeholder: 'Enter your email password' }
//     ]
//   },
//   'Slack Message': {
//     icon: <MessageSquare className="w-5 h-5" />,
//     color: 'text-purple-500',
//     fields: [
//       { name: 'webhookUrl', label: 'Webhook URL', type: 'url', placeholder: 'https://hooks.slack.com/services/...' },
//       { name: 'botToken', label: 'Bot Token', type: 'password', placeholder: 'xoxb-your-bot-token' }
//     ]
//   },
//   'Database': {
//     icon: <Database className="w-5 h-5" />,
//     color: 'text-green-500',
//     fields: [
//       { name: 'host', label: 'Host', type: 'text', placeholder: 'localhost' },
//       { name: 'port', label: 'Port', type: 'number', placeholder: '5432' },
//       { name: 'database', label: 'Database Name', type: 'text', placeholder: 'your_database' },
//       { name: 'username', label: 'Username', type: 'text', placeholder: 'your_username' },
//       { name: 'password', label: 'Password', type: 'password', placeholder: 'Enter your password' }
//     ]
//   },
//   'Webhook': {
//     icon: <Zap className="w-5 h-5" />,
//     color: 'text-yellow-500',
//     fields: [
//       { name: 'webhookUrl', label: 'Webhook URL', type: 'url', placeholder: 'https://your-webhook-url.com' },
//       { name: 'secretKey', label: 'Secret Key', type: 'password', placeholder: 'Enter your webhook secret' }
//     ]
//   },
//   'RSS Feed': {
//     icon: <Rss className="w-5 h-5" />,
//     color: 'text-orange-500',
//     fields: [
//       { name: 'feedUrl', label: 'RSS Feed URL', type: 'url', placeholder: 'https://example.com/feed.xml' },
//       { name: 'updateInterval', label: 'Update Interval (minutes)', type: 'number', placeholder: '30' }
//     ]
//   },
//   'File Upload': {
//     icon: <Upload className="w-5 h-5" />,
//     color: 'text-blue-500',
//     fields: [
//       { name: 'maxFileSize', label: 'Max File Size (MB)', type: 'number', placeholder: '10' },
//       { name: 'allowedTypes', label: 'Allowed File Types', type: 'text', placeholder: 'pdf,doc,docx,txt' }
//     ]
//   }
// };

// export default function NodeConfigPanel({ node, onClose, onUpdateNode }) {
//   // Local state to manage form data
//   const [credentials, setCredentials] = useState({});
//   const [showPasswords, setShowPasswords] = useState({});
//   const [aiModel, setAiModel] = useState('');
//   const [aiMemory, setAiMemory] = useState('');
//   const [storageEnabled, setStorageEnabled] = useState(false);
//   const [validationStatus, setValidationStatus] = useState('idle');

//   // Update local state when a different node is selected
//   useEffect(() => {
//     if (node) {
//       setCredentials(node.data?.credentials || {});
//       setAiModel(node.data?.aiModel || '');
//       setAiMemory(node.data?.aiMemory || '');
//       setStorageEnabled(node.data?.storageEnabled || false);
//     }
//   }, [node]);

//   if (!node) {
//     return null;
//   }

//   const handleInputChange = (fieldName, value) => {
//     setCredentials(prev => ({ ...prev, [fieldName]: value }));
//   };

//   const togglePasswordVisibility = (fieldName) => {
//     setShowPasswords(prev => ({ ...prev, [fieldName]: !prev[fieldName] }));
//   };

//   const handleSaveChanges = () => {
//     const updatedData = {
//       ...node.data,
//       credentials,
//       aiModel,
//       aiMemory,
//       storageEnabled
//     };
    
//     if (onUpdateNode) {
//       onUpdateNode(node.id, updatedData);
//     }
    
//     console.log('Saving changes:', updatedData);
//     onClose();
//   };

//   const validateCredentials = async () => {
//     setValidationStatus('validating');
    
//     // Simulate API validation
//     setTimeout(() => {
//       const isValid = Math.random() > 0.3; // 70% success rate for demo
//       setValidationStatus(isValid ? 'success' : 'error');
//     }, 2000);
//   };

//   const isAiAgent = node.data.label?.includes('Agent');
//   const platformConfig = platformConfigs[node.data.label];

//   const renderCredentialsSection = () => {
//     if (!platformConfig) return null;

//     return (
//       <Card className="bg-gray-800/50 border-gray-600 p-4">
//         <div className="flex items-center gap-3 mb-4">
//           <div className={`p-2 rounded-lg bg-gray-700/50 ${platformConfig.color}`}>
//             {platformConfig.icon}
//           </div>
//           <div>
//             <h3 className="text-white font-semibold text-sm">Credentials</h3>
//             <p className="text-gray-400 text-xs">Configure your {node.data.label} credentials</p>
//           </div>
//         </div>

//         <div className="space-y-3">
//           {platformConfig.fields.map((field) => (
//             <div key={field.name} className="space-y-1">
//               <Label htmlFor={field.name} className="text-gray-300 text-xs font-medium">
//                 {field.label}
//               </Label>
//               <div className="relative">
//                 <Input
//                   id={field.name}
//                   type={field.type === 'password' && !showPasswords[field.name] ? 'password' : field.type === 'password' ? 'text' : field.type}
//                   placeholder={field.placeholder}
//                   value={credentials[field.name] || ''}
//                   onChange={(e) => handleInputChange(field.name, e.target.value)}
//                   className="bg-gray-700/50 border-gray-600 text-white placeholder-gray-400 focus:border-blue-500 pr-10 text-sm"
//                 />
//                 {field.type === 'password' && (
//                   <Button
//                     type="button"
//                     variant="ghost"
//                     size="sm"
//                     className="absolute right-1 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white h-6 w-6 p-0"
//                     onClick={() => togglePasswordVisibility(field.name)}
//                   >
//                     {showPasswords[field.name] ? (
//                       <EyeOff className="w-3 h-3" />
//                     ) : (
//                       <Eye className="w-3 h-3" />
//                     )}
//                   </Button>
//                 )}
//               </div>
//             </div>
//           ))}
//         </div>

//         <div className="mt-4 flex justify-between items-center">
//           <Button
//             variant="outline"
//             size="sm"
//             onClick={validateCredentials}
//             disabled={validationStatus === 'validating'}
//             className="text-gray-300 border-gray-600 hover:border-blue-500 hover:text-blue-300 text-xs"
//           >
//             {validationStatus === 'validating' ? 'Testing...' : 'Test Connection'}
//           </Button>
          
//           <div className="text-xs">
//             {validationStatus === 'success' && (
//               <span className="text-green-400 flex items-center gap-1">
//                 <CheckCircle className="w-3 h-3" />
//                 Connected
//               </span>
//             )}
//             {validationStatus === 'error' && (
//               <span className="text-red-400 flex items-center gap-1">
//                 <AlertCircle className="w-3 h-3" />
//                 Failed
//               </span>
//             )}
//           </div>
//         </div>
//       </Card>
//     );
//   };

//   const renderAiAgentConfiguration = () => {
//     if (!isAiAgent) return null;

//     return (
//       <Card className="bg-gray-800/50 border-gray-600 p-4">
//         <div className="flex items-center gap-3 mb-4">
//           <div className="p-2 rounded-lg bg-gray-700/50 text-blue-400">
//             <Brain className="w-5 h-5" />
//           </div>
//           <div>
//             <h3 className="text-white font-semibold text-sm">AI Agent Configuration</h3>
//             <p className="text-gray-400 text-xs">Configure your AI agent settings</p>
//           </div>
//         </div>

//         <div className="space-y-4">
//           {/* AI Model Selection */}
//           <div className="space-y-2">
//             <Label htmlFor="ai-model" className="text-gray-300 text-xs font-medium">AI Model</Label>
//             <select
//               id="ai-model"
//               value={aiModel}
//               onChange={(e) => setAiModel(e.target.value)}
//               className="w-full bg-gray-700/50 border border-gray-600 text-white rounded-md px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
//             >
//               <option value="">Select AI Model</option>
//               <option value="gpt-4">GPT-4</option>
//               <option value="gpt-3.5-turbo">GPT-3.5 Turbo</option>
//               <option value="claude-3">Claude 3</option>
//               <option value="claude-2">Claude 2</option>
//               <option value="gemini-pro">Gemini Pro</option>
//               <option value="dall-e-3">DALL-E 3</option>
//             </select>
//           </div>

//           {/* AI Memory/Context */}
//           <div className="space-y-2">
//             <Label htmlFor="ai-memory" className="text-gray-300 text-xs font-medium">Work Context</Label>
//             <Textarea
//               id="ai-memory"
//               placeholder="Define the work context and memory for this AI agent..."
//               value={aiMemory}
//               onChange={(e) => setAiMemory(e.target.value)}
//               className="bg-gray-700/50 border-gray-600 text-white placeholder-gray-400 focus:border-blue-500 text-sm"
//               rows={3}
//             />
//           </div>

//           {/* Storage Option */}
//           <div className="space-y-2">
//             <div className="flex items-center justify-between">
//               <div className="flex items-center gap-2">
//                 <Database className="w-4 h-4 text-green-400" />
//                 <Label htmlFor="storage-enabled" className="text-gray-300 text-xs font-medium">Save Response in DB</Label>
//               </div>
//               <input
//                 id="storage-enabled"
//                 type="checkbox"
//                 checked={storageEnabled}
//                 onChange={(e) => setStorageEnabled(e.target.checked)}
//                 className="w-4 h-4 text-blue-600 bg-gray-700 border-gray-600 rounded focus:ring-blue-500"
//               />
//             </div>
//             <p className="text-gray-500 text-xs">Enable to save AI responses to database for future reference</p>
//           </div>
//         </div>
//       </Card>
//     );
//   };

//   return (
//     <aside className="w-96 bg-gray-900/60 backdrop-blur-sm border-l border-gray-800 p-6 flex flex-col gap-6 absolute top-0 right-0 h-full z-10 overflow-y-auto">
//       <div className="flex justify-between items-center">
//         <h2 className="font-bold text-xl text-blue-300">
//           Configure Node
//         </h2>
//         <Button variant="ghost" size="icon" onClick={onClose} className="text-gray-400 hover:text-white">
//           <X size={20} />
//         </Button>
//       </div>
      
//       <div className="flex flex-col gap-5 flex-grow">
//         <div className="grid w-full items-center gap-2">
//           <Label htmlFor="node-type" className="text-gray-300 text-sm font-medium">Node Type</Label>
//           <Input
//             id="node-type"
//             type="text"
//             value={node.data.label}
//             readOnly
//             className="bg-gray-800 border-gray-700 cursor-not-allowed text-sm"
//           />
//         </div>

//         {/* Render AI Agent Configuration */}
//         {renderAiAgentConfiguration()}

//         {/* Render Credentials Section */}
//         {renderCredentialsSection()}
//       </div>

//       <Button
//         onClick={handleSaveChanges}
//         className="bg-blue-600 hover:bg-blue-700 w-full text-white font-semibold"
//         style={{ filter: 'drop-shadow(0 0 8px rgba(59, 130, 246, 0.6))' }}
//       >
//         Save Changes
//       </Button>
//     </aside>
//   );
// }



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
  HardDrive, // New icon for Memory
  Settings // New icon for Advanced Settings
} from 'lucide-react';

// Platform configurations for credentials (KEEPING THIS UNCHANGED)
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
  const [aiModel, setAiModel] = useState('');
  const [aiMemory, setAiMemory] = useState('');
  const [aiMemorySize, setAiMemorySize] = useState('5'); // New state for memory size
  const [aiTemperature, setAiTemperature] = useState('0.7'); // New state for AI Temperature
  const [storageEnabled, setStorageEnabled] = useState(false);
  const [validationStatus, setValidationStatus] = useState('idle');

  // Update local state when a different node is selected
  useEffect(() => {
    if (node) {
      setCredentials(node.data?.credentials || {});
      setAiModel(node.data?.aiModel || '');
      setAiMemory(node.data?.aiMemory || '');
      setAiMemorySize(node.data?.aiMemorySize || '5'); // Initialize new state
      setAiTemperature(node.data?.aiTemperature || '0.7'); // Initialize new state
      setStorageEnabled(node.data?.storageEnabled || false);
    }
  }, [node]);

  if (!node) {
    return null;
  }

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
      aiMemorySize, // Save new state
      aiTemperature, // Save new state
      storageEnabled
    };
    
    if (onUpdateNode) {
      onUpdateNode(node.id, updatedData);
    }
    
    console.log('Saving changes:', updatedData);
    onClose();
  };

  const validateCredentials = async () => {
    setValidationStatus('validating');
    
    // Simulate API validation
    setTimeout(() => {
      const isValid = Math.random() > 0.3; // 70% success rate for demo
      setValidationStatus(isValid ? 'success' : 'error');
    }, 2000);
  };

  const isAiAgent = node.data.label?.includes('Agent');
  const platformConfig = platformConfigs[node.data.label];

  const renderCredentialsSection = () => {
    if (!platformConfig) return null;

    // ... (Credentials Section code remains the same)
    return (
      <Card className="bg-gray-800/50 border-gray-600 p-4">
        <div className="flex items-center gap-3 mb-4">
          <div className={`p-2 rounded-lg bg-gray-700/50 ${platformConfig.color}`}>
            {platformConfig.icon}
          </div>
          <div>
            <h3 className="text-white font-semibold text-sm">Credentials</h3>
            <p className="text-gray-400 text-xs">Configure your {node.data.label} credentials</p>
          </div>
        </div>

        <div className="space-y-3">
          {platformConfig.fields.map((field) => (
            <div key={field.name} className="space-y-1">
              <Label htmlFor={field.name} className="text-gray-300 text-xs font-medium">
                {field.label}
              </Label>
              <div className="relative">
                <Input
                  id={field.name}
                  type={field.type === 'password' && !showPasswords[field.name] ? 'password' : field.type === 'password' ? 'text' : field.type}
                  placeholder={field.placeholder}
                  value={credentials[field.name] || ''}
                  onChange={(e) => handleInputChange(field.name, e.target.value)}
                  className="bg-gray-700/50 border-gray-600 text-white placeholder-gray-400 focus:border-blue-500 pr-10 text-sm"
                />
                {field.type === 'password' && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-1 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white h-6 w-6 p-0"
                    onClick={() => togglePasswordVisibility(field.name)}
                  >
                    {showPasswords[field.name] ? (
                      <EyeOff className="w-3 h-3" />
                    ) : (
                      <Eye className="w-3 h-3" />
                    )}
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>

        <div className="mt-4 flex justify-between items-center">
          <Button
            variant="outline"
            size="sm"
            onClick={validateCredentials}
            disabled={validationStatus === 'validating'}
            className="text-gray-300 border-gray-600 hover:border-blue-500 hover:text-blue-300 text-xs"
          >
            {validationStatus === 'validating' ? 'Testing...' : 'Test Connection'}
          </Button>
          
          <div className="text-xs">
            {validationStatus === 'success' && (
              <span className="text-green-400 flex items-center gap-1">
                <CheckCircle className="w-3 h-3" />
                Connected
              </span>
            )}
            {validationStatus === 'error' && (
              <span className="text-red-400 flex items-center gap-1">
                <AlertCircle className="w-3 h-3" />
                Failed
              </span>
            )}
          </div>
        </div>
      </Card>
    );
  };

  // --- NEW PANEL 1: AI Memory Configuration ---
  const renderAiMemoryConfiguration = () => {
    if (!isAiAgent) return null;

    return (
      <Card className="bg-gray-800/50 border-gray-600 p-4">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 rounded-lg bg-gray-700/50 text-orange-400">
            <HardDrive className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-white font-semibold text-sm">Memory Configuration</h3>
            <p className="text-gray-400 text-xs">Settings for the agent's conversational memory</p>
          </div>
        </div>

        <div className="space-y-4">
          {/* AI Memory/Context (Moved from renderAiAgentConfiguration) */}
          <div className="space-y-2">
            <Label htmlFor="ai-memory" className="text-gray-300 text-xs font-medium">System Prompt / Work Context</Label>
            <Textarea
              id="ai-memory"
              placeholder="Define the work context and system prompt for this AI agent..."
              value={aiMemory}
              onChange={(e) => setAiMemory(e.target.value)}
              className="bg-gray-700/50 border-gray-600 text-white placeholder-gray-400 focus:border-blue-500 text-sm"
              rows={3}
            />
          </div>
          
          {/* Memory Size (Number of previous turns to remember) */}
          <div className="space-y-2">
            <Label htmlFor="ai-memory-size" className="text-gray-300 text-xs font-medium">Memory Size (Conversation Turns)</Label>
            <Input
              id="ai-memory-size"
              type="number"
              placeholder="e.g., 5"
              value={aiMemorySize}
              onChange={(e) => setAiMemorySize(e.target.value)}
              className="bg-gray-700/50 border-gray-600 text-white placeholder-gray-400 focus:border-blue-500 text-sm"
              min="0"
            />
            <p className="text-gray-500 text-xs">Set the number of recent interactions the agent should remember.</p>
          </div>

          {/* Storage Option (Moved from renderAiAgentConfiguration) */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Database className="w-4 h-4 text-green-400" />
                <Label htmlFor="storage-enabled" className="text-gray-300 text-xs font-medium">Save Response in DB</Label>
              </div>
              <input
                id="storage-enabled"
                type="checkbox"
                checked={storageEnabled}
                onChange={(e) => setStorageEnabled(e.target.checked)}
                className="w-4 h-4 text-blue-600 bg-gray-700 border-gray-600 rounded focus:ring-blue-500"
              />
            </div>
            <p className="text-gray-500 text-xs">Enable to save all agent interactions to database.</p>
          </div>
        </div>
      </Card>
    );
  };

  // --- NEW PANEL 2: Advanced Settings ---
  const renderAdvancedSettings = () => {
    if (!isAiAgent) return null;

    return (
      <Card className="bg-gray-800/50 border-gray-600 p-4">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 rounded-lg bg-gray-700/50 text-yellow-400">
            <Settings className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-white font-semibold text-sm">Advanced Settings</h3>
            <p className="text-gray-400 text-xs">Fine-tune the behavior of the AI model</p>
          </div>
        </div>

        <div className="space-y-4">
          {/* AI Temperature Setting */}
          <div className="space-y-2">
            <Label htmlFor="ai-temperature" className="text-gray-300 text-xs font-medium">Temperature</Label>
            <Input
              id="ai-temperature"
              type="number"
              placeholder="e.g., 0.7"
              value={aiTemperature}
              onChange={(e) => setAiTemperature(e.target.value)}
              className="bg-gray-700/50 border-gray-600 text-white placeholder-gray-400 focus:border-blue-500 text-sm"
              min="0.0"
              max="1.0"
              step="0.1"
            />
            <p className="text-gray-500 text-xs">Controls randomness. Lower is more predictable (0.0), higher is more creative (1.0).</p>
          </div>
        </div>
      </Card>
    );
  };

  // --- Original AI Agent Configuration (Now only model selection) ---
  const renderAiAgentConfiguration = () => {
    if (!isAiAgent) return null;

    return (
      <Card className="bg-gray-800/50 border-gray-600 p-4">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 rounded-lg bg-gray-700/50 text-blue-400">
            <Brain className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-white font-semibold text-sm">Model Selection</h3>
            <p className="text-gray-400 text-xs">Choose the underlying large language model</p>
          </div>
        </div>

        <div className="space-y-4">
          {/* AI Model Selection */}
          <div className="space-y-2">
            <Label htmlFor="ai-model" className="text-gray-300 text-xs font-medium">AI Model</Label>
            <select
              id="ai-model"
              value={aiModel}
              onChange={(e) => setAiModel(e.target.value)}
              className="w-full bg-gray-700/50 border border-gray-600 text-white rounded-md px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
            >
              <option value="">Select AI Model</option>
              <option value="gpt-4">GPT-4</option>
              <option value="gpt-3.5-turbo">GPT-3.5 Turbo</option>
              <option value="claude-3">Claude 3</option>
              <option value="claude-2">Claude 2</option>
              <option value="gemini-pro">Gemini Pro</option>
              <option value="dall-e-3">DALL-E 3</option>
            </select>
          </div>
        </div>
      </Card>
    );
  };


  return (
    <aside className="w-96 bg-gray-900/60 backdrop-blur-sm border-l border-gray-800 p-6 flex flex-col gap-6 absolute top-0 right-0 h-full z-10 overflow-y-auto">
      <div className="flex justify-between items-center">
        <h2 className="font-bold text-xl text-blue-300">
          Configure Node
        </h2>
        <Button variant="ghost" size="icon" onClick={onClose} className="text-gray-400 hover:text-white">
          <X size={20} />
        </Button>
      </div>
      
      <div className="flex flex-col gap-5 flex-grow">
        <div className="grid w-full items-center gap-2">
          <Label htmlFor="node-type" className="text-gray-300 text-sm font-medium">Node Type</Label>
          <Input
            id="node-type"
            type="text"
            value={node.data.label}
            readOnly
            className="bg-gray-800 border-gray-700 cursor-not-allowed text-sm"
          />
        </div>

        {/* Render AI Agent Configuration (Model Selection) */}
        {renderAiAgentConfiguration()}
        
        {/* Render AI Memory Configuration (NEW) */}
        {renderAiMemoryConfiguration()}
        
        {/* Render Advanced Settings (NEW) */}
        {renderAdvancedSettings()}

        {/* Render Credentials Section */}
        {renderCredentialsSection()}
      </div>

      <Button
        onClick={handleSaveChanges}
        className="bg-blue-600 hover:bg-blue-700 w-full text-white font-semibold"
        style={{ filter: 'drop-shadow(0 0 8px rgba(59, 130, 246, 0.6))' }}
      >
        Save Changes
      </Button>
    </aside>
  );
}