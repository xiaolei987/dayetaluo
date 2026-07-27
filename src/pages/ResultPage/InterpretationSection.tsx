import { useState, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, ChevronDown, ChevronUp, Loader2, Copy, Check } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { callAiStream, hasAiConfig } from '@/lib/aiApi';
import type { IInterpretationResult, IDrawnCard, QuestionType } from '@/types/tarot';
import type { ISpreadConfig } from '@/types/spread';
import { MOCK_TAROT_CARDS } from '@/data/tarotCards';
import { buildSpreadSystemPrompt, buildSpreadUserMessage } from '@/data/tarotPrompts';

// ==================== Props ====================
interface InterpretationSectionProps {
  /** 当前牌阵配置 */
  spread: ISpreadConfig;
  /** 抽牌结果 */
  drawnCards: IDrawnCard[];
  /** 用户问题 */
  question: string;
  /** 问题分类 */
  questionType?: QuestionType;
  /** 解读结果（从父组件传入，支持回看历史） */
  interpretation: IInterpretationResult | null;
  /** 解读结果变更回调 */
  onInterpretationChange: (result: IInterpretationResult) => void;
  /** 是否已收藏 */
  isFavorite: boolean;
  /** 收藏切换回调 */
  onToggleFavorite: () => void;
}

// ==================== 常量 ====================
const STYLE_OPTIONS = [
  { value: 'gentle' as const, label: '温柔治愈', desc: '温暖细腻，抚慰心灵' },
  { value: 'rational' as const, label: '理性分析', desc: '逻辑清晰，客观务实' },
  { value: 'traditional' as const, label: '传统专业', desc: '正统塔罗，经典解读' },
];

const STYLE_LABEL_MAP: Record<string, string> = {
  gentle: '温柔治愈风',
  rational: '理性分析风',
  traditional: '传统专业风',
};

