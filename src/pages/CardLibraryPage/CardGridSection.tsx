import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Search, Grid3X3, List } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { EmptyState } from '@/components/ui/empty-state';
import { Image } from '@/components/ui/image';
import { MOCK_TAROT_CARDS } from '@/data/tarotCards';
import type { ITarotCard } from '@/types/tarot';

const CATEGORIES = [
  { key: 'all', label: '全部' },
  { key: 'major', label: '大阿卡纳' },
  { key: 'wands', label: '权杖' },
  { key: 'cups', label: '圣杯' },
  { key: 'swords', label: '宝剑' },
  { key: 'pentacles', label: '星币' },
] as const;

const CATEGORY_LABELS: Record<string, string> = {
  major: '大阿卡纳',
  wands: '权杖',
  cups: '圣杯',
  swords: '宝剑',
  pentacles: '星币',
};

export default function CardGridSection() {
  const navigate = useNavigate();
  const [category, setCategory] = useState<string>('all');
  const [keyword, setKeyword] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  const filteredCards = useMemo(() => {
    let result: ITarotCard[] = MOCK_TAROT_CARDS;

    if (category !== 'all') {
      result = result.filter((c) => c.category === category);
    }

    if (keyword.trim()) {
      const kw = keyword.trim().toLowerCase();
      result = result.filter(
        (c) =>
          c.nameCn.toLowerCase().includes(kw) ||
          c.nameEn.toLowerCase().includes(kw) ||
          c.uprightKeywords.some((k) => k.toLowerCase().includes(kw)) ||
          c.reversedKeywords.some((k) => k.toLowerCase().includes(kw)),
      );
    }

    return result;
  }, [category, keyword]);

  return (
    <section className="w-full py-8">
      <div className="max-w-7xl mx-auto px-4 md:px-6">
        {/* 搜索与筛选区 */}
        <div className="flex flex-col gap-4 mb-6">
          {/* 搜索框 */}
          <div className="relative w-full max-w-md">
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              type="search"
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              placeholder="搜索牌名、关键词..."
              className="bg-background pl-9 rounded-xl"
            />
          </div>

          {/* 分类筛选 + 视图切换 */}
          <div className="flex items-center justify-between gap-3 flex-wrap">
            <div className="flex items-center gap-1.5 flex-wrap">
              {CATEGORIES.map((cat) => (
                <Button
                  key={cat.key}
                  variant={category === cat.key ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setCategory(cat.key)}
                  className="rounded-full text-xs h-8"
                >
                  {cat.label}
                </Button>
              ))}
            </div>

            <div className="flex items-center gap-1 bg-muted/60 rounded-lg p-0.5">
            <Button
              variant={viewMode === 'grid' ? 'default' : 'ghost'}
              size="icon"
              className="size-8 rounded-lg"
                onClick={() => setViewMode('grid')}
                aria-label="宫格视图"
              >
                <Grid3X3 className="size-4" />
              </Button>
            <Button
              variant={viewMode === 'list' ? 'default' : 'ghost'}
              size="icon"
              className="size-8 rounded-lg"
                onClick={() => setViewMode('list')}
                aria-label="列表视图"
              >
                <List className="size-4" />
              </Button>
            </div>
          </div>

          {/* 结果计数 */}
          <p className="text-xs text-muted-foreground">
            共 {filteredCards.length} 张牌
          </p>
        </div>

        {/* 空状态 */}
        {filteredCards.length === 0 && (
          <EmptyState
            variant="card"
            icon={<Search className="size-7" />}
            title="没有找到匹配的卡牌"
            description="试试其他关键词或分类"
          />
        )}

        {/* 宫格视图 */}
        {filteredCards.length > 0 && viewMode === 'grid' && (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 md:gap-4">
            {filteredCards.map((card, i) => (
              <motion.div
                key={card.id}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: i * 0.02, ease: [0.16, 1, 0.3, 1] }}
                whileHover={{ y: -4, transition: { duration: 0.2 } }}
              >
                <Card
                  className="cursor-pointer overflow-hidden rounded-2xl border-border/40 bg-card/80 hover:shadow-md transition-shadow"
                  onClick={() => navigate(`/library/${card.id}`)}
                >
                  {/* 牌面缩略图 */}
                  <div className="aspect-[3/4] bg-gradient-to-br from-primary/10 via-accent/10 to-background flex items-center justify-center relative overflow-hidden">
                    {card.imageUrl ? (
                      <Image
                        src={card.imageUrl}
                        alt={card.nameCn}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="flex flex-col items-center gap-2 p-3 text-center">
                        <div className="size-12 rounded-full bg-primary/15 flex items-center justify-center">
                          <span className="text-primary text-lg font-bold">
                            {card.nameCn.charAt(0)}
                          </span>
                        </div>
                        <span className="text-xs text-muted-foreground leading-tight line-clamp-2">
                          {card.nameCn}
                        </span>
                      </div>
                    )}
                    {/* 分类标签 */}
                    <Badge
                      variant="secondary"
                      className="!absolute top-2 left-2 z-20 text-[10px] px-1.5 py-0 h-5 rounded-full bg-background/80 backdrop-blur-sm"
                    >
                      {CATEGORY_LABELS[card.category] || card.category}
                    </Badge>
                  </div>

                  <CardContent className="p-3 space-y-1">
                    <p className="text-sm font-semibold font-serif text-foreground truncate">
                      {card.nameCn}
                    </p>
                    <p className="text-[11px] text-muted-foreground truncate">
                      {card.nameEn}
                    </p>
                    <div className="flex flex-wrap gap-1 pt-1">
                      {card.uprightKeywords.slice(0, 2).map((kw) => (
                        <Badge
                          key={kw}
                          variant="secondary"
                          className="text-[10px] px-1.5 py-0 h-5 rounded-full font-normal"
                        >
                          {kw}
                        </Badge>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        )}

        {/* 列表视图 */}
        {filteredCards.length > 0 && viewMode === 'list' && (
          <div className="space-y-2">
            {filteredCards.map((card, i) => (
              <motion.div
                key={card.id}
                initial={{ opacity: 0, x: -12 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.35, delay: i * 0.015, ease: [0.16, 1, 0.3, 1] }}
              >
                <Card
                  className="cursor-pointer overflow-hidden rounded-xl border-border/40 bg-card/80 hover:shadow-sm transition-shadow"
                  onClick={() => navigate(`/library/${card.id}`)}
                >
                  <CardContent className="p-3 flex items-center gap-3 min-w-0">
                    {/* 缩略图 */}
                    <div className="size-12 shrink-0 rounded-lg bg-gradient-to-br from-primary/10 via-accent/10 to-background flex items-center justify-center overflow-hidden">
                      {card.imageUrl ? (
                        <Image
                          src={card.imageUrl}
                          alt={card.nameCn}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <span className="text-primary text-sm font-bold">
                          {card.nameCn.charAt(0)}
                        </span>
                      )}
                    </div>

                    {/* 信息 */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 min-w-0">
                        <span className="text-sm font-semibold font-serif text-foreground truncate">
                          {card.nameCn}
                        </span>
                        <Badge variant="secondary" className="shrink-0 text-[10px] px-1.5 py-0 h-5 rounded-full">
                          {CATEGORY_LABELS[card.category] || card.category}
                        </Badge>
                      </div>
                      <p className="text-[11px] text-muted-foreground truncate">
                        {card.nameEn}
                      </p>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {card.uprightKeywords.slice(0, 3).map((kw) => (
                          <Badge
                            key={kw}
                            variant="secondary"
                            className="text-[10px] px-1.5 py-0 h-5 rounded-full font-normal"
                          >
                            {kw}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    {/* 箭头 */}
                    <div className="shrink-0 text-muted-foreground/40">
                      <svg
                        width="16"
                        height="16"
                        viewBox="0 0 16 16"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="M6 4l4 4-4 4" />
                      </svg>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
