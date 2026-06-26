import { useState, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, ChevronDown, ChevronUp, Loader2, Copy, Check } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { callAiStream, hasAiConfig } from '@/lib/aiApi';
import type { IInterpretationResult, IDrawnCard } from '@/types/tarot';
import type { ISpreadConfig } from '@/types/spread';
import { MOCK_TAROT_CARDS } from '@/data/tarotCards';

// ==================== Props ====================
interface InterpretationSectionProps {
  /** 当前牌阵配置 */
  spread: ISpreadConfig;
  /** 抽牌结果 */
  drawnCards: IDrawnCard[];
  /** 用户问题 */
  question: string;
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
  interpretation,
  onInterpretationChange,
}: InterpretationSectionProps) {
  const [style, setStyle] = useState<'gentle' | 'rational' | 'traditional'>('gentle');
  const [isGenerating, setIsGenerating] = useState(false);
  const [streamingContent, setStreamingContent] = useState('');
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    overview: true,
    energyFlow: false,
    cardDetails: false,
    conclusion: false,
    advice: false,
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

    // 构建牌阵信息
    const spreadInfo = `牌阵：${spread.name}（${spread.cardCount}张牌）
牌位含义：
${spread.positions.map((p) => `  ${p.index}. ${p.name}：${p.description}`).join('\n')}`;

    // 构建卡牌列表
    const cardList = drawnCards
      .map((dc) => {
        const card = MOCK_TAROT_CARDS.find((c) => c.id === dc.cardId);
        if (!card) return null;
        const direction = dc.isReversed ? '逆位' : '正位';
        const keywords = dc.isReversed ? card.reversedKeywords.join('、') : card.uprightKeywords.join('、');
        return `牌位「${dc.positionName}」：${card.nameCn}（${card.nameEn}）${direction}
  关键词：${keywords}
  释义：${dc.isReversed ? card.reversedMeaning : card.uprightMeaning}`;
      })
      .filter(Boolean)
      .join('\n\n');

    const styleLabel = STYLE_LABEL_MAP[style];

    const systemPrompt = `你是一位拥有10年实战经验的专业韦特塔罗解读师，深度研究荣格心理学与象征主义，擅长用温暖且有力量的语言解读牌面。

解读原则：
1. 严格基于提供的牌阵、每张牌的正逆位和牌阵中的具体位置含义进行解读，禁止凭空捏造。
2. 不做绝对化的命运预言，强调人的主观能动性。
3. 语言表达流畅自然，符合年轻女性用户的阅读习惯，语气温柔有共情力。
4. 禁止涉及医疗、法律、投资等专业领域建议。

请严格按以下 Markdown 格式输出：
## 牌面总览
用一句话概括本次牌阵的核心主题与整体能量基调。

## 能量流动
分析每张牌在牌阵位置中的相互作用关系，描述能量如何在各牌位之间流转。例如：过去的牌如何影响现在，现在的势能如何指向未来；牌与牌之间是冲突、呼应还是递进关系。要结合具体的牌阵名称和位置含义来说明。

## 分牌详细解读
按牌阵位置顺序逐一解读，每张牌必须明确标注【位置名称】和牌名，格式：
**【位置名称】牌名 · 正/逆位**
解读内容，结合位置含义与牌意进行分析。

## 综合结论
整合所有牌面信息，给出核心洞察与整体趋势。

## 行动建议
给出2-3条具体、可落地的行动建议。

结尾附：💡 温馨提示：塔罗解读仅供娱乐与心理参考，最终选择权始终在你手中。`;

    const userMessage = `本次使用的牌阵是「${spread.name}」，这是一个${spread.cardCount}张牌的牌阵，适用场景：${spread.scenario}。

解读风格：${styleLabel}

${spreadInfo}

抽到的牌面（每张牌已标注在牌阵中的具体位置和正逆位）：
${cardList}

用户问题：${question || '请给我一个综合解读'}

请基于以上信息进行专业解读，务必在牌阵整体语境下分析，不要孤立看待每张牌。`;

    const controller = new AbortController();
    abortRef.current = controller;

    try {
      let fullContent = '';
      await callAiStream(
        systemPrompt,
        userMessage,
        (chunk) => {
          fullContent += chunk;
          setStreamingContent(fullContent);
        },
        controller.signal,
      );

      if (!controller.signal.aborted) {
        const parsed = parseInterpretationContent(fullContent);
        onInterpretationChange({
          overview: parsed.overview,
          energyFlow: parsed.energyFlow,
          cardDetails: parsed.cardDetails,
          conclusion: parsed.conclusion,
          advice: parsed.advice,
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
  }, [isGenerating, spread, drawnCards, question, style, onInterpretationChange]);

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
      { key: 'overview', title: '🔮 牌面总览', content: interpretation.overview },
      { key: 'energyFlow', title: '🌊 能量流动', content: interpretation.energyFlow },
      { key: 'cardDetails', title: '📜 分牌详细解读', content: interpretation.cardDetails },
      { key: 'conclusion', title: '✨ 综合结论', content: interpretation.conclusion },
      { key: 'advice', title: '💡 行动建议', content: interpretation.advice },
    ];

    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        className="space-y-4"
      >
        {sections.map((section, idx) => {
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
                      {section.key === 'cardDetails' ? (
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
                              handleCopy(section.content as string, idx);
                            }}
                            aria-label="复制"
                          >
                            {copiedIndex === idx ? (
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
  energyFlow: string;
  cardDetails: IInterpretationResult['cardDetails'];
  conclusion: string;
  advice: string;
} {
  const overview = extractSection(raw, ['牌面总览', '1.', '一、']);
  const energyFlow = extractSection(raw, ['能量流动']);
  const cardDetailsRaw = extractSection(raw, ['分牌解读', '分牌详细解读', '2.', '二、']);
  const conclusion = extractSection(raw, ['综合结论', '3.', '三、']);
  const advice = extractSection(raw, ['行动建议', '4.', '四、']);

  // 解析分牌解读为结构化数组
  const cardDetails: IInterpretationResult['cardDetails'] = [];
  if (cardDetailsRaw) {
    const parts = cardDetailsRaw.split(/(?=牌位[「「])/);
    for (const part of parts) {
      const match = part.match(/牌位[「「](.+?)[」」]/);
      if (match) {
        cardDetails.push({
          cardId: '',
          positionName: match[1],
          content: part.replace(/牌位[「「].+?[」」][：:]?\s*/, '').trim(),
        });
      }
    }
    // 如果正则没匹配到，整段作为一个
    if (cardDetails.length === 0 && cardDetailsRaw.trim()) {
      cardDetails.push({
        cardId: '',
        positionName: '综合',
        content: cardDetailsRaw.trim(),
      });
    }
  }

  return {
    overview: overview || '解读生成中，请稍候...',
    energyFlow: energyFlow || '解读生成中，请稍候...',
    cardDetails,
    conclusion: conclusion || '解读生成中，请稍候...',
    advice: advice || '解读生成中，请稍候...',
  };
}

/** 从原始文本中提取指定章节 */
function extractSection(raw: string, markers: string[]): string {
  for (const marker of markers) {
    const idx = raw.indexOf(marker);
    if (idx === -1) continue;

    let start = idx + marker.length;
    // 跳过冒号或换行
    while (start < raw.length && (raw[start] === '：' || raw[start] === ':' || raw[start] === '\n')) {
      start++;
    }

    // 找下一个章节标记
    const nextMarkers = ['牌面总览', '能量流动', '分牌解读', '分牌详细解读', '综合结论', '行动建议', '1.', '2.', '3.', '4.', '一、', '二、', '三、', '四、'];
    let end = raw.length;
    for (const nm of nextMarkers) {
      const ni = raw.indexOf(nm, start);
      if (ni !== -1 && ni < end) {
        end = ni;
      }
    }

    const result = raw.slice(start, end).trim();
    if (result) return result;
  }

  // 如果所有标记都没找到，返回原始内容的前半部分作为 overview
  return '';
}
