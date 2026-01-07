import { useEffect, useRef } from 'react';
import Lenis from 'lenis';

/**
 * SmoothScroll - A local wrapper component for Lenis smooth scrolling
 * Use this ONLY on pages that need smooth scrolling (like Landing Page)
 * DO NOT use on pages with:
 * - React Flow canvas
 * - Interactive editors
 * - Multiple nested scroll containers
 * - Modals/dialogs
 */
export function SmoothScroll({ children, className = '' }) {
    const wrapperRef = useRef(null);
    const lenisRef = useRef(null);

    useEffect(() => {
        // Only initialize if we have a wrapper element
        if (!wrapperRef.current) return;

        // Initialize Lenis with optimized settings for performance
        const lenis = new Lenis({
            wrapper: wrapperRef.current,
            content: wrapperRef.current.firstChild,
            duration: 1.0, // Reduced from 1.2 for snappier feel
            easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
            orientation: 'vertical',
            gestureOrientation: 'vertical',
            smoothWheel: true,
            wheelMultiplier: 0.8, // Reduced for less aggressive scroll
            touchMultiplier: 1.5,
            infinite: false,
        });

        lenisRef.current = lenis;

        // Animation frame loop
        let rafId;
        function raf(time) {
            lenis.raf(time);
            rafId = requestAnimationFrame(raf);
        }
        rafId = requestAnimationFrame(raf);

        // Cleanup on unmount
        return () => {
            cancelAnimationFrame(rafId);
            lenis.destroy();
            lenisRef.current = null;
        };
    }, []);

    return (
        <div
            ref={wrapperRef}
            className={`h-screen overflow-y-auto overflow-x-hidden ${className}`}
            style={{ overscrollBehavior: 'contain' }}
        >
            <div>
                {children}
            </div>
        </div>
    );
}

export default SmoothScroll;
