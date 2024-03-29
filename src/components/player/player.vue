<template>
    <div
      class="player"
      v-show="playlist.length"
    >
    <transition
      name="normal"
      @enter="enter"
      @after-enter="afterEnter"
      @after-leave="afterLeave"
      @leave="leave"
    >
      <div
        class="normal-player"
        v-show="fullScreen"
      >
        <div class="background">
          <img :src="currentSong.pic">
        </div>
        <!-- 顶部 -->
        <div class="top">
          <div
            class="back"
            @click="goBack"
          >
            <i class="icon-back"></i>
          </div>
          <h1 class="title">{{currentSong.name}}</h1>
          <h2 class="subtitle">{{currentSong.singer}}</h2>
        </div>
        <!-- 中间 -->
        <div
          class="middle"
          @touchstart.prevent="onMiddleTouchStart"
          @touchmove.prevent="onMiddleTouchMove"
          @touchend.prevent="onMiddleTouchEnd"
        >
          <div class="middle-l" :style="middleLStyle">
            <div class="cd-wrapper" ref="cdWrapperRef">
              <div class="cd" ref="cdRef" >
                <img :src="currentSong.pic" class="image" :class="cdClass" ref="cdImageRef" >
              </div>
            </div>
            <div class="playing-lyric-wrapper">
              <div class="playing-lyric">
                {{playinglyric}}
              </div>
            </div>
          </div>
          <!-- 歌词 -->
          <scroll class="middle-r" ref="lyricScrollRef" :style="middleRStyle">
            <div class="lyric-wrapper">
              <div v-if="currentLyric" ref="lyricListRef">
                <p class="text" :class="{'current': currentLineNum ===index}" v-for="(line,index) in currentLyric.lines" :key="line.num" >
                  {{line.txt}}
                </p>
              </div>
              <div class="pure-music" v-show="pureMusicLyric">
                <p>{{pureMusicLyric}}</p>
              </div>
            </div>
          </scroll>
        </div>
        <div class="bottom">
          <div class="dot-wrapper">
            <span class="dot" :class="{'active': currentShow === 'cd'}"></span>
            <span class="dot" :class="{'active': currentShow === 'lyric'}"></span>
          </div>
          <!-- 进度条 -->
          <div class="progress-wrapper">
            <span class="time time-l">{{formatTime(currentTime)}}</span>
            <div class="progress-bar-wrapper">
              <progress-bar
                ref="barRef"
                :progress="progress"
                @pogress-changing="onPogressChanging"
                @pogress-changed="onPogressChanged"
              ></progress-bar>
            </div>
            <span class="time time-r">{{formatTime(currentSong.duration)}}</span>
          </div>
          <!-- 功能按钮 -->
          <div class="operators">
            <div class="icon i-left">
              <i @click="changeMode" :class="modeIcon"></i>
            </div>
            <div class="icon i-left" :class="disabileClass">
              <i @click="prev" class="icon-prev"></i>
            </div>
            <div class="icon i-center" :class="disabileClass">
              <i @click="togglePlay" :class="playIcon"></i>
            </div>
            <div class="icon i-right" :class="disabileClass">
              <i @click="next" class="icon-next"></i>
            </div>
            <div class="icon i-right">
              <i @click="toggleFavorite(currentSong)" :class="getFavoriteIcon(currentSong)"></i>
            </div>
          </div>
        </div>
      </div>
    </transition>
      <miniPlayer :progress="progress" :toggle-play="togglePlay"></miniPlayer>
      <audio
      ref="audioRef"
      @pause="pause"
      @canplay="ready"
      @error="error"
      @timeupdate="updateTime"
      @ended="end"
      ></audio>
    </div>
</template>

<script>
import { useStore } from 'vuex'
import { computed, watch, ref, nextTick } from 'vue'
import useMode from './use-mode'
import useFavorite from './use-favorite'
import useCD from './use-cd'
import useLyric from './use-lyric'
import useAnimation from './use-animation'
import usePlayHistory from './use-play-history'
import ProgressBar from './progress-bar'
import miniPlayer from './mini-player'
import Scroll from '../base/scroll/scroll.vue'
import { formatTime } from '@/assets/js/util'
import { PLAY_MODE } from '@/assets/js/constant'
import useMiddleInteractive from './use-middle-interactive'

