import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const LandingPage = () => {
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
