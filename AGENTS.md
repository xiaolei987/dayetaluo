# 大爷塔罗 - 需求拆解文档

## 产品概述

- **产品类型**: 塔罗占卜Web应用
- **场景类型**: <scene_type>prototype-app</scene_type>
- **目标用户**: 年轻女性用户（18-35岁），对塔罗占卜有兴趣，活跃于小红书等社交平台
- **核心价值**: 提供沉浸式、仪式感强的塔罗占卜体验，结合AI智能解读，满足用户自我探索、情感指引和社交分享需求
- **界面语言**: 中文
- **主题偏好**: 浅色（小红书风格小清新 + 经典韦特塔罗）
- **导航模式**: 路径导航
- **导航布局**: Topbar（消费者前台应用，面向C端用户）

---

## 页面结构总览

| 页面名称 | 文件名 | 路由 | 页面类型 | 入口来源 |
|---------|-------|------|---------|---------|
| 首页 | `HomePage.tsx` | `/` | 一级 | 导航 |
| 抽牌页 | `DrawPage.tsx` | `/draw/:spreadId` | 二级 | 首页 → 牌阵卡片点击 |
| 牌阵结果页 | `ResultPage.tsx` | `/result/:readingId` | 二级 | 抽牌页 → 完成抽牌 |
| 牌库页 | `CardLibraryPage.tsx` | `/library` | 一级 | 导航 |
| 单牌详情页 | `CardDetailPage.tsx` | `/library/:cardId` | 二级 | 牌库页 → 卡牌点击 |
| 历史记录页 | `HistoryPage.tsx` | `/history` | 一级 | 导航 |
| 历史详情页 | `HistoryDetailPage.tsx` | `/history/:readingId` | 二级 | 历史记录页 → 记录点击 |
| 个人中心页 | `ProfilePage.tsx` | `/profile` | 一级 | 导航 |

---

## 页面布局建议

- **抽牌页**: 全屏沉浸式布局，视觉重心在牌堆交互区，结果承载区为已抽取卡牌展示区（初始态为空状态提示）
- **牌阵结果页**: 上下分区布局（移动端）/ 左右分栏布局（桌面端），视觉重心在牌阵布局展示区，结果承载区为AI解读面板（初始态为输入问题引导）
- **牌库页**: 宫格/列表布局，视觉重心在卡牌缩略图网格，结果承载区为筛选后的卡牌列表（初始态为全部卡牌展示）
- **历史记录页**: 列表布局，视觉重心在记录卡片列表，结果承载区为时间倒序记录（初始态为空状态引导首次占卜）

---

## 插件规划

| 插件实例名称 | 基于官方插件 | 业务用途 | 输出模式 | 所属页面 |
|------------|-----------|---------|---------|---------|
| tarot-reading-generator | ai-text-generate | 根据牌阵、卡牌、正逆位、用户问题和解读风格，生成结构化塔罗解读 | stream | 牌阵结果页 |
| tarot-followup-chat | ai-text-generate | 支持用户针对解读结果追问，进行深入对话交流 | stream | 牌阵结果页 |

---

## 导航配置

- **导航布局**: Topbar（顶部固定，消费者前台应用）
- **导航项**（仅一级页面）:

| 导航文字 | 路由 | 图标(可选) |
|---------|------|-----------|
| 首页 | `/` | Home |
| 牌库 | `/library` | BookOpen |
| 历史 | `/history` | Clock |
| 我的 | `/profile` | User |

---

## 数据来源声明

| 数据/操作 | 来源类型 | 实现要求 | mock 兜底 |
|---|---|---|---|
| 78张塔罗牌基础数据（牌名、关键词、释义、分类） | demo-mock | `src/data/tarotCards.ts` 常量数组，含完整78张牌的结构化数据 | ✅ 本身就是 mock |
| 牌阵配置数据（牌阵名称、位置含义、布局坐标） | demo-mock | `src/data/spreads.ts` 常量数组，含8种牌阵的配置信息 | ✅ 本身就是 mock |
| 抽牌随机结果（正逆位、牌面选择） | demo-mock | 前端随机算法生成，每次抽牌产生新的随机结果 | ✅ 本身就是 mock |
| AI塔罗解读生成 | real-plugin | capabilityClient.callStream 调 tarot-reading-generator 实例，传入牌阵信息、卡牌列表（含正逆位）、用户问题和解读风格，流式输出结构化解读文本 | 无（插件能力不可 mock） |
| AI追问对话 | real-plugin | capabilityClient.callStream 调 tarot-followup-chat 实例，传入历史解读上下文和用户追问问题，流式输出对话回复 | 无（插件能力不可 mock） |
| 占卜历史记录 | local-persist | localStorage key=`__tarot_readings`，存储 ReadingRecord[] 数组 | 无 |
| 收藏记录 | local-persist | localStorage key=`__tarot_favorites`，存储收藏的 readingId 列表 | 无 |
| 用户统计数据（累计占卜次数） | local-persist | 从 `__tarot_readings` 数组长度计算得出 | 无 |
| 分享卡片生成 | import-export | 基于解读结果动态生成分享图（Canvas 绘制或 DOM 截图），支持保存/复制 | 无 |

