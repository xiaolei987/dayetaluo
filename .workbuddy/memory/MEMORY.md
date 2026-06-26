# 大爷塔罗 项目记忆

## 技术栈
- **前端**：Vite + React 19 + TypeScript
- **UI 框架**：Tailwind CSS 4 + Radix UI + framer-motion
- **路由**：react-router-dom v7
- **状态存储**：localStorage (`scopedStorage` from `@lark-apaas/client-toolkit-lite`)
- **AI 插件**：`capabilityClient.load().callStream()` 调用 tarot_ai_interpretation_1 / tarot_follow_up_chat_1
- **架构**：传统 React 组件分层（pages/components/data/types）

## 数据源
- 78 张牌数据：`src/data/tarotCards.ts`
- 8 种牌阵：`src/data/spreads.ts` / `src/types/spread.ts`
- 牌面图片：`fatemaster.ai/images/tarot/`（2026-06-26 迁移）
- 卡背图片：`/card-back.png`（用户提供）
- 占卜记录：localStorage key=`__tarot_readings`
- 收藏记录：localStorage key=`__tarot_favorites`
- 用户信息：localStorage key=`__tarot_userProfile`

## 参考文档
- 塔罗葵花宝典（向日葵，2004）
- 清流的塔罗经验谈（大阿卡纳深度解读）
- 塔罗牌义解释（78 张结构化数据，含爱情/事业/财富维度）

## 命名差异
- 代码用「愚者」，出版物用「愚人」
- 代码用「女祭司」，部分资料用「女教皇」
- 代码用「星币」，部分资料用「五角星/金币」
