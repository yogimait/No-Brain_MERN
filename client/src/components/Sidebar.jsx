import React, { useState } from 'react';
import { Card } from '../components/ui/card';
import { ChevronDown, ChevronRight } from 'lucide-react';
import { getNodesByCategory, getSidebarIcon } from '../services/nodeRegistry.jsx';

// Get nodes grouped by category from the centralized registry
const groupedElements = getNodesByCategory();

export default function Sidebar({ addNode }) {
  // State to track which category is open. Initialize to null (none open)
  const [openCategory, setOpenCategory] = useState(null);

  // Function to handle the click on a category header
  const toggleCategory = (category) => {
    setOpenCategory(prevCategory =>
      prevCategory === category ? null : category // Close if already open, otherwise open the new one
    );
  };

  return (
    <div className="w-60 bg-gray-900/60 backdrop-blur-sm border-r border-gray-800 p-4 overflow-y-auto scrollbar-gray">
      <h3 className="text-white font-semibold mb-4 text-lg">Workflow Elements</h3>

      <div className="space-y-4">
        {Object.entries(groupedElements).map(([category, elements]) => {
          // Check if the current category is the one that should be open
          const isOpen = openCategory === category;

          return (
            <div key={category} className="mb-6">
              {/* Category Header/Toggle Button */}
              <div
                className="flex items-center justify-between cursor-pointer py-2 px-1 rounded hover:bg-gray-800/50 transition-colors duration-200"
                onClick={() => toggleCategory(category)}
              >
                <h4 className="text-sm font-semibold text-gray-400 uppercase tracking-wide">
                  {category}
                </h4>
                {isOpen ? (
                  <ChevronDown className="w-4 h-4 text-gray-500 transition-transform duration-200" />
                ) : (
                  <ChevronRight className="w-4 h-4 text-gray-500 transition-transform duration-200" />
                )}
              </div>

              {/* Conditional Rendering for Elements */}
              {isOpen && (
                <div className="space-y-2 mt-2">
                  {elements.map((element) => (
                    <Card
                      key={element.handler}
                      className="p-3 cursor-pointer transition-all duration-200 hover:scale-[1.02] border bg-gray-700 border-gray-600 hover:border-gray-500 hover:bg-gray-700/50"
                      draggable
                      onDragStart={(e) => {
                        e.dataTransfer.setData('application/reactflow', element.handler);
                        e.dataTransfer.effectAllowed = 'move';
                      }}
                      onClick={() => addNode(element.handler)}
                    >
                      <div className="flex items-center space-x-3">
                        <div className={element.color}>
                          {getSidebarIcon(element.handler)}
                        </div>
                        <span className="text-gray-300 text-sm font-medium">{element.label}</span>
                      </div>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}