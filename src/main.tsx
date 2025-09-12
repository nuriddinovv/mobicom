import { createRoot } from "react-dom/client";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import Login from "./pages/Login";
import Protected from "./routes/Protected";
import Home from "./pages/Home";
import "./index.css";
import { Toaster } from "react-hot-toast";
import Clients from "./pages/Clients";
import ChartOfAccounts from "./pages/ChartOfAccounts";
import IncomingPayment from "./pages/IncomingPayments/IncomingPayment";
import AccountingTransaction from "./pages/AccountingTransaction";
import IncomingPaymentID from "./pages/IncomingPayments/IncomingPaymentID";
import AddIncomingPayment from "./pages/IncomingPayments/AddIncomingPayment";
import AddOutgoingPayment from "./pages/OutgoingPayments/AddOutgoingPayment";
import OutgoingPaymentID from "./pages/OutgoingPayments/OutgoingPaymentID";
import OutgoingPayment from "./pages/OutgoingPayments/OutgoingPayment";
import AccountingTransactionHistory from "./pages/AccountingTransactionHistory";
import Reconciliation from "./pages/Reconciliation";

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
        <AccountingTransaction />
      </Protected>
    ),
  },
  {
    path: "/accounting-transaction-history",
    element: (
      <Protected>
        <AccountingTransactionHistory />
      </Protected>
    ),
  },
  {
    path: "/incoming-payment",
    element: (
      <Protected>
        <IncomingPayment />
      </Protected>
    ),
  },
  {
    path: "/incoming-payment/:id",
    element: (
      <Protected>
        <IncomingPaymentID />
      </Protected>
    ),
  },
  {
    path: "/incoming-payment-add",
    element: (
      <Protected>
        <AddIncomingPayment />
      </Protected>
    ),
  },
  {
    path: "/outgoing-payment",
    element: (
      <Protected>
        <OutgoingPayment />
      </Protected>
    ),
  },
  {
    path: "/outgoing-payment/:id",
    element: (
      <Protected>
        <OutgoingPaymentID />
      </Protected>
    ),
  },
  {
    path: "/outgoing-payment-add",
    element: (
      <Protected>
        <AddOutgoingPayment />
      </Protected>
    ),
  },
  {
    path: "/reconciliation",
    element: (
      <Protected>
        <Reconciliation />
      </Protected>
    ),
  },
]);

createRoot(document.getElementById("root")!).render(
  <>
    <Toaster position="top-center" reverseOrder={false} />
    <RouterProvider router={router} />
  </>
);
