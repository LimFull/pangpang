import styled from "styled-components";
import {Typography} from "antd";

const {Text} = Typography;

const Container = styled.div`
  display: flex;
  align-items: center;
  justify-content: flex-start;
  width: 90vw;
  height: 60px;
  background: rgba(255, 255, 255, 0.8);
  margin: 10px;
  border: solid 2px #d9d9d9;
  border-radius: 4px;
  padding: 0 10px 0 10px;
  box-shadow: 3px 2px 3px 1px rgba(0, 0, 0, 0.33);
`

const ColorBox = styled.div`
  width: 40px;
  height: 40px;
  border: solid 2px #656565;
`

const StyledText = styled(Text)`
  margin-left: 16px;
  font-size: 20px;
`

interface UserCardProps {
  color:string,
  name: string,
}

export function UserCard({color = 'blue', name = 'default_name'}:UserCardProps) {
  return <Container>
    <ColorBox style={{backgroundColor: color}}/>
    <StyledText>{name}</StyledText>
  </Container>

}

export default UserCard;
