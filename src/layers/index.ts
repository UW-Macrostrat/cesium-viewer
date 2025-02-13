import { useRef, ComponentProps } from "react";
import {
  Credit,
  WebMapTileServiceImageryProvider,
  MapboxImageryProvider,
} from "cesium";
import h from "@macrostrat/hyper";
import { ImageryLayer } from "resium";

type GeoLayerProps = Omit<
  ComponentProps<typeof ImageryLayer>,
  "imageryProvider"
>;

const GeologyLayer = (props: GeoLayerProps) => {
  let geology = useRef(
    new WebMapTileServiceImageryProvider({
      url: "https://macrostrat.org/api/v2/maps/burwell/emphasized/{TileMatrix}/{TileCol}/{TileRow}/tile.png",
      style: "default",
      format: "image/png",
      maximumLevel: 19,
      layer: "",
      tileMatrixSetID: "",
      credit: new Credit("UW-Madison, Macrostrat Lab"),
    })
  );

  return h(ImageryLayer, { imageryProvider: geology.current, ...props });
};

const SatelliteLayer = ({ accessToken, ...rest }) => {
  let format = ".webp";
  if (window.devicePixelRatio >= 2) format = "@2x.webp";

  let satellite = useRef(
    new MapboxImageryProvider({
      mapId: "mapbox.satellite",
      maximumLevel: 19,
      //format,
      accessToken,
    })
  );

  return h(ImageryLayer, { imageryProvider: satellite.current, ...rest });
};

export { GeologyLayer, SatelliteLayer };
export * from "./terrain";
