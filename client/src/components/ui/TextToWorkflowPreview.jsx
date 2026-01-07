"use client";
import React, { useState, useRef, useEffect } from "react";
import { cn } from "../lib/utils";

/**
 * TextToWorkflowPreview - Animated SVG micro-preview
 * Shows text being typed, nodes appearing, and edges connecting
 * Animation plays on hover, paused by default
 */
export function TextToWorkflowPreview({ className }) {
    const [isPlaying, setIsPlaying] = useState(false);
    const [hasPlayedOnce, setHasPlayedOnce] = useState(false);
    const containerRef = useRef(null);

    // Intersection Observer for scroll-into-view trigger
    useEffect(() => {
        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting && !hasPlayedOnce) {
                    setIsPlaying(true);
                    setHasPlayedOnce(true);
                }
            },
            { threshold: 0.5 }
        );

        if (containerRef.current) {
            observer.observe(containerRef.current);
        }

        return () => observer.disconnect();
    }, [hasPlayedOnce]);

    const handleMouseEnter = () => setIsPlaying(true);
    const handleMouseLeave = () => {
        // Keep playing until animation completes, then pause
        setTimeout(() => setIsPlaying(false), 5000);
    };

    return (
        <div
            ref={containerRef}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
            className={cn(
                "relative w-full h-48 md:h-56 rounded-xl overflow-hidden",
                "bg-black/20 border border-white/5",
                className
            )}
        >
            {/* SVG Animation Container */}
            <svg
                viewBox="0 0 400 180"
                className="w-full h-full"
                preserveAspectRatio="xMidYMid meet"
            >
                <defs>
                    {/* Gradient for edge line */}
                    <linearGradient id="edgeGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" stopColor="#6366f1" />
                        <stop offset="100%" stopColor="#a855f7" />
                    </linearGradient>

                    {/* Glow filter */}
                    <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
                        <feGaussianBlur stdDeviation="3" result="coloredBlur" />
                        <feMerge>
                            <feMergeNode in="coloredBlur" />
                            <feMergeNode in="SourceGraphic" />
                        </feMerge>
                    </filter>
                </defs>

                {/* Typing Text Animation */}
                <g className={cn(isPlaying ? "animate-fadeIn" : "opacity-0")}>
                    <rect
                        x="30"
                        y="15"
                        width="340"
                        height="30"
                        rx="6"
                        fill="rgba(255,255,255,0.05)"
                        stroke="rgba(255,255,255,0.1)"
                        strokeWidth="1"
                    />
                    <text
                        x="45"
                        y="35"
                        fill="#9ca3af"
                        fontSize="12"
                        fontFamily="monospace"
                        className={cn(isPlaying ? "animate-typing" : "")}
                    >
                        <tspan className="typing-text">
                            Create a workflow with API + Database
                        </tspan>
                    </text>
                    {/* Cursor */}
                    <rect
                        x="290"
                        y="22"
                        width="2"
                        height="16"
                        fill="#6366f1"
                        className={cn(isPlaying ? "animate-blink" : "opacity-0")}
                    />
                </g>

                {/* Node 1: API */}
                <g
                    className={cn(
                        "transition-all duration-500",
                        isPlaying ? "animate-nodeAppear1" : "opacity-0 scale-0"
                    )}
                    style={{ transformOrigin: "100px 110px" }}
                >
                    <rect
                        x="60"
                        y="80"
                        width="80"
                        height="60"
                        rx="12"
                        fill="rgba(99, 102, 241, 0.2)"
                        stroke="#6366f1"
                        strokeWidth="2"
                        filter="url(#glow)"
                    />
                    <text x="100" y="115" textAnchor="middle" fill="#e0e7ff" fontSize="14" fontWeight="600">
                        API
                    </text>
                    {/* Icon placeholder */}
                    <circle cx="100" cy="95" r="6" fill="#6366f1" opacity="0.6" />
                </g>

                {/* Node 2: Database */}
                <g
                    className={cn(
                        "transition-all duration-500",
                        isPlaying ? "animate-nodeAppear2" : "opacity-0 scale-0"
                    )}
                    style={{ transformOrigin: "300px 110px" }}
                >
                    <rect
                        x="260"
                        y="80"
                        width="80"
                        height="60"
                        rx="12"
                        fill="rgba(168, 85, 247, 0.2)"
                        stroke="#a855f7"
                        strokeWidth="2"
                        filter="url(#glow)"
                    />
                    <text x="300" y="115" textAnchor="middle" fill="#f3e8ff" fontSize="14" fontWeight="600">
                        Database
                    </text>
                    {/* Icon placeholder */}
                    <circle cx="300" cy="95" r="6" fill="#a855f7" opacity="0.6" />
                </g>

                {/* Edge Connection */}
                <g className={cn(isPlaying ? "animate-edgeDraw" : "opacity-0")}>
                    <line
                        x1="140"
                        y1="110"
                        x2="260"
                        y2="110"
                        stroke="url(#edgeGradient)"
                        strokeWidth="3"
                        strokeLinecap="round"
                        strokeDasharray="120"
                        strokeDashoffset={isPlaying ? "0" : "120"}
                        className="transition-all duration-1000 ease-out"
                        style={{ transitionDelay: "1.5s" }}
                    />
                    {/* Arrow head */}
                    <polygon
                        points="255,105 265,110 255,115"
                        fill="#a855f7"
                        className={cn(
                            "transition-opacity duration-300",
                            isPlaying ? "animate-arrowAppear" : "opacity-0"
                        )}
                    />
                </g>

                {/* Success pulse */}
                <circle
                    cx="200"
                    cy="110"
                    r="8"
                    fill="#22c55e"
                    className={cn(isPlaying ? "animate-successPulse" : "opacity-0")}
                />
            </svg>

            {/* Play indicator when paused */}
            {!isPlaying && !hasPlayedOnce && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                    <div className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center backdrop-blur-sm border border-white/20">
                        <svg
                            className="w-5 h-5 text-white ml-1"
                            fill="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path d="M8 5v14l11-7z" />
                        </svg>
                    </div>
                </div>
            )}

            {/* Custom CSS for animations */}
            <style>{`
        @keyframes fadeIn {
          0% { opacity: 0; }
          100% { opacity: 1; }
        }
        
        @keyframes typing {
          0% { opacity: 0; }
          10% { opacity: 1; }
          100% { opacity: 1; }
        }
        
        @keyframes blink {
          0%, 100% { opacity: 1; }
          50% { opacity: 0; }
        }
        
        @keyframes nodeAppear1 {
          0% { opacity: 0; transform: scale(0.5) translateY(10px); }
          50% { opacity: 0; transform: scale(0.5) translateY(10px); }
          70% { opacity: 1; transform: scale(1.1) translateY(0); }
          100% { opacity: 1; transform: scale(1) translateY(0); }
        }
        
        @keyframes nodeAppear2 {
          0%, 60% { opacity: 0; transform: scale(0.5) translateY(10px); }
          80% { opacity: 1; transform: scale(1.1) translateY(0); }
          100% { opacity: 1; transform: scale(1) translateY(0); }
        }
        
        @keyframes edgeDraw {
          0%, 70% { opacity: 0; stroke-dashoffset: 120; }
          100% { opacity: 1; stroke-dashoffset: 0; }
        }
        
        @keyframes arrowAppear {
          0%, 85% { opacity: 0; }
          100% { opacity: 1; }
        }
        
        @keyframes successPulse {
          0%, 90% { opacity: 0; transform: scale(0); }
          95% { opacity: 1; transform: scale(1.5); }
          100% { opacity: 0; transform: scale(2); }
        }
        
        .animate-fadeIn { animation: fadeIn 0.5s ease-out forwards; }
        .animate-typing { animation: typing 1.5s ease-out forwards; }
        .animate-blink { animation: blink 0.8s ease-in-out infinite; }
        .animate-nodeAppear1 { animation: nodeAppear1 2s ease-out forwards; }
        .animate-nodeAppear2 { animation: nodeAppear2 2.5s ease-out forwards; }
        .animate-edgeDraw { animation: edgeDraw 3.5s ease-out forwards; }
        .animate-arrowAppear { animation: arrowAppear 4s ease-out forwards; }
        .animate-successPulse { animation: successPulse 5s ease-out forwards; }
      `}</style>
        </div>
    );
}

export default TextToWorkflowPreview;
