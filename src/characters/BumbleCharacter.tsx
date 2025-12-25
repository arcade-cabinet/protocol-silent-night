/**
 * THE BUMBLE Character
 * Crowd Control / Bruiser class - Abominable Snowman with thick fur and Star Thrower
 */

import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { createFurLayers, updateFurTime, type FurConfig } from '@/shaders/fur';
import { PLAYER_CLASSES } from '@/types';

interface BumbleCharacterProps {
  position?: [number, number, number];
  rotation?: number;
  isMoving?: boolean;
  isFiring?: boolean;
}

export function BumbleCharacter({
  position = [0, 0, 0],
  rotation = 0,
  isMoving = false,
  isFiring = false,
}: BumbleCharacterProps) {
  const groupRef = useRef<THREE.Group>(null);
  const bodyRef = useRef<THREE.Group>(null);
  const armLRef = useRef<THREE.Group>(null);
  const armRRef = useRef<THREE.Group>(null);
  const muzzleRef = useRef<THREE.PointLight>(null);

  const config = PLAYER_CLASSES.bumble;

  // Dense white fur configuration
  const furConfig: Partial<FurConfig> = useMemo(
    () => ({
      layers: 16, // More layers for fluffy appearance
      spacing: 0.035, // Longer fur
      colorBase: config.furColor.base,
      colorTip: config.furColor.tip,
      windStrength: 0.8,
      gravityDroop: 0.05,
    }),
    [config.furColor]
  );

  // Main body geometry (large, rounded)
  const bodyGeometry = useMemo(() => new THREE.SphereGeometry(0.6 * config.scale, 16, 16), [config.scale]);
  const headGeometry = useMemo(() => new THREE.SphereGeometry(0.4 * config.scale, 16, 16), [config.scale]);
  const armGeometry = useMemo(() => new THREE.CapsuleGeometry(0.18 * config.scale, 0.5, 8, 16), [config.scale]);

  // Create fur layers for body and head
  const bodyFurLayers = useMemo(() => createFurLayers(bodyGeometry, furConfig), [bodyGeometry, furConfig]);
  const headFurLayers = useMemo(() => createFurLayers(headGeometry, furConfig), [headGeometry, furConfig]);
  const armFurLayers = useMemo(() => createFurLayers(armGeometry, furConfig), [armGeometry, furConfig]);

  // Materials
  const baseMaterial = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: config.color,
        roughness: 0.9,
        metalness: 0.0,
      }),
    [config.color]
  );

  const hornMaterial = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: 0xccccaa,
        roughness: 0.4,
        metalness: 0.2,
      }),
    []
  );

  const starMaterial = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: 0xffd700,
        emissive: 0xffaa00,
        emissiveIntensity: 0.8,
        roughness: 0.2,
        metalness: 0.9,
      }),
    []
  );

  // Star geometry for the Star Thrower weapon
  const starGeometry = useMemo(() => {
    const shape = new THREE.Shape();
    const outerRadius = 0.12;
    const innerRadius = 0.05;
    const points = 5;

    for (let i = 0; i < points * 2; i++) {
      const radius = i % 2 === 0 ? outerRadius : innerRadius;
      const angle = (i * Math.PI) / points - Math.PI / 2;
      const x = Math.cos(angle) * radius;
      const y = Math.sin(angle) * radius;
      if (i === 0) {
        shape.moveTo(x, y);
      } else {
        shape.lineTo(x, y);
      }
    }
    shape.closePath();

    const extrudeSettings = { depth: 0.03, bevelEnabled: false };
    return new THREE.ExtrudeGeometry(shape, extrudeSettings);
  }, []);

  useFrame((state) => {
    const time = state.clock.elapsedTime;

    // Update all fur animations
    updateFurTime(bodyFurLayers, time);
    updateFurTime(headFurLayers, time);
    updateFurTime(armFurLayers, time);

    // Heavy, lumbering movement
    if (bodyRef.current) {
      if (isMoving) {
        bodyRef.current.position.y = Math.abs(Math.sin(time * 5)) * 0.08;
        bodyRef.current.rotation.z = Math.sin(time * 2.5) * 0.08;
      } else {
        // Slow breathing
        const breath = Math.sin(time * 1.5);
        bodyRef.current.position.y = breath * 0.02;
        bodyRef.current.scale.setScalar(1 + breath * 0.02);
      }
    }

    // Arm swing when moving
    if (armLRef.current && armRRef.current) {
      if (isMoving) {
        armLRef.current.rotation.x = Math.sin(time * 5) * 0.4;
        armRRef.current.rotation.x = Math.sin(time * 5 + Math.PI) * 0.4;
      } else {
        armLRef.current.rotation.x = 0;
        armRRef.current.rotation.x = 0;
      }
    }

    // Star weapon glow when firing
    if (muzzleRef.current) {
      muzzleRef.current.intensity = isFiring ? 3 + Math.sin(time * 10) : 1;
    }
  });

  return (
    <group ref={groupRef} position={position} rotation={[0, rotation, 0]}>
      <group ref={bodyRef}>
        {/* Large Furry Body */}
        <group position={[0, 1.0 * config.scale, 0]}>
          <mesh geometry={bodyGeometry} material={baseMaterial} castShadow />
          {bodyFurLayers.map((mesh) => (
            <primitive key={mesh.uuid} object={mesh} />
          ))}
        </group>

        {/* Furry Head */}
        <group position={[0, 1.8 * config.scale, 0]}>
          <mesh geometry={headGeometry} material={baseMaterial} castShadow />
          {headFurLayers.map((mesh) => (
            <primitive key={mesh.uuid} object={mesh} />
          ))}

          {/* Horns */}
          <mesh position={[0.25 * config.scale, 0.3, 0]} rotation={[0, 0, -0.4]}>
            <coneGeometry args={[0.08 * config.scale, 0.35 * config.scale, 6]} />
            <primitive object={hornMaterial} attach="material" />
          </mesh>
          <mesh position={[-0.25 * config.scale, 0.3, 0]} rotation={[0, 0, 0.4]}>
            <coneGeometry args={[0.08 * config.scale, 0.35 * config.scale, 6]} />
            <primitive object={hornMaterial} attach="material" />
          </mesh>

          {/* Face */}
          {/* Eyes - Glowing Blue */}
          <mesh position={[0.12, 0.05, 0.35 * config.scale]}>
            <sphereGeometry args={[0.06, 12, 12]} />
            <meshBasicMaterial color={0x00ccff} />
          </mesh>
          <mesh position={[-0.12, 0.05, 0.35 * config.scale]}>
            <sphereGeometry args={[0.06, 12, 12]} />
            <meshBasicMaterial color={0x00ccff} />
          </mesh>
          <pointLight color={0x00ccff} intensity={0.5} distance={2} position={[0, 0, 0.4 * config.scale]} />

          {/* Snout/Nose */}
          <mesh position={[0, -0.1, 0.38 * config.scale]}>
            <sphereGeometry args={[0.08, 12, 12]} />
            <meshStandardMaterial color={0x333333} roughness={0.3} />
          </mesh>

          {/* Mouth/Teeth */}
          <mesh position={[0, -0.2, 0.32 * config.scale]}>
            <boxGeometry args={[0.15, 0.05, 0.05]} />
            <meshStandardMaterial color={0xffffff} />
          </mesh>
        </group>

        {/* Left Arm with Star Thrower */}
        <group ref={armLRef} position={[0.7 * config.scale, 1.3 * config.scale, 0]}>
          <mesh geometry={armGeometry} material={baseMaterial} rotation={[0, 0, -0.3]} castShadow />
          {/* Duplicate arm fur layers for left arm */}

          {/* Star weapon */}
          <group position={[0.2, -0.4, 0.3]} rotation={[0, 0, 0]}>
            <mesh geometry={starGeometry} material={starMaterial} rotation={[Math.PI / 2, 0, 0]} />
            <pointLight ref={muzzleRef} color={0xffd700} intensity={1} distance={4} />
          </group>
        </group>

        {/* Right Arm */}
        <group ref={armRRef} position={[-0.7 * config.scale, 1.3 * config.scale, 0]}>
          <mesh geometry={armGeometry} material={baseMaterial} rotation={[0, 0, 0.3]} castShadow />
        </group>

        {/* Legs - Thick and sturdy */}
        <mesh position={[0.3 * config.scale, 0.3 * config.scale, 0]} castShadow>
          <capsuleGeometry args={[0.15 * config.scale, 0.4 * config.scale, 8, 16]} />
          <primitive object={baseMaterial} attach="material" />
        </mesh>
        <mesh position={[-0.3 * config.scale, 0.3 * config.scale, 0]} castShadow>
          <capsuleGeometry args={[0.15 * config.scale, 0.4 * config.scale, 8, 16]} />
          <primitive object={baseMaterial} attach="material" />
        </mesh>

        {/* Feet */}
        <mesh position={[0.3 * config.scale, 0, 0.1]}>
          <sphereGeometry args={[0.15 * config.scale, 12, 12]} />
          <primitive object={baseMaterial} attach="material" />
        </mesh>
        <mesh position={[-0.3 * config.scale, 0, 0.1]}>
          <sphereGeometry args={[0.15 * config.scale, 12, 12]} />
          <primitive object={baseMaterial} attach="material" />
        </mesh>
      </group>
    </group>
  );
}
