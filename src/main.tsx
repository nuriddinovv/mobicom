import { createRoot } from "react-dom/client";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import Login from "./pages/Login";
import Protected from "./routes/Protected";
import Home from "./pages/Home";
import "./index.css";
import { Toaster } from "react-hot-toast";
import Clients from "./pages/Clients";
import ChartOfAccounts from "./pages/ChartOfAccounts";

const router = createBrowserRouter([
  { path: "/", element: <Login /> },
  {
    path: "/home",
    element: (
      <Protected>
        <Home />
      </Protected>
    ),
  },
  {
    path: "/clients",
    element: (
      <Protected>
        <Clients />
      </Protected>
    ),
  },
  {
    path: "/chart-of-accounts",
    element: (
      <Protected>
        <ChartOfAccounts />
      </Protected>
    ),
  },
  {
    path: "/accounting-transaction",
    element: (
      <Protected>
        <ChartOfAccounts />
      </Protected>
    ),
  },
]);

createRoot(document.getElementById("root")!).render(
  <>
    <Toaster position="top-center" reverseOrder={false} />{" "}
    <RouterProvider router={router} />
  </>
);
