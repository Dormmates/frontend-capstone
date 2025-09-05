import { SidebarTrigger } from "./ui/sidebar";
import { Tooltip, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip";

const Header = () => {
  return (
    <header className="flex border-b border-b-lightGrey p-2 w-full bg-white h-12 items-center">
      <Tooltip>
        <TooltipTrigger asChild>
          <SidebarTrigger />
        </TooltipTrigger>
        <TooltipContent>
          <p>Toggle Side Bar</p>
        </TooltipContent>
      </Tooltip>
    </header>
  );
};

export default Header;
