/** Position interoperability with Mapbox GL and other systems */

import { CameraParams } from "./types";
import { MapPosition } from "@macrostrat/mapbox-utils";

const rangeAtZoom18 = 250; // ~ 250 m away

export function distanceForZoom(zoom: number) {
  /** Approximate scaling for zoom level 18 in order to translate between
   * zoom levels and view distances, for mapbox GL interoperability
   */
  const zfac = 18 - zoom;
  return rangeAtZoom18 * Math.pow(2, zfac);
};

export function zoomForDistance(distance: number) {
  return 18 - Math.log2(distance / rangeAtZoom18);
};

export function nadirCameraParams(
  x: number,
  y: number,
  z: number
): CameraParams {
  return {
    longitude: x,
    latitude: y,
    height: distanceForZoom(z),
    heading: 0,
    pitch: -90, // -90 is nadir
    roll: 0,
  };
}

export function translateCameraPosition(pos: MapPosition): CameraParams {
  /** Translate a Mapbox GL camera position into a Cesium frame. The most significant
   * change is to adjust the framework in which pitch is accounted for.
   */
  const { bearing = 0, pitch, altitude } = pos.camera;
  const { zoom } = pos.target ?? {};
  if (bearing == 0 && pitch == 0 && zoom != null) {
    const { lng, lat } = pos.target;
    return nadirCameraParams(lng, lat, zoom);
  } else {
    return {
      longitude: pos.camera.lng,
      latitude: pos.camera.lat,
      height: altitude,
      heading: bearing,
      pitch: -90 + (pitch ?? 0),
      roll: 0,
    };
  }
}