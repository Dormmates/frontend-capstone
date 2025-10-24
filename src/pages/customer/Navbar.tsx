import { Link } from "react-router-dom";
import logo from "@/assets/images/cca-logo.png";

const navigationLinks = [
  { title: "Home", to: "/" },
  { title: "Shows", to: "/shows" },
  {
    title: "About Us",
    to: "https://sites.google.com/slu.edu.ph/cca/home?authuser=0",
    target: "_blank",
  },
];

const Navbar = ({ className }: { className: string }) => {
  return (
    <div className={`${className}`}>
      <div className="max-w-[120px]">
        <img src={logo} alt="CCA Logo" />
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
