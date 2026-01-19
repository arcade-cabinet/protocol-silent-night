// Jest setup for React Native
import '@testing-library/jest-native/extend-expect';

// Mock expo-haptics
jest.mock('expo-haptics', () => ({
  impactAsync: jest.fn(),
  notificationAsync: jest.fn(),
  selectionAsync: jest.fn(),
  ImpactFeedbackStyle: {
    Light: 'light',
    Medium: 'medium',
    Heavy: 'heavy',
  },
  NotificationFeedbackType: {
    Success: 'success',
    Warning: 'warning',
    Error: 'error',
  },
}));

// Mock expo-router
jest.mock('expo-router', () => ({
  router: {
    push: jest.fn(),
    replace: jest.fn(),
    back: jest.fn(),
  },
  useLocalSearchParams: jest.fn(() => ({})),
  useRouter: jest.fn(() => ({
    push: jest.fn(),
    replace: jest.fn(),
    back: jest.fn(),
  })),
  Stack: {
    Screen: 'Screen',
  },
  Tabs: 'Tabs',
  Slot: 'Slot',
}));

// Mock BabylonJS React Native
jest.mock('@babylonjs/react-native', () => ({
  EngineView: 'EngineView',
  useEngine: jest.fn(() => null),
}));

jest.mock('@babylonjs/core', () => ({
  Engine: jest.fn(),
  Scene: jest.fn(() => ({
    dispose: jest.fn(),
    clearColor: {},
  })),
  ArcRotateCamera: jest.fn(),
  Vector3: {
    Zero: jest.fn(() => ({ x: 0, y: 0, z: 0 })),
  },
  Color4: jest.fn(),
  HemisphericLight: jest.fn(),
  MeshBuilder: {
    CreateBox: jest.fn(),
    CreateGround: jest.fn(),
  },
}));
