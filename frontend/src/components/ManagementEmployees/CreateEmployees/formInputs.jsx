import { DatePicker, Input } from "antd";
import locale from "antd/es/date-picker/locale/ru_RU";
import InputMask from "react-input-mask";

export const formInputs = [
  {
    label: "ФИО",
    name: "full_name",
    rules: [
      {
        required: true,
        message: "Пожалуйста, введите фамилию, имя, отчество сотрудника!",
      },
    ],
    node: <Input />,
  },
  {
    label: "Номер телефона",
    name: "phone_number",
    rules: [
      {
        required: true,
        message: "Пожалуйста, введите номер телефона сотрудника!",
      },
    ],
    node: (
      <InputMask mask="+7 (999) 999-99-99" maskChar="_">
        {(inputProps) => <Input {...inputProps} />}
      </InputMask>
    ),
  },
  {
    label: "День рождения",
    name: "birth_date",
    rules: [
      {
        required: true,
        message: "Пожалуйста, введите день рождения сотрудника!",
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
    label: "Должность",
    name: "position",
    rules: [
      {
        required: true,
        message: "Пожалуйста, введите должность сотрудника!",
      },
    ],
    node: <Input />,
  },
  {
    label: "Адрес",
    name: "address",
    rules: [
      {
        required: true,
        message: "Пожалуйста, введите адрес сотрудника!",
      },
    ],
    node: <Input />,
  },
];
