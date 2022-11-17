//import "cesium/Source/Widgets/widgets.css";
import { useEffect, useCallback } from "react";
import { useCesium } from "resium";
import { viewerCesiumInspectorMixin } from "cesium";

export function ViewInspector(props) {
  const { viewer } = useCesium();
  const { show = false } = props;
  useEffect(() => {
    // @ts-ignore
    if (viewer.cesiumInspector == null && show) {
      viewer.extend(viewerCesiumInspectorMixin);
    }
    // @ts-ignore
    const el = viewer.cesiumInspector;
    if (el == null) return;

    if (show) {
      el._element.style.display = "";
    } else {
      el._element.style.display = "none";
    }
  }, [viewer, show]);

  return null;
}

type TileLoadStart = { type: "start"; count: number };
type TileLoadProgress = { type: "progress"; count: number };
type TileLoadFinished = { type: "finish" };

export type TileLoadEvent = TileLoadStart | TileLoadProgress | TileLoadFinished;

export function TileLoadWatcher({ onLoadEvent, onTilesLoaded = null }) {
  const { viewer } = useCesium();
  //const [tilesLoaded, setTilesLoaded] = useState(true);
  const listener = useCallback(
    (queuedTileCount) => {
      onLoadEvent(queuedTileCount);
      if (viewer.scene.globe.tilesLoaded) {
        onTilesLoaded?.();
      }
    },
    [viewer, onTilesLoaded]
  );

  useEffect(() => {
    const tlp = viewer.scene.globe.tileLoadProgressEvent;
    tlp.addEventListener(listener);
    return () => {
      tlp.removeEventListener(listener);
    };
  }, [listener]);

  return null;
}

export function Wireframe({ enabled = false }) {
  const { viewer } = useCesium();
  useEffect(() => {
    // @ts-ignore
    viewer.scene.globe._surface._tileProvider._debug.wireframe = enabled;
    viewer.scene.requestRender();
  }, [viewer, enabled]);
  return null;
}
