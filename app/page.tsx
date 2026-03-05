"use client";

import { Suspense, useState, useEffect } from "react";
import { Canvas } from "@react-three/fiber";
import { WorldOrchestrator, type RegistrationFormValues } from "@/components/world/WorldOrchestrator";
import { HUDOverlay } from "@/components/hud/HUDOverlay";
import { LaserSightCursor } from "@/components/cursor/LaserSightCursor";
import { ThermalPostProcess } from "@/components/camera/ThermalPostProcess";
import type { DroneRecord, ZoneRecord } from "@/components/world/WorldOrchestrator";

export default function HomePage() {
  // 🔒 YOUR EXISTING STATE AND HOOKS WOULD GO HERE
  // const { data: drones } = useQuery(...) 
  // const { mutate: registerDrone } = useMutation(...)
  // For now, we'll use mock data to demonstrate the structure
  
  const [drones, setDrones] = useState<DroneRecord[]>([]);
  const [zones, setZones] = useState<ZoneRecord[]>([]);
  const [registrationSuccess, setRegistrationSuccess] = useState(false);
  const [registeredDroneData, setRegisteredDroneData] = useState<DroneRecord | null>(null);
  
  // Fetch drones and zones on mount
  useEffect(() => {
    // 🔒 YOUR EXISTING API CALLS - Replace this with your actual data fetching
    fetch("/api/drones")
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setDrones(data.drones || []);
        }
      })
      .catch((err) => console.error("Failed to fetch drones:", err));
    
    fetch("/api/zones")
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setZones(data.zones || []);
        }
      })
      .catch((err) => console.error("Failed to fetch zones:", err));
  }, []);
  
  // 🔒 YOUR EXISTING REGISTRATION HANDLER - This calls YOUR API endpoint
  const handleRegisterDrone = async (formValues: RegistrationFormValues) => {
    try {
      console.log("Registering drone with values:", formValues);
      
      const response = await fetch("/api/drones/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formValues),
      });
      
      const result = await response.json();
      
      if (result.success) {
        setRegistrationSuccess(true);
        setRegisteredDroneData(result);
        
        // Refresh drones list
        setTimeout(() => {
          fetch("/api/drones")
            .then((res) => res.json())
            .then((data) => {
              if (data.success) {
                setDrones(data.drones || []);
              }
            });
        }, 1000);
        
        // Reset success state after animation
        setTimeout(() => {
          setRegistrationSuccess(false);
          setRegisteredDroneData(null);
        }, 3000);
      } else {
        console.error("Registration failed:", result.error);
        alert("Registration failed: " + result.error);
      }
    } catch (error) {
      console.error("Registration error:", error);
      alert("Registration error: " + (error as Error).message);
    }
  };
  
  // 🔒 YOUR EXISTING PAYMENT HANDLER - Mock for now
  const handlePayFee = async (data: { droneId: string; amount: number }) => {
    console.log("Processing payment:", data);
    // In real app, call your payment API here
    return { success: true, transactionId: `mock-${Date.now()}` };
  };
  
  return (
    <>
      {/* Spacer for scrolling - creates scroll distance for velocity */}
      <div className="h-[300vh]" />
      
      {/* 3D Canvas - Fixed position overlay */}
      <div className="fixed inset-0 w-full h-full bg-[#050810]">
        <Canvas
          camera={{ position: [0, 85, 0], fov: 75, near: 0.1, far: 1000 }}
          gl={{ 
            antialias: true,
            alpha: false,
            powerPreference: "high-performance",
          }}
          dpr={[1, 2]}
        >
          <Suspense fallback={null}>
            {/* Main 3D world - receives YOUR data via props */}
            <WorldOrchestrator
              drones={drones}
              zones={zones}
              onRegisterDrone={handleRegisterDrone}
              onPayFee={handlePayFee}
              registrationSuccess={registrationSuccess}
              registeredDroneData={registeredDroneData}
            />
            
            {/* Post-processing */}
            <ThermalPostProcess />
          </Suspense>
        </Canvas>
      </div>
      
      {/* HUD Overlay - DOM layer on top of canvas */}
      <HUDOverlay drones={drones} />
      
      {/* Custom cursor */}
      <LaserSightCursor />
    </>
  );
}
