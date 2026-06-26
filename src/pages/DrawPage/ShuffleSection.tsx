import { useState, useCallback, useRef, type FormEvent } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Shuffle, Scissors, Sparkles, ChevronDown, Send } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import type { IDrawnCard } from '@/types/tarot';
import type { ISpreadConfig } from '@/types/spread';

// ==================== Props ====================

interface ShuffleSectionProps {
  /** 当前牌阵配置 */
  spread: ISpreadConfig;
  /** 抽牌完成回调 */
  onDrawComplete: (cards: IDrawnCard[]) => void;
}

// ==================== 洗牌动画参数 ====================

const SHUFFLE_DURATION = 1.2; // 洗牌动画总时长(秒)
const CARD_COUNT_VISUAL = 22; // 视觉牌堆数量
const FAN_ANGLE = 30; // 扇形展开角度

/** 生成洗牌时每张牌的随机偏移和旋转 */
function generateShuffleTransforms(count: number) {
  return Array.from({ length: count }, (_, i) => {
    const angle = (Math.random() - 0.5) * 40;
    const x = (Math.random() - 0.5) * 120;
    const y = (Math.random() - 0.5) * 80;
    const delay = Math.random() * 0.3;
    return { angle, x, y, delay, id: i };
  });
}

// ==================== 组件 ====================

