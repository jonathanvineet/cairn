"use client";

import { useRef, useEffect, useState, memo } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { useFlocking, type Boid } from "@/hooks/useFlocking";
import { DroneAgent } from "./DroneAgent";
import type { DroneRecord } from "../world/WorldOrchestrator";

interface DroneSwarmProps {
  drones: DroneRecord[];
  registeredDroneData?: DroneRecord | null;
}

interface ActiveDroneEntry {
  drone: DroneRecord;
  boid: Boid;
  spawnProgress: number;
}

export const DroneSwarm = memo(function DroneSwarm({ drones, registeredDroneData }: DroneSwarmProps) {
  // Initialize boids array that will be shared with flocking
  const initialBoids: Boid[] = [];
  const boidsRef = useRef<Boid[]>(initialBoids);
  const spawnQueueRef = useRef<DroneRecord[]>([]);
  const activeDronesRef = useRef<Map<string, ActiveDroneEntry>>(new Map());
  
  // State for rendering - this triggers re-renders when drones are added
  const [activeDronesArray, setActiveDronesArray] = useState<ActiveDroneEntry[]>([]);
  
  // Initialize flocking with the same array reference
  const flocking = useFlocking(initialBoids);
  
  // Initialize boids for existing drones
  useEffect(() => {
    const existingDrones = drones.slice(0, 6); // Start with 6 pre-existing drones
    let hasChanges = false;
    
    existingDrones.forEach((drone, i) => {
      if (!activeDronesRef.current.has(drone.cairnDroneId)) {
        const angle = (i / existingDrones.length) * Math.PI * 2;
        const radius = 100;
        
        const boid: Boid = {
          position: new THREE.Vector3(
            Math.cos(angle) * radius,
            18 + Math.random() * 6,
            Math.sin(angle) * radius
          ),
          velocity: new THREE.Vector3(
            (Math.random() - 0.5) * 0.1,
            0,
            (Math.random() - 0.5) * 0.1
          ),
          acceleration: new THREE.Vector3(),
        };
        
        boidsRef.current.push(boid);
        activeDronesRef.current.set(drone.cairnDroneId, { drone, boid, spawnProgress: 1 });
        hasChanges = true;
      }
    });
    
    if (hasChanges) {
      setActiveDronesArray(Array.from(activeDronesRef.current.values()));
    }
  }, [drones]);
  
  // Handle new drone registration
  useEffect(() => {
    if (registeredDroneData && registeredDroneData.cairnDroneId) {
      const newDrone = registeredDroneData as DroneRecord;
      
      if (!activeDronesRef.current.has(newDrone.cairnDroneId)) {
        spawnQueueRef.current.push(newDrone);
      }
    }
  }, [registeredDroneData]);
  
  useFrame((state, delta) => {
    let needsUpdate = false;
    
    // Process spawn queue
    if (spawnQueueRef.current.length > 0) {
      const newDrone = spawnQueueRef.current.shift()!;
      const camera = state.camera;
      
      const boid: Boid = {
        position: new THREE.Vector3(
          camera.position.x,
          camera.position.y - 2,
          camera.position.z - 8
        ),
        velocity: new THREE.Vector3(0, 0, 0),
        acceleration: new THREE.Vector3(),
      };
      
      boidsRef.current.push(boid);
      activeDronesRef.current.set(newDrone.cairnDroneId, { drone: newDrone, boid, spawnProgress: 0 });
      needsUpdate = true;
    }
    
    // Update spawn progress
    activeDronesRef.current.forEach((entry) => {
      if (entry.spawnProgress < 1) {
        entry.spawnProgress = Math.min(1, entry.spawnProgress + delta * 0.4);
        needsUpdate = true;
      }
    });
    
    // Update flocking behavior
    flocking.update();
    
    // Boundary pull - keep drones within patrol perimeter
    boidsRef.current.forEach((boid) => {
      const distFromCenter = Math.sqrt(boid.position.x ** 2 + boid.position.z ** 2);
      if (distFromCenter > 200) {
        const pullDirection = new THREE.Vector3(-boid.position.x, 0, -boid.position.z).normalize();
        boid.acceleration.add(pullDirection.multiplyScalar(0.015));
      }
    });
    
    // Update state if needed (throttle to every 10 frames to avoid excessive re-renders)
    if (needsUpdate && state.clock.elapsedTime % 0.16 < delta) {
      setActiveDronesArray(Array.from(activeDronesRef.current.values()));
    }
  });
  
  return (
    <group>
      {activeDronesArray.map((entry, index) => (
        <DroneAgent
          key={entry.drone.cairnDroneId}
          drone={entry.drone}
          boid={entry.boid}
          index={index}
          spawnProgress={entry.spawnProgress}
        />
      ))}
    </group>
  );
});
