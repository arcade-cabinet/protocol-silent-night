# android/ — Debug Keystore

The `debug.keystore` referenced by `export_presets.cfg` is **not committed** to this
repository. It is generated at CI build time.

## How CI generates it

The release workflow (`.github/workflows/release.yml`) runs:

```bash
keytool -genkey -v \
  -keystore android/debug.keystore \
  -storepass android \
  -alias androiddebugkey \
  -keypass android \
  -keyalg RSA \
  -keysize 2048 \
  -validity 10000 \
  -dname "CN=Android Debug, O=Android, C=US"
```

The keystore is written to `android/debug.keystore` before Godot exports the APK, then
discarded — it is never uploaded or cached.

## Local export

To export locally, generate the debug keystore once and place it at `android/debug.keystore`:

```bash
keytool -genkey -v \
  -keystore android/debug.keystore \
  -storepass android \
  -alias androiddebugkey \
  -keypass android \
  -keyalg RSA -keysize 2048 -validity 10000 \
  -dname "CN=Android Debug, O=Android, C=US"

godot --headless --export-debug "Android Debug" export/android/protocol-silent-night-debug.apk
```

`android/debug.keystore` is listed in `.gitignore` — do not commit it.
