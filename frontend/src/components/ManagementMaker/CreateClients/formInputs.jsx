import { Input } from "antd";
import InputMask from "react-input-mask";

export const formInputs = [
  {
    label: "Наименование компании",
    name: "companyName",
    rules: [
      {
        required: true,
        message: "Пожалуйста, введите наименование!",
      },
    ],
    node: <Input />,
  },
  {
    label: "Расчетный счет",
    name: "paymentAccount",
    rules: [
      {
        required: true,
        message: "Пожалуйста, введите расчетный счет!",
      },
    ],
    node: (
      <InputMask mask="999999999999999999999999999" maskChar="_">
        {(inputProps) => <Input {...inputProps} />}
      </InputMask>
    ),
  },
  {
    label: "БИК",
    name: "BIK",
    rules: [
      {
        required: true,
        message: "Пожалуйста, введите БИК!",
      },
    ],
    node: (
      <InputMask mask="999999999" maskChar="_">
        {(inputProps) => <Input {...inputProps} />}
      </InputMask>
    ),
  },
  {
    label: "КПП",
    name: "KPP",
    rules: [
      {
        required: true,
        message: "Пожалуйста, введите КПП!",
      },
    ],
    node: (
      <InputMask mask="999999999" maskChar="_">
        {(inputProps) => <Input {...inputProps} />}
      </InputMask>
    ),
  },
  {
    label: "ИНН",
    name: "INN",
    rules: [
      {
        required: true,
        message: "Пожалуйста, введите ИНН!",
      },
    ],
    node: (
      <InputMask mask="9999999999" maskChar="_">
        {(inputProps) => <Input {...inputProps} />}
      </InputMask>
    ),
  },
  {
    label: "Страна происхождения",
    name: "country",
    rules: [
      {
        required: true,
        message: "Пожалуйста, введите страну!",
      },
    ],
    node: <Input />,
  },
  {
    label: "Адрес",
    name: "legalAddress",
    node: <Input />,
  },
  {
    label: "Номер телефона",
    name: "contactNumber",
    node: (
      <InputMask mask="+7 (999) 999-99-99" maskChar="_">
        {(inputProps) => <Input {...inputProps} />}
      </InputMask>
    ),
  },
];
