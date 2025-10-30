import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Rocket, 
  Plus, 
  Settings, 
  LogOut,
  Play,
  Pause,
  CheckCircle,
  Clock,
  AlertCircle,
  Zap,
  Linkedin,
  Mail,
  MessageSquare,
  Calendar,
  Database,
  Bot,
  FileText,
  Activity,
  TrendingUp,
  Users,
  Timer,
  RefreshCw,
  Edit,
  Trash2,
  MoreVertical,
  ChevronRight,
  Circle,
  ArrowRight,
  Pencil,
  Save,
  X,
  MapPin,
  Navigation,
  Layers,
  Globe,
  Cpu,
  Network,
  Gauge,
  Target,
  BarChart3,
  LineChart,
  Truck,
  Package,
  Map,
  Route,
  Locate,
  Compass,
  Waypoints,
  ArrowUp,
  ArrowDown,
  DollarSign,
  PieChart,
  TrendingDown,
  Minus,
  ArrowRightCircle,
  ArrowLeftCircle,
  ChevronDown,
  ChevronUp,
  Monitor,
  Smartphone,
  Laptop,
  Server,
  HardDrive,
  Cpu as CpuIcon,
  MemoryStick,
  Wifi,
  Signal,
  Battery,
  Thermometer,
  Wind,
  Sun,
  Moon,
  Star,
  Heart,
  Shield,
  Lock,
  Unlock,
  Eye,
  EyeOff,
  Volume2,
  VolumeX,
  WifiOff,
  Wifi as WifiIcon,
  Terminal,
  Code,
  Bug,
  ShieldCheck,
  AlertTriangle,
  Info,
  Lightbulb,
  Brain,
  Cpu as CpuIcon2,
  HardDrive as HardDriveIcon,
  Database as DatabaseIcon,
  Server as ServerIcon,
  Wifi as WifiIcon2,
  Signal as SignalIcon,
  Battery as BatteryIcon,
  Thermometer as ThermometerIcon,
  Wind as WindIcon,
  Sun as SunIcon,
  Moon as MoonIcon,
  Star as StarIcon,
  Heart as HeartIcon,
  Shield as ShieldIcon,
  Lock as LockIcon,
  Unlock as UnlockIcon,
  Eye as EyeIcon,
  EyeOff as EyeOffIcon,
  Volume2 as Volume2Icon,
  VolumeX as VolumeXIcon,
  WifiOff as WifiOffIcon
} from 'lucide-react';

// Stock market style data for workflows
const marketData = {
  activeWorkflows: 4,
  totalRuns: 47,
  timeSaved: 12.5,
  efficiency: 94,
  successRate: 93,
  marketTrend: 'up',
  priceChange: '+2.4%',
  volume: '1.2K',
  marketCap: '$2.4M'
};

