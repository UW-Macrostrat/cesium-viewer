import "cesiumSource/Widgets/widgets.css";
import * as Cesium from "cesiumSource/Cesium";
import { hyperStyled } from "@macrostrat/hyper";
import styles from "./main.styl";
const h = hyperStyled(styles);
import { GlobeViewer } from "./viewer";
import { GeologyLayer, SatelliteLayer, HillshadeLayer } from "./layers";
import { DisplayQuality } from "./actions";
import {
  MapClickHandler,
  SelectedPoint,
  MapChangeTracker,
  FlyToInitialPosition
} from "./position";
import { Fog, Globe, Scene } from "resium";
import { terrainProvider } from "./layers";

const CesiumView = props => {
  const {
    terrainExaggeration,
    showInspector,
    displayQuality = DisplayQuality.High,
    onClick,
    onViewChange
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
          maximumScreenSpaceError: displayQuality == DisplayQuality.High ? 2 : 3
          //shadowMode: Cesium.ShadowMode.ENABLED
        },
        null
      ),
      h(Scene, { requestRenderMode: true }),
      h.if(onViewChange != null)(MapChangeTracker, { onChange: onViewChange }),
      h(SatelliteLayer),
      h(HillshadeLayer),
      h(GeologyLayer, { alpha: 0.5 }),
      h.if(onClick != null)(MapClickHandler, { onClick }),
      h(SelectedPoint),
      h(FlyToInitialPosition),
      h(Fog, { density: 1e-4 })
    ]
  );
};

export * from "./actions";
export default CesiumView;
