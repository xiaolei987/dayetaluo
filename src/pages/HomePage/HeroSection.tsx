import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Sparkles, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Image } from '@/components/ui/image';

const HERO_IMAGE = '/images/hero-banner.webp';

export default function HeroSection() {
  const navigate = useNavigate();

  return (
    <section className="w-full py-16 md:py-24 lg:py-32">
      <div className="max-w-7xl mx-auto px-4 md:px-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 items-center">
          {/* 左侧文字区 */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
            className="space-y-6"
          >
            {/* 品牌标签 */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-medium"
            >
              <Sparkles className="size-3.5" />
              塔罗占卜 · 心灵指引
            </motion.div>

            {/* 主标题 */}
            <h1 className="font-serif text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight text-foreground leading-tight">
              大爷
              <span className="text-primary">塔罗</span>
            </h1>

            {/* Slogan */}
            <p className="text-lg md:text-xl text-muted-foreground max-w-md leading-relaxed">
              翻开一张牌，遇见内心的答案。<br />
              让塔罗的智慧，温柔地照亮你的前路。
            </p>

            {/* 今日一牌快捷入口 */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.3 }}
            >
              <Button
                size="lg"
                className="rounded-xl text-base px-6 py-6 h-auto gap-2 shadow-sm hover:shadow-md transition-shadow"
                onClick={() => navigate('/daily')}
              >
                <Sparkles className="size-5" />
                今日一牌 · 获取指引
                <ArrowRight className="size-4" />
              </Button>
            </motion.div>

            {/* 底部小字 */}
            <p className="text-xs text-muted-foreground/70">
              每日一牌，即刻体验
            </p>
          </motion.div>

          {/* 右侧主视觉图 */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
            className="relative"
          >
            <div className="relative rounded-2xl overflow-hidden shadow-lg aspect-[21/9] bg-muted/50">
              <Image
                src={HERO_IMAGE}
                alt="大爷塔罗 - 塔罗占卜"
                className="w-full h-full object-cover"
              />
              {/* 柔光叠加层 */}
              <div className="absolute inset-0 bg-gradient-to-tr from-primary/10 via-transparent to-accent/20 pointer-events-none" />
            </div>

            {/* 装饰浮动元素 */}
            <motion.div
              animate={{ y: [0, -8, 0] }}
              transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
              className="absolute -top-4 -right-4 size-16 rounded-2xl bg-primary/15 backdrop-blur-sm border border-primary/20 hidden lg:block"
            />
            <motion.div
              animate={{ y: [0, 6, 0] }}
              transition={{ duration: 3.5, repeat: Infinity, ease: 'easeInOut', delay: 0.5 }}
              className="absolute -bottom-6 -left-6 size-20 rounded-full bg-accent/20 backdrop-blur-sm border border-accent/30 hidden lg:block"
            />
          </motion.div>
        </div>
      </div>
    </section>
  );
}
