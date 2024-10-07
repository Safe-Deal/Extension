const { merge } = require("webpack-merge");
const { DefinePlugin } = require("webpack");
const common = require("./webpack.common");

module.exports = merge(common, {
  mode: "production",
  devtool: false,
  plugins: [
    new DefinePlugin({
      IS_DEBUGGER_ON: false
    })
  ]
});
