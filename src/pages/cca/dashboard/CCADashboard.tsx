import { ContentWrapper } from "@/components/layout/Wrapper";
import { useAuthContext } from "@/context/AuthContext";

const CCADashboard = () => {
  const { user } = useAuthContext();

  return (
    <ContentWrapper>
      <h1 className="text-3xl">
        Welcome, {user?.firstName} {user?.lastName}
      </h1>
    </ContentWrapper>
  );
};

export default CCADashboard;
