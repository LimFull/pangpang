import {Button, Form, Input, Modal} from "antd";
import FormItem from "antd/lib/form/FormItem";
import {useCallback} from "react";

export function CreateRoomModal({visible, onCancel}) {

  const handleOnCanel = () => {
    onCancel();
  }

  const handleFinish = useCallback((values) => {
    console.log("values", values.title)
  }, []);

  return <Modal width={300} height={400} title={'방 만들기'} visible={visible} onCancel={handleOnCanel} footer={[
    <Button onClick={handleOnCanel}>취소</Button>,
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
