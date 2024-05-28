import { Tabs, Typography } from "antd";
import { ManagementMaker } from "./components/ManagementMaker/ManagementMaker";
import { ManagementDistributor } from "./components/ManagementDistributor/ManagementDistributor";
import { ManagementDiler } from "./components/ManagementDiler/ManagementDiler";
import { ManagementProducts } from "./components/ManagementProducts/ManagementProducts";

function App() {
  const tabs = [
    {
      key: "maker",
      label: "Производитель",
      children: <ManagementMaker />,
    },
    {
      key: "distibutor",
      label: "Дистрибьютор",
      children: <ManagementDistributor />,
    },
    {
      key: "diler",
      label: "Дилер",
      children: <ManagementDiler />,
    },
    {
      key: "products",
      label: "Продукты",
      children: <ManagementProducts />,
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
