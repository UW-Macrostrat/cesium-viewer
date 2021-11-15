import { useSelector, useDispatch } from "react-redux";
import { useCallback } from "react";
import * as Cesium from "cesiumSource/Cesium";
import h from "@macrostrat/hyper";
import {
  ScreenSpaceEventHandler,
  ScreenSpaceEvent,
  useCesium,
  Entity,
  CameraFlyTo,
  Camera,
} from "resium";
// import {
//   queryMap,
//   mapMoved
// } from '../../actions'

const MARS_RADIUS_SCALAR = 3390 / 6371;

type Position = { x: number; y: number; z: number };

interface CameraParams {
  longitude: number;
  latitude: number;
  height: number;
  heading: number;
  pitch: number;
  roll: number;
}

type ViewInfo = {
  camera: CameraParams;
  viewCenter: Position;
};

const rangeAtZoom18 = 250; // ~ 250 m away

const distanceForZoom = (zoom: number) => {
  const zfac = 18 - zoom;
  return rangeAtZoom18 * Math.pow(2, zfac);
};

const zoomForDistance = (distance: number) => {
  return 18 - Math.log2(distance / rangeAtZoom18);
};

const MapClickHandler = ({ onClick, pickFeatures = false }) => {
  const { viewer } = useCesium();
  const dispatch = useDispatch();
  if (onClick == null) return null;

  const clickPoint = (movement) => {
    const ray = viewer.camera.getPickRay(movement.position);
    var cartesian = viewer.scene.globe.pick(ray, viewer.scene);

    if (pickFeatures) {
      viewer.scene.imageryLayers
        ?.pickImageryLayerFeatures(ray, viewer.scene)
        ?.then((features) => dispatch({ type: "pick-features", features }));
    }
    //var cartesian = viewer.scene.pickPosition(movement.position);

    var cartographic = Cesium.Cartographic.fromCartesian(cartesian);
    const longitude = Cesium.Math.toDegrees(cartographic.longitude);
    const latitude = Cesium.Math.toDegrees(cartographic.latitude);
    //console.log(longitude, latitude);
    //addPoint(longitude, latitude)
    const zoom = 7; // we pin this to 7 for now
    onClick({ latitude, longitude, zoom });

    // We need to request a render in case we change something
    viewer.scene.requestRender();
  };

  return h(ScreenSpaceEventHandler, [
    h(ScreenSpaceEvent, {
      action: clickPoint,
      type: Cesium.ScreenSpaceEventType.LEFT_CLICK,
    }),
  ]);
};

type GeographicLocation = {
  latitude: number;
  longitude: number;
};

const SelectedPoint = (props: { point: GeographicLocation | null }) => {
  if (props.point == null) return null;
  const { latitude, longitude } = props.point;

  let position = Cesium.Cartesian3.fromDegrees(longitude, latitude);
  let pointGraphics = {
    color: Cesium.Color.DODGERBLUE,
    outlineColor: Cesium.Color.WHITE,
    outlineWidth: 2,
    pixelSize: 10,
    heightReference: Cesium.HeightReference.CLAMP_TO_GROUND,
  };

  return h(Entity, { position, point: pointGraphics });
};

function nadirCameraPosition(x: number, y: number, z: number) {
  return new Cesium.Cartesian3.fromDegrees(x, y, distanceForZoom(z));
}

const CameraPositioner = (props) => {
  const vals = useSelector((s) => s.flyToProps);
  if (vals == null) return null;
  return h(CameraFlyTo, { ...props, ...vals });
};

const getMapCenter = (viewer: Cesium.Viewer): Position => {
  const centerPx = new Cesium.Cartesian2(
    viewer.container.clientWidth / 2,
    viewer.container.clientHeight / 2
  );
  const pickRay = viewer.camera.getPickRay(centerPx);
  const pickPosition = viewer.scene.globe.pick(pickRay, viewer.scene);
  if (pickPosition == null) {
    console.log("Could not get pick position");
    return;
  }
  const cpos = Cesium.Cartographic.fromCartesian(pickPosition);
  const x = Cesium.Math.toDegrees(cpos.longitude);
  const y = Cesium.Math.toDegrees(cpos.latitude);

  const distance = Cesium.Cartesian3.distance(
    viewer.camera.position,
    pickPosition
  );
  const z = zoomForDistance(distance);

  return { x, y, z };
};

const getCameraPosition = (viewer: Cesium.Viewer): CameraParams => {
  const { camera } = viewer;
  const pos = Cesium.Cartographic.fromCartesian(camera.position);
  return {
    longitude: Cesium.Math.toDegrees(pos.longitude),
    latitude: Cesium.Math.toDegrees(pos.latitude),
    height: pos.height * MARS_RADIUS_SCALAR,
    heading: Cesium.Math.toDegrees(camera.heading),
    pitch: Cesium.Math.toDegrees(camera.pitch),
    roll: Cesium.Math.toDegrees(camera.roll),
  };
};

const getPosition = (viewer: Cesium.Viewer): ViewInfo => {
  const viewCenter = getMapCenter(viewer);
  const camera = getCameraPosition(viewer);
  return { camera, viewCenter };
};

function flyToParams(pos: CameraParams, rest: any = {}) {
  return {
    destination: Cesium.Cartesian3.fromDegrees(
      pos.longitude,
      pos.latitude,
      pos.height / MARS_RADIUS_SCALAR
    ),
    orientation: {
      heading: Cesium.Math.toRadians(pos.heading),
      pitch: Cesium.Math.toRadians(pos.pitch),
      roll: Cesium.Math.toRadians(pos.roll),
    },
    ...rest,
  };
}

const MapChangeTracker = (props) => {
  const { viewer } = useCesium();
  const dispatch = useDispatch();
  const onMoveEnd = () => {
    let params = getPosition(viewer);
    dispatch({ type: "set-camera-position", value: params });
  };
  // should also use onChange...
  return h(Camera, { onMoveEnd });
};

// We should be able to specify a unique viewpoint using 5 parameters as follows
// x=50&y=40&h=500&i=0&a=0
/* x: longitude,
   y: latitude,
   d: distance (object reference frame)
OR h: height above datum (absolute camera ref)
   e: elevation angle (0 is vertical, 90 is horizontal),
   a: azimuth, angle 0-360
   NOTE: this depends on terrain elevation so is unstable
   - Elevation and azimuth stay the same for both absolute camera position
     and position around an outcrop
   - Distance/height is the only relevant difference
*/

export {
  MapClickHandler,
  SelectedPoint,
  MapChangeTracker,
  CameraPositioner,
  nadirCameraPosition,
  CameraParams,
  ViewInfo,
  flyToParams,
  MARS_RADIUS_SCALAR,
  GeographicLocation,
};
