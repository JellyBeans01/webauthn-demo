"use client";

import { type Authenticator } from "@prisma/client";
import { memo, useCallback, useEffect, useMemo, useState } from "react";
import { columns } from "~/app/very-secure-page/@authenticators/_components/columns";
import AuthenticatorsContext, {
    type AuthenticatorsContextType,
} from "~/app/very-secure-page/@authenticators/_context/authenticators-context";
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

    const refetchAuthenticators = useCallback(() => {
        void refetch();
    }, [refetch]);

    useEffect(() => {
        if (isLoading) return;

        setAuthenticators(data ?? []);
    }, [data, isLoading]);

    const value = useMemo<AuthenticatorsContextType>(
        () => ({ authenticators, refetchAuthenticators }),
        [authenticators, refetchAuthenticators],
    );

    return (
        <AuthenticatorsContext.Provider value={value}>
            <DataTable columns={columns} data={authenticators} />
            <div className="mt-2 flex justify-end">
                <ManualButton messageOnSuccess="Authenticator toegevoegd" onSuccess={refetchAuthenticators}>
                    Add another authenticator
                </ManualButton>
            </div>
        </AuthenticatorsContext.Provider>
    );
}

export default memo(Authenticators);
