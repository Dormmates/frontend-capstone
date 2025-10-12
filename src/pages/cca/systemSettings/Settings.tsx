import { ContentWrapper } from "@/components/layout/Wrapper";
import TicketPrices from "./TicketPrices";
import GenreLists from "./GenreLists";
import { useEffect } from "react";

const Settings = () => {
  useEffect(() => {
    document.title = `System Settings`;
  }, []);

  return (
    <ContentWrapper>
      <h1 className="text-3xl mb-10">System Settings</h1>
      <div className="flex flex-col gap-3">
        <TicketPrices />
        <GenreLists />
      </div>
    </ContentWrapper>
  );
};

export default Settings;
