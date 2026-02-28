import React from 'react';

/**
 * NoBrain Logo Component
 * A stylized circuit-brain logo with gradient coloring and the NoBrain text
 */
export default function NoBrainLogo({ size = 'default', showText = true, className = '' }) {
    // Size configurations
    const sizes = {
        small: { icon: 28, text: 'text-lg' },
        default: { icon: 36, text: 'text-2xl' },
        large: { icon: 48, text: 'text-3xl' },
    };

    const { icon: iconSize, text: textSize } = sizes[size] || sizes.default;

    return (
        <div className={`flex items-center gap-2 ${className}`}>
            <img 
                src="/logo.png" 
                alt="NoBrain Logo" 
                width={iconSize} 
                height={iconSize} 
                className="flex-shrink-0 object-contain drop-shadow-[0_0_12px_rgba(34,211,238,0.5)]"
            />

            {/* NoBrain Text */}
            {showText && (
                <span className={`font-bold text-white ${textSize} tracking-tight`}>
                    NoBrain
                </span>
            )}
        </div>
    );
}
