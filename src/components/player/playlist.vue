<template>
  <teleport to="body">
      <transition name="list-fade">
        <div
          class="playlist"
          v-show="visible && playlist.length"
          @click="hide"
        >
          <div class="list-wrapper" @click.stop>
            <!-- 头部 -->
            <div class="list-header">
                <h1 class="title">
                    <i
                      class="icon"
                      :class="modeIcon"
                      @click.stop="changeMode"
                    >
                    </i>
                    <span class="text">{{modeText}}</span>
                    <!-- 清空 -->
                    <span class="clear" @click="showConfirm">
                      <i class="icon-clear"></i>
                    </span>
                </h1>
            </div>
            <!-- 歌曲列表 -->
            <scroll ref="scrollRef" class="list-content">
                <transition-group ref="listRef" name="list" tag="ul">
                  <li class="item" v-for="song in sequenceList" :key="song.id" @click="selectItem(song)">
                    <i class="current" :class="getCurrentIcon(song)" ></i>
                    <span class="text">{{song.name}}</span>
                    <span class="favorite" @click.stop="toggleFavorite(song)">
                      <i :class="getFavoriteIcon(song)"></i>
                    </span>
                    <span class="delete" @click.stop="removeSong(song)" :class="{'disable' : removing}">
                      <i class="icon-delete"></i>
                    </span>
                  </li>
                </transition-group>
            </scroll>
            <div class="list-add" @click="ShowAddSong">
              <div class="add">
                <i class="icon-add"></i>
                <span class="text">添加歌曲到队列</span>
              </div>
            </div>
            <div class="list-footer" @click.stop="hide">
              <span>关闭</span>
            </div>
          </div>
          <confirm
            ref="confirmRef"
            @confirm="confirmClear"
            text="是否清空播放列表?"
            confirmBtnText="清空"
          >
          </confirm>
          <add-song ref="AddSongRef"></add-song>
        </div>
      </transition>
  </teleport>
</template>

<script>
import Scroll from '@/components/base/scroll/scroll'
import Confirm from '@/components/base/confirm/confirm'
import AddSong from '../add-song/add-song.vue'
import { ref, computed, nextTick, watch } from 'vue'
import { useStore } from 'vuex'
import useMode from './use-mode'
import useFavorite from './use-favorite'

export default {
  name: 'playlist',
  components: {
    Scroll,
    Confirm,
    AddSong
  },
  setup () {
    const visible = ref(false)
    const scrollRef = ref(null)
    const listRef = ref(null)
    const removing = ref(false)
    const confirmRef = ref(null)
    const AddSongRef = ref(null)

    const store = useStore()
    const playlist = computed(() => store.state.playlist)
    const sequenceList = computed(() => store.state.sequenceList)
    const currentSong = computed(() => store.getters.currentSong)

    const { modeIcon, changeMode, modeText } = useMode()
    const { getFavoriteIcon, toggleFavorite } = useFavorite()

    // 监听当前歌曲,自动滚动到当前的歌曲
    watch(currentSong, async (newSong) => {
      // 判断playList是否显示,因为外部也会变化currentSong
      if (!visible.value || !newSong.id) {
        return
      }
      // 如果歌曲列表删除或变化,就需要等待一个nextick,重新刷新bettor-scroll
      await nextTick()
      scrolToCurrent()
    })

    // 显示弹窗
    function showConfirm () {
      confirmRef.value.show()
    }
    // 当前播放的歌
    function getCurrentIcon (song) {
      if (song.id === currentSong.value.id) {
        return 'icon-play'
      }
    }

    // 展示列表
    async function show () {
      visible.value = true
      await nextTick()
      // 重新计算refresh()
      refreshScroll()
      // 滚动到当前歌曲
      scrolToCurrent()
    }

    // 隐藏列表
    function hide () {
      visible.value = false
    }

    // 刷新scroll组件
    function refreshScroll () {
      scrollRef.value.scroll.refresh()
    }

    // 滚动到当前歌曲
    function scrolToCurrent () {
      const index = sequenceList.value.findIndex((song) => {
        return currentSong.value.id === song.id
      })
      if (index === -1) {
        return
      }
      const target = listRef.value.$el.children[index]
      scrollRef.value.scroll.scrollToElement(target, 300)
    }

    // 点击歌曲
    function selectItem (song) {
      const index = playlist.value.findIndex((item) => {
        return song.id === item.id
      })

      store.commit('setCurrentIndex', index)
      store.commit('setPlayingState', true)
    }

    // 删除列表歌曲
    function removeSong (song) {
      if (removing.value) {
        return
      }
      removing.value = true
      store.dispatch('removeSong', song)
      if (!playlist.value.length) {
        hide()
      }
      setTimeout(() => {
        removing.value = false
      }, 300)
    }

    function confirmClear () {
      store.dispatch('clearSongList')
      hide()
    }

    // 展示添加列表
    function ShowAddSong () {
      AddSongRef.value.show()
    }

    return {
      visible,
      scrollRef,
      listRef,
      removing,
      confirmRef,
      AddSongRef,
      // vuex
      playlist,
      sequenceList,
      currentSong,
      // methods
      getCurrentIcon,
      show,
      hide,
      refreshScroll,
      selectItem,
      removeSong,
      showConfirm,
      confirmClear,
      ShowAddSong,
      // useMode
      modeIcon,
      changeMode,
      modeText,
      // useFavorite
      getFavoriteIcon,
      toggleFavorite
    }
  }
}
</script>

