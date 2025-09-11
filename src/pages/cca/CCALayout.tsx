import { Outlet } from "react-router-dom";
import { useAuthContext } from "../../context/AuthContext";
import accounts from "../../assets/icons/accounts.png";
import dashboard from "../../assets/icons/dashboard.png";
import groups from "../../assets/icons/performing-groups.png";
import shows from "../../assets/icons/shows.png";
import major from "../../assets/icons/major-prod.png";
import { SidebarProvider } from "@/components/ui/sidebar";
import SideBar from "@/components/SideBar";
import Header from "@/components/Header";
import { useNotificationSocket } from "@/hooks/useNotificationSocket";

const CCALayout = () => {
  const { user } = useAuthContext();
  useNotificationSocket();
  const sideBarItems = [
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
      icon: major,
      name: "Major Production",
      path: "/majorShows",
    },
    {
      icon: groups,
      name: "Performing Groups",
      path: "/performing-groups",
      hidden: !user?.roles.includes("head"),
    },
    {
      icon: accounts,
      name: "Manage Accounts",
      items: [
        { name: "Trainer", path: "/manage/trainers", hidden: !user?.roles.includes("head") },
        { name: "Distributor", path: "/manage/distributors" },
        { name: "CCA Head", path: "/manage/cca-head", hidden: !user?.roles.includes("head") },
        // { name: "Account Request", path: "/manage/request" },
      ],
      path: !user?.roles.includes("head") ? "/manage/distributors" : "/manage/trainers",
    },
  ];

  return (
    <SidebarProvider>
      <SideBar items={sideBarItems} />

      <main className="flex flex-col w-full">
        <Header />

        <div className="overflow-y-auto h-[calc(100vh-3rem)]">
          <div className="p-4">
            <Outlet />
          </div>
        </div>
      </main>
    </SidebarProvider>
  );
};

export default CCALayout;
