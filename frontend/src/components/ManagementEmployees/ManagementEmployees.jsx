import React, { useState } from "react";
import { Form, Popconfirm, Button, Input } from "antd";
import {
  ActionsTableWrapper,
  ManageButtonsWrapper,
  StyledTableAnt,
} from "../../styles/managementTableStyles.js";
import { CreateEmployees } from "./CreateEmployees/CreateEmployee.jsx";
import {
  useDeleteEmployeeMutation,
  useGetAllEmployeesQuery,
  useUpdateEmployeeMutation,
} from "../../store/api/employeesApi.js";
import { EditableCell } from "../EditableCell/EditableCell.jsx";
import { GetEmployeesCelebratingEveryFiveYearsAnniversaryNextMonth } from "./GetEmployeesCelebratingEveryFiveYearsAnniversaryNextMonth/GetEmployeesCelebratingEveryFiveYearsAnniversaryNextMonth.jsx";
import { formatDate } from "./utils/formatDate.js";

export const ManagementEmployees = () => {
  const [isOpenCreateEmployeeModal, setIsOpenCreateEmployeeModal] =
    React.useState(false);

  const [
    isOpenGetEmployeesCelebratingEveryFiveYearsAnniversaryNextMonthModal,
    setIsOpenGetEmployeesCelebratingEveryFiveYearsAnniversaryNextMonthModal,
  ] = React.useState(false);

  const [searchValue, setSearchValue] = useState("");

  const [form] = Form.useForm();
  const { data: employeesData, refetch } = useGetAllEmployeesQuery();

  const [updateEmployee, { isLoading: isUpdateLoading }] =
    useUpdateEmployeeMutation();

  const [deleteEmployee, { isLoading: isDeleteLoading }] =
    useDeleteEmployeeMutation();

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
      const newData = [...employeesData];
      const index = newData.findIndex((item) => key === item.employee_code);

      if (index > -1) {
        const item = newData[index];
        await updateEmployee({ employee_code: item.employee_code, data: row });

        setEditingKey("");
        refetch();
      } else {
        newData.push(row);
        const item = newData[index];

        await updateEmployee({ employee_code: item.employee_code, data: row });
        setEditingKey("");
      }
    } catch (errInfo) {
      console.log("Validate Failed:", errInfo);
    }
  };

  const handleDelete = async (key) => {
    const dataSource = [...employeesData];
    const employeeToDelete = dataSource.find(
      (item) => item.employee_code === key
    );

    try {
      await deleteEmployee(employeeToDelete.employee_code.toString());
      await refetch();
    } catch (error) {
      console.error("Error deleting employee:", error);
    }
  };

  const handleSearch = (value) => {
    setSearchValue(value);
  };

  const filteredData = employeesData
    ? employeesData.filter((employee) => {
        const searchRegex = new RegExp(searchValue, "i");
        return (
          searchRegex.test(employee.employee_code) ||
          searchRegex.test(employee.full_name) ||
          searchRegex.test(employee.phone_number) ||
          searchRegex.test(formatDate(employee.birth_date)) ||
          searchRegex.test(employee.position) ||
          searchRegex.test(employee.address)
        );
      })
    : [];

  const columns = [
    {
      title: "ID сотрудника",
      dataIndex: "employee_code",
      width: "10%",
      sorter: (a, b) => {
        const aCode = String(a.employee_code);
        const bCode = String(b.employee_code);
        return aCode.localeCompare(bCode);
      },
      sortDirections: ["ascend", "descend"],
    },
    {
      title: "ФИО",
      dataIndex: "full_name",
      width: "14%",
      editable: true,
      sorter: (a, b) => a.full_name.localeCompare(b.full_name),
      sortDirections: ["ascend", "descend"],
    },
    {
      title: "Номер телефона",
      dataIndex: "phone_number",
      width: "14%",
      editable: true,
      sorter: (a, b) => a.phone_number.localeCompare(b.phone_number),
      sortDirections: ["ascend", "descend"],
    },
    {
      title: "День рождения",
      dataIndex: "birth_date",
      width: "14%",
      editable: true,
      render: (date) => formatDate(date),
      sorter: (a, b) => a.birth_date.localeCompare(b.birth_date),
      sortDirections: ["ascend", "descend"],
    },
    {
      title: "Должность",
      dataIndex: "position",
      width: "14%",
      editable: true,
      sorter: (a, b) => a.position.localeCompare(b.position),
      sortDirections: ["ascend", "descend"],
    },
    {
      title: "Адрес",
      dataIndex: "address",
      width: "14%",
      editable: true,
      sorter: (a, b) => a.address.localeCompare(b.address),
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
              title="Уверены что хотите удалить сотрудника?"
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
        inputType: col.dataIndex === "phone_number" ? "number" : "text",
        dataIndex: col.dataIndex,
        title: col.title,
        editing: isEditing(record),
      }),
    };
  });

  return (
    <>
      <ManageButtonsWrapper>
        <Button
          loading={isDeleteLoading}
          onClick={() => setIsOpenCreateEmployeeModal(true)}
        >
          Добавить сотрудника
        </Button>

        <Input
          placeholder="Найти..."
          onChange={(e) => handleSearch(e.target.value)}
          style={{ width: 200 }}
        />
      </ManageButtonsWrapper>

      <ManageButtonsWrapper>
        <Button
          loading={isDeleteLoading}
          onClick={() =>
            setIsOpenGetEmployeesCelebratingEveryFiveYearsAnniversaryNextMonthModal(
              true
            )
          }
          type="primary"
        >
          <b>(№14) </b>Сотрудники, которые в следующем месяце будут отмечать
          юбилей
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
          dataSource={filteredData.map((employee) => ({
            ...employee,
            key: employee.employee_code,
          }))}
          columns={mergedColumns}
          pagination={false}
        />
      </Form>

      <CreateEmployees
        open={isOpenCreateEmployeeModal}
        setOpen={setIsOpenCreateEmployeeModal}
        refetch={refetch}
      />

      <GetEmployeesCelebratingEveryFiveYearsAnniversaryNextMonth
        open={
          isOpenGetEmployeesCelebratingEveryFiveYearsAnniversaryNextMonthModal
        }
        setOpen={
          setIsOpenGetEmployeesCelebratingEveryFiveYearsAnniversaryNextMonthModal
        }
      />
    </>
  );
};
