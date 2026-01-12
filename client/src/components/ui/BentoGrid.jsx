"use client";
import React, { useRef, useEffect, useState } from "react";
import { cn } from "../lib/utils";

/**
 * BentoGrid - Container for Bento-style feature tiles
 * Provides a responsive grid layout with configurable columns
 */
export function BentoGrid({ children, className }) {
    return (
        <div
            className={cn(
                "grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 w-full max-w-5xl mx-auto px-4",
                className
            )}
        >
            {children}
        </div>
    );
}

/**
 * BentoTile - Individual glassmorphism tile for the Bento Grid
 * Supports large (2-column) and regular sizes
 * Now includes lazy loading with IntersectionObserver
 */
export function BentoTile({
    children,
    className,
    variant = "default", // "large" spans 2 columns
    icon,
    title,
    description,
    staggerIndex = 0, // For staggered animation delays
    enableLazy = true, // Enable lazy loading animation
}) {
    const tileRef = useRef(null);
    const [isVisible, setIsVisible] = useState(!enableLazy);

    useEffect(() => {
        if (!enableLazy) return;

        const element = tileRef.current;
        if (!element) return;

        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        setIsVisible(true);
                        observer.unobserve(entry.target);
                    }
                });
            },
            {
                threshold: 0.1,
                rootMargin: '50px',
            }
        );

        observer.observe(element);

        return () => {
            if (element) {
                observer.unobserve(element);
            }
        };
    }, [enableLazy]);

    return (
        <div
            ref={tileRef}
            className={cn(
                // Base styles
                "relative group rounded-2xl overflow-hidden",
                // Glassmorphism
                "bg-white/[0.08] backdrop-blur-[16px]",
                "border border-white/[0.08]",
                // Sizing
                "p-6 md:p-8",
                // Performance optimizations
                "bento-tile will-change-transform",
                // Transitions
                "transition-all duration-300 ease-out",
                // Hover effects
                "hover:bg-white/[0.12] hover:border-white/[0.15]",
                "hover:scale-[1.02] hover:shadow-lg hover:shadow-white/5",
                // Large variant spans 2 columns
                variant === "large" && "md:col-span-2",
                // Lazy loading animation
                enableLazy && !isVisible && "opacity-0 translate-y-5",
                enableLazy && isVisible && "opacity-100 translate-y-0",
                className
            )}
            style={{
                transitionDelay: isVisible ? `${staggerIndex * 100}ms` : '0ms',
            }}
        >
            {/* Subtle glow on hover */}
            <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 via-purple-500/5 to-transparent" />
            </div>

            {/* Content */}
            <div className="relative z-10 flex flex-col h-full">
                {/* Icon */}
                {icon && (
                    <div className="mb-4 text-gray-400 group-hover:text-gray-300 transition-colors">
                        {icon}
                    </div>
                )}

                {/* Title */}
                {title && (
                    <h3 className="text-xl md:text-2xl font-bold text-white mb-2 group-hover:text-gray-100 transition-colors">
                        {title}
                    </h3>
                )}

                {/* Description */}
                {description && (
                    <p className="text-gray-400 text-sm md:text-base mb-4 group-hover:text-gray-300 transition-colors">
                        {description}
                    </p>
                )}

                {/* Custom content / Preview slot */}
                {children}
            </div>
        </div>
    );
}

export default BentoGrid;
