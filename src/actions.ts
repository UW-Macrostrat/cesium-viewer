type SetExaggeration = {
  type: "set-exaggeration";
  value: number;
};

enum DisplayQuality {
  High = "high",
  Low = "low"
}

type MapCoordinates = {
  latitude: number;
  longitude: number;
};

type QueryGlobe = {
  type: "query-globe";
  value: MapCoordinates & {
    zoom: number;
    map_id: string | null;
  };
};

type SetDisplayQuality = {
  type: "set-display-quality";
  value: DisplayQuality;
};

type SetShowInspector = {
  type: "set-show-inspector";
  value: boolean;
};

type GlobeAction =
  | SetExaggeration
  | SetDisplayQuality
  | SetShowInspector
  | QueryGlobe;

interface GlobeState {
  verticalExaggeration: number;
  displayQuality: DisplayQuality;
  showInspector: boolean;
}

const initialState: GlobeState = {
  verticalExaggeration: 1,
  displayQuality: DisplayQuality.High,
  showInspector: false
};

const reducer = (state: GlobeState = initialState, action: GlobeAction) => {
  switch (action.type) {
    case "set-exaggeration":
      return { ...state, verticalExaggeration: action.value };
    case "set-display-quality":
      return { ...state, displayQuality: action.value };
    case "set-show-inspector":
      return { ...state, showInspector: action.value };
    default:
      return state;
  }
};

interface GlobeStateProviderProps {
  store?: GlobeState;
  dispatch?: (action: GlobeAction) => void;
}

function GlobeStateProvider({ store, dispatch }: GlobeStateProviderProps) {}

export {
  reducer as globeReducer,
  GlobeAction,
  DisplayQuality,
  MapCoordinates,
  GlobeState
};
