"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";

const DRONE_CONFIGS = [
  { name: "DJI Matrice 30T", bodyColor: 0x2a2a2a, accentColor: 0x22c55e, lightColor: 0x22c55e },
  { name: "DJI Mavic 3E",    bodyColor: 0x1a1a2e, accentColor: 0x3b82f6, lightColor: 0x3b82f6 },
  { name: "Autel Evo II",    bodyColor: 0x1a0800, accentColor: 0xf97316, lightColor: 0xf97316 },
  { name: "Skydio X10",      bodyColor: 0x0d0d1a, accentColor: 0xa855f7, lightColor: 0xa855f7 },
];

function createDrone(bodyColor: number, accentColor: number): { group: THREE.Group; propellers: THREE.Object3D[] } {
  const group = new THREE.Group();
  const propellers: THREE.Object3D[] = [];

  const bodyMat  = new THREE.MeshStandardMaterial({ color: bodyColor,  metalness: 0.7, roughness: 0.3 });
  const accentMat = new THREE.MeshStandardMaterial({ color: accentColor, metalness: 0.9, roughness: 0.1, emissive: accentColor, emissiveIntensity: 0.4 });
  const darkMat  = new THREE.MeshStandardMaterial({ color: 0x111111,   metalness: 0.5, roughness: 0.5 });
  const ledMat   = new THREE.MeshStandardMaterial({ color: accentColor, emissive: accentColor, emissiveIntensity: 2.0 });

  // Main body
  group.add(Object.assign(new THREE.Mesh(new THREE.BoxGeometry(1.0, 0.22, 0.7), bodyMat)));

  // Top bump
  const topBump = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.1, 0.35), accentMat);
  topBump.position.set(0, 0.16, 0);
  group.add(topBump);

  // Camera gimbal
  const gimbal = new THREE.Mesh(new THREE.SphereGeometry(0.1, 10, 10), accentMat);
  gimbal.position.set(0, -0.16, 0.32);
  group.add(gimbal);

  // LED strip
  const led = new THREE.Mesh(new THREE.BoxGeometry(0.9, 0.015, 0.015), ledMat);
  led.position.set(0, -0.11, 0.35);
  group.add(led);

  // 4 Arms + Motors + Propellers + Legs
  const armDefs = [
    { x:  0.65, z:  0.5 },
    { x: -0.65, z:  0.5 },
    { x:  0.65, z: -0.5 },
    { x: -0.65, z: -0.5 },
  ];

  armDefs.forEach(({ x, z }) => {
    // Arm: point from center toward motor
    const arm = new THREE.Mesh(new THREE.BoxGeometry(0.65, 0.05, 0.07), bodyMat);
    arm.position.set(x * 0.5, 0, z * 0.5);
    arm.lookAt(new THREE.Vector3(x, 0, z));
    group.add(arm);

    // Motor housing
    const motor = new THREE.Mesh(new THREE.CylinderGeometry(0.09, 0.09, 0.07, 12), darkMat);
    motor.position.set(x, 0.04, z);
    group.add(motor);

    // Propeller group
    const propGroup = new THREE.Group();
    propGroup.position.set(x, 0.09, z);
    for (let b = 0; b < 2; b++) {
      const blade = new THREE.Mesh(
        new THREE.BoxGeometry(0.55, 0.012, 0.07),
        new THREE.MeshStandardMaterial({ color: 0x222222, metalness: 0.4, roughness: 0.6, transparent: true, opacity: 0.9 })
      );
      blade.rotation.y = (b * Math.PI) / 2;
      propGroup.add(blade);
    }
    group.add(propGroup);
    propellers.push(propGroup);

    // Landing leg
    const leg = new THREE.Mesh(new THREE.CylinderGeometry(0.018, 0.018, 0.28, 6), bodyMat);
    leg.position.set(x * 0.55, -0.22, z * 0.55);
    group.add(leg);

    // Foot
    const foot = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.02, 0.04, 6), darkMat);
    foot.position.set(x * 0.55, -0.37, z * 0.55);
    group.add(foot);
  });

  return { group, propellers };
}

interface DroneSelectorProps {
  selectedIndex: number;
  onSelect: (index: number) => void;
}

