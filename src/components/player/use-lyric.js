import { useStore } from 'vuex'
import { computed, watch, ref } from 'vue'
import { getLyric } from '@/service/song'
// 歌词解析插件
import Lyric from 'lyric-parser'

// 歌词
export default function useLyric ({ songReady, currentTime }) {
  const currentLyric = ref(null)
  const currentLineNum = ref(0)
  const pureMusicLyric = ref('')
  const playinglyric = ref('')
  const lyricScrollRef = ref(null)
  const lyricListRef = ref(null)

  const store = useStore()
  const currentSong = computed(() => store.getters.currentSong)

  // 监听歌曲变化
  watch(currentSong, async (newSong) => {
    if (!newSong.url || !newSong.id) {
      return
    }

    // 暂停和删除上一次播放歌词(解决歌词跳动bug)
    stopLyric()
    currentLyric.value = null
    currentLineNum.value = 0
    playinglyric.value = ''
    pureMusicLyric.value = ''

    // 请求歌词
    const lyric = await getLyric(newSong)
    store.commit('addSongLyric', {
      song: newSong,
      lyric
    })
    // 1. 这个判断是为了解决, currentSong是响应式的,歌曲切换了,可是请求的歌曲还是上一首歌
    // 2. 这里的判断是为了,如果a歌曲切换b歌曲,b又切换C,歌词获取是异步的,需要时间
    // 3. 所以在a切换b的这一次的操作后面就不需要再去执行了
    if (currentSong.value.lyric !== lyric) {
      return
    }
    // 解析歌词
    currentLyric.value = new Lyric(lyric, handleLyric)
    const hasLyric = currentLyric.value.lines.length
    if (hasLyric) {
      // 歌曲准备好
      if (songReady.value) {
        playLyric()
      }
    } else {
      playinglyric.value = pureMusicLyric.value = lyric.replace(/\[(\d{2}):(\d{2}):(\d{2})\]/g, '')
    }
  })

  function playLyric () {
    const currentLyricVal = currentLyric.value
    if (currentLyricVal) {
      currentLyricVal.seek(currentTime.value * 1000)
    }
  }

  function stopLyric () {
    const currentLyricVal = currentLyric.value
    if (currentLyricVal) {
      currentLyricVal.stop()
    }
  }

  // 每行歌词都会执行handleLyric函数
  function handleLyric ({ lineNum, txt }) {
    currentLineNum.value = lineNum
    const scrollComp = lyricScrollRef.value
    playinglyric.value = txt
    const listEl = lyricListRef.value
    if (!listEl) {
      return
    }
    if (lineNum > 5) {
      const lineEl = listEl.children[lineNum - 5]
      scrollComp.scroll.scrollToElement(lineEl, 1000)
    } else {
      scrollComp.scroll.scrollTo(0, 0, 1000)
    }
  }

  return {
    currentLyric,
    currentLineNum,
    pureMusicLyric,
    playLyric,
    lyricScrollRef,
    lyricListRef,
    stopLyric,
    playinglyric
  }
}
