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
} from "./position";
import { Fog, Globe, Scene } from "resium";
import { terrainProvider, CTXLayer } from "./layers";

const CesiumView = (props) => {
  const { terrainExaggeration, displayQuality, terrainProvider } = props;

  return h(
    GlobeViewer,
    {
      terrainProvider,
      // not sure why we have to do this...
      terrainExaggeration,
      highResolution: displayQuality,
      skyBox: false,
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
      h(CTXLayer),
      //h(SatelliteLayer),
      //h(HillshadeLayer),
      //h(GeologyLayer, { alpha: 0.5 }),
      h(MapClickHandler),
      h(SelectedPoint),
      h(FlyToInitialPosition),
      h(Fog, { density: 1e-6 }),
    ]
  );
};

CesiumView.defaultProps = {
  terrainProvider,
  terrainExaggeration: 1.0,
  displayQuality: DisplayQuality.Low,
};

export {DisplayQuality}
export default CesiumView;
