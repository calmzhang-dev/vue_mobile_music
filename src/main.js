import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'
import '@/assets/scss/index.scss'
import lazyPlugin from 'vue3-lazy'
import loadingDirective from '@/components/base/loading/directive'

createApp(App).use(store).use(router).use(lazyPlugin, {
  loading: require('@/assets/images/default.png')
}).directive('loading', loadingDirective).mount('#app')
