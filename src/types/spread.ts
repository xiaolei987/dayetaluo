// EXPORTS: ISpreadConfig, ISpreadPosition, SpreadId, ISpreadConnection, ISpreadLayoutMeta

/** 牌阵ID */
export type SpreadId =
  | 'four-seasons'
  | 'time-flow'
  | 'four-elements'
  | 'love-cross'
  | 'two-choices'
  | 'hexagram'
  | 'career'
  | 'celtic-cross';

/** 语义连线：连接两个牌位，表示能量/逻辑流动 */
export interface ISpreadConnection {
  /** 起点位置 index */
  from: number;
  /** 终点位置 index */
  to: number;
  /** 连线类型 */
  type?: 'solid' | 'dashed';
  /** 是否带箭头 */
  arrow?: boolean;
  /** 语义标签（可选） */
  label?: string;
}

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
  /** 布局坐标 (百分比, 用于牌阵结果页定位) */
  y: number;
  /** 限定花色（四季牌阵、四元素牌阵使用），null=不限 */
  requiredSuit?: 'major' | 'wands' | 'cups' | 'swords' | 'pentacles';
}

/** 牌阵布局元数据（用于控制视觉表现） */
export interface ISpreadLayoutMeta {
  /** 容器高度（移动端，单位 px） */
  mobileHeight?: number;
  /** 容器高度（桌面端，单位 px） */
  desktopHeight?: number;
  /** 是否显示语义连线 */
  showConnections?: boolean;
  /** 语义连线列表 */
  connections?: ISpreadConnection[];
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
  /** 布局视觉元数据 */
  layoutMeta?: ISpreadLayoutMeta;
}
