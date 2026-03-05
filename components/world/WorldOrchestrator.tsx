"use client";

import { Suspense } from "react";
import { ForestCanopy } from "./ForestCanopy";
import { AtmosphereVolume } from "./AtmosphereVolume";
import { GroundMesh } from "./GroundMesh";
import { SkyDome } from "./SkyDome";
import { DroneSwarm } from "../drones/DroneSwarm";
import { BreachPointSystem } from "../breach/BreachPointSystem";
import { BoundaryWireframe } from "../breach/BoundaryWireframe";
import { ForwardFlightCamera } from "../camera/ForwardFlightCamera";

// 🔒 Props come from YOUR existing API data - ZERO modifications to shape
export interface DroneRecord {
  cairnDroneId: string;
  evmAddress: string;
  model: string;
  assignedZoneId: string;
  status: string;
  registeredAt: string;
  registrationLat?: number;
  registrationLng?: number;
  agentTopicId?: string | null;
  agentManifestSequence?: number | null;
  isAgent?: boolean;
  serialNumber?: string;
}

export interface ZoneRecord {
  zoneId: string;
  zoneName: string;
  coordinates: { lat: number; lng: number }[];
  assignedDrones?: string[];
}

export interface RegistrationFormValues {
  cairnDroneId: string;
  serialNumber: string;
  model: string;
  dgcaCertNumber: string;
  assignedZoneId: string;
  sensorType?: string;
  maxFlightMinutes?: number;
  registeredByOfficerId?: string;
  registrationLat?: number;
  registrationLng?: number;
  certExpiryDate?: string;
}

export interface PaymentData {
  droneId: string;
  amount: number;
}

interface WorldOrchestratorProps {
  drones?: DroneRecord[];
  zones?: ZoneRecord[];
  onRegisterDrone?: (formValues: RegistrationFormValues) => void;
  onPayFee?: (data: PaymentData) => void;
  registrationSuccess?: boolean;
  registeredDroneData?: DroneRecord | null;
}

export function WorldOrchestrator({
  drones = [],
  zones = [],
  onRegisterDrone,
  onPayFee,
  registrationSuccess,
  registeredDroneData,
}: WorldOrchestratorProps) {
  return (
    <>
      {/* Scene setup */}
      <SkyDome />
      <AtmosphereVolume />
      <GroundMesh />

      <Suspense fallback={null}>
        <ForestCanopy count={4000} />
      </Suspense>

      {/* Camera system */}
      <ForwardFlightCamera />

      {/* Drone swarm - receives YOUR existing drone data */}
      <DroneSwarm drones={drones} registeredDroneData={registeredDroneData} />

      {/* Breach and boundary system */}
      <BreachPointSystem
        zones={zones}
        onRegisterDrone={onRegisterDrone}
        onPayFee={onPayFee}
        registrationSuccess={registrationSuccess}
        registeredDroneData={registeredDroneData}
      />

      <BoundaryWireframe
        zones={zones}
        registrationSuccess={registrationSuccess}
      />
    </>
  );
}
