const webpack = require("webpack");
const { resolve } = require("path");
const { merge } = require("webpack-merge");
const common = require("./webpack.common.js");

module.exports = merge(common, {
  mode: "development",
  devtool: "inline-source-map",
  devServer: {
    writeToDisk: true,
    hot: false,
    liveReload: false
  },
  performance: {
    hints: false
  },
  optimization: {
    removeAvailableModules: false,
    removeEmptyChunks: false,
    splitChunks: false
  },
  cache: {
    type: "memory"
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
    })
  ]
});
