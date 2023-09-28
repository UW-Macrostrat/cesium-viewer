import { useEffect, useRef, ComponentProps } from "react";
import h from "@macrostrat/hyper";
import { CesiumComponentRef, useCesium, Viewer } from "resium";
import { Viewer as CesiumViewer } from "cesium";
import NavigationMixin, { Units } from "@znemz/cesium-navigation";

import { format } from "d3-format";
import * as Cesium from "cesium";

const fmt = format(".0f");

export type GlobeViewerProps = ComponentProps<typeof Viewer> & {
  highResolution: boolean;
  //showInspector: boolean;
  showIonLogo: boolean;
};

const mapProjectionMars = new Cesium.GeographicProjection(
  // @ts-ignore
  Cesium.Ellipsoid.MARSIAU2000
);
// @ts-ignore
const globeMars = new Cesium.Globe(Cesium.Ellipsoid.MARSIAU2000);

export function MapboxLogo() {
  const { cesiumWidget } = useCesium();
  useEffect(() => {
    const el = cesiumWidget?.creditContainer;
    const a = document.createElement("a");
    a.href = "https://www.mapbox.com/";
    a.target = "_blank";
    a.className = "mapbox-logo";
    el.prepend(a);
    return () => {
      const a = el.querySelector(".mapbox-logo");
      el.removeChild(a);
    };
  }, [cesiumWidget]);
  return null;
}

const GlobeViewer = (props: GlobeViewerProps) => {
  const ref = useRef<CesiumComponentRef<CesiumViewer>>(null);
  const {
    highResolution = false,
    //showInspector = false,
    showIonLogo = true,
    children,
    ...rest
  } = props;

  let resolutionScale = 1;
  if (highResolution) {
    resolutionScale = Math.min(window.devicePixelRatio ?? 1, 2);
  }

  console.log("Cesium ref", ref.current);

  useEffect(() => {
    const cesiumElement = ref.current?.cesiumElement;
    if (cesiumElement == null) return;

    console.log("Setting resolution scale");
    cesiumElement.resolutionScale = resolutionScale;
    // Enable anti-aliasing
    cesiumElement.scene.postProcessStages.fxaa.enabled = true;
  }, [resolutionScale]);

  useEffect(() => {
    const cesiumElement = ref.current?.cesiumElement;
    if (cesiumElement == null) return;
    console.log("Setting up cesium viewer");
    // The navigation mixin extremely slows down the viewer,
    // maybe because it's being added multiple times?
    // cesiumElement.extend(NavigationMixin, {
    //   distanceLabelFormatter: undefined,
    // });
    cesiumElement.scene.requestRenderMode = true;
    cesiumElement.scene.maximumRenderTimeChange = Infinity;
    cesiumElement.scene.screenSpaceCameraController.minimumZoomDistance = 2;
    //cesiumElement.scene.farToNearRatio = 0.1;
    //cesiumElement.scene.logarithmicDepthFarToNearRatio = 1e15;
    //cesiumElement.scene.debugShowFramesPerSecond = true;
    //ref.current.cesiumElement.extend(Cesium.viewerCesiumInspectorMixin, {});
  }, [ref.current]);

  // useEffect(() => {
  //   const viewer = ref.current.cesiumElement;
  //   if (viewer == null) return;
  //   if (showInspector) {
  //     viewer.extend(Cesium.viewerCesiumInspectorMixin, {});
  //   }
  // }, [showInspector]);

  useEffect(() => {
    const viewer = ref.current.cesiumElement;
    const el = viewer?.cesiumWidget.creditContainer.querySelector(
      ".cesium-credit-logoContainer"
    );
    //debugger;
    if (el == null) return;
    // @ts-ignore
    el.style.display = showIonLogo ? "inline" : "none";
  }, [ref, showIonLogo]);

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
      resolutionScale,
      selectionIndicator: false,
      //skyAtmosphere: true,
      animation: false,
      timeline: false,
      //imageryProvider: false,
      //shadows: true,
      // contextOptions: {
      //   requestWebgl2: true,
      // },
      //msaaSamples: 4,
      ...rest,
    },
    children
  );
};

export { GlobeViewer };
