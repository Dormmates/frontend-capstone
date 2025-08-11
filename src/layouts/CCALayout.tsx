import { Outlet } from "react-router-dom";
import SideBar, { type SideBarItems } from "../components/navigation/SideBar";

import accounts from "../assets/icons/accounts.png";
import dashboard from "../assets/icons/dashboard.png";
import groups from "../assets/icons/performing-groups.png";
import seat from "../assets/icons/seat.png";
import shows from "../assets/icons/shows.png";
import Header from "../components/Header";

import { useRef } from "react";

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
  },
  {
    icon: accounts,
    name: "Manage Accounts",
    items: [
      { name: "Trainer", path: "/manage/trainers" },
      { name: "Distributor", path: "/manage/distributors" },
      { name: "CCA Head", path: "/manage/cca-head" },
      { name: "Account Request", path: "/manage/request" },
    ],
    path: "/manage/trainers",
  },
  {
    icon: seat,
    name: "Seat Map",
    path: "/seat",
  },
];

const CCALayout = () => {
  const contentRef = useRef<HTMLDivElement>(null);
  return (
    <div className="min-w-[1200px] ">
      <Header />
      <div className="flex h-[calc(100vh-120px)] pt-[120px]">
        <SideBar items={sideBarItems} />

        <div ref={contentRef} className="flex-grow overflow-x-auto" style={{ height: "calc(100vh - 120px)" }}>
          <Outlet context={{ contentRef }} />
        </div>
      </div>
    </div>
  );
};

export default CCALayout;
