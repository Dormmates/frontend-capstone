import { Outlet } from "react-router-dom";
import SideBar from "@/components/SideBar";
import { SidebarProvider } from "@/components/ui/sidebar";
import Header from "@/components/Header";
import { HistoryIcon, LayoutDashboardIcon } from "lucide-react";

const sideBarItems = [
  {
    icon: <LayoutDashboardIcon className="h-4 w-4" />,
    name: "Dashboard",
    path: "/",
  },
  {
    icon: <HistoryIcon className="h-4 w-4" />,
    name: "History",
    path: "/history",
  },
];

const DistributorLayout = () => {
  return (
    <SidebarProvider>
      <SideBar items={sideBarItems} />

      <main className="flex flex-col w-full h-screen">
        <Header />
        <div className="w-full overflow-x-auto">
          <div className="p-4">
            <Outlet />
          </div>
        </div>
      </main>
    </SidebarProvider>
  );
};

export default DistributorLayout;
