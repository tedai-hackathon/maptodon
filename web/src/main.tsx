import * as React from "react";
import { ChakraProvider } from "@chakra-ui/react";
import * as ReactDOM from "react-dom/client";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { Layout } from "./Layout";
import { MapPage } from "./pages/MapPage";
import { ViewerPage } from "./pages/ViewerPage";

const rootElement = document.getElementById("root")!;

const router = createBrowserRouter([
  {
    element: <Layout />,
    children: [
      {
        path: "/",
        element: <MapPage />,
      },
      {
        path: "/viewer/:sessionId",
        element: <ViewerPage />,
      },
    ],
  },
]);

ReactDOM.createRoot(rootElement).render(
  <React.StrictMode>
    <ChakraProvider>
      <RouterProvider router={router} />
    </ChakraProvider>
  </React.StrictMode>
);
