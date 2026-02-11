import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { BackgroundBeams } from '../components/ui/background-beams';
import NoBrainLogo from '../components/NoBrainLogo';
import {
    Rocket,
    Plus,
    Play,
    Pause,
    CheckCircle,
    Clock,
    AlertCircle,
    Zap,
    Linkedin,
    Mail,
    MessageSquare,
    Database,
    Bot,
    FileText,
    Edit,
    Trash2,
    Brain,
    ArrowLeftCircle,
    X,
    ChevronRight,
    Activity,
    GitBranch
} from 'lucide-react';

// =======================================================================
// ENHANCED WORKFLOW DATA (kept the same)
// =======================================================================
const ongoingWorkflows = [
    {
        id: 1,
        name: 'LinkedIn Auto-Post',
        symbol: 'LINK',
        status: 'running',
        platform: 'LinkedIn',
        type: 'Social Media',
        nextRun: '2 hours',
        lastEdited: '2 days ago',
        complexity: 95,
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
        lastEdited: '1 week ago',
        complexity: 88,
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
        status: 'error',
        platform: 'Multiple',
        type: 'Content',
        nextRun: '30 minutes',
        lastEdited: '6 hours ago',
        complexity: 92,
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
                status: 'error',
                icon: <AlertCircle className="w-4 h-4" />,
                timestamp: '11:47',
                description: 'Filtering content failed',
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
        lastEdited: '5 minutes ago',
        complexity: 98,
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

// =======================================================================
// REUSABLE COMPONENTS
// =======================================================================

const Button = ({ children, className, variant = 'default', size = 'default', onClick, ...props }) => {
    const baseClasses = 'inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none ring-offset-background';

    const variantClasses = {
        default: 'bg-blue-600 text-white hover:bg-blue-700 shadow-lg shadow-blue-500/25',
        outline: 'border border-gray-600 text-gray-300 bg-gray-900/50 hover:border-purple-500 hover:text-purple-300'
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

const StatusIndicator = ({ status }) => {
    let icon, colorClasses, statusText;

    switch (status) {
        case 'running':
            icon = <Play className="w-6 h-6" />;
            colorClasses = 'bg-green-500/20 text-green-400 border-green-500/50 animate-pulse';
            statusText = 'Running';
            break;
        case 'paused':
            icon = <Pause className="w-6 h-6" />;
            colorClasses = 'bg-yellow-500/20 text-yellow-400 border-yellow-500/50';
            statusText = 'Paused';
            break;
        case 'error':
            icon = <AlertCircle className="w-6 h-6" />;
            colorClasses = 'bg-red-500/20 text-red-400 border-red-500/50';
            statusText = 'Error';
            break;
        default:
            icon = <Clock className="w-6 h-6" />;
            colorClasses = 'bg-gray-500/20 text-gray-400 border-gray-500/50';
            statusText = 'Idle';
    }

    return (
        <div className={`flex items-center gap-2 p-2 rounded-lg border ${colorClasses}`}>
            {icon}
            <span className="text-sm font-semibold">{statusText}</span>
        </div>
    );
};

// Workflow Card Component (List Item) - Retained for consistency
const WorkflowCard = ({ workflow, onSelect }) => {
    const getProgressColor = (status) => {
        switch (status) {
            case 'running': return 'bg-gradient-to-r from-blue-400 to-green-400';
            case 'paused': return 'bg-gradient-to-r from-yellow-400 to-orange-400';
            case 'error': return 'bg-red-500';
            default: return 'bg-gray-500';
        }
    };

    const changeColor = workflow.change.startsWith('+') ? 'text-green-400' : 'text-red-400';
    const arrowIcon = workflow.change.startsWith('+') ? '↑' : '↓';

    return (
        <div
            className="group relative bg-gray-900/50 backdrop-blur-md rounded-xl p-5 
                       border border-transparent hover:border-purple-600/70 
                       transition-all duration-300 shadow-xl hover:shadow-2xl hover:shadow-purple-900/20 
                       cursor-pointer transform hover:-translate-y-0.5"
            onClick={() => onSelect(workflow)}
        >
            <div className="flex justify-between items-center mb-4">
                <div className="flex items-center gap-4">
                    <StatusIndicator status={workflow.status} />
                    <div>
                        <h3 className="text-2xl font-extrabold text-white group-hover:text-purple-300 transition-colors">
                            {workflow.name}
                        </h3>
                        <p className="text-sm text-gray-400">
                            {workflow.platform} • {workflow.type}
                        </p>
                    </div>
                </div>

                {/* <div className="text-right">
                    <p className="text-3xl font-mono font-bold text-white">
                        {workflow.price.toFixed(2)}
                    </p>
                    <p className={`text-sm font-semibold ${changeColor}`}>
                        {arrowIcon} {workflow.change}
                    </p>
                </div> */}
            </div>

            <div className="mt-4">
                <div className="flex justify-between text-xs text-gray-400 mb-1">
                    <span>Current Step: <strong className="text-white">{workflow.currentStep}</strong></span>
                    <span>{workflow.progress}% Complete</span>
                </div>
                <div className="w-full h-2 rounded-full bg-gray-700/50">
                    <div
                        className={`h-2 rounded-full transition-all duration-700 ease-out ${getProgressColor(workflow.status)}`}
                        style={{ width: `${workflow.progress}%` }}
                    ></div>
                </div>
            </div>

            <div className="flex justify-between items-center mt-6 pt-4 border-t border-gray-800">
                <div className="flex gap-2">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={(e) => { e.stopPropagation(); console.log('Toggling status'); }}
                        className="!h-8 !px-2.5 text-xs border-gray-700 hover:border-green-500"
                    >
                        {workflow.status === 'running' ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                    </Button>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={(e) => { e.stopPropagation(); console.log('Editing workflow:', workflow.id); }}
                        className="!h-8 !px-2.5 text-xs border-gray-700 hover:border-blue-500"
                    >
                        <Edit className="w-4 h-4" />
                    </Button>
                </div>

                <span className="flex items-center text-sm font-semibold text-purple-400 group-hover:text-purple-300 transition-colors">
                    View Details
                    <ChevronRight className="w-5 h-5 ml-1 transition-transform group-hover:translate-x-1" />
                </span>
            </div>
        </div>
    );
};

// Helper for detail metrics - Retained for consistency
const MetricTile = ({ label, value, color, icon }) => {
    let colorClass, hoverClass;
    switch (color) {
        case 'green': colorClass = 'text-green-400'; hoverClass = 'hover:border-green-500/50 hover:shadow-green-900'; break;
        case 'blue': colorClass = 'text-blue-400'; hoverClass = 'hover:border-blue-500/50 hover:shadow-blue-900'; break;
        case 'purple': colorClass = 'text-purple-400'; hoverClass = 'hover:border-purple-500/50 hover:shadow-purple-900'; break;
        default: colorClass = 'text-gray-400'; hoverClass = 'hover:border-gray-500/50 hover:shadow-gray-900';
    }

    return (
        <div className={`p-4 rounded-xl bg-gray-800/70 border border-gray-700/50 cursor-pointer 
                        transition-all duration-300 transform hover:scale-[1.03] ${hoverClass} shadow-md`}>
            <div className={`flex items-center justify-between mb-1`}>
                <span className="text-xs font-medium uppercase tracking-wider text-gray-500">{label}</span>
                <span className={colorClass}>{icon}</span>
            </div>
            <p className={`text-2xl font-extrabold ${colorClass} truncate`}>{value}</p>
        </div>
    );
};

// =======================================================================
// WORKFLOW DETAIL MODAL (CENTERED SQUARE) - ENHANCED
// =======================================================================

const WorkflowDetailModal = ({ selectedWorkflow, onClose }) => {
    if (!selectedWorkflow) return null;

    const { name, complexity, lastEdited, estimatedTime, marketCap, linearSteps, status } = selectedWorkflow;

    const getStepStatusClasses = (stepStatus) => {
        switch (stepStatus) {
            case 'completed': return 'bg-green-500 border-green-300/50';
            case 'running': return 'bg-blue-500 border-blue-300/50 animate-pulse';
            case 'error': return 'bg-red-500 border-red-300/50';
            default: return 'bg-gray-700 border-gray-500';
        }
    };

    // Style for the modal border based on workflow status
    const modalStatusBorder = status === 'error'
        ? 'border-red-500/70 shadow-red-500/40'
        : 'border-purple-500/70 shadow-purple-500/40';

    return (
        // Backdrop with blur, opacity fade, and new centering classes
        <div
            className={`fixed inset-0 z-50 flex items-center justify-center transition-opacity duration-300 ${selectedWorkflow ? 'opacity-100 bg-black/80 backdrop-blur-sm' : 'opacity-0 pointer-events-none'
                }`}
            onClick={onClose}
        >
            {/* Modal Panel - Centered, fixed size, square-like ratio, and drop animation */}
            <div
                className={`max-w-4xl w-11/12 max-h-[85vh] aspect-[4/3] p-8 rounded-2xl overflow-y-auto 
                            bg-gray-900 border-4 ${modalStatusBorder} shadow-2xl 
                            transition-all duration-500 ease-out 
                            transform ${selectedWorkflow ? 'scale-100 opacity-100' : 'scale-75 opacity-0'}`}
                onClick={e => e.stopPropagation()}
            >
                {/* Header and Close Button */}
                <div className="flex justify-between items-start border-b border-purple-900 pb-4 mb-6 sticky top-0 bg-gray-900 z-20">
                    <div>
                        <h2 className="text-4xl font-extrabold text-white">
                            {name}
                        </h2>
                        <p className="text-sm font-mono text-purple-400 mt-1">
                            {status.toUpperCase()} Stream Details
                        </p>
                    </div>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={onClose}
                        className="!h-10 !w-10 p-0 border-gray-700 hover:border-red-500 text-gray-400 hover:text-red-400"
                    >
                        <X className="w-6 h-6" />
                    </Button>
                </div>

                {/* Key Metrics Grid - Interactive Tiles */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
                    <MetricTile
                        label="Complexity"
                        value={`${complexity}%`}
                        color="green"
                        icon={<CheckCircle className="w-5 h-5" />}
                    />
                    <MetricTile
                        label="Avg. Duration"
                        value={estimatedTime}
                        color="blue"
                        icon={<Clock className="w-5 h-5" />}
                    />
                    <MetricTile
                        label="Last Edited"
                        value={lastEdited}
                        color="gray"
                        icon={<Zap className="w-5 h-5" />}
                    />
                    <MetricTile
                        label="Market Value"
                        value={marketCap}
                        color="purple"
                        icon={<Activity className="w-5 h-5" />}
                    />
                </div>

                {/* Linear Chain/Timeline View */}
                <h3 className="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-green-400 border-b border-gray-800 pb-2 mb-4">
                    <GitBranch className="inline-block w-5 h-5 mr-2" /> Workflow Steps
                </h3>
                <div className="space-y-6">
                    {linearSteps.map((step, index) => (
                        <div key={step.id} className="flex relative">
                            {/* Vertical Connector Line */}
                            {index < linearSteps.length - 1 && (
                                <div className={`absolute left-[20px] top-10 w-0.5 h-full transition-colors duration-500 ${step.status === 'completed' ? 'bg-green-600/70' :
                                    step.status === 'running' ? 'bg-blue-600/70' : 'bg-gray-700/50'
                                    }`}></div>
                            )}

                            {/* Step Indicator with Glow */}
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center z-10 mr-4 transition-all duration-300 border-2 ${getStepStatusClasses(step.status)} shadow-lg ${step.status === 'running' ? 'shadow-blue-500/50' :
                                step.status === 'error' ? 'shadow-red-500/50' :
                                    'shadow-transparent'
                                }`}>
                                {step.icon}
                            </div>

                            {/* Step Content */}
                            <div className="flex-grow pt-1 pb-4 border-b border-gray-800 last:border-b-0">
                                <div className="flex justify-between items-center">
                                    <p className="text-lg font-semibold text-white">{step.name}</p>
                                    <p className="text-xs text-gray-500">{step.timestamp}</p>
                                </div>
                                <p className="text-sm text-gray-400 italic">{step.description}</p>
                                <p className="text-xs font-mono text-purple-500 mt-1">Elapsed: {step.duration}</p>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Footer Actions */}
                <div className="p-4 -mx-8 mt-4 border-t border-purple-900 bg-gray-900 sticky bottom-0 z-20">
                    <Button
                        onClick={() => { console.log('Viewing full workflow'); onClose(); }}
                        className="w-full bg-cyan-600 hover:bg-cyan-700 shadow-lg shadow-cyan-500/25"
                    >
                        <Brain className="w-4 h-4 mr-2" /> View Full Workflow
                    </Button>
                </div>
            </div>
        </div>
    );
};

// =======================================================================
// MAIN PAGE COMPONENT
// =======================================================================
export default function WorkflowsListPage() {
    const navigate = useNavigate();
    const [selectedWorkflow, setSelectedWorkflow] = useState(null);

    const handleSelectWorkflow = useCallback((workflow) => {
        setSelectedWorkflow(workflow);
    }, []);

    const handleCloseSidebar = useCallback(() => {
        setSelectedWorkflow(null);
    }, []);

    const handleBackToDashboard = () => {
        navigate('/dashboard');
        console.log('Navigating back to dashboard');
    };

    return (
        <div className="min-h-screen bg-black relative overflow-hidden">
            <BackgroundBeams />


            {/* Background Grid and Header (Unchanged) */}
            <div className="absolute inset-0 bg-black">
                <div className="absolute inset-0 opacity-10">
                    <svg width="100%" height="100%" className="animate-pulse">
                        <defs>
                            <pattern id="terminalGrid" width="30" height="30" patternUnits="userSpaceOnUse">
                                <path d="M 30 0 L 0 0 0 30" fill="none" stroke="#3B82F6" strokeWidth="0.5" />
                            </pattern>
                        </defs>
                        <rect width="100%" height="100%" fill="url(#terminalGrid)" />
                    </svg>
                </div>
            </div>

            <header className="relative z-30 bg-black backdrop-blur-sm border-b border-purple-500/30">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between h-16">
                        <div className="flex items-center gap-3">
                            <NoBrainLogo />
                        </div>
                        <div className="flex items-center gap-3">
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={handleBackToDashboard}
                            >
                                <ArrowLeftCircle className="w-4 h-4 mr-2" />
                                Back to Dashboard
                            </Button>
                            {/* <Button
                                onClick={() => alert('New Workflow Modal/Page')}
                            >
                                <Plus className="w-4 h-4 mr-2" />
                                New Workflow
                            </Button> */}
                        </div>
                    </div>
                </div>
            </header>

            {/* Main Workflows List Interface */}
            <main className="relative pt-10 pb-20 bg-black">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <h1 className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400 mb-8">
                        Active Workflow Streams ({ongoingWorkflows.length})
                    </h1>

                    {/* Workflow List using the enhanced Card component */}
                    <div className="space-y-5">
                        {ongoingWorkflows.map((workflow) => (
                            <WorkflowCard
                                key={workflow.id}
                                workflow={workflow}
                                onSelect={handleSelectWorkflow}
                            />
                        ))}
                    </div>
                </div>
            </main>

            {/* The Centered Modal */}
            <WorkflowDetailModal
                selectedWorkflow={selectedWorkflow}
                onClose={handleCloseSidebar}
            />

        </div>
    );
}