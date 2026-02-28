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
                "relative group rounded-[var(--radius-lg)] overflow-hidden",
                // Blueprint Studio surface
                "bg-[#11172A] backdrop-blur-sm",
                "border border-[rgba(255,255,255,0.06)]",
                // Sizing
                "p-6 md:p-8",
                // Performance optimizations
                "bento-tile will-change-transform",
                // Transitions
                "transition-all ease-out",
                // Hover effects
                "hover:border-[rgba(255,255,255,0.12)]",
                "hover:-translate-y-1 hover:shadow-[var(--shadow-md)]",
                // Large variant spans 2 columns
                variant === "large" && "md:col-span-2",
                // Lazy loading animation
                enableLazy && !isVisible && "opacity-0 translate-y-4 scale-[0.98]",
                enableLazy && isVisible && "opacity-100 translate-y-0 scale-100",
                className
            )}
            style={{
                transitionDelay: isVisible ? `${staggerIndex * 100}ms` : '0ms',
                transitionDuration: 'var(--transition-normal)',
            }}
        >
            {/* Subtle glow on hover */}
            <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none">
                <div className="absolute inset-0 bg-gradient-to-br from-[rgba(34,211,238,0.08)] via-[rgba(167,139,250,0.04)] to-transparent" />
            </div>

            {/* Content */}
            <div className="relative z-10 flex flex-col h-full">
                {/* Icon */}
                {icon && (
                    <div className="mb-4 text-[#7E8BA3] group-hover:text-[#22D3EE] transition-colors">
                        {icon}
                    </div>
                )}

                {/* Title */}
                {title && (
                    <h3 className="text-xl md:text-2xl font-bold text-[#F3F6FF] mb-2">
                        {title}
                    </h3>
                )}

                {/* Description */}
                {description && (
                    <p className="text-[#B6C2D9] text-sm md:text-base mb-4">
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