export function DroneSelector3D({ selectedIndex, onSelect }: DroneSelectorProps) {
  const mountRef    = useRef<HTMLDivElement>(null);
  const selectedRef = useRef(selectedIndex);

  useEffect(() => {
    selectedRef.current = selectedIndex;
  }, [selectedIndex]);

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    const W = container.clientWidth  || 600;
    const H = container.clientHeight || 300;

    // Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(W, H);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFShadowMap;
    container.appendChild(renderer.domElement);

    // Scene & Camera
    const scene  = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, W / H, 0.1, 100);
    camera.position.set(0, 2.2, 9);
    camera.lookAt(0, 0, 0);

    // Lights
    scene.add(new THREE.AmbientLight(0xffffff, 0.8));
    const dirLight = new THREE.DirectionalLight(0xffffff, 1.5);
    dirLight.position.set(5, 10, 5);
    scene.add(dirLight);
    const fill = new THREE.DirectionalLight(0x8899ff, 0.4);
    fill.position.set(-4, 2, -3);
    scene.add(fill);

    // Build drones
    const spacing = 3.0;
    const startX  = -((DRONE_CONFIGS.length - 1) * spacing) / 2;

    const droneGroups: THREE.Group[]      = [];
    const allProps:    THREE.Object3D[][] = [];
    const gLights:     THREE.PointLight[] = [];
    const discMats:    THREE.MeshStandardMaterial[] = [];

    DRONE_CONFIGS.forEach((cfg, i) => {
      const { group, propellers } = createDrone(cfg.bodyColor, cfg.accentColor);
      group.position.set(startX + i * spacing, 0, 0);
      scene.add(group);
      droneGroups.push(group);
      allProps.push(propellers);

      // Ground light
      const light = new THREE.PointLight(cfg.lightColor, 0.3, 4);
      light.position.set(startX + i * spacing, -1.1, 0);
      scene.add(light);
      gLights.push(light);

      // Glow disc
      const dMat = new THREE.MeshStandardMaterial({
        color: cfg.lightColor,
        emissive: cfg.lightColor,
        emissiveIntensity: 0.05,
        transparent: true,
        opacity: 0.55,
        side: THREE.DoubleSide,
      });
      const disc = new THREE.Mesh(new THREE.CircleGeometry(0.75, 32), dMat);
      disc.rotation.x = -Math.PI / 2;
      disc.position.set(startX + i * spacing, -0.95, 0);
      scene.add(disc);
      discMats.push(dMat);
    });

    // Animation
    let t = 0;
    const curScales = DRONE_CONFIGS.map(() => 0.85);
    let rafId = 0;

    const animate = () => {
      rafId = requestAnimationFrame(animate);
      t += 0.016;
      const sel = selectedRef.current;

      droneGroups.forEach((drone, i) => {
        const isSel = i === sel;

        drone.position.y   = Math.sin(t * 1.4 + i * 1.1) * 0.07 + (isSel ? 0.2 : 0);
        drone.rotation.y   = isSel ? Math.sin(t * 0.6) * 0.12 : 0;

        const tScale = isSel ? 1.2 : 0.8;
        curScales[i] += (tScale - curScales[i]) * 0.07;
        drone.scale.setScalar(curScales[i]);

        allProps[i].forEach(p => { p.rotation.y += isSel ? 0.28 : 0.07; });

        gLights[i].intensity  += ((isSel ? 5   : 0.3 ) - gLights[i].intensity)       * 0.08;
        discMats[i].emissiveIntensity += ((isSel ? 0.6 : 0.05) - discMats[i].emissiveIntensity) * 0.08;
      });

      renderer.render(scene, camera);
    };
    animate();

    // Resize
    const onResize = () => {
      const w = container.clientWidth;
      const h = container.clientHeight;
      renderer.setSize(w, h);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
    };
    window.addEventListener("resize", onResize);

    // Click to select
    const raycaster = new THREE.Raycaster();
    const mouse     = new THREE.Vector2();
    const onClick   = (e: MouseEvent) => {
      const rect = renderer.domElement.getBoundingClientRect();
      mouse.x =  ((e.clientX - rect.left) / rect.width)  * 2 - 1;
      mouse.y = -((e.clientY - rect.top)  / rect.height) * 2 + 1;
      raycaster.setFromCamera(mouse, camera);
      const hits = raycaster.intersectObjects(droneGroups, true);
      if (hits.length > 0) {
        let obj: THREE.Object3D | null = hits[0].object;
        while (obj) {
          const idx = droneGroups.indexOf(obj as THREE.Group);
          if (idx !== -1) { onSelect(idx); break; }
          obj = obj.parent;
        }
      }
    };
    renderer.domElement.addEventListener("click", onClick);

    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener("resize", onResize);
      renderer.domElement.removeEventListener("click", onClick);
      renderer.dispose();
      if (container.contains(renderer.domElement)) container.removeChild(renderer.domElement);
    };
  }, []); // build scene once

  return (
    <div className="relative w-full h-full flex flex-col">
      <div ref={mountRef} className="flex-1 w-full cursor-pointer" style={{ minHeight: 260 }} />

      <div className="flex justify-between px-2 pb-2 pt-1 gap-1">
        {DRONE_CONFIGS.map((cfg, i) => (
          <button
            key={cfg.name}
            onClick={() => onSelect(i)}
            className={`flex-1 py-2 px-1 rounded-xl transition-all duration-300 text-xs font-semibold border text-center ${
              i === selectedIndex
                ? "bg-green-500/20 border-green-500/50 text-green-400 scale-105"
                : "bg-white/5 border-white/10 text-gray-500 hover:text-white hover:border-white/20"
            }`}
          >
            {cfg.name}
          </button>
        ))}
      </div>
    </div>
  );
}