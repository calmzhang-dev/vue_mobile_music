<template>
  <div class="singer-detail">
      <music-list
      :songs="songs"
      :title="title"
      :pic="pic"
      :loading="loading"
    ></music-list>
  </div>
</template>

<script>
import storage from 'good-storage'
import { SINGER_KEY } from '@/assets/js/constant'
import { getSingerDetail } from '@/service/singer'
import { processSongs } from '@/service/song'
import MusicList from '@/components/music-list/music-list'

export default {
  name: 'singer-detail',
  data () {
    return {
      songs: [],
      loading: true
    }
  },
  computed: {
    computedSinger () {
      let ret = null
      const singer = this.singer
      if (singer) {
        ret = singer
      } else {
        const cachedSinger = storage.session.get(SINGER_KEY)
        // 判断如果存在cachedSinger,并且他的cachedSinger.mid值与请求路径中的相同时
        if (cachedSinger && cachedSinger.mid === this.$route.params.id) {
          ret = cachedSinger
        }
      }
      return ret
    },
    pic () {
      const singer = this.computedSinger
      return singer && singer.pic
    },
    title () {
      const singer = this.computedSinger
      return singer && singer.name
    }
  },
  props: {
    singer: Object
  },
  async created () {
    // 如果修改地址刷新,就会返回null报错
    if (!this.computedSinger) {
      const path = this.$route.matched[0].path
      this.$router.push(path)
      return
    }
    const result = await getSingerDetail(this.computedSinger)
    this.songs = await processSongs(result.songs)
    this.loading = false
  },
  components: {
    MusicList
  }
}
</script>

<style lang="scss" scoped>
.singer-detail {
    position: fixed;
    z-index: 10;
    top: 0;
    left: 0;
    bottom: 0;
    right: 0;
    background: $color-background;
  }
</style>
