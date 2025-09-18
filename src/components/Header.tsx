import DateAndTimeNow from "./DateAndTimeNow";
import { ContentWrapper } from "./layout/Wrapper";
import NotificationBell from "./NotificationBell";

import { SidebarTrigger } from "./ui/sidebar";
import { Tooltip, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip";

const Header = () => {
  return (
    <header className="flex border-b border-b-lightGrey p-2 w-full bg-white h-12 items-center">
      <ContentWrapper className="flex justify-between w-full items-center">
        <Tooltip>
          <TooltipTrigger asChild>
            <SidebarTrigger />
          </TooltipTrigger>
          <TooltipContent>
            <p>Toggle Side Bar</p>
          </TooltipContent>
        </Tooltip>
        <DateAndTimeNow />
        <NotificationBell />
      </ContentWrapper>
    </header>
  );
};

export default Header;
