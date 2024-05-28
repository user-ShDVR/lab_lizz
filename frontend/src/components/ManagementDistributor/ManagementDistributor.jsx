import React, { useState } from "react";
import { Form, Popconfirm, Button } from "antd";
import {
  ActionsTableWrapper,
  ManageButtonsWrapper,
  StyledTableAnt,
} from "../../styles/managementTableStyles";
import { CreateClient } from "./CreateClients/CreateClient";
import {
  useDeleteClientMutation,
  useGetAllClientsByRoleQuery,
  useUpdateClientMutation,
} from "../../store/api/clientsApi";
import { EditableCell } from "../EditableCell/EditableCell";

export const ManagementDistributor = () => {
  const [isOpenAddClientModal, setIsOpenAddClientModal] = React.useState(false);

  const [fetchedRecords, setFetchedRecords] = useState([]);
  const [selectedClientsData, setSelectedData] = useState(null);

  const [form] = Form.useForm();
  const { data: clientsData, refetch } = useGetAllClientsByRoleQuery({
    role: "DISTRIBUTOR",});

  const [updateClient, { isLoading: isUpdateLoading }] =
    useUpdateClientMutation();

  const [deleteClient, { isLoading: isDeleteLoading }] =
    useDeleteClientMutation();

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
      const newData = [...clientsData];
      console.log(row);
      const index = newData.findIndex(
        (item) => key === item.id
      );

      if (index > -1) {
        const item = newData[index];
        
        await updateClient({ userId: item.id, data: row });

        setEditingKey("");
        refetch();
      } else {
        newData.push(row);
        const item = newData[index];

        await updateClient({ userId: item.id, data: row });
        setEditingKey("");
      }
    } catch (errInfo) {
      console.log("Validate Failed:", errInfo);
    }
  };

  const handleDelete = async (key) => {
    const dataSource = [...clientsData];
  
    const clientToDelete = dataSource.find((item) => item.id === key);
  
    if (!clientToDelete) {
      console.error("Client not found:", key);
      return;
    }
  
    try {
      await deleteClient(clientToDelete.id.toString());
      await refetch();
    } catch (error) {
      console.error("Error deleting client:", error);
    }
  };

  const handleFetchClientsData = (data) => {
    setSelectedData(data);
    setFetchedRecords([]);
  };

  const columns = [
    {
      title: "ID",
      dataIndex: "id",
      width: "10%",
      editable: true,
      sorter: {
        compare: (a, b) => a.id - b.id,
        multiple: 10,
      },
    },
    {
      title: "Наименование компании",
      dataIndex: "companyName",
      width: "10%",
      editable: true,
      sorter: {
        compare: (a, b) => a.companyName - b.companyName,
        multiple: 10,
      },
    },
    {
      title: "Юридический адрес",
      dataIndex: "legalAddress",
      width: "5%",
      editable: true,
      sorter: {
        compare: (a, b) => a.legalAddress - b.legalAddress,
        multiple: 7,
      },
    },
    {
      title: "Контактный номер",
      dataIndex: "contactNumber",
      width: "5%",
      editable: true,
      sorter: {
        compare: (a, b) => a.contactNumber - b.contactNumber,
        multiple: 6,
      },
    },
    {
      title: "Страна производителя",
      dataIndex: "country",
      width: "5%",
      editable: true,
      sorter: {
        compare: (a, b) => a.country - b.country,
        multiple: 5,
      },
    },
    {
      title: "Расчетный счет",
      dataIndex: "paymentAccount",
      width: "5%",
      editable: true,
      sorter: {
        compare: (a, b) => a.paymentAccount - b.paymentAccount,
        multiple: 4,
      },
    },
    {
      title: "БИК",
      dataIndex: "BIK",
      width: "5%",
      editable: true,
      sorter: {
        compare: (a, b) => a.BIK - b.BIK,
        multiple: 3,
      },
    },
    {
      title: "ИНН",
      dataIndex: "INN",
      width: "5%",
      editable: true,
      sorter: {
        compare: (a, b) => a.INN - b.INN,
        multiple: 2,
      },
    },
    {
      title: "КПП",
      dataIndex: "KPP",
      width: "5%",
      editable: true,
      sorter: {
        compare: (a, b) => a.KPP - b.KPP,
        multiple: 1,
      },
    },
    {
      title: "Действия",
      dataIndex: "operation",
      render: (_, record) => {
        const editable = isEditing(record);

        return editable ? (
          <ActionsTableWrapper>
            <Button onClick={() => save(record.key)} loading={isUpdateLoading}>
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
            <Button disabled={editingKey !== ""} onClick={() => edit(record)}>
              Изменить
            </Button>

            <Popconfirm
              title="Уверены что хотите удалить дистрибьютора?"
              onConfirm={() => handleDelete(record.key)}
            >
              <Button>
               Удалить
              </Button>
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
        inputType: col.dataIndex === "phone_number" ? "number" : "text",
        dataIndex: col.dataIndex,
        title: col.title,
        editing: isEditing(record),
      }),
    };
  });

  const allClientsData = clientsData?.map((client) => ({
    ...client,
    key: client.id,
  }));

  const convertedClientsData = selectedClientsData?.map((client) => ({
    ...client,
    key: client.id,
  }));


  return (
    <>
      <ManageButtonsWrapper>
        <Button
          loading={isDeleteLoading}
          onClick={() => setIsOpenAddClientModal(true)}
        >
          Добавить дистрибьютора
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
          dataSource={convertedClientsData || allClientsData}
          columns={mergedColumns}
          pagination={false}
        />
      </Form>

      <CreateClient
        open={isOpenAddClientModal}
        setOpen={setIsOpenAddClientModal}
        refetch={refetch}
      />

    </>
  );
};
