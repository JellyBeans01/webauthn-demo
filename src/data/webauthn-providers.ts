import { cache } from "react";

type Providers = Record<string, { name: string }>;

const map = new Map<string, string>();

const fetchProviders = cache(async () => {
    const response = await fetch(
        "https://raw.githubusercontent.com/passkeydeveloper/passkey-authenticator-aaguids/main/combined_aaguid.json",
        {
            headers: { "content-type": "application/json" },
        },
    );

    if (!response.ok) return null;

    return (await response.json()) as Providers;
});

export const getWebAuthnProviders = async () => {
    if (map.size > 0) return map;

    const providers = await fetchProviders();
    for (const [id, provider] of Object.entries(providers ?? {})) {
        map.set(id, provider.name);
    }

    return map;
};
