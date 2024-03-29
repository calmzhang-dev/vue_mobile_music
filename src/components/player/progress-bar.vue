<template>
  <div class="progress-bar" @click="onClick">
      <div class="bar-inner">
          <div
            class="progress"
            ref="progress"
            :style="progressStyle"
          ></div>
          <div
            class="progress-btn-wrapper"
            :style="btnStyle"
            @touchstart.prevent="onTouchStart"
            @touchmove.prevent="onTouchMove"
            @touchend.prevent="onTouchEnd"
          >
            <div class="progress-btn"></div>
          </div>
      </div>
  </div>
</template>

<script>
const progressBtnWidth = 16

export default {
  name: 'progress-bar',
  emits: ['pogress-changing', 'pogress-changed'],
  props: {
    progress: {
      type: Number,
      default: 0
    }
  },
  data () {
    return {
      offset: 0
    }
  },
  computed: {
    progressStyle () {
      return `width:${this.offset}px`
    },
    btnStyle () {
      return `transform:translate3d(${this.offset}px,0,0)`
    }
  },
  watch: {
    progress (newProgress) {
      // 进度条总宽度
      this.setOffset(newProgress)
    }
  },
  created () {
    this.touch = {}
  },
  methods: {
    // 初始位置
    onTouchStart (e) {
      this.touch.x1 = e.touches[0].pageX
      this.touch.beginWidth = this.$refs.progress.clientWidth
    },

    // 偏移值
    onTouchMove (e) {
      // 偏移值
      const delta = e.touches[0].pageX - this.touch.x1
      // 移动后进度条宽度
      const tempWidth = this.touch.beginWidth + delta
      // 进度条总宽度
      const barWidth = this.$el.clientWidth - progressBtnWidth
      // 进度值 （限制最大值是 1）
      const progress = Math.min(1, Math.max(tempWidth / barWidth, 0))
      // 偏移量
      this.offset = barWidth * progress
      // 派发进度值 progress，让音乐和进度同步
      this.$emit('pogress-changing', progress)
    },

    onTouchEnd () {
      const barWidth = this.$el.clientWidth - progressBtnWidth
      const progress = this.$refs.progress.clientWidth / barWidth
      this.$emit('pogress-changed', progress)
    },

    onClick (e) {
      // 返回元素的大小及其相对于视口的位置。
      const rect = this.$el.getBoundingClientRect()
      const offsetWidth = e.pageX - rect.left
      const barWidth = this.$el.clientWidth - progressBtnWidth
      const progress = offsetWidth / barWidth
      this.$emit('pogress-changed', progress)
    },

    setOffset (progress) {
      // 进度条总宽度
      const barWidth = this.$el.clientWidth - progressBtnWidth
      this.offset = barWidth * progress
    }
  }
}
</script>

<style lang="scss" scoped>
.progress-bar {
    height: 30px;
    .bar-inner {
      position: relative;
      top: 13px;
      height: 4px;
      background: rgba(0, 0, 0, 0.3);
      .progress {
        position: absolute;
        height: 100%;
        background: $color-theme;
      }
      .progress-btn-wrapper {
        position: absolute;
        left: -8px;
        top: -13px;
        width: 30px;
        height: 30px;
        .progress-btn {
          position: relative;
          top: 7px;
          left: 7px;
          box-sizing: border-box;
          width: 16px;
          height: 16px;
          border: 3px solid $color-text;
          border-radius: 50%;
          background: $color-theme;
        }
      }
    }
  }
</style>
