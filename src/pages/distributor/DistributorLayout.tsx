import { Outlet } from "react-router-dom";
import SideBar from "@/components/SideBar";
import { SidebarProvider } from "@/components/ui/sidebar";
import Header from "@/components/Header";
import { HistoryIcon, LayoutDashboardIcon } from "lucide-react";
import { useAuthContext } from "@/context/AuthContext";
import { useEffect, useState } from "react";
import Modal from "@/components/Modal";
import { toast } from "sonner";
import UpdatePassword from "../UpdatePassword";

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
  const { user } = useAuthContext();
  const [openDefaultPasswordModal, setOpenDefaultPasswordModal] = useState(false);

  useEffect(() => {
    if (user && user.isDefaultPassword) {
      setOpenDefaultPasswordModal(true);
    }
  }, [user]);

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

export default DistributorLayout;
