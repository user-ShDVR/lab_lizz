import { Input } from "antd";
import InputMask from "react-input-mask";

export const formInputs = [
  {
    label: "ФИО",
    name: "full_name",
    rules: [
      {
        required: true,
        message: "Пожалуйста, введите фамилию, имя, отчество клиента!",
      },
    ],
    node: <Input />,
  },
  {
    label: "Адрес",
    name: "address",
    node: <Input />,
  },
  {
    label: "Номер телефона",
    name: "phone_number",
    node: (
      <InputMask mask="+7 (999) 999-99-99" maskChar="_">
        {(inputProps) => <Input {...inputProps} />}
      </InputMask>
    ),
  },
  {
    label: "Паспортные данные",
    name: "passport_data",
    rules: [
      {
        required: true,
        message: "Пожалуйста, введите паспортные данные клиента!",
      },
    ],
    node: <Input />,
  },
];
