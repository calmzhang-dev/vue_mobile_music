import MusicList from '@/components/music-list/music-list'
import storage from 'good-storage'
import { processSongs } from '@/service/song'

export default function createDetailComponent (name, key, fetch) {
  return {
    name,
    components: { MusicList },
    props: {
      data: Object
    },
    data () {
      return {
        songs: [],
        loading: true
      }
    },
    computed: {
      // 过滤数据
      computedData () {
        let ret = null
        // 传入的信息
        const data = this.data
        // 判断data
        if (data) {
          ret = data
        } else {
          // (刷新时没有data,就去storage中查找)
          const cached = storage.session.get(key)
          // 判断,(请求地址id  ===  缓存信息id)
          if (cached && (cached.mid || cached.id + '') === this.$route.params.id) {
            ret = cached
          }
        }
        return ret
      },
      // 图片地址
      pic () {
        const data = this.computedData
        return data && data.pic
      },
      // 标题地址
      title () {
        const data = this.computedData
        return data && (data.name || data.title)
      }
    },
    async created () {
      const data = this.computedData
      if (!data) {
        // 无数据,跳转到首页
        const path = this.$route.matched[0].path
        this.$router.push({
          path
        })
        return
      }
      // 请求数据
      const result = await fetch(data)
      this.songs = await processSongs(result.songs)
      this.loading = false
    }
  }
}
