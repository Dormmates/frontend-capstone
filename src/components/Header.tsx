import DateAndTimeNow from "./DateAndTimeNow";
import { ContentWrapper } from "./layout/Wrapper";
import NotificationBell from "./NotificationBell";
import { ThemeSwitch } from "./ThemeSwitch";
import { Separator } from "./ui/separator";
import { SidebarTrigger } from "./ui/sidebar";

const Header = () => {
  return (
    <header className="flex border-b border-b-muted p-2 w-full bg-background h-12 items-center">
      <ContentWrapper className="flex justify-between w-full items-center">
        <div className="flex items-center gap-2">
          <SidebarTrigger />
          <Separator className="h-5" orientation="vertical" />
          <DateAndTimeNow />
          <Separator className="h-5" orientation="vertical" />
          <ThemeSwitch />
        </div>
        <NotificationBell />
      </ContentWrapper>
    </header>
  );
};

export default Header;
