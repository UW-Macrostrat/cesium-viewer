import MapboxTerrainProvider from "@macrostrat/cesium-martini";

const terrainProvider = new MapboxTerrainProvider({
  // @ts-ignore
  //accessToken: process.env.MAPBOX_API_TOKEN
  //format: 'webp',
  //highResolution: true,
  detailScalar: 4,
  //minimumErrorLevel: 20,
  //url: IonResource.fromAssetId("1"),
  requestVertexNormals: false,
  requestWaterMask: false,
  accessToken: process.env.MAPBOX_API_TOKEN,
  highResolution: false,
  skipOddLevels: false,
});

export { terrainProvider };
