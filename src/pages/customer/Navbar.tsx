import { Link } from "react-router-dom";
import logo from "@/assets/images/cca-logo.png";

const navigationLinks = [
  { title: "Home", to: "/" },
  {
    title: "About Us",
    to: "https://sites.google.com/slu.edu.ph/cca/home?authuser=0",
    target: "_blank",
  },
];

const Navbar = ({ className }: { className: string }) => {
  return (
    <div className={`${className}`}>
      <div className="max-w-[100px] h-[35px]">
        <img className="object-cover w-full h-full" src={logo} alt="CCA Logo" />
      </div>
      {navigationLinks.map((link) => (
        <Link key={link.title} to={link.to} target={link?.target}>
          {link.title}
        </Link>
      ))}
    </div>
  );
};

export default Navbar;
