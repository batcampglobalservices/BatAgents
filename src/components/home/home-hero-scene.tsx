"use client";

import { Canvas, useFrame } from "@react-three/fiber";
import { Float, Sparkles } from "@react-three/drei";
import { useEffect, useMemo, useState } from "react";
import { useReducedMotion } from "motion/react";
import * as THREE from "three";

function Orb() {
  const core = useMemo(() => new THREE.SphereGeometry(1, 64, 64), []);
  const halo = useMemo(() => new THREE.SphereGeometry(1.15, 64, 64), []);

  useFrame((state, delta) => {
    state.camera.position.lerp(new THREE.Vector3(0, 0.15, 5.3), 0.04);
    state.camera.lookAt(0, 0, 0);
    state.scene.rotation.y += delta * 0.08;
  });

  return (
    <Float speed={1.1} rotationIntensity={0.6} floatIntensity={0.8}>
      <mesh geometry={halo}>
        <meshStandardMaterial
          color="#20134b"
          metalness={0.25}
          roughness={0.2}
          transparent
          opacity={0.35}
          emissive="#6d4dfd"
          emissiveIntensity={0.38}
        />
      </mesh>
      <mesh geometry={core}>
        <meshStandardMaterial
          color="#0d1326"
          metalness={0.45}
          roughness={0.18}
          emissive="#7c4dff"
          emissiveIntensity={0.48}
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
          <ambientLight intensity={0.55} />
          <directionalLight position={[3, 4, 5]} intensity={2.4} color="#8b5cf6" />
          <pointLight position={[-4, -1, -2]} intensity={1.2} color="#a78bfa" />
          <pointLight position={[2, 3, 2]} intensity={1.2} color="#38bdf8" />
          <Orb />
          <Sparkles
            count={52}
            speed={0.55}
            size={3.5}
            scale={[8, 4.5, 2]}
            color="#8b5cf6"
            noise={0.9}
          />
        </Canvas>
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_35%,transparent_22%,rgba(2,4,12,0.12)_58%,rgba(2,4,12,0.82)_100%)]" />
      </div>
  );
}
