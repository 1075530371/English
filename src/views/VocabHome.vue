<template>
    <div class="vocab-home">
        <!-- 笔记：固定右上角 -->
        <div class="profile-btn" @click="goToPage('notes')">
            <span>📜 </span>
        </div>

        <!-- 核心区域：引用独立的 VocabSearch 组件 -->
        <div class="search-component-wrapper">
            <VocabSearch />
        </div>

        <!-- 底部功能按钮 -->
        <div class="bottom-nav">
            <button class="nav-btn" @click="goToPage('memorize')">记忆</button>
            <button class="nav-btn" @click="goToPage('review')">复习</button>
        </div>
    </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
// 引入独立的 VocabSearch 组件
import VocabSearch from '../components/VocabSearch.vue'


const router = useRouter()
const showProfile = ref(false)

// 页面跳转（点击记忆按钮跳转到 /memorize 路径，对应 VocabMemory 组件）
const goToPage = (pageName) => {
    router.push(`/${pageName}`)
}
</script>

<style scoped>
/* 核心容器：100%占满屏幕 + 无留白 + 禁止滚动 */
.vocab-home {
    width: 100vw;
    height: 100vh;
    min-width: 400px;
    min-height: 876px;
    background-color: #f8f9fa;
    display: flex;
    flex-direction: column;
    position: fixed;
    top: 0;
    left: 0;
    margin: 0 !important;
    padding: 0 !important;
    overflow: hidden !important;
    touch-action: none;
    overscroll-behavior: none;
}

/* 个人中心：固定右上角 */
.profile-btn {
    position: absolute;
    top: 16px;
    right: 16px;
    width: 40px;
    height: 40px;
    border-radius: 50%;
    background-color: #f0f0f0;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    font-size: 18px;
    z-index: 10;
    margin: 0;
    padding: 0;
}

/* 搜索组件容器：适配布局 + 下移居中 */
.search-component-wrapper {
    width: 100%;
    padding: 80px 16px 100px;
    /* 顶部下移，底部留足导航栏空间 */
    overflow-y: auto;
    /* 组件内内容过多时仅该区域滚动 */
    flex: 1;
    box-sizing: border-box;
    z-index: 1;
}

.close-btn {
    width: 100%;
    padding: 12px;
    background-color: #42b983;
    color: white;
    border: none;
    border-radius: 8px;
    font-size: 16px;
    cursor: pointer;
    margin: 0;
}

/* 底部导航栏 */
.bottom-nav {
    position: absolute;
    bottom: 0;
    left: 0;
    width: 100%;
    height: 80px;
    background-color: white;
    display: flex;
    justify-content: space-around;
    align-items: center;
    box-shadow: 0 -2px 8px rgba(0, 0, 0, 0.05);
    margin: 0;
    padding: 0;
    box-sizing: border-box;
    z-index: 5;
}

.nav-btn {
    width: 80px;
    height: 50px;
    background-color: #f0f8ff;
    color: #42b983;
    border: 1px solid #42b983;
    border-radius: 8px;
    font-size: 16px;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.3s ease;
    margin: 0;
    padding: 0;
}

.nav-btn:hover {
    background-color: #42b983;
    color: white;
}

/* 强制清除全局默认样式 */
:deep(body),
:deep(html) {
    margin: 0 !important;
    padding: 0 !important;
    overflow: hidden !important;
}

/* 适配400×876手机 */
@media (max-width: 400px) {
    .vocab-home {
        width: 100vw;
        height: 100vh;
    }

    .search-component-wrapper {
        padding: 70px 12px 90px;
    }
}
</style>