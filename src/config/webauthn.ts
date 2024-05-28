import "server-only";
import { env } from "~/env";

/**
 * Human-readable title for your website
 */
export const rpName = "My awesome website";

/**
 * A unique identifier for your website. 'localhost' is okay for
 * local dev
 */
export const rpID = env.WEBAUTHN_RP_ID;

/**
 * The URL at which registrations and authentications should occur.
 * 'http://localhost' and 'http://localhost:PORT' are also valid.
 * Do NOT include any trailing /
 */
export const origin = `https://${rpID}`;
