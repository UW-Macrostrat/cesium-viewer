import MapboxTerrainProvider from "@macrostrat/cesium-martini";

const terrainProvider = new MapboxTerrainProvider({
  // @ts-ignore
  accessToken: process.env.MAPBOX_API_TOKEN,
  //format: 'webp',
  highResolution: true,
  detailScalar: 2
});

export { terrainProvider };
