import {nadirCameraPosition, ViewParams, CameraParams, flyToParams} from "./position"
import {Props} from 'react'
import {CameraFlyTo} from "resium"

enum ActiveMapLayer {
  CTX,
  Hillshade
}

type SetExaggeration = {
  type: "set-exaggeration";
  value: number;
};

type SetMapLayer = {
  type: "set-map-layer";
  value: ActiveMapLayer
}

enum DisplayQuality {
  High = "high",
  Low = "low",
}

type SetDisplayQuality = {
  type: "set-display-quality";
  value: DisplayQuality;
};

type SetCameraPosition = {
  type: "set-camera-position";
  value: ViewParams
}

type FlyToPosition = {
  type: "fly-to-position";
  value: CameraParams
  extra?: object
}

type FlyTo = {
  type: "fly-to";
  value: Props<typeof CameraFlyTo>
}

type FlyToNamedLocation = {
  type: "fly-to-named-location";
  value: string
  extra?: object
}

type GlobeAction =
  | SetExaggeration
  | SetDisplayQuality
  | SetCameraPosition
  | SetMapLayer
  | FlyToPosition
  | FlyToNamedLocation
  | FlyTo;

interface GlobeState {
  verticalExaggeration: number;
  displayQuality: DisplayQuality;
  mapLayer: ActiveMapLayer;
  position: ViewParams|null;
  flyToProps: Props<typeof CameraFlyTo>;
  namedLocation: string|null;
}

const destination = nadirCameraPosition(77.433, 18.411, 9);

const initialState = {
  verticalExaggeration: 1,
  displayQuality: DisplayQuality.Low,
  mapLayer: ActiveMapLayer.CTX,
  position: null,
  flyToProps: {destination, duration: 0, once: true},
  namedLocation: null
};

const reducer = (state: GlobeState = initialState, action: GlobeAction) => {
  switch (action.type) {
    case "set-exaggeration":
      return { ...state, verticalExaggeration: action.value };
    case "set-display-quality":
      return { ...state, displayQuality: action.value };
    case "fly-to-position": {
      const value = flyToParams(action.value, action.extra)
      return reducer(state, {type: 'fly-to', value});
    }
    case 'fly-to-named-location':
      const {value, extra} = action
      if (value == state.namedLocation) return
      const pos = action.positions[value]
      return reducer(state, {type: "fly-to-position", value: pos, extra})
    case 'fly-to':
      return { ...state, flyToProps: action.value };
    case "set-camera-position":
      return { ...state, position: action.value };
    case "set-map-layer":
      return { ...state, activeMapLayer: action.value}
    default:
      return state;
  }
};

export { reducer, GlobeAction, DisplayQuality, ActiveMapLayer };
