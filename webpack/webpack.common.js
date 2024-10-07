const CopyWebpackPlugin = require("copy-webpack-plugin");
const TerserPlugin = require("terser-webpack-plugin");
const { join, resolve } = require("path");
const webpack = require("webpack");
const Dotenv = require("dotenv-webpack");
const CssMinimizerPlugin = require("css-minimizer-webpack-plugin");
const TsconfigPathsPlugin = require("tsconfig-paths-webpack-plugin");

const MAX_FILE_SIZE = 4000000; // 4MB

module.exports = {
  entry: {
    popup: "./src/browser-extension/popup/index.tsx",
    service_worker: "./src/browser-extension/service_worker.ts",
    "content-script-ecommerce": "./src/e-commerce/content-script-ecommerce.tsx",
    "content-script-anti-scam": "./src/anti-scam/content-script-anti-scam.ts",
    "content-script-shutaf": "./src/shutaf/content-script-shutaf.tsx",
    "content-script-supplier": "./src/supplier/content-script-supplier.tsx",
    "content-script-auth": "./src/auth/content-script-auth.tsx"
  },
  output: {
    clean: true,
    path: join(__dirname, "../", "dist"),
    filename: "scripts/[name].js"
  },
  performance: {
    hints: "error",
    maxEntrypointSize: MAX_FILE_SIZE,
    maxAssetSize: MAX_FILE_SIZE
  },
  cache: {
    type: "filesystem"
  },
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: "ts-loader",
        exclude: [/__tests__/, /__test__/, /\.test\.tsx?$/, /\.e2e\.tsx?$/, /\.mock\.tsx?$/]
      },
      {
        test: /\.(png|jpe?g|gif)$/i,
        type: "asset/resource",
        generator: {
          filename: "assets/[name][ext]"
        }
      },
      {
        test: /\.gql$/,
        exclude: /node_modules/,
        use: ["graphql-tag/loader"]
      },
      {
        test: /\.css$/i,
        use: ["style-loader", "css-loader"]
      },
      {
        test: /\.svg$/,
        use: ["@svgr/webpack"]
      },
      {
        test: /\.s[ac]ss$/i,
        use: ["style-loader", "css-loader", "sass-loader"]
      },
      {
        test: /\.pcss$/i,
        use: ["style-loader", "css-loader", "postcss-loader"]
      }
    ]
  },
  resolve: {
    extensions: [".ts", ".tsx", ".js", ".jsx", ".png", ".svg", ".gql"],
    plugins: [new TsconfigPathsPlugin()],
    alias: {
      "@emotion/react": resolve(__dirname, "../node_modules/@emotion/react"),
      "@emotion/styled": resolve(__dirname, "../node_modules/@emotion/styled"),
      "@mui/icons-material": resolve(__dirname, "../node_modules/@mui/icons-material"),
      "@mui/material": resolve(__dirname, "../node_modules/@mui/material"),
      "@mui/system": resolve(__dirname, "../node_modules/@mui/system"),
      "@mui/x-data-grid": resolve(__dirname, "../node_modules/@mui/x-data-grid")
    },
    fallback: {
      url: require.resolve("url")
    }
  },
  optimization: {
    minimize: true,
    minimizer: [new TerserPlugin({ extractComments: false })]
  },
  plugins: [
    new CssMinimizerPlugin(),
    new CopyWebpackPlugin({
      patterns: [
        {
          from: "./src/browser-extension/public",
          to: ".",
          globOptions: {
            ignore: ["**/.DS_Store"]
          }
        }
      ]
    }),
    new webpack.IgnorePlugin({
      resourceRegExp: /\.DS_Store$/,
      contextRegExp: /.*/
    }),
    new Dotenv()
  ]
};
