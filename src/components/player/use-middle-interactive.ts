import { ref } from 'vue'

export default function useMiddleInteractive () {
  const currentShow = ref('cd')
  const middleLStyle = ref(null)
  const middleRStyle = ref(null)

  const touch = {}

  function onMiddleTouchStart (e) {
    touch
  }
  function onMiddleTouchMove () {

  }
  function onMiddleTouchEnd () {
      
  }
}