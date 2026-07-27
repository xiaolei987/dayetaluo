import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Image } from '@/components/ui/image';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import type { IDrawnCard, QuestionType } from '@/types/tarot';
import type { ISpreadConfig } from '@/types/spread';
import { TAROT_CARD_MAP } from '@/data/tarotCards';

interface SpreadLayoutSectionProps {
  spread: ISpreadConfig;
  drawnCards: IDrawnCard[];
  questionType?: QuestionType;
}

/** 每日一牌：单张大牌展示 */
function SingleCardView({
  card,
  onCardClick,
}: {
  card: IDrawnCard;
  onCardClick: (id: string) => void;
}) {
  const cardData = TAROT_CARD_MAP[card.cardId];
  if (!cardData) return null;

  return (
    <div className="flex justify-center py-4 sm:py-6">
      <motion.div
        initial={{ opacity: 0, scale: 0.8, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        className="flex flex-col items-center gap-2 cursor-pointer group"
        onClick={() => onCardClick(card.cardId)}
      >
        <div
          className={`
            w-36 h-52 xs:w-40 xs:h-56 sm:w-48 sm:h-72 md:w-56 md:h-80
            rounded-2xl border-2 shadow-lg
            overflow-hidden
            transition-all duration-300
            group-hover:shadow-xl group-hover:scale-[1.02]
            ${card.isReversed ? 'rotate-180 border-warning/40' : 'border-primary/20'}
          `}
        >
          {cardData.imageUrl ? (
            <Image
              src={cardData.imageUrl}
              alt={cardData.nameCn}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className={`w-full h-full flex items-center justify-center ${card.isReversed ? 'bg-warning/10' : 'bg-card'}`}>
              <span className="text-lg font-semibold text-center">{cardData.nameCn}</span>
            </div>
          )}
        </div>

        <p className="text-sm sm:text-base font-semibold text-foreground">
          {cardData.nameCn}
        </p>

        <Badge
          variant="outline"
          className={`text-xs px-2 py-0.5 ${
            card.isReversed
              ? 'border-warning/40 text-warning bg-warning/5'
              : 'border-success/40 text-success bg-success/5'
          }`}
        >
          {card.isReversed ? '逆位' : '正位'}
        </Badge>

        <span className="text-xs text-muted-foreground">今日指引</span>
      </motion.div>
    </div>
  );
}

/** 根据牌数决定卡牌尺寸 */
function useCardSize(cardCount: number) {
  return useMemo(() => {
    if (cardCount <= 3) {
      return {
        wrapper: 'w-20 h-30 xs:w-24 xs:h-36 sm:w-28 sm:h-42 md:w-32 md:h-48',
        radius: 'rounded-xl sm:rounded-2xl',
        nameMax: 'max-w-[72px] xs:max-w-[88px] sm:max-w-[104px] md:max-w-[120px]',
        label: 'text-[10px] sm:text-xs',
        badge: 'text-[9px] sm:text-[10px]',
      };
    }
    if (cardCount <= 5) {
      return {
        wrapper: 'w-16 h-24 xs:w-18 xs:h-28 sm:w-22 sm:h-34 md:w-26 md:h-40',
        radius: 'rounded-lg sm:rounded-xl',
        nameMax: 'max-w-[56px] xs:max-w-[64px] sm:max-w-[80px] md:max-w-[96px]',
        label: 'text-[9px] sm:text-[10px]',
        badge: 'text-[8px] sm:text-[10px]',
      };
    }
    // 大牌阵
    return {
      wrapper: 'w-14 h-22 xs:w-16 xs:h-24 sm:w-20 sm:h-30 md:w-24 md:h-36',
      radius: 'rounded-lg sm:rounded-xl',
      nameMax: 'max-w-[48px] xs:max-w-[56px] sm:max-w-[72px] md:max-w-[88px]',
      label: 'text-[8px] sm:text-[10px]',
      badge: 'text-[8px] sm:text-[9px]',
    };
  }, [cardCount]);
}

/** 渲染语义连线与标记点 */
function ConnectionLayer({
  spread,
  drawnCards,
}: {
  spread: ISpreadConfig;
  drawnCards: IDrawnCard[];
}) {
  const connections = spread.layoutMeta?.connections ?? [];
  const showConnections = spread.layoutMeta?.showConnections && connections.length > 0;

  return (
    <svg
      className="absolute inset-0 w-full h-full pointer-events-none"
      aria-hidden="true"
    >
      <defs>
        <marker
          id="arrowhead"
          markerWidth="8"
          markerHeight="6"
          refX="7"
          refY="3"
          orient="auto"
        >
          <polygon points="0 0, 8 3, 0 6" className="fill-primary/35" />
        </marker>
      </defs>

      {showConnections &&
        connections.map((conn, i) => {
          const p1 = spread.positions.find((p) => p.index === conn.from);
          const p2 = spread.positions.find((p) => p.index === conn.to);
          if (!p1 || !p2) return null;
          return (
            <line
              key={`conn-${i}`}
              x1={`${p1.x}%`}
              y1={`${p1.y}%`}
              x2={`${p2.x}%`}
              y2={`${p2.y}%`}
              stroke="currentColor"
              strokeWidth="1.5"
              strokeDasharray={conn.type === 'dashed' ? '4 3' : '0'}
              markerEnd={conn.arrow ? 'url(#arrowhead)' : undefined}
              className="text-primary/25"
            />
          );
        })}

      {drawnCards.map((card, i) => {
        const pos = spread.positions[i];
        if (!pos) return null;
        return (
          <circle
            key={`dot-${card.cardId}`}
            cx={`${pos.x}%`}
            cy={`${pos.y}%`}
            r="3"
            className="fill-primary/30"
          />
        );
      })}
    </svg>
  );
}

export default function SpreadLayoutSection({ spread, drawnCards, questionType }: SpreadLayoutSectionProps) {
  const [selectedCardId, setSelectedCardId] = useState<string | null>(null);
  const cardSize = useCardSize(spread.cardCount);

  const selectedCard = selectedCardId ? drawnCards.find(d => d.cardId === selectedCardId) : null;
  const selectedCardData = selectedCard ? TAROT_CARD_MAP[selectedCard.cardId] : null;

  const layoutMeta = spread.layoutMeta;
  const containerHeight = useMemo(() => {
    const mobile = layoutMeta?.mobileHeight ?? 480;
    const desktop = layoutMeta?.desktopHeight ?? 600;
    return { mobile, desktop };
  }, [layoutMeta]);

  return (
    <section className="w-full py-6 sm:py-8">
      <div className="max-w-7xl mx-auto px-1 sm:px-2 md:px-4">
        <div className="mb-4 sm:mb-6">
          <h2 className="font-serif text-xl sm:text-2xl font-semibold text-foreground">{spread.name}</h2>
          <p className="text-sm text-muted-foreground mt-1">{spread.scenario}</p>
        </div>

        {/* 每日一牌：单牌放大展示 */}
        {spread.cardCount === 1 && drawnCards.length === 1 && (
          <SingleCardView card={drawnCards[0]} onCardClick={setSelectedCardId} />
        )}

        {/* 多牌牌阵布局区 */}
        {spread.cardCount > 1 && (
          <div
            className="relative w-full pt-6 pb-6 sm:pt-8 sm:pb-8 bg-gradient-to-br from-primary/[0.06] via-background to-accent/15 rounded-2xl sm:rounded-3xl border border-border/40 overflow-visible"
            style={{
              minHeight: `${containerHeight.mobile}px`,
            }}
          >
            <style>{`
              @media (min-width: 640px) {
                .spread-layout-container {
                  min-height: ${containerHeight.desktop}px !important;
                }
              }
            `}</style>
            <div className="spread-layout-container" />

            {/* 连接线 */}
            <ConnectionLayer spread={spread} drawnCards={drawnCards} />

            {/* 卡牌 */}
            {drawnCards.map((card, i) => {
              const pos = spread.positions[i];
              const cardData = TAROT_CARD_MAP[card.cardId];
              if (!pos || !cardData) return null;

              return (
                /* 外层定位：translate(-50%,-50%) 居中，不被 framer-motion 覆盖 */
                <div
                  key={card.cardId}
                  className="absolute z-0 hover:z-10"
                  style={{
                    left: `${pos.x}%`,
                    top: `${pos.y}%`,
                    transform: 'translate(-50%, -50%)',
                  }}
                >
                <motion.div
                  initial={{ opacity: 0, scale: 0.8, y: 20 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  transition={{
                    duration: 0.5,
                    delay: i * 0.12,
                    ease: [0.16, 1, 0.3, 1],
                  }}
                  className="cursor-pointer group"
                  onClick={() => setSelectedCardId(card.cardId)}
                >
                  {/* 卡牌视觉中心与坐标点重合 */}
                  <div className="relative flex flex-col items-center">
                    {/* 位置标签：卡牌上方，单行显示 */}
                    <span
                      className="text-[9px] sm:text-[10px] text-muted-foreground whitespace-nowrap
                        bg-card/90 backdrop-blur-sm px-2 py-0.5 rounded-full
                        border border-border/50 shadow-sm mb-1"
                    >
                      {pos.name}
                    </span>

                    <div className="relative flex items-center justify-center">
                      {/* 卡牌卡片 */}
                      <div
                        className={`
                          ${cardSize.wrapper} ${cardSize.radius} border-2 shadow-md
                          overflow-hidden flex-shrink-0
                          transition-all duration-300
                          group-hover:shadow-lg group-hover:scale-105
                          ${card.isReversed ? 'rotate-180 border-warning/40' : 'border-primary/20'}
                        `}
                      >
                        {cardData.imageUrl ? (
                          <Image
                            src={cardData.imageUrl}
                            alt={cardData.nameCn}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className={`w-full h-full flex items-center justify-center ${card.isReversed ? 'bg-warning/10' : 'bg-card'}`}>
                            <span className="text-[8px] sm:text-xs font-medium text-center leading-tight px-0.5">
                              {cardData.nameCn}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* 正逆位 + 牌名同行：正/逆在左，牌名在右 */}
                    <div className={`mt-1 flex items-center gap-1 ${cardSize.nameMax}`}>
                      <Badge
                        variant="outline"
                        className={`shrink-0 ${cardSize.badge} px-1 py-0 h-3.5 sm:h-4 leading-none ${
                          card.isReversed
                            ? 'border-warning/40 text-warning bg-warning/5'
                            : 'border-success/40 text-success bg-success/5'
                        }`}
                      >
                        {card.isReversed ? '逆' : '正'}
                      </Badge>
                      <p className={`${cardSize.label} font-medium text-foreground leading-tight truncate`}>
                        {cardData.nameCn}
                      </p>
                    </div>
                  </div>
                </motion.div>
                </div>
              );
            })}
          </div>
        )}

        {/* 卡牌详情弹窗 */}
        <AnimatePresence>
          {selectedCard && selectedCardData && (
            <Dialog open={!!selectedCardId} onOpenChange={() => setSelectedCardId(null)}>
              <DialogContent className="max-w-md rounded-2xl">
                <DialogHeader>
                  <DialogTitle className="flex items-center gap-2 font-serif">
                    <span>{selectedCardData.nameCn}</span>
                    <Badge
                      variant={selectedCard.isReversed ? 'destructive' : 'default'}
                      className="text-xs"
                    >
                      {selectedCard.isReversed ? '逆位' : '正位'}
                    </Badge>
                  </DialogTitle>
                </DialogHeader>

                <div className="space-y-4">
                  {/* 牌面信息 */}
                  <div className="flex items-start gap-4">
                    <div
                      className={`
                        shrink-0 w-20 h-32 rounded-xl border-2 overflow-hidden
                        ${selectedCard.isReversed ? 'rotate-180 border-warning/40' : 'border-primary/20'}
                      `}
                    >
                      {selectedCardData.imageUrl ? (
                        <Image
                          src={selectedCardData.imageUrl}
                          alt={selectedCardData.nameCn}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className={`w-full h-full flex items-center justify-center ${selectedCard.isReversed ? 'bg-warning/10' : 'bg-primary/5'}`}>
                          <span className="text-sm font-semibold">{selectedCardData.nameCn}</span>
                        </div>
                      )}
                    </div>

                    <div className="flex-1 min-w-0 space-y-2">
                      <p className="text-xs text-muted-foreground">
                        {selectedCardData.nameEn}
                      </p>
                      <div className="flex flex-wrap gap-1">
                        {(selectedCard.isReversed
                          ? selectedCardData.reversedKeywords
                          : selectedCardData.uprightKeywords
                        ).map((kw) => (
                          <Badge key={kw} variant="secondary" className="text-[10px]">
                            {kw}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* 释义 */}
                  <div>
                    <h4 className="text-sm font-semibold text-foreground mb-1">
                      {selectedCard.isReversed ? '逆位释义' : '正位释义'}
                    </h4>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {selectedCard.isReversed
                        ? selectedCardData.reversedMeaning
                        : selectedCardData.uprightMeaning}
                    </p>
                  </div>

                  {/* 位置含义 */}
                  <div className="p-3 rounded-xl bg-muted/50">
                    <p className="text-xs text-muted-foreground">
                      <span className="font-medium text-foreground">牌阵位置：</span>
                      {selectedCard.positionName}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {spread.positions.find(p => p.name === selectedCard.positionName)?.description}
                    </p>
                  </div>

                  {/* 分类释义（有问题类型时展示） */}
                  {questionType && selectedCardData.typeMeanings?.[questionType] && (
                    <div className="p-3 rounded-xl bg-primary/5 border border-primary/10">
                      <p className="text-xs font-semibold text-foreground mb-1">
                        {questionType === 'love' ? '💕 恋爱婚姻' : questionType === 'career' ? '💼 工作事业' : '💰 金钱财物'}
                        {' · '}
                        {selectedCard.isReversed ? '逆位' : '正位'}
                      </p>
                      <p className="text-xs text-muted-foreground leading-relaxed">
                        {selectedCard.isReversed
                          ? selectedCardData.typeMeanings[questionType]!.reversed
                          : selectedCardData.typeMeanings[questionType]!.upright}
                      </p>
                    </div>
                  )}
                </div>
              </DialogContent>
            </Dialog>
          )}
        </AnimatePresence>
      </div>
    </section>
  );
}
