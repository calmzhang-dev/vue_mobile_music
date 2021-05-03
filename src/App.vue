<template>
  <div>
    <m-header></m-header>
    <tab></tab>
    <router-view :style="viewStyle"></router-view>
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
