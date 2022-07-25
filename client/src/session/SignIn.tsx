import * as React from "react";
import {useState} from "react";
import {Box, Button, Stack, TextField} from "@mui/material";
import styled from "styled-components";

const Container = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  width: 100vw;
  height: 100vh;
`

interface UserData {
    name: string
}

export function SignIn({complete}: { complete: (user: UserData) => void }) {
    const [state, setState] = useState<{ error: boolean, user: UserData }>({error: false, user: {name: ''}});
    return <Container>
        <Box component={'form'}
             onSubmit={e => {
                 e.preventDefault();
                 if (state.user.name) complete(state.user);
             }}>
            <Stack>
                <TextField
                    error={state.error}
                    label="Enter your nickname"
                    variant="standard"
                    onChange={e => setState({
                        ...state,
                        error: e.target.value.length === 0,
                        user: {...state.user, name: e.target.value}
                    })}/>
                <Button type='submit'>start</Button>
            </Stack>
        </Box>
    </Container>
}
