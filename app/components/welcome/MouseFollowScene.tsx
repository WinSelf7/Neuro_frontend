// MouseFollowScene.tsx
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { useGLTF } from "@react-three/drei";
import * as THREE from "three";
import React, { useMemo, useRef, useState } from "react";

function FollowPlane({ onMove }: { onMove: (p: THREE.Vector3) => void }) {
  const planeRef = useRef<THREE.Mesh>(null!);

  // A huge invisible plane (z = 0) that catches pointer events
  return (
    <mesh
      ref={planeRef}
      rotation={[-Math.PI / 2, 0, 0]}           // make it horizontal (like a floor)
      position={[0, 0, 0]}
      onPointerMove={(e) => onMove(e.point.clone())}
      onPointerDown={(e) => onMove(e.point.clone())}
    >
      <planeGeometry args={[1000, 1000]} />
      <meshBasicMaterial visible={false} />
    </mesh>
  );
}

function Follower({ url }: { url: string }) {
  const { scene } = useGLTF(url);               // export as GLB/GLTF from Blender
  const ref = useRef<THREE.Object3D>(null!);

  const target = useMemo(() => new THREE.Vector3(), []);
  const [hasPoint, setHasPoint] = useState(false);

  // receive mouse hits from plane via a global event bus
  const setPoint = (p: THREE.Vector3) => {
    target.copy(p);
    setHasPoint(true);
  };

  // Smoothly move model toward the target (lerp)
  useFrame((_, dt) => {
    if (!ref.current || !hasPoint) return;
    // clamp dt to avoid jumps on low FPS
    const speed = 10;                            // increase for snappier following
    ref.current.position.lerp(target, 1 - Math.exp(-speed * dt));
    // optional: face movement direction
    const dir = target.clone().sub(ref.current.position);
    if (dir.lengthSq() > 1e-6) {
      const yaw = Math.atan2(dir.x, dir.z);
      ref.current.rotation.y = yaw;
    }
  });

  return (
    <>
      <primitive ref={ref} object={scene} scale={1} position={[0, 0, 0]} />
      <FollowPlane onMove={setPoint} />
    </>
  );
}

// Use this component in your page
export default function MouseFollowScenePage() {
  // Hide the default cursor if you want only the model to indicate position
  // Add className="cursor-none" to the container if desired.
  return (
    <div style={{ width: "100vw", height: "100vh" }}>
      <Canvas camera={{ position: [0, 6, 12], fov: 45 }}>
        {/* lights */}
        <ambientLight intensity={0.6} />
        <directionalLight position={[5, 10, 5]} intensity={1} />
        {/* the follower model */}
        <Follower url="/models/robot.glb" />
      </Canvas>
    </div>
  );
}
