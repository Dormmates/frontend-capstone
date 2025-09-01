import { Outlet } from "react-router-dom";
import SideBar from "@/components/SideBar";
import history from "../../assets/icons/history.png";
import dashboard from "../../assets/icons/dashboard.png";
import { SidebarProvider } from "@/components/ui/sidebar";
import { ScrollArea } from "@/components/ui/scroll-area";
import Header from "@/components/Header";

const sideBarItems = [
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
    <SidebarProvider>
      <SideBar items={sideBarItems} />

      <main className="flex flex-col w-full h-screen">
        <Header />
        <ScrollArea className="flex-1">
          <div className="p-4">
            <Outlet />
          </div>
        </ScrollArea>
      </main>
    </SidebarProvider>
  );
};

export default DistributorLayout;
