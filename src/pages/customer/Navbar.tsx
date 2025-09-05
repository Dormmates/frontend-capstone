import ccaLogo from "@/assets/images/cca-logo.png";
import { ContentWrapper } from "@/components/layout/Wrapper";
import { Button } from "@/components/ui/button";

const Navbar = () => {
  return (
    <header className="flex w-full bg-white border-b border-lightGrey">
      <ContentWrapper className="flex justify-between w-full">
        <img className="w-24" src={ccaLogo} alt="logo" />
        <Button>Search Reservation</Button>
      </ContentWrapper>
    </header>
  );
};

export default Navbar;
