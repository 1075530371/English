<template>
    <div class="vocab-search">
        <!-- 搜索区域 -->
        <div class="search-bar">
            <input v-model="searchKeyword" type="text" placeholder="输入单词或中文释义搜索..." @keyup.enter="handleSearch"
                class="search-input" />
            <button @click="handleSearch" class="search-btn">🔍 搜索</button>
        </div>

        <!-- 发音功能（如果有音频链接） -->
        <div v-if="currentWord" class="audio-control">
            <button @click="playPronunciation" class="audio-btn">🔊 播放发音</button>
            <span class="pronunciation">{{ currentWord.pronunciation }}</span>
        </div>

        <!-- 结果展示 -->
        <div class="result-container">
            <div v-if="loading" class="loading">加载中...</div>
            <div v-else-if="searchResults.length === 0" class="empty">
                没有找到匹配的词汇
            </div>
            <div v-else class="vocab-list">
                <div v-for="(item, index) in searchResults" :key="index" class="vocab-item" @click="selectWord(item)">
                    <div class="word-header">
                        <h3 class="word">{{ item.word }}</h3>
                        <span class="frequency" :class="{ high: item.frequency > 0 }">
                            高频
                        </span>
                    </div>
                    <div class="pronunciation">{{ item.pronunciation }}</div>
                    <div class="meaning">{{ item.meaning }}</div>
                    <div class="word-components">
                        <div class="component">
                            <span class="label">前缀:</span>
                            <span class="value">{{ item.fronted || '无' }}</span>
                            <span class="desc">({{ item.fronted_meaning || '-' }})</span>
                        </div>
                        <div class="component">
                            <span class="label">后缀:</span>
                            <span class="value">{{ item.backend || '无' }}</span>
                            <span class="desc">({{ item.backend_meaning || '-' }})</span>
                        </div>
                        <div class="component">
                            <span class="label">词根:</span>
                            <span class="value">{{ item.root || '无' }}</span>
                            <span class="desc">({{ item.root_meaning || '-' }})</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import axios from 'axios'

// 响应式数据
const searchKeyword = ref('')
const searchResults = ref([])
const loading = ref(false)
const currentWord = ref(null)

// 后端接口地址
const API_BASE = 'http://localhost:3001/api/vocabulary'

// 搜索词汇
const handleSearch = async () => {
    if (!searchKeyword.value.trim()) {
        alert('请输入搜索关键词')
        return
    }
    loading.value = true
    try {
        const response = await axios.get(`${API_BASE}/list`, {
            params: {
                keyword: searchKeyword.value.trim()
            }
        })
        if (response.data.code === 200) {
            searchResults.value = response.data.data
            if (searchResults.value.length > 0) {
                currentWord.value = searchResults.value[0]
            }
        } else {
            searchResults.value = []
            alert(response.data.msg)
        }
    } catch (error) {
        console.error('搜索失败:', error)
        alert('网络错误，请稍后重试')
    } finally {
        loading.value = false
    }
}

// 选择单个单词
const selectWord = (word) => {
    currentWord.value = word
}

// 播放发音（使用浏览器原生语音合成）
const playPronunciation = () => {
    if (!currentWord.value) return
    // 浏览器原生 TTS
    const utterance = new SpeechSynthesisUtterance(currentWord.value.word)
    utterance.lang = 'en-US' // 设置为美式英语
    utterance.rate = 0.8 // 语速稍慢
    window.speechSynthesis.speak(utterance)
}
</script>

<style scoped>
.vocab-search {
    padding: 20px;
    background-color: #f8f9fa;
    min-height: 100vh;
}

.search-bar {
    display: flex;
    gap: 12px;
    margin-bottom: 24px;
}

.search-input {
    flex: 1;
    padding: 12px 16px;
    border: 1px solid #e0e0e0;
    border-radius: 8px;
    font-size: 16px;
}

.search-btn {
    padding: 0 20px;
    background-color: #42b983;
    color: white;
    border: none;
    border-radius: 8px;
    cursor: pointer;
    font-size: 16px;
}

.audio-control {
    display: flex;
    align-items: center;
    gap: 12px;
    margin-bottom: 24px;
    padding: 12px;
    background-color: white;
    border-radius: 8px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.audio-btn {
    padding: 8px 16px;
    background-color: #42b983;
    color: white;
    border: none;
    border-radius: 6px;
    cursor: pointer;
}

.pronunciation {
    color: #666;
    font-style: italic;
}

.result-container {
    width: 100%;
}

.loading,
.empty {
    text-align: center;
    padding: 40px;
    color: #666;
}

.vocab-list {
    display: flex;
    flex-direction: column;
    gap: 16px;
}

.vocab-item {
    background-color: white;
    padding: 20px;
    border-radius: 12px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
    cursor: pointer;
    transition: all 0.3s ease;
}

.vocab-item:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
}

.word-header {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-bottom: 8px;
}

.word {
    font-size: 20px;
    font-weight: 600;
    color: #2c3e50;
    margin: 0;
}

.frequency {
    font-size: 12px;
    padding: 2px 6px;
    border-radius: 4px;
    background-color: #ffd700;
    color: #8b4513;
    display: none;
}

.frequency.high {
    display: inline-block;
}

.meaning {
    color: #34495e;
    margin: 8px 0 16px 0;
    line-height: 1.5;
}

.word-components {
    display: flex;
    flex-direction: column;
    gap: 8px;
}

.component {
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 14px;
}

.label {
    color: #666;
    width: 40px;
}

.value {
    color: #42b983;
    font-weight: 500;
}

.desc {
    color: #999;
}

/* 适配400×876手机 */
@media (max-width: 400px) {
    .vocab-search {
        padding: 16px;
    }

    .word-components {
        flex-direction: column;
    }

    .component {
        flex-wrap: wrap;
    }
}
</style>