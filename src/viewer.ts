import { useEffect, useRef, ComponentProps } from "react";
import h from "@macrostrat/hyper";
import { Viewer, CesiumComponentRef } from "resium";
import NavigationMixin, { Units } from "@znemz/cesium-navigation";
import "@znemz/cesium-navigation/dist/index.css";

import { format } from "d3-format";
const Cesium: any = require("cesiumSource/Cesium");

const fmt = format(".0f");

type GlobeViewerProps = ComponentProps<typeof Viewer> & {
  highResolution: boolean;
  showInspector: boolean;
};

const GlobeViewer = (props: GlobeViewerProps) => {
  const ref = useRef<CesiumComponentRef<Cesium.Viewer>>(null);
  const { highResolution = false, showInspector = false, ...rest } = props;

  let resolutionScale = 1;
  if (highResolution) {
    resolutionScale = Math.min(window.devicePixelRatio ?? 1, 2);
  }
  useEffect(() => {
    const { cesiumElement } = ref.current ?? {};
    if (cesiumElement == null) return;

    ref.current.cesiumElement.resolutionScale = resolutionScale;

    // Enable anti-aliasing
    ref.current.cesiumElement.scene.postProcessStages.fxaa.enabled = true;
  }, [resolutionScale]);

  useEffect(() => {
    const { cesiumElement } = ref.current ?? {};
    if (cesiumElement == null) return;

    ref.current.cesiumElement.extend(NavigationMixin, {
      // distanceLabelFormatter: (convertedDistance, units: Units): string => {
      //   // Convert for Mars (very janky)
      //   let u = "";
      //   if (units == "meters") u = "m";
      //   if (units == "kilometers") u = "km";
      //   if (u == "km" && convertedDistance * 0.5 < 0.5) {
      //     return fmt(convertedDistance * 500) + " m";
      //   }
      //   return fmt(convertedDistance * 0.5) + " " + u;
      // }
    });
    ref.current.cesiumElement.scene.requestRenderMode = true;
    ref.current.cesiumElement.scene.maximumRenderTimeChange = Infinity;
    //ref.current.cesiumElement.scene.debugShowFramesPerSecond = true;
    //ref.current.cesiumElement.extend(Cesium.viewerCesiumInspectorMixin, {});
  }, []);

  useEffect(() => {
    if (ref.current.cesiumElement == null) return;
    if (showInspector) {
      ref.current.cesiumElement.extend(Cesium.viewerCesiumInspectorMixin, {});
    }
  }, [showInspector]);

  //Cesium.Ellipsoid.MARSIAU2000
  const ellipsoid = undefined;

  return h(Viewer, {
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
    ...rest
  });
};

export { GlobeViewer };
