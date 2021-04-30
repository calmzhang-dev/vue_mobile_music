import { useStore } from 'vuex'
import { computed } from 'vue'
import { PLAY_MODE } from '@/assets/js/constant'

// 切换播放模式
export default function useMode () {
  const store = useStore()
  const playMode = computed(() => store.state.playMode)

  // 图标变化
  const modeIcon = computed(() => {
    const playModeVal = playMode.value
    return playModeVal === PLAY_MODE.sequence
      ? 'icon-sequence' : playModeVal === PLAY_MODE.random
        ? 'icon-random' : 'icon-loop'
  })

  const modeText = computed(() => {
    const playModeVal = playMode.value
    return playModeVal === PLAY_MODE.sequence
      ? '顺序播放' : playModeVal === PLAY_MODE.random
        ? '随机播放' : '单曲播放'
  })

  function changeMode () {
    // 和3取余后等于012
    const mode = (playMode.value + 1) % 3
    store.dispatch('changeMode', mode)
  }

  return {
    modeIcon,
    changeMode,
    modeText
  }
}
