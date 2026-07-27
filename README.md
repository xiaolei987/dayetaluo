# 🔮 大爷塔罗（Daye Tarot）

[![Version](https://img.shields.io/badge/version-1.5.3-blue.svg)](https://github.com/xiaolei987/dayetaluo)
[![License](https://img.shields.io/badge/license-MIT-green.svg)](LICENSE)
[![Platform](https://img.shields.io/badge/platform-Web%20%7C%20Android-brightgreen.svg)]()

> 一款沉浸式、仪式感强的塔罗占卜应用，结合 AI 智能解读，为年轻用户提供自我探索与情感指引。

---

## ✨ 核心特性

- 🃏 **78 张完整韦特塔罗牌** — 含正逆位释义、关键词、分类维度解读（爱情/事业/财富）
- 📐 **8 种经典牌阵** — 每日一牌、时间之流、爱情十字、六芒星、凯尔特十字等
- 🤖 **AI 智能 6 段式解读** — 牌阵能量总览 → 牌面逐一解读 → 牌面联动分析 → 综合牌阵故事 → 启发式指引 → 自我觉察提问
- 🎨 **三种解读风格** — 温柔治愈风 / 理性分析风 / 传统专业风，各有独立 System Prompt
- 📱 **双平台** — Web PWA + Android APK，Capacitor 跨平台构建
- ✨ **沉浸式动画** — 洗牌、切牌、翻牌、归位全套仪式感动效
- 📖 **牌库浏览** — 宫格展示全部 78 张牌，可按大/小阿卡纳分类筛选
- 📋 **历史记录** — 本地存储占卜记录，支持回看和收藏

---

## 🖼️ 截图

| 首页 | 抽牌 | 结果 |
|:---:|:---:|:---:|
| <!-- ![首页](public/images/screenshots/home.png) --> | <!-- ![抽牌](public/images/screenshots/draw.png) --> | <!-- ![结果](public/images/screenshots/result.png) --> |

---

## 🛠 技术栈

| 层级 | 技术 |
|-----|------|
| **前端框架** | React 19 + TypeScript |
| **构建工具** | Vite 7 + Rolldown |
| **UI 框架** | Tailwind CSS 4 + Radix UI + framer-motion |
| **路由** | react-router-dom v7 |
| **AI 集成** | DeepSeek API（流式 SSE） |
| **跨平台** | Capacitor 8（Web + Android） |
| **状态存储** | localStorage（scopedStorage） |
| **代码规范** | ESLint + Prettier |

---

## 🚀 快速开始

### 环境要求

- Node.js >= 18
- npm >= 9

### 安装运行

```bash
# 克隆项目
git clone https://github.com/xiaolei987/dayetaluo.git
cd dayetaluo

# 安装依赖
npm install

# 启动开发服务器
npm run dev

# 打开 http://localhost:5173
```

### 配置 AI 解读

在应用的「我的 → AI 接口」中配置你的 DeepSeek API Key：

- **API 地址**：`https://api.deepseek.com/v1/chat/completions`
- **模型**：`deepseek-chat`
- **API Key**：在 [DeepSeek 平台](https://platform.deepseek.com/) 获取

---

## 📱 构建 APK

```bash
# 构建前端
npm run build

# 同步 Capacitor
npx cap sync android

# 打包 APK（需要 Android SDK）
cd android && ./gradlew clean assembleDebug
```

APK 输出路径：`android/app/build/outputs/apk/debug/app-debug.apk`

---

## 📂 项目结构

```
├── public/                  # 静态资源（牌面图片、图标）
│   └── images/tarot/        # 78 张韦特塔罗牌面
├── src/
│   ├── components/          # 通用 UI 组件（Button、Card、Badge 等）
│   ├── data/                # 数据层
│   │   ├── tarotCards.ts    # 78 张牌完整结构化数据
│   │   ├── spreads.ts       # 8 种牌阵配置
│   │   └── tarotPrompts.ts  # AI 提示词模块
│   ├── lib/                 # 工具库
│   │   ├── aiApi.ts         # DeepSeek API 流式调用
│   │   └── storage.ts       # localStorage 封装
│   ├── pages/               # 页面组件
│   │   ├── HomePage/        # 首页（牌阵选择）
│   │   ├── DrawPage/        # 抽牌页（洗牌、切牌、抽牌）
│   │   ├── ResultPage/      # 结果页（牌阵展示 + AI 解读）
│   │   ├── CardLibraryPage/ # 牌库页
│   │   ├── CardDetailPage/  # 单牌详情页
│   │   ├── HistoryPage/     # 历史记录页
│   │   ├── ProfilePage/     # 个人中心页
│   │   └── DailyDrawPage.tsx # 每日一牌
│   └── types/               # TypeScript 类型定义
├── android/                 # Android 项目（Capacitor）
├── capacitor.config.ts      # Capacitor 配置
└── vite.config.ts           # Vite 配置
```

---

## 🗂 数据流

```
用户选择牌阵 → 抽牌（随机算法） → 构建 Prompt → DeepSeek 流式生成
                                    ↓
                            System Prompt（风格 + 牌阵 + 牌义）
                            + User Message（问题 + 领域）
                                    ↓
                            SSE 流式输出 → 前端 6 段解析 → 可折叠展示
```

---

## 📝 许可

MIT License — 自由使用、修改、分发。

---

## 🙏 参考

- 韦特塔罗体系（Rider-Waite Tarot）
- 塔罗葵花宝典（向日葵，2004）
- 清流的塔罗经验谈

---

<p align="center">Made with 🔮 by 大爷</p>
