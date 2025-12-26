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
import { useCallback, useEffect, useMemo, useRef } from 'react';
import * as THREE from 'three';
import type { PlayerClassConfig } from '@/types';

interface StrataCharacterProps {
  config: PlayerClassConfig;
  position?: [number, number, number];
  rotation?: number;
  isMoving?: boolean;
  isFiring?: boolean;
}

interface CustomizationConfig {
  joint: string;
  type: string;
  scale?: [number, number, number];
  position?: [number, number, number];
  rotation?: [number, number, number];
  name?: string;
  args?: (string | number)[];
  children?: CustomizationConfig[];
  material?: {
    color?: string | number;
    emissive?: string | number;
    emissiveIntensity?: number;
    roughness?: number;
    metalness?: number;
    transparent?: boolean;
    opacity?: number;
  };
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
  const furOptions = useMemo(
    () => ({
      baseColor: new THREE.Color(config.furOptions.baseColor),
      tipColor: new THREE.Color(config.furOptions.tipColor),
      layerCount: config.furOptions.layerCount,
      spacing: config.furOptions.spacing,
      windStrength: config.furOptions.windStrength,
      gravityDroop: config.furOptions.gravityDroop || 0.04,
    }),
    [config.furOptions]
  );

  const applyCustomizations = useCallback(
    (joints: CharacterJoints, customizations: CustomizationConfig[], scale: number) => {
      function createObjectFromConfig(custom: CustomizationConfig, scale: number): THREE.Object3D | null {
        let geometry: THREE.BufferGeometry | null = null;
        const scaledArgs = custom.args?.map((arg) =>
          typeof arg === 'number' ? arg * scale : arg
        );

        switch (custom.type) {
          case 'sphere':
            // @ts-expect-error - spread args for THREE geometry
            geometry = new THREE.SphereGeometry(...(scaledArgs || []));
            break;
          case 'box':
            // @ts-expect-error - spread args for THREE geometry
            geometry = new THREE.BoxGeometry(...(scaledArgs || []));
            break;
          case 'cone':
            // @ts-expect-error - spread args for THREE geometry
            geometry = new THREE.ConeGeometry(...(scaledArgs || []));
            break;
          case 'cylinder':
            // @ts-expect-error - spread args for THREE geometry
            geometry = new THREE.CylinderGeometry(...(scaledArgs || []));
            break;
          case 'torus':
            // @ts-expect-error - spread args for THREE geometry
            geometry = new THREE.TorusGeometry(...(scaledArgs || []));
            break;
          case 'capsule':
            // @ts-expect-error - spread args for THREE geometry
            geometry = new THREE.CapsuleGeometry(...(scaledArgs || []));
            break;
          case 'octahedron':
            // @ts-expect-error - spread args for THREE geometry
            geometry = new THREE.OctahedronGeometry(...(scaledArgs || []));
            break;
          case 'star': {
            const starShape = new THREE.Shape();
            if (scaledArgs && scaledArgs.length >= 4) {
              const [outer, inner, points, depth] = scaledArgs as [number, number, number, number];
              for (let i = 0; i < points * 2; i++) {
                const radius = i % 2 === 0 ? outer : inner;
                const angle = (i * Math.PI) / points - Math.PI / 2;
                starShape.lineTo(Math.cos(angle) * radius, Math.sin(angle) * radius);
              }
              starShape.closePath();
              geometry = new THREE.ExtrudeGeometry(starShape, {
                depth: depth,
                bevelEnabled: false,
              });
              geometry.center();
            }
            break;
          }
          case 'group': {
            const group = new THREE.Group();
            if (custom.children) {
              for (const child of custom.children) {
                const childObj = createObjectFromConfig(child, scale);
                if (childObj) group.add(childObj);
              }
            }
            applyTransforms(group, custom, scale);
            return group;
          }
          case 'pointLight': {
            if (scaledArgs && scaledArgs.length >= 3) {
              const light = new THREE.PointLight(
                scaledArgs[0] as string | number,
                scaledArgs[1] as number,
                scaledArgs[2] as number
              );
              if (custom.name === 'muzzle_flash') muzzleRef.current = light;
              applyTransforms(light, custom, scale);
              return light;
            }
            return null;
          }
        }

        if (geometry && custom.material) {
          const material = new THREE.MeshStandardMaterial({
            color: custom.material.color,
            emissive: custom.material.emissive,
            emissiveIntensity: custom.material.emissiveIntensity,
            roughness: custom.material.roughness,
            metalness: custom.material.metalness,
            transparent: custom.material.transparent,
            opacity: custom.material.opacity,
          });
          const mesh = new THREE.Mesh(geometry, material);
          mesh.castShadow = true;
          applyTransforms(mesh, custom, scale);
          return mesh;
        }

        return null;
      }

      function applyTransforms(obj: THREE.Object3D, custom: CustomizationConfig, scale: number) {
        if (custom.position)
          obj.position.set(
            custom.position[0] * scale,
            custom.position[1] * scale,
            custom.position[2] * scale
          );
        if (custom.rotation)
          obj.rotation.set(custom.rotation[0], custom.rotation[1], custom.rotation[2]);
        if (custom.scale) obj.scale.set(custom.scale[0], custom.scale[1], custom.scale[2]);
      }

      for (const custom of customizations) {
        const joint = joints[custom.joint as keyof CharacterJoints];
        // Type scale can apply without a mesh on certain joints in future, but for now we require mesh for attachments
        if (custom.type !== 'scale' && !joint?.mesh) continue;

        if (custom.type === 'scale') {
          if (joint?.mesh && custom.scale) {
            joint.mesh.scale.set(custom.scale[0], custom.scale[1], custom.scale[2]);
          }
          continue;
        }

        const obj = createObjectFromConfig(custom, scale);
        if (obj && joint?.mesh) {
          if (custom.name === 'weapon_group') weaponGroupRef.current = obj as THREE.Group;
          joint.mesh.add(obj);
        }
      }
    },
    []
  );

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
