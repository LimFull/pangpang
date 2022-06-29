import {Typography} from "antd";

const {Text} = Typography;

export function Message({
                            message = '', name = 'default_name'
                        }) {

    return <Text>{name} : {message}</Text>
}

export default Message;