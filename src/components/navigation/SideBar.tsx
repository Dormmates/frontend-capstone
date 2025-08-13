import { Link, useLocation } from "react-router-dom";
import merge from "../../utils/merge";
import { useState } from "react";

export interface SideBarItems {
  icon: string;
  name: string;
  items?: { name: string; path: string; hidden?: boolean }[];
  hidden?: boolean;
  path: string;
}

interface SideBarProps {
  items: SideBarItems[];
  className?: string;
}

const SideBar = ({ items, className }: SideBarProps) => {
  const [toggle, setToggle] = useState(true);
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const location = useLocation();

  const handleToggleSubmenu = (index: number) => {
    setOpenIndex(index);
  };

  return (
    <aside className={`relative top-0 h-screen bg-white border-r border-lightGrey ${toggle ? "w-[200px]" : "w-[80px]"} transition-all duration-300`}>
      <button
        className="absolute top-5 right-0 z-10 bg-primary font-bold text-xl text-white w-8 h-8 flex items-center justify-center rounded-sm"
        onClick={() => setToggle(!toggle)}
      >
        {toggle ? <p>&#10094;</p> : <p>&#10095;</p>}
      </button>

      <div className={merge("flex flex-col gap-5 h-full transition-all duration-300 mt-16", toggle ? "items-start pl-4" : "items-center", className)}>
        {items
          .filter((item) => !item.hidden)
          .map((item, index) => {
            const isActive =
              (item.path === "/" ? location.pathname === "/" : location.pathname.startsWith(item.path + "/") || location.pathname === item.path) ||
              (item.items && item.items.some((sub) => location.pathname === sub.path));

            return (
              <div key={index} className="w-full">
                <div onClick={() => (item.items ? handleToggleSubmenu(index) : null)} className="cursor-pointer w-full">
                  <Link
                    to={item.path}
                    className={merge(
                      "flex items-center gap-2 text-sm font-medium  w-full px-2 py-5 transition hover:opacity-80",
                      isActive ? "bg-primaryTwo pointer-events-none" : "",
                      toggle ? "justify-start" : "justify-center"
                    )}
                  >
                    {toggle ? (
                      <div className="flex items-center gap-2">
                        <img src={item.icon} alt={item.name} />
                        <p>{item.name}</p>
                      </div>
                    ) : (
                      <img src={item.icon} alt={item.name} />
                    )}
                  </Link>
                </div>

                {toggle && item.items && openIndex === index && (
                  <div className="ml-6 mt-5 flex flex-col gap-5">
                    {item.items
                      .filter((item) => !item.hidden)
                      .map((subItem, subIndex) => {
                        const isSubActive = location.pathname === subItem.path;
                        return (
                          <Link
                            key={subIndex}
                            to={subItem.path}
                            className={merge(
                              "text-sm px-2 py-1 rounded hover:opacity-80 transition",
                              isSubActive ? "font-bold pointer-events-none" : "text-gray-600"
                            )}
                          >
                            {subItem.name}
                          </Link>
                        );
                      })}
                  </div>
                )}
              </div>
            );
          })}
      </div>
    </aside>
  );
};

export default SideBar;
