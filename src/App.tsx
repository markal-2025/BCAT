import { useAuth } from "./contexts/Auth";
import PrivateRoutes from "./routes/PrivateRoutes";
import PublicRoutes from "./routes/PublicRoutes";

function App() {
  const { user } = useAuth();

  return user ? <PrivateRoutes /> : <PublicRoutes />;
}

export default App;
