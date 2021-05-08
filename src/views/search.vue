<template>
    <div class="search">
        <div class="search-input-wrapper">
            <search-input v-model="query"></search-input>
        </div>
        <div class="search-content" v-show="!query">
            <div class="hot-keys">
                <h1 class="title">热门搜索</h1>
                <ul>
                    <li
                      class="item"
                      v-for="item in HotKeys"
                      :key="item.id"
                    >
                      <span @click="addQuery(item.key)">{{item.key}}</span>
                    </li>
                </ul>
            </div>
        </div>
        <!-- 搜索结果 -->
        <div class="search-result" v-show="query">
          <suggest
            :query="query"
            @select-song="selectSong"
            @select-singer="selectSinger"
          ></suggest>
        </div>
        <!-- 跳转歌手详情页 -->
        <router-view v-slot="{ Component }">
          <transition appear name="slide">
            <component :data="selectedSinger" :is="Component"/>
          </transition>
        </router-view>
    </div>
</template>

<script>
import searchInput from '@/components/search/search-input'
import { ref } from 'vue'
import { getHotKeys } from '../service/search'
import Suggest from '../components/search/suggest.vue'
import { useStore } from 'vuex'
import { useRouter } from 'vue-router'
import storage from 'good-storage'
import { SINGER_KEY } from '@/assets/js/constant'

export default {
  name: 'search',
  components: {
    searchInput,
    Suggest
  },
  setup () {
    // input的值
    const query = ref('')
    const HotKeys = ref([])
    const selectedSinger = ref(null)

    const store = useStore()
    const router = useRouter()

    getHotKeys().then((result) => {
      // 获取热门关键词
      HotKeys.value = result.hotKeys
    })

    function addQuery (key) {
      // 点击关键词搜索
      query.value = key
    }
    // 点击调用action添加歌曲到歌曲列表
    function selectSong (song) {
      store.dispatch('addSong', song)
    }
    function selectSinger (singer) {
      selectedSinger.value = singer
      cacheSinger(singer)
      router.push({
        path: `/search/${singer.mid}`
      })
    }
    function cacheSinger (singer) {
      storage.session.set(SINGER_KEY, singer)
    }
    return {
      query,
      HotKeys,
      selectedSinger,
      addQuery,
      selectSong,
      selectSinger
    }
  }
}
</script>

<style lang="scss" scoped>
  .search {
    position: fixed;
    width: 100%;
    top: 88px;
    bottom: 0;
    display: flex;
    flex-direction: column;
    .search-input-wrapper {
      margin: 20px;
    }
    .search-content {
      flex: 1;
      overflow: hidden;
      .hot-keys {
        margin: 0 20px 20px 20px;
        .title {
          margin-bottom: 20px;
          font-size: $font-size-medium;
          color: $color-text-l;
        }
        .item {
          display: inline-block;
          padding: 5px 10px;
          margin: 0 20px 10px 0;
          border-radius: 6px;
          background: $color-highlight-background;
          font-size: $font-size-medium;
          color: $color-text-d;
        }
      }
      .search-history {
        position: relative;
        margin: 0 20px;
        .title {
          display: flex;
          align-items: center;
          height: 40px;
          font-size: $font-size-medium;
          color: $color-text-l;
          .text {
            flex: 1;
          }
          .clear {
            @include extend-click();
            .icon-clear {
              font-size: $font-size-medium;
              color: $color-text-d;
            }
          }
        }
      }
    }
    .search-result {
      flex: 1;
      overflow: hidden;
    }
  }
</style>
