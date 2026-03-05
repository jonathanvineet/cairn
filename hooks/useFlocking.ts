// Boids flocking algorithm for drone swarm
import { useRef } from "react";
import * as THREE from "three";

export interface Boid {
  position: THREE.Vector3;
  velocity: THREE.Vector3;
  acceleration: THREE.Vector3;
}

interface FlockingParams {
  separationWeight: number;
  alignmentWeight: number;
  cohesionWeight: number;
  maxSpeed: number;
  maxForce: number;
  neighborRadius: number;
}

const DEFAULT_PARAMS: FlockingParams = {
  separationWeight: 1.8,
  alignmentWeight: 1.0,
  cohesionWeight: 1.2,
  maxSpeed: 0.18,
  maxForce: 0.012,
  neighborRadius: 5,
};

export function useFlocking(boids: Boid[], params: Partial<FlockingParams> = {}) {
  const config = { ...DEFAULT_PARAMS, ...params };
  const tempVec = useRef(new THREE.Vector3());
  
  const separation = (boid: Boid, neighbors: Boid[]): THREE.Vector3 => {
    const steer = new THREE.Vector3();
    let count = 0;
    
    for (const neighbor of neighbors) {
      const distance = boid.position.distanceTo(neighbor.position);
      if (distance > 0 && distance < config.neighborRadius) {
        const diff = tempVec.current.subVectors(boid.position, neighbor.position);
        diff.normalize();
        diff.divideScalar(distance); // Weight by distance
        steer.add(diff);
        count++;
      }
    }
    
    if (count > 0) {
      steer.divideScalar(count);
    }
    
    if (steer.length() > 0) {
      steer.normalize();
      steer.multiplyScalar(config.maxSpeed);
      steer.sub(boid.velocity);
      steer.clampLength(0, config.maxForce);
    }
    
    return steer;
  };
  
  const alignment = (boid: Boid, neighbors: Boid[]): THREE.Vector3 => {
    const steer = new THREE.Vector3();
    let count = 0;
    
    for (const neighbor of neighbors) {
      const distance = boid.position.distanceTo(neighbor.position);
      if (distance > 0 && distance < config.neighborRadius) {
        steer.add(neighbor.velocity);
        count++;
      }
    }
    
    if (count > 0) {
      steer.divideScalar(count);
      steer.normalize();
      steer.multiplyScalar(config.maxSpeed);
      steer.sub(boid.velocity);
      steer.clampLength(0, config.maxForce);
    }
    
    return steer;
  };
  
  const cohesion = (boid: Boid, neighbors: Boid[]): THREE.Vector3 => {
    const steer = new THREE.Vector3();
    let count = 0;
    
    for (const neighbor of neighbors) {
      const distance = boid.position.distanceTo(neighbor.position);
      if (distance > 0 && distance < config.neighborRadius) {
        steer.add(neighbor.position);
        count++;
      }
    }
    
    if (count > 0) {
      steer.divideScalar(count);
      steer.sub(boid.position);
      steer.normalize();
      steer.multiplyScalar(config.maxSpeed);
      steer.sub(boid.velocity);
      steer.clampLength(0, config.maxForce);
    }
    
    return steer;
  };
  
  const update = () => {
    boids.forEach((boid, index) => {
      const neighbors = boids.filter((_, i) => i !== index);
      
      const separationForce = separation(boid, neighbors).multiplyScalar(config.separationWeight);
      const alignmentForce = alignment(boid, neighbors).multiplyScalar(config.alignmentWeight);
      const cohesionForce = cohesion(boid, neighbors).multiplyScalar(config.cohesionWeight);
      
      boid.acceleration.add(separationForce);
      boid.acceleration.add(alignmentForce);
      boid.acceleration.add(cohesionForce);
      
      // Update velocity
      boid.velocity.add(boid.acceleration);
      boid.velocity.clampLength(0, config.maxSpeed);
      
      // Update position
      boid.position.add(boid.velocity);
      
      // Reset acceleration
      boid.acceleration.set(0, 0, 0);
      
      // Keep drones within patrol altitude
      if (boid.position.y < 18) boid.position.y = 18;
      if (boid.position.y > 24) boid.position.y = 24;
    });
  };
  
  return { update };
}
