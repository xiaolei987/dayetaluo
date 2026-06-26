// EXPORTS: MOCK_SPREADS, SpreadId, ISpreadConfig, ISpreadPosition

import type { ISpreadConfig, ISpreadPosition, SpreadId } from '@/types/spread';

/** 每日一牌 - 1张 */
const DAILY_CARD_POSITIONS: ISpreadPosition[] = [
  { index: 1, name: '今日指引', description: '代表今天的核心能量与指引方向', x: 50, y: 50 },
];

/** 时间流三牌阵 - 3张 */
const TIME_FLOW_POSITIONS: ISpreadPosition[] = [
  { index: 1, name: '过去', description: '过去的影响因素与根源', x: 15, y: 50 },
  { index: 2, name: '现在', description: '当前的状态与核心问题', x: 50, y: 50 },
  { index: 3, name: '未来', description: '未来的发展趋势与可能结果', x: 85, y: 50 },
];

/** 四元素牌阵 - 4张 */
const FOUR_ELEMENTS_POSITIONS: ISpreadPosition[] = [
  { index: 1, name: '火', description: '行动力、热情与意志层面', x: 50, y: 15 },
  { index: 2, name: '水', description: '情感、直觉与关系层面', x: 85, y: 50 },
  { index: 3, name: '风', description: '思维、沟通与决策层面', x: 50, y: 85 },
  { index: 4, name: '土', description: '物质、现实与稳定层面', x: 15, y: 50 },
];

/** 爱情十字牌阵 - 5张 */
const LOVE_CROSS_POSITIONS: ISpreadPosition[] = [
  { index: 1, name: '现状', description: '你当前的感情状态与处境', x: 50, y: 50 },
  { index: 2, name: '对方想法', description: '对方内心的真实想法与感受', x: 85, y: 15 },
  { index: 3, name: '关系阻碍', description: '关系中存在的障碍与挑战', x: 85, y: 85 },
  { index: 4, name: '发展趋势', description: '关系未来的发展方向', x: 15, y: 85 },
  { index: 5, name: '结果指引', description: '最终的可能结果与建议', x: 15, y: 15 },
];

/** 二择一牌阵 - 6张 */
const TWO_CHOICES_POSITIONS: ISpreadPosition[] = [
  { index: 1, name: '当前状况', description: '你当前面临的核心问题', x: 50, y: 50 },
  { index: 2, name: '选择A路径', description: '第一个选项的发展路径', x: 25, y: 20 },
  { index: 3, name: '选择A结果', description: '选择A可能带来的结果', x: 25, y: 80 },
  { index: 4, name: '选择B路径', description: '第二个选项的发展路径', x: 75, y: 20 },
  { index: 5, name: '选择B结果', description: '选择B可能带来的结果', x: 75, y: 80 },
  { index: 6, name: '深层指引', description: '超越二元选择的更高视角', x: 50, y: 85 },
];

/** 六芒星牌阵 - 7张 */
const HEXAGRAM_POSITIONS: ISpreadPosition[] = [
  { index: 1, name: '过去根源', description: '问题的深层根源与历史因素', x: 50, y: 8 },
  { index: 2, name: '当前状态', description: '问题在当前的表现形式', x: 50, y: 50 },
  { index: 3, name: '未来趋势', description: '问题发展的自然趋势', x: 50, y: 92 },
  { index: 4, name: '应对策略', description: '你可以采取的行动方向', x: 85, y: 25 },
  { index: 5, name: '环境因素', description: '外部环境与周围人的影响', x: 85, y: 75 },
  { index: 6, name: '内心状态', description: '你的潜意识与真实渴望', x: 15, y: 75 },
  { index: 7, name: '最终结果', description: '综合所有因素后的可能结果', x: 15, y: 25 },
];

/** 事业发展牌阵 - 6张 */
const CAREER_POSITIONS: ISpreadPosition[] = [
  { index: 1, name: '当前职位', description: '你当前的职业状态与定位', x: 50, y: 50 },
  { index: 2, name: '优势与资源', description: '你拥有的优势与可利用资源', x: 15, y: 20 },
  { index: 3, name: '挑战与阻碍', description: '职业发展中面临的挑战', x: 85, y: 20 },
  { index: 4, name: '机遇方向', description: '值得把握的机会与发展方向', x: 85, y: 80 },
  { index: 5, name: '所需行动', description: '你需要采取的具体行动', x: 15, y: 80 },
  { index: 6, name: '发展前景', description: '事业发展的整体前景与结果', x: 50, y: 88 },
];

