import { useState, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Sparkles, RefreshCw, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Image } from '@/components/ui/image';
import { scopedStorage } from '@lark-apaas/client-toolkit-lite';
import { MOCK_TAROT_CARDS, CARD_BACK_IMAGE_URL } from '@/data/tarotCards';
import { callAiStream, hasAiConfig } from '@/lib/aiApi';
import { buildDailySystemPrompt, buildDailyUserMessage } from '@/data/tarotPrompts';
import { generateId } from '@/lib/storage';
import type { ITarotCard, IDrawnCard } from '@/types/tarot';

/** crypto.getRandomValues — 硬件真随机 */
function cryptoRandom(): number {
  const buf = new Uint32Array(1);
  crypto.getRandomValues(buf);
  return buf[0] / 0xFFFFFFFF;
}

function collectPhysicalNoise(): number {
  let noise = performance.now() % 0.001;
  if (typeof DeviceMotionEvent !== 'undefined') {
    try {
      window.addEventListener('devicemotion', (e) => {
        const a = e.accelerationIncludingGravity;
        if (a?.x != null && a?.y != null && a?.z != null)
          noise += (Math.abs(a.x) + Math.abs(a.y) + Math.abs(a.z)) * 0.001;
      }, { once: true });
    } catch { noise += performance.now() % 0.001; }
  }
  return noise % 1;
}

function trueRandom(): number {
  return (cryptoRandom() + collectPhysicalNoise()) % 1;
}

type Phase = 'idle' | 'revealed';

