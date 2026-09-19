---
name: Gemini model availability
description: Key-dependent Gemini model access and safe handling of unavailable model errors.
---

Do not assume a Gemini model name available in general documentation is enabled for every API key. Keep the model selectable through an environment variable and map provider model failures to a safe client error without logging raw upstream payloads.

**Why:** A newly provisioned key rejected older model names with a provider 404 and identified a newer permitted model.

**How to apply:** When changing the Gemini model, verify the real server endpoint with the configured key. Log only sanitized provider status/message fields; never log the request URL or API key.