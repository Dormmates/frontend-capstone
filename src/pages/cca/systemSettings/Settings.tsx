import { ContentWrapper } from "@/components/layout/Wrapper";
import TicketPrices from "./TicketPrices";

const Settings = () => {
  return (
    <ContentWrapper>
      <h1 className="text-3xl mb-10">System Settings</h1>
      <TicketPrices />
    </ContentWrapper>
  );
};

export default Settings;
