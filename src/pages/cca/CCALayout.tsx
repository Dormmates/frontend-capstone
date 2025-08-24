import { Outlet } from "react-router-dom";
import SideBar, { type SideBarItems } from "../../components/navigation/SideBar";

import accounts from "../../assets/icons/accounts.png";
import dashboard from "../../assets/icons/dashboard.png";
import groups from "../../assets/icons/performing-groups.png";
import shows from "../../assets/icons/shows.png";
import Header from "../../components/Header";

import { useAuthContext } from "../../context/AuthContext";

const CCALayout = () => {
  const { user } = useAuthContext();
  const sideBarItems: SideBarItems[] = [
    {
      icon: dashboard,
      name: "Dashboard",
      path: "/",
    },
    {
      icon: shows,
      name: "Shows",
      path: "/shows",
    },
    {
      icon: groups,
      name: "Performing Groups",
      path: "/performing-groups",
      hidden: user?.role === "trainer",
    },
    {
      icon: accounts,
      name: "Manage Accounts",
      items: [
        { name: "Trainer", path: "/manage/trainers", hidden: user?.role === "trainer" },
        { name: "Distributor", path: "/manage/distributors" },
        { name: "CCA Head", path: "/manage/cca-head", hidden: user?.role === "trainer" },
        { name: "Account Request", path: "/manage/request" },
      ],
      path: user?.role === "trainer" ? "/manage/distributors" : "/manage/trainers",
    },
  ];

  return (
    <div className="min-w-[1200px] ">
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

export default CCALayout;
