import { Link } from "react-router-dom";
import logo from "@/assets/images/cca-logo.png";
import { ThemeSwitch } from "@/components/ThemeSwitch";
import { Button } from "@/components/ui/button";
import { Menu } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

const navigationLinks = [
  { title: "Home", to: "/" },
  {
    title: "About Us",
    to: "https://sites.google.com/slu.edu.ph/cca/home?authuser=0",
    target: "_blank",
  },
];

const Navbar = ({ className = "" }: { className?: string }) => {
  return (
    <nav className={`  ${className}`}>
      {/* Logo */}
      <div className="flex items-center gap-2">
        <div className="max-w-[100px] h-[35px]">
          <img className="object-cover w-full h-full" src={logo} alt="CCA Logo" />
        </div>
      </div>

      {/* Desktop Links */}
      <div className="hidden md:flex items-center gap-6 w-full">
        {navigationLinks.map((link) => (
          <Link key={link.title} to={link.to} target={link?.target} className=" text-nowrap hover:text-primary transition-colors">
            {link.title}
          </Link>
        ))}

        <div className="flex justify-end w-full gap-5">
          <ThemeSwitch />
          <Link to="/login">
            <Button>Login as CCA</Button>
          </Link>
        </div>
      </div>

      {/* Mobile Hamburger */}
      <div className="flex justify-end md:hidden items-center gap-2 w-full">
        <ThemeSwitch />

        <Popover>
          <PopoverTrigger asChild>
            <Menu />
          </PopoverTrigger>
          <PopoverContent side="bottom" align="start" className="w-fit mt-5">
            <div className="flex flex-col gap-5">
              {navigationLinks.map((link) => (
                <Link key={link.title} to={link.to} target={link?.target} className="text-foreground hover:text-primary transition-colors text-lg">
                  {link.title}
                </Link>
              ))}
              <Link to="/login">
                <Button>Login as CCA</Button>
              </Link>
            </div>
          </PopoverContent>
        </Popover>
      </div>
    </nav>
  );
};

export default Navbar;
