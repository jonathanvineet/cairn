"use client";

import { useRef, useState } from "react";
import { useFrame } from "@react-three/fiber";
import { Text } from "@react-three/drei";
import * as THREE from "three";
import { HologramInput } from "./HologramInput";
import { LaserWalletScanner } from "./LaserWalletScanner";
import type { ZoneRecord, RegistrationFormValues } from "../world/WorldOrchestrator";

// 🔒 API CONTRACT - These field names MUST match /api/drones/register endpoint
interface FormField {
  key: string;
  label: string;
  type: "text" | "number" | "select";
  options?: string[];
  required?: boolean;
}

interface HologramPanelProps {
  position: [number, number, number];
  zones: ZoneRecord[];
  onRegisterDrone?: (formValues: RegistrationFormValues) => void;
}

export function HologramPanel({ zones, onRegisterDrone }: HologramPanelProps) {
  const groupRef = useRef<THREE.Group>(null!);
  const [formValues, setFormValues] = useState<RegistrationFormValues>({
    cairnDroneId: "",
    serialNumber: "",
    model: "",
    dgcaCertNumber: "",
    assignedZoneId: ""
  });
  const [currentStep, setCurrentStep] = useState<"form" | "payment">("form");
  
  useFrame((state) => {
    if (!groupRef.current) return;
    
    // Billboard - always face camera
    groupRef.current.lookAt(state.camera.position);
    
    // Slow rotation
    groupRef.current.rotation.y += 0.003;
  });
  
  // 🔒 API CONTRACT - Match your existing /api/drones/register fields
  const formFields: FormField[] = [
    { key: "cairnDroneId", label: "DRONE DESIGNATION", type: "text", required: true },
    { key: "serialNumber", label: "SERIAL NUMBER", type: "text", required: true },
    { key: "model", label: "DRONE MODEL", type: "text", required: true },
    { key: "dgcaCertNumber", label: "DGCA CERT #", type: "text", required: true },
    { key: "assignedZoneId", label: "PATROL ZONE", type: "select", options: zones.map(z => z.zoneId), required: true },
    { key: "sensorType", label: "SENSOR TYPE", type: "text" },
    { key: "maxFlightMinutes", label: "MAX FLIGHT (MIN)", type: "number" },
    { key: "registeredByOfficerId", label: "OFFICER ID", type: "text" },
  ];
  
  const handleFormComplete = (values: Record<string, string | number | undefined>) => {
    // Add location data (in real app, get from user's geolocation)
    const completeValues: RegistrationFormValues = {
      cairnDroneId: String(values.cairnDroneId || ""),
      serialNumber: String(values.serialNumber || ""),
      model: String(values.model || ""),
      dgcaCertNumber: String(values.dgcaCertNumber || ""),
      assignedZoneId: String(values.assignedZoneId || ""),
      sensorType: values.sensorType ? String(values.sensorType) : undefined,
      maxFlightMinutes: values.maxFlightMinutes ? Number(values.maxFlightMinutes) : undefined,
      registeredByOfficerId: values.registeredByOfficerId ? String(values.registeredByOfficerId) : undefined,
      registrationLat: 19.0760, // Mumbai coords as default
      registrationLng: 72.8777,
      certExpiryDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(), // 1 year from now
    };
    
    setFormValues(completeValues);
    setCurrentStep("payment");
  };
  
  const handlePaymentComplete = () => {
    // 🔒 Call YOUR existing registration function with exact API shape
    if (onRegisterDrone) {
      onRegisterDrone(formValues);
    }
  };
  
  return (
    <group ref={groupRef}>
      {/* Panel frame */}
      <mesh>
        <boxGeometry args={[4, 2.5, 0.08]} />
        <meshBasicMaterial
          color="#533a88"
          transparent
          opacity={0.15}
          side={THREE.DoubleSide}
        />
      </mesh>
      
      {/* Wireframe edges */}
      <lineSegments>
        <edgesGeometry args={[new THREE.BoxGeometry(4, 2.5, 0.08)]} />
        <lineBasicMaterial color="#8b5cf6" />
      </lineSegments>
      
      {/* Title */}
      <Text
        position={[0, 1.0, 0.1]}
        fontSize={0.18}
        color="#00f5ff"
        anchorX="center"
        anchorY="middle"
        font="/fonts/Rajdhani-Bold.ttf"
      >
        BREACH RESOLUTION PROTOCOL
      </Text>
      
      {/* Content based on step */}
      {currentStep === "form" && (
        <HologramInput
          fields={formFields}
          onComplete={handleFormComplete}
        />
      )}
      
      {currentStep === "payment" && formValues.cairnDroneId && (
        <LaserWalletScanner
          amount={500}
          droneId={String(formValues.cairnDroneId)}
          onPaymentComplete={handlePaymentComplete}
        />
      )}
    </group>
  );
}
