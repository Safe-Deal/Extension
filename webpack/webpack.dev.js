const webpack = require("webpack");
const { resolve } = require("path");
const { merge } = require("webpack-merge");
const common = require("./webpack.common.js");
// https://www.npmjs.com/package/webpack-ext-reloader
const ExtReloader = require("webpack-ext-reloader");

module.exports = merge(common, {
  mode: "development",
  devtool: "inline-source-map", // Keep this for extension debugging
  performance: {
    hints: false
  },
  optimization: {
    minimize: false,
    removeAvailableModules: false,
    removeEmptyChunks: false,
    splitChunks: false
  },
  cache: {
    type: "memory",
    cacheUnaffected: true
  },
  watchOptions: {
    ignored: /node_modules/
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        use: ["source-map-loader"],
        enforce: "pre",
        include: resolve(__dirname, "../src")
      }
    ]
  },
  plugins: [
    new webpack.DefinePlugin({
      IS_DEBUGGER_ON: true
    }),
    new ExtReloader({
      port: 9090,
      manifest: resolve(__dirname, "./manifest_v3/manifest.json")
    })
  ]
});
