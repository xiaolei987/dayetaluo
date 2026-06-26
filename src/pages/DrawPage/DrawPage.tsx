import { useState, useCallback, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Shuffle, Scissors, Sparkles, Wand2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Image } from '@/components/ui/image';
import { scopedStorage } from '@lark-apaas/client-toolkit-lite';
import { MOCK_SPREADS } from '@/data/spreads';
import { MOCK_TAROT_CARDS, CARD_BACK_IMAGE_URL } from '@/data/tarotCards';
import type { ITarotCard, IDrawnCard } from '@/types/tarot';

type Phase = 'idle' | 'shuffling' | 'ready_to_cut' | 'cut_done' | 'drawing' | 'revealing' | 'complete';

function shuffleDeck(cards: ITarotCard[]): ITarotCard[] {
  const shuffled = [...cards];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
}

export default function DrawPage() {
  const { spreadId } = useParams<{ spreadId: string }>();
  const navigate = useNavigate();

  const spread = useMemo(() => MOCK_SPREADS.find(s => s.id === spreadId), [spreadId]);

  const [phase, setPhase] = useState<Phase>('idle');
  const [question, setQuestion] = useState('');
  const [deck, setDeck] = useState<ITarotCard[]>([]);
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
    setPhase('cut_done');
  }, []);

  const handleAutoCut = useCallback(() => {
    if (deck.length < 10) return;
    const idx = Math.floor(Math.random() * (deck.length - 10)) + 5;
    handleCut(idx);
  }, [deck.length, handleCut]);

  // ---- 手动抽牌 ----
  const handleDrawCard = useCallback((cardIndex: number) => {
    if (drawnCards.length >= spread.cardCount || cardIndex >= deck.length) return;

    const card = deck[cardIndex];
    const position = spread.positions[drawnCards.length];
    const isReversed = Math.random() > 0.5;

    const drawnCard: IDrawnCard = {
      cardId: card.id,
      positionName: position.name,
      isReversed,
    };

    setDrawnCards(prev => [...prev, drawnCard]);
    setDeck(prev => prev.filter((_, i) => i !== cardIndex));

    if (drawnCards.length + 1 >= spread.cardCount) {
      setPhase('revealing');
    }
  }, [deck, drawnCards.length, spread]);

  // ---- 自动抽牌 ----
  const handleAutoDraw = useCallback(() => {
    setPhase('drawing');
    const cardsToDraw = spread.cardCount;
    const newDrawn: IDrawnCard[] = [];
    let remainingDeck = [...deck];

    for (let i = 0; i < cardsToDraw; i++) {
      const idx = Math.floor(Math.random() * remainingDeck.length);
      const card = remainingDeck[idx];
      const position = spread.positions[i];
      const isReversed = Math.random() > 0.5;

      newDrawn.push({
        cardId: card.id,
        positionName: position.name,
        isReversed,
      });

      remainingDeck = remainingDeck.filter((_, j) => j !== idx);
    }

    setDrawnCards(newDrawn);
    setDeck(remainingDeck);
    setPhase('revealing');
  }, [deck, spread]);

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
    setTimeout(() => setPhase('complete'), 700);
  }, [spread.cardCount]);

  // ---- 完成 → 跳转结果页 ----
  const handleComplete = useCallback(() => {
    const readingId = generateId();
    const record = {
      id: readingId,
      spreadId: spread.id,
      spreadName: spread.name,
      question,
      cards: drawnCards,
      style: 'gentle' as const,
      isFavorite: false,
      createdAt: new Date().toISOString(),
    };

    const raw = scopedStorage.getItem('__tarot_readings');
    const existing = raw ? JSON.parse(raw) : [];
    existing.unshift(record);
    scopedStorage.setItem('__tarot_readings', JSON.stringify(existing));

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
            <Input
              value={question}
              onChange={e => setQuestion(e.target.value)}
              placeholder="例如：我最近的感情运势如何？"
              className="h-12 rounded-xl bg-card/80"
            />
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
                      transform: `rotate(${(Math.random() - 0.5) * 4}deg)`,
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

          {/* ===== 阶段 4/5: 抽牌中 ===== */}
          {(phase === 'cut_done' || phase === 'drawing') && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5 }}
              className="text-center space-y-6 w-full"
            >
              <p className="text-sm text-muted-foreground">
                请抽取 {remainingDraws} 张牌
              </p>

              {/* 剩余牌堆 */}
              <div className="relative w-full max-w-xs mx-auto h-40">
                {deck.slice(0, Math.min(12, deck.length)).map((card, i) => (
                  <motion.div
                    key={`${card.id}-${i}`}
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.02 }}
                    whileHover={{ y: -8, scale: 1.05 }}
                    className="absolute left-1/2 -translate-x-1/2 w-24 h-36 rounded-lg border border-primary/20 overflow-hidden cursor-pointer hover:border-primary/40 hover:shadow-md transition-all"
                    style={{
                      top: `${i * 2}px`,
                      zIndex: i,
                      transform: `rotate(${(Math.random() - 0.5) * 3}deg)`,
                    }}
                    onClick={() => handleDrawCard(i)}
                  >
                    <Image src={CARD_BACK_IMAGE_URL} alt="卡背" className="w-full h-full object-cover" />
                  </motion.div>
                ))}
              </div>

              <Button
                variant="outline"
                className="rounded-xl"
                onClick={handleAutoDraw}
              >
                <Wand2 className="size-4 mr-2" />
                自动抽取
              </Button>
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

          {/* ===== 阶段 7: 完成 ===== */}
          {phase === 'complete' && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
              className="text-center space-y-6 w-full"
            >
              <div className="flex flex-wrap justify-center gap-2.5 sm:gap-3">
                {drawnCards.map((dc, i) => {
                  const card = MOCK_TAROT_CARDS.find(c => c.id === dc.cardId);
                  return (
                    <div key={i} className="flex flex-col items-center gap-1">
                      <div
                        className={`w-24 h-36 sm:w-28 sm:h-40 rounded-xl border-2 overflow-hidden shadow-sm ${
                          dc.isReversed ? 'rotate-180' : ''
                        }`}
                        style={{
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
                      {card && (
                        <>
                          <p className="text-[11px] font-medium text-foreground text-center leading-tight max-w-[96px] sm:max-w-[112px]">
                            {card.nameCn}
                          </p>
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
                        </>
                      )}
                    </div>
                  );
                })}
              </div>

              <Button
                size="lg"
                className="rounded-xl gap-2 px-8 h-12"
                onClick={handleComplete}
              >
                <Sparkles className="size-5" />
                查看解读
              </Button>
            </motion.div>
          )}

        </div>
      </main>
    </div>
  );
}
