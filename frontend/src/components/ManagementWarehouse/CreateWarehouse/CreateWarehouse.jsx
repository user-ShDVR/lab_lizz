import React from "react";
import { Button, Modal } from "antd";
import { CreateForm } from "../../../styles/createFormsStyles";
import { FormInputs } from "./formInputs";
import { useCreateWarehouseMutation } from "../../../store/api/warehouseApi";

export const CreateWarehouse = ({ open, setOpen, refetchWarehouse }) => {
  const [CreateWarehouse, { isLoading }] = useCreateWarehouseMutation();
  const [form] = CreateForm.useForm();

  const onCreateWarehouseOk = async () => {
    try {
      const warehouseValues = await form.validateFields();
      
      await CreateWarehouse({...warehouseValues});

      setOpen(false);
      refetchWarehouse();
    } catch (error) {
      console.error("Validation failed:", error);
    }
  };

  const onCreateContractFailed = (errorInfo) => {
    console.log("Failed:", errorInfo);
  };

  return (
    <Modal
      title="Добавить склад"
      open={open}
      confirmLoading={isLoading}
      onCancel={() => setOpen(false)}
      footer={[
        <Button onClick={() => setOpen(false)}>Отмена</Button>,

        <Button type="primary" loading={isLoading} onClick={onCreateWarehouseOk}>
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
