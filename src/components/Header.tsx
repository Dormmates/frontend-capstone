import { useIsMobile } from "@/hooks/use-mobile";
import DateAndTimeNow from "./DateAndTimeNow";
import { ContentWrapper } from "./layout/Wrapper";
import NotificationBell from "./NotificationBell";
import { ThemeSwitch } from "./ThemeSwitch";
import { Separator } from "./ui/separator";
import { SidebarTrigger } from "./ui/sidebar";
import { useAuthContext } from "@/context/AuthContext";

const Header = () => {
  const { user } = useAuthContext();
  const isMobile = useIsMobile();
  return (
    <header className="flex border-b border-b-muted p-2 w-full bg-background h-12 items-center">
      <ContentWrapper className="flex justify-between w-full items-center">
        <div className="flex items-center gap-2">
          <SidebarTrigger />
          {!isMobile && (
            <>
              <Separator className="h-5" orientation="vertical" />
              <DateAndTimeNow />
            </>
          )}
          <Separator className="h-5" orientation="vertical" />
          <ThemeSwitch />
        </div>
        {user?.roles.includes("head") || !!user?.department || (user?.roles.includes("distributor") && <NotificationBell />)}
      </ContentWrapper>
    </header>
  );
};

export default Header;
