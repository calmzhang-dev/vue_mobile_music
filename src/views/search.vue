<template>
    <div class="search">
        <div class="search-input-wrapper">
            <search-input v-model="query"></search-input>
        </div>
        <scroll
          ref="scrollRef"
          class="search-content"
          v-show="!query"
        >
          <div>
            <!-- 热词 -->
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
            <div class="search-history" v-show="searchHistory.length">
              <h1 class="title">
                <span class="text">搜索历史</span>
                <span class="clear" @click="showConfirm">
                  <i class="icon-clear"></i>
                </span>
              </h1>
              <confirm
                ref="confirmRef"
                text="是否清空所有搜索历史"
                confirmBtnText="清空"
                @confirm="clearSearch"
              ></confirm>
              <search-list
                :searches="searchHistory"
                @select="addQuery"
                @delete="deleteSearch"
              >
              </search-list>
            </div>
          </div>
        </scroll>
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
import Suggest from '../components/search/suggest.vue'
import SearchList from '@/components/base/search-list/search-list'
import useSearchHistory from '../components/search/use-search-history'
import Confirm from '../components/base/confirm/confirm.vue'
import storage from 'good-storage'
import { computed, nextTick, ref, watch } from 'vue'
import { getHotKeys } from '../service/search'
import { useStore } from 'vuex'
import { useRouter } from 'vue-router'
import { SINGER_KEY } from '@/assets/js/constant'
import Scroll from '../components/wrap-scroll/index'

export default {
  name: 'search',
  components: {
    searchInput,
    Suggest,
    SearchList,
    Scroll,
    Confirm
  },
  setup () {
    // input的值
    const query = ref('')
    const HotKeys = ref([])
    const selectedSinger = ref(null)
    const scrollRef = ref(null)
    const confirmRef = ref(null)

    const store = useStore()
    const router = useRouter()
    // 搜索历史
    const { saveSearch, deleteSearch, clearSearch } = useSearchHistory()

    getHotKeys().then((result) => {
      // 获取热门关键词
      HotKeys.value = result.hotKeys
    })
    // watch===================================
    watch(query, async (newQuery) => {
      if (!newQuery) {
        await nextTick()
        refreshScroll()
      }
    })

    // computed=============================
    const searchHistory = computed(() => {
      return store.state.searchHistory
    })

    // methods===============================
    function addQuery (key) {
      // 点击关键词搜索
      query.value = key
    }
    // 点击调用action添加歌曲到歌曲列表
    function selectSong (song) {
      // 保存到历史
      saveSearch(query.value)
      store.dispatch('addSong', song)
    }
    function selectSinger (singer) {
      // 保存到历史
      saveSearch(query.value)
      selectedSinger.value = singer
      cacheSinger(singer)
      router.push({
        path: `/search/${singer.mid}`
      })
    }
    // 存储歌手,为了刷新正常不跳转
    function cacheSinger (singer) {
      storage.session.set(SINGER_KEY, singer)
    }
    function refreshScroll () {
      scrollRef.value.scroll.refresh()
    }
    function showConfirm () {
      confirmRef.value.show()
    }
    return {
      query,
      HotKeys,
      confirmRef,
      scrollRef,
      selectedSinger,
      clearSearch,
      // computed
      searchHistory,
      // methods
      addQuery,
      selectSong,
      showConfirm,
      selectSinger,
      // searchHistory
      deleteSearch
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
