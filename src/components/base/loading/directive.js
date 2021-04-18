import { createApp } from 'vue'
import Loading from './loading'
import { addClass, removeClass } from '@/assets/js/dom'

const relativeCls = 'g-relative'

const loadingDirective = {
  // 这里的el是绑定到的元素,binding是参数
  mounted (el, binding) {
    console.log(binding)
    // 引入vue,实例化创建一个api,loading为根组件
    const app = createApp(Loading)
    // 将组建挂载到html,这里挂载到创建的api,(但是这里挂载创建的dom元素,实际并没有挂载到实际的dom层上)
    const instance = app.mount(document.createElement('div'))
    // 将instance添加到el对象中,为了后续可以获取到instance
    el.instance = instance
    const title = binding.arg
    if (typeof title !== 'undefined') {
      instance.setTitle(title)
    }
    if (binding.value) {
      append(el)
    }
  },
  // 组件相关数据的修改会导致组件update
  updated (el, binding) {
    const title = binding.arg
    if (typeof title !== 'undefined') {
      el.instance.setTitle(title)
    }
    if (binding.value !== binding.oldvalue) {
      binding.value ? append(el) : remove(el)
    }
  }
}

function append (el) {
  // 对插入loading位置修改css
  const style = getComputedStyle(el)
  // 查看是否有这三个元素
  if (['absolute', 'fixed', 'reactive'].indexOf(style.position) === -1) {
    debugger
    addClass(el, relativeCls)
  }
  el.appendChild(el.instance.$el)
}

function remove (el) {
  removeClass(el, relativeCls)
  if (document.body.contains(el.instance.$el)) {
    el.removeChild(el.instance.$el)
  }
}

export default loadingDirective
