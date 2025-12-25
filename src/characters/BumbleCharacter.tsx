/**
 * THE BUMBLE Character
 * Crowd Control / Bruiser class - Large Abominable Snowman with thick fur
 * Uses Strata's createCharacter for proper joint hierarchy with dense fur coverage
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
  const characterRef = useRef<{
    root: THREE.Group;
    joints: CharacterJoints;
    state: CharacterState;
  } | null>(null);
  const muzzleRef = useRef<THREE.PointLight | null>(null);
  const starMeshRef = useRef<THREE.Mesh | null>(null);
  // Cache fur groups to avoid traversing scene graph every frame
  const furGroupsRef = useRef<THREE.Group[]>([]);

  const config = PLAYER_CLASSES.bumble;

  // Dense white fur for the Bumble
  const furOptions: FurOptions = useMemo(
    () => ({
      baseColor: new THREE.Color(0.85, 0.85, 0.85), // White-gray base
      tipColor: new THREE.Color(1.0, 1.0, 1.0), // Pure white tips
      layerCount: 16, // Very dense fur
      spacing: 0.035, // Longer fur
      windStrength: 0.6,
      gravityDroop: 0.05,
    }),
    []
  );

  // Create articulated character using Strata
  useEffect(() => {
    if (groupRef.current && !characterRef.current) {
      const character = createCharacter({
        skinColor: config.color,
        furOptions,
        scale: config.scale,
      });

      characterRef.current = character;
      groupRef.current.add(character.root);

      // Customize for Bumble appearance
      customizeBumbleAppearance(character.joints, config.scale);

      // Cache fur groups for efficient updates (avoid traversing every frame)
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

  function customizeBumbleAppearance(joints: CharacterJoints, scale: number) {
    // Make hips larger for the Bumble's round body
    if (joints.hips?.mesh) {
      joints.hips.mesh.scale.set(1.4, 1.2, 1.3);
    }

    // Make torso larger
    if (joints.torso?.mesh) {
      joints.torso.mesh.scale.set(1.3, 1.1, 1.2);
    }

    if (!joints.head?.mesh) return;
    const headMesh = joints.head.mesh;

    // Scale up head
    headMesh.scale.set(1.3, 1.2, 1.2);

    // Remove default muzzle, add Bumble's snout
    const childrenToRemove = headMesh.children.filter((child) => child instanceof THREE.Mesh);
    for (const child of childrenToRemove) {
      headMesh.remove(child);
    }

    // Horns
    const hornGeo = new THREE.ConeGeometry(0.06 * scale, 0.3 * scale, 6);
    const hornMat = new THREE.MeshStandardMaterial({
      color: 0xccccaa,
      roughness: 0.4,
      metalness: 0.2,
    });

    const hornL = new THREE.Mesh(hornGeo, hornMat);
    hornL.position.set(0.2 * scale, 0.2 * scale, 0);
    hornL.rotation.z = -0.4;
    headMesh.add(hornL);

    const hornR = new THREE.Mesh(hornGeo, hornMat);
    hornR.position.set(-0.2 * scale, 0.2 * scale, 0);
    hornR.rotation.z = 0.4;
    headMesh.add(hornR);

    // Glowing blue eyes
    const eyeGeo = new THREE.SphereGeometry(0.05 * scale, 12, 12);
    const eyeMat = new THREE.MeshBasicMaterial({ color: 0x00ccff });

    const eyeL = new THREE.Mesh(eyeGeo, eyeMat);
    eyeL.position.set(0.1 * scale, 0.04 * scale, 0.28 * scale);
    headMesh.add(eyeL);

    const eyeR = new THREE.Mesh(eyeGeo, eyeMat);
    eyeR.position.set(-0.1 * scale, 0.04 * scale, 0.28 * scale);
    headMesh.add(eyeR);

    // Eye glow
    const eyeLight = new THREE.PointLight(0x00ccff, 0.8, 2);
    eyeLight.position.set(0, 0.04 * scale, 0.3 * scale);
    headMesh.add(eyeLight);

    // Snout/nose
    const snoutGeo = new THREE.SphereGeometry(0.07 * scale, 12, 12);
    const snoutMat = new THREE.MeshStandardMaterial({ color: 0x333333, roughness: 0.3 });
    const snout = new THREE.Mesh(snoutGeo, snoutMat);
    snout.position.set(0, -0.08 * scale, 0.3 * scale);
    headMesh.add(snout);

    // Teeth
    const teethGeo = new THREE.BoxGeometry(0.12 * scale, 0.04, 0.04);
    const teethMat = new THREE.MeshStandardMaterial({ color: 0xffffff });
    const teeth = new THREE.Mesh(teethGeo, teethMat);
    teeth.position.set(0, -0.16 * scale, 0.25 * scale);
    headMesh.add(teeth);

    // Make arms thicker
    if (joints.armL?.mesh) {
      joints.armL.mesh.scale.set(1.5, 1.2, 1.5);
    }
    if (joints.armR?.mesh) {
      joints.armR.mesh.scale.set(1.5, 1.2, 1.5);
    }

    // Make legs thicker
    if (joints.legL?.mesh) {
      joints.legL.mesh.scale.set(1.4, 1.1, 1.4);
    }
    if (joints.legR?.mesh) {
      joints.legR.mesh.scale.set(1.4, 1.1, 1.4);
    }

    // Add Star Thrower weapon to left arm
    if (joints.armL?.group) {
      const weaponGroup = new THREE.Group();
      weaponGroup.position.set(0.15 * scale, -0.35 * scale, 0.2 * scale);

      // Create star shape
      const starShape = new THREE.Shape();
      const outerRadius = 0.1 * scale;
      const innerRadius = 0.04 * scale;
      const points = 5;

      for (let i = 0; i < points * 2; i++) {
        const radius = i % 2 === 0 ? outerRadius : innerRadius;
        const angle = (i * Math.PI) / points - Math.PI / 2;
        const x = Math.cos(angle) * radius;
        const y = Math.sin(angle) * radius;
        if (i === 0) {
          starShape.moveTo(x, y);
        } else {
          starShape.lineTo(x, y);
        }
      }
      starShape.closePath();

      const starGeo = new THREE.ExtrudeGeometry(starShape, { depth: 0.02, bevelEnabled: false });
      const starMat = new THREE.MeshStandardMaterial({
        color: 0xffd700,
        emissive: 0xffaa00,
        emissiveIntensity: 0.8,
        roughness: 0.2,
        metalness: 0.9,
      });
      const star = new THREE.Mesh(starGeo, starMat);
      star.rotation.x = Math.PI / 2;
      weaponGroup.add(star);
      starMeshRef.current = star;

      // Star glow
      const starLight = new THREE.PointLight(0xffd700, 1, 4);
      weaponGroup.add(starLight);
      muzzleRef.current = starLight;

      joints.armL.group.add(weaponGroup);
    }

    // Remove tail (Bumble doesn't have a visible tail)
    if (joints.tail?.group) {
      joints.tail.group.visible = false;
    }
  }

  useFrame((state) => {
    const time = state.clock.elapsedTime;

    if (characterRef.current) {
      const { joints, state: charState } = characterRef.current;

      // Bumble moves slower but steadily
      charState.maxSpeed = 0.12;
      charState.speed = isMoving ? charState.maxSpeed : 0;

      // Use Strata's animateCharacter with heavier motion
      animateCharacter(characterRef.current, time * 0.7); // Slower animation

      // Update fur uniforms using cached groups (avoids traversal every frame)
      for (const furGroup of furGroupsRef.current) {
        updateFurUniforms(furGroup, time);
      }

      // Heavy breathing when idle - only animate Y to preserve non-uniform scale
      if (joints.torso?.mesh) {
        if (!isMoving) {
          const breath = Math.sin(time * 1.5);
          joints.torso.mesh.scale.y = 1.1 + breath * 0.03;
        } else {
          // Reset Y scale when moving, preserving X and Z from customization
          joints.torso.mesh.scale.y = 1.1;
        }
      }

      // Rotate star when firing
      if (starMeshRef.current) {
        if (isFiring) {
          starMeshRef.current.rotation.z += 0.3;
        }
      }

      // Star glow intensity
      if (muzzleRef.current) {
        muzzleRef.current.intensity = isFiring ? 3 + Math.sin(time * 10) : 1;
      }
    }
  });

  return (
    <group ref={groupRef} position={position} rotation={[0, rotation, 0]} />
  );
}
