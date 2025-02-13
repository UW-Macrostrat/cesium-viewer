import hyper from "@macrostrat/hyper";
import TerrainProvider from "@macrostrat/cesium-martini";
import CesiumViewer, {
  SatelliteLayer,
} from "@macrostrat/cesium-viewer";

//import "@znemz/cesium-navigation/dist/index.css";
import "cesium/Source/Widgets/widgets.css";
import styles from "./main.module.scss";
import "./main.css"
import {MapboxLogo} from "../../src";


const accessToken = import.meta.env.VITE_MAPBOX_API_TOKEN;

const h = hyper.styled(styles);

const terrainProvider = new TerrainProvider({
    hasVertexNormals: false,
    hasWaterMask: false,
    accessToken,
    highResolution: true,
    credit: "Mapbox",
  })


export function App() {

  return h("div.globe-page", [
    h("div.map-container", [
      h("div.cesium-panel", [
        h(CesiumViewer, {
          accessToken,
          terrainProvider,
          showInspector: true,
          showIonLogo: false,
          flyTo: null
        }, [
          h(SatelliteLayer, { accessToken }),
          h(MapboxLogo)
        ]),
      ]),
    ]),
  ]);
}
