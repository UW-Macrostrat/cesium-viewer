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
} from "./position";
import { Fog, Globe, Scene } from "resium";
import { terrainProvider, CTXLayer, MOLALayer, HillshadeLayer } from "./layers";

const CesiumView = (props) => {
  const { terrainExaggeration, displayQuality, terrainProvider } = props;

  //const ellipsoid = Cesium.Ellipsoid(3396190, 3396190, 3376200)

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
          //ellipsoid,
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
      //h(MOLALayer),
      //h(SatelliteLayer),
      //h(HillshadeLayer),
      //h(GeologyLayer, { alpha: 0.5 }),
      h(MapClickHandler),
      h(SelectedPoint),
      h(CameraPositioner),
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
