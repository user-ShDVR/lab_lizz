import { Tabs, Typography } from "antd";
import { ManagementMaker } from "./components/ManagementMaker/ManagementMaker";
import { ManagementDistributor } from "./components/ManagementDistributor/ManagementDistributor";
import { ManagementDiler } from "./components/ManagementDiler/ManagementDiler";
import { ManagementProducts } from "./components/ManagementProducts/ManagementProducts";
import { ManagementWarehouse } from "./components/ManagementWarehouse/ManagementWarehouse";
import { ManagementDistChecks } from "./components/ManagementDistChecks/ManagementDistChecks";
import { ManagementDilChecks } from "./components/ManagementDilChecks/ManagementDilChecks";

function App() {
  const tabs = [
    {
      key: "maker",
      label: "Производитель",
      children: <ManagementMaker />,
    },
    {
      key: "products",
      label: "Продукты",
      children: <ManagementProducts />,
    },
    {
      key: "distChecks",
      label: "Договоры(между производителем и дистрибьютором)",
      children: <ManagementDistChecks />,
    },
    {
      key: "distibutor",
      label: "Дистрибьютор",
      children: <ManagementDistributor />,
    },
    {
      key: "warehouse",
      label: "Склад",
      children: <ManagementWarehouse />,
    },
    {
      key: "dilChecks",
      label: "Договоры(между дистрибьютором и дилером)",
      children: <ManagementDilChecks />,
    },
    {
      key: "diler",
      label: "Дилер",
      children: <ManagementDiler />,
    },
  ];

  return (
    <div style={{ margin: "40px" }}>
      <Typography.Title>Админ панель</Typography.Title>
      <Tabs defaultActiveKey="1" items={tabs} />
    </div>
  );
}

export default App;
