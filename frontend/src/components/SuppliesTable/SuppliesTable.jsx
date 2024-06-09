import React from "react";
import { Table } from "antd";
import { ProductWTable } from "../ProductWTable/ProductWTable";

export const SuppliesTable = ({ supplies }) => {
  const columns = [
    {
      title: 'Дата поставки',
      dataIndex: 'date',
      key: 'date',
      render: (date) => new Date(date).toLocaleDateString(),
    },
    {
      title: 'Продукты',
      dataIndex: 'supplyProducts',
      key: 'supplyProducts',
      render: (supplyProducts) => <ProductWTable products={supplyProducts} />,
    },
  ];

  return (
    <Table
      columns={columns}
      dataSource={supplies}
      pagination={false}
      rowKey="id"
    />
  );
};
