import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Heart, ArrowRight, Sparkles } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import type { IReadingRecord } from '@/types/tarot';
import { MOCK_TAROT_CARDS } from '@/data/tarotCards';

interface FavoritesSectionProps {
  readings: IReadingRecord[];
}

export default function FavoritesSection({ readings }: FavoritesSectionProps) {
  const navigate = useNavigate();

  const favorites = useMemo(
    () => readings.filter((r) => r.isFavorite),
    [readings],
  );

  if (favorites.length === 0) {
    return (
      <Card className="rounded-2xl border-border/40 shadow-sm">
        <CardContent className="flex flex-col items-center justify-center py-12 gap-3">
          <div className="size-16 rounded-full bg-primary/10 flex items-center justify-center">
            <Heart className="size-7 text-primary/60" />
          </div>
          <p className="text-sm text-muted-foreground">还没有收藏任何占卜记录</p>
          <p className="text-xs text-muted-foreground/70">
            在解读结果页点击收藏，方便随时回看
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-3">
      {favorites.map((record, i) => {
        const firstCard = MOCK_TAROT_CARDS.find(
          (c) => c.id === record.cards[0]?.cardId,
        );
        const cardCount = record.cards.length;

        return (
          <motion.div
            key={record.id}
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4, delay: i * 0.06, ease: [0.16, 1, 0.3, 1] }}
          >
            <Card
              className="rounded-2xl border-border/40 shadow-sm cursor-pointer hover:shadow-md transition-shadow"
              onClick={() => navigate(`/history/${record.id}`)}
            >
              <CardContent className="p-4">
                <div className="flex items-center gap-3 min-w-0">
                  {/* 牌阵缩略 */}
                  <div className="size-12 shrink-0 rounded-xl bg-gradient-to-br from-primary/20 to-accent/30 flex items-center justify-center">
                    <Sparkles className="size-5 text-primary" />
                  </div>

                  {/* 内容 */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-sm font-semibold text-foreground truncate">
                        {record.spreadName}
                      </span>
                      <Badge
                        variant="outline"
                        className="shrink-0 text-[10px] px-1.5 py-0 h-5 rounded-md border-border/60 text-muted-foreground"
                      >
                        {cardCount}张牌
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground truncate">
                      {record.question || '未填写问题'}
                    </p>
                    <div className="flex items-center gap-2 mt-1.5">
                      {firstCard && (
                        <span className="text-[11px] text-muted-foreground/80 truncate">
                          {firstCard.nameCn}
                          {record.cards[0]?.isReversed ? '（逆）' : '（正）'}
                        </span>
                      )}
                      <span className="text-[11px] text-muted-foreground/60 shrink-0">
                        {new Date(record.createdAt).toLocaleDateString('zh-CN', {
                          month: 'short',
                          day: 'numeric',
                        })}
                      </span>
                    </div>
                  </div>

                  {/* 箭头 */}
                  <ArrowRight className="size-4 shrink-0 text-muted-foreground/40" />
                </div>
              </CardContent>
            </Card>
          </motion.div>
        );
      })}
    </div>
  );
}
