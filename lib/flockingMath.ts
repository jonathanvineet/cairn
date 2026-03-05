// Flocking math utilities - vector operations for boids
import * as THREE from "three";

export function limit(vec: THREE.Vector3, max: number): THREE.Vector3 {
  const magSq = vec.lengthSq();
  if (magSq > max * max) {
    vec.normalize().multiplyScalar(max);
  }
  return vec;
}

export function setMag(vec: THREE.Vector3, mag: number): THREE.Vector3 {
  return vec.normalize().multiplyScalar(mag);
}

export function heading(vec: THREE.Vector3): number {
  return Math.atan2(vec.z, vec.x);
}

export function wrapBounds(
  position: THREE.Vector3,
  bounds: { min: THREE.Vector3; max: THREE.Vector3 }
): void {
  if (position.x < bounds.min.x) position.x = bounds.max.x;
  if (position.x > bounds.max.x) position.x = bounds.min.x;
  if (position.z < bounds.min.z) position.z = bounds.max.z;
  if (position.z > bounds.max.z) position.z = bounds.min.z;
}

export function clampToBounds(
  position: THREE.Vector3,
  bounds: { min: THREE.Vector3; max: THREE.Vector3 }
): void {
  position.x = Math.max(bounds.min.x, Math.min(bounds.max.x, position.x));
  position.y = Math.max(bounds.min.y, Math.min(bounds.max.y, position.y));
  position.z = Math.max(bounds.min.z, Math.min(bounds.max.z, position.z));
}
