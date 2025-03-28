import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.tsx";
import { BrowserRouter } from "react-router-dom";
import { Suspense } from "react";
import { ToastContainer, Slide } from "react-toastify";
import { AuthProvider } from "./contexts/Auth.tsx";
import "react-toastify/dist/ReactToastify.css";
import "sweetalert2/src/sweetalert2.scss";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <AuthProvider>
      <BrowserRouter>
        <Suspense fallback={"...loading"}>
          <App />
          <ToastContainer transition={Slide} />
        </Suspense>
      </BrowserRouter>
    </AuthProvider>
  </StrictMode>
);
