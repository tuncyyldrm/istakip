import { createClient } from "@libsql/client";
import path from "path";
import fs from "fs";

// Ensure data directory exists for local SQLite
const dataDir = path.join(process.cwd(), "data");
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

const localDbPath = path.join(dataDir, "local.db");

// If TURSO_DATABASE_URL is set, connect to Turso Cloud!
// Otherwise, use local SQLite file: `file:data/local.db`
export const db = createClient({
  url: process.env.TURSO_DATABASE_URL || `file:${localDbPath}`,
  authToken: process.env.TURSO_AUTH_TOKEN || undefined,
});
