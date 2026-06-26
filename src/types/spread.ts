// EXPORTS: ISpreadConfig, ISpreadPosition, SpreadId, SPREADS_META

/** 牌阵ID */
export type SpreadId =
  | 'daily-card'
  | 'time-flow'
  | 'four-elements'
  | 'love-cross'
  | 'two-choices'
  | 'hexagram'
  | 'career'
  | 'celtic-cross';

/** 牌阵中单个位置的定义 */
export interface ISpreadPosition {
  /** 位置序号 (从 1 开始) */
  index: number;
  /** 位置名称 (中文) */
  name: string;
  /** 位置含义描述 */
  description: string;
  /** 布局坐标 (百分比, 用于牌阵结果页定位) */
  x: number;
  y: number;
}

/** 牌阵配置 */
export interface ISpreadConfig {
  /** 牌阵唯一ID */
  id: SpreadId;
  /** 牌阵名称 (中文) */
  name: string;
  /** 牌阵英文名 */
  nameEn: string;
  /** 牌数 */
  cardCount: number;
  /** 适用场景描述 */
  scenario: string;
  /** 封面图URL */
  coverImage: string;
  /** 牌阵位置列表 */
  positions: ISpreadPosition[];
  /** 简短描述 (用于卡片) */
  shortDesc: string;
}

/** 牌阵元数据列表 (不含 positions, 用于首页卡片展示) */
export interface ISpreadMeta {
  id: SpreadId;
  name: string;
  nameEn: string;
  cardCount: number;
  scenario: string;
  coverImage: string;
  shortDesc: string;
}

/** 8种牌阵的元数据 (首页卡片用) */
export const SPREADS_META: ISpreadMeta[] = [
  {
    id: 'daily-card',
    name: '每日一牌',
    nameEn: 'Daily Card',
    cardCount: 1,
    scenario: '日常运势、快速指引',
    coverImage: '/images/spread-daily-card.webp',
    shortDesc: '抽取一张牌，获得今日的指引与启示',
  },
  {
    id: 'time-flow',
    name: '时间流三牌阵',
    nameEn: 'Time Flow',
    cardCount: 3,
    scenario: '过去-现在-未来',
    coverImage: '/images/spread-time-flow.webp',
    shortDesc: '揭示过去的影响、现在的状态与未来的趋势',
  },
  {
    id: 'four-elements',
    name: '四元素牌阵',
    nameEn: 'Four Elements',
    cardCount: 4,
    scenario: '火-水-风-土四维度',
    coverImage: '/images/spread-four-elements.webp',
    shortDesc: '从火水风土四个维度全面分析你的问题',
  },
  {
    id: 'love-cross',
    name: '爱情十字牌阵',
    nameEn: 'Love Cross',
    cardCount: 5,
    scenario: '现状、对方想法、关系阻碍、发展趋势、结果指引',
    coverImage: '/images/spread-love-cross.webp',
    shortDesc: '深入剖析感情现状，看清关系走向',
  },
  {
    id: 'two-choices',
    name: '二择一牌阵',
    nameEn: 'Two Choices',
    cardCount: 6,
    scenario: '两难决策分析',
    coverImage: '/images/spread-two-choices.webp',
    shortDesc: '面对两难抉择时，帮你理清利弊与方向',
  },
  {
    id: 'hexagram',
    name: '六芒星牌阵',
    nameEn: 'Hexagram',
    cardCount: 7,
    scenario: '深度问题剖析',
    coverImage: '/images/spread-hexagram.webp',
    shortDesc: '七张牌深度剖析，揭示问题的核心与根源',
  },
  {
    id: 'career',
    name: '事业发展牌阵',
    nameEn: 'Career',
    cardCount: 6,
    scenario: '职业规划分析',
    coverImage: '/images/spread-career.webp',
    shortDesc: '分析职业现状、机遇与挑战，指引事业方向',
  },
  {
    id: 'celtic-cross',
    name: '凯尔特十字',
    nameEn: 'Celtic Cross',
    cardCount: 10,
    scenario: '全面深度占卜',
    coverImage: '/images/spread-celtic-cross.webp',
    shortDesc: '最经典的塔罗牌阵，全方位深度解读',
  },
];
