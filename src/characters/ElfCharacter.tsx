/**
 * CYBER-ELF Character
 * Recon / Scout class with articulated body, cyber aesthetic, and Plasma SMG
 * Uses Strata's createCharacter for proper joint hierarchy
 */

import { useRef, useMemo, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import {
  createCharacter,
  animateCharacter,
  updateFurUniforms,
  type CharacterJoints,
  type CharacterState,
  type FurOptions,
} from '@jbcom/strata';
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
  const characterRef = useRef<{
    root: THREE.Group;
    joints: CharacterJoints;
    state: CharacterState;
  } | null>(null);
  const muzzleRef = useRef<THREE.PointLight | null>(null);
  const weaponGroupRef = useRef<THREE.Group | null>(null);
  const earsRef = useRef<{ left: THREE.Mesh; right: THREE.Mesh } | null>(null);
  // Cache fur groups to avoid traversing scene graph every frame
  const furGroupsRef = useRef<THREE.Group[]>([]);

  const config = PLAYER_CLASSES.elf;

  // Strata fur options for Elf's cyber-hair
  const furOptions: FurOptions = useMemo(
    () => ({
      baseColor: new THREE.Color(0.0, 0.4, 0.35), // Cyan-teal base
      tipColor: new THREE.Color(0.2, 0.8, 0.7), // Lighter cyan tips
      layerCount: 6,
      spacing: 0.012,
      windStrength: 1.2, // More responsive
    }),
    []
  );

  // Create articulated character using Strata
  // biome-ignore lint/correctness/useExhaustiveDependencies: customizeElfAppearance is stable and defined below
  useEffect(() => {
    if (groupRef.current && !characterRef.current) {
      const character = createCharacter({
        skinColor: 0xffe4c4, // Skin tone
        furOptions,
        scale: config.scale,
         // New option in Strata
      });

      characterRef.current = character;
      groupRef.current.add(character.root);

      // Customize for Elf appearance
      customizeElfAppearance(character.joints, config.scale);

      // Cache fur groups for efficient updates
      const furGroups: THREE.Group[] = [];
      for (const joint of Object.values(character.joints)) {
        if (joint?.mesh) {
          joint.mesh.traverse((child) => {
            if (child instanceof THREE.Group && child.userData.isFurGroup) {
              furGroups.push(child);
            }
          });
        }
      }
      furGroupsRef.current = furGroups;
    }

    return () => {
      if (characterRef.current && groupRef.current) {
        groupRef.current.remove(characterRef.current.root);
        characterRef.current = null;
        furGroupsRef.current = [];
      }
    };
  }, [config.scale, furOptions]);

  function customizeElfAppearance(joints: CharacterJoints, scale: number) {
    if (!joints.head?.mesh) return;

    const headMesh = joints.head.mesh;

    // Pointed ears
    const earGeo = new THREE.ConeGeometry(0.04 * scale, 0.18 * scale, 4);
    const earMat = new THREE.MeshStandardMaterial({ color: 0xffe4c4 });

    const earL = new THREE.Mesh(earGeo, earMat);
    earL.position.set(0.18 * scale, 0.08 * scale, 0);
    earL.rotation.z = 0.4;
    headMesh.add(earL);

    const earR = new THREE.Mesh(earGeo, earMat);
    earR.position.set(-0.18 * scale, 0.08 * scale, 0);
    earR.rotation.z = -0.4;
    headMesh.add(earR);

    earsRef.current = { left: earL, right: earR };

    // Cyber visor
    const visorGeo = new THREE.BoxGeometry(0.22 * scale, 0.05 * scale, 0.02);
    const visorMat = new THREE.MeshStandardMaterial({
      color: 0x00ffff,
      emissive: 0x00ffff,
      emissiveIntensity: 1.5,
      transparent: true,
      opacity: 0.8,
    });
    const visor = new THREE.Mesh(visorGeo, visorMat);
    visor.position.set(0, 0.02 * scale, 0.22 * scale);
    headMesh.add(visor);

    // Eye glow behind visor
    const eyeLight = new THREE.PointLight(0x00ffff, 0.8, 2);
    eyeLight.position.set(0, 0.02 * scale, 0.18 * scale);
    headMesh.add(eyeLight);

    // Cyber hair (spiky)
    const hairGeo = new THREE.ConeGeometry(0.15 * scale, 0.2 * scale, 6);
    const hairMat = new THREE.MeshStandardMaterial({
      color: 0x00aa88,
      emissive: 0x00aa88,
      emissiveIntensity: 0.3,
    });
    for (let i = 0; i < 5; i++) {
      const spike = new THREE.Mesh(hairGeo, hairMat);
      const angle = (i / 5) * Math.PI - Math.PI / 2;
      spike.position.set(
        Math.sin(angle) * 0.08 * scale,
        0.15 * scale,
        Math.cos(angle) * 0.05 * scale - 0.05 * scale
      );
      spike.rotation.x = -0.3;
      spike.rotation.z = Math.sin(angle) * 0.3;
      headMesh.add(spike);
    }

    // Apply cyber suit material to torso and limbs
    const suitMat = new THREE.MeshStandardMaterial({
      color: config.color,
      emissive: config.color,
      emissiveIntensity: 0.4,
      roughness: 0.2,
      metalness: 0.8,
    });

    if (joints.torso?.mesh) {
      joints.torso.mesh.material = suitMat;

      // Add glowing accent lines
      const lineGeo = new THREE.BoxGeometry(0.015, 0.4 * scale, 0.01);
      const lineMat = new THREE.MeshBasicMaterial({ color: 0x00ff88 });
      const line = new THREE.Mesh(lineGeo, lineMat);
      line.position.set(0, 0, 0.33 * scale);
      joints.torso.mesh.add(line);
    }

    // Apply suit material to arms and legs
    for (const jointName of ['armL', 'armR', 'legL', 'legR']) {
      const joint = joints[jointName];
      if (joint?.mesh) {
        joint.mesh.material = suitMat;
      }
    }

    // Hover boots
    if (joints.legL?.mesh && joints.legR?.mesh) {
      const bootMat = new THREE.MeshStandardMaterial({
        color: 0x00ff88,
        emissive: 0x00ff88,
        emissiveIntensity: 0.8,
      });
      const bootGeo = new THREE.BoxGeometry(0.08 * scale, 0.03, 0.12 * scale);

      const bootL = new THREE.Mesh(bootGeo, bootMat);
      bootL.position.set(0, -0.25 * scale, 0);
      joints.legL.mesh.add(bootL);

      const bootR = new THREE.Mesh(bootGeo, bootMat);
      bootR.position.set(0, -0.25 * scale, 0);
      joints.legR.mesh.add(bootR);

      // Boot glow
      const bootLightL = new THREE.PointLight(config.color, 0.5, 1);
      bootLightL.position.set(0, -0.28 * scale, 0);
      joints.legL.mesh.add(bootLightL);

      const bootLightR = new THREE.PointLight(config.color, 0.5, 1);
      bootLightR.position.set(0, -0.28 * scale, 0);
      joints.legR.mesh.add(bootLightR);
    }

    // Add Plasma SMG to right arm
    if (joints.armR?.group) {
      const weaponGroup = new THREE.Group();
      weaponGroup.position.set(0, -0.2 * scale, 0.12 * scale);
      weaponGroup.rotation.x = Math.PI / 2;

      // SMG body
      const smgGeo = new THREE.BoxGeometry(0.04, 0.2, 0.06);
      const smgMat = new THREE.MeshStandardMaterial({
        color: 0x222222,
        emissive: config.color,
        emissiveIntensity: 0.2,
        metalness: 0.95,
      });
      const smg = new THREE.Mesh(smgGeo, smgMat);
      weaponGroup.add(smg);

      // Barrel
      const barrelGeo = new THREE.CylinderGeometry(0.015, 0.02, 0.12, 8);
      const barrel = new THREE.Mesh(barrelGeo, smgMat);
      barrel.position.set(0, 0.15, 0);
      weaponGroup.add(barrel);

      // Energy core
      const coreGeo = new THREE.SphereGeometry(0.015, 8, 8);
      const coreMat = new THREE.MeshBasicMaterial({ color: config.color });
      const core = new THREE.Mesh(coreGeo, coreMat);
      core.position.set(0, 0.03, 0.025);
      weaponGroup.add(core);

      // Muzzle light
      const muzzle = new THREE.PointLight(config.color, 0, 3);
      muzzle.position.set(0, 0.22, 0);
      weaponGroup.add(muzzle);
      muzzleRef.current = muzzle;

      joints.armR.group.add(weaponGroup);
      weaponGroupRef.current = weaponGroup;
    }
  }

  useFrame((state) => {
    const time = state.clock.elapsedTime;

    if (characterRef.current) {
      const { state: charState } = characterRef.current;

      // Elf moves faster
      charState.maxSpeed = 0.25;
      charState.speed = isMoving ? charState.maxSpeed : 0;

      // Use Strata's animateCharacter
      animateCharacter(characterRef.current, time);

      // Update fur uniforms using cached groups (avoids traversal every frame)
      for (const furGroup of furGroupsRef.current) {
        updateFurUniforms(furGroup, time);
      }

      // Ear twitch
      if (earsRef.current) {
        const twitch = Math.sin(time * 3) * 0.08;
        earsRef.current.left.rotation.z = 0.4 + twitch;
        earsRef.current.right.rotation.z = -0.4 - twitch;
      }

      // Rapid muzzle flash
      if (muzzleRef.current) {
        muzzleRef.current.intensity = isFiring ? Math.random() * 2 + 1 : 0;
      }
    }
  });

  return (
    <group ref={groupRef} position={position} rotation={[0, rotation, 0]} />
  );
}
