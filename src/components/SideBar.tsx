import { useLocation, Link, useNavigate } from "react-router-dom";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  SidebarRail,
} from "@/components/ui/sidebar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { useAuthContext } from "@/context/AuthContext";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

import { Button } from "@/components/ui/button";
import { useState } from "react";
import Account from "./Account";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { useLogout } from "@/_lib/@react-client-query/auth";
import ToastNotification from "@/utils/toastNotification";

interface SideBarItems {
  icon: string;
  name: string;
  path?: string;
  hidden?: boolean;
  items?: { name: string; path: string; hidden?: boolean }[];
}

interface CCASideBarProps {
  items: SideBarItems[];
}

export const SideBar = ({ items }: CCASideBarProps) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, setUser } = useAuthContext();
  const logout = useLogout();
  const [openAccount, setOpenAccount] = useState(false);

  return (
    <>
      <Sidebar variant="floating">
        <SidebarHeader>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton size="lg" asChild>
                <Link to="/">
                  <div className="bg-sidebar-primary text-sidebar-primary-foreground flex aspect-square size-8 items-center justify-center rounded-lg">
                    SLU
                  </div>
                  <div className="flex flex-col gap-0.5 leading-none">
                    <span className="font-medium">SLU CCA</span>
                    <span className="text-xs text-muted-foreground">Ticketing</span>
                  </div>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarHeader>

        <SidebarContent>
          <SidebarGroup>
            <SidebarGroupLabel>Application</SidebarGroupLabel>
            <SidebarMenu>
              {items
                .filter((item) => !item.hidden)
                .map((item) => (
                  <SidebarMenuItem key={item.name}>
                    {item.path ? (
                      <SidebarMenuButton className="p-5" asChild isActive={location.pathname === item.path}>
                        <Link to={item.path}>
                          <img src={item.icon} alt={item.name} className="mr-2 h-4 w-4 object-contain" />
                          {item.name}
                        </Link>
                      </SidebarMenuButton>
                    ) : (
                      <SidebarMenuButton className="p-5">
                        <img src={item.icon} alt={item.name} className="mr-2 h-4 w-4 object-contain" />
                        {item.name}
                      </SidebarMenuButton>
                    )}

                    {item.items?.filter((sub) => !sub.hidden).length ? (
                      <SidebarMenuSub>
                        {item.items
                          .filter((sub) => !sub.hidden)
                          .map((sub) => (
                            <SidebarMenuSubItem key={sub.name}>
                              <SidebarMenuSubButton className="p-5" asChild isActive={location.pathname === sub.path}>
                                <Link to={sub.path}>{sub.name}</Link>
                              </SidebarMenuSubButton>
                            </SidebarMenuSubItem>
                          ))}
                      </SidebarMenuSub>
                    ) : null}
                  </SidebarMenuItem>
                ))}
            </SidebarMenu>
          </SidebarGroup>
        </SidebarContent>
        <SidebarFooter>
          <SidebarMenu>
            <SidebarMenuItem>
              <DropdownMenu>
                <DropdownMenuTrigger className="p-5" asChild>
                  <SidebarMenuButton className="p-5">
                    <div className="flex gap-5 items-center">
                      <Avatar className="w-10 h-10">
                        <AvatarImage src="https://api.dicebear.com/9.x/fun-emoji/svg?seed=Jade" alt="profile" />
                        <AvatarFallback className="rounded-lg">Prof</AvatarFallback>
                      </Avatar>
                      <div className="flex flex-col items-start -gap-2">
                        <p className="font-semibold ">
                          {user?.firstName} {user?.lastName}
                        </p>
                        <p className="text-lightGrey">
                          {user?.roles.includes("head") ? "CCA Head" : user?.roles.includes("distributor") ? "Distributor" : "CCA Trainer"}
                        </p>
                      </div>
                    </div>
                  </SidebarMenuButton>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="min-w-56 rounded-lg" side={"bottom"} align="end" sideOffset={4}>
                  <DropdownMenuLabel className="p-2">
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button onClick={() => setOpenAccount(true)} variant="ghost" className="p-0  w-full flex justify-start">
                          <div className="flex justify-start items-center gap-2 px-1 py-1.5 text-left text-sm">
                            <Avatar className="h-8 w-8 rounded-lg">
                              <AvatarImage src="https://api.dicebear.com/9.x/fun-emoji/svg?seed=Jade" alt="profile" />
                              <AvatarFallback className="rounded-lg">Prof</AvatarFallback>
                            </Avatar>
                            <div className="grid flex-1 text-left text-sm leading-tight">
                              <span className="text-muted-foreground truncate text-xs">{user?.email}</span>
                            </div>
                          </div>
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>View Account Information</TooltipContent>
                    </Tooltip>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />

                  <DropdownMenuItem
                    onClick={() => {
                      logout.mutate(
                        {},
                        {
                          onSuccess: () => {
                            setUser(null);
                            navigate("/");
                          },
                          onError: (err) => {
                            ToastNotification.error(err.message);
                          },
                        }
                      );
                    }}
                  >
                    Logout
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarFooter>

        <SidebarRail />
      </Sidebar>
      {openAccount && <Account openAccount={openAccount} setOpenAccount={setOpenAccount} />}
    </>
  );
};

export default SideBar;
