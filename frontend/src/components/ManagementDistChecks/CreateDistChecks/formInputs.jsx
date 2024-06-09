import React, { useState, useEffect } from 'react';
import { Input, Select, Button } from 'antd';
import { CreateForm } from "../../../styles/createFormsStyles";
import { useGetAllClientsByRoleQuery } from "../../../store/api/clientsApi";
import { useGetAllProductsByMakerQuery } from '../../../store/api/productsApi';
import { useGetAllWarehouseQuery } from '../../../store/api/warehouseApi';

export const FormInputs = ({ form }) => {
  const { data: productsData } = useGetAllProductsByMakerQuery();
  const { data: makerData } = useGetAllClientsByRoleQuery({ role: "MAKER" });
  const { data: distributorData } = useGetAllClientsByRoleQuery({ role: "DISTRIBUTOR" });
  const { data: warehouseData } = useGetAllWarehouseQuery();

  const [selectedProducts, setSelectedProducts] = useState([]);

  const addProduct = () => {
    setSelectedProducts([...selectedProducts, { productId: null, price: null, quantity: null }]);
  };

  const updateProduct = (index, key, value) => {
    const updatedProducts = [...selectedProducts];
    updatedProducts[index][key] = value;
    setSelectedProducts(updatedProducts);
  };

  useEffect(() => {
    form.setFieldsValue({ supplyProducts: selectedProducts });
  }, [selectedProducts, form]);

  const formInputs = [
    {
      label: "Склад",
      name: "warehouseId",
      rules: [
        { required: true, message: "Пожалуйста, выберите склад!" },
      ],
      options: warehouseData?.map((warehouse) => ({
        label: warehouse.name,
        value: warehouse.id,
      })),
      node: (
        <Select>
          {warehouseData?.map((warehouse) => (
            <Select.Option key={warehouse.id} value={warehouse.id}>
              {warehouse.name}
            </Select.Option>
          ))}
        </Select>
      ),
    },
    {
      label: "Производитель",
      name: "makerId",
      rules: [
        { required: true, message: "Пожалуйста, выберите производителя!" },
      ],
      options: makerData?.map((client) => ({
        label: client.companyName,
        value: client.id,
      })),
      node: (
        <Select>
          {makerData?.map((client) => (
            <Select.Option key={client.id} value={client.id}>
              {client.companyName}
            </Select.Option>
          ))}
        </Select>
      ),
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
    {
      label: "Продукты",
      name: "supplyProducts",
      rules: [
        { required: true, message: "Пожалуйста, добавьте продукты!" },
      ],
      node: (
        <>
          {selectedProducts.map((product, index) => (
            <div key={index}>
              <Select
                placeholder="Выберите продукт"
                value={product.productId}
                onChange={(value) => updateProduct(index, 'productId', value)}
              >
                {productsData?.map((product) => (
                  <Select.Option key={product.id} value={product.id}>
                    {product.name}
                  </Select.Option>
                ))}
              </Select>
              <Input
                type="number"
                placeholder="Цена"
                value={product.price}
                onChange={(e) => updateProduct(index, 'price', parseInt(e.target.value))}
              />
              <Input
                type="number"
                placeholder="Количество"
                value={product.quantity}
                onChange={(e) => updateProduct(index, 'quantity', parseInt(e.target.value))}
              />
            </div>
          ))}
          <Button type="dashed" onClick={addProduct}>Добавить продукт</Button>
        </>
      ),
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
