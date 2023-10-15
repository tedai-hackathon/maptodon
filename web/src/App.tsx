import "./App.css";

import { Flex } from "@chakra-ui/react";

import { Nav } from "./components/Nav";
import { MapPage } from "./pages/MapPage";

import * as GaussianSplat3D from "./lib/gaussian-splat-3d.module.js";
import { useEffect } from "react";

function App() {
  console.log(GaussianSplat3D);

  useEffect(() => {
    /*
    const plyLoader = new GaussianSplat3D.PlyLoader();
    plyLoader
      .loadFromFile("http://localhost:5173/down.ply")
      .then((splatBuffer) => {
        new GaussianSplat3D.SplatLoader(splatBuffer).saveToFile(
          "converted_file.splat"
        );
      });
      */
  }, []);
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
