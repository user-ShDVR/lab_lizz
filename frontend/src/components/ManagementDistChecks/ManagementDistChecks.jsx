import React from "react";
import { Form, Popconfirm, Button } from "antd";
import {
  ActionsTableWrapper,
  ManageButtonsWrapper,
  StyledTableAnt,
} from "../../styles/managementTableStyles";
import { CreateDistChecks } from "./CreateDistChecks/CreateDistChecks";
import { useGetAllClientsQuery } from "../../store/api/clientsApi";
import {
} from "../../store/api/checksApi";
import { EditableCell } from "../EditableCell/EditableCell";
import { useDeleteCheckMutation, useGetAllChecksQuery, useUpdateCheckMutation } from "../../store/api/checksApi";
import { useGetAllProductsQuery } from "../../store/api/productsApi";

export const ManagementDistChecks = () => {
  const [open, setOpen] = React.useState(false);
  const [form] = Form.useForm();

  const { data: checksData, refetch: refetchChecks } =
    useGetAllChecksQuery({
      type: "RECEPTION",
    });

  const { data: productsData } = useGetAllProductsQuery();

  const { data: clientsData } = useGetAllClientsQuery();

  const [updateCheck, { isLoading: isUpdateLoading }] =
    useUpdateCheckMutation();

  const [deleteCheck, { isLoading: isDeleteLoading }] =
    useDeleteCheckMutation();

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
      const newData = [...checksData];
      const index = newData.findIndex((item) => key === item.id);

      if (index > -1) {
        const item = newData[index];
        await updateCheck({ id: item.id, data: row });

        setEditingKey("");
        refetchChecks();
      } else {
        newData.push(row);
        const item = newData[index];

        await updateCheck({ id: item.id, data: row });
        setEditingKey("");
      }
    } catch (errInfo) {
      console.log("Validate Failed:", errInfo);
    }
  };

  const handleDelete = async (key) => {
    const dataSource = [...checksData];
    const productToDelete = dataSource.find((item) => item.id === key);

    try {
      await deleteCheck(productToDelete.id.toString());
      await refetchChecks();
    } catch (error) {
      console.error("Error deleting product:", error);
    }
  };

  const formatDate = (dateString) => {
    const options = { year: "numeric", month: "numeric", day: "numeric" };
    return new Date(dateString).toLocaleDateString(undefined, options);
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
      title: "Количество",
      dataIndex: "productQuantity",
      width: "8%",
      editable: true,
      sorter: (a, b) => a.productQuantity.localeCompare(b.productQuantity),
      sortDirections: ["ascend", "descend"],
    },
    {
      title: "Сумма",
      dataIndex: "summary",
      width: "8%",
      editable: true,
      render: (summary) => `${summary} ₽`,
      sorter: (a, b) => a.summary.localeCompare(b.summary),
      sortDirections: ["ascend", "descend"],
    },
    {
      title: "Дата заключения договора",
      dataIndex: "date",
      width: "8%",
      editable: true,
      render: (date) => formatDate(date),
      sorter: (a, b) => a.productQuantity.localeCompare(b.productQuantity),
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
      title: "Дистрибьютор",
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
              title="Уверены что хотите удалить чек?"
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

  const allChecksData = checksData?.map((check) => ({
    ...check,
    key: check.id,
  }));

  return (
    <>
      <ManageButtonsWrapper>
        <Button loading={isDeleteLoading} onClick={() => setOpen(true)}>
          Добавить чек
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
          dataSource={allChecksData}
          columns={mergedColumns}
          pagination={false}
        />
      </Form>

      <CreateDistChecks
        open={open}
        setOpen={setOpen}
        refetchChecks={refetchChecks}
      />
    </>
  );
};
