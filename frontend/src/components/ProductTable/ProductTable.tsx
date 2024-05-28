import { Table } from "antd";
import React from "react";

export const ProductTable = ({ products }) => {
  const columns = [
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
    },
    {
      title: 'Product Name',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: 'Price',
      dataIndex: 'price',
      key: 'price',
      render: (text) => `$${text}`,
    },
    {
      title: 'Characteristics',
      dataIndex: 'characteristics',
      key: 'characteristics',
      render: (characteristics) => (
        <ul>
          {characteristics.map((char) => (
            <li key={char.id}>{char.name}: {char.value}</li>
          ))}
        </ul>
      ),
    },
  ];

  return <Table columns={columns} dataSource={products} pagination={false} rowKey="id" />;
};