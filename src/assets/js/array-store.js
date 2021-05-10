import storage from 'good-storage'

// 插入数组
function insertArray (arr, item, compare, maxLen) {
  const index = arr.findIndex(compare)
  // 这里判断是为了实现最近播放功能
  // 歌曲在队首
  if (index === 0) {
    return
  }
  // 歌曲不在队首
  if (index > 0) {
    arr.splice(index, 1)
  }
  arr.unshift(item)
  if (maxLen && arr.length > maxLen) {
    arr.pop()
  }
}

// 删除
function deleteFromArray (arr, compare) {
  const index = arr.findIndex(compare)
  if (index > -1) {
    arr.splice(index, 1)
  }
}

// 保存  (item保存对象, key存储关键字, compare回调函数比较, maxLen最大长度)
export function save (item, key, compare, maxLen) {
  // 获取storage数组
  const items = storage.get(key, [])
  // 插入数组
  insertArray(items, item, compare, maxLen)
  // 保存数组
  storage.set(key, items)
  return items
}

// 删除key中某一项
export function remove (key, compare) {
  const items = storage.get(key, [])
  deleteFromArray(items, compare)
  storage.set(key, items)
  return items
}

export function load (key) {
  return storage.get(key, [])
}

// 删除key所有
export function clear (key) {
  storage.remove(key)
  return []
}

// 保存全部数据
export function saveAll (items, key) {
  storage.set(key, items)
}
