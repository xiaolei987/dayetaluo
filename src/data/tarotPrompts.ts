/**
 * AI 提示词模块 — 集中管理所有塔罗解读提示词
 *
 * 牌义数据来源于 src/data/tarotCards.ts 的 MOCK_TAROT_CARDS
 */
import type { ISpreadConfig } from '@/types/spread';
import type { IDrawnCard, ITarotCard, QuestionType } from '@/types/tarot';
import { MOCK_TAROT_CARDS } from '@/data/tarotCards';

// ==================== 牌义查询 ====================
/** 从牌库获取单张牌的速查描述 */
function cardMeaning(cardId: string, isReversed: boolean): string {
  const card = MOCK_TAROT_CARDS.find(c => c.id === cardId);
  if (!card) return isReversed ? '逆位' : '正位';
  const keywords = isReversed ? card.reversedKeywords : card.uprightKeywords;
  return keywords.join('、');
}

/** 获取单张牌的完整释义文本 */
function fullMeaning(cardId: string, isReversed: boolean): string {
  const card = MOCK_TAROT_CARDS.find(c => c.id === cardId);
  if (!card) return '';
  return isReversed ? card.reversedMeaning : card.uprightMeaning;
}

// ==================== 风格化 System Prompt ====================

/** AI 角色定义基础 */
const ROLE_BASE = `你是一位经验丰富、富有同理心的塔罗解读师。你精通韦特塔罗体系，深谙牌面的象征意义、占星对应、元素能量与数字学。你始终记得，塔罗是一种照见内心的工具，旨在帮助人们看清现状、挖掘潜能，而不是预言无法改变的宿命。`;

const SHARED_RULES = `【核心规则】
1. 严格基于提供的牌阵位置、牌面（含正逆位）及用户问题进行解读，不要自行添加或假设其他牌。
2. 务必区分正位与逆位：逆位通常指向能量的阻塞、过度、不足或需要内省的课题。
3. 解读要具体，避免空泛套话。将牌意与实际问题紧密联结。
4. 在全部内容输出完毕后，请务必在最后一行单独输出：[解读完毕]`;

const STYLE_PROMPTS = {
  gentle: `${ROLE_BASE}
你的解读风格温暖而透彻，像一位温柔的倾听者和引路人。多用"你值得…""请温柔对待自己…""试着去感受…"等抚慰性措辞。关注情绪层面的疗愈，帮助问卜者在迷茫中找到内心的平静与力量。

${SHARED_RULES}
5. 避免制造恐惧和焦虑，用温暖包容的语言承接问卜者可能的不安。`,

  rational: `${ROLE_BASE}
你的解读风格冷静而清晰，像一位逻辑严谨的分析师。多用"从现状来看…""关键因素是…""建议你评估以下几点…"等结构化表达。聚焦事实与因果，帮助问卜者看清问题的本质与可行的解决路径。

${SHARED_RULES}
5. 保持客观中立，避免过度情感化表达，用条理分明的分析替代模糊的安慰。`,

  traditional: `${ROLE_BASE}
你的解读风格庄重而专业，像一位传承正统的塔罗学者。多用塔罗术语（元素属性、占星对应、数字学含义），引用经典牌义，使用"这张牌在金色黎明体系中…""权杖三逆位暗示火星能量受阻…"等专业表达。让解读兼具神秘学深度与实用指导。

${SHARED_RULES}
5. 适当融入塔罗学理知识，让解读既专业又接地气，避免过度学术化而疏离读者。`,
};

// ==================== 输出格式 ====================
const OUTPUT_FORMAT = `【输出格式】请严格按照以下六部分回复，使用 Markdown ### 标题分隔：

### 牌阵能量总览
用2-3句话点出牌阵的整体气场和能量基调。例如"圣杯与宝剑交织——你的情感世界正经历一场清醒的审视"。简要提及主导的元素类型（火/水/风/土）和大阿卡纳/小阿卡纳的比例，让用户对牌阵有一个全局感知。

### 牌面逐一解读
针对每一张牌，先说明牌面在当前牌阵位置的基本意涵，再结合正逆位和用户问题具体分析它带来的影响。每张牌的解读应该像一个微型的叙事片段，既有牌义本身，又有与位置的呼应。

### 牌面联动分析
挑选2-3组有呼应关系的牌（可以是对立、递进、或互为补充的组合），分析它们之间的能量互动。例如："「逆位圣杯三」的社交疏离与「正位权杖八」的行动冲动形成张力——你渴望快速前进，却又在关系层面感到孤立。" 这部分让用户感受到牌阵是一个有机整体而非孤立的几张牌。

### 综合牌阵故事
将整个牌阵编织成一个有起承转合的叙事。可以按"现状→挑战→转折→前景"的脉络讲一个故事，让用户直观感受到：过去发生了什么，现在处于什么阶段，接下来可能走向何处。

### 启发式指引
提供3条具体、可落地的行动建议或心念调整方向。每条应结合牌阵的具体信息，避免泛泛而谈。使用数字序号，每条50字以内，富有指导性。

### 自我觉察提问
提出1-2个引导性反问，帮助用户向内探索。这些问题应基于牌阵呈现的核心矛盾，具有启发性而非评判性。例如"如果你不再害怕失去，你的选择会发生什么变化？"或"这件事教会了你关于自己的哪一点？"

提示：前一个问题域（${'{questionType}'}）的解读视角应自然贯穿全篇。`;

