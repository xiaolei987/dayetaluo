import { useState, useMemo, type MouseEvent } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Hand, Shuffle, Scissors } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import type { ITarotCard, IDrawnCard } from '@/types/tarot';
import type { ISpreadPosition } from '@/types/spread';

interface CardSelectionSectionProps {
  /** 牌阵所需卡牌数量 */
  cardCount: number;
  /** 牌阵位置定义 */
  positions: ISpreadPosition[];
  /** 完整牌库 */
  allCards: ITarotCard[];
  /** 抽牌完成回调 */
  onDrawComplete: (drawnCards: IDrawnCard[]) => void;
}

/** 洗牌状态 */
type ShuffleState = 'idle' | 'shuffling' | 'shuffled' | 'cut' | 'selecting' | 'complete';

/** 牌堆中的单张牌（含洗牌动画状态） */
interface ShuffledCard {
  card: ITarotCard;
  /** 随机位移 x (px) */
  offsetX: number;
  /** 随机位移 y (px) */
  offsetY: number;
  /** 随机旋转角度 (deg) */
  rotation: number;
  /** 是否已被选中 */
  selected: boolean;
  /** 选中序号（第几张被选） */
  selectedIndex: number;
}

/** 生成随机洗牌状态 */
function generateShuffledCards(cards: ITarotCard[]): ShuffledCard[] {
  const shuffled = [...cards].sort(() => Math.random() - 0.5);
  return shuffled.map((card) => ({
    card,
    offsetX: (Math.random() - 0.5) * 60,
    offsetY: (Math.random() - 0.5) * 40,
    rotation: (Math.random() - 0.5) * 30,
    selected: false,
    selectedIndex: -1,
  }));
}

