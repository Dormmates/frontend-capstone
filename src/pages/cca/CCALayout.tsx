import { Outlet } from "react-router-dom";
import { useAuthContext } from "../../context/AuthContext";
import { SidebarProvider } from "@/components/ui/sidebar";
import SideBar from "@/components/SideBar";
import Header from "@/components/Header";
import { useNotificationSocket } from "@/hooks/useNotificationSocket";
import { DramaIcon, LayoutDashboardIcon, NetworkIcon, SettingsIcon, TheaterIcon, UsersIcon } from "lucide-react";
import Modal from "@/components/Modal";
import { toast } from "sonner";
import UpdatePassword from "../UpdatePassword";
import { useEffect, useState } from "react";

const CCALayout = () => {
  const { user } = useAuthContext();
  useNotificationSocket();

  const [openDefaultPasswordModal, setOpenDefaultPasswordModal] = useState(false);

  useEffect(() => {
    if (user && user.isDefaultPassword) {
      setOpenDefaultPasswordModal(true);
    }
  }, [user]);

  const sideBarItems = [
    {
      icon: <LayoutDashboardIcon className="h-4 w-4" />,
      name: "Dashboard",
      path: "/",
    },
    {
      icon: <DramaIcon className="h-4 w-4" />,
      name: "Shows",
      path: "/shows",
    },
    {
      icon: <TheaterIcon className="h-4 w-4" />,
      name: "Major Production",
      path: "/majorShows",
    },
    {
      icon: <NetworkIcon className="h-4 w-4" />,
      name: "Performing Groups",
      path: "/performing-groups",
      hidden: !user?.roles.includes("head"),
    },
    {
      icon: <UsersIcon className="h-4 w-4" />,
      name: "Manage Accounts",
      items: [
        { name: "Trainer", path: "/manage/trainers", hidden: !user?.roles.includes("head") },
        { name: "Distributor", path: "/manage/distributors" },
        { name: "CCA Head", path: "/manage/cca-head", hidden: !user?.roles.includes("head") },
        // { name: "Account Request", path: "/manage/request" },
      ],
      path: !user?.roles.includes("head") ? "/manage/distributors" : "/manage/trainers",
    },
    {
      icon: <SettingsIcon className="h-4 w-4" />,
      name: "System Settings",
      path: "/settings",
      hidden: !user?.roles.includes("head"),
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

      {openDefaultPasswordModal && (
        <Modal
          description="Your account was either using the default password or your password has been reset by the CCA Head/Trainer. 
    For security reasons, you are required to update your password before continuing."
          title="Update Password"
          isOpen={openDefaultPasswordModal}
          onClose={() => {
            toast.error("Please change your password first", { position: "top-center" });
          }}
        >
          <UpdatePassword closeModal={() => setOpenDefaultPasswordModal(false)} />
        </Modal>
      )}
    </SidebarProvider>
  );
};

export default CCALayout;
