import { migrate } from "drizzle-orm/node-postgres/migrator";
import * as process from "process";
import { db } from "./index";

const log = (...messages: unknown[]) => console.log("\n\n[MIGRATION]", ...messages);

try {
    log("Starting migrations...\n");

    await migrate(db, { migrationsFolder: ".drizzle" });

    log("Migrated successfully!\n");

    process.exit();
} catch (err) {
    log("Migrating failed!\n", err);
    process.exit(1);
}