// Enhanced workflow data with linear chain structure
const ongoingWorkflows = [
  {
    id: 1,
    name: 'LinkedIn Auto-Post',
    symbol: 'LINK',
    status: 'running',
    platform: 'LinkedIn',
    type: 'Social Media',
    nextRun: '2 hours',
    lastRun: '2 days ago',
    successRate: 95,
    currentStep: 'Content Generated',
    progress: 75,
    estimatedTime: '3 minutes',
    startedAt: '14:30',
    currentStepIndex: 2,
    price: 124.50,
    change: '+2.4%',
    volume: '1.2K',
    marketCap: '$2.4M',
    linearSteps: [
      { 
        id: 'triggered', 
        name: 'Trigger', 
        status: 'completed', 
        icon: <Zap className="w-4 h-4" />, 
        timestamp: '14:30', 
        description: 'Workflow initiated',
        duration: '30s'
      },
      { 
        id: 'processing', 
        name: 'AI Processing', 
        status: 'completed', 
        icon: <Bot className="w-4 h-4" />, 
        timestamp: '14:31', 
        description: 'Generating content',
        duration: '1m 30s'
      },
      { 
        id: 'review', 
        name: 'Quality Check', 
        status: 'running', 
        icon: <CheckCircle className="w-4 h-4" />, 
        timestamp: '14:32', 
        description: 'Reviewing content',
        duration: '45s'
      },
      { 
        id: 'delivery', 
        name: 'Publish', 
        status: 'pending', 
        icon: <Rocket className="w-4 h-4" />, 
        timestamp: '14:33', 
        description: 'Publishing to LinkedIn',
        duration: '15s'
      }
    ]
  },
  {
    id: 2,
    name: 'Email Newsletter',
    symbol: 'MAIL',
    status: 'paused',
    platform: 'Mailchimp',
    type: 'Email Marketing',
    nextRun: 'Paused',
    lastRun: '1 week ago',
    successRate: 88,
    currentStep: 'Subscriber Collection',
    progress: 30,
    estimatedTime: '4 minutes',
    startedAt: '09:00',
    currentStepIndex: 1,
    price: 89.20,
    change: '-1.2%',
    volume: '856',
    marketCap: '$1.8M',
    linearSteps: [
      { 
        id: 'triggered', 
        name: 'Trigger', 
        status: 'completed', 
        icon: <Zap className="w-4 h-4" />, 
        timestamp: '09:00', 
        description: 'Newsletter initiated',
        duration: '15s'
      },
      { 
        id: 'processing', 
        name: 'Data Collection', 
        status: 'running', 
        icon: <Database className="w-4 h-4" />, 
        timestamp: '09:01', 
        description: 'Collecting subscribers',
        duration: '2m 30s'
      },
      { 
        id: 'review', 
        name: 'Content Gen', 
        status: 'pending', 
        icon: <Bot className="w-4 h-4" />, 
        timestamp: '09:02', 
        description: 'Creating content',
        duration: '1m 15s'
      },
      { 
        id: 'delivery', 
        name: 'Send', 
        status: 'pending', 
        icon: <Mail className="w-4 h-4" />, 
        timestamp: '09:03', 
        description: 'Sending emails',
        duration: '30s'
      }
    ]
  },
  {
    id: 3,
    name: 'Content Aggregator',
    symbol: 'CONT',
    status: 'running',
    platform: 'Multiple',
    type: 'Content',
    nextRun: '30 minutes',
    lastRun: '6 hours ago',
    successRate: 92,
    currentStep: 'Article Analysis',
    progress: 60,
    estimatedTime: '5 minutes',
    startedAt: '11:45',
    currentStepIndex: 2,
    price: 156.80,
    change: '+3.1%',
    volume: '2.1K',
    marketCap: '$3.1M',
    linearSteps: [
      { 
        id: 'triggered', 
        name: 'Trigger', 
        status: 'completed', 
        icon: <Zap className="w-4 h-4" />, 
        timestamp: '11:45', 
        description: 'RSS feeds activated',
        duration: '20s'
      },
      { 
        id: 'processing', 
        name: 'Analysis', 
        status: 'completed', 
        icon: <Bot className="w-4 h-4" />, 
        timestamp: '11:46', 
        description: 'Analyzing articles',
        duration: '2m 10s'
      },
      { 
        id: 'review', 
        name: 'Filtering', 
        status: 'running', 
        icon: <FileText className="w-4 h-4" />, 
        timestamp: '11:47', 
        description: 'Filtering content',
        duration: '1m 30s'
      },
      { 
        id: 'delivery', 
        name: 'Summary', 
        status: 'pending', 
        icon: <MessageSquare className="w-4 h-4" />, 
        timestamp: '11:48', 
        description: 'Sending summary',
        duration: '20s'
      }
    ]
  },
  {
    id: 4,
    name: 'Customer Support Bot',
    symbol: 'SUPP',
    status: 'running',
    platform: 'Slack',
    type: 'Support',
    nextRun: 'Continuous',
    lastRun: '5 minutes ago',
    successRate: 98,
    currentStep: 'Response Generation',
    progress: 45,
    estimatedTime: '3 minutes',
    startedAt: '15:20',
    currentStepIndex: 2,
    price: 203.40,
    change: '+5.7%',
    volume: '3.2K',
    marketCap: '$4.1M',
    linearSteps: [
      { 
        id: 'triggered', 
        name: 'Trigger', 
        status: 'completed', 
        icon: <Zap className="w-4 h-4" />, 
        timestamp: '15:20', 
        description: 'Ticket received',
        duration: '5s'
      },
      { 
        id: 'processing', 
        name: 'AI Response', 
        status: 'running', 
        icon: <Bot className="w-4 h-4" />, 
        timestamp: '15:21', 
        description: 'Generating response',
        duration: '1m 45s'
      },
      { 
        id: 'review', 
        name: 'Quality Check', 
        status: 'pending', 
        icon: <CheckCircle className="w-4 h-4" />, 
        timestamp: '15:22', 
        description: 'Reviewing response',
        duration: '30s'
      },
      { 
        id: 'delivery', 
        name: 'Reply', 
        status: 'pending', 
        icon: <MessageSquare className="w-4 h-4" />, 
        timestamp: '15:23', 
        description: 'Sending reply',
        duration: '10s'
      }
    ]
  }
];

