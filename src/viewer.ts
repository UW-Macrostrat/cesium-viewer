import { useEffect, useRef, ComponentProps } from "react";
import h from "@macrostrat/hyper";
import { CesiumComponentRef, useCesium, Viewer } from "resium";
import {Viewer as CesiumViewer, viewerCesiumInspectorMixin} from "cesium";
import cesiumNavigationMixin, { Units } from "@znemz/cesium-navigation";
import * as Cesium from "cesium";

import { format } from "d3-format";

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
    maximumScreenSpaceError = 2,
    children,
    ...rest
  } = props;

  console.log("Cesium ref", ref.current);

  useEffect(() => {
    const cesiumElement = ref.current?.cesiumElement;
    if (cesiumElement == null) return;
    // The navigation mixin extremely slows down the viewer,
    // maybe because it's being added multiple times?
    // cesiumElement.extend(NavigationMixin, {
    //   distanceLabelFormatter: undefined,
    // });

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
    if (el == null) return;
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
      //resolutionScale,
      selectionIndicator: false,
      //skyAtmosphere: true,
      animation: false,
      timeline: false,
      imageryProvider: false,
      //maximumScreenSpaceError: screenSpaceError,
      //shadows: true,
      // contextOptions: {
      //   requestWebgl2: true,
      // },
      //msaaSamples: 4,
      ...rest,
    },
    [
      children,
      h(NavigationMixin),
      h(SceneParameterManager, { highResolution, maximumScreenSpaceError }),
    ]
  );
};

function NavigationMixin(props) {
  const {viewer} = useCesium();
  const { show = true } = props;
  const isAdded = useRef(false);
  useEffect(() => {
    if (viewer == null || isAdded.current) return;
    // The navigation mixin extremely slows down the viewer,
    // maybe because it's being added multiple times?
    viewer.extend(cesiumNavigationMixin, {
      distanceLabelFormatter: undefined,
    });
    isAdded.current = true;
  }, [viewer, show]);

  return null;
}

function SceneParameterManager({
  highResolution = false,
  maximumScreenSpaceError = 2,
  farToNearRatio = 100,
}) {
  const { viewer } = useCesium();

  console.log(highResolution, maximumScreenSpaceError, farToNearRatio);

  useEffect(() => {
    if (viewer == null) return;
    const pixelRatio = window.devicePixelRatio ?? 1;

    viewer.scene.requestRenderMode = true;
    viewer.scene.maximumRenderTimeChange = Infinity;
    viewer.scene.screenSpaceCameraController.minimumZoomDistance = 2;

    viewer.scene.farToNearRatio = farToNearRatio;
    //viewer.scene.logarithmicDepthFarToNearRatio = 1e15;

    let screenSpaceError = maximumScreenSpaceError;
    let devicePixelRatio = window.devicePixelRatio ?? 1;
    let resolutionScale = 1;
    if (highResolution) {
      screenSpaceError *= devicePixelRatio * 0.75;
      resolutionScale = devicePixelRatio;
    }

    viewer.scene.globe.maximumScreenSpaceError = screenSpaceError;

    viewer.resolutionScale = resolutionScale;
    // Enable anti-aliasing
    viewer.scene.postProcessStages.fxaa.enabled = true;
  }, [highResolution, viewer, farToNearRatio, maximumScreenSpaceError]);
  return null;
}

export { GlobeViewer };
