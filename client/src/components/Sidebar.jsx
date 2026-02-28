import React, { useState, useMemo, useDeferredValue } from 'react';
import { Card } from '../components/ui/card';
import { ChevronDown, ChevronRight, Search, Zap, Play, Box, Layers, BoxSelect, Cpu } from 'lucide-react';

// Import catalog directly
import catalogData from '../../../server/src/platforms/nodes-catalog.json';

// --- Hierarchy Builder ---
// Converts flat JSON into: { Category: { Service: [Nodes] } }
const buildHierarchy = (nodes) => {
  const hierarchy = { Triggers: {}, Logic: {}, Actions: {} };
  
  nodes.forEach(node => {
    // 1. Determine Category
    let category = 'Actions';
    const lowerLabel = node.label.toLowerCase();
    
    if (node.type === 'trigger' || lowerLabel.includes('trigger')) {
      category = 'Triggers';
    } else if (['if', 'merge', 'switch', 'code', 'function', 'filter', 'set', 'aggregate'].some(k => lowerLabel.includes(k))) {
      category = 'Logic';
    }

    // 2. Determine Service name
    let service = node.label.replace(/\s*[Tt]rigger\s*/, '').trim();
    if (!service) service = "Core Actions";

    if (!hierarchy[category][service]) hierarchy[category][service] = [];
    
    // Attach default UI metadata
    hierarchy[category][service].push({
      ...node,
      description: node.description || `Execute ${node.label} operation`,
      // fallback icons if needed
      iconName: category === 'Triggers' ? 'Zap' : (category === 'Logic' ? 'Cpu' : 'Box') 
    });
  });
  
  // Sort alphabetically
  for (const cat in hierarchy) {
    const sortedServices = {};
    Object.keys(hierarchy[cat]).sort().forEach(svc => {
      sortedServices[svc] = hierarchy[cat][svc];
    });
    hierarchy[cat] = sortedServices;
  }
  
  return hierarchy;
};

const rawNodes = catalogData.nodes || [];
const platformName = catalogData.platform || 'Integration';
const groupedHierarchy = buildHierarchy(rawNodes);

// Render Icon helper
const IconMap = { Zap, Cpu, Box, Play, BoxSelect, Layers };
const getIcon = (name, className) => {
  const IconCmp = IconMap[name] || Box;
  return <IconCmp className={className} />;
};

