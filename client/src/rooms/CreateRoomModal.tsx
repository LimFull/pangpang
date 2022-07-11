import {Button, Form, Input, Modal} from "antd";
import FormItem from "antd/lib/form/FormItem";
import {useCallback} from "react";
import SnakeMultiplay from "../snake/multiplay/SnakeMultiplay";

interface Props {
    visible: boolean;
    onCancel: () => void;
}

export function CreateRoomModal({visible, onCancel}: Props) {
    const handleOnCancel = () => {
        onCancel();
    }

    const handleFinish = useCallback((values) => {
        SnakeMultiplay.createRoom(values.title);
    }, []);

    return <Modal width={300} title={'방 만들기'} visible={visible} onCancel={handleOnCancel} footer={[
        <Button onClick={handleOnCancel}>취소</Button>,
        <Button htmlType="submit" form="modal-form" loading={false} type={'primary'}>
            만들기
        </Button>,
    ]}>
        <Form id="modal-form" onFinish={handleFinish}>
            <FormItem name="title" style={{margin: 0}}>
                <Input maxLength={16}/>
            </FormItem>
        </Form>
    </Modal>
}

export default CreateRoomModal
