<template>
    <div class="login-bg-wrapper">
        <div class="login-container">
            <h1>词汇学习系统</h1>
            <div class="input-box">
                <label>请输入你的账号：</label>
                <input v-model="userId" type="text" @keyup.enter="handleLogin">
            </div>
            <button @click="handleLogin">进入系统</button>
            <p v-if="errorMsg" class="error-msg">{{ errorMsg }}</p>
        </div>
    </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from "vue-router"

const userId = ref('')
const errorMsg = ref('')
const router = useRouter()

const handleLogin = () => {
    if (userId.value === '3039241') {
        localStorage.setItem('vocab_user_id', userId.value.trim())
        errorMsg.value = ''
        router.push('/vocab')
    } else {
        errorMsg.value = '账号错误，请重新输入'
        userId.value = ''
    }
}
</script>

<style scoped>
/* 核心修改：解决滚动条+空白问题 */
.login-bg-wrapper {
    margin: 0;
    padding: 0;
    width: 100vw;
    height: 100vh;
    /* 强制固定高度为视口高度 */
    position: fixed;
    /* 固定定位，脱离文档流，彻底避免滚动 */
    top: 0;
    left: 0;
    background-image: url('../assets/back.png');
    background-size: cover;
    background-repeat: no-repeat;
    background-attachment: fixed;
    background-position: 65% center;
    /* 微调让小王子居中 */
    display: flex;
    align-items: center;
    justify-content: flex-start;
    padding-left: 10vw;
    box-sizing: border-box;
    overflow: hidden;
    /* 双重保险：隐藏任何溢出 */
}

/* 移动端适配：背景容器 */
@media (max-width: 768px) {
    .login-bg-wrapper {
        background-position: 50% center;
        justify-content: center;
        padding-left: 0;
        overflow: hidden;
    }
}

/* 以下样式仅改1处（滚动条相关），其余完全保留 */
.login-container {
    width: 360px;
    margin: 0;
    text-align: center;
    background-color: rgba(255, 255, 255, 0.2);
    backdrop-filter: blur(8px);
    padding: 30px 20px;
    border-radius: 12px;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
    transform: translateY(-10px) translateX(-650px);
    min-width: 280px;
    margin: 0 20px;
    box-sizing: border-box;
    position: relative;
    /* 确保登录框在背景上正常显示 */
}

/* 移动端登录框适配 */
@media (max-width: 768px) {
    .login-container {
        width: 90%;
        transform: translateY(25px) translateX(0);
        padding: 25px 15px;
        background-color: rgba(255, 255, 255, 0.1);
    }

    .login-container h1 {
        font-size: 24px;
        margin-bottom: 20px;
    }

    input {
        padding: 10px 12px;
        font-size: 15px;
    }

    button {
        padding: 10px 20px;
        font-size: 15px;
    }
}

/* 标题样式优化 */
.login-container h1 {
    font-size: 28px;
    color: #2c3e50;
    margin-bottom: 25px;
    font-weight: 600;
    letter-spacing: 1px;
}

.input-box {
    margin: 20px 0;
    display: flex;
    flex-direction: column;
    gap: 8px;
}

.input-box label {
    color: #34495e;
    font-size: 14px;
    font-weight: 500;
    text-align: left;
}

input {
    padding: 12px 14px;
    font-size: 16px;
    border: 1px solid rgba(204, 204, 204, 0.6);
    border-radius: 8px;
    background-color: rgba(255, 255, 255, 0.8);
    transition: border-color 0.3s ease;
}

input:focus {
    outline: none;
    border-color: #42b983;
    box-shadow: 0 0 0 2px rgba(66, 185, 131, 0.2);
}

button {
    padding: 12px 24px;
    font-size: 16px;
    font-weight: 500;
    background: #42b983;
    color: white;
    border: none;
    border-radius: 8px;
    cursor: pointer;
    transition: background-color 0.3s ease;
    margin-top: 10px;
}

button:hover {
    background: #36a071;
}

.error {
    color: #e74c3c;
    margin-top: 12px;
    font-size: 14px;
    font-weight: 500;
}
</style>