import React, { useState } from "react";
import { Form, Popconfirm, Button, Input, Modal, Typography } from "antd";
import {
  ActionsTableWrapper,
  ManageButtonsWrapper,
  StyledTableAnt,
} from "../../styles/managementTableStyles";
import { CreateClient } from "./CreateClients/CreateClient";
import {
  useDeleteClientMutation,
  useGetAllClientsQuery,
  useGetAveragePayoutToClientQuery,
  useGetClientByIdQuery,
  useGetCountContractsPerClientQuery,
  useGetFindClientsByAddressAndPassportCriteriaQuery,
  useGetFindClientsWithNamesStartingAOrBQuery,
  useGetFindClientsWithPhoneNumberQuery,
  useGetFindUniqueClientAddressQuery,
  useGetFirstTenClientsQuery,
  useGetLastFifteenClientsQuery,
  useGetMaxPayoutToClientQuery,
  useGetMinPayoutToClientQuery,
  useUpdateClientMutation,
} from "../../store/api/clientsApi";
import { EditableCell } from "../EditableCell/EditableCell";
import { GetClientsWithPayoutBetween } from "./GetClientsWithPayoutBetween/GetClientsWithPayoutBetween";

export const ManagementClients = () => {
  const [isOpenAddClientModal, setIsOpenAddClientModal] = React.useState(false);
  const [isOpenAveragePayoutModal, setIsOpenAveragePayoutModal] =
    React.useState(false);
  const [isOpenMaxPayoutModal, setIsOpenMaxPayoutModal] = React.useState(false);
  const [isOpenMinPayoutModal, setIsOpenMinPayoutModal] = React.useState(false);
  const [
    isOpenGetClientsWithPayoutBetweenModal,
    setIsOpenGetClientsWithPayoutBetweenModal,
  ] = React.useState(false);

  const [fetchedRecords, setFetchedRecords] = useState([]);
  const [selectedClientsData, setSelectedData] = useState(null);
  const [chosenClientId, setChosenClientId] = useState("");

  const [searchValue, setSearchValue] = useState("");

  const [form] = Form.useForm();
  const { data: clientsData, refetch } = useGetAllClientsQuery();

  const [updateClient, { isLoading: isUpdateLoading }] =
    useUpdateClientMutation();

  const [deleteClient, { isLoading: isDeleteLoading }] =
    useDeleteClientMutation();

  const { data: firstTenClientsData } = useGetFirstTenClientsQuery();
  const { data: lastFifteenClientsData } = useGetLastFifteenClientsQuery();

  const { data: averagePayoutData } = useGetAveragePayoutToClientQuery();
  const { data: maxPayoutData } = useGetMaxPayoutToClientQuery();
  const { data: minPayoutData } = useGetMinPayoutToClientQuery();

  const { data: countContractsPerClientData } =
    useGetCountContractsPerClientQuery();

  const { data: сlientsWithNamesStartingAOrBData } =
    useGetFindClientsWithNamesStartingAOrBQuery();

  const { data: uniqueClientAddressData } =
    useGetFindUniqueClientAddressQuery();

  const { data: clientByIdData } = useGetClientByIdQuery(chosenClientId);

  const { data: clientsByAddressAndPassportCriteriaData } =
    useGetFindClientsByAddressAndPassportCriteriaQuery();

  const { data: clientsWithPhoneNumberData } = useGetFindClientsWithPhoneNumberQuery();

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

      const index = newData.findIndex(
        (item) => key === item.client.client_code
      );

      if (index > -1) {
        const item = newData[index];
        await updateClient({ client_code: item.client.client_code, data: row });

        setEditingKey("");
        refetch();
      } else {
        newData.push(row);
        const item = newData[index];

        await updateClient({ client_code: item.client.client_code, data: row });
        setEditingKey("");
      }
    } catch (errInfo) {
      console.log("Validate Failed:", errInfo);
    }
  };

  const handleDelete = async (key) => {
    const dataSource = [...clientsData];

    const clientToDelete = dataSource.find(
      (item) => item.client.client_code === key
    ).client;

    try {
      await deleteClient(clientToDelete.client_code.toString());
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
      title: "ID клиента",
      dataIndex: "client_code",
      width: "7%",
      sorter: (a, b) => {
        const codeA = a.client_code?.toString() || "";
        const codeB = b.client_code?.toString() || "";
        return codeA.localeCompare(codeB);
      },
      sortDirections: ["ascend", "descend"],
    },
    {
      title: "ФИО",
      dataIndex: "full_name",
      width: "20%",
      editable: true,
      sorter: (a, b) => a.full_name.localeCompare(b.full_name),
      sortDirections: ["ascend", "descend"],
    },
    {
      title: "Адрес",
      dataIndex: "address",
      width: "20%",
      editable: true,
      sorter: (a, b) => a.address.localeCompare(b.address),
      sortDirections: ["ascend", "descend"],
    },
    {
      title: "Номер телефона",
      dataIndex: "phone_number",
      width: "15%",
      editable: true,
      sorter: (a, b) => a.phone_number.localeCompare(b.phone_number),
      sortDirections: ["ascend", "descend"],
    },
    {
      title: "Паспортные данные",
      dataIndex: "passport_data",
      width: "17%",
      editable: true,
      sorter: (a, b) => a.passport_data.localeCompare(b.passport_data),
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
              <b>(№11) </b>Изменить
            </Button>

            <Popconfirm
              title="Уверены что хотите удалить клиента?"
              onConfirm={() => handleDelete(record.key)}
            >
              <Button>
                <b>(№12) </b>Удалить
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

  const handleSearch = (value) => {
    setSearchValue(value);
  };

  const filteredData = clientsData
    ? clientsData.filter((client) => {
        const searchRegex = new RegExp(searchValue, "i");
        return (
          searchRegex.test(client.client.client_code) ||
          searchRegex.test(client.client.full_name) ||
          searchRegex.test(client.client.address) ||
          searchRegex.test(client.client.phone_number) ||
          searchRegex.test(client.client.passport_data)
        );
      })
    : [];

  const allClientsData = filteredData.map((client) => ({
    ...client.client,
    key: client.client.client_code,
  }));

  const convertedClientsData = selectedClientsData?.map((client) => ({
    ...client,
    key: client.client_code,
  }));

  const clientByIdDataArray = [clientByIdData]?.map((client) => ({
    ...client,
    key: client?.client_code,
  }));

  return (
    <>
      <ManageButtonsWrapper>
        <Button
          onClick={() => handleFetchClientsData(allClientsData)}
          type="primary"
        >
          <b>(№1) </b>Все клиенты
        </Button>
      </ManageButtonsWrapper>

      <ManageButtonsWrapper>
        <Button onClick={() => handleFetchClientsData(uniqueClientAddressData)}>
          <b>(№2) </b>Клиенты с уникальными адресами
        </Button>
      </ManageButtonsWrapper>

      <ManageButtonsWrapper>
        <Button
          onClick={() => handleFetchClientsData(firstTenClientsData)}
          type="primary"
        >
          <b>(№3) </b> Первые 10 клиентов
        </Button>
      </ManageButtonsWrapper>

      <ManageButtonsWrapper>
        <Button onClick={() => handleFetchClientsData(lastFifteenClientsData)}>
          <b>(№4) </b>Последние 15 клиентов
        </Button>
      </ManageButtonsWrapper>

      <ManageButtonsWrapper>
        <Button
          onClick={() => setIsOpenAveragePayoutModal(true)}
          type="primary"
        >
          <b>(№5) </b>Средняя выплата клиенту
        </Button>

        <Button onClick={() => setIsOpenMaxPayoutModal(true)} type="primary">
          <b>(№5) </b>Максимальная выплата клиенту
        </Button>

        <Button onClick={() => setIsOpenMinPayoutModal(true)} type="primary">
          <b>(№5) </b>Минимальная выплата клиенту
        </Button>
      </ManageButtonsWrapper>

      <ManageButtonsWrapper>
        <Input
          placeholder="Найти..."
          style={{ width: 200 }}
          onChange={(e) => setChosenClientId(e.target.value)}
          enterButton
        />

        <Button onClick={() => handleFetchClientsData(clientByIdDataArray)}>
          <b>(№6.1) </b>Найти клиента по первичному ключу
        </Button>
      </ManageButtonsWrapper>

      <ManageButtonsWrapper>
        <Typography.Text>
          <b>(№6.3) </b>Найти клиента
        </Typography.Text>
      </ManageButtonsWrapper>

      <ManageButtonsWrapper>
        <Input
          placeholder="Найти..."
          onChange={(e) => handleSearch(e.target.value)}
          style={{ width: 200 }}
        />
      </ManageButtonsWrapper>

      <ManageButtonsWrapper>
        <Button
          onClick={() =>
            handleFetchClientsData(clientsByAddressAndPassportCriteriaData)
          }
          type="primary"
        >
          <b>(№6.4) </b>Найти клиента с адресом или с номером телефона
        </Button>
      </ManageButtonsWrapper>

      <ManageButtonsWrapper>
        <Button
          onClick={() =>
            handleFetchClientsData(clientsWithPhoneNumberData)
          }
        >
          <b>(№6.5) </b>Найти клиента обязательно с номером телефона
        </Button>
      </ManageButtonsWrapper>

      <ManageButtonsWrapper>
        <Button
          onClick={() => setIsOpenGetClientsWithPayoutBetweenModal(true)}
          type="primary"
        >
          <b>(№7) </b>Клиенты, которые получили выплаты
        </Button>
      </ManageButtonsWrapper>

      <ManageButtonsWrapper>
        <Button
          onClick={() => handleFetchClientsData(countContractsPerClientData)}
        >
          <b>(№9) </b>Клиенты с наибольшим количеством договоров
        </Button>
      </ManageButtonsWrapper>

      <ManageButtonsWrapper>
        <Button
          onClick={() =>
            handleFetchClientsData(сlientsWithNamesStartingAOrBData)
          }
          type="primary"
        >
          <b>(№10) </b>Клиенты, у которых имя начинается на "А" или "Б"
        </Button>
      </ManageButtonsWrapper>

      <ManageButtonsWrapper>
        <Button
          loading={isDeleteLoading}
          onClick={() => setIsOpenAddClientModal(true)}
        >
          <b>(№13) </b>Добавить клиента
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
          expandable={{
            expandedRowRender: (record) => {
              const totalPayout = record.contracts?.reduce(
                (acc, client) => acc + parseFloat(client.payout_to_client),
                0
              );

              if (totalPayout > 0 && !fetchedRecords.includes(record.key)) {
                refetch();
                setFetchedRecords([...fetchedRecords, record.key]);
              }

              return (
                <>
                  Общие выплаты клиенту: <b>{totalPayout} ₽</b>
                </>
              );
            },
            rowExpandable: (record) => record.name !== "Not Expandable",
          }}
        />
      </Form>

      <CreateClient
        open={isOpenAddClientModal}
        setOpen={setIsOpenAddClientModal}
        refetch={refetch}
      />

      <GetClientsWithPayoutBetween
        open={isOpenGetClientsWithPayoutBetweenModal}
        setOpen={setIsOpenGetClientsWithPayoutBetweenModal}
        refetch={refetch}
      />

      <Modal
        title="Средняя выплата клиенту"
        open={isOpenAveragePayoutModal}
        onCancel={() => setIsOpenAveragePayoutModal(false)}
        footer={[
          <Button
            onClick={() => setIsOpenAveragePayoutModal(false)}
            type="primary"
          >
            Закрыть
          </Button>,
        ]}
      >
        <b>{Math.floor(averagePayoutData?.[0].avg)}</b> ₽
      </Modal>

      <Modal
        title="Максимальная выплата клиенту"
        open={isOpenMaxPayoutModal}
        onCancel={() => setIsOpenMaxPayoutModal(false)}
        footer={[
          <Button onClick={() => setIsOpenMaxPayoutModal(false)} type="primary">
            Закрыть
          </Button>,
        ]}
      >
        <b>{maxPayoutData?.[0].max}</b> ₽
      </Modal>

      <Modal
        title="Минимальная выплата клиенту"
        open={isOpenMinPayoutModal}
        onCancel={() => setIsOpenMinPayoutModal(false)}
        footer={[
          <Button onClick={() => setIsOpenMinPayoutModal(false)} type="primary">
            Закрыть
          </Button>,
        ]}
      >
        <b>{minPayoutData?.[0].min}</b> ₽
      </Modal>
    </>
  );
};
