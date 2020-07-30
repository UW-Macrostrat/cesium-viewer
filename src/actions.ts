import {nadirCameraPosition} from "./position"
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
  value: CameraPosition
}

type GlobeAction =
  | SetExaggeration
  | SetDisplayQuality
  | SetCameraPosition
  | SetMapLayer;

interface GlobeState {
  verticalExaggeration: number;
  displayQuality: DisplayQuality;
  mapLayer: ActiveMapLayer;
  flyToProps: Props<typeof CameraFlyTo>;
}

const destination = nadirCameraPosition(77, 18.5, 10);

const initialState = {
  verticalExaggeration: 1,
  displayQuality: DisplayQuality.Low,
  mapLayer: ActiveMapLayer.CTX,
  flyToProps: {destination, duration: 0, once: true}
};

const reducer = (state: GlobeState = initialState, action: GlobeAction) => {
  switch (action.type) {
    case "set-exaggeration":
      return { ...state, verticalExaggeration: action.value };
    case "set-display-quality":
      return { ...state, displayQuality: action.value };
    case "set-camera-position":
      return { ...state, flyToProps: action.value };
    case "set-map-layer":
      return { ...state, activeMapLayer: action.value}
    default:
      return state;
  }
};

export { reducer, GlobeAction, DisplayQuality, ActiveMapLayer };