---

## 功能列表

### 首页
- **页面目标**: 展示品牌形象，引导用户选择牌阵开始占卜
- **功能点**:
  - **品牌展示**: 顶部展示「大爷塔罗」logo 和品牌标识
  - **每日一牌入口**: 快捷入口，点击直接进入每日一牌牌阵的抽牌流程
  - **牌阵卡片宫格**: 以卡片列表形式展示8种牌阵，每张卡片含封面图、牌阵名称、牌数、适用场景描述
  - **导航切换**: 底部导航栏支持首页、牌库、历史、我的四个一级页面切换

### 抽牌页
- **页面目标**: 提供沉浸式抽牌体验，完成洗牌、切牌、抽牌全流程
- **功能点**:
  - **问题输入**: 用户输入占卜问题的输入框，支持选填
  - **洗牌动效**: 点击洗牌按钮触发沉浸式洗牌动画，卡牌有随机位移和旋转，模拟真实洗牌物理效果
  - **切牌操作**: 洗牌完成后，用户可手动拖拽或点击进行切牌，增强仪式感
  - **自由抽牌**: 用户可从牌堆中自由点击选取指定位置的牌（根据牌阵所需数量）
  - **自动抽牌**: 一键随机抽取指定数量的牌，跳过手动选牌步骤
  - **翻牌动画**: 抽牌完成后，卡牌以3D翻转效果逐张翻开，配合过渡动画

### 牌阵结果页
- **页面目标**: 展示牌阵布局和AI解读结果，支持追问和保存
- **功能点**:
  - **牌阵布局展示**: 按牌阵专属布局排列已抽取的卡牌，每张牌标注位置名称和正逆位标识
  - **卡牌详情查看**: 点击卡牌可翻开查看正逆位释义详情
  - **解读风格选择**: 提供温柔治愈风、理性分析风、传统专业风三种风格切换
  - **AI解读生成**: 点击生成解读按钮，流式输出结构化解读（牌面总览、分牌详细解读、综合结论、行动建议），支持展开/收起
  - **追问对话**: 在解读结果下方支持用户输入追问问题，AI继续深入交流
  - **保存与收藏**: 支持将本次解读保存到历史记录，支持收藏标记

### 牌库页
- **页面目标**: 浏览全部78张塔罗牌，查看单牌详情
- **功能点**:
  - **卡牌宫格展示**: 以宫格或列表形式展示78张牌，每张显示牌面缩略图、中文牌名
  - **分类筛选**: 支持按大阿卡纳、小阿卡纳（权杖/圣杯/宝剑/星币）分类筛选
  - **单牌详情入口**: 点击卡牌进入单牌详情页，查看完整释义

### 单牌详情页
- **页面目标**: 展示单张塔罗牌的完整信息
- **功能点**:
  - **牌面展示**: 展示牌面图片（或风格化占位图）、中文牌名、英文牌名
  - **关键词展示**: 正位关键词和逆位关键词
  - **详细释义**: 正位详细释义和逆位详细释义，分段展示

### 历史记录页
- **页面目标**: 查看和管理历史占卜记录
- **功能点**:
  - **记录列表**: 按时间倒序展示占卜记录，每条显示牌阵名称、问题摘要、时间、主要牌面缩略
  - **记录详情回看**: 点击记录进入历史详情页，查看完整牌阵和解读
  - **空状态引导**: 无历史记录时展示空状态，引导用户开始首次占卜

### 历史详情页
- **页面目标**: 回看历史占卜的完整结果
- **功能点**:
  - **牌阵回看**: 展示历史抽牌的牌阵布局和卡牌详情
  - **解读回看**: 展示历史AI解读结果，支持展开/收起
  - **分享功能**: 生成精美分享卡片，支持保存图片或复制链接

