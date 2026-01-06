import { useEffect, useRef, useState } from 'react';

/**
 * Custom hook for lazy loading elements with IntersectionObserver
 * Returns a ref to attach to the element and a boolean indicating visibility
 */
export function useLazyLoad(options = {}) {
    const [isVisible, setIsVisible] = useState(false);
    const elementRef = useRef(null);

    useEffect(() => {
        const element = elementRef.current;
        if (!element) return;

        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        setIsVisible(true);
                        // Once visible, stop observing
                        observer.unobserve(entry.target);
                    }
                });
            },
            {
                threshold: options.threshold || 0.1,
                rootMargin: options.rootMargin || '50px',
                ...options,
            }
        );

        observer.observe(element);

        return () => {
            if (element) {
                observer.unobserve(element);
            }
        };
    }, [options.threshold, options.rootMargin]);

    return [elementRef, isVisible];
}

/**
 * Custom hook for staggered animations on multiple elements
 */
export function useStaggeredAnimation(itemCount, baseDelay = 100) {
    const getDelay = (index) => ({
        animationDelay: `${index * baseDelay}ms`,
    });

    return { getDelay };
}

export default useLazyLoad;
