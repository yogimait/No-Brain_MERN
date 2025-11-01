import React from 'react';
import { Circle } from 'lucide-react'; // Use a simple icon like Circle
// Assuming you have your node data defined
import { neuralData, brainOutlinePath } from './data'; 

const SVG_WIDTH = 800;
const SVG_HEIGHT = 600;

function NeuralBrain() {

  // Function to find a node's coordinates by its ID
  const getNodePosition = (id) => {
    const node = neuralData.find(n => n.id === id);
    return node ? { x: node.x, y: node.y, color: node.color } : null;
  };

  return (
    <svg 
      width="100%" 
      viewBox={`0 0 ${SVG_WIDTH} ${SVG_HEIGHT}`} 
      style={{ background: '#0a0a0a' }}
    >
      {/* --- 1. Brain Outline --- */}
      <path 
        d={brainOutlinePath} 
        fill="none" 
        stroke="rgba(255, 255, 255, 0.3)" 
        strokeWidth="1"
      />

      {/* --- 2. Connections (Lines) --- */}
      {neuralData.map(node => (
        <React.Fragment key={`lines-${node.id}`}>
          {node.connections.map(targetId => {
            const target = getNodePosition(targetId);
            if (!target) return null;

            // Draw a line from the current node to its target
            return (
              <line
                key={`${node.id}-${targetId}`}
                x1={node.x * SVG_WIDTH / 100}
                y1={node.y * SVG_HEIGHT / 100}
                x2={target.x * SVG_WIDTH / 100}
                y2={target.y * SVG_HEIGHT / 100}
                stroke={node.color} // Use a line color, perhaps a gradient or the node color
                strokeWidth="1.5"
                opacity="0.6"
              />
            );
          })}
        </React.Fragment>
      ))}

      {/* --- 3. Nodes (Dots) using Lucide React) --- */}
      {neuralData.map(node => {
        // Position the center of the Lucide icon
        const cx = node.x * SVG_WIDTH / 100;
        const cy = node.y * SVG_HEIGHT / 100;

        return (
          <g key={node.id} transform={`translate(${cx}, ${cy})`}>
            {/* Lucide Circle: color is set by the stroke/fill prop */}
            <Circle 
              size={10} // Adjust size for the dot
              fill={node.color} 
              stroke={node.color}
              strokeWidth={1}
              style={{ filter: 'drop-shadow(0 0 4px ' + node.color + ')' }} // Glow effect
            />
          </g>
        );
      })}
    </svg>
  );
}

export default NeuralBrain;