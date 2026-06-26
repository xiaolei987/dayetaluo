import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { Sparkles, Clock, Heart, Star } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import type { IReadingRecord } from '@/types/tarot';

interface StatsSectionProps {
  readings: IReadingRecord[];
}

interface StatItem {
  label: string;
  value: number;
  icon: typeof Sparkles;
  color: string;
}

export default function StatsSection({ readings }: StatsSectionProps) {
  const stats: StatItem[] = useMemo(() => {
    const totalReadings = readings.length;
    const totalFavorites = readings.filter((r) => r.isFavorite).length;
    const recentReadings = readings.filter((r) => {
      const sevenDaysAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
      return new Date(r.createdAt).getTime() > sevenDaysAgo;
    }).length;
    const uniqueSpreads = new Set(readings.map((r) => r.spreadId)).size;

    return [
      { label: '累计占卜', value: totalReadings, icon: Sparkles, color: 'text-primary' },
      { label: '收藏解读', value: totalFavorites, icon: Heart, color: 'text-rose-400' },
      { label: '近7天占卜', value: recentReadings, icon: Clock, color: 'text-amber-500' },
      { label: '使用牌阵', value: uniqueSpreads, icon: Star, color: 'text-emerald-500' },
    ];
  }, [readings]);

  return (
    <div className="grid grid-cols-2 gap-3">
      {stats.map((item, i) => {
        const Icon = item.icon;
        return (
          <motion.div
            key={item.label}
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4, delay: i * 0.08, ease: [0.16, 1, 0.3, 1] }}
          >
            <Card className="border-border/40 bg-card/60 backdrop-blur-sm rounded-2xl">
              <CardContent className="p-4 flex flex-col items-center gap-2">
                <div className={`${item.color} flex items-center justify-center`}>
                  <Icon className="size-5" />
                </div>
                <span className="text-2xl font-bold tabular-nums text-foreground">
                  {item.value}
                </span>
                <span className="text-xs text-muted-foreground">{item.label}</span>
              </CardContent>
            </Card>
          </motion.div>
        );
      })}
    </div>
  );
}
