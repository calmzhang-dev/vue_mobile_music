<template>
  <div
    ref="rootRef"
    class="suggest"
    v-loading:[loadingText]="loading"
    v-no-result:[noResultText]="noResult"
  >
    <ul class="suggest-list">
      <!-- 歌手 -->
      <li
        class="suggest-item"
        v-if="singer"
        @click="selectSinger(singer)"
      >
        <div class="icon">
          <i class="icon-mine"></i>
        </div>
        <div class="name">
          <p class="text">{{ singer.name }}</p>
        </div>
      </li>
      <!-- 搜索歌曲列表 -->
      <li
        class="suggest-item"
        v-for="song in songs"
        :key="song.id"
        @click="selectSong(song)"
      >
        <div class="icon">
          <i class="icon-music"></i>
        </div>
        <div class="name">
          <p class="text">
            {{song.singer}}-{{song.name}}
          </p>
        </div>
      </li>
      <!-- 上拉加载模块  -->
      <div
        class="suggest-item"
        v-loading:[loadingText]="pullUpLoading"
      ></div>
    </ul>
  </div>
</template>

<script>
import { computed, nextTick, ref, watch } from 'vue'
import { search } from '@/service/search'
import { processSongs } from '@/service/song'
import usePullUpLoad from './use-pull-up-load'

export default {
  name: 'suggest',
  props: {
    // input的值
    query: String,
    showSinger: {
      type: Boolean,
      default: true
    }
  },
  emits: ['select-song', 'select-singer'],
  setup (props, { emit }) {
    // 歌手
    const singer = ref(null)
    // 歌曲
    const songs = ref([])
    // 服务器返回是否有更多数据
    const hasMore = ref(true)
    // 页码
    const page = ref(1)
    // loading文本
    const loadingText = ref('')
    const noResultText = ref('抱歉, 暂无搜索结果')
    const manualLoading = ref(false)

    // computed=================
    const noResult = computed(() => {
      return !singer.value && !songs.value.length && !hasMore.value
    })
    const loading = computed(() => {
      return !singer.value && !songs.value.length
    })
    const pullUpLoading = computed(() => {
      return isPullUpLoad.value && hasMore.value
    })
    // 阻止下拉加载(在loading状态和makeItemScrollAble请求时阻止下拉请求 )
    const preventPullUpLoad = computed(() => {
      return loading.value && manualLoading.value
    })

    // 上拉加载函数
    const { isPullUpLoad, rootRef, scroll } = usePullUpLoad(searchMore, preventPullUpLoad)

    // watch===================
    watch(() => props.query, async (newQuery) => {
      // 这里直接watch监听props.query是不可以的,watch需要监听一个响应式对象,而不是字符串
      if (!newQuery) {
        return
      }
      await searchFirst()
    })

    // methods=================
    async function searchFirst () {
      if (!props.query) {
        return
      }
      // 页码
      page.value = 1
      // 歌曲
      songs.value = []
      // 歌手
      singer.value = null
      hasMore.value = true

      // 搜索结果
      const result = await search(props.query, page.value, props.showSinger)
      // 获取songs
      songs.value = await processSongs(result.songs)
      singer.value = result.singer
      hasMore.value = result.hasMore
      await nextTick()
      await makeItemScrollAble()
    }

    // 下拉加载下一页
    async function searchMore () {
      if (!hasMore.value || !props.query) {
        return
      }
      page.value++
      // 搜索结果
      const result = await search(props.query, page.value, props.showSinger)
      // 获取下一页songs
      // 并且和    拼接上一页
      songs.value = songs.value.concat(await processSongs(result.songs))
      hasMore.value = result.hasMore
      await nextTick()
      await makeItemScrollAble()
    }

    // 当返回内容不够一整页时,继续请求数据(因为后台获取到一页的歌曲,会把付费歌曲排除掉,真实返回会不够一整页)
    async function makeItemScrollAble () {
      // 最大滚动距离大于-1,则内容高度不够不可以滚动
      if (scroll.value.maxScrollY >= -1) {
        manualLoading.value = true
        await searchMore()
        manualLoading.value = false
      }
    }

    function selectSong (song) {
      emit('select-song', song)
    }
    function selectSinger (singer) {
      emit('select-singer', singer)
    }

    return {
      songs,
      singer,
      loadingText,
      noResultText,
      // pullUpLoad
      rootRef,
      // computed
      noResult,
      loading,
      pullUpLoading,
      // methods
      selectSong,
      selectSinger
    }
  }
}
</script>

<style lang="scss" scoped>
  .suggest {
    height: 100%;
    overflow: hidden;
    .suggest-list {
      padding: 0 30px;
      .suggest-item {
        display: flex;
        align-items: center;
        padding-bottom: 20px;
        .icon {
          flex: 0 0 30px;
          width: 30px;
          [class^="icon-"] {
            font-size: 14px;
            color: $color-text-d;
          }
        }
        .name {
          flex: 1;
          font-size: $font-size-medium;
          color: $color-text-d;
          overflow: hidden;
          .text {
            @include no-wrap();
          }
        }
      }
    }
  }
</style>
