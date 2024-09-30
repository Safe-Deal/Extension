const { merge } = require("webpack-merge");
const { DefinePlugin } = require("webpack");
const { join } = require("path");
const nodeExternals = require("webpack-node-externals");
const common = require("./webpack.common");

common.entry = undefined;
module.exports = merge(common, {
  mode: "production",
  entry: {
    server: "./brain/server.ts"
  },
  output: {
    clean: true,
    path: join(__dirname, "../", "brain", "dist-server"),
    filename: "[name].js"
  },
  target: "node",
  node: {
    __dirname: false,
    __filename: false
  },
  externals: [nodeExternals()],
  devtool: false,
  plugins: [
    new DefinePlugin({
      IS_DEBUGGER_ON: false
    })
  ]
});
