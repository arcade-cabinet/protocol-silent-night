import { cleanup } from '@testing-library/react';
import { afterEach, vi } from 'vitest';
import '@testing-library/jest-dom/vitest';

// Cleanup after each test
afterEach(() => {
  cleanup();
});

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {};

  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value.toString();
    },
    removeItem: (key: string) => {
      delete store[key];
    },
    clear: () => {
      store = {};
    },
  };
})();

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
});

// Mock matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation((query) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});

// Mock Tone.js globally
vi.mock('tone', () => {
  const mockParam = {
    value: 0,
    rampTo: vi.fn(),
  };

  const synthMock = {
    toDestination: vi.fn().mockReturnThis(),
    triggerAttackRelease: vi.fn(),
    dispose: vi.fn(),
    volume: mockParam,
  };

  // Use functions that can be used as constructors
  function MockSynth() { return synthMock; }
  function MockPolySynth() { return synthMock; }
  function MockFMSynth() { return synthMock; }
  function MockNoiseSynth() { return synthMock; }

  return {
    start: vi.fn().mockResolvedValue(undefined),
    now: vi.fn().mockReturnValue(0),
    gainToDb: vi.fn().mockReturnValue(0),
    getDestination: vi.fn().mockReturnValue({ volume: mockParam }),
    getTransport: vi.fn().mockReturnValue({
      start: vi.fn(),
      stop: vi.fn(),
      bpm: mockParam,
    }),
    Synth: MockSynth,
    PolySynth: MockPolySynth,
    FMSynth: MockFMSynth,
    NoiseSynth: MockNoiseSynth,
    Loop: class {
      callback: (time: number) => void;
      constructor(callback: (time: number) => void) {
        this.callback = callback;
      }
      start = vi.fn().mockReturnThis();
      stop = vi.fn().mockReturnThis();
      dispose = vi.fn().mockReturnThis();
    },
  };
});

// Mock ResizeObserver
global.ResizeObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
}));

// Mock WebGL context
HTMLCanvasElement.prototype.getContext = vi.fn().mockImplementation((contextType) => {
  if (contextType === 'webgl' || contextType === 'webgl2') {
    return {
      canvas: document.createElement('canvas'),
      drawingBufferWidth: 800,
      drawingBufferHeight: 600,
      getParameter: vi.fn(),
      getExtension: vi.fn(),
      createProgram: vi.fn(),
      createShader: vi.fn(),
      shaderSource: vi.fn(),
      compileShader: vi.fn(),
      attachShader: vi.fn(),
      linkProgram: vi.fn(),
      useProgram: vi.fn(),
      getUniformLocation: vi.fn(),
      getAttribLocation: vi.fn(),
      uniform1f: vi.fn(),
      uniform2f: vi.fn(),
      uniform3f: vi.fn(),
      uniform4f: vi.fn(),
      uniformMatrix4fv: vi.fn(),
      viewport: vi.fn(),
      clearColor: vi.fn(),
      clear: vi.fn(),
      enable: vi.fn(),
      disable: vi.fn(),
      blendFunc: vi.fn(),
      depthFunc: vi.fn(),
      cullFace: vi.fn(),
      getContextAttributes: vi.fn(() => ({})),
    };
  }
  return null;
});
