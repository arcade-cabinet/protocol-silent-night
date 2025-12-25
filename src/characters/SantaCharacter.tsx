/**
 * MECHA-SANTA Character
 * Heavy Siege / Tank class with fur-lined suit and Coal Cannon
 */

import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { createFurLayers, updateFurTime, type FurConfig } from '@/shaders/fur';
import { PLAYER_CLASSES } from '@/types';

interface SantaCharacterProps {
  position?: [number, number, number];
  rotation?: number;
  isMoving?: boolean;
  isFiring?: boolean;
}

export function SantaCharacter({
  position = [0, 0, 0],
  rotation = 0,
  isMoving = false,
  isFiring = false,
}: SantaCharacterProps) {
  const groupRef = useRef<THREE.Group>(null);
  const bodyRef = useRef<THREE.Group>(null);
  const armRef = useRef<THREE.Group>(null);
  const muzzleRef = useRef<THREE.PointLight>(null);

  const config = PLAYER_CLASSES.santa;

  // Create fur layers for the suit trim
  const furConfig: Partial<FurConfig> = useMemo(
    () => ({
      layers: 10,
      spacing: 0.02,
      colorBase: config.furColor.base,
      colorTip: config.furColor.tip,
      windStrength: 0.5,
    }),
    [config.furColor]
  );

  // Create geometries
  const bodyGeometry = useMemo(() => new THREE.CapsuleGeometry(0.5 * config.scale, 1.2, 8, 16), [config.scale]);
  const headGeometry = useMemo(() => new THREE.SphereGeometry(0.35 * config.scale, 16, 16), [config.scale]);
  const armGeometry = useMemo(() => new THREE.CapsuleGeometry(0.15 * config.scale, 0.6, 4, 8), [config.scale]);
  const cannonGeometry = useMemo(() => new THREE.CylinderGeometry(0.1, 0.15, 0.8, 8), []);

  // Fur trim geometry (torus around body)
  const furTrimGeometry = useMemo(() => new THREE.TorusGeometry(0.55 * config.scale, 0.08, 8, 32), [config.scale]);
  const furLayers = useMemo(() => createFurLayers(furTrimGeometry, furConfig), [furTrimGeometry, furConfig]);

  // Materials
  const suitMaterial = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: config.color,
        emissive: config.color,
        emissiveIntensity: 0.3,
        roughness: 0.6,
        metalness: 0.2,
      }),
    [config.color]
  );

  const beltMaterial = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: 0x111111,
        roughness: 0.3,
        metalness: 0.8,
      }),
    []
  );

  const skinMaterial = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: 0xffccaa,
        roughness: 0.8,
        metalness: 0.0,
      }),
    []
  );

  const cannonMaterial = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: 0x333333,
        emissive: 0xff4400,
        emissiveIntensity: 0.2,
        roughness: 0.2,
        metalness: 0.9,
      }),
    []
  );

  useFrame((state) => {
    const time = state.clock.elapsedTime;

    // Update fur animation
    updateFurTime(furLayers, time);

    // Animate body bob when moving
    if (bodyRef.current) {
      if (isMoving) {
        bodyRef.current.position.y = Math.sin(time * 8) * 0.05;
        bodyRef.current.rotation.z = Math.sin(time * 4) * 0.03;
      } else {
        // Idle breathing
        bodyRef.current.position.y = Math.sin(time * 2) * 0.02;
        bodyRef.current.rotation.z = 0;
      }
    }

    // Animate cannon arm
    if (armRef.current) {
      if (isFiring) {
        armRef.current.rotation.x = Math.sin(time * 20) * 0.1 - 0.2;
      } else {
        armRef.current.rotation.x = -0.2;
      }
    }

    // Muzzle flash
    if (muzzleRef.current) {
      muzzleRef.current.intensity = isFiring ? Math.random() * 3 + 2 : 0;
    }
  });

  return (
    <group ref={groupRef} position={position} rotation={[0, rotation, 0]}>
      <group ref={bodyRef}>
        {/* Body - Red Suit */}
        <mesh geometry={bodyGeometry} material={suitMaterial} position={[0, 1.2, 0]} castShadow />

        {/* Belt */}
        <mesh position={[0, 0.9, 0]} rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[0.52 * config.scale, 0.06, 8, 32]} />
          <primitive object={beltMaterial} attach="material" />
        </mesh>

        {/* Belt Buckle */}
        <mesh position={[0, 0.9, 0.5 * config.scale]}>
          <boxGeometry args={[0.15, 0.12, 0.03]} />
          <meshStandardMaterial color={0xffd700} metalness={0.9} roughness={0.1} />
        </mesh>

        {/* Fur Trim (collar) */}
        <group position={[0, 1.7, 0]} rotation={[Math.PI / 2, 0, 0]}>
          <mesh geometry={furTrimGeometry}>
            <meshStandardMaterial color={0xeeeeee} />
          </mesh>
          {furLayers.map((mesh) => (
            <primitive key={mesh.uuid} object={mesh} />
          ))}
        </group>

        {/* Fur Trim (bottom) */}
        <group position={[0, 0.5, 0]} rotation={[Math.PI / 2, 0, 0]}>
          <mesh geometry={furTrimGeometry}>
            <meshStandardMaterial color={0xeeeeee} />
          </mesh>
        </group>

        {/* Head */}
        <group position={[0, 2.0, 0]}>
          <mesh geometry={headGeometry} material={skinMaterial} castShadow />

          {/* Beard (white fur) */}
          <mesh position={[0, -0.2, 0.2 * config.scale]} scale={[1, 1.2, 0.8]}>
            <sphereGeometry args={[0.25 * config.scale, 12, 12]} />
            <meshStandardMaterial color={0xffffff} roughness={0.9} />
          </mesh>

          {/* Hat */}
          <mesh position={[0, 0.25, 0]}>
            <coneGeometry args={[0.3 * config.scale, 0.5, 8]} />
            <primitive object={suitMaterial} attach="material" />
          </mesh>

          {/* Hat Fur Trim */}
          <mesh position={[0, 0.05, 0]} rotation={[Math.PI / 2, 0, 0]}>
            <torusGeometry args={[0.32 * config.scale, 0.05, 8, 16]} />
            <meshStandardMaterial color={0xffffff} roughness={0.9} />
          </mesh>

          {/* Eyes (glowing) */}
          <mesh position={[0.1, 0.05, 0.3]}>
            <sphereGeometry args={[0.04, 8, 8]} />
            <meshBasicMaterial color={0x00ffff} />
          </mesh>
          <mesh position={[-0.1, 0.05, 0.3]}>
            <sphereGeometry args={[0.04, 8, 8]} />
            <meshBasicMaterial color={0x00ffff} />
          </mesh>
        </group>

        {/* Arms */}
        <group ref={armRef} position={[0.7 * config.scale, 1.4, 0.2]}>
          <mesh geometry={armGeometry} material={suitMaterial} rotation={[0, 0, -0.5]} castShadow />

          {/* Coal Cannon */}
          <group position={[0.3, -0.3, 0.4]} rotation={[Math.PI / 2, 0, 0]}>
            <mesh geometry={cannonGeometry} material={cannonMaterial} castShadow />
            <pointLight ref={muzzleRef} color={0xff4400} intensity={0} distance={5} position={[0, 0.5, 0]} />
          </group>
        </group>

        {/* Left Arm */}
        <mesh geometry={armGeometry} material={suitMaterial} position={[-0.7 * config.scale, 1.4, 0]} rotation={[0, 0, 0.5]} castShadow />

        {/* Legs */}
        <mesh position={[0.25 * config.scale, 0.3, 0]} rotation={[0, 0, 0]}>
          <capsuleGeometry args={[0.12 * config.scale, 0.4, 4, 8]} />
          <meshStandardMaterial color={0x111111} roughness={0.4} metalness={0.3} />
        </mesh>
        <mesh position={[-0.25 * config.scale, 0.3, 0]} rotation={[0, 0, 0]}>
          <capsuleGeometry args={[0.12 * config.scale, 0.4, 4, 8]} />
          <meshStandardMaterial color={0x111111} roughness={0.4} metalness={0.3} />
        </mesh>

        {/* Boots */}
        <mesh position={[0.25 * config.scale, 0, 0.08]}>
          <boxGeometry args={[0.18, 0.15, 0.3]} />
          <meshStandardMaterial color={0x111111} roughness={0.3} metalness={0.5} />
        </mesh>
        <mesh position={[-0.25 * config.scale, 0, 0.08]}>
          <boxGeometry args={[0.18, 0.15, 0.3]} />
          <meshStandardMaterial color={0x111111} roughness={0.3} metalness={0.5} />
        </mesh>
      </group>
    </group>
  );
}
