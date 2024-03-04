import React from "react";
import { Form, Popconfirm, Button, Input } from "antd";
import {
  ActionsTableWrapper,
  ManageButtonsWrapper,
  StyledTableAnt,
} from "../../styles/managementTableStyles";
import {
  useDeletePledgeMutation,
  useGetAllPledgesQuery,
  useUpdatePledgeMutation,
} from "../../store/api/pledgesApi";
import { CreatePledge } from "./CreatePledges/CreatePledge";
import { EditableCell } from "../EditableCell/EditableCell";

export const ManagementPledges = () => {
  const [open, setOpen] = React.useState(false);
  const [searchValue, setSearchValue] = React.useState("");

  const [form] = Form.useForm();
  const { data: pledgesData, refetch } = useGetAllPledgesQuery();

  const [updatePledge, { isLoading: isUpdateLoading }] =
    useUpdatePledgeMutation();

  const [deletePledge, { isLoading: isDeleteLoading, error }] =
    useDeletePledgeMutation();

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
      const newData = [...pledgesData];
      const index = newData.findIndex((item) => key === item.pledge_code);

      if (index > -1) {
        const item = newData[index];
        await updatePledge({ pledge_code: item.pledge_code, data: row });

        setEditingKey("");
        refetch();
      } else {
        newData.push(row);
        const item = newData[index];

        await updatePledge({ pledge_code: item.pledge_code, data: row });
        setEditingKey("");
      }
    } catch (errInfo) {
      console.log("Validate Failed:", errInfo);
    }
  };

  const handleDelete = async (key) => {
    const dataSource = [...pledgesData];
    const pledgeToDelete = dataSource.find((item) => item.pledge_code === key);

    try {
      await deletePledge(pledgeToDelete.pledge_code.toString());
      await refetch();
    } catch (error) {
      console.error("Error deleting pledge:", error);
    }
  };

  const columns = [
    {
      title: "ID предмета залога",
      dataIndex: "pledge_code",
      width: "15%",
      sorter: (a, b) => {
        if (!isNaN(Number(a.pledge_code)) && !isNaN(Number(b.pledge_code))) {
          return Number(a.pledge_code) - Number(b.pledge_code);
        } else {
          return 0; // Handle non-numeric values appropriately
        }
      },
      sortDirections: ["ascend", "descend"],
    },
    {
      title: "Состояние",
      dataIndex: "condition",
      width: "20%",
      editable: true,
      sorter: (a, b) => a.condition.localeCompare(b.condition),
      sortDirections: ["ascend", "descend"],
    },
    {
      title: "Название",
      dataIndex: "description",
      width: "22%",
      editable: true,
      sorter: (a, b) => a.description.localeCompare(b.description),
      sortDirections: ["ascend", "descend"],
    },
    {
      title: "Характеристики",
      dataIndex: "characteristics",
      width: "20%",
      editable: true,
      sorter: (a, b) => a.characteristics.localeCompare(b.characteristics),
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
            <Button
              disabled={editingKey !== ""}
              onClick={() => edit(record)}
              type="primary"
            >
              Изменить
            </Button>

            <Popconfirm
              title="Уверены что хотите удалить предмет залога?"
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

  const handleSearch = (value) => {
    setSearchValue(value);
  };

  const filteredData = pledgesData
    ? pledgesData.filter((pledge) => {
        const searchRegex = new RegExp(searchValue, "i");
        return (
          searchRegex.test(pledge.pledge_code) ||
          searchRegex.test(pledge.condition) ||
          searchRegex.test(pledge.description) ||
          searchRegex.test(pledge.characteristics)
        );
      })
    : [];

  return (
    <>
      <ManageButtonsWrapper>
        <Button loading={isDeleteLoading} onClick={() => setOpen(true)}>
          Добавить предмет залога
        </Button>

        <Input
          onChange={(e) => handleSearch(e.target.value)}
          style={{ width: 200 }}
          placeholder="Найти..."
        />
      </ManageButtonsWrapper>

      <Form form={form} component={false}>
        <StyledTableAnt
          components={{
            body: {
              cell: EditableCell,
            },
          }}
          bordered
          dataSource={filteredData.map((pledge) => ({
            ...pledge,
            key: pledge.pledge_code,
          }))}
          columns={mergedColumns}
          pagination={false}
        />
      </Form>

      <CreatePledge open={open} setOpen={setOpen} refetch={refetch} />
    </>
  );
};
