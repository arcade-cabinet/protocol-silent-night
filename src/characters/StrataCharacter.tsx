/**
 * Generic Strata Character Component
 * Loads character definitions from data and creates articulated models
 */

import {
  animateCharacter,
  type CharacterJoints,
  type CharacterState,
  createCharacter,
  updateFurUniforms,
} from '@jbcom/strata';
import { useFrame } from '@react-three/fiber';
import { useEffect, useMemo, useRef } from 'react';
import * as THREE from 'three';
import type { PlayerClassConfig } from '@/types';

interface StrataCharacterProps {
  config: PlayerClassConfig;
  position?: [number, number, number];
  rotation?: number;
  isMoving?: boolean;
  isFiring?: boolean;
}

export function StrataCharacter({
  config,
  position = [0, 0, 0],
  rotation = 0,
  isMoving = false,
  isFiring = false,
}: StrataCharacterProps) {
  const groupRef = useRef<THREE.Group>(null);
  const characterRef = useRef<{
    root: THREE.Group;
    joints: CharacterJoints;
    state: CharacterState;
  } | null>(null);
  
  // Dynamic refs for specific components
  const muzzleRef = useRef<THREE.PointLight | null>(null);
  const weaponGroupRef = useRef<THREE.Group | null>(null);
  const furGroupsRef = useRef<THREE.Group[]>([]);

  // Strata fur options from data
  const furOptions = useMemo(() => ({
    baseColor: new THREE.Color(config.furOptions.baseColor),
    tipColor: new THREE.Color(config.furOptions.tipColor),
    layerCount: config.furOptions.layerCount,
    spacing: config.furOptions.spacing,
    windStrength: config.furOptions.windStrength,
    gravityDroop: config.furOptions.gravityDroop || 0.04,
  }), [config.furOptions]);

  useEffect(() => {
    if (!groupRef.current) return;

    // 1. Create base character
    const character = createCharacter({
      skinColor: new THREE.Color(config.color).getHex(),
      furOptions,
      scale: config.scale,
    });

    characterRef.current = character;
    groupRef.current.add(character.root);

    // 2. Apply DDL customizations
    if (config.customizations) {
      applyCustomizations(character.joints, config.customizations, config.scale);
    }

    // 3. Cache fur groups
    const furGroups: THREE.Group[] = [];
    character.root.traverse((child) => {
      if (child instanceof THREE.Group && child.userData.isFurGroup) {
        furGroups.push(child);
      }
    });
    furGroupsRef.current = furGroups;

    return () => {
      if (characterRef.current && groupRef.current) {
        groupRef.current.remove(characterRef.current.root);
        characterRef.current = null;
        furGroupsRef.current = [];
      }
    };
  }, [config, furOptions]);

  function applyCustomizations(joints: CharacterJoints, customizations: any[], scale: number) {
    for (const custom of customizations) {
      const joint = joints[custom.joint as keyof CharacterJoints];
      if (!joint?.mesh && custom.type !== 'scale') continue;

      if (custom.type === 'scale') {
        if (joint?.mesh) {
          joint.mesh.scale.set(custom.scale[0], custom.scale[1], custom.scale[2]);
        }
        continue;
      }

      const obj = createObjectFromConfig(custom, scale);
      if (obj) {
        if (custom.name === 'weapon_group') weaponGroupRef.current = obj as THREE.Group;
        joint?.mesh.add(obj);
      }
    }
  }

  function createObjectFromConfig(config: any, scale: number): THREE.Object3D | null {
    let geometry: THREE.BufferGeometry | null = null;
    const scaledArgs = config.args?.map((arg: any) => typeof arg === 'number' ? arg * scale : arg);

    switch (config.type) {
      case 'sphere':
        geometry = new THREE.SphereGeometry(...(scaledArgs || []));
        break;
      case 'box':
        geometry = new THREE.BoxGeometry(...(scaledArgs || []));
        break;
      case 'cone':
        geometry = new THREE.ConeGeometry(...(scaledArgs || []));
        break;
      case 'cylinder':
        geometry = new THREE.CylinderGeometry(...(scaledArgs || []));
        break;
      case 'torus':
        geometry = new THREE.TorusGeometry(...(scaledArgs || []));
        break;
      case 'group':
        const group = new THREE.Group();
        if (config.children) {
          for (const child of config.children) {
            const childObj = createObjectFromConfig(child, scale);
            if (childObj) group.add(childObj);
          }
        }
        applyTransforms(group, config, scale);
        return group;
      case 'pointLight':
        const light = new THREE.PointLight(config.args[0], config.args[1], config.args[2]);
        if (config.name === 'muzzle_flash') muzzleRef.current = light;
        applyTransforms(light, config, scale);
        return light;
    }

    if (geometry) {
      const material = new THREE.MeshStandardMaterial({
        color: config.material.color,
        emissive: config.material.emissive,
        emissiveIntensity: config.material.emissiveIntensity,
        roughness: config.material.roughness,
        metalness: config.material.metalness,
        transparent: config.material.transparent,
        opacity: config.material.opacity,
      });
      const mesh = new THREE.Mesh(geometry, material);
      mesh.castShadow = true;
      applyTransforms(mesh, config, scale);
      return mesh;
    }

    return null;
  }

  function applyTransforms(obj: THREE.Object3D, config: any, scale: number) {
    if (config.position) obj.position.set(config.position[0] * scale, config.position[1] * scale, config.position[2] * scale);
    if (config.rotation) obj.rotation.set(config.rotation[0], config.rotation[1], config.rotation[2]);
    if (config.scale) obj.scale.set(config.scale[0], config.scale[1], config.scale[2]);
  }

  useFrame((state) => {
    const time = state.clock.elapsedTime;

    if (characterRef.current) {
      const { state: charState } = characterRef.current;

      // Update movement state
      charState.speed = isMoving ? charState.maxSpeed * 0.8 : 0;

      // Animate joints
      animateCharacter(characterRef.current, time * (config.type === 'bumble' ? 0.7 : 1));

      // Animate fur
      for (const furGroup of furGroupsRef.current) {
        updateFurUniforms(furGroup, time);
      }

      // Weapon logic
      if (weaponGroupRef.current) {
        if (isFiring) {
          weaponGroupRef.current.position.z += Math.sin(time * 20) * 0.02;
        }
      }

      if (muzzleRef.current) {
        muzzleRef.current.intensity = isFiring ? Math.random() * 3 + 2 : 0;
      }
    }
  });

  return <group ref={groupRef} position={position} rotation={[0, rotation, 0]} />;
}
