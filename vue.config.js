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
  }
}
