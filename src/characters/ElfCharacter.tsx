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

    // Pointed ears with glow tips
    const earGeo = new THREE.ConeGeometry(0.05 * scale, 0.2 * scale, 4);
    const earMat = new THREE.MeshStandardMaterial({ color: 0xffe4c4, roughness: 0.7 });

    const earL = new THREE.Mesh(earGeo, earMat);
    earL.position.set(0.18 * scale, 0.08 * scale, 0);
    earL.rotation.z = 0.5;
    headMesh.add(earL);

    const earR = new THREE.Mesh(earGeo, earMat);
    earR.position.set(-0.18 * scale, 0.08 * scale, 0);
    earR.rotation.z = -0.5;
    headMesh.add(earR);

    // Ear tip glow
    const earTipGeo = new THREE.SphereGeometry(0.02 * scale, 6, 6);
    const earTipMat = new THREE.MeshBasicMaterial({ color: 0x00ffcc });
    const earTipL = new THREE.Mesh(earTipGeo, earTipMat);
    earTipL.position.set(0.24 * scale, 0.18 * scale, 0);
    headMesh.add(earTipL);
    const earTipR = new THREE.Mesh(earTipGeo, earTipMat);
    earTipR.position.set(-0.24 * scale, 0.18 * scale, 0);
    headMesh.add(earTipR);

    earsRef.current = { left: earL, right: earR };

    // Cyber visor - wraparound style
    const visorGeo = new THREE.BoxGeometry(0.26 * scale, 0.06 * scale, 0.03);
    const visorMat = new THREE.MeshStandardMaterial({
      color: 0x001122,
      emissive: 0x00ffff,
      emissiveIntensity: 1.8,
      transparent: true,
      opacity: 0.85,
      metalness: 0.9,
      roughness: 0.1,
    });
    const visor = new THREE.Mesh(visorGeo, visorMat);
    visor.position.set(0, 0.02 * scale, 0.21 * scale);
    headMesh.add(visor);

    // Visor scanline effect
    const scanlineGeo = new THREE.BoxGeometry(0.24 * scale, 0.008 * scale, 0.01);
    const scanlineMat = new THREE.MeshBasicMaterial({ color: 0x00ff88 });
    const scanline = new THREE.Mesh(scanlineGeo, scanlineMat);
    scanline.position.set(0, 0.02 * scale, 0.235 * scale);
    headMesh.add(scanline);

    // Eye glow behind visor
    const eyeLight = new THREE.PointLight(0x00ffff, 1, 2.5);
    eyeLight.position.set(0, 0.02 * scale, 0.18 * scale);
    headMesh.add(eyeLight);

    // Cyber hair (spiky mohawk style)
    const hairGeo = new THREE.ConeGeometry(0.08 * scale, 0.18 * scale, 4);
    const hairMat = new THREE.MeshStandardMaterial({
      color: 0x00aa88,
      emissive: 0x00ffcc,
      emissiveIntensity: 0.5,
    });
    
    // Central mohawk spikes
    for (let i = 0; i < 7; i++) {
      const spike = new THREE.Mesh(hairGeo, hairMat);
      spike.position.set(
        0,
        0.18 * scale,
        -0.08 * scale + i * 0.025 * scale
      );
      spike.rotation.x = -0.4 + (i - 3) * 0.1;
      spike.scale.y = 0.7 + Math.abs(i - 3) * 0.15;
      headMesh.add(spike);
    }

    // Side hair spikes
    for (let side of [-1, 1]) {
      for (let i = 0; i < 3; i++) {
        const spike = new THREE.Mesh(hairGeo, hairMat);
        spike.position.set(
          side * 0.1 * scale,
          0.12 * scale,
          -0.05 * scale + i * 0.03 * scale
        );
        spike.rotation.z = side * 0.6;
        spike.rotation.x = -0.2;
        spike.scale.setScalar(0.6);
        headMesh.add(spike);
      }
    }

    // Apply cyber suit material to torso and limbs
    const suitMat = new THREE.MeshStandardMaterial({
      color: config.color,
      emissive: config.color,
      emissiveIntensity: 0.5,
      roughness: 0.15,
      metalness: 0.85,
    });

    if (joints.torso?.mesh) {
      joints.torso.mesh.material = suitMat;

      // Add glowing circuit-line accents
      const lineMat = new THREE.MeshBasicMaterial({ color: 0x00ff88 });
      
      // Center line
      const lineGeo = new THREE.BoxGeometry(0.012, 0.4 * scale, 0.008);
      const line = new THREE.Mesh(lineGeo, lineMat);
      line.position.set(0, 0, 0.32 * scale);
      joints.torso.mesh.add(line);

      // Side lines
      const sideLineGeo = new THREE.BoxGeometry(0.008, 0.3 * scale, 0.008);
      const lineL = new THREE.Mesh(sideLineGeo, lineMat);
      lineL.position.set(0.08 * scale, 0.02 * scale, 0.31 * scale);
      joints.torso.mesh.add(lineL);
      const lineR = new THREE.Mesh(sideLineGeo, lineMat);
      lineR.position.set(-0.08 * scale, 0.02 * scale, 0.31 * scale);
      joints.torso.mesh.add(lineR);

      // Chest core
      const coreGeo = new THREE.OctahedronGeometry(0.04 * scale);
      const coreMat = new THREE.MeshBasicMaterial({ color: 0x00ffcc });
      const core = new THREE.Mesh(coreGeo, coreMat);
      core.position.set(0, 0.1 * scale, 0.32 * scale);
      joints.torso.mesh.add(core);

      // Core glow
      const coreLight = new THREE.PointLight(0x00ffcc, 0.6, 1.5);
      coreLight.position.set(0, 0.1 * scale, 0.35 * scale);
      joints.torso.mesh.add(coreLight);
    }

    // Apply suit material to arms and legs with accent bands
    for (const jointName of ['armL', 'armR', 'legL', 'legR']) {
      const joint = joints[jointName as keyof CharacterJoints];
      if (joint?.mesh) {
        joint.mesh.material = suitMat;

        // Add glowing bands
        const bandGeo = new THREE.TorusGeometry(0.06 * scale, 0.01, 8, 16);
        const bandMat = new THREE.MeshBasicMaterial({ color: 0x00ff88 });
        const band = new THREE.Mesh(bandGeo, bandMat);
        band.rotation.x = Math.PI / 2;
        band.position.y = -0.1 * scale;
        joint.mesh.add(band);
      }
    }

    // Hover boots - more elaborate
    if (joints.legL?.mesh && joints.legR?.mesh) {
      const bootMat = new THREE.MeshStandardMaterial({
        color: 0x00ff88,
        emissive: 0x00ff88,
        emissiveIntensity: 1,
      });

      for (const leg of [joints.legL.mesh, joints.legR.mesh]) {
        // Boot upper
        const bootUpperGeo = new THREE.CylinderGeometry(0.06 * scale, 0.08 * scale, 0.08, 8);
        const bootUpper = new THREE.Mesh(bootUpperGeo, suitMat);
        bootUpper.position.set(0, -0.22 * scale, 0);
        leg.add(bootUpper);

        // Boot sole with glow
        const bootGeo = new THREE.BoxGeometry(0.1 * scale, 0.025, 0.14 * scale);
        const boot = new THREE.Mesh(bootGeo, bootMat);
        boot.position.set(0, -0.27 * scale, 0.01 * scale);
        leg.add(boot);

        // Thruster glow
        const thrusterGeo = new THREE.CylinderGeometry(0.03 * scale, 0.04 * scale, 0.02, 8);
        const thrusterMat = new THREE.MeshBasicMaterial({ color: 0x00ffff });
        const thruster = new THREE.Mesh(thrusterGeo, thrusterMat);
        thruster.position.set(0, -0.285 * scale, 0);
        leg.add(thruster);
      }

      // Boot glow lights
      const bootLightL = new THREE.PointLight(config.color, 0.8, 1.5);
      bootLightL.position.set(0, -0.3 * scale, 0);
      joints.legL.mesh.add(bootLightL);

      const bootLightR = new THREE.PointLight(config.color, 0.8, 1.5);
      bootLightR.position.set(0, -0.3 * scale, 0);
      joints.legR.mesh.add(bootLightR);
    }

    // Add Plasma SMG to right arm - enhanced version
    if (joints.armR?.group) {
      const weaponGroup = new THREE.Group();
      weaponGroup.position.set(0, -0.2 * scale, 0.12 * scale);
      weaponGroup.rotation.x = Math.PI / 2;

      // SMG body - sleeker design
      const smgGeo = new THREE.BoxGeometry(0.045, 0.22, 0.065);
      const smgMat = new THREE.MeshStandardMaterial({
        color: 0x111111,
        emissive: config.color,
        emissiveIntensity: 0.25,
        metalness: 0.95,
        roughness: 0.1,
      });
      const smg = new THREE.Mesh(smgGeo, smgMat);
      weaponGroup.add(smg);

      // Top rail
      const railGeo = new THREE.BoxGeometry(0.02, 0.15, 0.02);
      const rail = new THREE.Mesh(railGeo, smgMat);
      rail.position.set(0, 0.03, -0.035);
      weaponGroup.add(rail);

      // Barrel shroud
      const shroudGeo = new THREE.CylinderGeometry(0.022, 0.025, 0.14, 8);
      const shroud = new THREE.Mesh(shroudGeo, smgMat);
      shroud.position.set(0, 0.16, 0);
      weaponGroup.add(shroud);

      // Barrel tip
      const tipGeo = new THREE.CylinderGeometry(0.012, 0.018, 0.04, 8);
      const tipMat = new THREE.MeshBasicMaterial({ color: config.color });
      const tip = new THREE.Mesh(tipGeo, tipMat);
      tip.position.set(0, 0.24, 0);
      weaponGroup.add(tip);

      // Energy cores (3)
      const coreGeo = new THREE.SphereGeometry(0.012, 8, 8);
      const coreMat = new THREE.MeshBasicMaterial({ color: config.color });
      for (let i = 0; i < 3; i++) {
        const core = new THREE.Mesh(coreGeo, coreMat);
        core.position.set(0, -0.02 + i * 0.05, 0.035);
        weaponGroup.add(core);
      }

      // Side panels with glow lines
      const panelMat = new THREE.MeshBasicMaterial({ color: 0x00ff88 });
      const panelGeo = new THREE.BoxGeometry(0.003, 0.12, 0.008);
      const panelL = new THREE.Mesh(panelGeo, panelMat);
      panelL.position.set(0.025, 0.02, 0.02);
      weaponGroup.add(panelL);
      const panelR = new THREE.Mesh(panelGeo, panelMat);
      panelR.position.set(-0.025, 0.02, 0.02);
      weaponGroup.add(panelR);

      // Muzzle light
      const muzzle = new THREE.PointLight(config.color, 0, 4);
      muzzle.position.set(0, 0.26, 0);
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
