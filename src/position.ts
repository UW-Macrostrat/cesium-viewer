import { useSelector } from "react-redux";
import * as Cesium from "cesiumSource/Cesium";
import h from "@macrostrat/hyper";
import { MapCoordinates } from "./actions";
import {
  ScreenSpaceEventHandler,
  ScreenSpaceEvent,
  useCesium,
  Entity,
  CameraFlyTo,
  Camera
} from "resium";

const rangeAtZoom18 = 250; // ~ 250 m away

const distanceForZoom = (zoom: number) => {
  const zfac = 18 - zoom;
  return rangeAtZoom18 * Math.pow(2, zfac);
};

const zoomForDistance = (distance: number) => {
  return 18 - Math.log2(distance / rangeAtZoom18);
};

const MapClickHandler = ({ onClick }) => {
  const { viewer } = useCesium();
  if (viewer == null) return;

  const clickPoint = movement => {
    const ray = viewer.camera.getPickRay(movement.position);
    var cartesian = viewer.scene.globe.pick(ray, viewer.scene);
    //var cartesian = viewer.scene.pickPosition(movement.position);

    var cartographic = Cesium.Cartographic.fromCartesian(cartesian);
    const longitude = Cesium.Math.toDegrees(cartographic.longitude);
    const latitude = Cesium.Math.toDegrees(cartographic.latitude);
    //console.log(longitude, latitude);
    //addPoint(longitude, latitude)
    const zoom = 7; // we pin this to 7 for now
    onClick({ latitude, longitude, zoom });
  };

  return h(ScreenSpaceEventHandler, [
    h(ScreenSpaceEvent, {
      action: clickPoint,
      type: Cesium.ScreenSpaceEventType.LEFT_CLICK
    })
  ]);
};

const SelectedPoint = ({ longitude, latitude }: MapCoordinates) => {
  let position = Cesium.Cartesian3.fromDegrees(
    // TODO: Numbers should be guaranteed in typescript
    longitude,
    latitude
    // need to also get height
  );
  let pointGraphics = {
    color: Cesium.Color.DODGERBLUE,
    outlineColor: Cesium.Color.WHITE,
    outlineWidth: 2,
    pixelSize: 10,
    heightReference: Cesium.HeightReference.CLAMP_TO_GROUND
  };

  return h(Entity, { position, point: pointGraphics });
};

const FlyToInitialPosition = props => {
  const mapOpts = useSelector(s => s.update);
  const mpos = mapOpts?.mapXYZ;
  if (mpos == null) return null;

  // Make sure we deactivate this once initial position is reached
  //const currentPos = useState(null)

  const zoom = parseFloat(mpos.z);
  const z = distanceForZoom(zoom);

  const destination = new Cesium.Cartesian3.fromDegrees(
    parseFloat(mpos.x),
    parseFloat(mpos.y),
    z
  );

  return h(CameraFlyTo, { destination, duration: 0, once: true });
};

const getMapCenter = (viewer: Cesium.Viewer) => {
  const centerPx = new Cesium.Cartesian2(
    viewer.container.clientWidth / 2,
    viewer.container.clientHeight / 2
  );
  const pickRay = viewer.camera.getPickRay(centerPx);
  const pickPosition = viewer.scene.globe.pick(pickRay, viewer.scene);
  if (pickPosition == null) return;
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

const MapChangeTracker = (props: { onChange(cpos: any): void }) => {
  const { viewer } = useCesium();
  const onChange = () => {
    let cpos = getMapCenter(viewer);
    if (cpos == null) return;
    props.onChange(cpos);
  };
  return h(Camera, { onChange, onMoveEnd: onChange });
};

export {
  MapClickHandler,
  SelectedPoint,
  MapChangeTracker,
  FlyToInitialPosition
};