export default function Sidebar({ addNode }) {
  const [searchQuery, setSearchQuery] = useState('');
  const deferredQuery = useDeferredValue(searchQuery);

  // Expanded states
  const [openCategories, setOpenCategories] = useState({ Triggers: true }); // Open triggers by default
  const [openServices, setOpenServices] = useState({});

  const toggleCategory = (cat) => {
    setOpenCategories(prev => ({ ...prev, [cat]: !prev[cat] }));
  };

  const toggleService = (svc) => {
    setOpenServices(prev => ({ ...prev, [svc]: !prev[svc] }));
  };

  // Filter hierarchy based on search
  const filteredHierarchy = useMemo(() => {
    if (!deferredQuery.trim()) return groupedHierarchy;
    
    const lowerQuery = deferredQuery.toLowerCase();
    const result = { Triggers: {}, Logic: {}, Actions: {} };
    
    Object.entries(groupedHierarchy).forEach(([cat, services]) => {
      Object.entries(services).forEach(([svc, nodes]) => {
        // If service name matches, keep all nodes. Otherwise filter nodes.
        if (svc.toLowerCase().includes(lowerQuery)) {
          result[cat][svc] = nodes;
        } else {
          const matchingNodes = nodes.filter(n => n.label.toLowerCase().includes(lowerQuery));
          if (matchingNodes.length > 0) result[cat][svc] = matchingNodes;
        }
      });
    });
    
    // Clean empty categories
    const cleanedResult = {};
    Object.entries(result).forEach(([cat, services]) => {
      if (Object.keys(services).length > 0) cleanedResult[cat] = services;
    });
    return cleanedResult;
  }, [deferredQuery]);

  const isSearching = deferredQuery.trim() !== '';

  return (
    <div className="w-60 bg-card border-r border-border flex flex-col h-full animate-sidebar-slide z-20">
      
      {/* Header & Search */}
      <div className="p-4 border-b border-border bg-card/95 backdrop-blur-sm z-10 sticky top-0 shadow-sm">
        <div className="flex items-center gap-2 mb-3">
          <div className="p-1.5 bg-primary/10 rounded-md">
            <Layers className="w-4 h-4 text-primary" />
          </div>
          <h3 className="text-foreground font-bold text-sm tracking-wide uppercase capitalize">{platformName} Nodes</h3>
        </div>
        
        <div className="relative">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search catalog..."
            className="w-full bg-[#0A0D14] border border-soft focus:border-primary focus:ring-1 focus:ring-primary/50 outline-none rounded-md pl-9 pr-3 py-2 text-xs text-foreground placeholder:text-muted-foreground transition-all shadow-input"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {/* Catalog Tree */}
      <div className="flex-1 overflow-y-auto p-2 scrollbar-thin scrollbar-thumb-border scrollbar-track-transparent">
        {Object.entries(filteredHierarchy).length === 0 ? (
          <div className="text-center py-8 text-muted-foreground text-xs">
            No matching nodes found.
          </div>
        ) : (
          Object.entries(filteredHierarchy).map(([category, services]) => {
            const isCatOpen = isSearching || openCategories[category];

            return (
              <div key={category} className="mb-2">
                {/* Category Header */}
                <div
                  className="flex items-center justify-between cursor-pointer py-2 px-2 hover:bg-muted/50 rounded-md transition-colors group"
                  onClick={() => !isSearching && toggleCategory(category)}
                >
                  <span className="text-xs font-bold text-muted-foreground uppercase tracking-widest group-hover:text-primary transition-colors">
                    {category} <span className="text-[10px] font-normal opacity-60 ml-1">({Object.keys(services).length})</span>
                  </span>
                  {isCatOpen ? (
                    <ChevronDown className="w-3.5 h-3.5 text-muted-foreground" />
                  ) : (
                    <ChevronRight className="w-3.5 h-3.5 text-muted-foreground" />
                  )}
                </div>

                {/* Services List */}
                {isCatOpen && (
                  <div className="flex flex-col gap-1 mt-1 pl-1 pr-1 border-l border-soft ml-3 pb-2">
                    {Object.entries(services).map(([service, nodes]) => {
                      const isSvcOpen = isSearching || openServices[service] || nodes.length === 1; // Auto-open if only 1 node
                      
                      return (
                        <div key={service} className="flex flex-col">
                          {/* Service Header (only render if >1 node to prevent redundancy) */}
                          {nodes.length > 1 && (
                            <div
                              className="flex items-center gap-2 cursor-pointer py-1.5 px-2 hover:bg-muted/30 rounded transition-colors group"
                              onClick={() => !isSearching && toggleService(service)}
                            >
                              {isSvcOpen ? <ChevronDown className="w-3 h-3 text-muted-foreground" /> : <ChevronRight className="w-3 h-3 text-muted-foreground" />}
                              <span className="text-xs font-medium text-foreground/90 group-hover:text-primary">{service}</span>
                            </div>
                          )}

                          {/* Node Items */}
                          {(isSvcOpen || nodes.length === 1) && (
                            <div className={`flex flex-col gap-1.5 ${nodes.length > 1 ? 'ml-6 mt-1' : 'ml-2'}`}>
                              {nodes.map((node) => {
                                // Determine stylistic flair based on catalog type
                                const flair = category === 'Triggers' ? 'text-emerald-400 bg-emerald-400/10 border-emerald-500/20' 
                                            : category === 'Logic' ? 'text-cyan-400 bg-cyan-400/10 border-cyan-500/20'
                                            : 'text-purple-400 bg-purple-400/10 border-purple-500/20';
                                
                                return (
                                  <Card
                                    key={node.name}
                                    className="p-2 cursor-grab active:cursor-grabbing transition-all duration-200 hover:scale-[1.02] bg-[#11172A] border-soft hover:border-primary/50 hover:shadow-md relative overflow-hidden group"
                                    draggable
                                    onDragStart={(e) => {
                                      e.dataTransfer.setData('application/reactflow', node.name);
                                      e.dataTransfer.setData('application/json', JSON.stringify({ ...node, category, type: category === 'Triggers' ? 'trigger' : 'action' }));
                                      e.dataTransfer.effectAllowed = 'move';
                                    }}
                                  >
                                    <div className="flex items-start gap-2.5">
                                      <div className={`p-1.5 rounded-md border transition-colors group-hover:bg-opacity-20 ${flair.split(' ')[0]} ${flair.split(' ')[1]}`}>
                                        {getIcon(node.iconName, 'w-3.5 h-3.5')}
                                      </div>
                                      <div className="flex flex-col flex-1 overflow-hidden">
                                        <span className="text-foreground text-[11px] font-semibold truncate leading-tight mt-0.5" title={node.label}>{node.label}</span>
                                        <span className="text-muted-foreground text-[9px] truncate opacity-80 mt-1" title={node.description}>{node.description}</span>
                                      </div>
                                    </div>
                                  </Card>
                                );
                              })}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}