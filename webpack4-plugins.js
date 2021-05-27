const path = require("path");
const { DefinePlugin } = require("webpack");
const CopyPlugin = require("copy-webpack-plugin");

module.exports = baseURL => {
  const cesiumBase = path.dirname(require.resolve("cesium"));
  const cesiumSource = path.join(cesiumBase, "Source");

  return {
    resolve: {
      alias: {
        // CesiumJS module name,
        cesiumSource: path.resolve(__dirname, cesiumSource)
      }
    },
    amd: {
      // Enable webpack-friendly use of require in Cesium
      toUrlUndefined: true
    },
    plugins: [
      new CopyPlugin({
        patterns: [
          {
            from: path.join(cesiumBase, "Build/Cesium/Workers"),
            to: "Workers"
          },
          { from: path.join(cesiumSource, "Assets"), to: "Assets" },
          { from: path.join(cesiumSource, "Widgets"), to: "Widgets" }
        ]
      }),
      new DefinePlugin({
        // Define relative base path in cesium for loading assets
        CESIUM_BASE_URL: JSON.stringify(baseURL)
      })
    ]
  };
};
