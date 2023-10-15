import "./App.css";

import { Flex } from "@chakra-ui/react";

import { Nav } from "./components/Nav";
import { MapPage } from "./pages/MapPage";

function App() {
  return (
    <>
      <Flex direction="column" h="100vh">
        <Nav />
        <MapPage />
      </Flex>
    </>
  );
}

export default App;
