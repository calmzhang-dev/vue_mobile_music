export function addClass (el, className) {
  // 判断元素是否包含calssName
  if (!el.classList.contains(className)) {
    el.classList.add(className)
  }
}
export function removeClass (el, className) {
  el.classList.remove(className)
}
