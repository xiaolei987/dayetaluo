import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Sparkles, ArrowRight } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export default function DailyCardSection() {
  const navigate = useNavigate();

  return (
    <section className="w-full py-8 md:py-12">
      <div className="max-w-7xl mx-auto px-4 md:px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        >
          <Card className="overflow-hidden border-border/40 bg-gradient-to-br from-primary/5 via-background to-accent/20 shadow-sm">
            <CardContent className="p-0">
              <div className="flex flex-col sm:flex-row items-center gap-6 p-6 md:p-8">
                {/* 左侧装饰 */}
                <div className="shrink-0 relative">
                  <div className="size-20 md:size-24 rounded-2xl bg-gradient-to-br from-primary/30 to-accent/40 flex items-center justify-center">
                    <Sparkles className="size-10 md:size-12 text-primary" />
                  </div>
                  <div className="absolute -top-1 -right-1 size-6 rounded-full bg-accent flex items-center justify-center">
                    <span className="text-[10px] font-bold text-accent-foreground">1</span>
                  </div>
                </div>

                {/* 中间文字 */}
                <div className="flex-1 min-w-0 text-center sm:text-left">
                  <h3 className="text-lg md:text-xl font-semibold text-foreground">
                    每日一牌
                  </h3>
                  <p className="mt-1.5 text-sm text-muted-foreground leading-relaxed">
                    抽取今日专属塔罗牌，获得一天的指引与启示。让宇宙的能量为你导航。
                  </p>
                  <div className="mt-3 flex flex-wrap gap-2 justify-center sm:justify-start">
                    <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-medium text-primary">
                      快速占卜
                    </span>
                    <span className="inline-flex items-center gap-1 rounded-full bg-accent/30 px-2.5 py-0.5 text-xs font-medium text-accent-foreground">
                      每日运势
                    </span>
                  </div>
                </div>

                {/* 右侧按钮 */}
                <div className="shrink-0">
                  <Button
                    onClick={() => navigate('/daily')}
                    className="rounded-xl px-6 py-5 text-sm font-semibold shadow-sm"
                  >
                    <Sparkles className="size-4" />
                    开始抽牌
                    <ArrowRight className="size-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </section>
  );
}
