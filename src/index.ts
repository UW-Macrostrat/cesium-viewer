import "cesiumSource/Widgets/widgets.css";
import * as Cesium from "cesiumSource/Cesium";
import { hyperStyled } from "@macrostrat/hyper";
import styles from "./main.styl";
const h = hyperStyled(styles);
import { GlobeViewer } from "./viewer";
import { DisplayQuality } from "./actions";
import {
  MapClickHandler,
  SelectedPoint,
  MapChangeTracker,
  CameraPositioner,
  CameraParams,
  flyToParams,
} from "./position";
import { ViewInspector } from "./inspector";
import { Fog, Globe, Scene } from "resium";
import { terrainProvider } from "./layers";
import { CameraFlyToProps } from "resium/dist/types/src/CameraFlyTo/CameraFlyTo";
import { useEffect, useState } from "react";
interface CesiumViewProps {
  displayQuality: DisplayQuality;
  flyTo: CameraFlyToProps;
}

const CesiumView = (props: CesiumViewProps) => {
  const {
    terrainExaggeration = 1,
    terrainProvider,
    children,
    showInspector,
    displayQuality = DisplayQuality.Low,
    onClick,
    onViewChange,
    initialPosition,
    flyTo,
    skyBox = false,
    ...rest
  } = props;

  const [mapPosParams, setMapPosParams] = useState(
    flyTo ?? flyToParams(initialPosition, { duration: 0, once: true })
  );

  useEffect(() => {
    console.log("Setting map position", flyTo);
    if (flyTo == null) return;
    setMapPosParams(flyTo);
  }, [flyTo]);

  return h(
    GlobeViewer,
    {
      terrainProvider,
      // not sure why we have to do this...
      terrainExaggeration,
      highResolution: displayQuality == DisplayQuality.High,
      skyBox,
      //skyBox: false,
      //terrainShadows: Cesium.ShadowMode.ENABLED
    },
    [
      h(
        Globe,
        {
          baseColor: Cesium.Color.LIGHTGRAY,
          enableLighting: false,
          showGroundAtmosphere: true,
          maximumScreenSpaceError:
            displayQuality == DisplayQuality.High ? 1.5 : 2,
          //shadowMode: Cesium.ShadowMode.ENABLED
        },
        null
      ),
      h(Scene, { requestRenderMode: true }),
      h(MapChangeTracker, { onViewChange }),
      children,
      h.if(onClick != null)(MapClickHandler, { onClick }),
      h(CameraPositioner, mapPosParams),
      h(Fog, { density: 5e-5 }),
      //h(FlyToInitialPosition),
      h(CameraPositioner),
      h(ViewInspector, { show: showInspector }),
    ]
  );
};

export { DisplayQuality };
export default CesiumView;
