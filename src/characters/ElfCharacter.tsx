/**
 * CYBER-ELF Character
 * Recon / Scout class with sleek cyber suit and Plasma SMG
 * Uses Strata's fur system for cyber-hair
 */

import { useRef, useMemo, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { createFurSystem, updateFurUniforms, type FurOptions } from '@jbcom/strata';
import { PLAYER_CLASSES } from '@/types';

interface ElfCharacterProps {
  position?: [number, number, number];
  rotation?: number;
  isMoving?: boolean;
  isFiring?: boolean;
}

export function ElfCharacter({
  position = [0, 0, 0],
  rotation = 0,
  isMoving = false,
  isFiring = false,
}: ElfCharacterProps) {
  const groupRef = useRef<THREE.Group>(null);
  const bodyRef = useRef<THREE.Group>(null);
  const armRef = useRef<THREE.Group>(null);
  const earLRef = useRef<THREE.Mesh>(null);
  const earRRef = useRef<THREE.Mesh>(null);
  const muzzleRef = useRef<THREE.PointLight>(null);
  const hairFurRef = useRef<THREE.Group>(null);

  const config = PLAYER_CLASSES.elf;

  // Strata fur config for cyber-hair
  const furOptions: FurOptions = useMemo(
    () => ({
      baseColor: new THREE.Color(...config.furColor.base),
      tipColor: new THREE.Color(...config.furColor.tip),
      layerCount: 8,
      spacing: 0.015,
      windStrength: 1.5, // More responsive to wind
    }),
    [config.furColor]
  );

  // Hair geometry
  const hairGeometry = useMemo(() => new THREE.SphereGeometry(0.2 * config.scale, 12, 12), [config.scale]);
  const hairBaseMaterial = useMemo(() => new THREE.MeshStandardMaterial({ color: 0x00aa88, roughness: 0.8 }), []);

  // Create Strata fur system for hair
  useEffect(() => {
    if (hairFurRef.current) {
      while (hairFurRef.current.children.length > 0) {
        hairFurRef.current.remove(hairFurRef.current.children[0]);
      }
      const furSystem = createFurSystem(hairGeometry, hairBaseMaterial, furOptions);
      hairFurRef.current.add(furSystem);
    }
  }, [hairGeometry, hairBaseMaterial, furOptions]);

  // Materials
  const suitMaterial = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: config.color,
        emissive: config.color,
        emissiveIntensity: 0.5,
        roughness: 0.2,
        metalness: 0.8,
      }),
    [config.color]
  );

  const accentMaterial = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: 0x00ff88,
        emissive: 0x00ff88,
        emissiveIntensity: 0.8,
        roughness: 0.1,
        metalness: 0.9,
      }),
    []
  );

  const skinMaterial = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: 0xffe4c4,
        roughness: 0.7,
        metalness: 0.0,
      }),
    []
  );

  const weaponMaterial = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: 0x222222,
        emissive: config.color,
        emissiveIntensity: 0.3,
        roughness: 0.1,
        metalness: 0.95,
      }),
    [config.color]
  );

  useFrame((state) => {
    const time = state.clock.elapsedTime;

    // Update Strata fur animation for hair
    if (hairFurRef.current) {
      hairFurRef.current.traverse((child) => {
        if (child instanceof THREE.Group) {
          updateFurUniforms(child, time);
        }
      });
    }

    // Fast, agile movement animation
    if (bodyRef.current) {
      if (isMoving) {
        bodyRef.current.position.y = Math.sin(time * 15) * 0.03;
        bodyRef.current.rotation.z = Math.sin(time * 7.5) * 0.05;
      } else {
        bodyRef.current.position.y = Math.sin(time * 3) * 0.01;
        bodyRef.current.rotation.z = 0;
      }
    }

    // Ear twitch animation
    if (earLRef.current && earRRef.current) {
      const twitch = Math.sin(time * 2 + Math.random() * 0.1) * 0.1;
      earLRef.current.rotation.z = 0.3 + twitch;
      earRRef.current.rotation.z = -0.3 - twitch;
    }

    // Weapon aim
    if (armRef.current) {
      if (isFiring) {
        armRef.current.rotation.x = Math.sin(time * 40) * 0.05;
      } else {
        armRef.current.rotation.x = 0;
      }
    }

    // Muzzle flash (rapid)
    if (muzzleRef.current) {
      muzzleRef.current.intensity = isFiring ? Math.random() * 2 + 1 : 0;
    }
  });

  return (
    <group ref={groupRef} position={position} rotation={[0, rotation, 0]}>
      <group ref={bodyRef}>
        {/* Slim Body */}
        <mesh position={[0, 0.8 * config.scale, 0]} castShadow>
          <capsuleGeometry args={[0.25 * config.scale, 0.6 * config.scale, 8, 16]} />
          <primitive object={suitMaterial} attach="material" />
        </mesh>

        {/* Cyber Lines on Suit */}
        <mesh position={[0, 0.8 * config.scale, 0.26 * config.scale]}>
          <boxGeometry args={[0.02, 0.5 * config.scale, 0.01]} />
          <primitive object={accentMaterial} attach="material" />
        </mesh>

        {/* Head */}
        <group position={[0, 1.4 * config.scale, 0]}>
          <mesh castShadow>
            <sphereGeometry args={[0.22 * config.scale, 16, 16]} />
            <primitive object={skinMaterial} attach="material" />
          </mesh>

          {/* Pointed Ears */}
          <mesh ref={earLRef} position={[0.2 * config.scale, 0.1, 0]} rotation={[0, 0, 0.3]}>
            <coneGeometry args={[0.05 * config.scale, 0.2 * config.scale, 4]} />
            <primitive object={skinMaterial} attach="material" />
          </mesh>
          <mesh ref={earRRef} position={[-0.2 * config.scale, 0.1, 0]} rotation={[0, 0, -0.3]}>
            <coneGeometry args={[0.05 * config.scale, 0.2 * config.scale, 4]} />
            <primitive object={skinMaterial} attach="material" />
          </mesh>

          {/* Cyber Hair - Using Strata fur system */}
          <group ref={hairFurRef} position={[0, 0.15, -0.05]} />

          {/* Visor */}
          <mesh position={[0, 0.02, 0.18 * config.scale]}>
            <boxGeometry args={[0.3 * config.scale, 0.06, 0.02]} />
            <meshStandardMaterial
              color={0x00ffff}
              emissive={0x00ffff}
              emissiveIntensity={1.5}
              transparent
              opacity={0.8}
            />
          </mesh>

          {/* Eye Glow behind visor */}
          <pointLight color={0x00ffff} intensity={0.5} distance={2} position={[0, 0.02, 0.15]} />
        </group>

        {/* Arms with SMG */}
        <group ref={armRef} position={[0.35 * config.scale, 1.0 * config.scale, 0.15]}>
          <mesh rotation={[0, 0, -0.3]} castShadow>
            <capsuleGeometry args={[0.06 * config.scale, 0.35 * config.scale, 4, 8]} />
            <primitive object={suitMaterial} attach="material" />
          </mesh>

          {/* Plasma SMG */}
          <group position={[0.15, -0.1, 0.2]} rotation={[Math.PI / 2, 0.3, 0]}>
            <mesh castShadow>
              <boxGeometry args={[0.05, 0.3, 0.08]} />
              <primitive object={weaponMaterial} attach="material" />
            </mesh>
            {/* Barrel */}
            <mesh position={[0, 0.2, 0]}>
              <cylinderGeometry args={[0.02, 0.025, 0.15, 8]} />
              <primitive object={weaponMaterial} attach="material" />
            </mesh>
            {/* Energy Core */}
            <mesh position={[0, 0.05, 0.03]}>
              <sphereGeometry args={[0.02, 8, 8]} />
              <meshBasicMaterial color={config.color} />
            </mesh>
            <pointLight ref={muzzleRef} color={config.color} intensity={0} distance={3} position={[0, 0.3, 0]} />
          </group>
        </group>

        {/* Left Arm */}
        <mesh position={[-0.35 * config.scale, 1.0 * config.scale, 0]} rotation={[0, 0, 0.3]} castShadow>
          <capsuleGeometry args={[0.06 * config.scale, 0.35 * config.scale, 4, 8]} />
          <primitive object={suitMaterial} attach="material" />
        </mesh>

        {/* Legs - Sleek */}
        <mesh position={[0.12 * config.scale, 0.25 * config.scale, 0]} castShadow>
          <capsuleGeometry args={[0.07 * config.scale, 0.35 * config.scale, 4, 8]} />
          <primitive object={suitMaterial} attach="material" />
        </mesh>
        <mesh position={[-0.12 * config.scale, 0.25 * config.scale, 0]} castShadow>
          <capsuleGeometry args={[0.07 * config.scale, 0.35 * config.scale, 4, 8]} />
          <primitive object={suitMaterial} attach="material" />
        </mesh>

        {/* Hover Boots */}
        <group position={[0.12 * config.scale, 0, 0]}>
          <mesh>
            <boxGeometry args={[0.1, 0.05, 0.15]} />
            <primitive object={accentMaterial} attach="material" />
          </mesh>
          <pointLight color={config.color} intensity={0.3} distance={1} position={[0, -0.05, 0]} />
        </group>
        <group position={[-0.12 * config.scale, 0, 0]}>
          <mesh>
            <boxGeometry args={[0.1, 0.05, 0.15]} />
            <primitive object={accentMaterial} attach="material" />
          </mesh>
          <pointLight color={config.color} intensity={0.3} distance={1} position={[0, -0.05, 0]} />
        </group>
      </group>
    </group>
  );
}
