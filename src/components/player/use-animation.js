import { ref } from 'vue'
import animations from 'create-keyframe-animation'

export default function useMnimation () {
  const cdWrapperRef = ref(null)
  let entering = false
  let leaving = false

  // player进入钩子
  function enter (el, done) {
    // 判断为了解决bug(快速点击快速点击大小播放器进入退出,快速点击afterEnter函数还没执行,就执行leave,就会出现样式混乱)
    if (leaving) {
      afterLeave()
    }
    entering = true
    const { x, y, scale } = getPosAndScale()
    const animation = {
      0: {
        transform: `translate3d(${x}px, ${y}px, 0) scale(${scale})`
      },
      100: {
        transfrom: 'translate3d(0, 0, 0) scale(1)'
      }
    }

    // 动画注册
    animations.registerAnimation({
      name: 'move',
      animation,
      presets: {
        duration: 600,
        easing: 'cubic-bezier(0.45, 0, 0.55, 1)'
      }
    })

    animations.runAnimation(cdWrapperRef.value, 'move', done)
  }

  function afterEnter (el, done) {
    entering = false
    animations.unregisterAnimation('move')
    cdWrapperRef.value.style.animation = ''
  }

  function leave (el, done) {
    // 判断为了解决bug
    if (entering) {
      afterEnter()
    }
    leaving = true
    const { x, y, scale } = getPosAndScale()
    const cdWrapperEl = cdWrapperRef.value
    cdWrapperEl.style.transition = 'all .6s cubic-bezier(0.45, 0, 0.55, 1)'
    cdWrapperEl.style.transform = `translate3d(${x}px, ${y}px, 0) scale(${scale})`
    cdWrapperEl.addEventListener('transitionend', next)

    function next () {
      leaving = true
      cdWrapperEl.removeEventListener('transitionend', next)
      done()
    }
  }

  function afterLeave (el, done) {
    leaving = false
    const cdWrapperEl = cdWrapperRef.value

    cdWrapperEl.style.transition = ''
    cdWrapperEl.style.transform = ''
  }

  // 获取动画变量
  function getPosAndScale () {
    // 小cd直径
    const targetWidth = 40
    // 大cd直径
    const width = window.innerWidth * 0.8
    // 小cd中心到左侧距离
    const paddingLeft = 40
    // 小cd中心到底部距离
    const paddingBottom = 30
    // 小cd中心到顶部距离
    const paddingTop = 80
    // cd水平偏移量
    const x = -(window.innerWidth / 2 - paddingLeft)
    // cd数值偏移量
    const y = window.innerHeight - paddingTop - width / 2 - paddingBottom
    // cd缩放比例
    const scale = targetWidth / width
    return {
      x,
      y,
      scale
    }
  }
  return {
    cdWrapperRef,
    enter,
    afterEnter,
    leave,
    afterLeave
  }
}
