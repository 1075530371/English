<template>
    <div class="vocab-memory">
        <!-- 顶部配置区 -->
        <router-link to="/vocab" class="back-home-link">返回首页</router-link>
        <div class="config-bar">
            <div class="config-item">
                <label>单词等级：</label>
                <select v-model="selectedLevel" @change="loadWords">
                    <option value="4">四级</option>
                    <option value="6">六级</option>
                </select>
            </div>
            <div class="config-item">
                <label>每日数量：</label>
                <input v-model.number="dailyCount" type="number" min="1" max="50" @change="loadWords" />
            </div>
        </div>

        <!-- 进度显示 -->
        <div class="progress">
            <span>{{ currentIndex + 1 }} / {{ dailyCount }}</span>
            <div class="progress-bar">
                <div class="progress-fill" :style="{ width: `${(currentIndex + 1) / dailyCount * 100}%` }"></div>
            </div>
        </div>

        <!-- 单词卡片（支持翻转） -->
        <!-- 单词卡片（支持翻转，新增词缀含义） -->
        <div class="word-card" @click="flipCard">
            <div v-if="!isCardFlipped" class="card-front">
                <h2 class="word">{{ currentWord.word || '加载中...' }}</h2>
                <div class="pronunciation-row">
                    <p class="pronunciation">{{ currentWord.pronunciation || '' }}</p>

                </div>
                <p class="meaning-back">{{ currentWord.meaning || '' }}</p>

                <div class="components" v-if="currentWord.fronted || currentWord.root || currentWord.backend">
                    <!-- 前缀 + 前缀含义 -->
                    <span v-if="currentWord.fronted" class="component-item">
                        前缀: {{ currentWord.fronted }}
                        <span v-if="currentWord.fronted_meaning" class="meaning-text">({{ currentWord.fronted_meaning
                        }})</span>
                    </span>
                    <!-- 词根 + 词根含义 -->
                    <span v-if="currentWord.root" class="component-item">
                        词根: {{ currentWord.root }}
                        <span v-if="currentWord.root_meaning" class="meaning-text">({{ currentWord.root_meaning
                        }})</span>
                    </span>
                    <!-- 后缀 + 后缀含义 -->
                    <span v-if="currentWord.backend" class="component-item">
                        后缀: {{ currentWord.backend }}
                        <span v-if="currentWord.backend_meaning" class="meaning-text">({{ currentWord.backend_meaning
                        }})</span>
                    </span>
                </div>
            </div>
            <div v-else class="card-back">
                <p class="meaning-back">{{ currentWord.meaning || '' }}</p>
            </div>
        </div>

        <!-- 手写草稿本（增大尺寸） -->
        <div class="blackboard">
            <button @click.stop="playPronunciation" class="audio-btn">🔊</button>

            <h4>✍️ 草稿本</h4>
            <canvas ref="canvasRef" width="360" height="220" @touchstart="startDraw" @touchmove="drawing"
                @mousedown="startDraw" @mousemove="drawing" @mouseup="stopDraw" @mouseleave="stopDraw"
                @touchend="stopDraw" class="canvas"></canvas>
            <button @click="clearCanvas" class="clear-btn">🗑️ 清空</button>

        </div>

        <!-- 底部操作栏 -->
        <div class="action-bar">
            <button @click="markAsMastered" class="mastered-btn">✅ 已记忆</button>
            <button @click="showNoteModal = true" class="note-btn">📝 笔记</button>
        </div>

        <!-- 笔记弹窗 -->
        <div class="modal" v-if="showNoteModal" @click.self="showNoteModal = false">
            <div class="modal-content">
                <h4>添加笔记</h4>
                <textarea v-model="noteContent" placeholder="输入你的记忆技巧、例句等..." rows="4"></textarea>
                <div class="modal-btns">
                    <button @click="saveNote" class="save-note-btn">💾 保存</button>
                    <button @click="showNoteModal = false" class="cancel-btn">❌ 取消</button>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import axios from 'axios'

// 配置数据
const selectedLevel = ref(4)
const dailyCount = ref(20)
const currentIndex = ref(0)
const wordList = ref([])
const currentWord = ref({})
const isCardFlipped = ref(false)

// 手写相关
const canvasRef = ref(null)
const isDrawing = ref(false)
let ctx = null
let lastX = 0
let lastY = 0

// 笔记相关
const showNoteModal = ref(false)
const noteContent = ref('')

// 初始化
onMounted(() => {
    // 加载本地配置
    const savedLevel = localStorage.getItem('vocabLevel')
    const savedCount = localStorage.getItem('dailyMemorizeCount')
    if (savedLevel) selectedLevel.value = Number(savedLevel)
    if (savedCount) dailyCount.value = Number(savedCount)

    // 初始化Canvas
    initCanvas()
    // 加载单词
    loadWords()
})

