"use client";

import React, { useRef, useState, useEffect } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Sphere, Torus } from "@react-three/drei";
import * as THREE from "three";

// A sub-component that animates elements inside the Canvas
const AnimatedScene: React.FC = () => {
  const coreRef = useRef<THREE.Mesh>(null);
  const ring1Ref = useRef<THREE.Mesh>(null);
  const ring2Ref = useRef<THREE.Mesh>(null);
  const particlesRef = useRef<THREE.Points>(null);

  // Mouse coordinate tracker for subtle parallax
  const mouse = useRef({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      mouse.current.x = (e.clientX / window.innerWidth) * 2 - 1;
      mouse.current.y = -(e.clientY / window.innerHeight) * 2 + 1;
    };
    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  useFrame((state) => {
    const elapsedTime = state.clock.getElapsedTime();

    // 1. Core Orb pulse and rotation
    if (coreRef.current) {
      coreRef.current.rotation.y = elapsedTime * 0.15;
      coreRef.current.rotation.x = elapsedTime * 0.1;
      const pulse = 1 + Math.sin(elapsedTime * 2) * 0.05;
      coreRef.current.scale.set(pulse, pulse, pulse);
    }

    // 2. Rings orbit/rotation
    if (ring1Ref.current) {
      ring1Ref.current.rotation.x = elapsedTime * 0.3;
      ring1Ref.current.rotation.y = elapsedTime * 0.15;
      // Parallax offset
      ring1Ref.current.position.x = THREE.MathUtils.lerp(ring1Ref.current.position.x, mouse.current.x * 0.3, 0.05);
      ring1Ref.current.position.y = THREE.MathUtils.lerp(ring1Ref.current.position.y, mouse.current.y * 0.3, 0.05);
    }

    if (ring2Ref.current) {
      ring2Ref.current.rotation.x = -elapsedTime * 0.2;
      ring2Ref.current.rotation.z = elapsedTime * 0.25;
      ring2Ref.current.position.x = THREE.MathUtils.lerp(ring2Ref.current.position.x, mouse.current.x * -0.2, 0.05);
      ring2Ref.current.position.y = THREE.MathUtils.lerp(ring2Ref.current.position.y, mouse.current.y * -0.2, 0.05);
    }

    // 3. Particles drift
    if (particlesRef.current) {
      particlesRef.current.rotation.y = elapsedTime * 0.05;
      particlesRef.current.rotation.x = elapsedTime * 0.02;
    }
  });

  // Generate random data particle positions
  const particleCount = 200;
  const positions = React.useMemo(() => {
    const arr = new Float32Array(particleCount * 3);
    for (let i = 0; i < particleCount * 3; i++) {
      arr[i] = (Math.random() - 0.5) * 8;
    }
    return arr;
  }, []);

  return (
    <>
      <ambientLight intensity={0.4} />
      <pointLight position={[10, 10, 10]} intensity={1.5} color="#EA6002" />
      <pointLight position={[-10, -10, -10]} intensity={0.8} color="#059669" />

      {/* Glowing AI Core Neural Orb */}
      <Sphere args={[1.5, 32, 32]} ref={coreRef}>
        <meshStandardMaterial
          color="#EA6002"
          wireframe
          transparent
          opacity={0.35}
          emissive="#EA6002"
          emissiveIntensity={1.2}
        />
      </Sphere>

      {/* Solid Inner Core Core */}
      <Sphere args={[0.5, 16, 16]}>
        <meshStandardMaterial
          color="#EA6002"
          emissive="#EA6002"
          emissiveIntensity={2}
          roughness={0.1}
          metalness={0.8}
        />
      </Sphere>

      {/* Floating Token/Coin Rings */}
      <Torus args={[2.5, 0.08, 16, 100]} ref={ring1Ref}>
        <meshStandardMaterial
          color="#EA6002"
          metalness={0.9}
          roughness={0.2}
          emissive="#EA6002"
          emissiveIntensity={0.3}
        />
      </Torus>

      <Torus args={[3.2, 0.04, 8, 100]} ref={ring2Ref}>
        <meshStandardMaterial
          color="#10B981"
          metalness={0.8}
          roughness={0.3}
          emissive="#10B981"
          emissiveIntensity={0.2}
        />
      </Torus>

      {/* Data/Earnings Particles */}
      <points ref={particlesRef}>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            args={[positions, 3]}
          />
        </bufferGeometry>
        <pointsMaterial
          size={0.06}
          color="#EA6002"
          transparent
          opacity={0.8}
          sizeAttenuation
        />
      </points>
    </>
  );
};

export const HeroVisual3D: React.FC = () => {
  const [hasWebGL, setHasWebGL] = useState(true);

  // Check WebGL availability
  useEffect(() => {
    try {
      const canvas = document.createElement("canvas");
      const support = !!(
        window.WebGLRenderingContext &&
        (canvas.getContext("webgl") || canvas.getContext("experimental-webgl"))
      );
      setHasWebGL(support);
    } catch {
      setHasWebGL(false);
    }
  }, []);

  if (!hasWebGL) {
    // Fallback: A beautiful CSS animated glow orb in case WebGL fails
    return (
      <div className="relative w-full h-full flex items-center justify-center min-h-[350px]">
        {/* Core animated glow */}
        <div className="absolute w-60 h-60 rounded-full bg-gradient-to-tr from-brand to-emerald-500 blur-[80px] opacity-40 animate-pulse" />
        <div className="relative w-48 h-48 rounded-full border border-brand/30 flex items-center justify-center animate-[spin_12s_linear_infinite]">
          <div className="w-40 h-40 rounded-full border border-dashed border-emerald-500/20 flex items-center justify-center animate-[spin_8s_linear_infinite_reverse]">
            <div className="w-12 h-12 rounded-full bg-brand shadow-[0_0_40px_#EA6002] flex items-center justify-center font-bold text-xs text-white">
              0G
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-full min-h-[350px] relative select-none">
      <Canvas camera={{ position: [0, 0, 8], fov: 45 }}>
        <AnimatedScene />
      </Canvas>
    </div>
  );
};
