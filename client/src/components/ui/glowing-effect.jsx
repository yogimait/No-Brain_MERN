"use client";
import { memo, useCallback, useEffect, useRef } from "react";
import { cn } from "../lib/utils";
import { animate } from "motion/react";

const GlowingEffect = memo(({
    blur = 0,
    inactiveZone = 0.7,
    proximity = 0,
    spread = 20,
    variant = "default",
    glow = false,
    className,
    disabled = true,
    movementDuration = 2,
    borderWidth = 1,
}) => {
    const containerRef = useRef(null);
    const lastPosition = useRef({ x: 0, y: 0 });
    const animationFrameRef = useRef(0);

    const handleMove = useCallback(
        (e) => {
            if (!containerRef.current) return;

            if (animationFrameRef.current) {
                cancelAnimationFrame(animationFrameRef.current);
            }

            animationFrameRef.current = requestAnimationFrame(() => {
                const element = containerRef.current;
                if (!element) return;

                const { left, top, width, height } = element.getBoundingClientRect();
                const mouseX = e?.x ?? lastPosition.current.x;
                const mouseY = e?.y ?? lastPosition.current.y;

                if (e) {
                    lastPosition.current = { x: mouseX, y: mouseY };
                }

                const center = [left + width * 0.5, top + height * 0.5];
                const distanceFromCenter = Math.hypot(
                    mouseX - center[0],
                    mouseY - center[1]
                );
                const inactiveRadius = 0.5 * Math.min(width, height) * inactiveZone;

                if (distanceFromCenter < inactiveRadius) {
                    element.style.setProperty("--active", "0");
                    return;
                }

                const isActive =
                    mouseX > left - proximity &&
                    mouseX < left + width + proximity &&
                    mouseY > top - proximity &&
                    mouseY < top + height + proximity;

                element.style.setProperty("--active", isActive ? "1" : "0");

                if (!isActive) return;

                const currentAngle =
                    parseFloat(element.style.getPropertyValue("--start")) || 0;
                let targetAngle =
                    (180 * Math.atan2(mouseY - center[1], mouseX - center[0])) /
                    Math.PI +
                    90;

                const angleDiff = ((targetAngle - currentAngle + 180) % 360) - 180;
                const newAngle = currentAngle + angleDiff;

                animate(currentAngle, newAngle, {
                    duration: movementDuration,
                    ease: [0.16, 1, 0.3, 1],
                    onUpdate: (value) => {
                        element.style.setProperty("--start", String(value));
                    },
                });
            });
        },
        [inactiveZone, proximity, movementDuration]
    );

    useEffect(() => {
        if (disabled) return;

        window.addEventListener("mousemove", handleMove);
        window.addEventListener("scroll", handleMove);

        return () => {
            if (animationFrameRef.current) {
                cancelAnimationFrame(animationFrameRef.current);
            }
            window.removeEventListener("mousemove", handleMove);
            window.removeEventListener("scroll", handleMove);
        };
    }, [handleMove, disabled]);

    return (
        <>
            <div
                className={cn(
                    "pointer-events-none absolute -inset-px hidden rounded-[inherit] border opacity-0 transition-opacity duration-300 [--active:0] [--start:0] md:block",
                    glow && "opacity-[calc(var(--active)*0.3)]",
                    variant === "white" && "border-white",
                    className
                )}
                ref={containerRef}
            />
            <div
                className={cn(
                    "pointer-events-none absolute -inset-px hidden rounded-[inherit] opacity-0 blur-md transition-opacity duration-300 md:block",
                    glow && "opacity-[calc(var(--active)*0.3)]",
                    variant === "white" && "[background:conic-gradient(from_calc(var(--start)*1deg),#ffffff22_0deg,#ffffff88_60deg,#ffffff22_120deg)]"
                )}
                style={{
                    background:
                        variant === "default"
                            ? `conic-gradient(from calc(var(--start) * 1deg), transparent 0deg, #3b82f680 60deg, transparent 120deg)`
                            : undefined,
                }}
            />
            <div
                className="pointer-events-none absolute inset-0 rounded-[inherit]"
                style={{
                    padding: borderWidth,
                    WebkitMask:
                        "linear-gradient(black, black) content-box, linear-gradient(black, black)",
                    WebkitMaskComposite: "xor",
                    maskComposite: "exclude",
                    background:
                        variant === "default"
                            ? `conic-gradient(from calc(var(--start) * 1deg), transparent 0deg, #3b82f6 ${60 - spread}deg, white ${60}deg, #3b82f6 ${60 + spread}deg, transparent 120deg)`
                            : `conic-gradient(from calc(var(--start) * 1deg), transparent 0deg, white ${60 - spread}deg, white ${60}deg, white ${60 + spread}deg, transparent 120deg)`,
                    filter: `blur(${blur}px)`,
                    opacity: `calc(var(--active) * 1)`,
                    transition: "opacity 0.3s ease",
                }}
            />
        </>
    );
});

GlowingEffect.displayName = "GlowingEffect";

export { GlowingEffect };