export default function CardSelectionSection({
  cardCount,
  positions,
  allCards,
  onDrawComplete,
}: CardSelectionSectionProps) {
  const [shuffleState, setShuffleState] = useState<ShuffleState>('idle');
  const [shuffledCards, setShuffledCards] = useState<ShuffledCard[]>([]);
  const [selectedCards, setSelectedCards] = useState<ShuffledCard[]>([]);
  const [cutIndex, setCutIndex] = useState<number | null>(null);
  const [isAnimating, setIsAnimating] = useState(false);

  /** 未选中的牌 */
  const availableCards = useMemo(
    () => shuffledCards.filter((sc) => !sc.selected),
    [shuffledCards],
  );

  /** 是否正在洗牌动画中 */
  const isShuffling = shuffleState === 'shuffling' || isAnimating;

  /** 开始洗牌 */
  const handleShuffle = async () => {
    if (isShuffling) return;
    setIsAnimating(true);
    setShuffleState('shuffling');
    setSelectedCards([]);
    setCutIndex(null);

    // 模拟洗牌动画时长
    await new Promise((r) => setTimeout(r, 1200));

    const shuffled = generateShuffledCards(allCards);
    setShuffledCards(shuffled);
    setShuffleState('shuffled');
    setIsAnimating(false);
  };

  /** 切牌 */
  const handleCut = () => {
    if (shuffleState !== 'shuffled' || shuffledCards.length === 0) return;
    const cutPos = Math.floor(Math.random() * (shuffledCards.length - 5)) + 3;
    setCutIndex(cutPos);
    setShuffleState('cut');
    toast.success('切牌完成，请开始选牌');
  };

  /** 点击选牌 */
  const handleSelectCard = (index: number) => {
    if (shuffleState !== 'shuffled' && shuffleState !== 'cut') return;
    if (selectedCards.length >= cardCount) return;
    if (shuffledCards[index].selected) return;

    const newShuffled = [...shuffledCards];
    newShuffled[index] = {
      ...newShuffled[index],
      selected: true,
      selectedIndex: selectedCards.length,
    };
    setShuffledCards(newShuffled);
    setSelectedCards((prev) => [...prev, newShuffled[index]]);

    if (selectedCards.length + 1 >= cardCount) {
      setShuffleState('complete');
    }
  };

  /** 自动抽牌 */
  const handleAutoDraw = () => {
    if (shuffleState !== 'shuffled' && shuffleState !== 'cut') return;
    if (selectedCards.length >= cardCount) return;

    const remaining = cardCount - selectedCards.length;
    const available = shuffledCards
      .map((sc, i) => ({ ...sc, originalIndex: i }))
      .filter((sc) => !sc.selected);

    const picked: number[] = [];
    const pool = [...available];
    for (let i = 0; i < remaining && pool.length > 0; i++) {
      const randIdx = Math.floor(Math.random() * pool.length);
      picked.push(pool[randIdx].originalIndex);
      pool.splice(randIdx, 1);
    }

    const newShuffled = [...shuffledCards];
    const newSelected = [...selectedCards];
    picked.forEach((idx) => {
      newShuffled[idx] = {
        ...newShuffled[idx],
        selected: true,
        selectedIndex: newSelected.length,
      };
      newSelected.push(newShuffled[idx]);
    });

    setShuffledCards(newShuffled);
    setSelectedCards(newSelected);
    setShuffleState('complete');
    toast.success(`已自动抽取 ${remaining} 张牌`);
  };

  /** 确认抽牌结果 */
  const handleConfirm = () => {
    if (selectedCards.length < cardCount) {
      toast.error(`请选择 ${cardCount} 张牌`);
      return;
    }

    const drawnCards: IDrawnCard[] = selectedCards.map((sc, i) => ({
      cardId: sc.card.id,
      positionName: positions[i]?.name ?? `位置 ${i + 1}`,
      isReversed: Math.random() > 0.5,
    }));

    onDrawComplete(drawnCards);
  };

  /** 重置 */
  const handleReset = () => {
    setShuffleState('idle');
    setShuffledCards([]);
    setSelectedCards([]);
    setCutIndex(null);
  };

  return (
    <section className="w-full py-8">
      <div className="max-w-4xl mx-auto px-4 md:px-6">
        {/* 操作按钮区 */}
        <div className="flex flex-wrap items-center justify-center gap-3 mb-8">
          {shuffleState === 'idle' && (
            <Button
              onClick={handleShuffle}
              size="lg"
              className="rounded-xl px-8 py-6 text-base font-semibold shadow-sm"
            >
              <Shuffle className="size-5 mr-2" />
              开始洗牌
            </Button>
          )}

          {shuffleState === 'shuffled' && (
            <>
              <Button
                onClick={handleCut}
                size="lg"
                variant="secondary"
                className="rounded-xl px-6 py-5 text-sm font-semibold"
              >
                <Scissors className="size-4 mr-2" />
                切牌
              </Button>
              <Button
                onClick={handleAutoDraw}
                size="lg"
                variant="outline"
                className="rounded-xl px-6 py-5 text-sm font-semibold"
              >
                <Sparkles className="size-4 mr-2" />
                自动抽牌
              </Button>
            </>
          )}

          {shuffleState === 'cut' && (
            <Button
              onClick={handleAutoDraw}
              size="lg"
              variant="outline"
              className="rounded-xl px-6 py-5 text-sm font-semibold"
            >
              <Sparkles className="size-4 mr-2" />
              自动抽牌
            </Button>
          )}

          {shuffleState === 'complete' && (
            <Button
              onClick={handleConfirm}
              size="lg"
              className="rounded-xl px-8 py-6 text-base font-semibold shadow-sm"
            >
              <Hand className="size-5 mr-2" />
              确认选牌 · 查看结果
            </Button>
          )}

          {(shuffleState === 'shuffled' || shuffleState === 'cut' || shuffleState === 'complete') && (
            <Button
              onClick={handleReset}
              size="lg"
              variant="ghost"
              className="rounded-xl px-4 py-5 text-sm text-muted-foreground"
            >
              重新开始
            </Button>
          )}
        </div>

        {/* 进度提示 */}
        {(shuffleState === 'shuffled' || shuffleState === 'cut') && (
          <div className="text-center mb-6">
            <p className="text-sm text-muted-foreground">
              请从牌堆中选择{' '}
              <span className="font-semibold text-primary">{cardCount}</span>{' '}
              张牌 · 已选{' '}
              <span className="font-semibold text-primary">{selectedCards.length}</span>{' '}
              张
            </p>
          </div>
        )}

        {/* 洗牌动画占位 */}
        {shuffleState === 'shuffling' && (
          <div className="flex items-center justify-center py-20">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}
              className="size-16 rounded-full border-4 border-primary/20 border-t-primary"
            />
            <p className="ml-4 text-sm text-muted-foreground">洗牌中...</p>
          </div>
        )}

        {/* 牌堆展示区 */}
        {(shuffleState === 'shuffled' || shuffleState === 'cut' || shuffleState === 'complete') && (
          <div className="relative min-h-[320px] flex items-center justify-center py-8">
            <div className="relative w-full max-w-[600px] aspect-[4/3]">
              <AnimatePresence>
                {shuffledCards.map((sc, index) => {
                  // 切牌后的牌堆：切牌点以上的牌显示在上方
                  const isCutTop = cutIndex !== null && index >= cutIndex;
                  const cutOffsetY = isCutTop ? -40 : 0;

                  return (
                    <motion.button
                      key={sc.card.id}
                      type="button"
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{
                        opacity: sc.selected ? 0 : 1,
                        scale: sc.selected ? 0.5 : 1,
                        x: sc.offsetX,
                        y: sc.offsetY + cutOffsetY,
                        rotate: sc.rotation,
                      }}
                      exit={{ opacity: 0, scale: 0.3, transition: { duration: 0.3 } }}
                      transition={{
                        type: 'spring',
                        stiffness: 200,
                        damping: 20,
                      }}
                      whileHover={
                        !sc.selected && shuffleState !== 'complete'
                          ? { scale: 1.08, y: sc.offsetY + cutOffsetY - 8, zIndex: 50 }
                          : {}
                      }
                      onClick={() => handleSelectCard(index)}
                      disabled={sc.selected || shuffleState === 'complete'}
                      className={`absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2
                        w-[72px] h-[108px] rounded-lg border-2 shadow-md
                        cursor-pointer select-none
                        transition-colors duration-200
                        ${sc.selected
                          ? 'border-primary/30 bg-primary/5 pointer-events-none'
                          : 'border-border bg-card hover:border-primary/50 hover:shadow-lg'
                        }`}
                      style={{ zIndex: sc.selected ? 0 : index + 1 }}
                      aria-label={`选择第 ${index + 1} 张牌`}
                    >
                      {/* 牌背图案 */}
                      <div className="w-full h-full rounded-md bg-gradient-to-br from-primary/20 via-accent/30 to-primary/10 flex items-center justify-center">
                        <div className="w-10 h-10 rounded-full border border-primary/30 flex items-center justify-center">
                          <span className="text-primary/60 text-xl">✦</span>
                        </div>
                      </div>
                    </motion.button>
                  );
                })}
              </AnimatePresence>
            </div>
          </div>
        )}

        {/* 已选卡牌预览 */}
        {selectedCards.length > 0 && (
          <div className="mt-8">
            <p className="text-sm font-medium text-foreground mb-3 text-center">
              已选择的牌
            </p>
            <div className="flex flex-wrap items-center justify-center gap-3">
              {selectedCards.map((sc, i) => (
                <motion.div
                  key={sc.card.id}
                  initial={{ opacity: 0, y: 20, scale: 0.8 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  transition={{ duration: 0.4, delay: i * 0.08, ease: [0.16, 1, 0.3, 1] }}
                  className="flex flex-col items-center gap-1.5"
                >
                  <div className="w-[60px] h-[90px] rounded-lg border-2 border-primary/40 bg-gradient-to-br from-primary/10 via-accent/20 to-primary/5 flex items-center justify-center shadow-sm">
                    <span className="text-primary/70 text-lg">✦</span>
                  </div>
                  <Badge variant="secondary" className="text-[10px] px-1.5 py-0 h-5">
                    {positions[i]?.name ?? `牌 ${i + 1}`}
                  </Badge>
                </motion.div>
              ))}
            </div>
          </div>
        )}

        {/* 空闲状态引导 */}
        {shuffleState === 'idle' && (
          <div className="text-center py-16">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
              className="space-y-4"
            >
              <div className="inline-flex items-center justify-center size-20 rounded-full bg-primary/10 mb-2">
                <Shuffle className="size-8 text-primary" />
              </div>
              <h3 className="text-lg font-semibold text-foreground">
                准备开始抽牌
              </h3>
              <p className="text-sm text-muted-foreground max-w-xs mx-auto">
                点击「开始洗牌」按钮，让塔罗牌的能量流动起来。洗牌后你可以自由选择卡牌，或使用自动抽牌。
              </p>
            </motion.div>
          </div>
        )}
      </div>
    </section>
  );
}
