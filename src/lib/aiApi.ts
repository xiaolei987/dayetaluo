/**
 * AI API 配置与调用工具
 * 支持 OpenAI 兼容接口的流式调用
 */
import { scopedStorage } from '@lark-apaas/client-toolkit-lite';

const STORAGE_KEY = '__tarot_ai_config';

export interface AiConfig {
  /** API 请求地址 (OpenAI 兼容) */
  apiUrl: string;
  /** 模型名称 */
  model: string;
  /** API 密钥 */
  apiKey: string;
}

const DEFAULT_CONFIG: AiConfig = {
  apiUrl: 'https://api.deepseek.com/v1/chat/completions',
  model: 'deepseek-chat',
  apiKey: '',
};

/** 读取 AI 配置 */
export function getAiConfig(): AiConfig {
  try {
    const raw = scopedStorage.getItem(STORAGE_KEY);
    if (raw) return { ...DEFAULT_CONFIG, ...JSON.parse(raw) };
  } catch { /* ignore */ }
  return { ...DEFAULT_CONFIG };
}

/** 保存 AI 配置 */
export function saveAiConfig(config: AiConfig): void {
  scopedStorage.setItem(STORAGE_KEY, JSON.stringify(config));
}

/** 是否有有效配置 */
export function hasAiConfig(): boolean {
  const c = getAiConfig();
  return !!(c.apiUrl && c.apiKey && c.model);
}

/**
 * 调用 AI 流式接口
 * @param systemPrompt 系统提示词
 * @param userMessage 用户消息
 * @param onChunk 每收到一个 chunk 的回调
 * @param signal 可选的 AbortSignal
 * @returns 完整内容
 */
export async function callAiStream(
  systemPrompt: string,
  userMessage: string,
  onChunk: (text: string) => void,
  signal?: AbortSignal,
): Promise<string> {
  const config = getAiConfig();

  let response: Response;
  try {
    response = await fetch(config.apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${config.apiKey}`,
      },
      body: JSON.stringify({
        model: config.model,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userMessage },
        ],
        stream: true,
        temperature: 0.7,
        max_tokens: 2048,
      }),
      signal,
    });
  } catch (err: unknown) {
    if (err instanceof TypeError && err.message.includes('fetch')) {
      throw new Error('网络连接失败，请检查 API 地址是否正确或网络是否可达');
    }
    if (err instanceof DOMException && err.name === 'AbortError') {
      throw new Error('请求已取消');
    }
    throw new Error(`API 请求失败：${err instanceof Error ? err.message : '未知错误'}`);
  }

  if (!response.ok) {
    let errText = '';
    try { errText = await response.text(); } catch { /* ignore */ }
    if (response.status === 401 || response.status === 403) {
      throw new Error('API 密钥无效或无权访问，请检查 AI 接口配置');
    }
    if (response.status === 404) {
      throw new Error('API 地址不存在 (404)，请检查请求地址是否正确');
    }
    throw new Error(`AI 服务返回错误 (${response.status})：${errText.slice(0, 150)}`);
  }

  const reader = response.body?.getReader();
  if (!reader) throw new Error('无法读取 AI 响应流');

  const decoder = new TextDecoder();
  let fullContent = '';
  let buffer = '';

  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split('\n');
      buffer = lines.pop() || '';

      for (const line of lines) {
        const trimmed = line.trim();
        if (!trimmed || !trimmed.startsWith('data: ')) continue;
        const data = trimmed.slice(6);
        if (data === '[DONE]') continue;

        try {
          const parsed = JSON.parse(data);
          const delta = parsed.choices?.[0]?.delta?.content;
          if (delta) {
            fullContent += delta;
            onChunk(delta);
          }
        } catch { /* skip unparseable chunks */ }
      }
    }
  } finally {
    reader.releaseLock();
  }

  return fullContent;
}
