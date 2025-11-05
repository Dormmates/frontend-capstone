import { Button } from "@/components/ui/button";
import { ArrowUpIcon, MapPinIcon } from "lucide-react";
import { useEffect, useState } from "react";
import { Outlet } from "react-router-dom";

const CustomerLayout = () => {
  const [showScrollTop, setShowScrollTop] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 300) setShowScrollTop(true);
      else setShowScrollTop(false);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <>
      <Outlet />

      {showScrollTop && (
        <Button onClick={scrollToTop} size="icon" className="fixed bottom-6 right-6 z-[9999] rounded-full shadow-lg ">
          <ArrowUpIcon className="w-10 h-10 text-white" />
        </Button>
      )}

      <footer className="w-full bg-muted flex flex-col md:flex-row md:justify-between gap-5 p-5 lg:p-20 border border-t-primary mt-[200px]">
        <div>
          <h1 className="text-primary text-3xl font-bold">SLU Center for Culture and the Arts</h1>
          <p className="max-w-[500px] text-muted-foreground">
            Promoting cultural excellence and artistic expression through music, dance, theater, and creative performances.
          </p>
        </div>
        <div className="flex flex-col xl:flex-row gap-2">
          <MapPinIcon className="w-4 text-primary" />
          <p className="max-w-[500px] text-muted-foreground">
            Fr. Joseph Van den Daelen, CICM – Center for Culture and the Arts (CCA) Bldg., Saint Louis University Main Campus, A. Bonifacio St.,
            Baguio City, Benguet, Philippines 2600
          </p>
        </div>
      </footer>
    </>
  );
};

export default CustomerLayout;