onUnmounted(() => {
    isDrawing.value = false
    ctx = null
})

// 初始化Canvas
const initCanvas = () => {
    if (!canvasRef.value) return
    const canvas = canvasRef.value
    ctx = canvas.getContext('2d')
    const dpr = window.devicePixelRatio || 1
    canvas.width = 360 * dpr
    canvas.height = 220 * dpr
    ctx.scale(dpr, dpr)
    ctx.lineWidth = 3
    ctx.lineCap = 'round'
    ctx.strokeStyle = '#333'
    ctx.fillStyle = '#f8f8f8'
    ctx.fillRect(0, 0, 360, 220)
}

// 加载单词列表（抽取未学过且序号间隔较远的单词）
const loadWords = async () => {
    try {
        // 保存配置到本地
        localStorage.setItem('vocabLevel', selectedLevel.value)
        localStorage.setItem('dailyMemorizeCount', dailyCount.value)

        // 从后端获取未学过且随机不连续的单词
        const res = await axios.get('http://localhost:3001/api/vocabulary/list', {
            params: {
                level: selectedLevel.value,
                count: dailyCount.value,
                // 后端需支持：只抽未学过（is_mastered=0）且按ID间隔抽取
                unlearned: true
            }
        })
        if (res.data.code === 200) {
            wordList.value = res.data.data
            currentIndex.value = 0
            currentWord.value = wordList.value[0] || {}
            // 加载当前单词的笔记
            await loadNote()
            // 清空画布
            clearCanvas()
        }
    } catch (err) {
        console.error('加载单词失败：', err)
        alert('获取单词失败，请检查后端服务')
    }
}

// 加载单词笔记
const loadNote = async () => {
    if (!currentWord.value.word) return
    try {
        const res = await axios.get('http://localhost:3001/api/vocabulary/detail', {
            params: { word: currentWord.value.word }
        })
        if (res.data.code === 200) {
            noteContent.value = res.data.data.note || ''
        }
    } catch (err) {
        console.error('加载笔记失败：', err)
    }
}

// 卡片翻转
const flipCard = () => {
    isCardFlipped.value = !isCardFlipped.value
}

// 播放发音
const playPronunciation = () => {
    if (!currentWord.value.word) return
    const utterance = new SpeechSynthesisUtterance(currentWord.value.word)
    utterance.lang = 'en-US'
    utterance.rate = 0.8
    window.speechSynthesis.speak(utterance)
}

// 标记为已掌握
const markAsMastered = async () => {
    if (!currentWord.value.word) return
    try {
        await axios.post('http://localhost:3001/api/vocabulary/mark', {
            word: currentWord.value.word,
            is_mastered: 1
        })
        // 切换到下一个单词
        if (currentIndex.value < dailyCount.value - 1) {
            currentIndex.value++
            currentWord.value = wordList.value[currentIndex.value]
            isCardFlipped.value = false
            clearCanvas()
            await loadNote()
        } else {
            alert('🎉 今日单词已全部完成！')
            loadWords() // 重新加载明日单词
        }
    } catch (err) {
        console.error('标记失败：', err)
        alert('标记已记忆失败')
    }
}

// 保存笔记
const saveNote = async () => {
    if (!currentWord.value.word || !noteContent.value.trim()) {
        alert('请输入笔记内容')
        return
    }
    try {
        await axios.post('http://localhost:3001/api/vocabulary/save-note', {
            word: currentWord.value.word,
            note: noteContent.value
        })
        alert('笔记保存成功！')
        showNoteModal.value = false
    } catch (err) {
        console.error('保存笔记失败：', err)
        alert('保存笔记失败')
    }
}

// 手写功能
const startDraw = (e) => {
    e.preventDefault()
    isDrawing.value = true
    const { clientX, clientY } = e.touches ? e.touches[0] : e
    const rect = canvasRef.value.getBoundingClientRect()
    lastX = clientX - rect.left
    lastY = clientY - rect.top
}

const drawing = (e) => {
    if (!isDrawing.value) return
    e.preventDefault()
    const { clientX, clientY } = e.touches ? e.touches[0] : e
    const rect = canvasRef.value.getBoundingClientRect()
    const x = clientX - rect.left
    const y = clientY - rect.top
    ctx.beginPath()
    ctx.moveTo(lastX, lastY)
    ctx.lineTo(x, y)
    ctx.stroke()
    lastX = x
    lastY = y
}

