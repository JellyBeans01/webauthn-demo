"use client";

import { type Authenticator } from "@prisma/client";
import { memo, useEffect, useState } from "react";
import { columns } from "~/app/very-secure-page/@authenticators/_components/columns";
import ManualButton from "~/components/buttons/custom-routes/manual-button";
import DataTable from "~/components/data-table";
import { api } from "~/trpc/client";

export type Props = {
    initialAuthenticators: Authenticator[];
};

function Authenticators({ initialAuthenticators }: Props) {
    const [authenticators, setAuthenticators] = useState<Authenticator[]>(initialAuthenticators);

    const { data, isLoading, refetch } = api.authenticators.getAuthenticators.useQuery(undefined, {
        initialData: initialAuthenticators,
    });

    useEffect(() => {
        if (isLoading) return;

        setAuthenticators(data ?? []);
    }, [data, isLoading]);

    return (
        <>
            <DataTable columns={columns} data={authenticators} />
            <div className="mt-2 flex justify-end">
                <ManualButton messageOnSuccess="Authenticator toegevoegd" onSuccess={refetch}>
                    Add another authenticator
                </ManualButton>
            </div>
        </>
    );
}

export default memo(Authenticators);
