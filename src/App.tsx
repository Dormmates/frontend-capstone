import { BrowserRouter } from "react-router-dom";
import AppRoute from "./routes/AppRoute";
import AuthContextProvider from "./context/AuthContext";
import ShowSchedulesProvider from "./context/ShowSchedulesContext";

const App = () => {
  return (
    <ShowSchedulesProvider>
      <AuthContextProvider>
        <BrowserRouter>
          <AppRoute />
        </BrowserRouter>
      </AuthContextProvider>
    </ShowSchedulesProvider>
  );
};

export default App;
