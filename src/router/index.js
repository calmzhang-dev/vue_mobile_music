import { createRouter, createWebHashHistory } from 'vue-router'
const Recommend = () => import('@/views/recommend' /* webpackChunkName: "Recommend" */)
// import Recommend from '@/views/recommend'
const Singer = () => import('@/views/singer' /* webpackChunkName: "Singer" */)
// import Singer from '@/views/singer'
// import TopList from '@/views/top-list'
const TopList = () => import('@/views/top-list' /* webpackChunkName: "TopList" */)
// import Search from '@/views/search'
const Search = () => import('@/views/search' /* webpackChunkName: "Search" */)
// import SingerDetail from '@/views/singer-detail'
const SingerDetail = () => import('@/views/singer-detail' /* webpackChunkName: "SingerDetail" */)
// import Album from '@/views/album'
const Album = () => import('@/views/album' /* webpackChunkName: "Album" */)
// import TopDetail from '@/views/top-detail'
const TopDetail = () => import('@/views/top-detail' /* webpackChunkName: "TopDetail" */)
// import UserCenter from '@/views/user-center'
const UserCenter = () => import('@/views/user-center' /* webpackChunkName: "UserCenter" */)

const routes = [
  {
    path: '/',
    redirect: '/recommend'
  },
  {
    path: '/recommend',
    component: Recommend,
    children: [
      {
        path: ':id',
        component: Album
      }
    ]
  },
  {
    path: '/singer',
    component: Singer,
    children: [
      {
        path: ':id',
        component: SingerDetail
      }
    ]
  },
  {
    path: '/top-list',
    component: TopList,
    children: [
      {
        path: ':id',
        component: TopDetail
      }
    ]
  },
  {
    path: '/search',
    component: Search,
    children: [
      {
        path: ':id',
        component: SingerDetail
      }
    ]
  },
  {
    path: '/user',
    components: {
      user: UserCenter
    }
  }
]

const router = createRouter({
  history: createWebHashHistory(),
  routes
})

export default router
