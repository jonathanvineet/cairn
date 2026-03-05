// Breach spawn management hook
import { useState, useEffect, useCallback, useRef } from "react";
import { useUIStore } from "@/stores/uiStore";

export interface BreachPoint {
  id: string;
  position: [number, number, number];
  spawnTime: number;
  isActive: boolean;
}

const MIN_SPAWN_INTERVAL = 15000; // 15 seconds
const MAX_SPAWN_INTERVAL = 45000; // 45 seconds
const BREACH_LIFETIME = 120000; // 2 minutes
const MAX_ACTIVE_BREACHES = 6;
const FOREST_RADIUS = 300;

export function useBreachSpawn() {
  const [breaches, setBreaches] = useState<BreachPoint[]>([]);
  const incrementBreachCount = useUIStore((state) => state.incrementBreachCount);
  const spawnBreachRef = useRef<() => void>(() => {});
  
  spawnBreachRef.current = () => {
    setBreaches((prev) => {
      const activeBreaches = prev.filter((b) => b.isActive);
      if (activeBreaches.length >= MAX_ACTIVE_BREACHES) return prev;
      
      // Spawn at forest edge (avoiding center 80x80 clearing)
      const angle = Math.random() * Math.PI * 2;
      const distance = FOREST_RADIUS + Math.random() * 100 - 50;
      const x = Math.cos(angle) * distance;
      const z = Math.sin(angle) * distance;
      const y = 14 + Math.random() * 4; // Float between 14-18 units
      
      const newBreach: BreachPoint = {
        id: `breach-${Date.now()}-${Math.random()}`,
        position: [x, y, z],
        spawnTime: Date.now(),
        isActive: true,
      };
      
      incrementBreachCount();
      return [...prev, newBreach];
    });
    
    // Schedule next spawn
    const nextSpawnDelay = MIN_SPAWN_INTERVAL + Math.random() * (MAX_SPAWN_INTERVAL - MIN_SPAWN_INTERVAL);
    setTimeout(() => spawnBreachRef.current?.(), nextSpawnDelay);
  };
  
  const removeBreach = useCallback((id: string) => {
    setBreaches((prev) => prev.filter((b) => b.id !== id));
  }, []);
  
  const markBreachResolved = useCallback((id: string) => {
    setBreaches((prev) =>
      prev.map((b) => (b.id === id ? { ...b, isActive: false } : b))
    );
  }, []);
  
  // Cleanup expired breaches
  useEffect(() => {
    const cleanupInterval = setInterval(() => {
      const now = Date.now();
      setBreaches((prev) =>
        prev.filter((b) => now - b.spawnTime < BREACH_LIFETIME)
      );
    }, 5000);
    
    return () => clearInterval(cleanupInterval);
  }, []);
  
  // Initial spawn
  useEffect(() => {
    const initialDelay = setTimeout(() => {
      spawnBreachRef.current?.();
    }, 3000); // Wait 3 seconds after scene load
    
    return () => clearTimeout(initialDelay);
  }, []);
  
  return {
    breaches,
    removeBreach,
    markBreachResolved,
    activeBreaches: breaches.filter((b) => b.isActive),
  };
}
