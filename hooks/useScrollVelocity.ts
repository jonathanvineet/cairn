// Scroll velocity hook - converts scroll to forward/backward flight speed
import { useEffect, useRef } from "react";
import { useWorldStore } from "@/stores/worldStore";

export function useScrollVelocity() {
  const scrollSpeed = useWorldStore((state) => state.scrollSpeed);
  const lastScrollY = useRef(0);
  const velocity = useRef(0);

  useEffect(() => {
    lastScrollY.current = window.scrollY;
    let animationFrame: number;

    const updateVelocity = () => {
      const currentScrollY = window.scrollY;
      const delta = currentScrollY - lastScrollY.current;

      // Calculate signed velocity (positive for down, negative for up)
      // Multiply by a factor to make it feel responsive
      const targetVelocity = delta * 0.015;

      // Smoothly interpolate towards target velocity
      velocity.current = velocity.current * 0.85 + targetVelocity * 0.15;

      // Decay velocity when not scrolling
      if (Math.abs(delta) < 1) {
        velocity.current *= 0.95;
      }

      // Clamp velocity but allow reverse (up to -0.5 for backflight)
      const clampedVelocity = Math.max(Math.min(velocity.current, 1.2), -0.6);

      lastScrollY.current = currentScrollY;

      // Update store only if change is significant to reduce re-renders
      const currentStoredSpeed = useWorldStore.getState().scrollSpeed;
      if (Math.abs(clampedVelocity - currentStoredSpeed) > 0.001) {
        useWorldStore.getState().setScrollSpeed(clampedVelocity);
      }

      animationFrame = requestAnimationFrame(updateVelocity);
    };

    animationFrame = requestAnimationFrame(updateVelocity);

    return () => {
      if (animationFrame) {
        cancelAnimationFrame(animationFrame);
      }
    };
  }, []);

  return scrollSpeed;
}
