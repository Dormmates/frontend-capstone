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
  SidebarSeparator,
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
import { useState, type ReactNode } from "react";
import Account from "./Account";
import { useLogout } from "@/_lib/@react-client-query/auth";
import { toast } from "sonner";
import { ChevronDown, ChevronRight, LogOutIcon, UserIcon } from "lucide-react";
import logo from "@/assets/images/cca-logo.png";

interface SideBarItems {
  icon: ReactNode;
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

  // Helper to check if a menu item is active
  const isItemActive = (path: string) => {
    if (path === "/") return location.pathname === "/";
    return location.pathname.startsWith(path);
  };

  return (
    <>
      <Sidebar variant="floating">
        {/* ---- HEADER ---- */}
        <SidebarHeader>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton size="lg" asChild>
                <Link to="/">
                  <div className="w-20">
                    <img className="object-cover" src={logo} alt="logo" />
                  </div>
                  <div className="flex flex-col gap-0.5 leading-none">
                    <span className="font-medium">SLU CCA</span>
                    <span className="text-xs text-muted-foreground">System</span>
                  </div>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
          <SidebarSeparator />
        </SidebarHeader>

        {/* ---- MAIN NAVIGATION ---- */}
        <SidebarContent>
          <SidebarGroup>
            <SidebarGroupLabel>Navigations</SidebarGroupLabel>
            <SidebarMenu>
              {items
                .filter((item) => !item.hidden)
                .map((item) => {
                  const hasSubItems = item.items ? item.items?.filter((sub) => !sub.hidden).length > 0 : null;
                  const [open, setOpen] = useState(true);

                  return (
                    <SidebarMenuItem key={item.name}>
                      {item.path && !hasSubItems ? (
                        // --- Normal link ---
                        <SidebarMenuButton className="p-5" asChild isActive={isItemActive(item.path)}>
                          <Link to={item.path}>
                            <span className="mr-2 h-4 w-4">{item.icon}</span>
                            {item.name}
                          </Link>
                        </SidebarMenuButton>
                      ) : (
                        <SidebarMenuButton className="p-5 flex justify-between items-center" onClick={() => setOpen((prev) => !prev)}>
                          <div className="flex items-center">
                            <span className="mr-2 h-4 w-4">{item.icon}</span>
                            {item.name}
                          </div>
                          {open ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                        </SidebarMenuButton>
                      )}

                      {/* ---- SUB MENU ---- */}
                      {hasSubItems && open && (
                        <SidebarMenuSub>
                          {(item.items ?? [])
                            .filter((sub) => !sub.hidden)
                            .map((sub) => (
                              <SidebarMenuSubItem key={sub.name}>
                                <SidebarMenuSubButton className="p-5" asChild isActive={location.pathname === sub.path}>
                                  <Link to={sub.path}>{sub.name}</Link>
                                </SidebarMenuSubButton>
                              </SidebarMenuSubItem>
                            ))}
                        </SidebarMenuSub>
                      )}
                    </SidebarMenuItem>
                  );
                })}
            </SidebarMenu>
          </SidebarGroup>
        </SidebarContent>

        {/* ---- FOOTER ---- */}
        <SidebarFooter>
          <SidebarMenu>
            <SidebarMenuItem>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <SidebarMenuButton className="p-5">
                    <div className="flex gap-5 items-center">
                      <Avatar className="w-10 h-10 rounded-lg">
                        <AvatarImage src="https://api.dicebear.com/9.x/fun-emoji/svg?seed=Jade" alt="profile" />
                        <AvatarFallback>Prof</AvatarFallback>
                      </Avatar>
                      <div className="flex flex-col items-start">
                        <p className="font-semibold">
                          {user?.firstName} {user?.lastName}
                        </p>
                        <p className="text-muted-foreground text-sm">
                          {user?.roles.includes("head") ? "CCA Head" : user?.roles.includes("distributor") ? "Distributor" : "CCA Trainer"}
                        </p>
                      </div>
                    </div>
                  </SidebarMenuButton>
                </DropdownMenuTrigger>

                <DropdownMenuContent className="min-w-56 rounded-lg" side="bottom" align="end" sideOffset={4}>
                  <DropdownMenuLabel className="p-2">
                    <div className="flex items-center gap-2 px-1 py-1.5 text-sm">
                      <Avatar className="h-8 w-8 rounded-lg">
                        <AvatarImage src="https://api.dicebear.com/9.x/fun-emoji/svg?seed=Jade" alt="profile" />
                        <AvatarFallback>Prof</AvatarFallback>
                      </Avatar>
                      <div className="flex-1 truncate">
                        <span className="text-muted-foreground text-xs">{user?.email}</span>
                      </div>
                    </div>
                  </DropdownMenuLabel>

                  <DropdownMenuSeparator />

                  <DropdownMenuItem onClick={() => setOpenAccount(true)}>
                    <UserIcon />
                    Account
                  </DropdownMenuItem>

                  <DropdownMenuItem
                    onClick={() => {
                      toast.promise(
                        logout.mutateAsync(
                          {},
                          {
                            onSuccess: () => {
                              setUser(null);
                              navigate("/cca/login");
                            },
                          }
                        ),
                        {
                          position: "top-center",
                          loading: "Logging Out...",
                          success: "Logged Out",
                          error: "Failed to logout, please try again",
                        }
                      );
                    }}
                  >
                    <LogOutIcon />
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
