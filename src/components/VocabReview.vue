<template>
    <div class="vocab-review">
        <router-link to="/vocab" class="back-home-link">返回首页</router-link>
        <!-- 顶部配置区 -->
        <div class="config-bar">
            <div class="config-item">
                <label>单词等级：</label>
                <select v-model="selectedLevel" @change="loadReviewWords">
                    <option value="4">四级</option>
                    <option value="6">六级</option>
                </select>
            </div>
            <div class="config-item">
                <label>复习数量：</label>
                <input v-model.number="reviewCount" type="number" min="1" max="50" @change="loadReviewWords" />
            </div>
        </div>

        <!-- 进度显示 -->
        <div class="progress">
            <span>{{ currentIndex + 1 }} / {{ reviewCount }}</span>
            <div class="progress-bar">
                <div class="progress-fill" :style="{ width: `${(currentIndex + 1) / reviewCount * 100}%` }"></div>
            </div>
        </div>

        <!-- 单词卡片（无翻转） -->
        <div class="word-card">
            <h2 class="word">{{ currentWord.word || '加载中...' }}</h2>
            <div class="pronunciation-row">
                <p class="pronunciation">{{ currentWord.pronunciation || '' }}</p>
                <button @click.stop="playPronunciation" class="audio-btn">🔊</button>
            </div>
            <!-- 单词释义 -->
            <p class="meaning">{{ currentWord.meaning || '' }}</p>
            <!-- 词缀+含义 -->
            <div class="components" v-if="currentWord.fronted || currentWord.root || currentWord.backend">
                <span v-if="currentWord.fronted" class="component-item">
                    前缀: {{ currentWord.fronted }}
                    <span v-if="currentWord.fronted_meaning" class="meaning-text">({{ currentWord.fronted_meaning
                        }})</span>
                </span>
                <span v-if="currentWord.root" class="component-item">
                    词根: {{ currentWord.root }}
                    <span v-if="currentWord.root_meaning" class="meaning-text">({{ currentWord.root_meaning }})</span>
                </span>
                <span v-if="currentWord.backend" class="component-item">
                    后缀: {{ currentWord.backend }}
                    <span v-if="currentWord.backend_meaning" class="meaning-text">({{ currentWord.backend_meaning
                        }})</span>
                </span>
            </div>
        </div>

        <!-- 操作按钮 -->
        <div class="action-bar">
            <button @click="markAsReviewed" class="reviewed-btn">✅ 已复习</button>
            <button @click="markAsUnmastered" class="unmastered-btn">❌ 未掌握</button>
        </div>
    </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import axios from 'axios'

// 配置数据
const selectedLevel = ref(4)
const reviewCount = ref(20)
const currentIndex = ref(0)
const reviewWordList = ref([])
const currentWord = ref({})

// 初始化
onMounted(() => {
    // 读取本地配置
    const savedLevel = localStorage.getItem('vocabLevel')
    const savedReviewCount = localStorage.getItem('dailyReviewCount')
    if (savedLevel) selectedLevel.value = Number(savedLevel)
    if (savedReviewCount) reviewCount.value = Number(savedReviewCount)

    // 加载复习单词
    loadReviewWords()
})

// 加载复习单词（已掌握+复习次数最少）
const loadReviewWords = async () => {
    try {
        // 保存配置到本地
        localStorage.setItem('vocabLevel', selectedLevel.value)
        localStorage.setItem('dailyReviewCount', reviewCount.value)

        const res = await axios.get('https://english-backend-five.vercel.app/api/vocabulary/review-list', {
            params: {
                level: selectedLevel.value,
                count: reviewCount.value
            }
        })

        if (res.data.code === 200) {
            reviewWordList.value = res.data.data
            currentIndex.value = 0
            currentWord.value = reviewWordList.value[0] || {}
        }
    } catch (err) {
        console.error('加载复习单词失败：', err)
        alert('获取复习单词失败，请检查后端服务')
    }
}

// 播放发音
const playPronunciation = () => {
    if (!currentWord.value.word) return
    const utterance = new SpeechSynthesisUtterance(currentWord.value.word)
    utterance.lang = 'en-US'
    utterance.rate = 0.8
    window.speechSynthesis.speak(utterance)
}

// 标记为已复习（复习次数+1，更新最后复习时间）
const markAsReviewed = async () => {
    if (!currentWord.value.word) return
    try {
        await axios.post('https://english-backend-five.vercel.app/api/vocabulary/add-review', {
            word: currentWord.value.word
        })

        // 切换到下一个单词
        if (currentIndex.value < reviewCount.value - 1) {
            currentIndex.value++
            currentWord.value = reviewWordList.value[currentIndex.value]
        } else {
            alert('🎉 今日复习已完成！')
            loadReviewWords() // 重新加载（可选）
        }
    } catch (err) {
        console.error('标记已复习失败：', err)
        alert('标记已复习失败')
    }
}

