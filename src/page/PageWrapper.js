import styled from "styled-components";

const Container = styled.div`
  display: flex;
  flex: 1;
  width: 100vw;
  height: 100vh;
  background-color: blue;
  position: fixed;
  flex-direction: column;
  overflow: scroll;
`

export function PageWrapper({children}) {
    return <Container>
        {children}
    </Container>
}