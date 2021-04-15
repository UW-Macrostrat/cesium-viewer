import { useEffect, useRef, ComponentProps } from "react";
import h from "@macrostrat/hyper";
import { Viewer, CesiumComponentRef } from "resium";
import NavigationMixin, { Units } from "@znemz/cesium-navigation";
import "@znemz/cesium-navigation/dist/index.css";
import { viewerCesiumInspectorMixin } from "cesiumSource/Cesium";

import { format } from "d3-format";
const Cesium: any = require("cesiumSource/Cesium");

const fmt = format(".0f");

type GlobeViewerProps = ComponentProps<typeof Viewer> & {
  highResolution: boolean;
  showInspector: boolean;
};

const GlobeViewer = (props: GlobeViewerProps) => {
  const ref = useRef<CesiumComponentRef<Cesium.Viewer>>(null);
  const { highResolution, showInspector = false, ...rest } = props;

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

    cesiumElement.extend(NavigationMixin, {
      distanceLabelFormatter: (convertedDistance, units: Units): string => {
        // Convert for Mars (very janky)
        let u = "";
        if (units == "meters") u = "m";
        if (units == "kilometers") u = "km";
        if (u == "km" && convertedDistance * 0.5 < 0.5) {
          return fmt(convertedDistance * 500) + " m";
        }
        return fmt(convertedDistance * 0.5) + " " + u;
      },
    });
    //ref.current.cesiumElement.extend(Cesium.viewerCesiumInspectorMixin)
  }, []);

  useEffect(() => {
    if (ref.current.cesiumElement == null) return;
    if (showInspector) {
      ref.current.cesiumElement.extend(viewerCesiumInspectorMixin);
    }
  }, [showInspector]);

  return h(Viewer, {
    ref,
    full: true,
    baseLayerPicker: false,
    fullscreenButton: false,
    mapProjection: new Cesium.GeographicProjection(
      Cesium.Ellipsoid.MARSIAU2000
    ),
    globe: new Cesium.Globe(Cesium.Ellipsoid.MARSIAU2000),
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
  });
};

export { GlobeViewer };
