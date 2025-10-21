import { useGetDepartments } from "@/_lib/@react-client-query/department";
import { useGetShows } from "@/_lib/@react-client-query/show";
import ccaLogo from "@/assets/images/cca-logo.png";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Button } from "@/components/ui/button";
import { useEffect, useMemo, useState } from "react";
import { TheaterIcon } from "lucide-react";
import CustomerShowCard from "./components/CustomerShowCard";
import { Label } from "@/components/ui/label";
import Breadcrumbs from "@/components/BreadCrumbs";

const CustomerHome = () => {
  useEffect(() => {
    document.title = "SLU CCA - Shows";
  }, []);

  const [filter, setFilter] = useState("all");

  return (
    <>
      <Breadcrumbs backHref="/" items={[{ name: "Return Home" }]} />
      <div className="flex gap-3 flex-col">
        <Label>Filter: </Label>
        <DepartmentsFilter filter={filter} setFilter={setFilter} />
      </div>
      <div className="flex gap-3 flex-col mt-10">
        <Label>Shows: </Label>
        <ShowsList filter={filter} />
      </div>
    </>
  );
};

const DepartmentsFilter = ({ setFilter, filter }: { filter: string; setFilter: React.Dispatch<React.SetStateAction<string>> }) => {
  const { data: departments, isLoading, isError } = useGetDepartments();

  const items = useMemo(() => {
    if (!departments) return [];

    return [
      {
        id: "all",
        label: "All Shows",
        icon: <TheaterIcon className="h-16 w-16" />,
      },
      ...departments.map((dept) => ({
        id: dept.departmentId,
        label: dept.name,
        icon: <img src={dept.logoUrl} alt="logo" className="max-h-full max-w-full object-contain" />,
      })),
      {
        id: "major",
        label: "Major Production Shows",
        icon: <img src={ccaLogo} alt="logo" className="max-h-full max-w-full object-contain" />,
      },
    ];
  }, [departments]);

  if (isLoading) return <h1>Loading Departments</h1>;
  if (isError || !departments) return <h1>Error loading</h1>;

  return (
    <div className="flex justify-between overflow-x-auto overflow-y-hidden w-full">
      {items.map((item) => (
        <Tooltip key={item.id}>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              onClick={() => setFilter(item.id)}
              className={`flex-none flex flex-col items-center justify-center h-20 w-20 p-0 overflow-hidden transition-colors ${
                filter === item.id ? "bg-gray border shadow-lg" : ""
              }`}
            >
              <div className="h-20 w-20 flex items-center justify-center overflow-hidden p-2">{item.icon}</div>
              {item.id === "all" && <p className="text-xs mt-1">All</p>}
            </Button>
          </TooltipTrigger>
          <TooltipContent>{item.label}</TooltipContent>
        </Tooltip>
      ))}
    </div>
  );
};

const ShowsList = ({ filter }: { filter: string }) => {
  const { data: shows, isLoading: loadingShows, isError: errorShows } = useGetShows({ includeMajorProduction: true, excludeArchived: true });

  const filteredShows = useMemo(() => {
    if (!shows) return [];

    return shows.filter((show) => {
      if (filter === "all") {
        return true;
      }
      if (filter === "major") {
        return show.showType === "majorProduction";
      }
      return show.department?.departmentId === filter;
    });
  }, [shows, filter]);

  if (loadingShows) {
    return <h1>Loading Shows</h1>;
  }

  if (errorShows || !shows) {
    return <h1>Error loading</h1>;
  }

  return (
    <div className="flex flex-wrap gap-5">
      {filteredShows.map((show) => (
        <CustomerShowCard show={show} />
      ))}

      {filteredShows.length === 0 && <div className="text-center w-full text-muted-foreground">No Shows found.</div>}
    </div>
  );
};

export default CustomerHome;
