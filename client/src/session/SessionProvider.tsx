import * as React from "react";
import {Session, SessionContext} from "./index";
import styled from "styled-components";
import {SignIn} from "./SignIn";
import {DefaultApi} from "../api/DefaultApi";
import {useStateWithInitializer} from "../util";

const Container = styled.div`
  display: flex;
  flex: 1;
  width: 100vw;
  height: 100vh;
  position: fixed;
  flex-direction: column;
  overflow: scroll;
`

interface Props {
    children: React.ReactNode;
}

export default function SessionProvider(props: Props) {
    const [session, setSession] = useStateWithInitializer<Session | null>(
        null,
        () => {
            const nickname = sessionStorage.getItem('nickname')
            if (nickname) return initializingSession(nickname)
            return Promise.resolve(null)
        })

    const signInComplete = (nickname: string) => {
        sessionStorage.setItem('nickname', nickname)
        initializingSession(nickname).then(setSession)
    }

    if (session) {
        return (
            <Container>
                <SessionContext.Provider value={session}>
                    {props.children}
                </SessionContext.Provider>
            </Container>
        )
    }
    return <SignIn complete={user => signInComplete(user.name)}/>
};

async function initializingSession(name: string): Promise<Session> {
    const api = await DefaultApi.init()
    const result = await api.signIn({name: name})
    return {
        user: {name: name, id: result.id, connectionId: result.connectionId},
        api: api
    }
}