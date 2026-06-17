"use client";

import { Canvas, useFrame } from "@react-three/fiber";
import { Float, Sparkles } from "@react-three/drei";
import { useEffect, useMemo, useState } from "react";
import { useReducedMotion } from "motion/react";
import * as THREE from "three";

function Orb() {
  const mesh = useMemo(() => new THREE.TorusKnotGeometry(1, 0.34, 220, 28), []);

  useFrame((state, delta) => {
    state.camera.position.lerp(new THREE.Vector3(0, 0.15, 5.3), 0.04);
    state.camera.lookAt(0, 0, 0);
    state.scene.rotation.y += delta * 0.12;
  });

  return (
    <Float speed={1.2} rotationIntensity={0.7} floatIntensity={0.9}>
      <mesh geometry={mesh}>
        <meshStandardMaterial
          color="#101827"
          metalness={0.78}
          roughness={0.16}
          emissive="#38bdf8"
          emissiveIntensity={0.28}
        />
      </mesh>
    </Float>
  );
}

export default function HomeHeroScene() {
  const shouldReduceMotion = useReducedMotion();
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    const update = () => setIsMobile(window.innerWidth < 768);
    update();
    window.addEventListener("resize", update);

    return () => window.removeEventListener("resize", update);
  }, []);

  if (shouldReduceMotion || isMobile) {
    return (
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_35%,rgba(34,211,238,0.14),transparent_34%),radial-gradient(circle_at_70%_28%,rgba(168,85,247,0.12),transparent_28%),linear-gradient(180deg,rgba(2,4,12,0.2),rgba(2,4,12,0.8))]" />
    );
  }

  return (
    <div className="absolute inset-0">
      <Canvas
        camera={{ position: [0, 0.1, 5.3], fov: 42 }}
        dpr={[1, 1.5]}
        gl={{ antialias: true, alpha: true }}
      >
        <color attach="background" args={["#02040c"]} />
        <fog attach="fog" args={["#02040c", 6, 16]} />
        <ambientLight intensity={0.65} />
        <directionalLight position={[3, 4, 5]} intensity={2.2} color="#7dd3fc" />
        <pointLight position={[-4, -1, -2]} intensity={1.1} color="#a78bfa" />
        <pointLight position={[2, 3, 2]} intensity={1.4} color="#38bdf8" />
        <Orb />
        <Sparkles
          count={48}
          speed={0.6}
          size={4}
          scale={[8, 4.5, 2]}
          color="#67e8f9"
          noise={0.9}
        />
      </Canvas>
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_35%,transparent_22%,rgba(2,4,12,0.12)_58%,rgba(2,4,12,0.82)_100%)]" />
    </div>
  );
}
