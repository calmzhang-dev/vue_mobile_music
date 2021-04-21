import { useStore } from 'vuex'
import { computed } from 'vue'

// 切换播放模式
export default function useMode() {
  const store = useStore()
  const palyMode = computed(() => {
    store.state.palyMode
  })
}