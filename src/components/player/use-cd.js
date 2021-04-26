import { useStore } from 'vuex'
import { computed, ref, watch } from 'vue'

export default function useCD () {
  const cdRef = ref(null)
  const cdImageRef = ref(null)

  const store = useStore()
  const playing = computed(() => store.state.playing)

  const cdClass = computed(() => {
    return playing.value ? 'playing' : ''
  })

  watch(playing, (newplaying) => {
    if (!newplaying) {
      syncTransfrom(cdRef.value, cdImageRef.value)
    }
  })

  function syncTransfrom (wraper, inner) {
    const wapperTransform = getComputedStyle(wraper).transform
    const innerTransform = getComputedStyle(inner).transform
    wraper.style.transform = wapperTransform === 'none' ? innerTransform : innerTransform.concat(' ', wapperTransform)
  }
  return {
    cdClass,
    cdRef,
    cdImageRef
  }
}
