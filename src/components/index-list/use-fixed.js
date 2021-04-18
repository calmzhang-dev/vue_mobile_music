import { ref, watch, computed, nextTick } from 'vue'

export default function useFixed (props) {
  // 歌手分类title的高度
  const TITLE_HEIGHT = 30
  // 元素Ref值
  const groupRef = ref(null)
  // 每个li行高
  const listHeights = ref([])
  // 滚动的Y值
  const scrollY = ref(0)
  // 当前展示标题的索引值
  const currentIndex = ref(0)
  // 当前组的下一组距离顶部的距离
  const distance = ref(0)

  // 固定歌手分类标题
  const fixedTitle = computed(() => {
    if (scrollY.value < 0) {
      return ''
    }
    const currentGroup = props.data[currentIndex.value]
    return currentGroup ? currentGroup.title : ''
  })

  // 让标题顶掉下一个标题的动画
  const fixedStyle = computed(() => {
    const distanceVal = distance.value
    // 判断title滑动到上一个title时的值
    const diff = (distanceVal > 0 && distanceVal < TITLE_HEIGHT) ? distanceVal - TITLE_HEIGHT : 0
    return {
      // 返回css垂直移动动画
      transform: `translate3d(0,${diff}px,0)`
    }
  })

  // 监听传入数据变化，这里数据变化时dom还没有变化，所以等待一个nextTick()
  watch(() => props.data, async () => {
    await nextTick()
    calculate()
  })

  watch(scrollY, (newY) => {
    const listHeightsVal = listHeights.value
    for (let i = 0; i < listHeightsVal.length - 1; i++) {
      // 顶部值
      const heightTop = listHeightsVal[i]
      // 底部值
      const heightBottom = listHeightsVal[i + 1]
      // 滚动y值，判断滚到区间内
      if (newY >= heightTop && newY <= heightBottom) {
        currentIndex.value = i
        distance.value = heightBottom - newY
      }
    }
  })

  // 计算每个歌手li的高度
  function calculate () {
    const list = groupRef.value.children
    const listHeightsVal = listHeights.value
    let height = 0
    listHeightsVal.length = 0
    listHeightsVal.push(height)
    // 累加每个歌手距离顶部的高度，后面加前面的高度
    for (let i = 0; i < list.length; i++) {
      height += list[i].clientHeight
      listHeightsVal.push(height)
    }
  }

  // 当前滚动的Y值
  function onScroll (pos) {
    scrollY.value = -pos.y
  }

  return {
    groupRef,
    onScroll,
    fixedTitle,
    fixedStyle,
    currentIndex
  }
}