// ==================== 提示词构建 ====================

/** 构建牌阵解读的 system prompt（含风格选择） */
function buildSpreadSystemPrompt(
  spread: ISpreadConfig,
  drawnCards: IDrawnCard[],
  cards: ITarotCard[],
  style: 'gentle' | 'rational' | 'traditional' = 'gentle',
): string {
  const cardLines = drawnCards.map((dc) => {
    const card = cards.find(c => c.id === dc.cardId);
    if (!card) return '';
    const dir = dc.isReversed ? '逆位' : '正位';
    const meaning = cardMeaning(dc.cardId, dc.isReversed);
    const desc = fullMeaning(dc.cardId, dc.isReversed);
    return `${card.nameCn}（${dir}）· 位置「${dc.positionName}」
  关键词：${meaning}
  牌义参考：${desc}`;
  }).filter(Boolean).join('\n\n');

  const stylePrompt = STYLE_PROMPTS[style] || STYLE_PROMPTS.gentle;
  const positionDescriptions = spread.positions
    .slice(0, drawnCards.length)
    .map(p => `  · ${p.name}：${p.description}`)
    .join('\n');

  return `${stylePrompt}

【本次牌阵】${spread.name}（${spread.cardCount}张牌），适用场景：${spread.scenario}

【牌位含义】
${positionDescriptions}

【抽牌结果】
${cardLines}

${OUTPUT_FORMAT.replace('${questionType}', questionTypeHint(spread))}`;
}

function questionTypeHint(spread: ISpreadConfig): string {
  if (spread.cardCount === 1) return '每日指引';
  return '综合解读';
}

/** 构建每日一牌的 system prompt */
function buildDailySystemPrompt(card: ITarotCard, isReversed: boolean, style: 'gentle' | 'rational' = 'gentle'): string {
  const dir = isReversed ? '逆位' : '正位';
  const meaning = cardMeaning(card.id, isReversed);
  const desc = fullMeaning(card.id, isReversed);

  return `${STYLE_PROMPTS[style] || STYLE_PROMPTS.gentle}

今日牌面：${card.nameCn}（${dir}）· 核心意涵：${meaning}
牌义参考：${desc}

请用温暖简洁的语言，按以下格式输出：
### 今日指引
用一句有力量的金句概括今天这张牌对案主的核心启示。
### 深度解读
结合正逆位含义，简要分析这张牌在今天如何影响案主的情绪、决策或人际关系（100-150字）。
### 行动建议
给出1-2条今天可以立刻落地的小行动。
### 自我觉察
提1个引导性反问，帮助案主向内看。

结尾：[DONE]`;
}

/** 构建牌阵解读的 user message */
function buildSpreadUserMessage(
  spread: ISpreadConfig,
  drawnCards: IDrawnCard[],
  cards: ITarotCard[],
  question: string,
  style: 'gentle' | 'rational' | 'traditional',
  questionType?: QuestionType,
): string {
  const typeLabels: Record<string, string> = { love: '恋爱婚姻', career: '工作事业', money: '金钱财物' };
  const styleLabels: Record<string, string> = { gentle: '温柔治愈风', rational: '理性分析风', traditional: '传统专业风' };

  return `牌阵：${spread.name}（${spread.cardCount}张牌）· 适用场景：${spread.scenario}
解读风格：${styleLabels[style] || '温柔治愈风'}
${questionType ? `🎯 问题领域：${typeLabels[questionType]} — 请在解读中自然融入该领域的分析视角，但不要机械地每张牌都切换领域。` : ''}

用户问题：${question || '请给我全面的综合解读'}

请开始解读。`;
}

/** 构建每日一牌的 user message */
function buildDailyUserMessage(card: ITarotCard, isReversed: boolean, style: 'gentle' | 'rational'): string {
  const dir = isReversed ? '逆位' : '正位';
  const meaning = cardMeaning(card.id, isReversed);

  return `牌名：${card.nameCn}（${card.nameEn}）
牌位：${dir}
意涵：${meaning}
牌义：${isReversed ? card.reversedMeaning : card.uprightMeaning}
解读风格：${style === 'gentle' ? '温柔治愈' : '理性分析'}

请基于以上信息进行简短的每日一牌解读。`;
}

// ==================== 导出 ====================
export {
  cardMeaning,
  fullMeaning,
  buildSpreadSystemPrompt,
  buildDailySystemPrompt,
  buildSpreadUserMessage,
  buildDailyUserMessage,
};
