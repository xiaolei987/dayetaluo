// EXPORTS: ITarotCard, IDrawnCard, IInterpretationResult, ICardInterpretation, IChatMessage, IReadingRecord, IUserProfile

/** 塔罗牌基础信息 */
export interface ITarotCard {
  /** 唯一标识，如 'major-0' 或 'wands-1' */
  id: string;
  /** 中文牌名 */
  nameCn: string;
  /** 英文牌名 */
  nameEn: string;
  /** 分类：major | wands | cups | swords | pentacles */
  category: 'major' | 'wands' | 'cups' | 'swords' | 'pentacles';
  /** 牌面图片URL */
  imageUrl: string;
  /** 正位关键词 */
  uprightKeywords: string[];
  /** 逆位关键词 */
  reversedKeywords: string[];
  /** 正位详细释义 */
  uprightMeaning: string;
  /** 逆位详细释义 */
  reversedMeaning: string;
}

/** 抽牌结果中的单张牌 */
export interface IDrawnCard {
  /** 卡牌ID，对应 ITarotCard.id */
  cardId: string;
  /** 牌阵位置名称，如 "过去"、"现在"、"未来" */
  positionName: string;
  /** 是否逆位 */
  isReversed: boolean;
}

/** 单张牌的解读内容 */
export interface ICardInterpretation {
  /** 卡牌ID */
  cardId: string;
  /** 位置名称 */
  positionName: string;
  /** 解读内容 */
  content: string;
}

/** 对话消息 */
export interface IChatMessage {
  /** 角色 */
  role: 'user' | 'assistant';
  /** 内容 */
  content: string;
  /** 时间戳 */
  timestamp: string;
}

/** AI解读结果 */
export interface IInterpretationResult {
  /** 牌面总览 */
  overview: string;
  /** 牌阵能量流动分析 */
  energyFlow: string;
  /** 分牌详细解读 */
  cardDetails: ICardInterpretation[];
  /** 综合结论 */
  conclusion: string;
  /** 行动建议 */
  advice: string;
  /** 追问对话历史 (已弃用，始终为空) */
  followUpChat: IChatMessage[];
}

/** 占卜历史记录 */
export interface IReadingRecord {
  /** 唯一标识 */
  id: string;
  /** 牌阵ID */
  spreadId: string;
  /** 牌阵名称 */
  spreadName: string;
  /** 用户问题 */
  question: string;
  /** 抽牌结果 */
  cards: IDrawnCard[];
  /** AI解读结果 */
  interpretation?: IInterpretationResult;
  /** 解读风格 */
  style: 'gentle' | 'rational' | 'traditional';
  /** 是否收藏 */
  isFavorite: boolean;
  /** 创建时间 ISO 字符串 */
  createdAt: string;
}

/** 用户基本信息 */
export interface IUserProfile {
  /** 昵称 */
  nickname: string;
  /** 头像URL（可选） */
  avatar?: string;
}
