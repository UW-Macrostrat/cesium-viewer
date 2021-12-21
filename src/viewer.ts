import { useEffect, useRef, ComponentProps } from "react";
import h from "@macrostrat/hyper";
import { Viewer, Scene, CesiumComponentRef } from "resium";
import NavigationMixin, { Units } from "@znemz/cesium-navigation";
import "@znemz/cesium-navigation/dist/index.css";

import { format } from "d3-format";
const Cesium: any = require("cesiumSource/Cesium");

const fmt = format(".0f");

type GlobeViewerProps = ComponentProps<typeof Viewer> & {
  highResolution: boolean;
  showInspector: boolean;
};

const mapProjectionMars = new Cesium.GeographicProjection(
  Cesium.Ellipsoid.MARSIAU2000
);
const globeMars = new Cesium.Globe(Cesium.Ellipsoid.MARSIAU2000);

const GlobeViewer = (props: GlobeViewerProps) => {
  const ref = useRef<CesiumComponentRef<Cesium.Viewer>>(null);
  const {
    highResolution = false,
    showInspector = false,
    children,
    ...rest
  } = props;

  let resolutionScale = 1;
  if (highResolution) {
    resolutionScale = Math.min(window.devicePixelRatio ?? 1, 2);
  }
  useEffect(() => {
    const { cesiumElement } = ref.current ?? {};
    if (cesiumElement == null) return;
    try {
      cesiumElement.scene;
    } catch {
      return;
    }
    cesiumElement.resolutionScale = resolutionScale;
    // Enable anti-aliasing
    cesiumElement.scene.postProcessStages.fxaa.enabled = true;
  }, [resolutionScale]);

  useEffect(() => {
    const { cesiumElement } = ref.current ?? {};
    if (cesiumElement == null) return;
    cesiumElement.extend(NavigationMixin, { distanceLabelFormatter: undefined });
    cesiumElement.scene.requestRenderMode = true;
    cesiumElement.scene.maximumRenderTimeChange = Infinity;
    cesiumElement.scene.screenSpaceCameraController.minimumZoomDistance = 2;
    //cesiumElement.scene.debugShowFramesPerSecond = true;
    //ref.current.cesiumElement.extend(Cesium.viewerCesiumInspectorMixin, {});
  }, [ref]);

  useEffect(() => {
    if (ref.current.cesiumElement == null) return;
    if (showInspector) {
      ref.current.cesiumElement.extend(Cesium.viewerCesiumInspectorMixin, {});
    }
  }, [showInspector]);

  //Cesium.Ellipsoid.MARSIAU2000
  const ellipsoid = undefined;

  return h(
    Viewer,
    {
      ref,
      full: true,
      baseLayerPicker: false,
      fullscreenButton: false,
      //mapProjection: new Cesium.GeographicProjection(ellipsoid),
      //globe: new Cesium.Globe(ellipsoid),
      homeButton: false,
      infoBox: false,
      navigationInstructionsInitiallyVisible: false,
      navigationHelpButton: true,
      scene3DOnly: true,
      vrButton: false,
      geocoder: false,
      resolutionScale: false,
      selectionIndicator: false,
      //skyAtmosphere: true,
      animation: false,
      timeline: false,
      imageryProvider: false,
      //shadows: true,
      ...rest,
    },
    children
  );
};

export { GlobeViewer };
