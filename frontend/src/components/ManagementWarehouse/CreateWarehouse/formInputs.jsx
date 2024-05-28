import React from 'react';
import { Input, Select } from 'antd';
import { CreateForm } from "../../../styles/createFormsStyles";
import { useGetAllClientsByRoleQuery } from "../../../store/api/clientsApi";

export const FormInputs = () => {
  const { data: clientsData } = useGetAllClientsByRoleQuery({
    role: "DISTRIBUTOR",
  });

  const formInputs = [
    {
      label: "Наименование склада",
      name: "name",
      rules: [
        {
          required: true,
          message: "Пожалуйста, введите наименование!",
        },
      ],
      node: <Input />,
    },
    {
      label: "Адрес склада",
      name: "address",
      rules: [
        {
          required: true,
          message: "Пожалуйста, введите адрес!",
        },
      ],
      node: <Input />,
    },
    {
      label: "Владелец склада",
      name: "distributorId",
      rules: [
        {
          required: true,
          message: "Пожалуйста, введите владельца!",
        },
      ],
      options: clientsData?.map((client) => ({
        label: client.companyName,
        value: client.id,
      })),
      node: (
        <Select>
          {clientsData?.map((client) => (
            <Select.Option key={client.id} value={client.id}>
              {client.companyName}
            </Select.Option>
          ))}
        </Select>
      ),
    },
  ];

  return formInputs.map((input) => (
    <CreateForm.Item label={input.label} name={input.name} rules={input.rules} key={input.name}>
      {input.node}
    </CreateForm.Item>
  ));
};
