import { useState, useCallback, useMemo, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Shuffle, Scissors, Sparkles, Wand2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Image } from '@/components/ui/image';
import { MOCK_SPREADS } from '@/data/spreads';
import { addReading } from '@/lib/storage';
import { MOCK_TAROT_CARDS, CARD_BACK_IMAGE_URL } from '@/data/tarotCards';
import type { ITarotCard, IDrawnCard, QuestionType } from '@/types/tarot';

type Phase = 'idle' | 'shuffling' | 'ready_to_cut' | 'cut_done' | 'drawing' | 'revealing' | 'complete';

// ===== 真随机系统 =====

/** crypto.getRandomValues — 硬件真随机 [0, 1) */
function cryptoRandom(): number {
  const buf = new Uint32Array(1);
  crypto.getRandomValues(buf);
  return buf[0] / 0xFFFFFFFF;
}

/** 收集物理噪音：加速度计 + 高精度时间戳抖动 */
function collectPhysicalNoise(): number {
  let noise = performance.now() % 0.001; // 微秒级时间抖动

  // DeviceMotion 加速度计（仅在支持的设备上）
  if (typeof DeviceMotionEvent !== 'undefined') {
    try {
      // 同步方式：如果已有权限，尝试读取上一次事件
      const handler = (e: DeviceMotionEvent) => {
        const a = e.accelerationIncludingGravity;
        if (a?.x != null && a?.y != null && a?.z != null) {
          noise += (Math.abs(a.x) + Math.abs(a.y) + Math.abs(a.z)) * 0.001;
        }
      };
      window.addEventListener('devicemotion', handler, { once: true });
      // 无法同步获取，用 performance.now() 二次抖动代替
      noise += (performance.now() % 0.0001);
    } catch {
      noise += (performance.now() % 0.001);
    }
  }

  return noise % 1;
}

/** 混入物理噪音的真随机数 */
function trueRandom(): number {
  return (cryptoRandom() + collectPhysicalNoise()) % 1;
}

