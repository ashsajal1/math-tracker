import { createBrowserRouter } from "react-router-dom";
import Home from "./pages/home";
import RootLayout from "./pages/Layout";
import NotFound from "./pages/not-found";
import ErrorPage from "./pages/error";
import Stats from "./pages/stats";
import Settings from "./pages/settings";
import Profile from "./pages/profile";
import McqPage from "./pages/mcq";
import TimeStats from "./pages/time-stats";

export const router = createBrowserRouter([
  {
    path: "",
    element: <RootLayout />,
    errorElement: <ErrorPage />,
    children: [
      {
        path: "/",
        element: <Home />,
      },
      {
        path: "/profile",
        element: <Profile />,
      },
      {
        path: "/settings",
        element: <Settings />,
      },
      {
        path: "/stats",
        element: <Stats />,
      },
      {
        path: "/time-stats",
        element: <TimeStats />,
      },
      {
        path: "/mcq",
        element: <McqPage />,
      },
      {
        path: "*",
        element: <NotFound />,
      },
    ],
  },
]);
