"use client";

import { type Authenticator } from "@prisma/client";
import { type ColumnDef } from "@tanstack/react-table";
import RemoveAuthenticationMethod from "./remove-authentication-method";

export const columns: ColumnDef<Authenticator>[] = [
    {
        id: "index",
        header: () => null,
        accessorFn: (_, idx) => idx + 1,
    },
    {
        accessorKey: "credentialID",
        header: "Credential ID",
    },
    {
        accessorKey: "providerAccountId",
        header: "Provider account ID",
    },
    {
        accessorKey: "transports",
        header: "Transports",
    },
    {
        id: "actions",
        header: () => null,
        cell: ({ row }) => <RemoveAuthenticationMethod credentialId={row.original.credentialID} />,
    },
];
