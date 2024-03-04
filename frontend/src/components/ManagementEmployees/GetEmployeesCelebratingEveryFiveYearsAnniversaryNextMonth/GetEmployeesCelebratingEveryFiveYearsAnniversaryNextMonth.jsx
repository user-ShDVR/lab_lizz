import React from "react";
import { Button, Modal } from "antd";
import { StyledTableAnt } from "../../../styles/managementTableStyles";
import { useGetFindEmployeesCelebratingEveryFiveYearsAnniversaryNextMonthQuery } from "../../../store/api/employeesApi";
import { formatDate } from "../utils/formatDate";

export const GetEmployeesCelebratingEveryFiveYearsAnniversaryNextMonth = ({
  open,
  setOpen,
}) => {
  const { data: employeesCelebratingEveryFiveYearsAnniversaryNextMonth } =
    useGetFindEmployeesCelebratingEveryFiveYearsAnniversaryNextMonthQuery();

  const columns = [
    {
      title: "ФИО",
      dataIndex: "full_name",
    },
    {
      title: "Возраст",
      dataIndex: "age_next_month",
    },
    {
      title: "Дата рождения",
      dataIndex: "birth_date",
      render: (date) => formatDate(date),
    },
    {
      title: "Дата юбилея",
      dataIndex: "next_anniversary_date",
      render: (date) => formatDate(date),
    },
  ];

  return (
    <Modal
      title="Сотрудники, которые в следующем месяце будут отмечать
      юбилей"
      open={open}
      onCancel={() => setOpen(false)}
      footer={[
        <Button onClick={() => setOpen(false)} type="primary">
          ОК
        </Button>,
      ]}
    >
      <StyledTableAnt
        bordered
        dataSource={employeesCelebratingEveryFiveYearsAnniversaryNextMonth}
        columns={columns}
        pagination={false}
      />
    </Modal>
  );
};
