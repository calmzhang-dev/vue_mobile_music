<template>
  <teleport to="body">
      <transition name="slide">
          <div class="add-song" v-show="visible">
              <div class="header">
                  <h1>添加歌曲到列表</h1>
                  <div class="close" @click="hide">
                      <i class="icon-close"></i>
                  </div>
              </div>
              <div class="search-input-wrapper">
                  <search-input
                    v-model="query"
                    placeholder="搜索歌曲"
                  ></search-input>
              </div>
              <div v-show="!query">
                <switches
                  :items="['最近播放','搜索历史']"
                  v-model="currentIndex"
                >
                </switches>
                <!-- 最近播放 -->
                <div class="list-wrapper">
                    <scroll
                      class="list-scroll"
                      v-if="currentIndex === 0"
                      ref="scrollRef"
                    >
                        <div class="list-inner">
                            <song-list
                              :songs="playHistory"
                              @select="selectSongBySongList"
                            ></song-list>
                        </div>
                    </scroll>
                    <!-- 搜索历史 -->
                     <scroll
                      class="list-scroll"
                      v-if="currentIndex === 1"
                      ref="scrollRef"
                    >
                        <div class="list-inner">
                            <search-list
                              :searches="searchHistory"
                              :showDelete="false"
                              @select="addQuery"
                            ></search-list>
                        </div>
                    </scroll>
                </div>
              </div>
              <div class="search-result" v-show="query">
                  <suggest
                    :query="query"
                    :show-singer="false"
                    @select-song="selectSongBySuggest"
                  ></suggest>
              </div>
              <message ref="messageRef">
                  <div class="message-title">
                      <i class="icon-ok"></i>
                      <span class="text">1首歌曲已经添加到播放列表</span>
                  </div>
              </message>
          </div>
      </transition>
  </teleport>
</template>

<script>
import SearchInput from '@/components/search/search-input'
import Suggest from '@/components/search/suggest'
import Switches from '@/components/base/switches/switches'
import Scroll from '@/components/base/scroll/scroll'
import SongList from '@/components/base/song-list/song-list'
import { computed, nextTick, ref } from 'vue'
import { useStore } from 'vuex'
import searchList from '@/components/base/search-list/search-list.vue'
import useSearchHistory from '@/components/search/use-search-history'
import Message from '../base/message/message.vue'

export default {
  name: 'add-song',
  components: {
    SearchInput,
    Suggest,
    Switches,
    Scroll,
    SongList,
    searchList,
    Message
  },
  setup () {
    const visible = ref(false)
    const query = ref('')
    const currentIndex = ref(0)
    const scrollRef = ref(null)
    const messageRef = ref(null)

    // vuex===============
    const store = useStore()

    // computed===========
    const searchHistory = computed(() => {
      return store.state.searchHistory
    })
    const playHistory = computed(() => {
      return store.state.playHistory
    })

    // hooks
    const { saveSearch } = useSearchHistory()

    // methods============
    // 展示添加歌曲页面
    async function show () {
      visible.value = true
      await nextTick()
      refreshSroll()
    }
    // 隐藏添加歌曲页面
    function hide () {
      visible.value = false
    }
    // 添加到查询框
    function addQuery (item) {
      query.value = item
    }
    function selectSongBySongList ({ song }) {
      addSong(song)
    }
    function selectSongBySuggest (song) {
      addSong(song)
      // 保存搜索
      saveSearch(query.value)
    }
    // 添加歌曲到列表
    function addSong (song) {
      showMessage()
      store.dispatch('addSong', song)
    }
    // 刷新betterscroll
    function refreshSroll () {
      scrollRef.value.scroll.refresh()
    }
    // 展示弹框组件
    function showMessage () {
      messageRef.value.show()
    }

    return {
      visible,
      query,
      currentIndex,
      scrollRef,
      messageRef,
      // computed
      searchHistory,
      playHistory,
      // methods
      show,
      hide,
      addQuery,
      selectSongBySongList,
      selectSongBySuggest
    }
  }
}
</script>

<style lang="scss" scoped>
.add-song {
    position: fixed;
    top: 0;
    bottom: 0;
    width: 100%;
    z-index: 300;
    background: $color-background;
    .header {
      h1 {
        line-height: 44px;
      }
      position: relative;
      height: 44px;
      text-align: center;
      .title {
        line-height: 44px;
        font-size: $font-size-large;
        color: $color-text;
      }
      .close {
        position: absolute;
        top: 0;
        right: 8px;
        .icon-close {
          display: block;
          padding: 12px;
          font-size: 20px;
          color: $color-theme;
        }
      }
    }
    .search-input-wrapper {
      margin: 20px
    }
    .list-wrapper {
      position: absolute;
      top: 165px;
      bottom: 0;
      width: 100%;
      .list-scroll {
        height: 100%;
        overflow: hidden;
        .list-inner {
          padding: 20px 30px;
        }
      }
    }
    .search-result {
      position: fixed;
      top: 124px;
      bottom: 0;
      width: 100%;
    }
  }

  .message-title {
    text-align: center;
    padding: 18px 0;
    font-size: 0;
    .icon-ok {
      font-size: $font-size-medium;
      color: $color-theme;
      margin-right: 4px;
    }
    .text {
      font-size: $font-size-medium;
      color: $color-text;
    }
  }
</style>
