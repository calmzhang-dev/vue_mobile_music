<template>
    <div class="recommend" v-loading="loading">
      <!-- recommend-content给scroll设置样式,使内部有高度,并且高度大于scroll才可以滚动 -->
      <scroll class="recommend-content">
      <!-- scroll只对第一个根元素滚动,所以加一个div包裹 -->
        <div>
            <!-- 轮播图 -->
            <div class="slider-wrapper">
              <div class="slider-content">
                  <slider v-if="sliders.length" :sliders="sliders"></slider>
              </div>
            </div>
            <!-- 推荐歌单 -->
            <div class="recommend-list">
           <h1 class="list-title" v-show="!loading" :v-show="loading">热门歌单推荐</h1>
           <ul>
             <li
               v-for="item in albums"
               class="item"
               :key="item.id"
               @click="selectItem(item)"
             >
               <div class="icon">
                 <img width="60" height="60" v-lazy="item.pic">
               </div>
               <div class="text">
                 <h2 class="name">
                   {{ item.username }}
                 </h2>
                 <p class="title">
                   {{item.title}}
                 </p>
               </div>
             </li>
           </ul>
            </div>
        </div>
      </scroll>
      <router-view v-slot="{ Component }">
        <transition appear name="slide">
          <component :data="selectedAlbum" :is="Component"/>
        </transition>
      </router-view>
    </div>
</template>

<script>
import { getRecommend } from '@/service/recommend'
import Slider from '@/components/base/slider/slider'
import Scroll from '@/components/wrap-scroll/index'
import storage from 'good-storage'
import { ALBUM_KEY } from '@/assets/js/constant'

export default {
  name: 'recommend',
  data () {
    return {
      sliders: [],
      albums: [],
      selectedAlbum: null
    }
  },
  computed: {
    loading () {
      return !this.sliders.length && !this.albums.length
    }
  },
  async created () {
    const result = await getRecommend()
    this.sliders = result.sliders
    this.albums = result.albums
  },
  components: {
    Slider,
    Scroll
  },
  methods: {
    // 跳转推荐歌单
    selectItem (item) {
      this.selectedAlbum = item
      this.cacheAlbum(item)
      this.$router.push({
        path: `/recommend/${item.id}`
      })
    },
    // 存入session  (将点击项的数据保存为了刷新)
    cacheAlbum (item) {
      storage.session.set(ALBUM_KEY, item)
    }
  }
}
</script>

<style lang="scss" scoped>
  .recommend {
    position: fixed;
    width: 100%;
    top: 88px;
    bottom: 0;
    overflow: scroll;
    .recommend-content {
      height: 100%;
      overflow: hidden;
      .slider-wrapper {
        position: relative;
        width: 100%;
        height: 0;
        padding-top: 40%;
        overflow: hidden;
        .slider-content {
          position: absolute;
          left: 0;
          top: 0;
          width: 100%;
          height: 100%;
        }
      }
      .recommend-list {
        .list-title {
          height: 65px;
          line-height: 65px;
          text-align: center;
          font-size: $font-size-medium;
          color: $color-theme;
        }
        .item {
          display: flex;
          box-sizing: border-box;
          align-items: center;
          padding: 0 20px 20px 20px;
          .icon {
            flex: 0 0 60px;
            width: 60px;
            padding-right: 20px;
          }
          .text {
            display: flex;
            flex-direction: column;
            justify-content: center;
            flex: 1;
            line-height: 20px;
            overflow: hidden;
            font-size: $font-size-medium;
          }
          .name {
            margin-bottom: 10px;
            color: $color-text;
          }
          .title {
            color: $color-text-d;
          }
        }
      }
    }
  }
</style>
