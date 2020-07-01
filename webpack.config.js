const MonacoWebpackPlugin = require("monaco-editor-webpack-plugin");

module.exports = {
  entry: "./index.js",
  output: {
    path: path.resolve(__dirname, "dist"),
    filename: "app.js",
  },
  module: {
    rules: [
      {
        test: /\.css$/,
        use: ["style-loader", "css-loader"],
      },
      {
        test: /\.ttf$/,
        use: ["file-loader"],
      },
    ],
  },
  plugins: [
    new MonacoEditorPlugin({
      languages: ["json"],
    }),
  ],
};
