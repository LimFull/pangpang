import * as React from "react";
import {useEffect, useState} from "react";
import {Session, SessionContext} from "./index";
import {useDispatch, useSelector} from "react-redux";
import {SET_NICKNAME} from "../snake/reducers/account";
import styled from "styled-components";
import {RootState} from "../store";
import {SignIn} from "./SignIn";
import {DefaultApi} from "../api/DefaultApi";

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
    const dispatch = useDispatch();
    const {nickname} = useSelector((state: RootState) => state.account);
    const [session, setSession] = useState<Session | null>(null);
    useEffect(() => {
        if (nickname) initializingSession(nickname).then(setSession)
    }, [nickname])

    if (session) {
        return (
            <Container>
                <SessionContext.Provider value={session}>
                    {props.children}
                </SessionContext.Provider>
            </Container>
        )
    }
    return <SignIn complete={user => dispatch({type: SET_NICKNAME, payload: {nickname: user.name}})}/>
};

async function initializingSession(name: string): Promise<Session> {
    const api = await DefaultApi.init()
    const result = await api.signIn({name: name})
    return {
        user: {name: name, id: result.id},
        api: api
    }
}