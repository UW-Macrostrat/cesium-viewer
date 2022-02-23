import {
  nadirCameraParams,
  ViewInfo,
  CameraParams,
  flyToParams,
} from "./position";
import { Props } from "react";
import { CameraFlyTo } from "resium";

enum ActiveMapLayer {
  CTX = "ctx",
  Hillshade = "hillshade",
  OpenPlanetaryHillshade = "open-planetary-hillshade",
  VikingMDIM = "viking-mdim",
}

interface CameraParamsExt {
  camera?: CameraParams;
  mapLayer?: ActiveMapLayer;
}

type ViewParams = CameraParams | CameraParamsExt;

type SetExaggeration = {
  type: "set-exaggeration";
  value: number;
};

type SetMapLayer = {
  type: "set-map-layer";
  value: ActiveMapLayer;
};

enum DisplayQuality {
  High = "high",
  Low = "low",
  Ultra = "ultra",
}

type QueryGlobe = {
  type: "query-globe";
  value: {
    latitude: number;
    longitude: number;
    zoom: number;
    map_id: string | null;
  };
};

type CancelQuery = {
  type: "cancel-query";
};

type SetDisplayQuality = {
  type: "set-display-quality";
  value: DisplayQuality;
};

type SetCameraPosition = {
  type: "set-camera-position";
  value: ViewParams;
};

type FlyToPosition = {
  type: "fly-to-position";
  value: ViewParams;
  extra?: object;
};

type FlyTo = {
  type: "fly-to";
  value: Props<typeof CameraFlyTo>;
};

type FlyToNamedLocation = {
  type: "fly-to-named-location";
  value: string;
  extra?: object;
};

type SetShowInspector = {
  type: "set-show-inspector";
  value: boolean;
};

type PickFeatures = {
  type: "pick-features";
  features: any;
};

type GlobeAction =
  | PickFeatures
  | SetExaggeration
  | SetDisplayQuality
  | SetCameraPosition
  | SetShowInspector
  | SetMapLayer
  | FlyToPosition
  | FlyToNamedLocation
  | FlyTo;

interface Positions {
  [key: string]: CameraParams;
}

interface GlobeState {
  positions: Positions;
  verticalExaggeration: number;
  displayQuality: DisplayQuality;
  mapLayer: ActiveMapLayer;
  position: ViewInfo | null;
  flyToProps: Props<typeof CameraFlyTo>;
  namedLocation: string | null;
}

const destination = nadirCameraParams(77.433, 18.411, 9);

const initialState: GlobeState = {
  positions: {},
  verticalExaggeration: 1,
  displayQuality: DisplayQuality.Low,
  mapLayer: ActiveMapLayer.CTX,
  position: null,
  // @ts-ignore
  flyToProps: { destination, duration: 0, once: true },
  namedLocation: null,
};

const createInitialState = (args: Partial<GlobeState> = {}) => {
  let state = { ...initialState, ...args };
  return state;
};

function isCameraParams(v: ViewParams): v is CameraParams {
  // @ts-ignore
  return v.camera === undefined && v.mapLayer === undefined;
}

const expandViewChange = (val: ViewParams): CameraParamsExt => {
  if (isCameraParams(val)) {
    return { camera: val };
  } else {
    return val;
  }
};

const reducer = (state: GlobeState = initialState, action: GlobeAction) => {
  switch (action.type) {
    case "set-exaggeration":
      return { ...state, verticalExaggeration: action.value };
    case "set-display-quality":
      return { ...state, displayQuality: action.value };
    case "fly-to-position": {
      const { camera, mapLayer } = expandViewChange(action.value);
      let newState: GlobeState = state;
      newState["mapLayer"] = mapLayer ?? initialState.mapLayer;
      if (camera != null) {
        // @ts-ignore
        const value = flyToParams(camera, camera.extra);
        newState = reducer(state, { type: "fly-to", value });
      }
      return newState;
    }
    case "fly-to-named-location":
      const { value, extra } = action;
      if (value == state.namedLocation) return state;
      const pos = state.positions[value];
      if (pos == null) return state;
      let newState = reducer(state, { type: "fly-to-position", value: pos });
      newState.namedLocation = value;
      return newState;
    case "fly-to":
      return { ...state, flyToProps: action.value };
    case "set-camera-position":
      return { ...state, position: action.value };
    case "set-map-layer":
      return { ...state, mapLayer: action.value };
    case "set-show-inspector":
      return { ...state, showInspector: action.value };
    default:
      return state;
  }
};

export {
  reducer,
  GlobeAction,
  GlobeState,
  DisplayQuality,
  ActiveMapLayer,
  createInitialState,
};