// ==================== 组件 ====================
export default function InterpretationSection({
  spread,
  drawnCards,
  question,
  questionType,
  interpretation,
  onInterpretationChange,
}: InterpretationSectionProps) {
  const [style, setStyle] = useState<'gentle' | 'rational' | 'traditional'>('gentle');
  const [isGenerating, setIsGenerating] = useState(false);
  const [streamingContent, setStreamingContent] = useState('');
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    overview: true,
    cardDetails: false,
    energyFlow: false,
    conclusion: false,
    advice: false,
    selfReflection: false,
  });
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  // ==================== 展开/收起 ====================
  const toggleSection = useCallback((key: string) => {
    setExpandedSections((prev) => ({ ...prev, [key]: !prev[key] }));
  }, []);

  // ==================== 生成解读 ====================
  const handleGenerate = useCallback(async () => {
    if (isGenerating) return;
    if (!hasAiConfig()) {
      toast.error('请先在"我的-功能入口-AI接口"中配置 API');
      return;
    }
    setIsGenerating(true);
    setStreamingContent('');

    const systemPrompt = buildSpreadSystemPrompt(spread, drawnCards, MOCK_TAROT_CARDS, style);
    const userMessage = buildSpreadUserMessage(spread, drawnCards, MOCK_TAROT_CARDS, question, style, questionType);

    const controller = new AbortController();
    abortRef.current = controller;

    try {
      let fullContent = '';
      let doneReceived = false;
      
      await callAiStream(
        systemPrompt,
        userMessage,
        (chunk) => {
          fullContent += chunk;
          // 检测到 [解读完毕] 才允许渲染
          if (fullContent.includes('[解读完毕]')) {
            doneReceived = true;
          }
          // 没收到标记前不渲染任何内容
          if (doneReceived) {
            const display = fullContent.replace('[解读完毕]', '').trim();
            setStreamingContent(display);
          }
        },
        controller.signal,
      );

      if (!controller.signal.aborted) {
        // 去掉结束标记后再解析
        const cleanContent = fullContent.replace('[解读完毕]', '').trim();
        const parsed = parseInterpretationContent(cleanContent);
        onInterpretationChange({
          overview: parsed.overview,
          cardDetails: parsed.cardDetails,
          positionAnalysis: parsed.positionAnalysis,
          energyFlow: parsed.energyFlow,
          coreConflict: parsed.coreConflict,
          conclusion: parsed.conclusion,
          advice: parsed.advice,
          selfReflection: parsed.selfReflection,
          followUpChat: [],
        });
      }
    } catch (err: unknown) {
      if (!controller.signal.aborted) {
        const msg = err instanceof Error ? err.message : '解读生成失败';
        toast.error(msg);
      }
    } finally {
      setIsGenerating(false);
      setStreamingContent('');
      abortRef.current = null;
    }
  }, [isGenerating, spread, drawnCards, question, questionType, style, onInterpretationChange]);

  // ==================== 复制 ====================
  const handleCopy = useCallback(
    async (text: string, index: number) => {
      try {
        await navigator.clipboard.writeText(text);
        setCopiedIndex(index);
        toast.success('已复制到剪贴板');
        setTimeout(() => setCopiedIndex(null), 2000);
      } catch {
        toast.error('复制失败');
      }
    },
    [],
  );

  // ==================== 渲染：解读结果 ====================
  const renderInterpretation = () => {
    if (!interpretation) return null;

    const sections = [
      { key: 'overview', title: '🔮 牌阵能量总览', content: interpretation.overview, icon: '🔮' },
      { key: 'cardDetails', title: '📜 牌面逐一解读', content: interpretation.cardDetails, icon: '📜', isCardDetails: true },
      { key: 'energyFlow', title: '🔗 牌面联动分析', content: interpretation.energyFlow, icon: '🔗' },
      { key: 'conclusion', title: '📖 综合牌阵故事', content: interpretation.conclusion, icon: '📖' },
      { key: 'advice', title: '💡 启发式指引', content: interpretation.advice, icon: '💡' },
      { key: 'selfReflection', title: '🪞 自我觉察提问', content: interpretation.selfReflection, icon: '🪞' },
    ];

    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        className="space-y-4"
      >
        {sections.map((section) => {
          const isExpanded = expandedSections[section.key] ?? false;
          return (
            <Card key={section.key} className="rounded-2xl border-border/40 shadow-sm">
              <button
                type="button"
                onClick={() => toggleSection(section.key)}
                className="w-full flex items-center justify-between p-4 text-left hover:bg-muted/30 transition-colors rounded-2xl"
              >
                <span className="text-sm font-semibold text-foreground">{section.title}</span>
                <motion.div
                  animate={{ rotate: isExpanded ? 180 : 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <ChevronDown className="size-4 text-muted-foreground" />
                </motion.div>
              </button>
              <AnimatePresence initial={false}>
                {isExpanded && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                    className="overflow-hidden"
                  >
                    <div className="px-4 pb-4">
                      {section.isCardDetails ? (
                        <div className="space-y-3">
                          {(section.content as IInterpretationResult['cardDetails']).map((cd, ci) => (
                            <div
                              key={ci}
                              className="p-3 rounded-xl bg-muted/40 border border-border/30"
                            >
                              <div className="flex items-center gap-2 mb-1.5">
                                <Badge variant="secondary" className="text-xs">
                                  {cd.positionName}
                                </Badge>
                              </div>
                              <p className="text-sm text-foreground/85 leading-relaxed whitespace-pre-line">
                                {cd.content}
                              </p>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="flex items-start gap-3">
                          <p className="text-sm text-foreground/85 leading-relaxed whitespace-pre-line flex-1">
                            {section.content as string}
                          </p>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="shrink-0 size-8"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleCopy(section.content as string, sections.indexOf(section));
                            }}
                            aria-label="复制"
                          >
                            {copiedIndex === sections.indexOf(section) ? (
                              <Check className="size-3.5 text-success" />
                            ) : (
                              <Copy className="size-3.5" />
                            )}
                          </Button>
                        </div>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </Card>
          );
        })}

        {/* 温馨提示 */}
        <Card className="rounded-2xl border-border/40 shadow-sm">
          <CardContent className="p-4 text-center">
            <p className="text-xs text-muted-foreground">
              💡 塔罗解读仅供娱乐与心理参考，最终选择权始终在你手中。
            </p>
          </CardContent>
        </Card>
      </motion.div>
    );
  };

  // ==================== 渲染：流式生成中 ====================
  const renderStreaming = () => {
    if (!isGenerating) return null;
    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-4"
      >
        <Card className="rounded-2xl border-primary/30 shadow-md bg-primary/5">
          <CardContent className="p-6">
            <div className="flex items-center gap-3 mb-4">
              <Loader2 className="size-5 animate-spin text-primary" />
              <div>
                <span className="text-sm font-semibold text-primary">
                  AI 正在为你解读...
                </span>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {streamingContent ? '正在生成内容...' : '正在连接 AI 服务...'}
                </p>
              </div>
            </div>
            {streamingContent ? (
              <div className="p-4 rounded-xl bg-background/60 border border-primary/10">
                <p className="text-sm text-foreground leading-relaxed whitespace-pre-line">
                  {streamingContent}
                </p>
              </div>
            ) : (
              <div className="flex items-center justify-center py-8">
                <div className="flex gap-1">
                  <div className="size-2 rounded-full bg-primary/40 animate-bounce" style={{ animationDelay: '0ms' }} />
                  <div className="size-2 rounded-full bg-primary/40 animate-bounce" style={{ animationDelay: '150ms' }} />
                  <div className="size-2 rounded-full bg-primary/40 animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>
    );
  };

  // ==================== 渲染：初始态 ====================
  const renderInitial = () => {
    if (interpretation || isGenerating) return null;
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      >
        <Card className="rounded-2xl border-border/40 shadow-sm">
          <CardHeader>
            <CardTitle className="text-base font-semibold flex items-center gap-2">
              <Sparkles className="size-5 text-primary" />
              AI 智能解读
            </CardTitle>
            <CardDescription className="text-sm">
              选择解读风格，点击生成按钮，AI 将结合牌阵、卡牌和你的问题进行深度解读
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* 风格选择 */}
            <div>
              <p className="text-sm font-medium text-foreground mb-2">解读风格</p>
              <Tabs
                value={style}
                onValueChange={(v) => setStyle(v as typeof style)}
                className="w-full"
              >
                <TabsList className="w-full grid grid-cols-3 h-auto p-1 rounded-xl bg-muted/60">
                  {STYLE_OPTIONS.map((opt) => (
                    <TabsTrigger
                      key={opt.value}
                      value={opt.value}
                      className="rounded-lg py-2 text-xs data-[state=active]:bg-background data-[state=active]:shadow-sm"
                    >
                      <div className="flex flex-col items-center gap-0.5">
                        <span className="font-medium">{opt.label}</span>
                        <span className="text-[10px] text-muted-foreground">{opt.desc}</span>
                      </div>
                    </TabsTrigger>
                  ))}
                </TabsList>
              </Tabs>
            </div>

            {/* 生成按钮 */}
            <Button
              onClick={handleGenerate}
              disabled={isGenerating}
              className="w-full h-12 rounded-xl text-base font-semibold bg-gradient-to-r from-[#9B8AC4] to-[#7B68A8] hover:from-[#A898D0] hover:to-[#8B78B8] text-white shadow-md hover:shadow-lg transition-all"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="size-5 animate-spin" />
                  解读生成中...
                </>
              ) : (
                <>
                  <Sparkles className="size-5" />
                  开始解读
                </>
              )}
            </Button>
          </CardContent>
        </Card>
      </motion.div>
    );
  };

  // ==================== 主渲染 ====================
  return (
    <section className="w-full">
      <div className="space-y-6">
        {/* 标题 */}
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
            <Sparkles className="size-5 text-primary" />
            AI 智能解读
          </h2>
          {interpretation && !isGenerating && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleGenerate}
              className="rounded-xl text-xs"
            >
              <Sparkles className="size-3.5" />
              重新生成
            </Button>
          )}
        </div>

        {/* 状态切换 */}
        {renderInitial()}
        {renderStreaming()}
        {renderInterpretation()}
      </div>
    </section>
  );
}

