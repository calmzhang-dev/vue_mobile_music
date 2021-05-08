<template>
  <div class="music-list">
    <!-- 头部以及图片 -->
    <div
      class="back"
      @click="goBack"
    >
      <i class="icon-back"></i>
    </div>
    <h1 class="title">{{ title }}</h1>
    <div class="bg-image" :style="bgImageStyle" ref="bgImage">
    <div class="play-btn-wrapper" :style="playBtnStyle" >
        <div
          v-show="songs.length > 0"
          class="play-btn"
          @click="random"
        >
          <i class="icon-play"></i>
          <span class="text">随机播放全部</span>
        </div>
      </div>
      <div class="filter" :style="filterStyle"></div>
    </div>
    <!-- 歌曲列表 -->
    <scroll
      class="list"
      :style="scrollStyle"
      v-loading="loading"
      v-no-result:[noresultText]="onResult"
      :probe-type="3"
      @scroll="onScroll"
    >
      <div class="song-list-wrapper" :style="boxshadow">
        <song-list
          :songs="songs"
          @select="selectItem"
          :rank="rank"
        ></song-list>
      </div>
    </scroll>
  </div>
</template>

<script>
import SongList from '@/components/base/song-list/song-list'
import Scroll from '@/components/wrap-scroll/index'
// 派发vuex数据利用Actions
import { mapActions, mapState } from 'vuex'

const RESERVED_HEIGHT = 40

export default {
  name: 'music-list',
  components: {
    SongList,
    Scroll
  },
  props: {
    songs: {
      type: Array,
      default () {
        return []
      }
    },
    title: String,
    pic: String,
    loading: Boolean,
    noresultText: {
      type: String,
      default: '抱歉,没有找到歌曲'
    },
    rank: Boolean
  },
  data () {
    return {
      imageHeight: 0,
      scrollY: 0,
      maxTranslateY: 0
    }
  },
  computed: {
    ...mapState([
      'playlist'
    ]),
    bgImageStyle () {
      const scrollY = this.scrollY
      let zIndex = 0
      let paddingTop = '70%'
      let height = 0
      // 上面设置了zIndex=0,但是iphone并不支持所以用translateZ兼容
      let translateZ = 0
      if (scrollY > this.maxTranslateY) {
        zIndex = 10
        paddingTop = 0
        height = `${RESERVED_HEIGHT}px`
        translateZ = 1
      }
      let scale = 1
      // 下拉列表图片缩放
      if (scrollY < 0) {
        scale = 1 + Math.abs(scrollY / this.imageHeight) // 这里scroll负值所以取绝对值
      }
      return {
        zIndex,
        paddingTop,
        height,
        backgroundImage: `url(${this.pic})`,
        transform: `scale(${scale})translateZ(${translateZ}px)`
      }
    },

    playBtnStyle () {
      let display = ''
      if (this.scrollY >= this.maxTranslateY) {
        display = 'none'
      }
      return {
        display
      }
    },

    // 根据图片计算歌曲列表定位高度
    scrollStyle () {
      const bottom = this.playlist.length ? '60px' : '0'
      return {
        top: `${this.imageHeight}px`,
        bottom: bottom
      }
    },

    // 上划图片加虚化滤镜
    filterStyle () {
      let blur = 0
      const scrollY = this.scrollY
      const imageHeight = this.imageHeight
      if (scrollY >= 0) {
        // 他有一个最大值
        blur = Math.min(this.maxTranslateY / imageHeight, scrollY / imageHeight) * 20
      }
      return {
        backdropFilter: `blur(${blur}px)`
      }
    },
    boxshadow () {
      const scrollY = this.scrollY
      if (scrollY > 0) {
        console.log(123123)
        return {
          boxShadow: 'rgb(236,240,241, 0.4) 0px 0px 10px 5px'
        }
      }
      return ''
    },

    onResult () {
      return !this.loading && !this.songs.length
    }
  },
  mounted () {
    this.imageHeight = this.$refs.bgImage.clientHeight
    this.maxTranslateY = this.imageHeight - RESERVED_HEIGHT
  },
  methods: {
    ...mapActions([
      'selectPlay',
      'randomPlay'
    ]),
    selectItem ({ song, index }) {
      this.selectPlay({
        list: this.songs,
        index
      })
    },
    goBack () {
      this.$router.back()
    },
    onScroll (pos) {
      this.scrollY = -pos.y
    },
    random () {
      this.randomPlay(this.songs)
    }
  }
}
</script>

<style lang="scss" scoped>
  .music-list {
    position: relative;
    height: 100%;
    .back {
      position: absolute;
      top: 0;
      left: 6px;
      z-index: 20;
      transform: translateZ(2px);
      .icon-back {
        display: block;
        padding: 10px;
        font-size: $font-size-large-x;
        color: $color-theme;
      }
    }
    .title {
      position: absolute;
      top: 0;
      left: 10%;
      width: 80%;
      z-index: 20;
      transform: translateZ(2px);
      @include no-wrap();
      text-align: center;
      line-height: 40px;
      font-size: $font-size-large;
      color: $color-text;
    }
    .bg-image {
      position: relative;
      width: 100%;
      transform-origin: top;
      // 把背景图片放大到适合元素容器的尺寸，图片比例不变，但是要注意，超出容器的部分可能会裁掉
      background-size: cover;
      .play-btn-wrapper {
        position: absolute;
        bottom: 20px;
        z-index: 10;
        width: 100%;
        .play-btn {
          box-sizing: border-box;
          width: 135px;
          padding: 7px 0;
          margin: 0 auto;
          text-align: center;
          border: 1px solid $color-theme;
          color: $color-theme;
          border-radius: 100px;
          font-size: 0;
        }
        .icon-play {
          display: inline-block;
          vertical-align: middle;
          margin-right: 6px;
          font-size: $font-size-medium-x;
        }
        .text {
          display: inline-block;
          vertical-align: middle;
          font-size: $font-size-small;
        }
      }
      .filter {
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(7, 17, 27, 0.4);
      }
    }
    .list {
      position: absolute;
      bottom: 0;
      width: 100%;
      z-index: 0;
      .song-list-wrapper {
        padding: 20px 30px;
        background: $color-background;
      }
    }
  }
</style>
