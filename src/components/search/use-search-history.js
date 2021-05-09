import { save, remove, clear } from '@/assets/js/array-store'
import { SEARCH_KEY } from '@/assets/js/constant'
import { useStore } from 'vuex'

export default function useSearchHistory () {
  const store = useStore()
  // 保存最大长度
  const maxLen = 200
  function saveSearch (query) {
    // save存到storage,返回一个存储的数组
    const searches = save(query, SEARCH_KEY, (item) => {
      return item === query
    }, maxLen)
    // 将数组保存到store中
    store.commit('setSearchHistory', searches)
  }

  function deleteSearch (query) {
    const searches = remove(SEARCH_KEY, (item) => {
      return item === query
    })
    store.commit('setSearchHistory', searches)
  }
  function clearSearch () {
    const searches = clear(SEARCH_KEY)
    store.commit('setSearchHistory', searches)
  }
  return {
    saveSearch,
    deleteSearch,
    clearSearch,
    clear
  }
}
