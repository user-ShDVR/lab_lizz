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
      title: 'Название',
      dataIndex: 'name',
      key: 'name',
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
    {
      title: 'Характеристики',
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