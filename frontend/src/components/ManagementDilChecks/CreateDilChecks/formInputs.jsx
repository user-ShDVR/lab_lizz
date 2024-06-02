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
  const [summary, setSummary] = useState(0);
  const [price, setPrice] = useState(0);
  const [selectedProduct, setSelectedProduct] = useState();
  const [selectedMakerName, setSelectedMakerName] = useState('');
  const [selectedMakerId, setSelectedMakerId] = useState(null);

  useEffect(() => {
    if (selectedProductId && productsData && distributorData) {
      const selected = productsData.find(product => product.id === selectedProductId);
      setSelectedProduct(selected);
      const distributor = distributorData.find(client => client.id === selected?.ownerId);
      setSelectedMakerName(distributor ? distributor.companyName : '');
      setSelectedMakerId(distributor ? distributor.id : null);
      setPrice(selected ? selected.price : 0);
      form.setFieldsValue({ distributorId: distributor ? distributor.id : null });
    }
  }, [selectedProductId, productsData, distributorData, form]);

  const handleQuantityChange = (e) => {
    const quantity = e.target.value;
    setSummary(selectedProduct ? price * quantity : 0);
  };

  const handlePriceChange = (e) => {
    const newPrice = e.target.value;
    setPrice(newPrice);
    const quantity = form.getFieldValue('productQuantity') || 0;
    setSummary(selectedProduct ? newPrice * quantity : 0);
  };

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
      label: "Количество",
      name: "productQuantity",
      rules: [
        { required: true, message: "Пожалуйста, введите количество!" },
      ],
      node: <Input onChange={handleQuantityChange} type="number" />,
    },
    {
      label: "Цена за штуку",
      name: "price",
      rules: [
        { required: true, message: "Пожалуйста, введите цену!" },
      ],
      node: <Input value={price} onChange={handlePriceChange} min={selectedProduct ? selectedProduct.price : 0} type="number" />,
    },
    {
      label: "Сумма",
      name: "summary",
      node: <span>{summary} ₽</span>,
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
