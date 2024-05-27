import { type Config } from "drizzle-kit";
import { env } from "~/env";

export default {
    schema: "./src/server/db/schema",
    dbCredentials: {
        url: env.DATABASE_URL,
    },
    dialect: "postgresql",
    out: "./.drizzle",
    verbose: true,
} satisfies Config;
