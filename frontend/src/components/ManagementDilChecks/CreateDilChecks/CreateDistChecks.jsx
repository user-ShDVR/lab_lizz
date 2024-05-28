import React from "react";
import { Button, Modal } from "antd";
import { CreateForm } from "../../../styles/createFormsStyles";
import { FormInputs } from "./formInputs";
import { useCreateCheckMutation } from "../../../store/api/checksApi";

export const CreateDistChecks = ({ open, setOpen, refetchChecks }) => {
  const [createCheck, { isLoading }] = useCreateCheckMutation();
  const [form] = CreateForm.useForm();

  const onCreateProductOk = async () => {
    try {
      const checkValues = await form.validateFields();
      
      await createCheck({
        ...checkValues,
        price: +checkValues.price,
        productQuantity: +checkValues.productQuantity,
        type: "SALE"
      });

      setOpen(false);
      refetchChecks();
    } catch (error) {
      console.error("Validation failed:", error);
    }
  };

  const onCreateContractFailed = (errorInfo) => {
    console.log("Failed:", errorInfo);
  };

  return (
    <Modal
      title="Добавить чек"
      open={open}
      confirmLoading={isLoading}
      onCancel={() => setOpen(false)}
      footer={[
        <Button onClick={() => setOpen(false)}>Отмена</Button>,
        <Button type="primary" loading={isLoading} onClick={onCreateProductOk}>
          Создать
        </Button>,
      ]}
    >
      <CreateForm
        layout="vertical"
        initialValues={{ remember: true }}
        onFinishFailed={onCreateContractFailed}
        form={form}
      >
        <FormInputs form={form} />
      </CreateForm>
    </Modal>
  );
};
