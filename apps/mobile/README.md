# Protocol: Silent Night - Mobile App

React Native mobile game built with Expo and BabylonJS.

## Development Setup

### Prerequisites

- Node.js 22+
- pnpm 10+
- Xcode (for iOS development)
- Android Studio (for Android development)

### Important: Expo Go is NOT Supported

This app uses **BabylonJS React Native** which requires native modules. You **cannot** use Expo Go to run this app.

Instead, you must use a **Development Client**:

```bash
# Build a development client for iOS simulator
eas build --profile development --platform ios

# Build a development client for Android emulator
eas build --profile development --platform android

# Then start the dev server
pnpm start
```

### Why Expo Go Doesn't Work

BabylonJS React Native (`@babylonjs/react-native`) includes native code that must be compiled into the app binary. Expo Go only supports a fixed set of native modules that ship with it.

When you need custom native modules (like BabylonJS), you must:
1. Build a development client with `eas build --profile development`
2. Install the development client on your device/simulator
3. Run `pnpm start` and connect from the development client

## Quick Start

```bash
# Install dependencies (from monorepo root)
pnpm install

# Build game-core dependency
pnpm build:core

# Build a development client (first time only)
cd apps/mobile
eas build --profile development --platform ios  # or android

# Start development server
pnpm start
```

## Build Commands

```bash
# Development builds (with dev tools)
eas build --profile development --platform ios
eas build --profile development --platform android

# Preview builds (APK for testing)
eas build --profile preview --platform android

# Universal APK (all architectures)
eas build --profile preview-apk-all-archs --platform android

# Production builds (for store submission)
eas build --profile production --platform ios
eas build --profile production --platform android
```

## EAS Build Profiles

| Profile | Platform | Output | Use Case |
|---------|----------|--------|----------|
| `development` | iOS/Android | Dev client | Local development |
| `development-device` | iOS/Android | Dev client | Physical device testing |
| `preview` | Android | APK | Internal testing |
| `preview-apk-all-archs` | Android | Universal APK | Wide distribution |
| `production` | iOS/Android | AAB/IPA | Store submission |
| `pixel-8a` | Android | APK | Pixel 8a testing |
| `oneplus-open` | Android | APK | OnePlus Open testing |

## Supported Architectures

The `preview-apk-all-archs` profile builds a universal APK supporting:
- `arm64-v8a` (64-bit ARM - most modern phones)
- `armeabi-v7a` (32-bit ARM - older devices)
- `x86_64` (64-bit Intel/AMD - emulators, Chromebooks)
- `x86` (32-bit Intel - older emulators)

## Target Devices

Optimized and tested for:
- Google Pixel 8a
- OnePlus Open (Foldable)
- iPhone 16 Pro Max
- iPad Pro 13-inch

## CI/CD

- **PRs**: Trigger EAS Update for preview
- **Push to main/release**: Build Android APK
- **Tags (v*)**: Build APK and create GitHub Release

See `.github/workflows/expo-cd.yml` for details.
