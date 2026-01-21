<template>
    <div class="vocab-notes">
        <!-- 顶部返回首页链接 -->
        <router-link to="/vocab" class="back-home-link">返回首页</router-link>
        <!-- 顶部搜索栏 -->
        <div class="search-bar">
            <input v-model="searchKeyword" type="text" placeholder="🔍 搜索单词..." @input="loadNotes"
                class="search-input" />
        </div>

        <!-- 笔记列表 -->
        <div class="notes-list">
            <div v-for="(item, index) in noteList" :key="index" class="note-item">
                <!-- 单词与释义 + 删除按钮 -->
                <div class="note-header">
                    <span class="word">{{ item.word }}</span>
                    <span class="meaning">{{ item.meaning || '' }}</span>
                    <!-- 缩小的删除按钮 -->
                    <button @click="showDeleteConfirm(item)" class="delete-btn">
                        X
                    </button>
                </div>

                <!-- 笔记内容（点击✏️编辑） -->
                <div class="note-content">
                    <!-- 非编辑状态 -->
                    <div v-if="item.editing !== true" class="note-view">
                        <span class="edit-icon" @click="startEditing(item)">✏️</span>
                        <span class="note-text">{{ item.note }}</span>
                    </div>

                    <!-- 编辑状态 -->
                    <div v-else class="edit-box">
                        <button @click="cancelEdit(item)" class="close-edit-btn">×</button>
                        <textarea v-model="item.tempNote" rows="4" class="edit-input"
                            placeholder="请输入笔记内容..."></textarea>
                        <button @click="confirmEdit(item)" class="confirm-btn">✅ 确认修改</button>
                    </div>
                </div>
            </div>

            <!-- 空状态提示 -->
            <div v-if="noteList.length === 0" class="empty-state">
                <p>暂无笔记 📝</p>
            </div>
        </div>

        <!-- 删除确认弹窗 -->
        <div class="modal" v-if="showModal" @click.self="closeModal">
            <div class="modal-content">
                <h4>⚠️ 确认删除</h4>
                <p>确定要删除单词「{{ currentDeleteWord }}」的笔记吗？</p>
                <div class="modal-btns">
                    <button @click="confirmDelete" class="confirm-delete-btn">✅ 确认删除</button>
                    <button @click="closeModal" class="cancel-delete-btn">❌ 取消</button>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import axios from 'axios'

// 响应式数据
const searchKeyword = ref('')
const noteList = ref([])
const showModal = ref(false)
const currentDeleteWord = ref('')

// 初始化加载笔记
onMounted(() => {
    loadNotes()
})

// 加载笔记列表
const loadNotes = async () => {
    try {
        const res = await axios.get('https://english-backend-five.vercel.app/api/vocabulary/notes', {
            params: {
                keyword: searchKeyword.value
            }
        })
        if (res.data.code === 200) {
            // 为每条笔记添加临时编辑字段
            noteList.value = res.data.data.map(item => ({
                ...item,
                editing: false,
                tempNote: item.note
            }))
        }
    } catch (err) {
        console.error('加载笔记失败：', err)
        alert('获取笔记失败，请检查后端服务')
    }
}

// 开始编辑笔记（点击✏️触发）
const startEditing = (item) => {
    noteList.value = noteList.value.map(n => {
        if (n.word === item.word) {
            return {
                ...n,
                editing: true,
                tempNote: n.note // 初始化为原有笔记内容
            }
        }
        return n
    })
}

// 确认编辑
const confirmEdit = async (item) => {
    try {
        await axios.post('https://english-backend-five.vercel.app/api/vocabulary/update-note', {
            word: item.word,
            note: item.tempNote
        })
        // 更新列表并退出编辑模式
        noteList.value = noteList.value.map(n => {
            if (n.word === item.word) {
                return {
                    ...n,
                    note: item.tempNote,
                    editing: false
                }
            }
            return n
        })
        // 重新加载以更新时间排序
        loadNotes()
    } catch (err) {
        console.error('更新笔记失败：', err)
        alert('更新笔记失败')
    }
}

// 取消编辑（点击×触发）
const cancelEdit = (item) => {
    noteList.value = noteList.value.map(n => {
        if (n.word === item.word) {
            return {
                ...n,
                editing: false,
                tempNote: n.note // 重置临时内容
            }
        }
        return n
    })
}

// 显示删除确认弹窗
const showDeleteConfirm = (item) => {
    currentDeleteWord.value = item.word
    showModal.value = true
}

// 关闭弹窗
const closeModal = () => {
    showModal.value = false
    currentDeleteWord.value = ''
}

