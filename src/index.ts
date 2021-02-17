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
  FlyToInitialPosition,
} from "./position";
import { Fog, Globe, Scene } from "resium";
import { terrainProvider } from "./layers";

const CesiumView = (props) => {
  const {
    terrainExaggeration = 1.0,
    terrainProvider,
    children,
    showInspector,
    displayQuality = DisplayQuality.High,
    onClick,
    onViewChange,
  } = props;

  return h(
    GlobeViewer,
    {
      terrainProvider,
      // not sure why we have to do this...
      terrainExaggeration,
      highResolution: displayQuality == DisplayQuality.High,
      skyBox: false,
      showInspector,
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
      h(MapChangeTracker),
      children,
      h.if(onClick != null)(MapClickHandler, { onClick }),
      //h(SelectedPoint),
      //h(FlyToInitialPosition),
      h(CameraPositioner),
      h(Fog, { density: 1e-6 }),
    ]
  );
};

export { DisplayQuality };
export default CesiumView;
