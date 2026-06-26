import { useState, useRef, useEffect, type FormEvent } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Sparkles, User, Bot } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';
import type { IChatMessage } from '@/types/tarot';
import { callAiStream, hasAiConfig } from '@/lib/aiApi';
import { toast } from 'sonner';

interface FollowUpChatSectionProps {
  /** 历史解读上下文（牌阵信息 + 解读结果摘要） */
  historyContext: string;
  /** 已有的对话消息列表 */
  messages: IChatMessage[];
  /** 消息更新回调 */
  onMessagesChange: (messages: IChatMessage[]) => void;
}

export default function FollowUpChatSection({
  historyContext,
  messages,
  onMessagesChange,
}: FollowUpChatSectionProps) {
  const [input, setInput] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // 自动滚动到底部
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const question = input.trim();
    if (!question || isStreaming) return;

    if (!hasAiConfig()) {
      toast.error('请先在"我的-功能入口-AI接口"中配置 API');
      return;
    }

    const userMsg: IChatMessage = {
      role: 'user',
      content: question,
      timestamp: new Date().toISOString(),
    };
    const updatedMessages = [...messages, userMsg];
    onMessagesChange(updatedMessages);
    setInput('');
    setIsStreaming(true);

    const assistantMsg: IChatMessage = {
      role: 'assistant',
      content: '',
      timestamp: new Date().toISOString(),
    };
    onMessagesChange([...updatedMessages, assistantMsg]);

    try {
      const systemPrompt = `你是一位拥有10年实战经验的专业韦特塔罗解读师。用户之前已经完成了一次塔罗占卜并获得了AI解读，现在正在向你追问。请结合以下占卜背景和用户的追问问题，给出专业、温暖且有针对性的回答。保持共情力，不做绝对化预言。`;

      let fullContent = '';
      await callAiStream(
        systemPrompt,
        `占卜背景：\n${historyContext}\n\n用户的追问：${question}`,
        (chunk) => {
          fullContent += chunk;
          onMessagesChange([
            ...updatedMessages,
            { ...assistantMsg, content: fullContent },
          ]);
        },
      );
    } catch {
      onMessagesChange([
        ...updatedMessages,
        {
          ...assistantMsg,
          content: '抱歉，追问回复生成失败，请稍后重试。',
        },
      ]);
    } finally {
      setIsStreaming(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e as unknown as FormEvent);
    }
  };

  return (
    <motion.section
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      className="w-full"
    >
      <div className="rounded-2xl border border-border/50 bg-card/80 backdrop-blur-sm overflow-hidden">
        {/* 标题栏 */}
        <div className="flex items-center gap-2 px-5 py-4 border-b border-border/30">
          <Sparkles className="size-4 text-primary" />
          <h3 className="text-sm font-semibold text-foreground">追问交流</h3>
          <span className="text-xs text-muted-foreground">
            对解读结果有疑问？继续问我吧
          </span>
        </div>

        {/* 消息列表 */}
        <div
          ref={scrollRef}
          className="px-5 py-4 space-y-4 max-h-80 overflow-y-auto"
        >
          {messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <Bot className="size-8 text-muted-foreground/40 mb-2" />
              <p className="text-sm text-muted-foreground">
                还没有对话，输入你的问题开始追问吧
              </p>
            </div>
          ) : (
            <AnimatePresence initial={false}>
              {messages.map((msg, i) => (
                <motion.div
                  key={`${msg.role}-${msg.timestamp}-${i}`}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, ease: 'easeOut' }}
                  className={cn(
                    'flex gap-3',
                    msg.role === 'user' ? 'justify-end' : 'justify-start'
                  )}
                >
                  {/* 头像 */}
                  {msg.role === 'assistant' && (
                    <div className="size-7 rounded-full bg-primary/15 flex items-center justify-center shrink-0 mt-0.5">
                      <Sparkles className="size-3.5 text-primary" />
                    </div>
                  )}

                  {/* 气泡 */}
                  <div
                    className={cn(
                      'max-w-[80%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed',
                      msg.role === 'user'
                        ? 'bg-primary text-primary-foreground rounded-br-md'
                        : 'bg-muted/70 text-foreground rounded-bl-md'
                    )}
                  >
                    {msg.content ? (
                      <p className="whitespace-pre-line break-words">{msg.content}</p>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-muted-foreground">
                        <span className="size-1.5 rounded-full bg-primary animate-pulse" />
                        <span className="size-1.5 rounded-full bg-primary animate-pulse [animation-delay:0.2s]" />
                        <span className="size-1.5 rounded-full bg-primary animate-pulse [animation-delay:0.4s]" />
                      </span>
                    )}
                  </div>

                  {/* 用户头像 */}
                  {msg.role === 'user' && (
                    <div className="size-7 rounded-full bg-accent flex items-center justify-center shrink-0 mt-0.5">
                      <User className="size-3.5 text-accent-foreground" />
                    </div>
                  )}
                </motion.div>
              ))}
            </AnimatePresence>
          )}
        </div>

        {/* 输入区 */}
        <form
          onSubmit={handleSubmit}
          className="flex items-end gap-2 px-5 py-3 border-t border-border/30 bg-muted/30"
        >
          <Textarea
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="输入你的追问..."
            rows={1}
            disabled={isStreaming}
            className="min-h-10 max-h-32 resize-none rounded-xl bg-background border-border/50 text-sm placeholder:text-muted-foreground/60 focus-visible:ring-primary/30"
          />
          <Button
            type="submit"
            size="icon"
            disabled={!input.trim() || isStreaming}
            className="size-10 shrink-0 rounded-xl"
          >
            <Send className="size-4" />
          </Button>
        </form>
      </div>
    </motion.section>
  );
}