// ==================== 工具函数 ====================
/** 解析流式输出的结构化解读内容 */
function parseInterpretationContent(raw: string): {
  overview: string;
  cardDetails: IInterpretationResult['cardDetails'];
  positionAnalysis: string;
  energyFlow: string;
  coreConflict: string;
  conclusion: string;
  advice: string;
  selfReflection: string;
} {
  // 新版6段式输出优先，回退旧版
  const overview = extractSection(raw, ['牌阵能量总览', '整体解读', '牌面总览']);
  const cardDetailsRaw = extractSection(raw, ['牌面逐一解读', '分牌详细解读', '分牌解读']);
  const energyFlow = extractSection(raw, ['牌面联动分析', '能量流动', '牌间互动']);
  const conclusion = extractSection(raw, ['综合牌阵故事', '综合牌阵分析', '综合结论']);
  const advice = extractSection(raw, ['启发式指引', '行动建议']);
  const selfReflection = extractSection(raw, ['自我觉察提问', '自我觉察']);
  // 旧版兼容
  const positionAnalysis = extractSection(raw, ['牌阵宫位精析', '宫位精析']);
  const coreConflict = extractSection(raw, ['核心冲突与转化', '核心冲突']);

  // 解析分牌解读为结构化数组
  const cardDetails: IInterpretationResult['cardDetails'] = [];
  if (cardDetailsRaw) {
    // 新版格式：**牌名** 或 旧版格式：牌位「XXX」
    const parts = cardDetailsRaw.split(/(?=\*\*|牌位[「「])/);
    for (const part of parts) {
      // 新版：**牌名** 或 **【位置】牌名**
      let posName = '';
      let content = part;
      const boldMatch = part.match(/^\*\*(.+?)\*\*/);
      if (boldMatch) {
        posName = boldMatch[1].replace(/^【.+?】/, '').trim();
        content = part.slice(boldMatch[0].length).trim();
      } else {
        const legacyMatch = part.match(/牌位[「「](.+?)[」」]/);
        if (legacyMatch) {
          posName = legacyMatch[1];
          content = part.replace(/牌位[「「].+?[」」][：:]?\s*/, '').trim();
        }
      }
      if (posName && content) {
        cardDetails.push({ cardId: '', positionName: posName, content });
      }
    }
    if (cardDetails.length === 0 && cardDetailsRaw.trim()) {
      cardDetails.push({ cardId: '', positionName: '综合', content: cardDetailsRaw.trim() });
    }
  }

  return {
    overview: overview || '牌阵能量正在汇聚……',
    cardDetails,
    positionAnalysis: positionAnalysis || '',
    energyFlow: energyFlow || '',
    coreConflict: coreConflict || '',
    conclusion: conclusion || '解读生成中，请稍候...',
    advice: advice || '请在实际生活中保持觉察与行动',
    selfReflection: selfReflection || '',
  };
}

/** 从原始文本中提取指定章节 — 终极简化版 */
function extractSection(raw: string, markers: string[]): string {
  const cleanRaw = raw.replace(/\r\n/g, '\n').replace(/\r/g, '\n');
  // split at ## or ### or # at the start of any line
  const parts = cleanRaw.split(/^#{1,3}\s+/m);
  
  for (let i = 1; i < parts.length; i++) {
    const part = parts[i];
    const newline = part.indexOf('\n');
    const title = newline > 0 ? part.slice(0, newline).trim() : part.trim();
    const content = newline > 0 ? part.slice(newline + 1).trim() : '';
    
    for (const marker of markers) {
      if (title.includes(marker)) {
        return content;
      }
    }
  }
  
  return '';
}
