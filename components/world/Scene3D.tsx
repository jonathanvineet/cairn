"use client";

import { Suspense } from "react";
import { Canvas } from "@react-three/fiber";
import { WorldOrchestrator } from "@/components/world/WorldOrchestrator";
import { ThermalPostProcess } from "@/components/camera/ThermalPostProcess";

// Scene3D — the heavy 3D canvas, dynamically imported to keep it out of the main bundle.
// All optimization decisions live here:
//   ✅ dpr capped at [1, 1.5]  (was [1, 2]) — halves VRAM on retina
//   ✅ antialias: false          — fastest path for WebGL
//   ✅ powerPreference: default  — don't force discrete GPU, save battery
//   ✅ Suspense wraps all scene  — canvas shows instantly, meshes stream in
//   ✅ flat: false (default)     — keep tone mapping
//   ✅ No HUD / no DOM in canvas — DOM elements are in page.tsx
export default function Scene3D() {
    return (
        <Canvas
            camera={{ position: [0, 85, 0], fov: 72, near: 0.5, far: 600 }}
            gl={{
                antialias: false,
                alpha: false,
                powerPreference: "default",
                stencil: false,
                depth: true,
            }}
            dpr={[1, 1.5]}
            shadows={false}
            frameloop="always"
        >
            <Suspense fallback={null}>
                <WorldOrchestrator
                    drones={[]}
                    zones={[]}
                    onRegisterDrone={async () => { }}
                    onPayFee={async () => ({ success: true, transactionId: "" })}
                    registrationSuccess={false}
                    registeredDroneData={null}
                />
                <ThermalPostProcess />
            </Suspense>
        </Canvas>
    );
}
