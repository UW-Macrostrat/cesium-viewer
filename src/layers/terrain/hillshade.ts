import { useRef } from "react";
import { MapboxImageryProvider } from "cesium";
import h from "@macrostrat/hyper";
import { ImageryLayer } from "resium";
import { useSelector } from "react-redux";
import REGL from "regl";
import { vec3 } from "gl-matrix";
import { terrainProvider } from "./provider";
// https://wwwtyro.net/2019/03/21/advanced-map-shading.html

type Img = HTMLImageElement | HTMLCanvasElement;

interface CanvasContext {
  canvas: HTMLCanvasElement;
  context: CanvasRenderingContext2D;
  regl: REGL.Regl;
}

function createRunner() {
  const canvas = document.createElement("canvas");
  canvas.width = 256;
  canvas.height = 256;

  const regl = REGL({
    canvas,
    extensions: ["OES_texture_float", "WEBGL_color_buffer_float"]
  });

  const resolution = [256, 256];
  const viewport = { x: 0, y: 0, width: 256, height: 256 };
  const cmdProcessElevation = regl({
    vert: `
        precision highp float;
        attribute vec2 position;

        void main() {
          gl_Position = vec4(position, 0, 1);
        }
      `,
    frag: `
        precision highp float;

        uniform sampler2D tElevation;
        uniform vec2 resolution;
        uniform float elevationScale;

        void main() {
          // Sample the terrain-rgb tile at the current fragment location.
          vec3 rgb = texture2D(tElevation, gl_FragCoord.xy/resolution).rgb;

          // Convert the red, green, and blue channels into an elevation.
          float e = -10000.0 + ((rgb.r * 255.0 * 256.0 * 256.0 + rgb.g * 255.0 * 256.0 + rgb.b * 255.0) * 0.1);

          // Scale the elevation and write it out.
          gl_FragColor = vec4(vec3(e * elevationScale), 1.0);
        }
      `,
    attributes: {
      position: [-1, -1, 1, -1, 1, 1, -1, -1, 1, 1, -1, 1]
    },
    uniforms: {
      tElevation: regl.prop("image"),
      elevationScale: regl.prop("elevationScale"),
      resolution
    },
    viewport,
    count: 6,
    framebuffer: regl.prop("elevation")
  });

  const cmdNormal = regl({
    vert: `
        precision highp float;
        attribute vec2 position;

        void main() {
          gl_Position = vec4(position, 0, 1);
        }
      `,
    frag: `
        precision highp float;

        uniform sampler2D tElevation;
        uniform vec2 resolution;
        uniform float pixelScale;

        void main() {
          vec2 dr = 1.0/resolution;
          vec2 cx = gl_FragCoord.xy + vec2(1.0, 0.0);
          vec2 cy = gl_FragCoord.xy + vec2(0.0, 1.0);
          float p0 = texture2D(tElevation, dr * (gl_FragCoord.xy + vec2(0.0, 0.0))).r;
          float px = texture2D(tElevation, dr * cx).r;
          float py = texture2D(tElevation, dr * cy).r;

          vec3 dx = vec3(pixelScale, 0.0, px - p0);
          vec3 dy = vec3(0.0, pixelScale, py - p0);
          vec3 n = normalize(cross(dx, dy));
          gl_FragColor = vec4(n, 1.0);
        }
      `,
    attributes: {
      position: [-1, -1, 1, -1, 1, 1, -1, -1, 1, 1, -1, 1]
    },
    uniforms: {
      tElevation: regl.prop("elevation"),
      pixelScale: regl.prop("pixelScale"),
      resolution
    },
    viewport,
    count: 6,
    framebuffer: regl.prop("normals")
  });

  const cmdDirect = regl({
    // The vertex shader tells the GPU where to draw the vertices.
    vert: `
        precision highp float;
        attribute vec2 position;
        uniform vec2 scale;

        void main() {
          gl_Position = vec4(scale*position, 0, 1);
        }
      `,
    // The fragment shader tells the GPU what color to draw.
    frag: `
        precision highp float;

        uniform sampler2D tNormal;
        uniform vec2 resolution;
        uniform vec3 sunDirection;

        void main() {
          vec2 dr = 1.0/resolution;
          vec3 n = texture2D(tNormal, gl_FragCoord.xy/resolution).rgb;
          float l = dot(n, sunDirection);
          l = l * 1.1 + 0.2;
          gl_FragColor = vec4(l, l, l, 1.0);
        }
      `,
    attributes: {
      position: [-1, -1, 1, -1, 1, 1, -1, -1, 1, 1, -1, 1]
    },
    uniforms: {
      tNormal: regl.prop("normals"),
      tElevation: regl.prop("elevation"),
      scale: [1, 1],
      resolution,
      sunDirection: vec3.normalize([], [1, 1, 0.5])
    },
    viewport,
    count: 6
  });

  return (
    image: HTMLImageElement,
    pixelScale = 1,
    elevationScale = 1
  ): Promise<HTMLImageElement> => {
    const tElevation = regl.texture({
      data: image,
      flipY: true
    });

    regl.clear({
      color: [0, 0, 0, 1],
      depth: 1,
      stencil: 0
    });

    const fboElevation = regl.framebuffer({
      width: image.width,
      height: image.height,
      colorType: "float"
    });

    cmdProcessElevation({
      image: tElevation,
      elevation: fboElevation,
      elevationScale
    });

    const fboNormal = regl.framebuffer({
      width: image.width,
      height: image.height,
      colorType: "float"
    });

    cmdNormal({ elevation: fboElevation, normals: fboNormal, pixelScale });

    cmdDirect({ elevation: fboElevation, normals: fboNormal });

    const dataUrl = canvas.toDataURL();
    const img = document.createElement("img");

    return new Promise(resolve => {
      img.onload = function() {
        resolve(img);
      };
      img.src = dataUrl;
    });
  };
}

