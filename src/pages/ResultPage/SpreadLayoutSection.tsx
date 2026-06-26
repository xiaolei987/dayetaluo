import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowUp, ArrowDown, X } from 'lucide-react';
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
import type { IDrawnCard } from '@/types/tarot';
import type { ISpreadConfig } from '@/types/spread';
import { TAROT_CARD_MAP } from '@/data/tarotCards';

interface SpreadLayoutSectionProps {
  spread: ISpreadConfig;
  drawnCards: IDrawnCard[];
}

export default function SpreadLayoutSection({ spread, drawnCards }: SpreadLayoutSectionProps) {
  const [selectedCardId, setSelectedCardId] = useState<string | null>(null);

  const selectedCard = selectedCardId ? drawnCards.find(d => d.cardId === selectedCardId) : null;
  const selectedCardData = selectedCard ? TAROT_CARD_MAP[selectedCard.cardId] : null;

  return (
    <section className="w-full py-8">
      <div className="max-w-7xl mx-auto px-4 md:px-6">
        <div className="mb-6">
          <h2 className="text-xl font-semibold text-foreground">{spread.name}</h2>
          <p className="text-sm text-muted-foreground mt-1">{spread.scenario}</p>
        </div>

        {/* 牌阵布局区 */}
        <div className="relative w-full aspect-[4/3] md:aspect-[16/10] bg-gradient-to-br from-primary/5 via-background to-accent/10 rounded-2xl border border-border/40 overflow-hidden">
          {/* 连接线 (桌面端) */}
          <svg
            className="absolute inset-0 w-full h-full pointer-events-none hidden md:block"
            aria-hidden="true"
          >
            {drawnCards.map((card, i) => {
              const pos = spread.positions[i];
              if (!pos) return null;
              const cx = `${pos.x}%`;
              const cy = `${pos.y}%`;
              return (
                <circle
                  key={`dot-${card.cardId}`}
                  cx={cx}
                  cy={cy}
                  r="3"
                  className="fill-primary/30"
                />
              );
            })}
          </svg>

          {/* 卡牌 */}
          {drawnCards.map((card, i) => {
            const pos = spread.positions[i];
            const cardData = TAROT_CARD_MAP[card.cardId];
            if (!pos || !cardData) return null;

            return (
              <motion.div
                key={card.cardId}
                initial={{ opacity: 0, scale: 0.8, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                transition={{
                  duration: 0.5,
                  delay: i * 0.15,
                  ease: [0.16, 1, 0.3, 1],
                }}
                className="absolute cursor-pointer group flex flex-col items-center gap-0.5"
                style={{
                  left: `${pos.x}%`,
                  top: `${pos.y}%`,
                  transform: 'translate(-50%, -50%)',
                }}
                onClick={() => setSelectedCardId(card.cardId)}
              >
                  {/* 卡牌卡片 */}
                  <div
                    className={`
                      w-20 h-32 md:w-24 md:h-36 rounded-xl border-2 shadow-md
                      overflow-hidden
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
                        <span className="text-xs font-medium text-center leading-tight">
                          {cardData.nameCn}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* 牌名 - 始终正向 */}
                  <p className="text-[10px] font-medium text-foreground text-center leading-tight max-w-[96px]">
                    {cardData.nameCn}
                  </p>

                  {/* 正逆位标识 - 始终正向 */}
                  <Badge
                    variant="outline"
                    className={`text-[10px] px-1 py-0 h-4 ${
                      card.isReversed
                        ? 'border-warning/40 text-warning bg-warning/5'
                        : 'border-success/40 text-success bg-success/5'
                    }`}
                  >
                    {card.isReversed ? '逆位' : '正位'}
                  </Badge>

                  {/* 位置标签 */}
                  <span className="text-[10px] text-muted-foreground whitespace-nowrap">
                    {pos.name}
                  </span>
                </motion.div>
              );
            })}
        </div>

        {/* 卡牌详情弹窗 */}
        <AnimatePresence>
          {selectedCard && selectedCardData && (
            <Dialog open={!!selectedCardId} onOpenChange={() => setSelectedCardId(null)}>
              <DialogContent className="max-w-md">
                <DialogHeader>
                  <DialogTitle className="flex items-center gap-2">
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
                  <div className="p-3 rounded-lg bg-muted/50">
                    <p className="text-xs text-muted-foreground">
                      <span className="font-medium text-foreground">牌阵位置：</span>
                      {selectedCard.positionName}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {spread.positions.find(p => p.name === selectedCard.positionName)?.description}
                    </p>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          )}
        </AnimatePresence>
      </div>
    </section>
  );
}
