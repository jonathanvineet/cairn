// Scroll velocity hook - converts scroll to forward flight speed
import { useEffect } from "react";
import { useWorldStore } from "@/stores/worldStore";

export function useScrollVelocity() {
  useEffect(() => {
    let lastScrollY = window.scrollY;
    let scrollVelocity = 0;
    let animationFrame: number;
    
    const updateVelocity = () => {
      const currentScrollY = window.scrollY;
      const delta = currentScrollY - lastScrollY;
      
      // Calculate velocity (capped at 1.0 for max speed)
      scrollVelocity = Math.min(Math.abs(delta) * 0.015, 1.0);
      
      // Decay velocity smoothly
      scrollVelocity *= 0.92;
      
      lastScrollY = currentScrollY;
      
      // Update store
      useWorldStore.getState().setScrollSpeed(scrollVelocity);
      
      animationFrame = requestAnimationFrame(updateVelocity);
    };
    
    animationFrame = requestAnimationFrame(updateVelocity);
    
    return () => {
      if (animationFrame) {
        cancelAnimationFrame(animationFrame);
      }
    };
  }, []);
  
  return useWorldStore((state) => state.scrollSpeed);
}
