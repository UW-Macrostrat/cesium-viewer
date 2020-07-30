import { useRef, ComponentProps} from 'react'
import {
  Credit,
  WebMapTileServiceImageryProvider,
  TileMapServiceImageryProvider,
  MapboxImageryProvider
} from "cesium"
import h from '@macrostrat/hyper'
import {ImageryLayer} from "resium"
import {useSelector} from 'react-redux'

type GeoLayerProps = Omit<ComponentProps<typeof ImageryLayer>,"imageryProvider">

const GeologyLayer = (props: GeoLayerProps)=>{

  const hasGeology = useSelector(state => state.update.mapHasBedrock)

  let geology = useRef(new WebMapTileServiceImageryProvider({
    url : 'https://macrostrat.org/api/v2/maps/burwell/emphasized/{TileMatrix}/{TileCol}/{TileRow}/tile.png',
    style : 'default',
    format : 'image/png',
    maximumLevel : 19,
    layer: "",
    tileMatrixSetID: "",
    credit : new Credit('UW-Madison, Macrostrat Lab'),
  }))

  if (!hasGeology) return null

  return h(ImageryLayer, {imageryProvider: geology.current, ...props})
}

const CTXLayer = (props: GeoLayerProps)=>{

  //const hasGeology = useSelector(state => state.update.mapHasBedrock)

  let ctx = useRef(new WebMapTileServiceImageryProvider({
    url : 'http://localhost:8080/ctx-global/{TileMatrix}/{TileCol}/{TileRow}.png',
    style : 'default',
    format : 'image/png',
    maximumLevel : 14,
    layer: "",
    tileMatrixSetID: "",
    credit : new Credit('Murray Lab / CTX '),
  }))

  //if (!hasGeology) return null

  return h(ImageryLayer, {imageryProvider: ctx.current, ...props})
}


const MOLALayer = (props: GeoLayerProps)=>{

  //const hasGeology = useSelector(state => state.update.mapHasBedrock)

  let ctx = useRef(new TileMapServiceImageryProvider({
    url : 'http://s3-eu-west-1.amazonaws.com/whereonmars.cartodb.net/mola-gray/{z}/{x}/{y}.png',
    style : 'default',
    format : 'image/png',
    maximumLevel : 12,
    layer: "",
    tileMatrixSetID: "",
    credit : new Credit('OpenPlanetaryMap/CARTO'),
  }))

  //if (!hasGeology) return null

  return h(ImageryLayer, {imageryProvider: ctx.current, ...props})
}




const SatelliteLayer = (props)=>{
  const hasSatellite = useSelector(state => state.update.mapHasSatellite)

  let format = '.webp'
  if (window.devicePixelRatio >= 2) format = '@2x.webp'

  let satellite = useRef(new MapboxImageryProvider({
    mapId : 'mapbox.satellite',
    maximumLevel : 19,
    format,
    accessToken: process.env.MAPBOX_API_TOKEN
  }))

  if (!hasSatellite) return null

  return h(ImageryLayer, {imageryProvider: satellite.current, ...props})
}

export {GeologyLayer, SatelliteLayer, CTXLayer, MOLALayer}
export * from './terrain'
