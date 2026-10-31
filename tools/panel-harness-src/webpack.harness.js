const path = require("path");
const TsconfigPathsPlugin = require("tsconfig-paths-webpack-plugin");
const CopyWebpackPlugin = require("copy-webpack-plugin");

module.exports = {
  mode: "production",
  entry: path.resolve(__dirname, "panel-harness.tsx"),
  output: {
    path: path.resolve(__dirname, "../panel-harness-dist"),
    filename: "panel-harness.js",
    clean: true
  },
  resolve: {
    extensions: [".ts", ".tsx", ".js", ".jsx"],
    plugins: [new TsconfigPathsPlugin()]
  },
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: "ts-loader",
        exclude: [/node_modules/]
      },
      {
        test: /\.css$/i,
        use: ["style-loader", "css-loader"]
      },
      {
        test: /\.s[ac]ss$/i,
        use: [
          "style-loader",
          "css-loader",
          {
            loader: "sass-loader",
            options: {
              additionalData: `@import "${path
                .resolve(__dirname, "../../src/e-commerce/client/assets/_variables.scss")
                .replace(/\\/g, "/")}";`
            }
          }
        ]
      },
      {
        test: /\.(png|jpe?g|gif|svg)$/i,
        type: "asset/inline"
      }
    ]
  },
  plugins: [
    new CopyWebpackPlugin({
      patterns: [{ from: path.resolve(__dirname, "panel-harness.html"), to: path.resolve(__dirname, "../panel-harness-dist/panel-harness.html") }]
    })
  ]
};

