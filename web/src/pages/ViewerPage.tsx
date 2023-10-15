import { FC, useEffect, useRef } from "react";
import { useParams } from "react-router-dom";

import * as GaussianSplat3D from "../lib/gaussian-splat-3d.module";

export const ViewerPage: FC = () => {
  const { sessionId } = useParams();
  const viewerElement = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let stillMounted = true;
    const viewer = new GaussianSplat3D.Viewer(
      // rootElement
      viewerElement.current as any,
      // cameraUp
      [0, -1, -0.17],
      // initialCameraPos
      [-5, -1, -1],
      // initialCameraLookAt
      // {x: -4.999999999999983, y: -0.9999999999999978, z: -0.9999999999999974}
      [-5, -1, 0],
      null,
      10
    );
    window.viewer = viewer;
    viewer.init();
    viewer.loadFile(`/api/splat/${sessionId}.splat`).then(() => {
      if (!stillMounted) return;
      viewer.start();
    });

    return () => {
      stillMounted = false;
      viewer.loadingSpinner?.hide();
      viewer.stop();
    };
  }, []);

  return <div style={{ height: "100%", width: "100%" }} ref={viewerElement} />;
};
