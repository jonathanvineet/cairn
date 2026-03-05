"use client";

import { useUIStore } from "@/stores/uiStore";

export function VoiceInputIndicator() {
  const voiceVolume = useUIStore((state) => state.voiceInput.volume);
  const interimText = useUIStore((state) => state.voiceInput.interimText);
  
  const bars = [0, 1, 2, 3];
  
  return (
    <div className="flex flex-col items-center gap-4 px-8 py-6 bg-[#0a1628]/90 border border-[#8b5cf6]/50 rounded-lg backdrop-blur-md">
      {/* Bars */}
      <div className="flex items-end gap-2 h-16">
        {bars.map((i) => {
          const height = 20 + voiceVolume * 40 * (1 + Math.sin(Date.now() * 0.01 + i) * 0.5);
          const color = voiceVolume > 0.5 ? "#e94560" : "#8b5cf6";
          
          return (
            <div
              key={i}
              className="w-3 rounded-t transition-all duration-75"
              style={{
                height: `${height}px`,
                backgroundColor: color,
              }}
            />
          );
        })}
      </div>
      
      {/* Text */}
      <div className="text-center">
        <div className="text-[#00f5ff] text-sm font-bold tracking-widest mb-1">
          LISTENING...
        </div>
        {interimText && (
          <div className="text-white/80 text-xs font-mono">
            {interimText}
          </div>
        )}
      </div>
    </div>
  );
}
