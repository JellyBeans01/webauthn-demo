import * as process from "node:process";

const _seeding = (scheme: string) => console.log("⏳ Seeding", scheme);
const _skip = (scheme: string) => console.log("🦘 Skipping", scheme, "\n");
const _done = (scheme: string) => console.log("⌛ Seeding", scheme, "complete\n");

const seed = async () => {
    console.log("\n🌱 Seeding database...\n\n");
};

seed()
    .then(() => console.log("\n✅  Database seeded successfully!\n"))
    .catch((err) => console.log("\n❌ Failed seeding database!\n", err))
    .finally(() => process.exit(0));
