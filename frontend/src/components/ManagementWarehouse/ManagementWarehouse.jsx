import React from "react";
import { Form, Popconfirm, Button } from "antd";
import {
  ActionsTableWrapper,
  ManageButtonsWrapper,
  StyledTableAnt,
} from "../../styles/managementTableStyles";
import { CreateWarehouse } from "./CreateWarehouse/CreateWarehouse";
import { useGetAllClientsQuery } from "../../store/api/clientsApi";
import {
  useUpdateWarehouseMutation,
  useDeleteWarehouseMutation,
  useGetAllWarehouseQuery,
} from "../../store/api/warehouseApi";
import { EditableCell } from "../EditableCell/EditableCell";
import { SuppliesTable } from "../SuppliesTable/SuppliesTable";

export const ManagementWarehouse = () => {
  const [open, setOpen] = React.useState(false);
  const [form] = Form.useForm();

  const { data: warehousesData, refetch: refetchWarehouse } = useGetAllWarehouseQuery();
  const { data: clientsData } = useGetAllClientsQuery();
  const [updateWarehouse, { isLoading: isUpdateLoading }] = useUpdateWarehouseMutation();
  const [deleteWarehouse, { isLoading: isDeleteLoading }] = useDeleteWarehouseMutation();
  const [editingKey, setEditingKey] = React.useState("");
  const isEditing = (record) => record.key === editingKey;

  const edit = (record) => {
    form.setFieldsValue({ ...record });
    setEditingKey(record.key);
  };

  const cancel = () => {
    setEditingKey("");
  };

  const save = async (key) => {
    try {
      const row = await form.validateFields();
      const newData = [...warehousesData];
      const index = newData.findIndex((item) => key === item.id);

      if (index > -1) {
        const item = newData[index];
        await updateWarehouse({ id: item.id, data: row });
        setEditingKey("");
        refetchWarehouse();
      } else {
        newData.push(row);
        const item = newData[index];
        await updateWarehouse({ id: item.id, data: row });
        setEditingKey("");
      }
    } catch (errInfo) {
      console.log("Validate Failed:", errInfo);
    }
  };

  const handleDelete = async (key) => {
    const dataSource = [...warehousesData];
    const productToDelete = dataSource.find((item) => item.id === key);

    try {
      await deleteWarehouse(productToDelete.id.toString());
      await refetchWarehouse();
    } catch (error) {
      console.error("Error deleting product:", error);
    }
  };

  const columns = [
    {
      title: "ID",
      dataIndex: "id",
      width: "8%",
      sorter: (a, b) => {
        const codeA = a.id?.toString() || "";
        const codeB = b.id?.toString() || "";
        return codeA.localeCompare(codeB);
      },
      sortDirections: ["ascend", "descend"],
    },
    {
      title: "Название склада",
      dataIndex: "name",
      width: "10%",
      editable: true,
      sorter: (a, b) => a.name.localeCompare(b.name),
      sortDirections: ["ascend", "descend"],
    },
    {
      title: "Адрес",
      dataIndex: "address",
      width: "10%",
      editable: true,
      sorter: (a, b) => a.address.localeCompare(b.address),
      sortDirections: ["ascend", "descend"],
    },
    {
      title: "Владелец склада",
      dataIndex: "distributorId",
      width: "20%",
      editable: true,
      render: (clientCode) => {
        const client = clientsData?.find((emp) => emp.id === clientCode);
        return `${client?.companyName}` || clientCode;
      },
      sorter: (a, b) => {
        const aClient = clientsData?.find((emp) => emp.id === a.id);
        const bClient = clientsData?.find((emp) => emp.id === b.id);
        return aClient?.full_name?.localeCompare(bClient?.id || b.id);
      },
      sortDirections: ["ascend", "descend"],
    },
    {
      title: "Действия",
      dataIndex: "operation",
      render: (_, record) => {
        const editable = isEditing(record);

        return editable ? (
          <ActionsTableWrapper>
            <Button onClick={() => save(record.key)} loading={isUpdateLoading} type="primary">
              Сохранить
            </Button>
            <Popconfirm title="Уверены что хотите отменить действие?" onConfirm={cancel}>
              <Button>Отменить</Button>
            </Popconfirm>
          </ActionsTableWrapper>
        ) : (
          <ActionsTableWrapper>
            <Button disabled={editingKey !== ""} onClick={() => edit(record)} type="primary">
              Изменить
            </Button>
            <Popconfirm title="Уверены что хотите удалить склад?" onConfirm={() => handleDelete(record.key)}>
              <Button>Удалить</Button>
            </Popconfirm>
          </ActionsTableWrapper>
        );
      },
    },
  ];

  const mergedColumns = columns.map((col) => {
    if (!col.editable) return col;

    return {
      ...col,
      onCell: (record) => ({
        record,
        inputType: "text",
        dataIndex: col.dataIndex,
        title: col.title,
        editing: isEditing(record),
      }),
    };
  });

  const allWarehousesData = warehousesData?.map((warehouse) => ({
    ...warehouse,
    key: warehouse.id,
  }));

  return (
    <>
      <ManageButtonsWrapper>
        <Button loading={isDeleteLoading} onClick={() => setOpen(true)}>
          Добавить склад
        </Button>
      </ManageButtonsWrapper>

      <Form form={form} component={false}>
        <StyledTableAnt
          components={{
            body: {
              cell: EditableCell,
            },
          }}
          bordered
          expandable={{
            expandedRowRender: (record) => <SuppliesTable supplies={record.warehouseSupplies} />,
            rowExpandable: (record) => Array.isArray(record.warehouseSupplies) && record.warehouseSupplies.length > 0,
          }}
          dataSource={allWarehousesData}
          columns={mergedColumns}
          pagination={false}
        />
      </Form>

      <CreateWarehouse open={open} setOpen={setOpen} refetchWarehouse={refetchWarehouse} />
    </>
  );
};
