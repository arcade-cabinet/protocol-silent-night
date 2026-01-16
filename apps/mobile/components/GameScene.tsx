/**
 * GameScene - BabylonJS React Native game scene
 *
 * This component sets up the BabylonJS engine and renders the game world.
 * It uses the new Architecture (Fabric) for optimal performance.
 */

import { useRef, useCallback } from 'react';
import { View, StyleSheet } from 'react-native';
import { EngineView, useEngine } from '@babylonjs/react-native';
import {
  Scene,
  ArcRotateCamera,
  HemisphericLight,
  MeshBuilder,
  Vector3,
  Color3,
  StandardMaterial,
  Color4,
} from '@babylonjs/core';

interface GameSceneProps {
  onReady?: () => void;
}

export function GameScene({ onReady }: GameSceneProps) {
  const sceneRef = useRef<Scene | null>(null);
  const engine = useEngine();

  const onInitialized = useCallback(
    (scene: Scene) => {
      sceneRef.current = scene;

      // Set up scene background
      scene.clearColor = new Color4(0.04, 0.04, 0.1, 1); // #0a0a1a

      // Create camera
      const camera = new ArcRotateCamera(
        'camera',
        -Math.PI / 2,
        Math.PI / 3,
        50,
        Vector3.Zero(),
        scene
      );
      camera.lowerRadiusLimit = 20;
      camera.upperRadiusLimit = 80;

      // Create lights
      const light = new HemisphericLight('light', new Vector3(0, 1, 0), scene);
      light.intensity = 0.8;

      // Create ground (placeholder for terrain)
      const ground = MeshBuilder.CreateGround(
        'ground',
        { width: 100, height: 100 },
        scene
      );
      const groundMat = new StandardMaterial('groundMat', scene);
      groundMat.diffuseColor = new Color3(0.1, 0.1, 0.15);
      groundMat.specularColor = new Color3(0, 0, 0);
      ground.material = groundMat;

      // Create player placeholder
      const player = MeshBuilder.CreateBox(
        'player',
        { width: 2, height: 4, depth: 2 },
        scene
      );
      player.position.y = 2;
      const playerMat = new StandardMaterial('playerMat', scene);
      playerMat.emissiveColor = new Color3(0, 1, 0.4); // #00ff66
      player.material = playerMat;

      onReady?.();
    },
    [onReady]
  );

  return (
    <View style={styles.container}>
      <EngineView
        style={styles.engineView}
        camera={sceneRef.current?.activeCamera}
        displayFrameRate={__DEV__}
        onInitialized={onInitialized}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0a0a1a',
  },
  engineView: {
    flex: 1,
  },
});
