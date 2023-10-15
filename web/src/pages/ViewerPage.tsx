import { FC, useEffect, useRef } from "react";
import { useParams } from "react-router-dom";

import * as GaussianSplat3D from "../lib/gaussian-splat-3d.module";

export const ViewerPage: FC = () => {
  const { sessionId } = useParams();
  const viewerElement = useRef<HTMLDivElement>(null);

  // useEffect(() => {
  //   const cameraUp = [0, -1, -1.0];
  //   const initialCameraPos = [-3.3816, 1.96931, -1.7189];
  //   const initialCameraLookAt = [0.6091, 1.42099, 2.02511];
  //   const viewer = new GaussianSplat3D.Viewer(
  //     viewerElement.current as any,
  //     cameraUp,
  //     initialCameraPos,
  //     initialCameraLookAt
  //   );
  //   viewer.init();
  //   viewer
  //     .loadFile(`http://localhost:3000/splat/${sessionId}.splat`)
  //     .then(() => {
  //       viewer.start();
  //     });
  // }, [sessionId]);

  return <div ref={viewerElement} />;
};
