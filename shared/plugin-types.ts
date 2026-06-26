// ---- plugin:tarot_follow_up_chat_1 ----
// ============================================================
// 插件 tarot_follow_up_chat_1 (塔罗追问对话插件) 的类型定义
// 由 get_plugin_ai_json 自动生成
// ============================================================

export interface TarotFollowUpChatOneInput {
  /** 用户的追问问题 */
  user_question: string;
  /** 历史塔罗解读上下文信息 */
  history_context: string;
}

/**
 * capabilityClient.load('tarot_follow_up_chat_1').call<TarotFollowUpChatOneOutput>('textGenerate', input)
 * 直接返回此类型，无 .data 包装，直接解构使用：
 * const { content, response } = result;
 */
export interface TarotFollowUpChatOneOutput {
  /** [object Object] */
  content: string;
  /** [object Object] */
  response?: string;
}
// ---- end:tarot_follow_up_chat_1 ----

// ---- plugin:tarot_ai_interpretation_1 ----
// ============================================================
// 插件 tarot_ai_interpretation_1 (塔罗AI解读) 的类型定义
// 由 get_plugin_ai_json 自动生成
// ============================================================

export interface TarotAiInterpretationOneInput {
  /** 塔罗牌阵信息，包含牌阵名称、牌位数量、每个牌位的含义 */
  spread_info: string;
  /** 卡牌列表，包含每张卡牌的名称、正逆位信息和对应的牌位 */
  card_list: string;
  /** 用户提出的问题，需要解读的具体内容 */
  user_question: string;
  /** 解读风格，如：专业严谨、轻松幽默、温暖治愈、简洁明了等 */
  interpretation_style?: string;
}

/**
 * capabilityClient.load('tarot_ai_interpretation_1').call<TarotAiInterpretationOneOutput>('textGenerate', input)
 * 直接返回此类型，无 .data 包装，直接解构使用：
 * const { response, content } = result;
 */
export interface TarotAiInterpretationOneOutput {
  /** [object Object] */
  response?: string;
  /** [object Object] */
  content: string;
}
// ---- end:tarot_ai_interpretation_1 ----