### 个人中心页
- **页面目标**: 展示用户信息和功能入口
- **功能点**:
  - **用户信息展示**: 展示用户头像和昵称（本地存储，无需登录）
  - **功能入口**: 我的收藏、设置、关于等入口
  - **统计数据**: 展示累计占卜次数等统计数据
  - **收藏列表**: 查看已收藏的占卜记录

---

## 数据共享配置

| 存储键名 | 数据说明 | 使用页面 |
|---------|---------|---------|
| `__global_tarot_readings` | 占卜历史记录列表，类型为 `ReadingRecord[]` | 历史记录页、历史详情页、个人中心页 |
| `__global_tarot_favorites` | 收藏的 readingId 列表，类型为 `string[]` | 牌阵结果页、个人中心页 |
| `__global_tarot_userProfile` | 用户基本信息，类型为 `UserProfile` | 个人中心页 |

```ts
interface ReadingRecord {
  /** 唯一标识 */
  id: string;
  /** 牌阵ID */
  spreadId: string;
  /** 牌阵名称 */
  spreadName: string;
  /** 用户问题 */
  question: string;
  /** 抽牌结果 */
  cards: DrawnCard[];
  /** AI解读结果 */
  interpretation?: InterpretationResult;
  /** 解读风格 */
  style: 'gentle' | 'rational' | 'traditional';
  /** 是否收藏 */
  isFavorite: boolean;
  /** 创建时间 */
  createdAt: string;
}

interface DrawnCard {
  /** 卡牌ID */
  cardId: string;
  /** 牌阵位置名称 */
  positionName: string;
  /** 是否逆位 */
  isReversed: boolean;
}

interface InterpretationResult {
  /** 牌面总览 */
  overview: string;
  /** 分牌详细解读 */
  cardDetails: CardInterpretation[];
  /** 综合结论 */
  conclusion: string;
  /** 行动建议 */
  advice: string;
  /** 追问对话历史 */
  followUpChat: ChatMessage[];
}

interface CardInterpretation {
  /** 卡牌ID */
  cardId: string;
  /** 位置名称 */
  positionName: string;
  /** 解读内容 */
  content: string;
}

interface ChatMessage {
  /** 角色 */
  role: 'user' | 'assistant';
  /** 内容 */
  content: string;
  /** 时间 */
  timestamp: string;
}

interface UserProfile {
  /** 昵称 */
  nickname: string;
  /** 头像URL（可选） */
  avatar?: string;
}

-------

<scene_type>prototype-app</scene_type>

# UI 设计指南

## 1. 设计推导依据

- **参考意图**: Free Direction —— 无参考材料，从产品语义与目标用户情绪出发自主建立视觉系统
- **核心情绪 / 应用类型**: 面向年轻女性的塔罗占卜仪式感工具，需平衡神秘学正统性与小红书社交传播的清新柔和
- **独特记忆点**: 紫雾轻纱包裹的古典牌面——界面外壳如柔雾般轻盈透气，牌面本身保留韦特塔罗的庄重笔触与金色微光

## 2. Art Direction

- **方向名**: Soft Mystic
- **Design Style**: Soft Blocks 柔色块 + Warm Natural 自然暖调 —— 小红书式卡片留白与柔和圆角承载社交传播属性，暖米底色与雾紫渐变营造占卜仪式的私密安全感
- **DNA 参数**: 圆角 soft（rounded-xl 16px）/ 阴影 subtle（低不透明度柔影）/ 间距 spacious（大量留白呼吸）/ 字体方向 衬线标题 + 无衬线正文 / 装饰手法 细金线描边、紫金对称纹样、线性细描边图标
- **应用类型**: Tool —— 移动优先的卡片式布局，底部导航栏主导航，全屏沉浸式抽牌页为独立仪式空间

## 3. Color System

**色彩关系**: 柔雾紫主色 + 淡粉金辅助暖调 + 米白渐变背景，正逆位以柔绿/柔橘低饱和区分，整体保持低对比柔和氛围
**配色设计理由**: primary 柔雾紫承担品牌识别与主行动（抽牌、生成解读），bg 米白渐变营造纸张般的温暖触感，正逆位标识色饱和度与主色对齐避免刺眼，文字层级以深灰/中灰/浅灰三阶保持可读性
**主色推导**: 用户指定柔雾紫 #B8A9C9 为主色，渐变 #9B8AC4 → #7B68A8 用于核心按钮；紫色在塔罗语境中象征直觉与灵性，低饱和处理使其融入小清新外壳
**使用比例**: 60% 中性（米白底 + 灰阶文字）/ 30% 辅助（淡粉金暖调 + 卡片底色）/ 10% primary（主按钮、激活态、品牌锚点）

| 角色 | CSS 变量 | Tailwind Class | HSL 值 | 设计说明 |
|---|---|---|---|---|
| bg | `--background` | `bg-background` | hsl(36 30% 96%) | 米白渐变基底，模拟纸张温暖触感 |
| card | `--card` | `bg-card` | hsl(0 0% 100%) | 纯白卡片，与米白底形成微妙层次 |
| text | `--foreground` | `text-foreground` | hsl(0 0% 29%) | 深灰正文，保持 4.5:1 以上对比度 |
| textMuted | `--muted-foreground` | `text-muted-foreground` | hsl(0 0% 48%) | 中灰辅助说明、占位符、时间戳 |
| primary | `--primary` | `bg-primary` / `text-primary` | hsl(270 20% 72%) | 柔雾紫主色，品牌识别与主交互 |
| primaryForeground | `--primary-foreground` | `text-primary-foreground` | hsl(0 0% 100%) | primary 上的白色文字与图标 |
| accent | `--accent` | `bg-accent` | hsl(36 40% 88%) | 淡粉金暖调底，hover/focus/选中浅底 |
| accentForeground | `--accent-foreground` | `text-accent-foreground` | hsl(30 20% 35%) | accent 上的暖棕文字，低权重信息 |
| border | `--border` | `border-border` | hsl(36 15% 88%) | 暖灰边界，弱于文字，轻量分隔 |

**语义色提示**:
- 正位标识：bg `hsl(110 20% 88%)` / border `hsl(110 18% 72%)` / text `hsl(110 25% 35%)`，柔绿低饱和，与 primary 紫的饱和度对齐（±10%）
- 逆位标识：bg `hsl(25 35% 88%)` / border `hsl(25 30% 72%)` / text `hsl(25 35% 35%)`，柔橘暖调，与 primary 紫的饱和度对齐（±10%）
- 成功/警告/错误色按需使用，饱和度控制在 20%-35% 区间，与整体柔和氛围一致

## 4. 字体与节奏

- **font-display**: Noto Serif SC —— 标题与牌名使用衬线体，呼应塔罗牌面的古典庄重感
- **font-body**: Noto Sans SC —— 正文、按钮、标签使用无衬线体，保证移动端清晰可读
- **字号**: H1 text-5xl（牌阵标题）；H2 text-2xl（卡片标题）；body text-base；muted text-sm
- **圆角**: 大（rounded-xl 16px）—— 统一柔化界面尖锐感，牌面卡片使用 rounded-2xl 增强精致度

## 5. 全局布局契约

- **Reference Layout Use**: 按需求结构推导，无参考材料约束
- **Page / Section Order**: 首页 → 抽牌页 → 牌阵结果页 → 牌库页 → 历史记录页 → 个人中心页，底部导航栏固定首页/牌库/历史/我的四个入口
- **Standard Content Zone**: `max-w-lg mx-auto`（移动优先，桌面端居中展示，最大宽度约 512px 模拟手机卡片阅读体验）
- **Shell / Frame Alignment**: 内容区与底部导航栏同宽，顶部品牌区与内容区对齐
- **Padding & Rhythm**: `px-5 py-6` 移动端，`md:px-8 md:py-10` 桌面端，卡片间距 `gap-4`，区块间距 `gap-6`
- **Full-bleed Zones**: 抽牌页为全屏沉浸式，牌堆背景可 `w-full h-full`，操作按钮和问题输入框仍受内容区约束；首页顶部品牌区可全宽渐变背景
- **Local Narrowing**: 单牌详情页、设置页、AI 解读结果正文可在统一容器内收窄至 `max-w-md`
- **Overflow Strategy**: 牌库宫格使用 `overflow-y-auto` 滚动，牌阵结果页横向牌面排列使用 `overflow-x-auto` 配合 snap 滚动
- **Flexibility Boundary**: 允许移动端 padding 和卡片内边距微调；全局 max-w-lg、rounded-xl 圆角系统、柔雾紫主色和阴影语言保持一致

## 6. 视觉与动效

- **装饰**: 紫金对称纹样（牌背）、细金线描边（牌面边框）、线性细描边图标（2px 圆润端点）
- **阴影/边界**: 轻 —— `shadow-sm` 低不透明度柔影，卡片使用 `0 2px 12px hsl(270 15% 70% / 0.12)` 淡紫调阴影
- **动效**: 精致 —— 卡牌翻转使用 3D transform `rotateY(180deg)` 配合 `transition-transform duration-500`；洗牌动效使用随机位移 `translate` + 旋转 `rotate` 的 spring 物理曲线；页面切换使用 `opacity` + `translateY(8px)` 淡入上移；按钮 hover 使用 `scale(1.02)` 微放大 + 阴影加深

## 7. 组件原则

- 按钮：Primary 使用柔雾紫渐变 `linear-gradient(135deg, hsl(265 25% 65%), hsl(265 30% 55%))`，圆角 `rounded-xl`，hover 加深渐变并微放大；Secondary 使用 accent 淡粉金底 + accentForeground 暖棕文字；Ghost 使用 transparent 底 + primary 文字，hover 时 accent 浅底
- 卡片：牌阵卡片使用白色底 + 细金边 `border border-[hsl(40 30% 80%)]` + 16px 圆角 + 淡紫阴影；牌面卡片使用 `aspect-[2/3]` 固定比例 + 牌背紫金对称花纹
- 标签：正位使用柔绿浅底 + 柔绿文字 + 柔绿边框；逆位使用柔橘浅底 + 柔橘文字 + 柔橘边框
- 导航：底部导航栏使用白色底 + 上阴影，激活项使用 primary 紫色图标与文字，未激活使用 textMuted
- 加载与空状态：Skeleton 使用 accent 底色 + shimmer 动画；空状态使用线性细描边插画 + textMuted 说明文字

## 8. Image Direction

- **Image Role**: 牌面插画（78 张韦特塔罗牌面）、牌背装饰图、牌阵封面图、品牌 logo、分享卡片背景图
- **Image Art Direction**: 牌面采用经典韦特塔罗的版画风格——深色轮廓线、中世纪象征符号、柔和手绘水彩着色，保留神秘学正统质感；牌背为紫金色对称曼陀罗花纹，线条细腻，中心为星月符号；牌阵封面图为简约线性插画，单色柔雾紫勾勒牌阵几何形状；分享卡片背景为米白底 + 淡紫渐变光晕 + 细金边框
- **Image Prompt Keywords**: Rider-Waite tarot card illustration, medieval woodcut style, soft watercolor wash, mystical symbolism, gold leaf accents, symmetrical mandala pattern, lavender and gold color palette, delicate line art, parchment texture, celestial motifs
- **Image Avoidance**: 避免现代扁平矢量风塔罗牌、过于卡通化的牌面、高饱和霓虹紫、通用 AI 生成的廉价神秘学符号堆砌、无主题抽象渐变图、商务素材图库感的插画

## 9. Anti-patterns

- **Split personality**: 抽牌页全屏沉浸与首页卡片布局之间切换时改变圆角或阴影语言；全站统一 rounded-xl 和淡紫阴影
- **Phantom tokens**: 编造 `--card-shadow` 或 `--brand-gradient` 等未定义变量；阴影使用 Tailwind `shadow-sm` 或自定义 `box-shadow` 值
- **Default SaaS drift**: 回到默认蓝按钮或通用紫渐变；始终使用柔雾紫渐变 `#9B8AC4 → #7B68A8` 和淡粉金辅助
- **Invisible interaction**: 卡牌点击翻牌、按钮 hover、导航切换缺少 focus-visible 状态；所有交互元素需有键盘可见的紫色 outline
- **Mono-hue tyranny**: 主按钮、tab 激活、图标、链接、牌阵封面全部使用 primary 紫色；按 60-30-10 将 primary 收回到 CTA 与品牌锚点，图标和链接使用 accentForeground 暖棕，牌阵封面使用淡金边框
- **Status color drift**: 正位柔绿和逆位柔橘饱和度过高，与柔雾紫的 20% 饱和度脱节；语义色饱和度控制在 20%-35%，与 primary 对齐
- **Heavy shadow on cards**: 卡片使用 `shadow-md` 或更重阴影破坏小清新轻盈感；统一使用 `shadow-sm` 淡紫调低不透明度阴影