const stopDraw = () => {
    isDrawing.value = false
}

const clearCanvas = () => {
    ctx.fillRect(0, 0, 360, 220)
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

.vocab-memory {
    width: 100vw;
    height: 100vh;
    min-width: 400px;
    min-height: 876px;
    background-color: #f8f9fa;
    padding: 0;
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

/* 单词卡片（缩小尺寸） */
.word-card {
    background-color: white;
    border-radius: 16px;
    padding: 20px;
    margin-bottom: 16px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
    text-align: center;
    cursor: pointer;
    transition: transform 0.3s ease;
    flex: 0 0 auto;
    min-height: 240px;
    display: flex;
    flex-direction: column;
    justify-content: center;
}

.word-card:hover {
    transform: translateY(-2px);
}

.card-front .word {
    font-size: 26px;
    color: #2c3e50;
    margin: 0 0 8px 0;
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
    margin-bottom: 12px;
}

.components {
    display: flex;
    justify-content: center;
    gap: 12px;
    font-size: 14px;
    color: #666;
    flex-wrap: wrap;
}

.card-back {
    display: flex;
    align-items: center;
    justify-content: center;
    height: 100%;
}

.meaning-back {
    color: #34495e;
    font-size: 18px;
    line-height: 1.6;
    padding: 0 16px;
}

/* 手写草稿本（增大尺寸） */
.blackboard {
    margin-bottom: 16px;
    flex: 1;
    display: flex;
    flex-direction: column;
}

.blackboard h4 {
    color: #2c3e50;
    margin: 0 0 8px 0;
    font-size: 16px;
}

.canvas {
    width: 100%;
    height: 100%;
    min-height: 220px;
    background-color: #f8f8f8;
    border: 1px solid #e0e0e0;
    border-radius: 8px;
    touch-action: none;
    cursor: crosshair;
    flex: 1;
}

.clear-btn {
    padding: 6px 12px;
    background-color: #f0f8ff;
    border: 1px solid #42b983;
    color: #42b983;
    border-radius: 6px;
    font-size: 14px;
    cursor: pointer;
    margin-top: 8px;
    align-self: flex-start;
    margin: auto;
    margin-top: 5px;
}

/* 底部操作栏 */
.action-bar {
    display: flex;
    justify-content: space-between;
    padding: 0 8px;
    margin-top: auto;
}

.mastered-btn {
    padding: 12px 30px;
    background-color: #42b983;
    color: white;
    border: none;
    border-radius: 8px;
    font-size: 16px;
    cursor: pointer;
}

.note-btn {
    padding: 12px 20px;
    background-color: #f0f8ff;
    border: 1px solid #42b983;
    color: #42b983;
    border-radius: 8px;
    font-size: 16px;
    cursor: pointer;
}

/* 笔记弹窗 */
.modal {
    position: fixed;
    top: 0;
    left: 0;
    width: 100vw;
    height: 100vh;
    background-color: rgba(0, 0, 0, 0.5);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 100;
}

.modal-content {
    width: 320px;
    background-color: white;
    padding: 20px;
    border-radius: 12px;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
}

.modal-content h4 {
    margin: 0 0 12px 0;
    color: #2c3e50;
}

.modal-content textarea {
    width: 100%;
    padding: 10px;
    border: 1px solid #e0e0e0;
    border-radius: 6px;
    font-size: 14px;
    resize: none;
    margin-bottom: 12px;
    box-sizing: border-box;
}

.modal-btns {
    display: flex;
    justify-content: flex-end;
    gap: 8px;
}

.save-note-btn {
    padding: 8px 16px;
    background-color: #42b983;
    color: white;
    border: none;
    border-radius: 6px;
    cursor: pointer;
}

.cancel-btn {
    padding: 8px 16px;
    background-color: #f0f0f0;
    border: none;
    border-radius: 6px;
    cursor: pointer;
}

/* 词缀项样式 */
.component-item {
    display: inline-flex;
    align-items: center;
    gap: 4px;
    padding: 4px 8px;
    background-color: #f5f8ff;
    border-radius: 6px;
    margin: 4px;
}

/* 词缀含义文本样式 */
.meaning-text {
    color: #42b983;
    font-size: 12px;
    font-weight: normal;
}

/* 适配400×876手机，消除留白 */
@media (max-width: 400px) {
    .vocab-memory {
        width: 100vw;
        height: 100vh;
        padding: 8px 12px;
    }

    .config-bar {
        flex-direction: column;
        gap: 8px;
    }

    .word-card {
        padding: 16px;
        min-height: 160px;
    }

    .blackboard {
        margin-bottom: 12px;
    }
}
</style>