import { motion } from 'framer-motion';
import { ArrowLeft, Sparkles, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Image } from '@/components/ui/image';
import type { ITarotCard } from '@/types/tarot';

interface CardDetailSectionProps {
  card: ITarotCard;
  onBack: () => void;
}

export default function CardDetailSection({ card, onBack }: CardDetailSectionProps) {
  const isMajor = card.category === 'major';

  return (
    <div className="min-h-screen bg-background">
      <main className="max-w-3xl mx-auto px-4 md:px-6 py-6 space-y-8">
        {/* 返回按钮 */}
        <motion.div
          initial={{ opacity: 0, x: -12 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
        >
          <Button
            variant="ghost"
            size="sm"
            onClick={onBack}
            className="gap-1.5 text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="size-4" />
            返回牌库
          </Button>
        </motion.div>

        {/* 牌面展示区 */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="flex flex-col md:flex-row items-center gap-6 md:gap-10"
        >
          {/* 牌面图 */}
          <div className="shrink-0">
            <div className="relative w-48 h-80 md:w-56 md:h-96 rounded-2xl overflow-hidden shadow-lg border border-border/40 bg-card">
              {card.imageUrl ? (
                <Image
                  src={card.imageUrl}
                  alt={card.nameCn}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center gap-3 bg-gradient-to-br from-primary/10 via-background to-accent/20 p-4">
                  <div className="size-16 rounded-full bg-primary/15 flex items-center justify-center">
                    <Sparkles className="size-8 text-primary" />
                  </div>
                  <span className="text-sm font-semibold text-primary text-center leading-tight">
                    {card.nameCn}
                  </span>
                  <span className="text-[10px] text-muted-foreground text-center">
                    {card.nameEn}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* 牌名信息 */}
          <div className="flex-1 text-center md:text-left space-y-3">
            <div className="flex items-center justify-center md:justify-start gap-2 flex-wrap">
              <h1 className="text-2xl md:text-3xl font-bold text-foreground">
                {card.nameCn}
              </h1>
              <Badge variant={isMajor ? 'default' : 'secondary'} className="text-xs">
                {isMajor ? '大阿卡纳' : '小阿卡纳'}
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground italic">
              {card.nameEn}
            </p>
            <div className="flex items-center justify-center md:justify-start gap-2 text-xs text-muted-foreground">
              <span className="px-2 py-0.5 rounded-full bg-muted/60">
                {categoryLabel(card.category)}
              </span>
            </div>
          </div>
        </motion.div>

        {/* 关键词区 */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
          className="grid grid-cols-1 md:grid-cols-2 gap-4"
        >
          {/* 正位关键词 */}
          <Card className="border-success/30 bg-success/5">
            <CardContent className="p-5 space-y-3">
              <div className="flex items-center gap-2">
                <div className="size-6 rounded-full bg-success/20 flex items-center justify-center">
                  <Sparkles className="size-3.5 text-success" />
                </div>
                <h3 className="text-sm font-semibold text-foreground">正位关键词</h3>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {card.uprightKeywords.map((kw) => (
                  <Badge
                    key={kw}
                    variant="outline"
                    className="text-xs border-success/40 text-success bg-success/10"
                  >
                    {kw}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* 逆位关键词 */}
          <Card className="border-warning/30 bg-warning/5">
            <CardContent className="p-5 space-y-3">
              <div className="flex items-center gap-2">
                <div className="size-6 rounded-full bg-warning/20 flex items-center justify-center">
                  <AlertTriangle className="size-3.5 text-warning" />
                </div>
                <h3 className="text-sm font-semibold text-foreground">逆位关键词</h3>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {card.reversedKeywords.map((kw) => (
                  <Badge
                    key={kw}
                    variant="outline"
                    className="text-xs border-warning/40 text-warning bg-warning/10"
                  >
                    {kw}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* 详细释义 */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
          className="space-y-5"
        >
          {/* 正位释义 */}
          <Card>
            <CardContent className="p-5 md:p-6 space-y-3">
              <div className="flex items-center gap-2">
                <div className="size-2 rounded-full bg-success" />
                <h3 className="text-base font-semibold text-foreground">正位释义</h3>
              </div>
              <p className="text-sm text-foreground/80 leading-relaxed whitespace-pre-line">
                {card.uprightMeaning}
              </p>
            </CardContent>
          </Card>

          {/* 逆位释义 */}
          <Card>
            <CardContent className="p-5 md:p-6 space-y-3">
              <div className="flex items-center gap-2">
                <div className="size-2 rounded-full bg-warning" />
                <h3 className="text-base font-semibold text-foreground">逆位释义</h3>
              </div>
              <p className="text-sm text-foreground/80 leading-relaxed whitespace-pre-line">
                {card.reversedMeaning}
              </p>
            </CardContent>
          </Card>
        </motion.div>
      </main>
    </div>
  );
}

/** 分类中文标签 */
function categoryLabel(category: ITarotCard['category']): string {
  const map: Record<ITarotCard['category'], string> = {
    major: '大阿卡纳',
    wands: '权杖',
    cups: '圣杯',
    swords: '宝剑',
    pentacles: '星币',
  };
  return map[category] ?? category;
}
