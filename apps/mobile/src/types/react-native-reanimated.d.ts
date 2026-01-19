/**
 * Type declarations to fix React types version mismatch
 *
 * This file resolves the JSX component type mismatch between
 * React 18 and React 19 types in the monorepo.
 *
 * The error "cannot be used as a JSX component" occurs because:
 * - Root node_modules has @types/react@19
 * - Local package expects @types/react@18
 *
 * skipLibCheck: true should resolve this but doesn't work
 * with some JSX component inference.
 */

// This is intentionally empty - the actual fix is in the component files
// using type assertions where needed.
export {};
