"use client";

import { Canvas, useFrame } from "@react-three/fiber";
import { Float, Line, OrbitControls, Sphere, Stars } from "@react-three/drei";
import { useMemo, useRef } from "react";
import * as THREE from "three";

function AgentNodeNetwork() {
  const networkRef = useRef<THREE.Group>(null);
  const innerRingRef = useRef<THREE.Mesh>(null);
  const outerRingRef = useRef<THREE.Mesh>(null);

  const nodes = useMemo(() => {
    return Array.from({ length: 12 }, (_, index) => {
      const angle = (index / 12) * Math.PI * 2;
      const radius = index % 2 === 0 ? 2.15 : 2.85;
      const height = Math.sin(index * 1.35) * 0.72;

      return {
        position: new THREE.Vector3(
          Math.cos(angle) * radius,
          height,
          Math.sin(angle) * radius,
        ),
        color:
          index % 3 === 0 ? "#38bdf8" : index % 3 === 1 ? "#8b5cf6" : "#a78bfa",
      };
    });
  }, []);

  useFrame((state) => {
    const elapsed = state.clock.elapsedTime;

    if (networkRef.current) {
      networkRef.current.rotation.y = elapsed * 0.16;
      networkRef.current.rotation.x = Math.sin(elapsed * 0.28) * 0.08;
    }

    if (innerRingRef.current) {
      innerRingRef.current.rotation.z = elapsed * 0.22;
    }

    if (outerRingRef.current) {
      outerRingRef.current.rotation.z = -elapsed * 0.16;
    }
  });

  return (
    <group ref={networkRef}>
      <Float speed={1.35} rotationIntensity={0.35} floatIntensity={0.72}>
        <Sphere args={[0.84, 72, 72]}>
          <meshStandardMaterial
            color="#8b5cf6"
            emissive="#5b7cfa"
            emissiveIntensity={1.75}
            roughness={0.2}
            metalness={0.62}
          />
        </Sphere>

        <Sphere args={[1.12, 64, 64]}>
          <meshBasicMaterial
            color="#7c4dff"
            transparent
            opacity={0.12}
            blending={THREE.AdditiveBlending}
          />
        </Sphere>

        <Sphere args={[1.45, 64, 64]}>
          <meshBasicMaterial
            color="#38bdf8"
            transparent
            opacity={0.055}
            blending={THREE.AdditiveBlending}
          />
        </Sphere>
      </Float>

      {nodes.map((node, index) => (
        <group key={index}>
          <Line
            points={[new THREE.Vector3(0, 0, 0), node.position]}
            color={node.color}
            lineWidth={1}
            transparent
            opacity={0.34}
          />

          <Float
            speed={1.7 + index * 0.05}
            rotationIntensity={0.55}
            floatIntensity={0.75}
          >
            <Sphere position={node.position} args={[0.16, 32, 32]}>
              <meshStandardMaterial
                color={node.color}
                emissive={node.color}
                emissiveIntensity={1.15}
                roughness={0.28}
                metalness={0.45}
              />
            </Sphere>
          </Float>
        </group>
      ))}

      <mesh ref={innerRingRef} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[2.28, 0.009, 18, 180]} />
        <meshBasicMaterial color="#8b5cf6" transparent opacity={0.38} />
      </mesh>

      <mesh ref={outerRingRef} rotation={[Math.PI / 2.45, 0.45, 0]}>
        <torusGeometry args={[3.06, 0.007, 18, 180]} />
        <meshBasicMaterial color="#38bdf8" transparent opacity={0.24} />
      </mesh>

      <mesh rotation={[Math.PI / 2.85, -0.55, 0.18]}>
        <torusGeometry args={[3.42, 0.004, 12, 180]} />
        <meshBasicMaterial color="#c4b5fd" transparent opacity={0.14} />
      </mesh>
    </group>
  );
}

export default function HomeHeroScene() {
  return (
    <div className="h-full min-h-[420px] w-full">
      <Canvas
        camera={{ position: [0, 0.28, 5.45], fov: 44 }}
        dpr={[1, 1.5]}
        gl={{
          alpha: true,
          antialias: true,
          powerPreference: "high-performance",
        }}
      >
        <ambientLight intensity={0.48} />
        <pointLight
          position={[3.6, 3.4, 4.5]}
          intensity={2.35}
          color="#8b5cf6"
        />
        <pointLight
          position={[-3.2, -2.3, 3.2]}
          intensity={1.65}
          color="#38bdf8"
        />
        <directionalLight position={[0, 4, 5]} intensity={1.05} />

        <Stars
          radius={84}
          depth={44}
          count={900}
          factor={3.6}
          saturation={0}
          fade
          speed={0.55}
        />
        <AgentNodeNetwork />

        <OrbitControls
          enableZoom={false}
          enablePan={false}
          enableDamping
          dampingFactor={0.08}
          autoRotate
          autoRotateSpeed={0.32}
        />
      </Canvas>
    </div>
  );
}
