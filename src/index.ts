//import * as Cesium from "cesiumSource/Cesium";
import h from "@macrostrat/hyper";
import { GlobeViewer, MapboxLogo } from "./viewer";
import { DisplayQuality } from "./actions";
import {
  MapClickHandler,
  SelectedPoint,
  CameraPositioner,
  CameraParams,
  flyToParams,
  MapChangeTrackerProps,
  ViewInfo,
} from "./position";
import { ViewInspector, TileLoadWatcher, Wireframe } from "./inspector";
import { Fog, Globe, Scene } from "resium";
import { CameraFlyToProps } from "resium/src/CameraFlyTo/CameraFlyTo";
import { useEffect, useState } from "react";
import { Color, TerrainProvider } from "cesium";
import "./main.module.sass";

type CesiumViewProps = Partial<MapChangeTrackerProps> &
  React.ComponentProps<typeof GlobeViewer> & {
    displayQuality: DisplayQuality;
    flyTo: CameraFlyToProps;
    initialPosition: CameraParams;
    showInspector?: boolean;
    showWireframe?: boolean;
    terrainExaggeration?: number;
    terrainProvider?: TerrainProvider;
    fogDensity?: number;
    onTileLoadEvent?: (tilesLoaded: number) => void;
    onViewChange?: (view: ViewInfo) => void;
    children?: React.ReactNode;
    onClick?: (selectedPoint: any) => void;
  };

const defaultPosition: CameraParams = {
  longitude: 0,
  latitude: 0,
  height: 540000,
  heading: 0,
  pitch: -90,
  roll: 0,
};

const screenSpaceErrors = {
  [DisplayQuality.Low]: 4,
  [DisplayQuality.High]: 2,
  [DisplayQuality.Ultra]: 1,
};

const CesiumView = (props: CesiumViewProps) => {
  const {
    terrainExaggeration = 1,
    terrainProvider,
    children,
    showInspector,
    showWireframe,
    displayQuality = DisplayQuality.Low,
    onClick,
    onViewChange,
    onTileLoadEvent,
    initialPosition,
    flyTo,
    fogDensity = 5e-4,
    skyBox = false,
    viewAngle,
    ...rest
  } = props;

  const [mapPosParams, setMapPosParams] = useState(
    flyTo ?? flyToParams(initialPosition, { duration: 0, once: true })
  );

  useEffect(() => {
    console.log("Setting globe position", flyTo);
    if (flyTo == null) return;
    setMapPosParams(flyTo);
  }, [flyTo]);

  return h(
    GlobeViewer,
    {
      terrainProvider,
      // not sure why we have to do this...
      terrainExaggeration,
      maximumScreenSpaceError: screenSpaceErrors[displayQuality],
      skyBox,
      //skyBox: false,
      //terrainShadows: Cesium.ShadowMode.ENABLED
      ...rest,
    },
    [
      h(
        Globe,
        {
          baseColor: Color.LIGHTGRAY,
          enableLighting: false,
          showGroundAtmosphere: true,
          //highResolution: displayQuality != DisplayQuality.Low,
          //shadowMode: Cesium.ShadowMode.ENABLED
        },
        null
      ),
      h(Scene, { requestRenderMode: true }),
      h(CameraPositioner, { ...mapPosParams, onViewChange, viewAngle }),
      children,
      h.if(onClick != null)(MapClickHandler, { onClick }),
      h.if(showWireframe != null)(Wireframe, { enabled: showWireframe }),
      h(Fog, { density: fogDensity }),
      h.if(onTileLoadEvent != null)(TileLoadWatcher, {
        onLoadEvent: onTileLoadEvent,
      }),
      h(ViewInspector, { show: showInspector }),
    ]
  );
};

export * from "./position";
export * from "./actions";
export * from "./settings-panel";
export * from "./query-string";
export * from "./inspector";
export * from "./layers";
export { DisplayQuality, MapboxLogo };
export default CesiumView;
