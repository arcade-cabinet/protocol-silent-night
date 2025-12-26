/**
 * MECHA-SANTA Character
 * Heavy Siege / Tank class with articulated body, fur-lined suit, and Coal Cannon
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
  const characterRef = useRef<{
    root: THREE.Group;
    joints: CharacterJoints;
    state: CharacterState;
  } | null>(null);
  const muzzleRef = useRef<THREE.PointLight | null>(null);
  const weaponGroupRef = useRef<THREE.Group | null>(null);
  // Cache fur groups to avoid traversing scene graph every frame
  const furGroupsRef = useRef<THREE.Group[]>([]);

  const config = PLAYER_CLASSES.santa;

  // Strata fur options for Santa's suit
  const furOptions: FurOptions = useMemo(
    () => ({
      baseColor: new THREE.Color(0.8, 0.1, 0.1), // Red base
      tipColor: new THREE.Color(1.0, 0.3, 0.3), // Lighter red tips
      layerCount: 8,
      spacing: 0.015,
      windStrength: 0.3,
    }),
    []
  );

  // Add Santa-specific details (hat, beard, belt, weapon)
  // biome-ignore lint/correctness/useExhaustiveDependencies: customizeSantaAppearance is stable and defined below
  useEffect(() => {
    if (groupRef.current && !characterRef.current) {
      // Create the base character with Strata
      const character = createCharacter({
        skinColor: config.color,
        furOptions,
        scale: config.scale,
        
      });

      characterRef.current = character;
      groupRef.current.add(character.root);

      // Customize for Santa appearance
      customizeSantaAppearance(character.joints, config.scale);

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
  }, [config.color, config.scale, furOptions]);

  function customizeSantaAppearance(joints: CharacterJoints, scale: number) {
    if (!joints.head?.mesh) return;

    const headMesh = joints.head.mesh;

    // Add beard - multi-layered for fullness
    const beardGeo = new THREE.SphereGeometry(0.28 * scale, 12, 12);
    const beardMat = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.9 });
    const beard = new THREE.Mesh(beardGeo, beardMat);
    beard.position.set(0, -0.15 * scale, 0.15 * scale);
    beard.scale.set(1, 1.3, 0.8);
    headMesh.add(beard);

    // Secondary beard layer for volume
    const beardGeo2 = new THREE.SphereGeometry(0.22 * scale, 10, 10);
    const beard2 = new THREE.Mesh(beardGeo2, beardMat);
    beard2.position.set(0, -0.25 * scale, 0.18 * scale);
    headMesh.add(beard2);

    // Mustache
    const mustacheGeo = new THREE.CapsuleGeometry(0.04 * scale, 0.15 * scale, 4, 8);
    const mustache = new THREE.Mesh(mustacheGeo, beardMat);
    mustache.position.set(0, -0.02 * scale, 0.22 * scale);
    mustache.rotation.z = Math.PI / 2;
    headMesh.add(mustache);

    // Add hat
    const hatGeo = new THREE.ConeGeometry(0.22 * scale, 0.4 * scale, 8);
    const hatMat = new THREE.MeshStandardMaterial({
      color: config.color,
      emissive: config.color,
      emissiveIntensity: 0.3,
    });
    const hat = new THREE.Mesh(hatGeo, hatMat);
    hat.position.set(0, 0.2 * scale, 0);
    hat.rotation.z = 0.1; // Slight tilt
    headMesh.add(hat);

    // Hat pom-pom with glow
    const pomGeo = new THREE.SphereGeometry(0.1 * scale, 8, 8);
    const pomMat = new THREE.MeshStandardMaterial({ 
      color: 0xffffff,
      emissive: 0xffffcc,
      emissiveIntensity: 0.3,
    });
    const pom = new THREE.Mesh(pomGeo, pomMat);
    pom.position.set(0.05 * scale, 0.45 * scale, 0.1 * scale);
    headMesh.add(pom);

    // Hat fur trim
    const hatTrimGeo = new THREE.TorusGeometry(0.2 * scale, 0.05 * scale, 8, 16);
    const hatTrim = new THREE.Mesh(hatTrimGeo, beardMat);
    hatTrim.position.set(0, 0.05 * scale, 0);
    hatTrim.rotation.x = Math.PI / 2;
    headMesh.add(hatTrim);

    // Glowing cyber eyes with scanline effect
    const eyeGeo = new THREE.SphereGeometry(0.04 * scale, 8, 8);
    const eyeMat = new THREE.MeshBasicMaterial({ color: 0x00ffff });
    const eyeL = new THREE.Mesh(eyeGeo, eyeMat);
    eyeL.position.set(0.08 * scale, 0.05 * scale, 0.2 * scale);
    headMesh.add(eyeL);
    const eyeR = new THREE.Mesh(eyeGeo, eyeMat);
    eyeR.position.set(-0.08 * scale, 0.05 * scale, 0.2 * scale);
    headMesh.add(eyeR);

    // Eye glow light
    const eyeLight = new THREE.PointLight(0x00ffff, 0.5, 1.5);
    eyeLight.position.set(0, 0.05 * scale, 0.22 * scale);
    headMesh.add(eyeLight);

    // Nose
    const noseGeo = new THREE.SphereGeometry(0.05 * scale, 8, 8);
    const noseMat = new THREE.MeshStandardMaterial({ color: 0xffccaa, roughness: 0.8 });
    const nose = new THREE.Mesh(noseGeo, noseMat);
    nose.position.set(0, 0, 0.23 * scale);
    headMesh.add(nose);

    // Add belt to torso
    if (joints.torso?.mesh) {
      // Main belt
      const beltGeo = new THREE.TorusGeometry(0.35 * scale, 0.05, 8, 32);
      const beltMat = new THREE.MeshStandardMaterial({ color: 0x111111, metalness: 0.8, roughness: 0.3 });
      const belt = new THREE.Mesh(beltGeo, beltMat);
      belt.rotation.x = Math.PI / 2;
      belt.position.y = -0.15 * scale;
      joints.torso.mesh.add(belt);

      // Belt buckle - ornate
      const buckleGeo = new THREE.BoxGeometry(0.12 * scale, 0.1 * scale, 0.03);
      const buckleMat = new THREE.MeshStandardMaterial({ 
        color: 0xffd700, 
        metalness: 0.95,
        roughness: 0.1,
        emissive: 0xffa500,
        emissiveIntensity: 0.2,
      });
      const buckle = new THREE.Mesh(buckleGeo, buckleMat);
      buckle.position.set(0, -0.15 * scale, 0.36 * scale);
      joints.torso.mesh.add(buckle);

      // Buckle detail
      const buckleDetailGeo = new THREE.BoxGeometry(0.06 * scale, 0.05 * scale, 0.015);
      const buckleDetail = new THREE.Mesh(buckleDetailGeo, new THREE.MeshBasicMaterial({ color: 0xffaa00 }));
      buckleDetail.position.set(0, -0.15 * scale, 0.38 * scale);
      joints.torso.mesh.add(buckleDetail);

      // Fur collar trim
      const collarGeo = new THREE.TorusGeometry(0.34 * scale, 0.06, 8, 32);
      const collar = new THREE.Mesh(collarGeo, beardMat);
      collar.rotation.x = Math.PI / 2;
      collar.position.y = 0.35 * scale;
      joints.torso.mesh.add(collar);

      // Chest buttons
      for (let i = 0; i < 3; i++) {
        const buttonGeo = new THREE.CylinderGeometry(0.025 * scale, 0.025 * scale, 0.015, 8);
        const buttonMat = new THREE.MeshStandardMaterial({ color: 0x111111, metalness: 0.9 });
        const button = new THREE.Mesh(buttonGeo, buttonMat);
        button.position.set(0, 0.15 * scale - i * 0.12 * scale, 0.33 * scale);
        button.rotation.x = Math.PI / 2;
        joints.torso.mesh.add(button);
      }
    }

    // Arm fur cuffs
    if (joints.armL?.mesh) {
      const cuffGeo = new THREE.TorusGeometry(0.12 * scale, 0.03 * scale, 8, 16);
      const cuff = new THREE.Mesh(cuffGeo, beardMat);
      cuff.position.set(0, -0.2 * scale, 0);
      cuff.rotation.x = Math.PI / 2;
      joints.armL.mesh.add(cuff);
    }
    if (joints.armR?.mesh) {
      const cuffGeo = new THREE.TorusGeometry(0.12 * scale, 0.03 * scale, 8, 16);
      const cuff = new THREE.Mesh(cuffGeo, beardMat);
      cuff.position.set(0, -0.2 * scale, 0);
      cuff.rotation.x = Math.PI / 2;
      joints.armR.mesh.add(cuff);
    }

    // Add Coal Cannon to right arm - enhanced version
    if (joints.armR?.group) {
      const weaponGroup = new THREE.Group();
      weaponGroup.position.set(0, -0.3 * scale, 0.15 * scale);

      // Main barrel
      const cannonGeo = new THREE.CylinderGeometry(0.07, 0.12, 0.55, 8);
      const cannonMat = new THREE.MeshStandardMaterial({
        color: 0x222222,
        emissive: 0xff2200,
        emissiveIntensity: 0.15,
        metalness: 0.95,
        roughness: 0.2,
      });
      const cannon = new THREE.Mesh(cannonGeo, cannonMat);
      cannon.rotation.x = Math.PI / 2;
      weaponGroup.add(cannon);

      // Barrel rings
      for (let i = 0; i < 3; i++) {
        const ringGeo = new THREE.TorusGeometry(0.08 + i * 0.015, 0.015, 8, 16);
        const ringMat = new THREE.MeshStandardMaterial({
          color: 0x444444,
          emissive: 0xff4400,
          emissiveIntensity: 0.3 - i * 0.1,
          metalness: 0.9,
        });
        const ring = new THREE.Mesh(ringGeo, ringMat);
        ring.position.z = -0.15 + i * 0.12;
        ring.rotation.x = Math.PI / 2;
        weaponGroup.add(ring);
      }

      // Heat vents
      for (let i = 0; i < 4; i++) {
        const ventGeo = new THREE.BoxGeometry(0.02, 0.08, 0.02);
        const ventMat = new THREE.MeshBasicMaterial({ color: 0xff3300 });
        const vent = new THREE.Mesh(ventGeo, ventMat);
        const angle = (i / 4) * Math.PI * 2;
        vent.position.set(Math.cos(angle) * 0.1, 0, Math.sin(angle) * 0.1 - 0.1);
        weaponGroup.add(vent);
      }

      // Muzzle light
      const muzzle = new THREE.PointLight(0xff4400, 0, 6);
      muzzle.position.set(0, 0, 0.35);
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

      // Update character state based on movement
      charState.speed = isMoving ? charState.maxSpeed * 0.8 : 0;

      // Use Strata's animateCharacter for walk/idle cycles
      animateCharacter(characterRef.current, time);

      // Update fur uniforms using cached groups (avoids traversal every frame)
      for (const furGroup of furGroupsRef.current) {
        updateFurUniforms(furGroup, time);
      }

      // Weapon recoil when firing
      if (weaponGroupRef.current) {
        if (isFiring) {
          weaponGroupRef.current.position.z = 0.15 + Math.sin(time * 20) * 0.02;
        } else {
          weaponGroupRef.current.position.z = 0.15;
        }
      }

      // Muzzle flash
      if (muzzleRef.current) {
        muzzleRef.current.intensity = isFiring ? Math.random() * 3 + 2 : 0;
      }
    }
  });

  return (
    <group ref={groupRef} position={position} rotation={[0, rotation, 0]} />
  );
}
