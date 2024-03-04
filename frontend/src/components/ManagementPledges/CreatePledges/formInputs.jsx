import { Input } from "antd";

export const formInputs = [
  {
    label: "Состояние",
    name: "condition",
    rules: [
      {
        required: true,
        message: "Пожалуйста, введите состояние предмета залога!",
      },
    ],
    node: <Input />,
  },
  {
    label: "Название",
    name: "description",
    rules: [
      {
        required: true,
        message: "Пожалуйста, введите описание предмета залога!",
      },
    ],
    node: <Input />,
  },
  {
    label: "Характеристики",
    name: "characteristics",
    rules: [
      {
        required: true,
        message: "Пожалуйста, введите характеристики предмета залога!",
      },
    ],
    node: <Input />,
  },
  {
    label: "Цена",
    name: "price",
    rules: [
      {
        required: true,
        message: "Пожалуйста, введите цену предмета залога!",
      },
    ],
    node: <Input />,
  },
];
