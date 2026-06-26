import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Sparkles } from 'lucide-react';
import { Image } from '@/components/ui/image';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { SPREADS_META } from '@/types/spread';

export default function SpreadGridSection() {
  const navigate = useNavigate();

  return (
    <section className="w-full py-12 md:py-16">
      <div className="max-w-7xl mx-auto px-4 md:px-6">
        {/* 标题区 */}
        <div className="text-center mb-10">
          <h2 className="text-2xl md:text-3xl font-semibold text-foreground">
            选择牌阵
          </h2>
          <p className="mt-2 text-sm text-muted-foreground">
            挑选一个适合你当下问题的牌阵，开始占卜之旅
          </p>
        </div>

        {/* 牌阵卡片宫格 */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {SPREADS_META.map((spread, i) => (
            <motion.div
              key={spread.id}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-60px' }}
              transition={{ duration: 0.5, delay: i * 0.06, ease: [0.16, 1, 0.3, 1] }}
              whileHover={{ y: -4, transition: { duration: 0.2 } }}
            >
              <Card
                className="group cursor-pointer overflow-hidden rounded-2xl border border-border/50 bg-card/80 shadow-sm hover:shadow-md transition-shadow"
                onClick={() => navigate(`/draw/${spread.id}`)}
              >
                {/* 封面图 */}
                <div className="relative aspect-[4/3] overflow-hidden bg-muted/50">
                  <Image
                    src={spread.coverImage}
                    alt={spread.name}
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  {/* 渐变遮罩 */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
                </div>

                <CardContent className="p-4 space-y-2.5">
                  {/* 名称 + 牌数 */}
                  <div className="flex items-center justify-between min-w-0 gap-2">
                    <h3 className="text-base font-semibold text-foreground truncate">
                      {spread.name}
                    </h3>
                    <Badge
                      variant="secondary"
                      className="shrink-0 text-xs font-normal text-muted-foreground"
                    >
                      {spread.cardCount}张
                    </Badge>
                  </div>

                  {/* 适用场景 */}
                  <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                    {spread.shortDesc}
                  </p>

                  {/* 场景标签 */}
                  <div className="flex items-center gap-1.5 pt-1">
                    <Sparkles className="size-3 text-primary shrink-0" />
                    <span className="text-xs text-primary/80 truncate">
                      {spread.scenario}
                    </span>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
