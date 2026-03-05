// Spatial audio hook using Howler.js
import { useEffect, useRef } from "react";
import { Howl } from "howler";

interface SpatialAudioOptions {
  src: string;
  volume?: number;
  loop?: boolean;
  autoplay?: boolean;
}

export function useSpatialAudio(options: SpatialAudioOptions) {
  const soundRef = useRef<Howl | null>(null);
  
  useEffect(() => {
    // Lazy load after first user gesture
    const initSound = () => {
      if (!soundRef.current) {
        soundRef.current = new Howl({
          src: [options.src],
          volume: options.volume ?? 0.5,
          loop: options.loop ?? false,
          autoplay: options.autoplay ?? false,
          html5: true,
        });
      }
    };
    
    const handleUserGesture = () => {
      initSound();
      document.removeEventListener("click", handleUserGesture);
      document.removeEventListener("scroll", handleUserGesture);
    };
    
    document.addEventListener("click", handleUserGesture);
    document.addEventListener("scroll", handleUserGesture);
    
    return () => {
      document.removeEventListener("click", handleUserGesture);
      document.removeEventListener("scroll", handleUserGesture);
      if (soundRef.current) {
        soundRef.current.unload();
      }
    };
  }, [options.src, options.volume, options.loop, options.autoplay]);
  
  const play = (pos?: { x: number; y: number; z: number }) => {
    if (!soundRef.current) return;
    
    if (pos) {
      soundRef.current.pos(pos.x, pos.y, pos.z);
    }
    
    soundRef.current.play();
  };
  
  const stop = () => {
    if (soundRef.current) {
      soundRef.current.stop();
    }
  };
  
  const updatePosition = (pos: { x: number; y: number; z: number }) => {
    if (soundRef.current) {
      soundRef.current.pos(pos.x, pos.y, pos.z);
    }
  };
  
  return { play, stop, updatePosition };
}