// 确认删除
const confirmDelete = async () => {
    try {
        await axios.post('https://english-backend-five.vercel.app/api/vocabulary/delete-note', {
            word: currentDeleteWord.value
        })
        // 重新加载笔记列表
        loadNotes()
        closeModal()
    } catch (err) {
        console.error('删除笔记失败：', err)
        alert('删除笔记失败')
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

.vocab-notes {
    width: 100vw;
    height: 100vh;
    min-width: 400px;
    min-height: 876px;
    background-color: #f8f9fa;
    padding: 16px;
    box-sizing: border-box;
    display: flex;
    flex-direction: column;
    overflow: hidden;
}

/* 搜索栏 */
.search-bar {
    margin-bottom: 16px;
}

.search-input {
    width: 80%;
    padding: 12px 16px;
    border: 1px solid #e0e0e0;
    border-radius: 8px;
    font-size: 16px;
    background-color: white;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
}

/* 笔记列表 */
.notes-list {
    flex: 1;
    overflow-y: auto;
    padding-right: 8px;
}

.note-item {
    background-color: white;
    border-radius: 12px;
    padding: 16px;
    margin-bottom: 12px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
    display: flex;
    flex-direction: column;
    position: relative;
}

/* 单词与释义紧凑布局 */
.note-header {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-bottom: 8px;
}

.word {
    font-size: 18px;
    font-weight: 600;
    color: #2c3e50;
    white-space: nowrap;
}

.meaning {
    font-size: 14px;
    color: #666;
    font-style: italic;
    flex: 1;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
}

/* 缩小的删除按钮 */
.delete-btn {
    width: 15px;
    height: 15px;
    border: 1px solid #ff6b6b;
    background-color: white;
    color: #ff6b6b;
    border-radius: 50%;
    font-size: 12px;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
}

.delete-btn:hover {
    background-color: #ff6b6b;
    color: white;
}

/* 笔记内容区域 */
.note-content {
    flex: 1;
    position: relative;
}

/* 非编辑状态（带✏️图标） */
.note-view {
    display: flex;
    align-items: flex-start;
    gap: 8px;
}

.edit-icon {
    font-size: 16px;
    cursor: pointer;
    color: #42b983;
    margin-top: 2px;
    flex-shrink: 0;
}

.edit-icon:hover {
    color: #2d8f66;
}

.note-text {
    color: #34495e;
    line-height: 1.5;
    display: block;
    padding: 4px 0;
}

/* 编辑状态样式 */
.edit-box {
    display: flex;
    flex-direction: column;
    gap: 12px;
    background-color: #f9f9f9;
    padding: 12px;
    border-radius: 8px;
    position: relative;
}

/* 关闭编辑按钮（右上角×） */
.close-edit-btn {
    position: absolute;
    top: 8px;
    right: 8px;
    width: 24px;
    height: 24px;
    border: none;
    background-color: transparent;
    color: #999;
    font-size: 18px;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
}

.close-edit-btn:hover {
    color: #ff6b6b;
}

.edit-input {
    width: 100%;
    padding: 10px;
    border: 1px solid #e0e0e0;
    border-radius: 6px;
    font-size: 14px;
    resize: none;
    box-sizing: border-box;
    min-height: 80px;
}

/* 确认按钮（底部居中） */
.confirm-btn {
    align-self: center;
    padding: 8px 24px;
    border: none;
    border-radius: 8px;
    font-size: 14px;
    cursor: pointer;
    background-color: #42b983;
    color: white;
}

.confirm-btn:hover {
    background-color: #2d8f66;
}

/* 空状态 */
.empty-state {
    display: flex;
    align-items: center;
    justify-content: center;
    height: 100%;
    color: #999;
    font-size: 18px;
}

/* 删除确认弹窗 */
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
    padding: 24px;
    border-radius: 12px;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
    text-align: center;
}

.modal-content h4 {
    margin: 0 0 12px 0;
    color: #ff6b6b;
}

.modal-btns {
    display: flex;
    justify-content: center;
    gap: 16px;
    margin-top: 20px;
}

.confirm-delete-btn,
.cancel-delete-btn {
    padding: 10px 24px;
    border: none;
    border-radius: 8px;
    font-size: 16px;
    cursor: pointer;
}

.confirm-delete-btn {
    background-color: #ff6b6b;
    color: white;
}

.cancel-delete-btn {
    background-color: #f0f0f0;
    color: #333;
}

/* 适配400×876手机 */
@media (max-width: 400px) {
    .vocab-notes {
        padding: 12px;
    }

    .note-item {
        padding: 12px;
    }

    .delete-btn {
        width: 14px;
        height: 14px;
        font-size: 10px;
    }

    .edit-box {
        padding: 10px;
    }
}
</style>