export default function ShuffleSection({ spread, onDrawComplete }: ShuffleSectionProps) {
  // ---- 状态 ----
  const [question, setQuestion] = useState('');
  const [phase, setPhase] = useState<'idle' | 'shuffling' | 'shuffled' | 'cut' | 'drawing' | 'revealing'>('idle');
  const [shuffleTransforms, setShuffleTransforms] = useState(() => generateShuffleTransforms(CARD_COUNT_VISUAL));
  const [drawnCards, setDrawnCards] = useState<IDrawnCard[]>([]);
  const [revealedIndices, setRevealedIndices] = useState<number[]>([]);
  const [cutPosition, setCutPosition] = useState<number | null>(null);
  const [showQuestionInput, setShowQuestionInput] = useState(true);

  const shuffleTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // ---- 洗牌 ----
  const handleShuffle = useCallback(() => {
    if (phase !== 'idle' && phase !== 'shuffled' && phase !== 'cut') return;

    setPhase('shuffling');
    setDrawnCards([]);
    setRevealedIndices([]);
    setCutPosition(null);

    // 生成新的随机变换
    const transforms = generateShuffleTransforms(CARD_COUNT_VISUAL);
    setShuffleTransforms(transforms);

    // 洗牌完成后进入已洗牌状态
    shuffleTimerRef.current = setTimeout(() => {
      setPhase('shuffled');
    }, SHUFFLE_DURATION * 1000 + 400);
  }, [phase]);

  // ---- 切牌 ----
  const handleCut = useCallback(() => {
    if (phase !== 'shuffled') return;
    const pos = Math.floor(Math.random() * 8) + 7; // 7~14 之间随机切牌位置
    setCutPosition(pos);
    setPhase('cut');
  }, [phase]);

  // ---- 自由抽牌 (点击牌堆中的牌) ----
  const handlePickCard = useCallback(
    (index: number) => {
      if (phase !== 'shuffled' && phase !== 'cut') return;
      if (drawnCards.length >= spread.cardCount) return;

      // 随机选一张牌
      const allCardIds = [
        'major-0', 'major-1', 'major-2', 'major-3', 'major-4', 'major-5', 'major-6', 'major-7',
        'major-8', 'major-9', 'major-10', 'major-11', 'major-12', 'major-13', 'major-14', 'major-15',
        'major-16', 'major-17', 'major-18', 'major-19', 'major-20', 'major-21',
        'wands-1', 'wands-2', 'wands-3', 'cups-1', 'cups-2', 'cups-3',
        'swords-1', 'swords-2', 'swords-3', 'pentacles-1', 'pentacles-2', 'pentacles-3',
      ];
      const randomCardId = allCardIds[Math.floor(Math.random() * allCardIds.length)];
      const isReversed = Math.random() > 0.5;
      const positionIndex = drawnCards.length;
      const positionName = spread.positions[positionIndex]?.name ?? `位置${positionIndex + 1}`;

      const newCard: IDrawnCard = {
        cardId: randomCardId,
        positionName,
        isReversed,
      };

      const updated = [...drawnCards, newCard];
      setDrawnCards(updated);

      // 抽满后自动进入翻牌阶段
      if (updated.length >= spread.cardCount) {
        setPhase('drawing');
        // 逐张翻牌
        updated.forEach((_, i) => {
          setTimeout(() => {
            setRevealedIndices((prev) => [...prev, i]);
            if (i === updated.length - 1) {
              setTimeout(() => {
                setPhase('revealing');
              }, 400);
            }
          }, i * 600 + 300);
        });
      }
    },
    [phase, drawnCards, spread],
  );

  // ---- 自动抽牌 ----
  const handleAutoDraw = useCallback(() => {
    if (phase !== 'shuffled' && phase !== 'cut') return;
    if (drawnCards.length > 0) return;

    const allCardIds = [
      'major-0', 'major-1', 'major-2', 'major-3', 'major-4', 'major-5', 'major-6', 'major-7',
      'major-8', 'major-9', 'major-10', 'major-11', 'major-12', 'major-13', 'major-14', 'major-15',
      'major-16', 'major-17', 'major-18', 'major-19', 'major-20', 'major-21',
      'wands-1', 'wands-2', 'wands-3', 'cups-1', 'cups-2', 'cups-3',
      'swords-1', 'swords-2', 'swords-3', 'pentacles-1', 'pentacles-2', 'pentacles-3',
    ];

    const cards: IDrawnCard[] = spread.positions.map((pos) => {
      const randomCardId = allCardIds[Math.floor(Math.random() * allCardIds.length)];
      return {
        cardId: randomCardId,
        positionName: pos.name,
        isReversed: Math.random() > 0.5,
      };
    });

    setDrawnCards(cards);
    setPhase('drawing');

    cards.forEach((_, i) => {
      setTimeout(() => {
        setRevealedIndices((prev) => [...prev, i]);
        if (i === cards.length - 1) {
          setTimeout(() => {
            setPhase('revealing');
          }, 400);
        }
      }, i * 600 + 300);
    });
  }, [phase, drawnCards, spread]);

  // ---- 提交问题 ----
  const handleQuestionSubmit = useCallback(
    (e: FormEvent) => {
      e.preventDefault();
      setShowQuestionInput(false);
    },
    [],
  );

  // ---- 完成抽牌 ----
  const handleComplete = useCallback(() => {
    if (drawnCards.length < spread.cardCount) return;
    onDrawComplete(drawnCards);
  }, [drawnCards, spread.cardCount, onDrawComplete]);

  // ---- 渲染牌堆 ----
  const renderCardStack = () => {
    const isInteractive = phase === 'shuffled' || phase === 'cut';
    const stackCards = shuffleTransforms.slice(0, CARD_COUNT_VISUAL);

    return (
      <div className="relative w-full max-w-md mx-auto h-64 flex items-center justify-center">
        {/* 牌堆 */}
        <div className="relative w-36 h-52">
          {stackCards.map((t, i) => {
            // 切牌效果：切牌位置以上的牌偏移
            const cutOffset = cutPosition !== null && i >= cutPosition ? 60 : 0;

            return (
              <motion.div
                key={t.id}
                className={`absolute inset-0 rounded-xl border-2 border-primary/30 bg-gradient-to-br from-primary/10 via-card to-accent/20 shadow-md cursor-pointer overflow-hidden ${
                  isInteractive ? 'hover:border-primary/60 hover:shadow-lg' : ''
                }`}
                initial={false}
                animate={
                  phase === 'shuffling'
                    ? {
                        x: t.x,
                        y: t.y,
                        rotate: t.angle,
                        transition: {
                          duration: SHUFFLE_DURATION,
                          delay: t.delay,
                          ease: [0.16, 1, 0.3, 1],
                          repeat: 1,
                          repeatType: 'reverse',
                        },
                      }
                    : phase === 'shuffled' || phase === 'cut'
                      ? {
                          x: (i - (CARD_COUNT_VISUAL - 1) / 2) * 1.2 + cutOffset,
                          y: Math.abs(i - (CARD_COUNT_VISUAL - 1) / 2) * 0.6,
                          rotate: (i - (CARD_COUNT_VISUAL - 1) / 2) * 1.5,
                          transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] },
                        }
                      : {
                          x: (i - (CARD_COUNT_VISUAL - 1) / 2) * 1.2,
                          y: Math.abs(i - (CARD_COUNT_VISUAL - 1) / 2) * 0.6,
                          rotate: (i - (CARD_COUNT_VISUAL - 1) / 2) * 1.5,
                        }
                }
                onClick={() => isInteractive && handlePickCard(i)}
                style={{ zIndex: i }}
              >
                {/* 牌背花纹 */}
                <div className="absolute inset-1.5 rounded-lg border border-primary/20 bg-gradient-to-br from-primary/5 to-accent/10 flex items-center justify-center">
                  <div className="text-center">
                    <div className="text-2xl mb-1 opacity-30">✦</div>
                    <div className="w-8 h-8 mx-auto rounded-full border border-primary/20 flex items-center justify-center">
                      <Sparkles className="size-3 text-primary/40" />
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* 切牌指示 */}
        <AnimatePresence>
          {cutPosition !== null && (
            <motion.div
              className="absolute left-1/2 -translate-x-1/2 top-1/2 -translate-y-1/2 z-50 pointer-events-none"
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.5 }}
            >
              <div className="w-40 h-0.5 bg-primary/60 rounded-full shadow-lg shadow-primary/20" />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  };

  // ---- 渲染已抽取的牌 ----
  const renderDrawnCards = () => {
    if (drawnCards.length === 0) return null;

    return (
      <div className="w-full max-w-2xl mx-auto mt-8">
        <p className="text-center text-sm text-muted-foreground mb-4">
          已抽取 {drawnCards.length} / {spread.cardCount} 张牌
        </p>
        <div className="flex flex-wrap justify-center gap-3">
          {drawnCards.map((card, i) => {
            const isRevealed = revealedIndices.includes(i);
            return (
              <motion.div
                key={`${card.cardId}-${i}`}
                className="relative w-20 h-32 sm:w-24 sm:h-36 perspective-500"
                initial={{ opacity: 0, y: 30, scale: 0.8 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ duration: 0.5, delay: i * 0.1, ease: [0.16, 1, 0.3, 1] }}
              >
                <motion.div
                  className="relative w-full h-full preserve-3d"
                  animate={{ rotateY: isRevealed ? 180 : 0 }}
                  transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
                >
                  {/* 牌背 */}
                  <div
                    className="absolute inset-0 backface-hidden rounded-xl border-2 border-primary/30 bg-gradient-to-br from-primary/10 via-card to-accent/20 shadow-md flex items-center justify-center"
                  >
                    <Sparkles className="size-5 text-primary/40" />
                  </div>
                  {/* 牌面 */}
                  <div
                    className="absolute inset-0 backface-hidden rounded-xl border-2 border-primary/30 bg-card shadow-md flex flex-col items-center justify-center p-2"
                    style={{ transform: 'rotateY(180deg)' }}
                  >
                    <span className="text-xs font-semibold text-foreground truncate w-full text-center">
                      {card.positionName}
                    </span>
                    <Badge
                      variant={card.isReversed ? 'secondary' : 'default'}
                      className="mt-1 text-[10px] px-1.5 py-0 h-4"
                    >
                      {card.isReversed ? '逆位' : '正位'}
                    </Badge>
                    {card.isReversed && (
                      <span className="text-[10px] text-muted-foreground mt-0.5">↻</span>
                    )}
                  </div>
                </motion.div>
              </motion.div>
            );
          })}
        </div>
      </div>
    );
  };

  // ---- 渲染操作按钮 ----
  const renderActions = () => {
    return (
      <div className="flex flex-wrap items-center justify-center gap-3 mt-6">
        {/* 洗牌按钮 */}
        {(phase === 'idle' || phase === 'shuffled' || phase === 'cut') && (
          <Button
            onClick={handleShuffle}
            disabled={phase === 'shuffling'}
            variant={phase === 'idle' ? 'default' : 'outline'}
            size="lg"
            className="rounded-full px-6 gap-2"
          >
            <Shuffle className="size-4" />
            {phase === 'idle' ? '开始洗牌' : '重新洗牌'}
          </Button>
        )}

        {/* 洗牌中 */}
        {phase === 'shuffling' && (
          <motion.div
            className="flex items-center gap-2 text-primary"
            animate={{ opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 1.5, repeat: Infinity }}
          >
            <Shuffle className="size-5 animate-spin" />
            <span className="text-sm font-medium">洗牌中...</span>
          </motion.div>
        )}

        {/* 切牌按钮 */}
        {phase === 'shuffled' && (
          <Button
            onClick={handleCut}
            variant="secondary"
            size="lg"
            className="rounded-full px-6 gap-2"
          >
            <Scissors className="size-4" />
            切牌
          </Button>
        )}

        {/* 自动抽牌按钮 */}
        {(phase === 'shuffled' || phase === 'cut') && drawnCards.length === 0 && (
          <Button
            onClick={handleAutoDraw}
            variant="outline"
            size="lg"
            className="rounded-full px-6 gap-2 border-primary/30 text-primary hover:bg-primary/5"
          >
            <Sparkles className="size-4" />
            一键抽牌
          </Button>
        )}

        {/* 手动抽牌提示 */}
        {(phase === 'shuffled' || phase === 'cut') && drawnCards.length === 0 && (
          <p className="w-full text-center text-xs text-muted-foreground mt-1">
            或点击上方牌堆中的牌来手动抽取
          </p>
        )}

        {/* 继续抽牌提示 */}
        {(phase === 'shuffled' || phase === 'cut') &&
          drawnCards.length > 0 &&
          drawnCards.length < spread.cardCount && (
            <p className="w-full text-center text-sm text-primary font-medium">
              请继续点击牌堆抽取第 {drawnCards.length + 1} 张牌
            </p>
          )}

        {/* 翻牌中 */}
        {phase === 'drawing' && (
          <motion.div
            className="flex items-center gap-2 text-primary"
            animate={{ opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 1.5, repeat: Infinity }}
          >
            <Sparkles className="size-5" />
            <span className="text-sm font-medium">翻牌中...</span>
          </motion.div>
        )}

        {/* 查看结果 */}
        {phase === 'revealing' && drawnCards.length === spread.cardCount && (
          <Button
            onClick={handleComplete}
            size="lg"
            className="rounded-full px-8 gap-2 bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 shadow-lg shadow-primary/20"
          >
            <Sparkles className="size-4" />
            查看解读
          </Button>
        )}
      </div>
    );
  };

  // ==================== 主渲染 ====================

  return (
    <section className="w-full py-8 md:py-12">
      <div className="max-w-2xl mx-auto px-4 md:px-6">
        {/* 牌阵信息 */}
        <div className="text-center mb-6">
          <h2 className="text-xl font-semibold text-foreground">{spread.name}</h2>
          <p className="text-sm text-muted-foreground mt-1">{spread.scenario}</p>
          <p className="text-xs text-muted-foreground mt-0.5">
            共需抽取 {spread.cardCount} 张牌
          </p>
        </div>

        {/* 问题输入 */}
        <AnimatePresence>
          {showQuestionInput && (
            <motion.div
              className="mb-8"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
            >
              <form onSubmit={handleQuestionSubmit} className="relative">
                <Input
                  type="text"
                  value={question}
                  onChange={(e) => setQuestion(e.target.value)}
                  placeholder="默想你的问题，然后输入在这里（选填）..."
                  className="pr-12 h-12 rounded-xl border-border/60 bg-card/80 text-sm placeholder:text-muted-foreground/60 focus-visible:ring-primary/30"
                />
                <Button
                  type="submit"
                  size="icon"
                  variant="ghost"
                  className="!absolute right-1.5 top-1/2 z-20 h-9 w-9 -translate-y-1/2 rounded-lg text-muted-foreground hover:text-primary"
                >
                  <ChevronDown className="size-4" />
                </Button>
              </form>
            </motion.div>
          )}
        </AnimatePresence>

        {/* 已收起的问题 */}
        {!showQuestionInput && question && (
          <motion.div
            className="text-center mb-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <p className="text-sm text-muted-foreground">
              你的问题：
              <span className="text-foreground font-medium ml-1">{question}</span>
            </p>
          </motion.div>
        )}

        {/* 牌堆 */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        >
          {renderCardStack()}
        </motion.div>

        {/* 已抽取的牌 */}
        {renderDrawnCards()}

        {/* 操作按钮 */}
        {renderActions()}

        {/* 底部提示 */}
        {phase === 'idle' && (
          <p className="text-center text-xs text-muted-foreground mt-8">
            静心凝神，专注于你的问题，然后点击「开始洗牌」
          </p>
        )}
      </div>
    </section>
  );
}
