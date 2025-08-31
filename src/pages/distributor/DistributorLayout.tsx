import { Outlet } from "react-router-dom";
import SideBar, { type SideBarItems } from "../../components/SideBar";

import history from "../../assets/icons/history.png";
import dashboard from "../../assets/icons/dashboard.png";
import Header from "../../components/Account";

const sideBarItems: SideBarItems[] = [
  {
    icon: dashboard,
    name: "Dashboard",
    path: "/",
  },
  {
    icon: history,
    name: "History",
    path: "/history",
  },
];

const DistributorLayout = () => {
  return (
    <div className="min-w-[800px] min-h-screen">
      <Header />
      <div className="flex h-[calc(100vh-120px)] pt-[120px]">
        <SideBar items={sideBarItems} />
        <div className="flex-grow overflow-x-auto" style={{ height: "calc(100vh - 120px)" }}>
          <Outlet />
        </div>
      </div>
    </div>
  );
};

export default DistributorLayout;