// 标记为未掌握（重置is_mastered=0）
const markAsUnmastered = async () => {
    if (!currentWord.value.word) return
    try {
        await axios.post('https://english-backend-five.vercel.app/api/vocabulary/reset-mastered', {
            word: currentWord.value.word
        })

        // 切换到下一个单词
        if (currentIndex.value < reviewCount.value - 1) {
            currentIndex.value++
            currentWord.value = reviewWordList.value[currentIndex.value]
        } else {
            alert('🎉 今日复习已完成！')
            loadReviewWords() // 重新加载（可选）
        }
    } catch (err) {
        console.error('标记未掌握失败：', err)
        alert('标记未掌握失败')
    }
}
</script>

<style scoped>
/* 返回首页链接样式 */
.back-home-link {
    display: block;
    text-align: left;
    margin-bottom: 12px;
    color: #42b983;
    text-decoration: none;
    font-size: 16px;
}

.back-home-link:hover {
    color: #2d8f66;
}

.vocab-review {
    width: 100vw;
    height: 100vh;
    min-width: 400px;
    min-height: 876px;
    background-color: #f8f9fa;
    padding: 12px 16px;
    box-sizing: border-box;
    display: flex;
    flex-direction: column;
    overflow: hidden;
    touch-action: none;
}

/* 顶部配置栏 */
.config-bar {
    display: flex;
    justify-content: space-between;
    margin-bottom: 12px;
    padding: 8px;
    background-color: white;
    border-radius: 8px;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
}

.config-item {
    display: flex;
    align-items: center;
    gap: 8px;
}

.config-item select,
.config-item input {
    padding: 4px 8px;
    border: 1px solid #e0e0e0;
    border-radius: 4px;
    font-size: 14px;
}

/* 进度条 */
.progress {
    margin-bottom: 12px;
    text-align: center;
    color: #666;
    font-size: 14px;
}

.progress-bar {
    width: 100%;
    height: 6px;
    background-color: #e0e0e0;
    border-radius: 3px;
    margin-top: 4px;
    overflow: hidden;
}

.progress-fill {
    height: 100%;
    background-color: #42b983;
    transition: width 0.3s ease;
}

/* 单词卡片 */
.word-card {
    background-color: white;
    border-radius: 16px;
    padding: 20px;
    margin-bottom: 20px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
    flex: 1;
    display: flex;
    flex-direction: column;
    justify-content: center;
}

.word {
    font-size: 26px;
    color: #2c3e50;
    margin: 0 0 8px 0;
    text-align: center;
}

.pronunciation-row {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    margin-bottom: 12px;
}

.pronunciation {
    color: #666;
    font-style: italic;
    margin: 0;
}

.audio-btn {
    width: 32px;
    height: 32px;
    border: none;
    background-color: #f0f8ff;
    color: #42b983;
    border-radius: 50%;
    cursor: pointer;
    font-size: 16px;
    display: flex;
    align-items: center;
    justify-content: center;
}

.meaning {
    color: #34495e;
    font-size: 16px;
    line-height: 1.5;
    margin-bottom: 16px;
    text-align: center;
    padding: 0 10px;
}

/* 词缀样式 */
.components {
    display: flex;
    flex-wrap: wrap;
    justify-content: center;
    gap: 8px;
    margin-top: 10px;
}

.component-item {
    display: inline-flex;
    align-items: center;
    gap: 4px;
    padding: 4px 8px;
    background-color: #f5f8ff;
    border-radius: 6px;
    font-size: 14px;
}

.meaning-text {
    color: #42b983;
    font-size: 12px;
    font-weight: normal;
}

/* 操作按钮栏 */
.action-bar {
    display: flex;
    justify-content: space-around;
    padding: 0 8px;
    margin-top: auto;
}

.reviewed-btn {
    padding: 14px 35px;
    background-color: #42b983;
    color: white;
    border: none;
    border-radius: 8px;
    font-size: 16px;
    cursor: pointer;
    flex: 1;
    margin: 0 8px;
}

.unmastered-btn {
    padding: 14px 35px;
    background-color: #ff6b6b;
    color: white;
    border: none;
    border-radius: 8px;
    font-size: 16px;
    cursor: pointer;
    flex: 1;
    margin: 0 8px;
}

/* 适配400×876手机 */
@media (max-width: 400px) {
    .vocab-review {
        padding: 8px 12px;
    }

    .config-bar {
        flex-direction: column;
        gap: 8px;
    }

    .word-card {
        padding: 16px;
    }

    .reviewed-btn,
    .unmastered-btn {
        padding: 12px 25px;
        font-size: 15px;
    }
}
</style>