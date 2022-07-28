import {createContext, useContext} from "react";
import {Api} from "../api";

export interface User {
    id: number;
    connectionId: string;
    name: string;
}

export interface Session {
    user: User;
    api: Api;
}

export const SessionContext = createContext<Session | null>(null)

export function useSession(): Session {
    const session = useContext(SessionContext)
    if (session) return session;
    throw Error('')
}
