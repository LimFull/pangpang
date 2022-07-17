import styled from "styled-components";
import {Button, Form, Input} from "antd";
import {useDispatch} from "react-redux";
import FormItem from "antd/lib/form/FormItem";
import {SET_NICKNAME} from "../snake/reducers/account";


const Container = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  width: 100vw;
  height: 100vh;
  background: #85a0f8;

  .ant-form {
    align-items: center;
    justify-content: center;
    display: flex;
    flex-direction: column;
  }

  .ant-input {
    font-size: 20px;
  }

  .ant-btn {
    font-size: 16px;
    line-height: 0
  }
`

export function Nickname() {
    const dispatch = useDispatch();

    const handleComplete = (values) => {
        dispatch({type: SET_NICKNAME, payload: {nickname: values.nickname}})
    }

    return <Container>
        <Form onFinish={handleComplete}>
            <FormItem name="nickname" rules={[{required: true}]}>
                <Input placeholder="Enter your nickname"/>
            </FormItem>
            <Button type="primary" htmlType="submit">Enter</Button>
        </Form>
    </Container>
}

export default Nickname;