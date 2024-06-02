import React, { useState, useEffect } from 'react';
import { Input, Select } from 'antd';
import { CreateForm } from "../../../styles/createFormsStyles";
import { useGetAllClientsByRoleQuery } from "../../../store/api/clientsApi";
import { useGetAllProductsByMakerQuery } from '../../../store/api/productsApi';

export const FormInputs = ({ form }) => {
  const { data: productsData } = useGetAllProductsByMakerQuery();
  const { data: makerData } = useGetAllClientsByRoleQuery({ role: "MAKER" });
  const { data: distributorData } = useGetAllClientsByRoleQuery({ role: "DISTRIBUTOR" });

  const [selectedProductId, setSelectedProductId] = useState(null);
  const [selectedMakerName, setSelectedMakerName] = useState('');
  const [selectedProductPrice, setSelectedProductPrice] = useState(null);
  
  const [selectedMakerId, setSelectedMakerId] = useState(null);

  useEffect(() => {
    if (selectedProductId && productsData && makerData) {
      const selectedProduct = productsData.find(product => product.id === selectedProductId);
      const maker = makerData.find(client => client.id === selectedProduct?.makerId);
      setSelectedMakerName(maker ? maker.companyName : '');
      setSelectedMakerId(maker ? maker.id : null);
      setSelectedProductPrice(selectedProduct ? selectedProduct.price : 0);
      form.setFieldsValue({ makerId: maker ? maker.id : null });
      form.setFieldsValue({ price: selectedProduct ? selectedProduct.price : 0 });

    }
  }, [selectedProductId, productsData, makerData, form]);

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
      label: "Цена за штуку",
      name: "productPrice",
      node: <span>{selectedProductPrice} ₽</span>,
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
      label: "Производитель",
      name: "makerName",
      node: <span>{selectedMakerName}</span>,
    },
    {
      label: "Дистрибьютор",
      name: "distributorId",
      rules: [
        { required: true, message: "Пожалуйста, выберите дистрибьютора!" },
      ],
      options: distributorData?.map((client) => ({
        label: client.companyName,
        value: client.id,
      })),
      node: (
        <Select>
          {distributorData?.map((client) => (
            <Select.Option key={client.id} value={client.id}>
              {client.companyName}
            </Select.Option>
          ))}
        </Select>
      ),
    },
    // Скрытое поле для передачи makerId
    {
      label: "",
      name: "makerId",
      rules: [],
      node: <Input type="hidden" />,
    },
    {
      label: "",
      name: "price",
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
