import React from "react";
import { Form, Popconfirm, Button } from "antd";
import {
  ActionsTableWrapper,
  ManageButtonsWrapper,
  StyledTableAnt,
} from "../../styles/managementTableStyles";
import { CreateProducts } from "./CreateProducts/CreateProducts";
import { useGetAllClientsQuery } from "../../store/api/clientsApi";
import {
  useUpdateProductMutation,
  useDeleteProductMutation,
  useGetAllProductsByMakerQuery,
} from "../../store/api/productsApi";
import { EditableCell } from "../EditableCell/EditableCell";

export const ManagementProducts = () => {
  const [open, setOpen] = React.useState(false);
  const [form] = Form.useForm();

  const { data: productsData, refetch: refetchProducts } =
  useGetAllProductsByMakerQuery();

  const { data: clientsData } = useGetAllClientsQuery();

  const [updateProduct, { isLoading: isUpdateLoading }] =
    useUpdateProductMutation();

  const [deleteProduct, { isLoading: isDeleteLoading }] =
    useDeleteProductMutation();

  const [editingKey, setEditingKey] = React.useState("");
  const isEditing = (record) => record.key === editingKey;

  // const edit = (record) => {
  //   form.setFieldsValue({ ...record });
  //   setEditingKey(record.key);
  // };

  const cancel = () => {
    setEditingKey("");
  };

  const save = async (key) => {
    try {
      const row = await form.validateFields();
      const newData = [...productsData];
      const index = newData.findIndex((item) => key === item.id);

      if (index > -1) {
        const item = newData[index];
        await updateProduct({ id: item.id, data: row });

        setEditingKey("");
        refetchProducts();
      } else {
        newData.push(row);
        const item = newData[index];

        await updateProduct({ id: item.id, data: row });
        setEditingKey("");
      }
    } catch (errInfo) {
      console.log("Validate Failed:", errInfo);
    }
  };

  const handleDelete = async (key) => {
    const dataSource = [...productsData];
    const productToDelete = dataSource.find((item) => item.id === key);

    try {
      await deleteProduct(productToDelete.id.toString());
      await refetchProducts();
    } catch (error) {
      console.error("Error deleting product:", error);
    }
  };

  const columns = [
    {
      title: "ID товара",
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
      title: "Название товара",
      dataIndex: "name",
      width: "10%",
      editable: true,
      sorter: (a, b) => a.name.localeCompare(b.name),
      sortDirections: ["ascend", "descend"],
    },
    {
      title: "Производитель",
      dataIndex: "makerId",
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
            <Button
              onClick={() => save(record.key)}
              loading={isUpdateLoading}
              type="primary"
            >
              Сохранить
            </Button>

            <Popconfirm
              title="Уверены что хотите отменить действие?"
              onConfirm={cancel}
            >
              <Button>Отменить</Button>
            </Popconfirm>
          </ActionsTableWrapper>
        ) : (
          <ActionsTableWrapper>
            {/* <Button
              disabled={editingKey !== ""}
              onClick={() => edit(record)}
              type="primary"
            >
              Изменить
            </Button> */}

            <Popconfirm
              title="Уверены что хотите удалить продукт?"
              onConfirm={() => handleDelete(record.key)}
            >
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

  const allProductsData = productsData?.map((product) => ({
    ...product,
    key: product.id,
  }));

  return (
    <>
      <ManageButtonsWrapper>
        <Button loading={isDeleteLoading} onClick={() => setOpen(true)}>
          Добавить товар
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
            expandedRowRender: (record) => (
              <ul>
                {record.characteristics.map((char) => (
                  <li key={char.id}>
                    {char.name}: {char.value}
                  </li>
                ))}
              </ul>
            ),
            rowExpandable: (record) =>
              Array.isArray(record.characteristics) &&
              record.characteristics.length > 0,
          }}
          dataSource={allProductsData}
          columns={mergedColumns}
          pagination={false}
        />
      </Form>

      <CreateProducts
        open={open}
        setOpen={setOpen}
        refetchProducts={refetchProducts}
      />
    </>
  );
};
