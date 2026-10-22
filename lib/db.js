import { createClient } from "@libsql/client";
import path from "path";
import fs from "fs";

let localDbUrl = "file:data/local.db";

// Only attempt local filesystem operations if not using Turso Cloud
if (!process.env.TURSO_DATABASE_URL) {
  try {
    const dataDir = path.join(process.cwd(), "data");
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }
    localDbUrl = `file:${path.join(dataDir, "local.db")}`;
  } catch (e) {
    // Serverless read-only filesystem fallback
  }
}

// If TURSO_DATABASE_URL is set, connect to Turso Cloud!
// Otherwise, use local SQLite file
export const db = createClient({
  url: process.env.TURSO_DATABASE_URL || localDbUrl,
  authToken: process.env.TURSO_AUTH_TOKEN || undefined,
});
