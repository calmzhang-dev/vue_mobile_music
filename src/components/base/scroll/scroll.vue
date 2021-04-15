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
  setup (prop) {
    const rootRef = ref(null)
    useScroll(rootRef, prop)
    return {
      rootRef
    }
  }
}
</script>