export default {
  name: 'player',
  components: {
    ProgressBar,
    Scroll,
    miniPlayer
  },
  setup () {
    // data===================
    const audioRef = ref(null)
    const songReady = ref(false)
    const currentTime = ref(0)
    const barRef = ref(null)
    let progressChanging = false

    // vuex===================
    const store = useStore()
    // 显示播放器
    const fullScreen = computed(() => store.state.fullScreen)
    // 获取当前的歌曲
    const currentSong = computed(() => store.getters.currentSong)
    const playing = computed(() => store.state.playing)
    // 播放歌曲索引值
    const currentIndex = computed(() => store.state.currentIndex)
    const playlist = computed(() => store.state.playlist)
    const playMode = computed(() => store.state.playMode)

    // hooks==================
    const { modeIcon, changeMode } = useMode()
    const { getFavoriteIcon, toggleFavorite } = useFavorite()
    const { cdClass, cdRef, cdImageRef } = useCD()
    const { currentLyric, currentLineNum, playLyric, lyricScrollRef, lyricListRef, stopLyric, pureMusicLyric, playinglyric } = useLyric({ songReady, currentTime })
    const { currentShow, middleLStyle, middleRStyle, onMiddleTouchEnd, onMiddleTouchMove, onMiddleTouchStart } = useMiddleInteractive()
    const { cdWrapperRef, leave, afterEnter, enter, afterLeave } = useAnimation()
    const { savePlay } = usePlayHistory()

    // computed===============
    // 暂停按钮
    const playIcon = computed(() => {
      return playing.value ? 'icon-pause' : 'icon-play'
    })
    // 播放进度
    const progress = computed(() => {
      return currentTime.value / currentSong.value.duration
    })
    // 点击无效时,反馈样式
    const disabileClass = computed(() => {
      return songReady.value ? '' : 'disable'
    })

    // watch===================
    watch(currentSong, (newSong) => {
      if (!newSong.id || !newSong.url) {
        return
      }
      currentTime.value = 0
      songReady.value = false
      // audio元素对象
      const audioEl = audioRef.value
      audioEl.src = newSong.url
      audioEl.play()
      store.commit('setPlayingState', true)
    })
    watch(playing, (newPlaying) => {
      if (!songReady.value) {
        return
      }
      const audioEl = audioRef.value
      if (newPlaying) {
        audioEl.play()
        playLyric()
      } else {
        audioEl.pause()
        stopLyric()
      }
    })
    watch(fullScreen, async (newFullScreen) => {
      await nextTick()
      if (newFullScreen) {
        barRef.value.setOffset(progress.value)
      }
    })

    // methods=================
    function goBack () {
      store.commit('setFullScreen', false)
    }

    // 暂停按钮
    function togglePlay () {
      if (!songReady.value) {
        return
      }
      store.commit('setPlayingState', !playing.value)
    }
    // 电脑睡眠触发
    function pause () {
      store.commit('setPlayingState', false)
    }

    // 上一曲(改变currentIndex索引)
    function prev () {
      const list = playlist.value
      if (!songReady.value || !list.length) {
        return
      }
      if (list.length === 1) {
        loop()
      } else {
        let index = currentIndex.value - 1
        if (index === -1) {
          index = list.length - 1
        }
        store.commit('setCurrentIndex', index)
      }
    }

    // 下一曲
    function next () {
      const list = playlist.value
      if (!songReady.value || !list.length) {
        return
      }

      if (list.length === 1) {
        loop()
      } else {
        let index = currentIndex.value + 1
        if (index === list.length) {
          index = 0
        }
        store.commit('setCurrentIndex', index)
      }
    }

    function loop () {
      const audioEl = audioRef.value
      // 设置播放歌曲时间为0
      audioEl.currentTime = 0
      audioEl.play()
      store.commit('setPlayingState', true)
    }

    // 判断songready解决歌曲没有准备好被播放的报错
    function ready () {
      if (songReady.value) {
        return
      }
      songReady.value = true
      // 当歌词先准备好，歌曲没准备好不会播放歌词，所以在这里判断歌曲准备好了再执行一次playLyric
      playLyric()
      // 添加到最近播放
      savePlay(currentSong.value)
    }

    // 如果是歌曲错误时,将是否准备好歌曲的变量songReady改为true,让他可以切换下一首歌
    function error () {
      songReady.value = true
    }

    // 播放时间同步到显示的进度时间
    function updateTime (e) {
      if (!progressChanging) {
        currentTime.value = e.target.currentTime
      }
    }

    function onPogressChanging (progress) {
      progressChanging = true
      currentTime.value = currentSong.value.duration * progress
      playLyric()
      stopLyric()
    }

    function onPogressChanged (progress) {
      progressChanging = false
      audioRef.value.currentTime = currentTime.value = currentSong.value.duration * progress
      if (!playing.value) {
        store.commit('setPlayingState', true)
      }
      playLyric()
    }

    function end () {
      currentTime.value = 0
      if (playMode.value === PLAY_MODE.loop) {
        loop()
      } else {
        next()
      }
    }
    return {
      audioRef,
      barRef,
      fullScreen,
      currentSong,
      currentTime,
      playIcon,
      togglePlay,
      disabileClass,
      progress,
      goBack,
      pause,
      prev,
      next,
      loop,
      ready,
      error,
      updateTime,
      formatTime,
      onPogressChanging,
      onPogressChanged,
      end,
      playlist,
      // use-mode
      modeIcon,
      changeMode,
      // use-favorite
      getFavoriteIcon,
      toggleFavorite,
      // use-cd
      cdClass,
      cdRef,
      cdImageRef,
      // use-lyric
      currentLyric,
      currentLineNum,
      lyricScrollRef,
      lyricListRef,
      playLyric,
      pureMusicLyric,
      playinglyric,
      // use-Middle-Interactive
      currentShow,
      middleLStyle,
      middleRStyle,
      onMiddleTouchEnd,
      onMiddleTouchMove,
      onMiddleTouchStart,
      // useAnimation
      cdWrapperRef,
      leave,
      afterEnter,
      enter,
      afterLeave
    }
  }
}
</script>

