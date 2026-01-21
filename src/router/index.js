import { createRouter, createWebHashHistory } from 'vue-router'
import Login from '../views/Login.vue'
import VocabHome from '../views/VocabHome.vue'
import VocabMemory from '../components/VocabMemory.vue' // 记忆组件
import VocabReview from '../components/VocabReview.vue' // 复习组件
import VocabNotes from '../components/VocabNotes.vue' // 笔记组件

//路由守卫，检查是否已经登录
const requireAuth = (to, from, next) => {
    const isLogin = localStorage.getItem('vocab_user_id') === '3039241'
    if (isLogin) {
        next()
    } else {
        next('/login')//未登录则跳转到登录页
    }
}

//配置路由
const router = createRouter({
    history: createWebHashHistory(import.meta.env.BASE_URL),
    routes: [
        { path: '/login', name: 'login', component: Login },
        { path: '/vocab', name: 'vocabHome', component: VocabHome, beforeEnter: requireAuth },//访问前验证登录
        { path: '/', redirect: '/login' },//默认跳转到登录页
        {
            path: '/memorize', name: 'VocabMemory', component: VocabMemory // 记忆组件
        },
        {
            path: '/review', name: 'VocabReview', component: VocabReview // 复习组件
        },
        {
            path: '/notes', name: 'VocabNotes', component: VocabNotes // 笔记组件
        }
    ]
})
export default router