/** Fisher-Yates + 真随机洗牌 */
function shuffleDeck(cards: ITarotCard[]): ITarotCard[] {
  const shuffled = [...cards];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(trueRandom() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

function generateId(): string {
  return Date.now().toString(36) + cryptoRandom().toString(36).slice(2, 8);
}

export default function DrawPage() {
  const { spreadId } = useParams<{ spreadId: string }>();
  const navigate = useNavigate();

  const spread = useMemo(() => MOCK_SPREADS.find(s => s.id === spreadId), [spreadId]);

  const [phase, setPhase] = useState<Phase>('idle');
  const [question, setQuestion] = useState('');
  const [questionType, setQuestionType] = useState<QuestionType>('');
  const [deck, setDeck] = useState<ITarotCard[]>([]);
  const [drawnCardIds, setDrawnCardIds] = useState<Set<string>>(new Set());
  const [drawnCards, setDrawnCards] = useState<IDrawnCard[]>([]);
  const [revealedIndices, setRevealedIndices] = useState<Set<number>>(new Set());

  // ---- 无效牌阵 ----
  if (!spread) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center space-y-4">
          <p className="text-muted-foreground">未找到该牌阵</p>
          <Button variant="outline" className="rounded-xl" onClick={() => navigate('/')}>
            返回首页
          </Button>
        </div>
      </div>
    );
  }

  // ---- 洗牌 ----
  const handleShuffle = useCallback(async () => {
    setPhase('shuffling');
    await new Promise(r => setTimeout(r, 2000));
    setDeck(shuffleDeck(MOCK_TAROT_CARDS));
    setPhase('ready_to_cut');
  }, []);

  // ---- 切牌 ----
  const handleCut = useCallback((index: number) => {
    setDeck(prev => [...prev.slice(index), ...prev.slice(0, index)]);
    setDrawnCardIds(new Set());
    setDrawnCards([]);
    setPhase('cut_done');
  }, []);

  const handleAutoCut = useCallback(() => {
    if (deck.length < 10) return;
    const idx = Math.floor(trueRandom() * (deck.length - 10)) + 5;
    handleCut(idx);
  }, [deck.length, handleCut]);

  // ---- 手动抽牌 ----
  const handleDrawCard = useCallback((cardIndex: number) => {
    const card = deck[cardIndex];
    if (!card || drawnCardIds.has(card.id)) return;
    if (drawnCards.length >= spread.cardCount) return;

    const position = spread.positions[drawnCards.length];

    // 元素牌阵花色校验：仅允许对应花色的牌
    if (position.requiredSuit && card.category !== position.requiredSuit) return;

    const isReversed = trueRandom() > 0.5;

    const drawnCard: IDrawnCard = {
      cardId: card.id,
      positionName: position.name,
      isReversed,
    };

    setDrawnCardIds(prev => new Set([...prev, card.id]));
    setDrawnCards(prev => [...prev, drawnCard]);

    if (drawnCards.length + 1 >= spread.cardCount) {
      setPhase('revealing');
    }
  }, [deck, drawnCardIds, drawnCards.length, spread]);

  // ---- 自动抽牌 ----
  const handleAutoDraw = useCallback(async () => {
    setPhase('drawing');
    const cardsToDraw = spread.cardCount;
    const newDrawn: IDrawnCard[] = [];
    const pickedIds = new Set(drawnCardIds);

    for (let i = 0; i < cardsToDraw; i++) {
      const position = spread.positions[i];
      // 从未被选走的牌中随机抽取，有花色要求时仅限对应花色
      let available = deck.filter(c => !pickedIds.has(c.id));
      if (position.requiredSuit) {
        available = available.filter(c => c.category === position.requiredSuit);
      }
      if (available.length === 0) break;
      const idx = Math.floor(trueRandom() * available.length);
      const card = available[idx];
      const isReversed = trueRandom() > 0.5;

      newDrawn.push({ cardId: card.id, positionName: position.name, isReversed });
      pickedIds.add(card.id);

      setDrawnCardIds(new Set(pickedIds));
      await new Promise(r => setTimeout(r, 350));
    }

    setDrawnCards(newDrawn);
    setPhase('revealing');
  }, [deck, drawnCardIds, spread]);

  // ---- 翻牌 ----
  const handleRevealCard = useCallback((index: number) => {
    setRevealedIndices(prev => {
      const next = new Set(prev);
      next.add(index);
      if (next.size >= spread.cardCount) {
        setTimeout(() => setPhase('complete'), 700);
      }
      return next;
    });
  }, [spread.cardCount]);

  const handleRevealAll = useCallback(() => {
    const all = new Set<number>();
    for (let i = 0; i < spread.cardCount; i++) all.add(i);
    setRevealedIndices(all);
    // 翻牌动画 700ms + 飞牌到牌阵位置 1200ms + 稳定 300ms
    setTimeout(() => setPhase('complete'), 700);
  }, [spread.cardCount]);

  // ---- 完成 → 自动跳转 ----
  useEffect(() => {
    if (phase !== 'complete') return;
    const timer = setTimeout(() => handleComplete(), 1800);
    return () => clearTimeout(timer);
  }, [phase]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleComplete = useCallback(() => {
    const readingId = generateId();
    const record = {
      id: readingId,
      spreadId: spread.id,
      spreadName: spread.name,
      question,
      questionType: questionType || undefined,
      cards: drawnCards,
      style: 'gentle' as const,
      isFavorite: false,
      createdAt: new Date().toISOString(),
    };

    addReading(record);
    navigate(`/result/${readingId}`);
  }, [spread, question, drawnCards, navigate]);

  const remainingDraws = spread.cardCount - drawnCards.length;

  return (
    <div className="min-h-screen bg-background">
      <main className="max-w-2xl mx-auto px-4 py-6 space-y-8">

        {/* ---- 顶部栏 ---- */}
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate(-1)}
            className="shrink-0"
            aria-label="返回"
          >
            <ArrowLeft className="size-5" />
          </Button>
          <div className="flex-1 min-w-0">
            <h1 className="text-xl font-semibold text-foreground truncate">
              {spread.name}
            </h1>
            <p className="text-xs text-muted-foreground">
              {spread.cardCount} 张牌 · {spread.scenario}
            </p>
          </div>
          {phase === 'complete' && (
            <Badge variant="secondary" className="shrink-0">完成</Badge>
          )}
        </div>

        {/* ---- 问题输入 ---- */}
        {phase === 'idle' && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
            className="space-y-3"
          >
            <label className="text-sm font-medium text-foreground">
              你想问什么？（选填）
            </label>
            <div className="flex gap-2 flex-wrap">
              {([
                { key: 'love' as const, label: '💕 恋爱婚姻', active: 'bg-pink-500/10 border-pink-500/30 text-pink-600 dark:text-pink-400' },
                { key: 'career' as const, label: '💼 工作事业', active: 'bg-blue-500/10 border-blue-500/30 text-blue-600 dark:text-blue-400' },
                { key: 'money' as const, label: '💰 金钱财物', active: 'bg-amber-500/10 border-amber-500/30 text-amber-600 dark:text-amber-400' },
              ] as const).map(({ key, label, active }) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => setQuestionType(questionType === key ? '' : key)}
                  className={`px-4 py-2.5 rounded-xl border text-sm font-medium transition-all duration-200 ${
                    questionType === key
                      ? active + ' shadow-sm'
                      : 'border-border/60 bg-card/50 text-muted-foreground hover:border-border hover:text-foreground'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </motion.div>
        )}

        {/* ---- 主交互区 ---- */}
        <div className="relative min-h-[320px] flex flex-col items-center justify-center">

          {/* ===== 阶段 1: 待洗牌 ===== */}
          {phase === 'idle' && (
            <motion.div
              initial={{ opacity: 0, scale: 0.92 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
              className="text-center space-y-6"
            >
              {/* 牌堆视觉 */}
              <div className="relative w-32 h-44 mx-auto">
                {[0, 1, 2].map(i => (
                  <div
                    key={i}
                    className="absolute inset-0 rounded-xl border-2 border-primary/30 overflow-hidden shadow-sm"
                    style={{
                      transform: `rotate(${(i - 1) * 3}deg) translateY(${i * 2}px)`,
                    }}
                  >
                    <Image
                      src={CARD_BACK_IMAGE_URL}
                      alt="卡背"
                      className="w-full h-full object-cover"
                    />
                  </div>
                ))}
              </div>
              <p className="text-sm text-muted-foreground">
                静心凝神，准备开始抽牌
              </p>
              <Button
                size="lg"
                className="rounded-xl gap-2 px-8 h-12"
                onClick={handleShuffle}
              >
                <Shuffle className="size-5" />
                开始洗牌
              </Button>
            </motion.div>
          )}

          {/* ===== 阶段 2: 洗牌中 ===== */}
          {phase === 'shuffling' && (
            <div className="text-center space-y-6">
              <motion.div
                animate={{ rotate: [0, 8, -8, 5, -5, 0] }}
                transition={{ duration: 0.5, repeat: 3 }}
                className="relative w-32 h-44 mx-auto"
              >
                <div className="absolute inset-0 rounded-xl border-2 border-primary/40 overflow-hidden shadow-md">
                  <Image src={CARD_BACK_IMAGE_URL} alt="卡背" className="w-full h-full object-cover" />
                </div>
                <motion.div
                  animate={{ x: [0, 18, -12, 8, -4, 0], y: [0, -8, 4, -2, 1, 0] }}
                  transition={{ duration: 0.4, repeat: 4 }}
                  className="absolute inset-0 rounded-xl border-2 border-primary/30 overflow-hidden"
                  style={{ transform: 'rotate(5deg)' }}
                >
                  <Image src={CARD_BACK_IMAGE_URL} alt="卡背" className="w-full h-full object-cover" />
                </motion.div>
              </motion.div>
              <div className="space-y-2">
                <Sparkles className="size-5 mx-auto text-primary animate-pulse" />
                <p className="text-sm text-muted-foreground">洗牌中...</p>
              </div>
            </div>
          )}

          {/* ===== 阶段 3: 待切牌 ===== */}
          {phase === 'ready_to_cut' && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5 }}
              className="text-center space-y-6 w-full"
            >
              <p className="text-sm text-muted-foreground">
                请切牌，增强仪式感
              </p>

              {/* 牌堆可点击切牌 */}
              <div className="relative w-full max-w-xs mx-auto h-48">
                {deck.slice(0, 15).map((_, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.03 }}
                    className="absolute left-1/2 -translate-x-1/2 w-28 h-40 rounded-xl border border-primary/20 overflow-hidden cursor-pointer hover:border-primary/40 hover:shadow-md transition-all"
                    style={{
                      top: `${i * 1.5}px`,
                      zIndex: i,
                      transform: `rotate(${(trueRandom() - 0.5) * 4}deg)`,
                    }}
                    onClick={() => handleCut(i + 5)}
                  >
                    <Image src={CARD_BACK_IMAGE_URL} alt="卡背" className="w-full h-full object-cover" />
                  </motion.div>
                ))}
              </div>

              <div className="flex gap-3 justify-center items-center">
                <Button
                  variant="outline"
                  className="rounded-xl"
                  onClick={handleAutoCut}
                >
                  <Scissors className="size-4 mr-2" />
                  自动切牌
                </Button>
                <span className="text-xs text-muted-foreground">
                  或点击牌堆切牌
                </span>
              </div>
            </motion.div>
          )}

          {/* ===== 阶段 4/5: 抽牌中 — 横向扇形展牌 ===== */}
          {(phase === 'cut_done' || phase === 'drawing') && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5 }}
              className="text-center space-y-5 w-full"
            >
              <p className="text-sm text-muted-foreground">
                请抽取 {remainingDraws} 张牌
              </p>

              {/* 三行牌叠 */}
              <div className="relative w-full overflow-visible space-y-3 pt-8 pb-4">
                  {(() => {
                    const curPos = spread.positions[drawnCards.length];
                    const requiredSuit = curPos?.requiredSuit;
                    const chunkSize = Math.ceil(deck.length / 3);
                    const rows = [
                      deck.slice(0, chunkSize),
                      deck.slice(chunkSize, chunkSize * 2),
                      deck.slice(chunkSize * 2),
                    ];
                    return rows.map((row, rowIdx) => (
                      <div key={`row-${rowIdx}`} className="flex items-center justify-center px-2 py-1">
                        <AnimatePresence>
                        {row.map((card, colIdx) => {
                          const realIdx = rowIdx * chunkSize + colIdx;
                          const isDrawn = drawnCardIds.has(card.id);
                          const isSuitMismatch = requiredSuit && card.category !== requiredSuit;

                          // 已选中的牌：不渲染，让 AnimatePresence 播放 exit 飞离动画
                          if (isDrawn) return null;

                          const disabled = isSuitMismatch;

                          return (
                            <motion.div
                              key={`fan-${card.id}`}
                              initial={{ opacity: 0, y: -15, scale: 0.9 }}
                              animate={{
                                opacity: isSuitMismatch ? 0.2 : 1,
                                y: 0,
                                scale: isSuitMismatch ? 0.94 : 1,
                              }}
                              exit={{
                                opacity: 0,
                                y: -100,
                                scale: 0.5,
                                rotateZ: -15,
                                transition: { duration: 0.35, ease: [0.4, 0, 0.2, 1] },
                              }}
                              transition={{
                                opacity: { duration: 0.25 },
                                y: { duration: 0.3, ease: [0.16, 1, 0.3, 1] },
                                scale: { duration: 0.25 },
                                default: { duration: 0.18, delay: realIdx * 0.004 },
                              }}
                              whileHover={disabled ? {} : {
                                y: -22,
                                scale: 1.13,
                                zIndex: 999,
                                transition: { duration: 0.14 },
                              }}
                              className={`relative flex-shrink-0 ${disabled ? 'pointer-events-none' : 'cursor-pointer'}`}
                              style={{
                                zIndex: disabled ? 0 : realIdx,
                                marginLeft: colIdx > 0 ? '-73px' : '0',
                              }}
                              onClick={() => !disabled && handleDrawCard(realIdx)}
                            >
                              <div className={`w-20 h-28 sm:w-24 sm:h-36 rounded-lg sm:rounded-xl border-2 overflow-hidden shadow-sm transition-all duration-300 ${
                                isSuitMismatch
                                  ? 'border-muted/30'
                                  : 'border-primary/20 hover:border-primary/50 hover:shadow-lg'
                              }`}>
                                <Image
                                  src={CARD_BACK_IMAGE_URL}
                                  alt="卡背"
                                  className="w-full h-full object-cover"
                                />
                              </div>
                            </motion.div>
                          );
                        })}
                        </AnimatePresence>
                      </div>
                    ));
                  })()}
              </div>

              <div className="flex flex-col items-center gap-2">
                <p className="text-xs text-muted-foreground">
                  点击卡片选取 · 共需 {spread.cardCount} 张
                </p>
                <Button
                  variant="outline"
                  size="sm"
                  className="rounded-xl"
                  onClick={handleAutoDraw}
                >
                  <Wand2 className="size-4 mr-2" />
                  自动抽取
                </Button>
              </div>
            </motion.div>
          )}

          {/* ===== 阶段 6: 翻牌中 ===== */}
          {phase === 'revealing' && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5 }}
              className="w-full space-y-6"
            >
              <p className="text-center text-sm text-muted-foreground">
                点击卡牌翻开查看
              </p>

              <div className="flex flex-wrap justify-center gap-2.5 sm:gap-3">
                {drawnCards.map((dc, i) => {
                  const card = MOCK_TAROT_CARDS.find(c => c.id === dc.cardId);
                  const isRevealed = revealedIndices.has(i);

                  return (
                    <div key={i} className="flex flex-col items-center gap-1">
                      <motion.div
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: i * 0.1, duration: 0.4 }}
                        className="cursor-pointer"
                        style={{ perspective: '800px' }}
                        onClick={() => !isRevealed && handleRevealCard(i)}
                      >
                        <motion.div
                          animate={{ rotateY: isRevealed ? 180 : 0 }}
                          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                          className="relative w-24 h-36 sm:w-28 sm:h-40"
                          style={{ transformStyle: 'preserve-3d' }}
                        >
                          {/* 牌背 */}
                          <div
                            className="absolute inset-0 rounded-xl border-2 border-primary/30 overflow-hidden shadow-sm"
                            style={{ backfaceVisibility: 'hidden' }}
                          >
                            <Image
                              src={CARD_BACK_IMAGE_URL}
                              alt="卡背"
                              className="w-full h-full object-cover"
                            />
                          </div>

                          {/* 牌面 */}
                          <div
                            className={`absolute inset-0 rounded-xl border-2 overflow-hidden shadow-sm ${
                              dc.isReversed ? 'rotate-180' : ''
                            }`}
                            style={{
                              backfaceVisibility: 'hidden',
                              transform: 'rotateY(180deg)',
                              borderColor: dc.isReversed
                                ? 'hsl(28 50% 65% / 0.4)'
                                : 'hsl(110 20% 70% / 0.4)',
                            }}
                          >
                            {card?.imageUrl ? (
                              <Image
                                src={card.imageUrl}
                                alt={card.nameCn}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <div className="w-full h-full flex flex-col items-center justify-center p-2 text-center bg-card">
                                <p className="text-xs font-semibold text-foreground leading-tight">
                                  {card?.nameCn}
                                </p>
                              </div>
                            )}
                          </div>
                        </motion.div>
                      </motion.div>
                      {/* 牌名 - 始终正向 */}
                      {isRevealed && card && (
                        <p className="text-[11px] font-medium text-foreground text-center leading-tight max-w-[96px] sm:max-w-[112px]">
                          {card.nameCn}
                        </p>
                      )}
                      {/* 正逆位标识 - 始终正向 */}
                      {isRevealed && (
                        <Badge
                          variant="outline"
                          className={`text-[10px] px-1.5 py-0 h-5 ${
                            dc.isReversed
                              ? 'border-warning/40 text-warning bg-warning/5'
                              : 'border-success/40 text-success bg-success/5'
                          }`}
                        >
                          {dc.isReversed ? '逆位' : '正位'}
                        </Badge>
                      )}
                    </div>
                  );
                })}
              </div>

              {revealedIndices.size < spread.cardCount && (
                <div className="text-center">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-muted-foreground"
                    onClick={handleRevealAll}
                  >
                    全部翻开
                  </Button>
                </div>
              )}
            </motion.div>
          )}

          {/* ===== 阶段 7: 完成 - 牌面归位 ===== */}
          {phase === 'complete' && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3 }}
              className="text-center space-y-6 w-full"
            >
              {/* 归位动画：整体从上方落下，逐张落定 */}
              <div className="flex flex-wrap justify-center gap-2 sm:gap-2.5">
                {drawnCards.map((dc, i) => {
                  const card = MOCK_TAROT_CARDS.find(c => c.id === dc.cardId);
                  const pos = spread.positions?.[i];
                  return (
                    <motion.div
                      key={i}
                      initial={{ y: -60, opacity: 0, scale: 0.85 }}
                      animate={{ y: 0, opacity: 1, scale: 1 }}
                      transition={{
                        delay: i * 0.12,
                        duration: 0.5,
                        ease: [0.22, 1, 0.36, 1],
                      }}
                      className="flex flex-col items-center gap-1"
                    >
                      <motion.div
                        animate={{ boxShadow: '0 0 16px rgba(184,169,201,0.25)' }}
                        transition={{ delay: i * 0.12 + 0.35, duration: 0.4 }}
                        className={`w-20 h-28 sm:w-24 sm:h-36 rounded-xl border-2 overflow-hidden shadow-sm ${
                          dc.isReversed ? 'rotate-180' : ''
                        }`}
                        style={{
                          borderColor: dc.isReversed
                            ? 'hsl(28 50% 65% / 0.5)'
                            : 'hsl(110 20% 70% / 0.5)',
                        }}
                      >
                        {card?.imageUrl ? (
                          <Image
                            src={card.imageUrl}
                            alt={card.nameCn}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-card">
                            <p className="text-xs font-semibold">{card?.nameCn}</p>
                          </div>
                        )}
                      </motion.div>
                      {/* 位置标签 */}
                      <motion.span
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: i * 0.12 + 0.4 }}
                        className="text-[10px] text-muted-foreground"
                      >
                        {pos?.name || dc.positionName}
                      </motion.span>
                    </motion.div>
                  );
                })}
              </div>

              {/* 自动跳转提示 */}
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: [0, 0.6, 0] }}
                transition={{ delay: 1.0, duration: 1, repeat: 1 }}
                className="text-sm text-muted-foreground"
              >
                牌已归位，即将进入解读...
              </motion.p>
            </motion.div>
          )}

        </div>
      </main>
    </div>
  );
}
