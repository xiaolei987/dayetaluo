import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Clock, Trash2, ChevronRight, Sparkles, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { EmptyState } from '@/components/ui/empty-state';
import { Image } from '@/components/ui/image';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import type { IReadingRecord } from '@/types/tarot';
import { MOCK_TAROT_CARDS } from '@/data/tarotCards';
import { loadReadings, saveReadings } from '@/lib/storage';

function getCardById(cardId: string) {
  return MOCK_TAROT_CARDS.find((c) => c.id === cardId);
}

function formatDate(iso: string): string {
  try {
    const d = new Date(iso);
    const month = d.getMonth() + 1;
    const day = d.getDate();
    const hours = d.getHours().toString().padStart(2, '0');
    const minutes = d.getMinutes().toString().padStart(2, '0');
    return `${month}月${day}日 ${hours}:${minutes}`;
  } catch {
    return iso;
  }
}

const STYLE_LABELS: Record<string, string> = {
  gentle: '温柔治愈',
  rational: '理性分析',
  traditional: '传统专业',
};

export default function HistoryPage() {
  const navigate = useNavigate();
  const [readings, setReadings] = useState<IReadingRecord[]>([]);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  useEffect(() => {
    const data = loadReadings();
    // 按时间倒序
    data.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    setReadings(data);
  }, []);

  const handleDelete = useCallback(
    (id: string) => {
      const updated = readings.filter((r) => r.id !== id);
      setReadings(updated);
      saveReadings(updated);
      setDeleteId(null);
    },
    [readings],
  );

  const handleClearAll = useCallback(() => {
    setReadings([]);
    saveReadings([]);
    setDeleteId(null);
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <main className="max-w-3xl mx-auto px-4 md:px-6 py-8 space-y-8">
        {/* 顶部标题栏 */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              className="size-9 rounded-lg"
              onClick={() => navigate(-1)}
              aria-label="返回"
            >
              <ArrowLeft className="size-4" />
            </Button>
            <div>
              <h1 className="text-xl font-semibold font-serif text-foreground flex items-center gap-2">
                <Clock className="size-5 text-primary" />
                占卜历史
              </h1>
              <p className="text-xs text-muted-foreground mt-0.5">
                {readings.length > 0
                  ? `共 ${readings.length} 次占卜记录`
                  : '还没有占卜记录'}
              </p>
            </div>
          </div>

          {readings.length > 0 && (
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-muted-foreground hover:text-destructive text-xs gap-1.5"
                >
                  <Trash2 className="size-3.5" />
                  清空全部
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent className="rounded-2xl">
                <AlertDialogHeader>
                  <AlertDialogTitle>确认清空全部记录？</AlertDialogTitle>
                  <AlertDialogDescription>
                    此操作不可撤销，所有占卜历史将被永久删除。
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel className="rounded-xl">取消</AlertDialogCancel>
                  <AlertDialogAction className="rounded-xl" onClick={handleClearAll}>
                    确认清空
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          )}
        </div>

        {/* 删除单条确认弹窗 */}
        <AlertDialog open={!!deleteId} onOpenChange={(open) => { if (!open) setDeleteId(null); }}>
          <AlertDialogContent className="rounded-2xl">
            <AlertDialogHeader>
              <AlertDialogTitle>确认删除这条记录？</AlertDialogTitle>
              <AlertDialogDescription>删除后将无法恢复</AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel className="rounded-xl" onClick={() => setDeleteId(null)}>取消</AlertDialogCancel>
              <AlertDialogAction className="rounded-xl bg-destructive hover:bg-destructive/90" onClick={() => deleteId && handleDelete(deleteId)}>
                确认删除
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        {/* 空状态 */}
        {readings.length === 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          >
            <EmptyState
              variant="card"
              icon={<Clock className="size-7" />}
              title="还没有占卜记录"
              description="开始你的第一次塔罗占卜，记录将保存在这里"
              action={(
                <Button className="rounded-xl gap-2" onClick={() => navigate('/')}>
                  <Sparkles className="size-4" />
                  开始占卜
                </Button>
              )}
            />
          </motion.div>
        )}

        {/* 历史记录列表 */}
        <AnimatePresence mode="popLayout">
          <div className="space-y-3">
            {readings.map((record, i) => (
              <motion.div
                key={record.id}
                layout
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, x: -40, transition: { duration: 0.25 } }}
                transition={{ duration: 0.4, delay: i * 0.04, ease: [0.16, 1, 0.3, 1] }}
              >
                <Card
                  className="group cursor-pointer rounded-2xl border border-border/50 bg-card/80 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all overflow-hidden"
                  onClick={() => navigate(`/history/${record.id}`)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-center gap-4 min-w-0">
                      {/* 左侧信息 */}
                      <div className="flex-1 min-w-0 space-y-2">
                        {/* 第一行：牌阵名称 + 时间 */}
                        <div className="flex items-center justify-between gap-2">
                          <div className="flex items-center gap-2 min-w-0">
                            <span className="text-sm font-semibold font-serif text-foreground truncate">
                              {record.spreadName}
                            </span>
                            {record.isFavorite && (
                              <Sparkles className="size-3.5 text-warning shrink-0" />
                            )}
                          </div>
                          <div className="flex items-center gap-1 shrink-0">
                            <span className="text-xs text-muted-foreground">
                              {formatDate(record.createdAt)}
                            </span>
                            {/* 删除按钮 */}
                            <Button
                              variant="ghost"
                              size="icon"
                              className="size-7 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity hover:bg-destructive/10 hover:text-destructive"
                              onClick={(e) => {
                                e.stopPropagation();
                                setDeleteId(record.id);
                              }}
                            >
                              <Trash2 className="size-3.5" />
                            </Button>
                          </div>
                        </div>

                        {/* 第二行：问题摘要 */}
                        {record.question && (
                          <p className="text-xs text-muted-foreground truncate">
                            {record.question}
                          </p>
                        )}

                        {/* 第三行：牌面缩略 + 风格标签 */}
                        <div className="flex items-center gap-2 flex-wrap">
                          {/* 牌面缩略 */}
                          <div className="flex items-center gap-1.5">
                            {record.cards.slice(0, 4).map((card, idx) => {
                              const cardData = getCardById(card.cardId);
                              return (
                                <div
                                  key={idx}
                                  className={`w-8 h-12 rounded-md border overflow-hidden shadow-sm shrink-0 ${
                                    card.isReversed ? 'rotate-180 border-warning/30' : 'border-border/40'
                                  }`}
                                >
                                  {cardData?.imageUrl ? (
                                    <Image
                                      src={cardData.imageUrl}
                                      alt={cardData.nameCn}
                                      className="w-full h-full object-cover"
                                    />
                                  ) : (
                                    <div className={`w-full h-full flex items-center justify-center text-[8px] font-medium ${
                                      card.isReversed ? 'bg-warning/10 text-warning' : 'bg-success/10 text-success'
                                    }`}>
                                      {cardData?.nameCn?.slice(0, 1) ?? '?'}
                                    </div>
                                  )}
                                </div>
                              );
                            })}
                            {record.cards.length > 4 && (
                              <span className="text-[10px] text-muted-foreground shrink-0">
                                +{record.cards.length - 4}
                              </span>
                            )}
                          </div>

                          {/* 风格标签 */}
                          <Badge variant="outline" className="text-[10px] px-1.5 py-0 h-5 rounded-md">
                            {STYLE_LABELS[record.style] || record.style}
                          </Badge>

                          {/* 是否有解读 */}
                          {record.interpretation && (
                            <Badge
                              variant="secondary"
                              className="text-[10px] px-1.5 py-0 h-5 rounded-md"
                            >
                              已解读
                            </Badge>
                          )}
                        </div>
                      </div>

                      {/* 右侧箭头 */}
                      <ChevronRight className="size-4 text-muted-foreground/40 shrink-0 group-hover:text-primary transition-colors" />
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </AnimatePresence>

        {/* 底部留白 */}
        <div className="h-4" />
      </main>
    </div>
  );
}
