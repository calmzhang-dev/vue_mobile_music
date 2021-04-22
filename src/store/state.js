import { PLAY_MODE, SEARCH_KEY, FAVORITE_KEY } from '@/assets/js/constant'
import { load } from '@/assets/js/array-store'

const state = {
  // 顺序播放列表
  sequenceList: [],
  // 播放列表
  playlist: [],
  // 暂停
  playing: false,
  // 播放的方式
  playMode: PLAY_MODE.sequence,
  currentIndex: 0,
  // 显示播放器
  fullScreen: false,
  // 收藏歌曲列表
  favoriteList: load(FAVORITE_KEY),
  searchHistory: load(SEARCH_KEY),
  playHistory: []
}

export default state
