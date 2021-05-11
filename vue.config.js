const registerRouter = require('./backend/router')

module.exports = {
  css: {
    loaderOptions: {
      sass: {
        // 全局引入变量和 mixin
        additionalData: `
          @import "@/assets/scss/variable.scss";
          @import "@/assets/scss/mixin.scss";
        `
      }
    }
  },
  // 启用一个nodesever服务器,利用webpack启用服务器
  devServer: {
    before (app) {
      registerRouter(app)
    }
  },
  // configureWebpack: (config) => {
  //   if (process.env.npm_config_report) {
  //     const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin
  //     config.plugins.push(new BundleAnalyzerPlugin())
  //   }
  // }
  productionSourceMap: false,
  publicPath: process.env.NODE_ENV === 'production' ? '/vue_shop/dist/' : '/'
}
