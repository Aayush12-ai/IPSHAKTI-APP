---
name: Expo preview tooling
description: Environment-specific Expo startup behavior for this workspace
---

The React Native DevTools installer can emit a missing `libglib-2.0.so.0` warning during Expo startup. This is non-blocking when Metro continues to start and the QR/web preview is available.

**Why:** The warning comes from an optional developer-tools binary, not the application bundle, so changing app code or dependencies to address it would be unnecessary.

**How to apply:** Confirm Metro reaches its QR/web preview output before treating this message as an app startup failure.