<style lang="scss" scoped>
  .playlist {
    position: fixed;
    left: 0;
    right: 0;
    top: 0;
    bottom: 0;
    z-index: 200;
    background-color: $color-background-d;
    &.list-fade-enter-active, &.list-fade-leave-active {
      transition: opacity .3s;
      .list-wrapper {
        transition: all .3s;
      }
    }
    &.list-fade-enter-from, &.list-fade-leave-to {
      opacity: 0;
      .list-wrapper {
        transform: translate3d(0, 100%, 0);
      }
    }
    .list-wrapper {
      border-radius: 10px;
      position: fixed;
      left: 0;
      bottom: 0;
      z-index: 210;
      width: 100%;
      background-color: $color-highlight-background;
      .list-header {
        position: relative;
        padding: 20px 30px 10px 20px;
        .title {
          display: flex;
          align-items: center;
          .icon {
            margin-right: 10px;
            font-size: 24px;
            color: $color-theme-d;
          }
          .text {
            flex: 1;
            font-size: $font-size-medium;
            color: $color-text-l;
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
      .list-content {
        max-height: 240px;
        overflow: hidden;
        .item {
          display: flex;
          align-items: center;
          height: 40px;
          padding: 0 30px 0 20px;
          overflow: hidden;
          .current {
            flex: 0 0 20px;
            width: 20px;
            font-size: $font-size-small;
            color: $color-theme-d;
          }
          .text {
            flex: 1;
            @include no-wrap();
            font-size: $font-size-medium;
            color: $color-text-d;
          }
          .favorite {
            @include extend-click();
            margin-right: 15px;
            font-size: $font-size-small;
            color: $color-theme;
            .icon-favorite {
              color: $color-sub-theme;
            }
          }
          .delete {
            @include extend-click();
            font-size: $font-size-small;
            color: $color-theme;
            &.disable {
              color: $color-theme-d;
            }
          }
        }
      }
      .list-add {
        width: 140px;
        margin: 20px auto 30px auto;
        .add {
          display: flex;
          align-items: center;
          padding: 8px 16px;
          border: 1px solid $color-text-l;
          border-radius: 100px;
          color: $color-text-l;
          .icon-add {
            margin-right: 5px;
            font-size: $font-size-small-s;
          }
          .text {
            font-size: $font-size-small;
          }
        }
      }
      .list-footer {
        text-align: center;
        line-height: 50px;
        background: $color-background;
        font-size: $font-size-medium-x;
        color: $color-text-l;
      }
    }
  }
</style>