export default function DailyDrawPage() {
  const navigate = useNavigate();
  const [phase, setPhase] = useState<Phase>('idle');
  const [drawnCard, setDrawnCard] = useState<IDrawnCard | null>(null);
  const [cardData, setCardData] = useState<ITarotCard | null>(null);
  const [isAnimating, setIsAnimating] = useState(false);

  // AI 解读
  const [aiStyle, setAiStyle] = useState<'gentle' | 'rational'>('gentle');
  const [aiText, setAiText] = useState('');
  const [aiLoading, setAiLoading] = useState(false);
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    overview: true,
    detail: false,
    advice: false,
  });
  const abortRef = useRef<AbortController | null>(null);
  const aiTextRef = useRef('');

  const runAiInterpretation = useCallback(async () => {
    if (!cardData || !drawnCard) return;
    setAiText('');
    aiTextRef.current = '';
    setAiLoading(true);

    const systemPrompt = buildDailySystemPrompt(cardData, drawnCard.isReversed);
    const userMessage = buildDailyUserMessage(cardData, drawnCard.isReversed, aiStyle);

    const controller = new AbortController();
    abortRef.current = controller;

    try {
      await callAiStream(systemPrompt, userMessage, (chunk) => {
        aiTextRef.current += chunk;
        setAiText(aiTextRef.current);
      }, controller.signal);

      if (!controller.signal.aborted) {
        const clean = aiTextRef.current.replace('[DONE]', '').trim();
        setAiText(clean);
      }
    } catch {
      if (!controller.signal.aborted) setAiText('AI解读暂时不可用，请稍后重试');
    } finally {
      setAiLoading(false);
    }
  }, [cardData, drawnCard, aiStyle]);

  const handleDraw = useCallback(() => {
    setIsAnimating(true);
    // 真随机选牌
    const idx = Math.floor(trueRandom() * MOCK_TAROT_CARDS.length);
    const card = MOCK_TAROT_CARDS[idx];
    const isReversed = trueRandom() > 0.5;

    const drawn: IDrawnCard = {
      cardId: card.id,
      positionName: '今日指引',
      isReversed,
    };

    // 翻牌动画延迟
    setTimeout(() => {
      setDrawnCard(drawn);
      setCardData(card);
      setPhase('revealed');
      setIsAnimating(false);
    }, 800);
  }, []);

  const handleRedraw = useCallback(() => {
    abortRef.current?.abort();
    aiTextRef.current = '';
    setDrawnCard(null);
    setCardData(null);
    setAiText('');
    setAiLoading(false);
    setPhase('idle');
  }, []);

  const handleFinish = useCallback(() => {
    if (!drawnCard) return;
    const readingId = generateId();
    const record = {
      id: readingId,
      spreadId: 'daily-card',
      spreadName: '今日一牌',
      question: '',
      cards: [drawnCard],
      style: 'gentle' as const,
      isFavorite: false,
      createdAt: new Date().toISOString(),
    };

    const raw = scopedStorage.getItem('__tarot_readings');
    const existing = raw ? JSON.parse(raw) : [];
    existing.unshift(record);
    scopedStorage.setItem('__tarot_readings', JSON.stringify(existing));

    navigate(`/result/${readingId}`);
  }, [drawnCard, navigate]);

  return (
    <div className="min-h-screen bg-background">
      <main className="max-w-lg mx-auto px-4 py-8 space-y-8">
        {/* 顶部栏 */}
        <div className="flex items-center gap-3">
          <Button
            variant="ghost" size="icon"
            onClick={() => navigate(-1)}
            className="shrink-0"
            aria-label="返回"
          >
            <ArrowLeft className="size-5" />
          </Button>
          <div>
            <h1 className="text-lg font-semibold text-foreground">今日一牌</h1>
            <p className="text-xs text-muted-foreground">真随机抽牌 · 即抽即看</p>
          </div>
        </div>

        {/* 阶段 1: 待抽牌 */}
        {phase === 'idle' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
            className="flex flex-col items-center gap-8 pt-8"
          >
            {/* 卡背展示 */}
            <div className={`relative w-40 h-56 sm:w-48 sm:h-72 transition-all duration-500 ${isAnimating ? 'scale-95 opacity-50' : ''}`}>
              <div className="absolute inset-0 rounded-2xl border-2 border-primary/20 overflow-hidden shadow-lg">
                <Image src={CARD_BACK_IMAGE_URL} alt="卡背" className="w-full h-full object-cover" />
              </div>
              {isAnimating && (
                <motion.div
                  animate={{ rotate: [0, -5, 5, -3, 3, 0] }}
                  transition={{ duration: 0.6, repeat: Infinity }}
                  className="absolute inset-0 rounded-2xl border-2 border-primary/40 overflow-hidden shadow-xl"
                >
                  <Image src={CARD_BACK_IMAGE_URL} alt="卡背" className="w-full h-full object-cover" />
                </motion.div>
              )}
            </div>

            <div className="text-center space-y-3">
              <p className="text-sm text-muted-foreground">
                静心凝神，翻开今日的指引
              </p>
              <Button
                size="lg"
                className="rounded-xl gap-2 px-10 h-12"
                onClick={handleDraw}
                disabled={isAnimating}
              >
                <Sparkles className="size-5" />
                {isAnimating ? '抽牌中...' : '翻开今日一牌'}
              </Button>
            </div>
          </motion.div>
        )}

        {/* 阶段 2: 牌已翻开 */}
        {phase === 'revealed' && cardData && drawnCard && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
            className="space-y-6"
          >
            {/* 牌面 */}
            <div className="flex justify-center">
              <motion.div
                initial={{ rotateY: 90, scale: 0.8 }}
                animate={{ rotateY: 0, scale: 1 }}
                transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
                style={{ perspective: '800px', transformStyle: 'preserve-3d' }}
                className={`w-40 h-56 sm:w-48 sm:h-72 rounded-2xl border-2 overflow-hidden shadow-lg ${
                  drawnCard.isReversed ? 'rotate-180' : ''
                }`}
                onClick={() => navigate(`/library/${cardData.id}`)}
              >
                <Image
                  src={cardData.imageUrl}
                  alt={cardData.nameCn}
                  className="w-full h-full object-cover cursor-pointer"
                />
              </motion.div>
            </div>

            {/* 牌名与身份 */}
            <div className="text-center space-y-2">
              <h2 className="text-2xl font-semibold text-foreground">{cardData.nameCn}</h2>
              <p className="text-sm text-muted-foreground">{cardData.nameEn}</p>
              <Badge
                variant="outline"
                className={`text-sm px-3 py-1 ${
                  drawnCard.isReversed
                    ? 'border-warning/40 text-warning bg-warning/5'
                    : 'border-success/40 text-success bg-success/5'
                }`}
              >
                {drawnCard.isReversed ? '逆位' : '正位'}
              </Badge>
            </div>

            {/* 释义 */}
            <Card className="rounded-2xl border-border/40 shadow-sm">
              <CardContent className="p-6 space-y-4">
                <div>
                  <h3 className="text-sm font-semibold text-foreground mb-2">
                    {drawnCard.isReversed ? '逆位释义' : '正位释义'}
                  </h3>
                  <p className="text-sm text-foreground/80 leading-relaxed whitespace-pre-line">
                    {drawnCard.isReversed ? cardData.reversedMeaning : cardData.uprightMeaning}
                  </p>
                </div>

                {/* 关键词 */}
                <div className="flex flex-wrap gap-1.5">
                  {(drawnCard.isReversed ? cardData.reversedKeywords : cardData.uprightKeywords).map(kw => (
                    <Badge key={kw} variant="secondary" className="text-xs">{kw}</Badge>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* AI 解读区 */}
            <div className="space-y-3">
              {/* 风格选择 + 解读触发 */}
              {!aiText && !aiLoading && (
                <div className="flex gap-2 items-center justify-center flex-wrap">
                  <span className="text-xs text-muted-foreground">风格：</span>
                  {(['gentle', 'rational'] as const).map(s => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => setAiStyle(s)}
                      className={`text-xs px-3 py-1 rounded-full border transition-colors ${
                        aiStyle === s
                          ? 'bg-primary/10 border-primary/40 text-primary font-medium'
                          : 'border-border text-muted-foreground hover:bg-muted/50'
                      }`}
                    >
                      {s === 'gentle' ? '温柔治愈' : '理性分析'}
                    </button>
                  ))}
                  {hasAiConfig() && (
                    <Button size="sm" className="rounded-xl gap-1.5 h-8" onClick={runAiInterpretation}>
                      <Sparkles className="size-3.5" />
                      AI 解读今日运势
                    </Button>
                  )}
                </div>
              )}

              {/* AI 加载中 */}
              {aiLoading && (
                <Card className="rounded-2xl border-border/40 shadow-sm">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <span className="inline-block size-2 rounded-full bg-primary animate-pulse" />
                      AI 正在解读今日运势...
                    </div>
                    {aiText && (
                      <p className="text-sm text-foreground/80 leading-relaxed whitespace-pre-line mt-3">
                        {aiText.replace('[DONE]', '')}
                      </p>
                    )}
                  </CardContent>
                </Card>
              )}

              {/* AI 结果（折叠展示） */}
              {!aiLoading && aiText && !aiText.includes('[DONE]') && aiText.length > 20 && (() => {
                const sections = parseDailySections(aiText);
                return (
                  <div className="space-y-2">
                    {sections.map(({ key, title, content }) => (
                      <Card key={key} className="rounded-2xl border-border/40 shadow-sm">
                        <button
                          type="button"
                          onClick={() => setExpandedSections(prev => ({ ...prev, [key]: !prev[key] }))}
                          className="w-full flex items-center justify-between p-3 text-left hover:bg-muted/30 transition-colors rounded-2xl"
                        >
                          <span className="text-sm font-semibold text-foreground">{title}</span>
                          <motion.div animate={{ rotate: expandedSections[key] ? 180 : 0 }} transition={{ duration: 0.2 }}>
                            <ChevronDown className="size-4 text-muted-foreground" />
                          </motion.div>
                        </button>
                        <AnimatePresence initial={false}>
                          {expandedSections[key] && (
                            <motion.div
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: 'auto', opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              transition={{ duration: 0.3 }}
                              className="overflow-hidden"
                            >
                              <p className="px-3 pb-3 text-sm text-foreground/80 leading-relaxed whitespace-pre-line">
                                {content}
                              </p>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </Card>
                    ))}
                  </div>
                );
              })()}
            </div>

            {/* 操作按钮 */}
            <div className="flex gap-3 justify-center pt-2">
              <Button variant="outline" className="rounded-xl gap-2" onClick={handleRedraw}>
                <RefreshCw className="size-4" />
                重新抽牌
              </Button>
            </div>
          </motion.div>
        )}
      </main>
    </div>
  );
}

/** 简化的每日一牌 section 解析 */
function parseDailySections(raw: string) {
  const result: { key: string; title: string; content: string }[] = [];
  const sections = raw.split(/^#{1,3}\s+/m);
  for (let i = 1; i < sections.length; i++) {
    const part = sections[i];
    const nl = part.indexOf('\n');
    const title = nl > 0 ? part.slice(0, nl).trim() : part.trim();
    const content = nl > 0 ? part.slice(nl + 1).trim() : '';
    if (!content) continue;
    if (title.includes('今日指引') || title.includes('总览')) result.push({ key: 'overview', title: '🔮 今日指引', content });
    else if (title.includes('深度') || title.includes('解读')) result.push({ key: 'detail', title: '📖 深度解读', content });
    else if (title.includes('行动') || title.includes('建议')) result.push({ key: 'advice', title: '💡 行动建议', content });
  }
  return result;
}
