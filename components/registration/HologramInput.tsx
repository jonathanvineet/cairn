"use client";

import { useState, useRef, useEffect } from "react";
import { Text, Html } from "@react-three/drei";
import { useVoiceInput } from "@/hooks/useVoiceInput";
import { generateDroneName } from "@/lib/droneNameGen";
import { LicensePlateForge } from "./LicensePlateForge";

interface FormField {
  key: string;
  label: string;
  type: "text" | "number" | "select";
  options?: string[];
  required?: boolean;
}

interface HologramInputProps {
  fields: FormField[];
  onComplete: (values: Record<string, string | number | undefined>) => void;
  onCancel?: () => void;
}

export function HologramInput({ fields, onComplete }: HologramInputProps) {
  const [currentFieldIndex, setCurrentFieldIndex] = useState(0);
  const [values, setValues] = useState<Record<string, string | number | undefined>>({});
  const [inputValue, setInputValue] = useState("");
  const [cursorVisible, setCursorVisible] = useState(true);
  const [showPlateForge, setShowPlateForge] = useState(false);
  
  const voiceInput = useVoiceInput();
  const inputRef = useRef<HTMLInputElement>(null);
  
  const currentField = fields[currentFieldIndex];
  
  // Cursor blink
  useEffect(() => {
    const interval = setInterval(() => {
      setCursorVisible((v) => !v);
    }, 530);
    return () => clearInterval(interval);
  }, []);
  
  // Voice input integration
  useEffect(() => {
    const updateFromVoice = () => {
      if (voiceInput.finalText && currentField?.key === "cairnDroneId") {
        setInputValue(voiceInput.finalText);
      }
    };
    updateFromVoice();
  }, [voiceInput.finalText, currentField]);
  
  const handleSubmitField = () => {
    if (!currentField) return;
    
    const newValues = { ...values, [currentField.key]: inputValue };
    setValues(newValues);
    
    // Trigger plate forge animation for drone name
    if (currentField.key === "cairnDroneId" && inputValue) {
      setShowPlateForge(true);
      setTimeout(() => {
        setShowPlateForge(false);
        moveToNextField(newValues);
      }, 900);
    } else {
      moveToNextField(newValues);
    }
  };
  
  const moveToNextField = (currentValues: Record<string, string | number | undefined>) => {
    setInputValue("");
    
    if (currentFieldIndex < fields.length - 1) {
      setCurrentFieldIndex(currentFieldIndex + 1);
    } else {
      // All fields complete
      onComplete(currentValues);
    }
  };
  
  const handleAutoGenerate = () => {
    if (currentField?.key === "cairnDroneId") {
      const name = generateDroneName();
      setInputValue(name);
    } else if (currentField?.type === "text") {
      setInputValue(`SAMPLE_${Math.random().toString(36).substring(7).toUpperCase()}`);
    } else if (currentField?.type === "number") {
      setInputValue(String(Math.floor(Math.random() * 100) + 50));
    }
  };
  
  if (!currentField) return null;
  
  return (
    <group position={[0, -0.2, 0.1]}>
      {/* Field label */}
      <Text
        position={[-1.5, 0.5, 0]}
        fontSize={0.12}
        color="#8b5cf6"
        anchorX="left"
        anchorY="middle"
        font="/fonts/Exo2-Light.ttf"
      >
        {currentField.label}
      </Text>
      
      {/* Input underline */}
      <mesh position={[0, 0.2, 0]}>
        <boxGeometry args={[2.2, 0.02, 0.02]} />
        <meshBasicMaterial color="#8b5cf6" />
      </mesh>
      
      {/* Input characters */}
      <Text
        position={[-1.1, 0.3, 0]}
        fontSize={0.15}
        color="#00f5ff"
        anchorX="left"
        anchorY="middle"
        font="/fonts/Rajdhani-Bold.ttf"
      >
        {inputValue}
      </Text>
      
      {/* Cursor */}
      {cursorVisible && (
        <mesh position={[-1.1 + inputValue.length * 0.08, 0.3, 0]}>
          <boxGeometry args={[0.08, 0.35, 0.02]} />
          <meshBasicMaterial color="#00f5ff" />
        </mesh>
      )}
      
      {/* Hidden HTML input for keyboard capture */}
      <Html position={[0, 0, 0]} style={{ opacity: 0, pointerEvents: "all" }}>
        <input
          ref={inputRef}
          type={currentField.type === "number" ? "number" : "text"}
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              handleSubmitField();
            }
          }}
          autoFocus
          style={{
            position: "absolute",
            left: "-100px",
            width: "400px",
            height: "40px",
            fontSize: "16px",
          }}
        />
      </Html>
      
      {/* Action buttons */}
      <group position={[0, -0.3, 0]}>
        {currentField.key === "cairnDroneId" && (
          <mesh
            position={[-0.8, 0, 0]}
            onClick={voiceInput.start}
            onPointerOver={() => {
              document.body.style.cursor = "pointer";
            }}
            onPointerOut={() => {
              document.body.style.cursor = "none";
            }}
          >
            <cylinderGeometry args={[0.15, 0.15, 0.08, 16]} />
            <meshBasicMaterial color={voiceInput.isListening ? "#e94560" : "#8b5cf6"} />
          </mesh>
        )}
        
        <mesh
          position={[0, 0, 0]}
          onClick={handleAutoGenerate}
          onPointerOver={() => {
            document.body.style.cursor = "pointer";
          }}
          onPointerOut={() => {
            document.body.style.cursor = "none";
          }}
        >
          <boxGeometry args={[0.6, 0.2, 0.05]} />
          <meshBasicMaterial color="#533a88" />
        </mesh>
        
        <Text
          position={[0, 0, 0.03]}
          fontSize={0.08}
          color="#ffffff"
          anchorX="center"
          anchorY="middle"
        >
          AUTO-GEN
        </Text>
        
        <mesh
          position={[0.8, 0, 0]}
          onClick={handleSubmitField}
          onPointerOver={() => {
            document.body.style.cursor = "pointer";
          }}
          onPointerOut={() => {
            document.body.style.cursor = "none";
          }}
        >
          <boxGeometry args={[0.5, 0.2, 0.05]} />
          <meshBasicMaterial color="#00f5ff" />
        </mesh>
        
        <Text
          position={[0.8, 0, 0.03]}
          fontSize={0.08}
          color="#000000"
          anchorX="center"
          anchorY="middle"
          font="/fonts/Rajdhani-Bold.ttf"
        >
          NEXT
        </Text>
      </group>
      
      {/* Select options for zone */}
      {currentField.type === "select" && currentField.options && (
        <group position={[0, -0.8, 0]}>
          {currentField.options.slice(0, 5).map((option, i) => (
            <mesh
              key={option}
              position={[0, -i * 0.25, 0]}
              onClick={() => {
                setInputValue(option);
                handleSubmitField();
              }}
              onPointerOver={() => {
                document.body.style.cursor = "pointer";
              }}
              onPointerOut={() => {
                document.body.style.cursor = "none";
              }}
            >
              <boxGeometry args={[2.0, 0.2, 0.03]} />
              <meshBasicMaterial color="#16213e" transparent opacity={0.8} />
            </mesh>
          ))}
        </group>
      )}
      
      {/* License plate forge animation */}
      {showPlateForge && <LicensePlateForge plateName={inputValue} />}
    </group>
  );
}
