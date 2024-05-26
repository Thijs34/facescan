const path = require("path");

module.exports = {
  entry: "./src/index.js", // start building the dependency graph from this file
  output: {
    filename: "main.js",
    path: path.resolve(__dirname, "dist"),
    clean: true, // clean the dist folder before each build
  },
  target: "web",
  module: {
    rules: [
      {
        test: /\.(wasm)|(bin)|(obj)$/i,
        include: [
          path.resolve(__dirname, 'node_modules/deepar/'),
        ],
        type: 'asset/resource',
      },
      {
        include: [
          path.resolve(__dirname, 'public/effects/'),
        ],
        type: 'asset/resource',
      },
    ],
  },
  resolve: {
    alias: {
      '@effects': path.resolve(__dirname, 'public/effects/'),
    },
    fallback: {
      "path": require.resolve("path-browserify"),
      "fs": false, // Setting fs to false since it's not directly supported in a browser environment
      "process": require.resolve("process/browser")
    }
  },
  performance: {
    maxEntrypointSize: 1000000,
    maxAssetSize: 10000000,
  },
  devServer: {
    static: [
      {
        directory: path.join(__dirname, "public"),
      },
      {
        directory: path.join(__dirname, "node_modules/deepar"),
        publicPath: "/deepar-resources",
      },
    ],
    compress: true,
    port: 8888,
    liveReload: false, // Disable live reload to prevent multiple images saved
  },
  mode: 'development', // Set the mode to development
};