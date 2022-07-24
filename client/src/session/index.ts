import {createContext, useContext} from "react";

export interface User {
    name: string;
}

export interface Session {
    user: User;
}

export const SessionContext = createContext<Session | null>(null)

export function useSession(): Session {
    const session = useContext(SessionContext)
    if (session) return session;
    throw Error('')
}
