import { Card } from '../components/ui/card';
import { 
  Plug, 
  Rows, 
  Edit, 
  MessageSquare, 
  Bot, 
  Text, 
  Mail,
  Brain,
  Database,
  FileText,
  Camera,
  Settings,
  Target,
  Timer,
  Calendar,
  RefreshCw,
  Link,
  Twitter,
  Linkedin,
  Instagram,
  Zap,
  Upload,
  Rss
} from 'lucide-react';

const sidebarElements = [
  // AI Agents
  { id: 'gemini', name: 'Gemini Agent', icon: <Brain className="w-4 h-4" />, color: 'text-blue-300', category: 'AI Agents' },
  { id: 'gpt4', name: 'GPT-4 Agent', icon: <Bot className="w-4 h-4" />, color: 'text-green-300', category: 'AI Agents' },
  { id: 'claude', name: 'Claude Agent', icon: <Brain className="w-4 h-4" />, color: 'text-purple-300', category: 'AI Agents' },
  
  // External Platforms
  { id: 'twitter-api', name: 'Twitter API', icon: <Twitter className="w-4 h-4" />, color: 'text-blue-300', category: 'Platforms' },
  { id: 'linkedin-api', name: 'LinkedIn API', icon: <Linkedin className="w-4 h-4" />, color: 'text-blue-300', category: 'Platforms' },
  { id: 'instagram-api', name: 'Instagram API', icon: <Instagram className="w-4 h-4" />, color: 'text-pink-300', category: 'Platforms' },
  { id: 'email-service', name: 'Email Service', icon: <Mail className="w-4 h-4" />, color: 'text-red-300', category: 'Platforms' },
  { id: 'slack-message', name: 'Slack Message', icon: <MessageSquare className="w-4 h-4" />, color: 'text-purple-300', category: 'Platforms' },
  
  // Data Sources
  { id: 'rss-feed', name: 'RSS Feed', icon: <Rss className="w-4 h-4" />, color: 'text-orange-300', category: 'Data Sources' },
  { id: 'webhook', name: 'Webhook', icon: <Zap className="w-4 h-4" />, color: 'text-yellow-300', category: 'Data Sources' },
  { id: 'database', name: 'Database', icon: <Database className="w-4 h-4" />, color: 'text-green-300', category: 'Data Sources' },
  { id: 'file-upload', name: 'File Upload', icon: <Upload className="w-4 h-4" />, color: 'text-blue-300', category: 'Data Sources' },
  
  // Processing Elements
  { id: 'text-processor', name: 'Text Processor', icon: <FileText className="w-4 h-4" />, color: 'text-gray-300', category: 'Processing' },
  { id: 'image-processor', name: 'Image Processor', icon: <Camera className="w-4 h-4" />, color: 'text-purple-300', category: 'Processing' },
  { id: 'data-transformer', name: 'Data Transformer', icon: <Settings className="w-4 h-4" />, color: 'text-indigo-300', category: 'Processing' },
  { id: 'condition-check', name: 'Condition Check', icon: <Target className="w-4 h-4" />, color: 'text-red-300', category: 'Processing' },
  
  // Timing & Control
  { id: 'delay', name: 'Delay', icon: <Timer className="w-4 h-4" />, color: 'text-yellow-300', category: 'Control' },
  { id: 'schedule', name: 'Schedule', icon: <Calendar className="w-4 h-4" />, color: 'text-green-300', category: 'Control' },
  { id: 'loop', name: 'Loop', icon: <RefreshCw className="w-4 h-4" />, color: 'text-blue-300', category: 'Control' },
  { id: 'merge', name: 'Merge', icon: <Link className="w-4 h-4" />, color: 'text-purple-300', category: 'Control' },

  // Legacy elements for compatibility
  { id: 'web-scraper', name: 'Web Scraper', icon: <Plug className="w-4 h-4" />, color: 'text-blue-300', category: 'Legacy' },
  { id: 'ai-summarizer', name: 'AI Summarizer', icon: <Rows className="w-4 h-4" />, color: 'text-green-300', category: 'Legacy' },
  { id: 'content-polisher', name: 'Content Polisher', icon: <Edit className="w-4 h-4" />, color: 'text-purple-300', category: 'Legacy' },
  { id: 'ai-text-generator', name: 'AI Text Generator', icon: <Bot className="w-4 h-4" />, color: 'text-blue-300', category: 'Legacy' },
  { id: 'sentiment-analyzer', name: 'Sentiment Analyzer', icon: <Text className="w-4 h-4" />, color: 'text-yellow-300', category: 'Legacy' },
  { id: 'email-generator', name: 'Email Generator', icon: <Mail className="w-4 h-4" />, color: 'text-red-300', category: 'Legacy' }
];

export default function Sidebar({ addNode }) {
  return (
    <div className="w-80 bg-gray-900/60 backdrop-blur-sm border-r border-gray-800 p-4 overflow-y-auto">
      <h3 className="text-white font-semibold mb-4 text-lg">Workflow Elements</h3>
      
      <div className="space-y-4">
        {Object.entries(sidebarElements.reduce((acc, element) => {
          if (!acc[element.category]) acc[element.category] = [];
          acc[element.category].push(element);
          return acc;
        }, {})).map(([category, elements]) => (
          <div key={category} className="mb-6">
            <h4 className="text-sm font-semibold text-gray-400 mb-3 uppercase tracking-wide">{category}</h4>
            <div className="space-y-2">
              {elements.map((element) => (
                <Card
                  key={element.id}
                  className="p-3 cursor-pointer transition-all duration-200 hover:scale-105 border border-gray-600 hover:border-gray-500 hover:bg-gray-700/50"
                  onClick={() => addNode(element.name)}
                >
                  <div className="flex items-center space-x-3">
                    <div className={`${element.color}`}>
                      {element.icon}
                    </div>
                    <span className="text-gray-300 text-sm font-medium">{element.name}</span>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}