import React from "react";
import { Form, Popconfirm, Button } from "antd";
import {
  ActionsTableWrapper,
  ManageButtonsWrapper,
  StyledTableAnt,
} from "../../styles/managementTableStyles";
import { CreateDistChecks } from "./CreateDistChecks/CreateDistChecks";
import { useGetAllClientsQuery } from "../../store/api/clientsApi";
import { useDeleteCheckMutation, useGetAllChecksQuery, useUpdateCheckMutation } from "../../store/api/checksApi";
import { SuppliesTable } from "../SuppliesTable/SuppliesTable";
import { EditableCell } from "../EditableCell/EditableCell";

export const ManagementDistChecks = () => {
  const [open, setOpen] = React.useState(false);
  const [form] = Form.useForm();

  const { data: checksData, refetch: refetchChecks } = useGetAllChecksQuery({ type: "RECEPTION" });
  const { data: clientsData } = useGetAllClientsQuery();
  const [updateCheck, { isLoading: isUpdateLoading }] = useUpdateCheckMutation();
  const [deleteCheck, { isLoading: isDeleteLoading }] = useDeleteCheckMutation();
  const [editingKey, setEditingKey] = React.useState("");
  const isEditing = (record) => record.key === editingKey;

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
    const checkToDelete = dataSource.find((item) => item.id === key);

    try {
      await deleteCheck(checkToDelete.id.toString());
      await refetchChecks();
    } catch (error) {
      console.error("Error deleting check:", error);
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
      sorter: (a, b) => a.id - b.id,
      sortDirections: ["ascend", "descend"],
    },
    {
      title: "Количество",
      dataIndex: "productQuantity",
      width: "8%",
      editable: true,
      sorter: (a, b) => a.productQuantity - b.productQuantity,
      sortDirections: ["ascend", "descend"],
    },
    {
      title: "Сумма",
      dataIndex: "summary",
      width: "8%",
      editable: true,
      render: (summary) => `${summary} ₽`,
      sorter: (a, b) => a.summary - b.summary,
      sortDirections: ["ascend", "descend"],
    },
    {
      title: "Дата заключения договора",
      dataIndex: "date",
      width: "8%",
      editable: true,
      render: (date) => formatDate(date),
      sorter: (a, b) => new Date(a.date) - new Date(b.date),
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
        const aClient = clientsData?.find((emp) => emp.id === a.makerId);
        const bClient = clientsData?.find((emp) => emp.id === b.makerId);
        return aClient?.companyName.localeCompare(bClient?.companyName || "");
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
        const aClient = clientsData?.find((emp) => emp.id === a.distributorId);
        const bClient = clientsData?.find((emp) => emp.id === b.distributorId);
        return aClient?.companyName.localeCompare(bClient?.companyName || "");
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
            <Popconfirm title="Уверены что хотите удалить чек?" onConfirm={() => handleDelete(record.key)}>
              <Button>Удалить</Button>
            </Popconfirm>
            <a href={`http://localhost:3000/uploads/${record.id}.pdf`} target="_blank" rel="noopener noreferrer">
              Экспортировать
            </a>
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
            expandedRowRender: (record) => <SuppliesTable supplies={[record.supply]} />,
            rowExpandable: (record) => record.supply && record.supply.supplyProducts.length > 0,
          }}
          dataSource={allChecksData}
          columns={mergedColumns}
          pagination={false}
        />
      </Form>

      <CreateDistChecks open={open} setOpen={setOpen} refetchChecks={refetchChecks} />
    </>
  );
};
