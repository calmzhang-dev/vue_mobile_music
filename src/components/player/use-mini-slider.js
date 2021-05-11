import { ref, onMounted, onUnmounted, computed, watch, nextTick, onActivated, onDeactivated } from 'vue'
import { useStore } from 'vuex'
import BScroll from '@better-scroll/core'
import Slide from '@better-scroll/slide'

BScroll.use(Slide)

export default function useMiniSlider () {
  const sliderWrapperRef = ref(null)
  const slider = ref(null)

  const store = useStore()
  const fullScreen = computed(() => store.state.fullScreen)
  const playlist = computed(() => store.state.playlist)
  const currentIndex = computed(() => store.state.currentIndex)

  const sliderShow = computed(() => {
    return !fullScreen.value && !!playlist.value
  })

  onMounted(() => {
    let sliderVal

    watch(sliderShow, async (newSliderShow) => {
      // 判断播放器以及歌曲是否展示(因为他们是v-show控制展示的,没有展示就没必要处理)
      if (newSliderShow) {
        await nextTick()
        if (!sliderVal) {
          sliderVal = slider.value = new BScroll(sliderWrapperRef.value, {
            click: true,
            scrollX: true,
            scrollY: false,
            momentum: false,
            bounce: false,
            slide: {
              loop: true,
              autoplay: false
            }
          })

          sliderVal.on('slidePageChanged', ({ pageX }) => {
            store.commit('setCurrentIndex', pageX)
          })
        } else {
          sliderVal.refresh()
        }
      }
      if (newSliderShow) {
        sliderVal.goToPage(currentIndex.value, 0, 0)
      }
    })

    watch(currentIndex, (newCurrentIndex) => {
      if (sliderVal && sliderShow.value) {
        sliderVal.goToPage(newCurrentIndex, 0, 0)
      }
    })

    watch(playlist, async (newPLaylist) => {
      if (sliderVal && sliderShow.value && newPLaylist.length) {
        await nextTick()
        sliderVal.refresh()
      }
    })
  })
  onUnmounted(() => {
    if (slider.value) {
      slider.value.destroy()
    }
  })
  // keep-active路由缓存钩子
  onActivated(() => {
    // 启动better-scroll
    scroll.value.enable()
    scroll.value.refresh()
  })
  onDeactivated(() => {
    // 禁用better-scroll
    scroll.value.disable()
  })
  return {
    sliderWrapperRef,
    slider
  }
}
