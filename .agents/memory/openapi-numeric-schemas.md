---
name: OpenAPI numeric schemas
description: Compatibility constraint between the workspace's Orval output and installed Zod version.
---

When adding numeric API fields, verify the generated Zod output against the installed Zod version. The current codegen path emits `zod.int()` for OpenAPI integer fields, but this workspace uses Zod 3 where that API is unavailable.

**Why:** Research project metric fields initially broke shared-library typechecking after codegen because the generated validator called `zod.int()`.

**How to apply:** Prefer compatible numeric schemas for new non-critical metric fields, or upgrade/configure the Zod/codegen stack as a deliberate separate change.