import { Button } from "@/components/ui/button";
import { useEffect } from "react";
import { Link } from "react-router-dom";

const LandingPage = () => {
  useEffect(() => {
    document.title = `SLU CCA - Landing Page`;
  }, []);

  return (
    <div>
      <div>This is the landing LandingPage</div>
      <Link to="/shows">
        <Button>View Shows</Button>
      </Link>
    </div>
  );
};

export default LandingPage;
