import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Image } from '@/components/ui/image';
import { getCardById } from '@/data/tarotCards';

export default function CardDetailPage() {
  const { cardId } = useParams<{ cardId: string }>();
  const navigate = useNavigate();

  const card = cardId ? getCardById(cardId) : undefined;

  if (!card) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-4 px-4">
        <p className="text-muted-foreground text-lg">未找到该卡牌</p>
        <Button variant="outline" onClick={() => navigate('/library')}>
          <ArrowLeft className="size-4" />
          返回牌库
        </Button>
      </div>
    );
  }

  const categoryLabels: Record<string, string> = {
    major: '大阿卡纳',
    wands: '权杖',
    cups: '圣杯',
    swords: '宝剑',
    pentacles: '星币',
  };

  return (
    <div className="min-h-screen bg-background">
      <main className="max-w-3xl mx-auto px-4 md:px-6 py-8 space-y-8">
        {/* 返回按钮 */}
        <motion.div
          initial={{ opacity: 0, x: -12 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.4 }}
        >
          <Button
            variant="ghost"
            size="sm"
            className="gap-1.5 text-muted-foreground hover:text-foreground"
            onClick={() => navigate('/library')}
          >
            <ArrowLeft className="size-4" />
            返回牌库
          </Button>
        </motion.div>

        {/* 牌面展示区 */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
        >
          <Card className="rounded-2xl border border-border/50 bg-card/80 shadow-sm overflow-hidden">
            <CardContent className="p-6 md:p-8">
              <div className="flex flex-col md:flex-row gap-6 md:gap-10 items-center md:items-start">
                {/* 牌面图 */}
                <div className="shrink-0">
                  <div className="relative w-40 h-64 md:w-48 md:h-72 rounded-2xl overflow-hidden border border-border/40 shadow-sm">
                    {card.imageUrl ? (
                      <Image
                        src={card.imageUrl}
                        alt={card.nameCn}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-primary/10 via-accent/10 to-muted/30 p-4">
                        <div className="text-5xl md:text-6xl mb-3">
                          {card.category === 'major' ? '✦' : card.category === 'wands' ? '🪄' : card.category === 'cups' ? '🏆' : card.category === 'swords' ? '⚔️' : '🪙'}
                        </div>
                        <div className="text-xs text-muted-foreground/60 text-center font-medium">
                          {card.nameEn}
                        </div>
                      </div>
                    )}
                    {/* 金边装饰 */}
                    <div className="absolute inset-1.5 rounded-xl border border-primary/20 pointer-events-none" />
                  </div>
                </div>

                {/* 牌面信息 */}
                <div className="flex-1 min-w-0 space-y-4 text-center md:text-left">
                  <div>
                    <div className="flex items-center justify-center md:justify-start gap-2 mb-1">
                      <Badge variant="secondary" className="text-xs">
                        {categoryLabels[card.category] || card.category}
                      </Badge>
                    </div>
                    <h1 className="text-2xl md:text-3xl font-semibold text-foreground">
                      {card.nameCn}
                    </h1>
                    <p className="text-sm text-muted-foreground mt-1">
                      {card.nameEn}
                    </p>
                  </div>

                  {/* 关键词 */}
                  <div className="space-y-2">
                    <div className="flex flex-wrap items-center gap-1.5 justify-center md:justify-start">
                      <span className="text-xs font-medium text-success/80 shrink-0">正位：</span>
                      {card.uprightKeywords.map((kw) => (
                        <Badge key={kw} variant="outline" className="text-xs border-success/30 text-success/80">
                          {kw}
                        </Badge>
                      ))}
                    </div>
                    <div className="flex flex-wrap items-center gap-1.5 justify-center md:justify-start">
                      <span className="text-xs font-medium text-warning/80 shrink-0">逆位：</span>
                      {card.reversedKeywords.map((kw) => (
                        <Badge key={kw} variant="outline" className="text-xs border-warning/30 text-warning/80">
                          {kw}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* 释义详情 */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
        >
          <Tabs defaultValue="upright" className="w-full">
            <TabsList className="w-full grid grid-cols-2 rounded-xl bg-muted/60 p-1">
              <TabsTrigger
                value="upright"
                className="rounded-lg data-[state=active]:bg-success/15 data-[state=active]:text-success/90 data-[state=active]:shadow-none text-sm"
              >
                <Sparkles className="size-3.5 mr-1.5" />
                正位释义
              </TabsTrigger>
              <TabsTrigger
                value="reversed"
                className="rounded-lg data-[state=active]:bg-warning/15 data-[state=active]:text-warning/90 data-[state=active]:shadow-none text-sm"
              >
                <Sparkles className="size-3.5 mr-1.5 rotate-180" />
                逆位释义
              </TabsTrigger>
            </TabsList>

            <TabsContent value="upright" className="mt-4">
              <Card className="rounded-2xl border border-border/50 bg-card/80 shadow-sm">
                <CardContent className="p-6 md:p-8">
                  <div className="flex items-center gap-2 mb-4">
                    <div className="size-2 rounded-full bg-success/60" />
                    <h3 className="text-base font-semibold text-foreground">正位 · {card.nameCn}</h3>
                  </div>
                  <p className="text-sm md:text-base text-foreground/85 leading-relaxed whitespace-pre-line">
                    {card.uprightMeaning}
                  </p>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="reversed" className="mt-4">
              <Card className="rounded-2xl border border-border/50 bg-card/80 shadow-sm">
                <CardContent className="p-6 md:p-8">
                  <div className="flex items-center gap-2 mb-4">
                    <div className="size-2 rounded-full bg-warning/60" />
                    <h3 className="text-base font-semibold text-foreground">逆位 · {card.nameCn}</h3>
                  </div>
                  <p className="text-sm md:text-base text-foreground/85 leading-relaxed whitespace-pre-line">
                    {card.reversedMeaning}
                  </p>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </motion.div>

        {/* 底部操作 */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="flex justify-center pt-2"
        >
          <Button
            variant="outline"
            className="rounded-xl gap-2"
            onClick={() => navigate('/library')}
          >
            <ArrowLeft className="size-4" />
            返回牌库浏览更多
          </Button>
        </motion.div>
      </main>
    </div>
  );
}
