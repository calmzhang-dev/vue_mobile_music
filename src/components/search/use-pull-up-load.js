import BScroll from '@better-scroll/core'
import PullUp from '@better-scroll/pull-up'
import ObserveDOM from '@better-scroll/observe-dom'
import { ref, onMounted, onUnmounted, onDeactivated, onActivated } from 'vue'

// 注册插件
BScroll.use(PullUp)
BScroll.use(ObserveDOM)
// 下拉加载
export default function usePullUpLoad (requestData, preventPullUpLoad) {
  const scroll = ref(null)
  const rootRef = ref(null)
  const isPullUpLoad = ref(false)

  onMounted(() => {
    const scrollVal = scroll.value = new BScroll(rootRef.value, {
      observeDOM: true,
      click: true,
      pullUpLoad: true
    })

    scrollVal.on('pullingUp', pullingUpHandler)

    async function pullingUpHandler () {
      if (preventPullUpLoad.value) {
        return
      }
      isPullUpLoad.value = true
      await requestData()
      scrollVal.finishPullUp()
      scrollVal.refresh()
      isPullUpLoad.value = false
    }
  })

  onUnmounted(() => {
    scroll.value.destroy()
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
    scroll,
    rootRef,
    isPullUpLoad
  }
}
