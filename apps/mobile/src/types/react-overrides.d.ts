/**
 * @fileoverview Type overrides for React 19 compatibility
 *
 * React 19 includes `bigint` in ReactNode, but some third-party libraries
 * haven't updated their types yet. This file provides compatibility overrides.
 */

import '@react-native-reanimated/reanimated';

declare module 'react' {
  // Fix for React 19 bigint ReactNode incompatibility with older libraries
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  interface DO_NOT_USE_OR_YOU_WILL_BE_FIRED_EXPERIMENTAL_REACT_NODES {
    // This prevents the bigint type from being added to ReactNode
    // See: https://github.com/DefinitelyTyped/DefinitelyTyped/issues/69006
  }
}

// Allow JSX components that return Promise<ReactNode> (React 19 async components)
declare global {
  namespace JSX {
    interface Element {
      // Compatibility shim
    }
  }
}

export {};
