import React from "react";
import { Button, Modal } from "antd";
import { CreateForm } from "../../../styles/createFormsStyles";
import { FormInputs } from "./formInputs";
import { useCreateProductMutation } from "../../../store/api/productsApi";

export const CreateProducts = ({ open, setOpen, refetchProducts }) => {
  const [createProduct, { isLoading }] = useCreateProductMutation();
  const [form] = CreateForm.useForm();

  const onCreateProductOk = async () => {
    try {
      const productValues = await form.validateFields();
      
      await createProduct({...productValues, price: +productValues.price, quantity: +productValues.quantity});

      setOpen(false);
      refetchProducts();
    } catch (error) {
      console.error("Validation failed:", error);
    }
  };

  const onCreateContractFailed = (errorInfo) => {
    console.log("Failed:", errorInfo);
  };

  return (
    <Modal
      title="Добавить продукцию"
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
        <FormInputs />
      </CreateForm>
    </Modal>
  );
};
