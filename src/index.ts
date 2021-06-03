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
  FlyToInitialPosition,
  CameraPositioner,
  CameraParams,
  flyToParams
} from "./position";
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
    terrainExaggeration = 1.00001,
    terrainProvider,
    children,
    showInspector,
    displayQuality = DisplayQuality.Low,
    onClick,
    onViewChange,
    initialPosition,
    flyTo,
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
      showInspector
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
            displayQuality == DisplayQuality.High ? 1.5 : 2
          //shadowMode: Cesium.ShadowMode.ENABLED
        },
        null
      ),
      h(Scene, { requestRenderMode: true }),
      h(MapChangeTracker, { onViewChange }),
      children,
      h.if(onClick != null)(MapClickHandler, { onClick }),
      //h(SelectedPoint),
      h(CameraPositioner, mapPosParams),
      h(Fog, { density: 5e-5 })
    ]
  );
};

export * from "./actions";
export { DisplayQuality };
export default CesiumView;
