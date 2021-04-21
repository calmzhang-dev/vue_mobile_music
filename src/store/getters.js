// 当前播放的歌,用当前的索引在播放列表取值
export const currentSong = (state) => {
  return state.playlist[state.currentIndex] || {}
}
