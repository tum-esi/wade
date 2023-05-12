const { defineConfig } = require('@vue/cli-service')
const MonacoWebpackPlugin = require('monaco-editor-webpack-plugin')

module.exports = defineConfig({
  transpileDependencies: true,
  pluginOptions: {
    electronBuilder: {
      nodeIntegration: true,
      builderOptions: {
        // options placed here will be merged with default configuration and passed to electron-builder
        extraResources: ["node_modules/core-js", "example-tds", "./node_modules/virtual-thing"],
      },
    },
  },
  configureWebpack: {
    devtool: 'source-map',
    plugins: [
      new MonacoWebpackPlugin({
        languages: ['typescript', 'javascript', 'json']
      })
    ]
  }
})
