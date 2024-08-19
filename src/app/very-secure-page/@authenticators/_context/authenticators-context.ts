import { type Authenticator } from "@prisma/client";
import { createContext, useContext } from "react";

export type AuthenticatorsContextType = {
    authenticators: Authenticator[];
    refetchAuthenticators: () => void;
};

const initialCtx: AuthenticatorsContextType = {
    authenticators: [],
    refetchAuthenticators: () => undefined,
};

const AuthenticatorsContext = createContext<AuthenticatorsContextType>(initialCtx);

export const useAuthenticators = () => useContext(AuthenticatorsContext);

export default AuthenticatorsContext;
