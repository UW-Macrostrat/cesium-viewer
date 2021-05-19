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
  CameraParams
} from "./position";
import { Fog, Globe, Scene } from "resium";
import { terrainProvider } from "./layers";
import { CameraFlyToProps } from "resium/dist/types/src/CameraFlyTo/CameraFlyTo";

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
    flyTo,
    ...rest
  } = props;

  return h(
    GlobeViewer,
    {
      terrainProvider,
      // not sure why we have to do this...
      terrainExaggeration,
      highResolution: displayQuality == DisplayQuality.High,
      skyBox: false,
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
      h(CameraPositioner, flyTo),
      h(Fog, { density: 1e-6 })
    ]
  );
};

export { DisplayQuality };
export default CesiumView;
