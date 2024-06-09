import React from 'react';
import { Input, Select } from 'antd';
import { CreateForm } from "../../../styles/createFormsStyles";
import { useGetAllClientsByRoleQuery } from "../../../store/api/clientsApi";
import CharacteristicsInput from './CharacteristicsInput';

export const FormInputs = () => {
  const { data: clientsData } = useGetAllClientsByRoleQuery({
    role: "MAKER",
  });

  const formInputs = [
    {
      label: "Наименование товара",
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
      label: "Производитель",
      name: "makerId",
      rules: [
        {
          required: true,
          message: "Пожалуйста, введите производителя!",
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
    {
      label: "Характеристики",
      name: "characteristics",
      node: <CharacteristicsInput />,
    },
  ];

  return formInputs.map((input) => (
    <CreateForm.Item label={input.label} name={input.name} rules={input.rules} key={input.name}>
      {input.node}
    </CreateForm.Item>
  ));
};
