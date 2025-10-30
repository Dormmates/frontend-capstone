import { BrowserRouter } from "react-router-dom";
import AppRoute from "./routes/AppRoute";
import AuthContextProvider from "./context/AuthContext";

const App = () => {
  return (
    <AuthContextProvider>
      <BrowserRouter>
        <AppRoute />
      </BrowserRouter>
    </AuthContextProvider>
  );
};

export default App;
