import { useEffect, useRef, ComponentProps } from "react";
import h from '@macrostrat/hyper'
import { Viewer, CesiumComponentRef } from "resium";
import NavigationMixin, {Units} from "@znemz/cesium-navigation"
import "@znemz/cesium-navigation/dist/index.css"
import {format} from 'd3-format'
const Cesium: any = require('cesiumSource/Cesium')

type GlobeViewerProps = ComponentProps<typeof Viewer> & {
  highResolution: boolean
}

const fmt = format(".0f")

const GlobeViewer = (props: GlobeViewerProps) => {
  const ref = useRef<CesiumComponentRef<Cesium.Viewer>>(null);
  const {highResolution, ...rest} = props

  let resolutionScale = 1
  if (highResolution) {
    resolutionScale = Math.min(window.devicePixelRatio ?? 1, 2)
  }
  useEffect(() => {
    const {cesiumElement} = ref.current ?? {}
    if (cesiumElement == null) return

    ref.current.cesiumElement.resolutionScale = resolutionScale

    // Enable anti-aliasing
    ref.current.cesiumElement.scene.postProcessStages.fxaa.enabled = true
  }, [resolutionScale]);

  useEffect(() => {
    const {cesiumElement} = ref.current ?? {}
    if (cesiumElement == null) return
    ref.current.cesiumElement.extend(NavigationMixin, {
      distanceLabelFormatter: (convertedDistance, units: Units): string => {
        // Convert for Mars (very janky)
        return fmt(convertedDistance * 0.5)+" "+units
      }
    })
    //ref.current.cesiumElement.extend(Cesium.viewerCesiumInspectorMixin)

  }, []);

  return h(Viewer, {
    ref,
    full: true,
    baseLayerPicker : false,
    fullscreenButton: false,
    homeButton: false,
    infoBox: false,
    navigationInstructionsInitiallyVisible: false,
    navigationHelpButton: true,
    scene3DOnly: true,
    vrButton: false,
    geocoder: false,
    resolutionScale: false,
    //skyAtmosphere: true,
    animation: false,
    timeline: false,
    imageryProvider: false,
    //shadows: true,
    ...rest
  })
};

export {GlobeViewer}
