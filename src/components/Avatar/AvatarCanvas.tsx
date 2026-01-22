import { Environment, useAnimations, useGLTF } from "@react-three/drei";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { useEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";

const CameraController = () => {
  const { camera } = useThree();

  const startTime = useRef<number | null>(null);
  const [start, setStart] = useState(false);

  const from = useRef(new THREE.Vector3(0, 0.65, 2.35));
  const to = useRef(new THREE.Vector3(-3, 3, 5.35)); // move left

  useEffect(() => {
    const t = setTimeout(() => setStart(true), 4000); // wait 2s
    return () => clearTimeout(t);
  }, []);

  useFrame(({ clock }) => {
    if (!start) return;

    if (!startTime.current) {
      startTime.current = clock.elapsedTime;
    }

    const elapsed = clock.elapsedTime - startTime.current;
    const duration = 1.2; // seconds

    const alpha = Math.min(elapsed / duration, 1);
    camera.position.lerpVectors(from.current, to.current, alpha);
    camera.lookAt(0, 0, 0);
  });

  return null;
};

const AvatarModel = () => {
  const group = useRef<THREE.Group>(null);
  const { scene, animations } = useGLTF("/models/avatar.glb");
  const { actions } = useAnimations(animations, group);

  useEffect(() => {
    const first = animations?.[0]?.name;
    const idleName = actions.Idle ? "Idle" : actions.idle ? "idle" : first;

    if (!idleName || !actions[idleName]) return;

    actions[idleName].reset().fadeIn(0.2).play();

    return () => {
      actions[idleName]?.fadeOut(0.2);
    };
  }, [actions, animations]);

  return (
    <group ref={group}>
      <primitive object={scene} position={[0, -1.5, 0]} scale={1.15} />
    </group>
  );
};

const AvatarCanvas = () => {
  const dpr = useMemo(() => [1, 1.5] as [number, number], []);

  return (
    <Canvas
      camera={{ position: [0, 0.65, 2.35], fov: 32 }}
      dpr={dpr}
      gl={{ antialias: true, powerPreference: "high-performance" }}
    >
      <ambientLight intensity={0.65} />
      <directionalLight position={[3, 5, 2]} intensity={1.15} />
      <AvatarModel />
      <CameraController />
      <Environment preset="city" />
    </Canvas>
  );
};

export default AvatarCanvas;
