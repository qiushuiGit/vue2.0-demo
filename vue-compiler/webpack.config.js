const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = {
  entry: './src/index.js', // 入口文件

  // output 指示 webpack 如何去输出、以及在哪里输出你的「bundle、asset 和
  // 其他你所打包或使用 webpack 载入的任何内容」。
  output: {
    filename: 'js/bundle.js',
    path: path.resolve(__dirname, 'dist')
  },
  devtool: 'source-map', // 生成 source map
  resolve: {
    // 如下配置 modules 后，你可以在入口文件中使用 import Vue from 'vue'; 
    // 这种引入方式，就像在 vue 项目的 main.js 中使用一样
    modules: [path.resolve(__dirname, ''), path.resolve(__dirname, 'node_modules')]
  },
  devServer: {
    host: '127.0.0.1', // 本地服务
    port: 8089 // 默认端口
  },
  plugins: [
    // 该插件将为你生成一个 HTML5 文件， 在 body 中使用 script 标签引入你所有 webpack 生成的 bundle。
    new HtmlWebpackPlugin({
      template: path.resolve(__dirname, 'public/index.html')
    })
  ]
}