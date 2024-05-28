import React, { useState, useEffect } from 'react';
import { Input, Select } from 'antd';
import { CreateForm } from "../../../styles/createFormsStyles";
import { useGetAllClientsByRoleQuery } from "../../../store/api/clientsApi";
import { useGetAllProductsByDistributorQuery } from '../../../store/api/productsApi';

export const FormInputs = ({ form }) => {
  const { data: productsData } = useGetAllProductsByDistributorQuery();
  const { data: dilerData } = useGetAllClientsByRoleQuery({ role: "DILER" });
  const { data: distributorData } = useGetAllClientsByRoleQuery({ role: "DISTRIBUTOR" });

  const [selectedProductId, setSelectedProductId] = useState(null);
  const [selectedMakerName, setSelectedMakerName] = useState('');
  const [selectedMakerId, setSelectedMakerId] = useState(null);

  useEffect(() => {
    if (selectedProductId && productsData && distributorData) {
      const selectedProduct = productsData.find(product => product.id === selectedProductId);
      const distributor = distributorData.find(client => client.id === selectedProduct?.ownerId);
      setSelectedMakerName(distributor ? distributor.companyName : '');
      setSelectedMakerId(distributor ? distributor.id : null);
      form.setFieldsValue({ distributorId: distributor ? distributor.id : null });
    }
  }, [selectedProductId, productsData, distributorData, form]);

  const formInputs = [
    {
      label: "Продукт",
      name: "productId",
      rules: [
        { required: true, message: "Пожалуйста, выберите продукт!" },
      ],
      options: productsData?.map((product) => ({
        label: product.name,
        value: product.id,
      })),
      node: (
        <Select onChange={value => setSelectedProductId(value)}>
          {productsData?.map((product) => (
            <Select.Option key={product.id} value={product.id}>
              {product.name}
            </Select.Option>
          ))}
        </Select>
      ),
    },
    {
      label: "Новая цена (за единицу)",
      name: "price",
      rules: [
        { required: true, message: "Пожалуйста, введите цену!" },
      ],
      node: <Input type="number" />,
    },
    {
      label: "Количество",
      name: "productQuantity",
      rules: [
        { required: true, message: "Пожалуйста, введите количество!" },
      ],
      node: <Input type="number" />,
    },
    {
      label: "Дистрибьютор",
      name: "distributorName",
      node: <span>{selectedMakerName}</span>,
    },
    {
      label: "Дилер",
      name: "dilerId",
      rules: [
        { required: true, message: "Пожалуйста, выберите дилера!" },
      ],
      options: dilerData?.map((client) => ({
        label: client.companyName,
        value: client.id,
      })),
      node: (
        <Select>
          {dilerData?.map((client) => (
            <Select.Option key={client.id} value={client.id}>
              {client.companyName}
            </Select.Option>
          ))}
        </Select>
      ),
    },
    // Скрытое поле для передачи distributorId
    {
      label: "",
      name: "distributorId",
      rules: [],
      node: <Input type="hidden" />,
    },
  ];

  return (
    <>
      {formInputs.map((input) => (
        <CreateForm.Item label={input.label} name={input.name} rules={input.rules} key={input.name}>
          {input.node}
        </CreateForm.Item>
      ))}
    </>
  );
};
