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
            {/* Circuit Brain SVG Icon */}
            <svg
                width={iconSize}
                height={iconSize}
                viewBox="0 0 64 64"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className="flex-shrink-0"
            >
                <defs>
                    {/* Gradient for left brain half */}
                    <linearGradient id="brainGradientLeft" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#06b6d4" />
                        <stop offset="100%" stopColor="#22d3ee" />
                    </linearGradient>
                    {/* Gradient for right brain half */}
                    <linearGradient id="brainGradientRight" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#10b981" />
                        <stop offset="100%" stopColor="#34d399" />
                    </linearGradient>
                    {/* Glow filter */}
                    <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
                        <feGaussianBlur stdDeviation="1.5" result="coloredBlur" />
                        <feMerge>
                            <feMergeNode in="coloredBlur" />
                            <feMergeNode in="SourceGraphic" />
                        </feMerge>
                    </filter>
                </defs>

                {/* Left Brain Half - Cyan circuit pattern */}
                <g filter="url(#glow)">
                    {/* Main left brain outline */}
                    <path
                        d="M32 8 C20 8, 10 18, 10 32 C10 46, 20 56, 32 56"
                        stroke="url(#brainGradientLeft)"
                        strokeWidth="2"
                        fill="none"
                        strokeLinecap="round"
                    />

                    {/* Left brain circuit lines */}
                    <path
                        d="M32 16 L24 16 L24 24 L16 24"
                        stroke="url(#brainGradientLeft)"
                        strokeWidth="2"
                        fill="none"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                    />
                    <path
                        d="M32 28 L20 28 L20 36 L14 36"
                        stroke="url(#brainGradientLeft)"
                        strokeWidth="2"
                        fill="none"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                    />
                    <path
                        d="M32 40 L22 40 L22 48 L18 48"
                        stroke="url(#brainGradientLeft)"
                        strokeWidth="2"
                        fill="none"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                    />

                    {/* Left circuit nodes */}
                    <circle cx="16" cy="24" r="2.5" fill="url(#brainGradientLeft)" />
                    <circle cx="14" cy="36" r="2.5" fill="url(#brainGradientLeft)" />
                    <circle cx="18" cy="48" r="2.5" fill="url(#brainGradientLeft)" />
                    <circle cx="24" cy="16" r="2" fill="url(#brainGradientLeft)" />
                    <circle cx="20" cy="28" r="2" fill="url(#brainGradientLeft)" />
                    <circle cx="22" cy="40" r="2" fill="url(#brainGradientLeft)" />
                </g>

                {/* Right Brain Half - Green/Teal circuit pattern */}
                <g filter="url(#glow)">
                    {/* Main right brain outline */}
                    <path
                        d="M32 8 C44 8, 54 18, 54 32 C54 46, 44 56, 32 56"
                        stroke="url(#brainGradientRight)"
                        strokeWidth="2"
                        fill="none"
                        strokeLinecap="round"
                    />

                    {/* Right brain circuit lines */}
                    <path
                        d="M32 16 L40 16 L40 24 L48 24"
                        stroke="url(#brainGradientRight)"
                        strokeWidth="2"
                        fill="none"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                    />
                    <path
                        d="M32 28 L44 28 L44 36 L50 36"
                        stroke="url(#brainGradientRight)"
                        strokeWidth="2"
                        fill="none"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                    />
                    <path
                        d="M32 40 L42 40 L42 48 L46 48"
                        stroke="url(#brainGradientRight)"
                        strokeWidth="2"
                        fill="none"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                    />

                    {/* Right circuit nodes */}
                    <circle cx="48" cy="24" r="2.5" fill="url(#brainGradientRight)" />
                    <circle cx="50" cy="36" r="2.5" fill="url(#brainGradientRight)" />
                    <circle cx="46" cy="48" r="2.5" fill="url(#brainGradientRight)" />
                    <circle cx="40" cy="16" r="2" fill="url(#brainGradientRight)" />
                    <circle cx="44" cy="28" r="2" fill="url(#brainGradientRight)" />
                    <circle cx="42" cy="40" r="2" fill="url(#brainGradientRight)" />
                </g>

                {/* Center line (corpus callosum) */}
                <line
                    x1="32" y1="12"
                    x2="32" y2="52"
                    stroke="url(#brainGradientLeft)"
                    strokeWidth="1.5"
                    strokeDasharray="4 2"
                    opacity="0.6"
                />
            </svg>

            {/* NoBrain Text */}
            {showText && (
                <span className={`font-bold text-white ${textSize} tracking-tight`}>
                    NoBrain
                </span>
            )}
        </div>
    );
}
