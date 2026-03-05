"use client";

import { useState } from "react";
import { useBreachSpawn } from "@/hooks/useBreachSpawn";
import { BreachSphere } from "./BreachSphere";
import { BreachFormExplosion } from "./BreachFormExplosion";
import { RegistrationComplete } from "../registration/RegistrationComplete";
import type { ZoneRecord, RegistrationFormValues } from "../world/WorldOrchestrator";

interface BreachPointSystemProps {
  zones: ZoneRecord[];
  onRegisterDrone?: (formValues: RegistrationFormValues) => void;
  onPayFee?: (data: { droneId: string; amount: number }) => void;
  registrationSuccess?: boolean;
  registeredDroneData?: { cairnDroneId?: string } | null;
}

export function BreachPointSystem({
  zones,
  onRegisterDrone,
  registrationSuccess,
  registeredDroneData,
}: BreachPointSystemProps) {
  const { activeBreaches, removeBreach, markBreachResolved } = useBreachSpawn();
  const [activeFormBreach, setActiveFormBreach] = useState<string | null>(null);
  
  const handleBreachClick = (breachId: string) => {
    setActiveFormBreach(breachId);
    markBreachResolved(breachId);
  };
  
  const handleFormClose = () => {
    if (activeFormBreach) {
      removeBreach(activeFormBreach);
      setActiveFormBreach(null);
    }
  };
  
  return (
    <group>
      {/* Render active breach spheres */}
      {activeBreaches.map((breach) => {
        // Don't render sphere if form is active for this breach
        if (breach.id === activeFormBreach) return null;
        
        return (
          <BreachSphere
            key={breach.id}
            position={breach.position}
            onInteract={() => handleBreachClick(breach.id)}
          />
        );
      })}
      
      {/* Render form explosion for active breach */}
      {activeFormBreach && (() => {
        const breach = activeBreaches.find((b) => b.id === activeFormBreach);
        if (!breach) return null;
        
        return (
          <BreachFormExplosion
            key={breach.id}
            position={breach.position}
            zones={zones}
            onRegisterDrone={onRegisterDrone}
            onClose={handleFormClose}
          />
        );
      })()}
      
      {/* Registration complete animation */}
      {registrationSuccess && registeredDroneData && (
        <RegistrationComplete droneData={registeredDroneData} />
      )}
    </group>
  );
}
