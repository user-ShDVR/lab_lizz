import { DatePicker, Input, Select } from "antd";
import { CreateForm } from "../../../styles/createFormsStyles";
import locale from "antd/es/date-picker/locale/ru_RU";
import { useGetAllClientsQuery } from "../../../store/api/clientsApi";
import { useGetAllPledgesQuery } from "../../../store/api/pledgesApi";
import { useGetAllEmployeesQuery } from "../../../store/api/employeesApi";

export const FormInputs = () => {
  const { data: clientsData } = useGetAllClientsQuery();
  const { data: pledgesData } = useGetAllPledgesQuery();
  const { data: employeesData } = useGetAllEmployeesQuery();

  const contract_typeOptions = [
    {
      label: "Залог",
      value: "Залог",
    },
    {
      label: "Продажа",
      value: "Продажа",
    },
  ];

  const formInputs = [
    {
      label: "Дата расторжения",
      name: "termination_date",
      rules: [
        {
          required: true,
          message: "Пожалуйста, введите дату расторжения договора!",
        },
      ],
      node: (
        <DatePicker
          format="YYYY-MM-DD"
          locale={locale}
          style={{ width: "100%" }}
        />
      ),
    },
    {
      label: "Дата платежа",
      name: "payment_date",
      rules: [
        {
          required: true,
          message: "Пожалуйста, введите дату платежа клиенту!",
        },
      ],
      node: (
        <DatePicker
          format="YYYY-MM-DD"
          locale={locale}
          style={{ width: "100%" }}
        />
      ),
    },
    {
      label: "Тип договора",
      name: "contract_type",
      rules: [
        {
          required: true,
          message: "Пожалуйста, введите дату платежа клиенту!",
        },
      ],
      node: (
        <Select>
          {contract_typeOptions?.map((contract_type) => (
            <Select.Option
              key={contract_type.value}
              value={contract_type.value}
            >
              {contract_type.label}
            </Select.Option>
          ))}
        </Select>
      ),
    },
    {
      label: "Платеж клиенту",
      name: "payout_to_client",
      rules: [
        {
          required: true,
          message: "Пожалуйста, введите сумму платежа клиенту!",
        },
      ],
      node: <Input />,
    },
    {
      label: "Клиент",
      name: "client_code",
      rules: [
        {
          required: true,
          message: "Пожалуйста, введите клиента!",
        },
      ],
      options: clientsData?.map((client) => ({
        label: client.full_name,
        value: client.client_code,
      })),
      node: (
        <Select>
          {clientsData?.map((client) => (
            <Select.Option
              key={client.client.client_code}
              value={client.client.client_code}
            >
              {client.client.full_name}
            </Select.Option>
          ))}
        </Select>
      ),
    },
    {
      label: "Предмет залога",
      name: "pledge_code",
      rules: [
        {
          required: true,
          message: "Пожалуйста, введите предмет залога!",
        },
      ],
      options: pledgesData?.map((pledge) => ({
        label: pledge.description,
        value: pledge.pledge_code,
      })),
      node: (
        <Select>
          {pledgesData?.map((pledge) => (
            <Select.Option key={pledge.pledge_code} value={pledge.pledge_code}>
              {pledge.description}
            </Select.Option>
          ))}
        </Select>
      ),
    },
    {
      label: "Сотрудник",
      name: "employee_code",
      rules: [
        {
          required: true,
          message: "Пожалуйста, введите сотрудника!",
        },
      ],
      options: employeesData?.map((employee) => ({
        label: employee.full_name,
        value: employee.employee_code,
      })),
      node: (
        <Select>
          {employeesData?.map((employee) => (
            <Select.Option
              key={employee.employee_code}
              value={employee.employee_code}
            >
              {employee.full_name}
            </Select.Option>
          ))}
        </Select>
      ),
    },
  ];

  return formInputs.map((input) => (
    <CreateForm.Item {...input} key={input.name}>
      {input.node}
    </CreateForm.Item>
  ));
};
