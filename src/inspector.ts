import "cesiumSource/Widgets/widgets.css";
import { hyperStyled } from "@macrostrat/hyper";
import styles from "./main.styl";
const h = hyperStyled(styles);
import { useEffect } from "react";
import { useCesium } from "resium";
import { viewerCesiumInspectorMixin } from "cesium";

export function ViewInspector(props) {
  const { viewer } = useCesium();
  const { show = false } = props;
  useEffect(() => {
    // const el = document.querySelector(
    //   ".cesium-viewer-cesiumInspectorContainer"
    // ) as HTMLDivElement;
    if (viewer.cesiumInspector == null && show) {
      viewer.extend(viewerCesiumInspectorMixin);
    }
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
