import { Table } from "antd";
import React from "react";
import { useGetAllProductsQuery } from "../../store/api/productsApi";

export const ProductWTable = ({ products }) => {
  const { data: productsData } = useGetAllProductsQuery({});
  const columns = [
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
    },
    {
      title: "Название продукта",
      dataIndex: "productId",
      width: "20%",
      editable: true,
      render: (productId) => {
        const product = productsData?.find((emp) => emp.id === productId);
        return `${product?.name}` || productId;
      },
      sorter: (a, b) => {
        const aClient = productsData?.find((emp) => emp.id === a.id);
        const bClient = productsData?.find((emp) => emp.id === b.id);
        return aClient?.full_name?.localeCompare(bClient?.id || b.id);
      },
      sortDirections: ["ascend", "descend"],
    },
    {
      title: 'Цена',
      dataIndex: 'price',
      key: 'price',
      render: (text) => `${text} ₽`,
    },
    {
      title: 'Количество',
      dataIndex: 'quantity',
      key: 'price',
      render: (quantity) => `${quantity}`,
    },
  ];

  return <Table columns={columns} dataSource={products} pagination={false} rowKey="id" />;
};