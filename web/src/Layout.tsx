import React, { FC } from "react";

import "./App.css";

import { Flex } from "@chakra-ui/react";
import { Outlet } from "react-router-dom";

import { Nav } from "./components/Nav";

export const Layout: FC = () => {
  return (
    <Flex direction="column" h="100vh">
      <Nav />
      <Outlet />
    </Flex>
  );
};
