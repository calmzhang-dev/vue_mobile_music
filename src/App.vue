<template>
  <div>
    <m-header></m-header>
    <tab></tab>
    <router-view :style="viewStyle" v-slot="{ Component }">
        <keep-alive>
          <component :is="Component"/>
        </keep-alive>
    </router-view>
    <!-- 使用路由命名视图,同级两个router-view -->
    <router-view v-slot="{ Component }" :style="viewStyle" name="user">
      <transition appear name="slide">
        <keep-alive>
          <component :is="Component"/>
        </keep-alive>
      </transition>
    </router-view>
    <player></player>
  </div>
</template>

<script>
import Header from '@/components/header/header'
import Tab from '@/components/tab/tab'
import Player from './components/player/player.vue'
import { mapState } from 'vuex'

export default {
  components: {
    MHeader: Header,
    Tab,
    Player
  },
  computed: {
    ...mapState([
      'playlist'
    ]),
    viewStyle () {
      const bottom = this.playlist.length ? '60px' : 0
      return {
        bottom
      }
    }
  }
}
</script>

<style lang="scss" scoped>
</style>