/** 凯尔特十字 - 10张 */
const CELTIC_CROSS_POSITIONS: ISpreadPosition[] = [
  { index: 1, name: '现状核心', description: '当前问题的核心本质', x: 50, y: 50 },
  { index: 2, name: '横越障碍', description: '横跨在问题之上的直接挑战', x: 65, y: 50 },
  { index: 3, name: '根源基础', description: '问题的基础与深层根源', x: 50, y: 78 },
  { index: 4, name: '过去影响', description: '正在消退的过去影响', x: 20, y: 78 },
  { index: 5, name: '潜在可能', description: '可能达到的最高目标', x: 50, y: 22 },
  { index: 6, name: '近期未来', description: '即将到来的近期事件', x: 80, y: 22 },
  { index: 7, name: '自我态度', description: '你对问题的态度与立场', x: 80, y: 78 },
  { index: 8, name: '环境影响', description: '外部环境与他人的影响', x: 20, y: 22 },
  { index: 9, name: '希望与恐惧', description: '内心的希望与恐惧', x: 85, y: 50 },
  { index: 10, name: '最终结果', description: '综合所有因素后的最终结果', x: 15, y: 50 },
];

/** 8种牌阵完整配置 */
export const MOCK_SPREADS: ISpreadConfig[] = [
  {
    id: 'daily-card',
    name: '每日一牌',
    nameEn: 'Daily Card',
    cardCount: 1,
    scenario: '日常运势、快速指引',
    coverImage: '/images/spread-daily-card.webp',
    shortDesc: '抽取一张牌，获得今日的指引与启示',
    positions: DAILY_CARD_POSITIONS,
  },
  {
    id: 'time-flow',
    name: '时间流三牌阵',
    nameEn: 'Time Flow',
    cardCount: 3,
    scenario: '过去-现在-未来',
    coverImage: '/images/spread-time-flow.webp',
    shortDesc: '揭示过去的影响、现在的状态与未来的趋势',
    positions: TIME_FLOW_POSITIONS,
  },
  {
    id: 'four-elements',
    name: '四元素牌阵',
    nameEn: 'Four Elements',
    cardCount: 4,
    scenario: '火-水-风-土四维度',
    coverImage: '/images/spread-four-elements.webp',
    shortDesc: '从火水风土四个维度全面分析你的问题',
    positions: FOUR_ELEMENTS_POSITIONS,
  },
  {
    id: 'love-cross',
    name: '爱情十字牌阵',
    nameEn: 'Love Cross',
    cardCount: 5,
    scenario: '现状、对方想法、关系阻碍、发展趋势、结果指引',
    coverImage: '/images/spread-love-cross.webp',
    shortDesc: '深入剖析感情现状，看清关系走向',
    positions: LOVE_CROSS_POSITIONS,
  },
  {
    id: 'two-choices',
    name: '二择一牌阵',
    nameEn: 'Two Choices',
    cardCount: 6,
    scenario: '两难决策分析',
    coverImage: '/images/spread-two-choices.webp',
    shortDesc: '面对两难抉择时，帮你理清利弊与方向',
    positions: TWO_CHOICES_POSITIONS,
  },
  {
    id: 'hexagram',
    name: '六芒星牌阵',
    nameEn: 'Hexagram',
    cardCount: 7,
    scenario: '深度问题剖析',
    coverImage: '/images/spread-hexagram.webp',
    shortDesc: '七张牌深度剖析，揭示问题的核心与根源',
    positions: HEXAGRAM_POSITIONS,
  },
  {
    id: 'career',
    name: '事业发展牌阵',
    nameEn: 'Career',
    cardCount: 6,
    scenario: '职业规划分析',
    coverImage: '/images/spread-career.webp',
    shortDesc: '分析职业现状、机遇与挑战，指引事业方向',
    positions: CAREER_POSITIONS,
  },
  {
    id: 'celtic-cross',
    name: '凯尔特十字',
    nameEn: 'Celtic Cross',
    cardCount: 10,
    scenario: '全面深度占卜',
    coverImage: '/images/spread-celtic-cross.webp',
    shortDesc: '最经典的塔罗牌阵，全方位深度解读',
    positions: CELTIC_CROSS_POSITIONS,
  },
];