<style lang="scss" scoped>
  .player {
    .normal-player {
      position: fixed;
      left: 0;
      right: 0;
      top: 0;
      bottom: 0;
      z-index: 150;
      background: $color-background;
      .background {
        position: absolute;
        left: 0;
        top: 0;
        width: 100%;
        height: 100%;
        z-index: -1;
        opacity: 0.6;
        filter: blur(20px);

        img {
          width: 100%;
          height: 100%;
        }
      }
      .top {
        position: relative;
        margin-bottom: 25px;
        .back {
          position: absolute;
          top: 0;
          left: 6px;
          z-index: 50;
        }
        .icon-back {
          display: block;
          padding: 9px;
          font-size: $font-size-large-x;
          color: $color-theme;
          transform: rotate(-90deg);
        }
        .title {
          width: 70%;
          margin: 0 auto;
          line-height: 40px;
          text-align: center;
          @include no-wrap();
          font-size: $font-size-large;
          color: $color-text;
        }
        .subtitle {
          line-height: 20px;
          text-align: center;
          font-size: $font-size-medium;
          color: $color-text;
        }
      }
      .middle {
        position: fixed;
        width: 100%;
        top: 80px;
        bottom: 170px;
        white-space: nowrap;
        font-size: 0;
        .middle-l {
          display: inline-block;
          vertical-align: top;
          position: relative;
          width: 100%;
          height: 0;
          padding-top: 80%;
          .cd-wrapper {
            position: absolute;
            left: 10%;
            top: 0;
            width: 80%;
            box-sizing: border-box;
            height: 100%;
            .cd {
              width: 100%;
              height: 100%;
              border-radius: 50%;
              img {
                position: absolute;
                left: 0;
                top: 0;
                width: 100%;
                height: 100%;
                box-sizing: border-box;
                border-radius: 50%;
                border: 10px solid rgba(255, 255, 255, 0.1);
              }
              .playing {
                animation: rotate 20s linear infinite
              }
            }
          }
          .playing-lyric-wrapper {
            width: 80%;
            margin: 30px auto 0 auto;
            overflow: hidden;
            text-align: center;
            .playing-lyric {
              height: 20px;
              line-height: 20px;
              font-size: $font-size-medium;
              color: $color-text-l;
            }
          }
        }
        .middle-r {
          display: inline-block;
          vertical-align: top;
          width: 100%;
          height: 100%;
          overflow: hidden;
          .lyric-wrapper {
            width: 80%;
            margin: 0 auto;
            overflow: hidden;
            text-align: center;
            .text {
              line-height: 32px;
              color: $color-text-l;
              font-size: $font-size-medium;
              &.current {
                color: $color-text;
              }
            }
            .pure-music {
              padding-top: 50%;
              line-height: 32px;
              color: $color-text-l;
              font-size: $font-size-medium;
            }
          }
        }
      }
      .bottom {
        position: absolute;
        bottom: 15px;
        width: 100%;
        .dot-wrapper {
          text-align: center;
          font-size: 0;
          .dot {
            display: inline-block;
            vertical-align: middle;
            margin: 0 4px;
            width: 8px;
            height: 8px;
            border-radius: 50%;
            background: $color-text-l;
            &.active {
              width: 20px;
              border-radius: 5px;
              background: $color-text-ll;
            }
          }
        }
        .progress-wrapper {
          display: flex;
          align-items: center;
          width: 80%;
          margin: 0px auto;
          padding: 10px 0;
          .time {
            color: $color-text;
            font-size: $font-size-small;
            flex: 0 0 40px;
            line-height: 30px;
            width: 40px;
            &.time-l {
              text-align: left;
            }
            &.time-r {
              text-align: right;
            }
          }
          .progress-bar-wrapper {
            flex: 1;
          }
        }
        .operators {
          display: flex;
          align-items: center;
          .icon {
            flex: 1;
            color: $color-theme;
            &.disable {
              color: $color-theme-d;
            }
            i {
              font-size: 30px;
            }
          }
          .i-left {
            text-align: right;
          }
          .i-center {
            padding: 0 20px;
            text-align: center;
            i {
              font-size: 40px;
            }
          }
          .i-right {
            text-align: left
          }
          .icon-favorite {
            color: $color-sub-theme;
          }
        }
      }
      &.normal-enter-active, &.normal-leave-active {
        transition: all .6s;
        .top, .bottom {
          transition: all .6s cubic-bezier(0.45, 0, 0.55, 1);
        }
      }
      &.normal-enter-from, &.normal-leave-to {
        opacity: 0;
        .top {
          transform: translate3d(0, -100px, 0);
        }
        .bottom {
          transform: translate3d(0, 100px, 0)
        }
      }
    }
  }
</style>