// Custom Button component (replace with your actual Button component)
const Button = ({ children, className, variant = 'default', size = 'default', onClick, ...props }) => {
  const baseClasses = 'inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none ring-offset-background';
  
  const variantClasses = {
    default: 'bg-primary text-primary-foreground hover:bg-primary/90',
    outline: 'border border-input hover:bg-accent hover:text-accent-foreground'
  };
  
  const sizeClasses = {
    default: 'h-10 py-2 px-4',
    sm: 'h-9 px-3 rounded-md'
  };

  return (
    <button 
      className={`${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${className}`}
      onClick={onClick}
      {...props}
    >
      {children}
    </button>
  );
};

// Custom Card component (replace with your actual Card component)
const Card = ({ children, className, ...props }) => {
  return (
    <div className={`rounded-lg border bg-card text-card-foreground shadow-sm ${className}`} {...props}>
      {children}
    </div>
  );
};

export default function DashboardPage() {
  const navigate = useNavigate();
  const [selectedWorkflow, setSelectedWorkflow] = useState(null);
  const [editingWorkflow, setEditingWorkflow] = useState(null);
  const [refreshKey, setRefreshKey] = useState(0);
  const [hoveredWorkflow, setHoveredWorkflow] = useState(null);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [showWorkflowModal, setShowWorkflowModal] = useState(false);
  const modalRef = useRef();
  // Modal ESC close support
  useEffect(() => {
    if (!showWorkflowModal) return;
    function handleEsc(e) {
      if (e.key === 'Escape') setShowWorkflowModal(false);
    }
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [showWorkflowModal]);

  // Update time every second for real-time feel
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const getStatusIcon = (status) => {
    switch (status) {
      case 'running':
        return <Play className="w-3 h-3 text-green-400" />;
      case 'paused':
        return <Pause className="w-3 h-3 text-yellow-400" />;
      case 'completed':
        return <CheckCircle className="w-3 h-3 text-green-400" />;
      case 'pending':
        return <Clock className="w-3 h-3 text-gray-400" />;
      case 'error':
        return <AlertCircle className="w-3 h-3 text-red-400" />;
      default:
        return <Clock className="w-3 h-3 text-gray-400" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'running':
        return 'text-green-400';
      case 'paused':
        return 'text-yellow-400';
      case 'completed':
        return 'text-green-400';
      case 'pending':
        return 'text-gray-400';
      case 'error':
        return 'text-red-400';
      default:
        return 'text-gray-400';
    }
  };

  const handleRefresh = () => {
    setRefreshKey(prev => prev + 1);
  };

  const handleEditWorkflow = (workflowId) => {
    setEditingWorkflow(workflowId);
  };

  const handleDeleteWorkflow = (workflowId) => {
    console.log('Deleting workflow:', workflowId);
  };

  // Generate random price movements for stock market effect
  const getRandomPriceChange = () => {
    const changes = ['+2.4%', '+1.8%', '-0.5%', '+3.2%', '-1.1%', '+0.9%'];
    return changes[Math.floor(Math.random() * changes.length)];
  };

  return (
    <div className={`min-h-screen bg-black relative overflow-hidden ${showWorkflowModal ? 'modal-blur-bg' : ''}`}>
      {/* Dark blurry glass background when modal is up */}
      {showWorkflowModal && (
        <div className="fixed z-[60] inset-0 pointer-events-none">
          <div className="absolute inset-0 bg-black bg-opacity-60 backdrop-blur-md transition-all duration-200" />
        </div>
      )}
      {showWorkflowModal && (
        <div className="fixed z-[70] inset-0 flex items-center justify-center">
          <div className="absolute inset-0" onClick={() => setShowWorkflowModal(false)}></div>
          <div
            ref={modalRef}
            className="relative z-10 bg-gray-900/90 backdrop-blur-xl shadow-xl border-2 border-blue-700/30 rounded-3xl p-8 px-5 py-10 w-[98vw] max-w-3xl flex flex-col items-center gap-8 scale-in animate-glowCard"
            style={{ boxShadow: '0 12px 64px 0 rgba(70,80,180,0.22),0 1.5px 32px 0 rgba(99,132,255,.14)' }}
            onClick={e => e.stopPropagation()}
          >
            {/* Close (X) */}
            <button onClick={() => setShowWorkflowModal(false)} className="absolute top-4 right-6 text-gray-400 hover:text-blue-400 text-2xl font-bold bg-gray-800/70 backdrop-blur rounded-full w-10 h-10 flex items-center justify-center z-20 border border-blue-900/30 transition hover:scale-110">
              <span className="sr-only">Close</span>×
            </button>
            <h2 className="text-transparent bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-3xl font-bold tracking-tight mb-4 text-center shadow-blue-400/40 select-none">Start a New Workflow</h2>
            <p className="text-gray-400 mb-6 text-center text-md max-w-xl">How would you like to create your workflow?</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full">
              <button
                className="transition-all group text-left bg-black/60 border-2 border-blue-900 rounded-xl px-7 py-8 flex flex-col items-start shadow-xl hover:border-blue-400/60 focus:outline-none hover:scale-[1.04] hover:shadow-blue-400/20 animate-glowCard"
                onClick={() => { setShowWorkflowModal(false); navigate('/workflow'); }}
              >
                <div className="flex items-center gap-3 mb-3">
                  <Rocket className="w-7 h-7 text-blue-400 drop-shadow-lg" />
                  <span className="font-bold text-2xl text-white tracking-tight">Create Manually</span>
                </div>
                <p className="text-gray-300 text-[15px] mb-3 pr-1">Build step by step with a visual canvas. Drag, drop, connect, and customize every detail.</p>
                <ul className="flex gap-2 text-xs mt-auto">
                  <li className="px-3 py-1 rounded bg-blue-900/40 text-blue-400 font-semibold">Visual Canvas</li>
                  <li className="px-3 py-1 rounded bg-purple-900/40 text-purple-300 font-semibold">Drag & Drop</li>
                  <li className="px-3 py-1 rounded bg-green-900/40 text-green-400 font-semibold">Full Control</li>
                </ul>
              </button>
              <button
                className="transition-all group text-left bg-black/60 border-2 border-purple-900 rounded-xl px-7 py-8 flex flex-col items-start shadow-xl hover:border-purple-400 focus:outline-none hover:scale-[1.04] hover:shadow-purple-400/20 animate-glowCard"
                onClick={() => { setShowWorkflowModal(false); navigate('/workflow/ai-prompt'); }}
              >
                <div className="flex items-center gap-3 mb-3">
                  <Zap className="w-7 h-7 text-purple-300 drop-shadow-lg" />
                  <span className="font-bold text-2xl text-white tracking-tight">AI Generated</span>
                </div>
                <p className="text-gray-300 text-[15px] mb-3 pr-1">Describe it, and our AI creates your workflow for you. Provide a summary and let the magic happen!</p>
                <ul className="flex gap-2 text-xs mt-auto">
                  <li className="px-3 py-1 rounded bg-purple-900/40 text-purple-300 font-semibold">AI Powered</li>
                  <li className="px-3 py-1 rounded bg-blue-900/40 text-blue-400 font-semibold">Quick Setup</li>
                  <li className="px-3 py-1 rounded bg-green-900/40 text-green-400 font-semibold">Smart</li>
                </ul>
              </button>
            </div>
          </div>
        </div>
      )}
      {/* System Background Elements */}
      <div className="absolute inset-0 bg-black">
        {/* Terminal Grid */}
        <div className="absolute inset-0 opacity-10">
          <svg width="100%" height="100%" className="animate-pulse">
            <defs>
              <pattern id="terminalGrid" width="30" height="30" patternUnits="userSpaceOnUse">
                <path d="M 30 0 L 0 0 0 30" fill="none" stroke="#3B82F6" strokeWidth="0.5"/>
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#terminalGrid)" />
          </svg>
        </div>

        {/* Floating Code Elements */}
        {[...Array(15)].map((_, i) => (
          <div
            key={i}
            className="absolute text-xs font-mono animate-pulse text-blue-400"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 5}s`,
              animationDuration: `${2 + Math.random() * 3}s`
            }}
          >
            {['<div>', '</div>', '{ }', '=>', '()', '[]'][Math.floor(Math.random() * 6)]}
          </div>
        ))}
      </div>

      {/* Clean Simple Header */}
      <header className="relative z-30 bg-black backdrop-blur-sm border-b border-blue-500/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-gradient-to-r from-blue-400 to-purple-400 rounded-lg flex items-center justify-center">
                <Brain className="w-5 h-5 text-white" />
              </div>
              <span className="text-2xl font-bold text-blue-300">NoBrain</span>
            </div>
            
            <div className="flex items-center gap-3">
              <Button
                className="bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-500/25"
                onClick={() => setShowWorkflowModal(true)}
              >
                <Plus className="w-4 h-4 mr-2" />
                New Workflow
              </Button>
              
              <Button
                variant="outline"
                size="sm"
                className="text-gray-300 border-gray-600 hover:border-red-500 hover:text-red-300 bg-gray-900/50"
                onClick={() => navigate('/auth/login')}
              >
                <LogOut className="w-4 h-4 mr-2" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main System Interface */}
      <div className="relative pt-16 pb-6 bg-black">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          {/* Warning Label - Top Right */}
          <div className="absolute top-4 right-4 z-20">
            <div className="bg-gradient-to-r from-green-500/20 to-blue-500/20 backdrop-blur-sm border border-green-500/30 rounded-lg p-4 shadow-lg">
              <div className="text-center">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                  <span className="text-xs font-mono text-green-400">SYSTEM ONLINE</span>
                </div>
                <div className="text-xs font-mono text-gray-400 mb-1">
                  {currentTime.toLocaleTimeString()}
                </div>
                <div className="text-sm font-bold text-green-400">
                  IT'S TRULY A NO BRAINER
                </div>
              </div>
            </div>
          </div>

          {/* System Status Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {/* Active Workflows */}
            <Card className="bg-gray-900/40 backdrop-blur-sm border border-blue-500/30 hover:border-blue-500/50 transition-all duration-300 group">
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 bg-blue-500/20 rounded-xl group-hover:bg-blue-500/30 transition-colors">
                    <Zap className="w-6 h-6 text-blue-400 animate-pulse" />
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-white">
                      {marketData.activeWorkflows}
                    </p>
                    <p className="text-xs text-blue-400">Active</p>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">Running</span>
                    <span className="text-blue-400">+12%</span>
                  </div>
                  <div className="w-full bg-gray-700 rounded-full h-2">
                    <div className="bg-gradient-to-r from-blue-400 to-blue-500 h-2 rounded-full animate-pulse" style={{ width: '75%' }}></div>
                  </div>
                </div>
              </div>
            </Card>

            {/* Time Saved */}
            <Card className="bg-gray-900/40 backdrop-blur-sm border border-green-500/30 hover:border-green-500/50 transition-all duration-300 group">
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 bg-green-500/20 rounded-xl group-hover:bg-green-500/30 transition-colors">
                    <Timer className="w-6 h-6 text-green-400 animate-spin" style={{ animationDuration: '3s' }} />
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-white">
                      {marketData.timeSaved}h
                    </p>
                    <p className="text-xs text-green-400">Saved</p>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">Efficiency</span>
                    <span className="text-green-400">{marketData.efficiency}%</span>
                  </div>
                  <div className="w-full bg-gray-700 rounded-full h-2">
                    <div className="bg-gradient-to-r from-green-400 to-green-500 h-2 rounded-full" style={{ width: `${marketData.efficiency}%` }}></div>
                  </div>
                </div>
              </div>
            </Card>

            {/* Success Rate */}
            <Card className="bg-gray-900/40 backdrop-blur-sm border border-purple-500/30 hover:border-purple-500/50 transition-all duration-300 group">
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 bg-purple-500/20 rounded-xl group-hover:bg-purple-500/30 transition-colors">
                    <TrendingUp className="w-6 h-6 text-purple-400" />
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-white">
                      {marketData.successRate}%
                    </p>
                    <p className="text-xs text-purple-400">Success</p>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">Trend</span>
                    <span className="flex items-center gap-1 text-purple-400">
                      <ArrowUp className="w-3 h-3" />
                      +5.2%
                    </span>
                  </div>
                  <div className="w-full bg-gray-700 rounded-full h-2">
                    <div className="bg-gradient-to-r from-purple-400 to-purple-500 h-2 rounded-full" style={{ width: `${marketData.successRate}%` }}></div>
                  </div>
                </div>
              </div>
            </Card>

            {/* Total Runs */}
            <Card className="bg-gray-900/40 backdrop-blur-sm border border-yellow-500/30 hover:border-yellow-500/50 transition-all duration-300 group">
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 bg-yellow-500/20 rounded-xl group-hover:bg-yellow-500/30 transition-colors">
                    <Activity className="w-6 h-6 text-yellow-400" />
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-white">
                      {marketData.totalRuns}
                    </p>
                    <p className="text-xs text-yellow-400">Runs Today</p>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">Volume</span>
                    <span className="text-yellow-400">+18%</span>
                  </div>
                  <div className="flex gap-1 h-2">
                    {[...Array(12)].map((_, i) => (
                      <div
                        key={i}
                        className="bg-yellow-400 rounded-sm animate-pulse"
                        style={{
                          width: '8px',
                          height: `${Math.random() * 100}%`,
                          animationDelay: `${i * 0.1}s`
                        }}
                      ></div>
                    ))}
                  </div>
                </div>
              </div>
            </Card>
          </div>

          {/* Horizontal Workflow Streams */}
          <div className="space-y-8">
            {ongoingWorkflows.map((workflow) => (
              <div key={workflow.id} className="relative bg-gray-900/20 backdrop-blur-sm rounded-lg border border-gray-700/50 p-6 hover:border-blue-500/50 transition-all duration-300">
                
                {/* Workflow Header */}
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-4">
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                      workflow.status === 'running' ? 'bg-green-500/20' :
                      workflow.status === 'paused' ? 'bg-yellow-500/20' :
                      'bg-gray-500/20'
                    }`}>
                      {workflow.status === 'running' ? <Play className="w-6 h-6 text-green-400" /> :
                       workflow.status === 'paused' ? <Pause className="w-6 h-6 text-yellow-400" /> :
                       <Clock className="w-6 h-6 text-gray-400" />}
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold text-white">
                        {workflow.name}
                      </h3>
                      <p className="text-sm text-gray-400">
                        {workflow.platform} • {workflow.type} • Started: {workflow.startedAt}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <p className="text-lg font-bold text-white">
                        {workflow.progress}%
                      </p>
                      <p className="text-sm text-gray-400">
                        ETA: {workflow.estimatedTime}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-gray-300 border-gray-600 hover:border-blue-500 hover:text-blue-300"
                        onClick={() => handleEditWorkflow(workflow.id)}
                      >
                        <Edit className="w-4 h-4 mr-2" />
                        Edit
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-gray-300 border-gray-600 hover:border-red-500 hover:text-red-300"
                        onClick={() => handleDeleteWorkflow(workflow.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </div>

                {/* Horizontal Progress Line */}
                <div className="relative mb-6">
                  <div className="w-full h-1 rounded-full bg-gray-700">
                    <div 
                      className={`h-1 rounded-full transition-all duration-500 ${
                        workflow.status === 'running' ? 'bg-gradient-to-r from-blue-500 to-green-500' : 
                        workflow.status === 'paused' ? 'bg-gradient-to-r from-yellow-500 to-orange-500' :
                        'bg-gray-500'
                      }`}
                      style={{ width: `${workflow.progress}%` }}
                    ></div>
                  </div>
                  
                  {/* Progress Steps */}
                  <div className="flex justify-between mt-4">
                    {workflow.linearSteps.map((step, stepIndex) => (
                      <div key={step.id} className="flex flex-col items-center relative">
                        {/* Connection Line */}
                        {stepIndex < workflow.linearSteps.length - 1 && (
                          <div className={`absolute top-6 left-6 w-full h-0.5 ${
                            stepIndex < workflow.currentStepIndex ? 'bg-green-500' :
                            stepIndex === workflow.currentStepIndex ? 'bg-blue-500' :
                            'bg-gray-600'
                          }`}></div>
                        )}
                        
                        {/* Step Circle */}
                        <div className={`w-12 h-12 rounded-full flex items-center justify-center border-2 relative z-10 ${
                          step.status === 'completed' ? 'bg-green-500 border-green-500' :
                          step.status === 'running' ? 'bg-blue-500 border-blue-500 animate-pulse' :
                          'bg-gray-600 border-gray-600'
                        }`}>
                          {step.status === 'completed' ? 
                            <CheckCircle className="w-6 h-6 text-white" /> : 
                            step.icon
                          }
                        </div>
                        
                        {/* Step Info */}
                        <div className="mt-2 text-center">
                          <p className="text-xs font-medium text-gray-300">
                            {step.name}
                          </p>
                          <p className="text-xs text-gray-500">
                            {step.duration}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Workflow Stats */}
                <div className="grid grid-cols-4 gap-4 pt-4 border-t border-gray-700/50">
                  <div className="text-center">
                    <p className="text-xs text-gray-400">Success Rate</p>
                    <p className="text-sm font-semibold text-white">
                      {workflow.successRate}%
                    </p>
                  </div>
                  <div className="text-center">
                    <p className="text-xs text-gray-400">Last Run</p>
                    <p className="text-sm font-semibold text-white">
                      {workflow.lastRun}
                    </p>
                  </div>
                  <div className="text-center">
                    <p className="text-xs text-gray-400">Next Run</p>
                    <p className="text-sm font-semibold text-white">
                      {workflow.nextRun}
                    </p>
                  </div>
                  <div className="text-center">
                    <p className="text-xs text-gray-400">Platform</p>
                    <p className="text-sm font-semibold text-white">
                      {workflow.platform}
                    </p>
                  </div>
                </div>

                {/* System Warning Labels */}
                {workflow.status === 'running' && (
                  <div className="mt-4 p-2 rounded text-xs font-mono bg-green-500/10 text-green-400">
                    ✓ WORKFLOW OPERATIONAL - IT'S A NO-BRAINER!
                  </div>
                )}
                {workflow.status === 'paused' && (
                  <div className="mt-4 p-2 rounded text-xs font-mono bg-yellow-500/10 text-yellow-400">
                    ⚠ WORKFLOW PAUSED - CHECK CONFIGURATION
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Empty State */}
          {ongoingWorkflows.length === 0 && (
            <div className="text-center py-20">
              <div className="w-24 h-24 bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-6">
                <Brain className="w-12 h-12 text-gray-500" />
              </div>
              <h3 className="text-2xl font-semibold text-gray-400 mb-4">
                No Active Workflows
              </h3>
              <p className="text-gray-500 mb-8 max-w-md mx-auto">
                Your system is idle. Create your first automation workflow to start the magic.
                <span className="font-bold"> IT'S A NO-BRAINER!</span>
              </p>
              <Button 
                className="bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-500/25"
                onClick={() => navigate('/workflow/create')}
              >
                <Plus className="w-4 h-4 mr-2" />
                Create First Workflow
              </Button>
            </div>
          )}
        </div>
      </div>
      <style>{`
  @keyframes scaleIn { from { transform:scale(.93); opacity:.35; } to { transform:scale(1); opacity:1; }}
  .scale-in { animation: scaleIn .38s cubic-bezier(.39,.3,.37,1.06); }
  .animate-glowCard { box-shadow:0 1.5px 24px #4787e644,0 1.5px 40px #8133f229 !important;}
  .modal-blur-bg > div:not(.fixed):not(.scale-in):not(.z-[70]) {
    filter: blur(6px) brightness(.87) grayscale(.12) !important;
    pointer-events: none !important;
    user-select: none !important;
  }
`}</style>
    </div>
  );
}