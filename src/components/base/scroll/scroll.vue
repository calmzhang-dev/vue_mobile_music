<template>
  <!-- 滑动屏幕组件 -->
  <div ref="rootRef">
    <slot></slot>
  </div>
</template>

<script>
import useScroll from './use-scroll'
import { ref } from 'vue'
export default {
  name: 'scroll',
  props: {
    click: {
      type: Boolean,
      defalt: true
    },
    probeType: {
      type: Number,
      default: 0
    }
  },
  // 自定义事件vue3.0写法
  emits: ['scroll'],
  setup (props, { emit }) {
    const rootRef = ref(null)
    const scroll = useScroll(rootRef, props, emit)

    return {
      rootRef,
      scroll
    }
  }
}
</script>
