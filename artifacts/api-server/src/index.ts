import { existsSync } from "node:fs";
import { resolve } from "node:path";
import app from "./app";
import { logger } from "./lib/logger";

// Auto-load .env file if present
try {
  if (existsSync(".env")) {
    process.loadEnvFile?.(".env");
  } else if (existsSync("../../.env")) {
    process.loadEnvFile?.("../../.env");
  }
} catch {
  // .env file not found or already loaded
}

const rawPort = process.env["PORT"] ?? "3000";
const port = Number(rawPort);

if (Number.isNaN(port) || port <= 0) {
  throw new Error(`Invalid PORT value: "${rawPort}"`);
}

app.listen(port, (err) => {
  if (err) {
    logger.error({ err }, "Error listening on port");
    process.exit(1);
  }

  logger.info({ port }, `IP-SAKTI API Server running on port ${port}`);
});