const emptyImage = document.createElement("img");
emptyImage.width = 256;
emptyImage.height = 256;

class HillshadeImageryProvider extends MapboxImageryProvider {
  // Fib about tile size in order to download fewer elevation tiles
  tileWidth = 256;
  tileHeight = 256;
  terrainProvider = terrainProvider;
  lastRequestedImageZoom = null;

  nRunners = 0;
  runnerQueue = [];

  async getRunner() {
    if (this.nRunners <= 5) {
      let runner = createRunner();
      this.nRunners += 1;
      return runner;
    }
    const runner = this.runnerQueue.pop();
    if (runner != null) return runner;
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        resolve(this.getRunner());
      }, 100);
    });
  }

  async processImage(
    image: HTMLImageElement,
    rect: Cesium.Rectangle,
    tileArgs: { x: number; y: number; z: number }
  ): Promise<HTMLImageElement> {
    const runCommands = await this.getRunner();
    // if (this.lastRequestedImageZoom != tileArgs.z) {
    //   console.log("Bailing from expensive tile computation");
    //   this.runnerQueue.push(runCommands);
    //   return emptyImage;
    // }

    const angle = rect.east - rect.west;
    // rough meters per pixel (could get directly from zoom level)
    const pixelScale = (6371000 * angle) / image.width;

    const elevationScale = 1; //Math.max(1, 10 - zoomLevel * 1.5);
    const t0 = performance.now();
    const res = await runCommands(image, pixelScale, elevationScale);

    const dt = performance.now() - t0;
    console.log(
      `Processing tile at ${tileArgs.x}, ${tileArgs.y}, ${tileArgs.z} took ${dt} ms`
    );

    this.runnerQueue.push(runCommands);

    return res;
  }

  requestImage(x, y, z, request): Promise<Img> | undefined {
    this.lastRequestedImageZoom = z;
    const resultPromise = super.requestImage(x, y, z, request);
    if (resultPromise == null) return undefined;
    return new Promise((resolve, reject) => {
      resultPromise.then(async res => {
        const rect = this.tilingScheme.tileXYToRectangle(x, y, z);
        const result = await this.processImage(res, rect, { x, y, z });
        resolve(result);
      });
    });
  }
}

const HillshadeLayer = props => {
  const hasSatellite = useSelector(state => state.update.mapHasSatellite);

  let hillshade = useRef(
    new HillshadeImageryProvider({
      mapId: "mapbox.terrain-rgb",
      maximumLevel: 14,
      accessToken: process.env.MAPBOX_API_TOKEN,
      format: ".webp"
    })
  );

  if (hasSatellite) return null;
  return h(ImageryLayer, { imageryProvider: hillshade.current, ...props });
};

export { HillshadeLayer };
