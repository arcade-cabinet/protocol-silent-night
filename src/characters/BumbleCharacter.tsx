/**
 * THE BUMBLE Character
 * Crowd Control / Bruiser class - Abominable Snowman with thick fur and Star Thrower
 * Uses Strata's fur system for full-body fur coverage
 */

import { useRef, useMemo, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { createFurSystem, updateFurUniforms, type FurOptions } from '@jbcom/strata';
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
  
  // Refs for fur groups
  const bodyFurRef = useRef<THREE.Group>(null);
  const headFurRef = useRef<THREE.Group>(null);

  const config = PLAYER_CLASSES.bumble;

  // Dense white fur configuration using Strata
  const furOptions: FurOptions = useMemo(
    () => ({
      baseColor: new THREE.Color(...config.furColor.base),
      tipColor: new THREE.Color(...config.furColor.tip),
      layerCount: 16, // More layers for fluffy appearance
      spacing: 0.035, // Longer fur
      windStrength: 0.8,
      gravityDroop: 0.05,
    }),
    [config.furColor]
  );

  // Main body geometry (large, rounded)
  const bodyGeometry = useMemo(() => new THREE.SphereGeometry(0.6 * config.scale, 16, 16), [config.scale]);
  const headGeometry = useMemo(() => new THREE.SphereGeometry(0.4 * config.scale, 16, 16), [config.scale]);
  const baseMaterial = useMemo(
    () => new THREE.MeshStandardMaterial({
      color: config.color,
      roughness: 0.9,
      metalness: 0.0,
    }),
    [config.color]
  );

  // Create Strata fur systems for body and head
  useEffect(() => {
    if (bodyFurRef.current) {
      while (bodyFurRef.current.children.length > 0) {
        bodyFurRef.current.remove(bodyFurRef.current.children[0]);
      }
      const furSystem = createFurSystem(bodyGeometry, baseMaterial, furOptions);
      bodyFurRef.current.add(furSystem);
    }
  }, [bodyGeometry, baseMaterial, furOptions]);

  useEffect(() => {
    if (headFurRef.current) {
      while (headFurRef.current.children.length > 0) {
        headFurRef.current.remove(headFurRef.current.children[0]);
      }
      const furSystem = createFurSystem(headGeometry, baseMaterial, furOptions);
      headFurRef.current.add(furSystem);
    }
  }, [headGeometry, baseMaterial, furOptions]);

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

    // Update Strata fur animations
    if (bodyFurRef.current) {
      bodyFurRef.current.traverse((child) => {
        if (child instanceof THREE.Group) {
          updateFurUniforms(child, time);
        }
      });
    }
    if (headFurRef.current) {
      headFurRef.current.traverse((child) => {
        if (child instanceof THREE.Group) {
          updateFurUniforms(child, time);
        }
      });
    }

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
        {/* Large Furry Body - Using Strata */}
        <group ref={bodyFurRef} position={[0, 1.0 * config.scale, 0]} />

        {/* Furry Head - Using Strata */}
        <group position={[0, 1.8 * config.scale, 0]}>
          <group ref={headFurRef} />

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
          <mesh rotation={[0, 0, -0.3]} castShadow>
            <capsuleGeometry args={[0.18 * config.scale, 0.5, 8, 16]} />
            <primitive object={baseMaterial} attach="material" />
          </mesh>

          {/* Star weapon */}
          <group position={[0.2, -0.4, 0.3]} rotation={[0, 0, 0]}>
            <mesh geometry={starGeometry} material={starMaterial} rotation={[Math.PI / 2, 0, 0]} />
            <pointLight ref={muzzleRef} color={0xffd700} intensity={1} distance={4} />
          </group>
        </group>

        {/* Right Arm */}
        <group ref={armRRef} position={[-0.7 * config.scale, 1.3 * config.scale, 0]}>
          <mesh rotation={[0, 0, 0.3]} castShadow>
            <capsuleGeometry args={[0.18 * config.scale, 0.5, 8, 16]} />
            <primitive object={baseMaterial} attach="material" />
          </mesh>
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
