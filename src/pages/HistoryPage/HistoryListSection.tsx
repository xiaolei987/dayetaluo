import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Clock, Sparkles, ChevronRight, Trash2, Heart } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import type { IReadingRecord } from '@/types/tarot';
import { MOCK_TAROT_CARDS } from '@/data/tarotCards';

interface HistoryListSectionProps {
  records: IReadingRecord[];
  onDelete: (id: string) => void;
  onToggleFavorite: (id: string) => void;
}

export default function HistoryListSection({
  records,
  onDelete,
  onToggleFavorite,
}: HistoryListSectionProps) {
  const navigate = useNavigate();

  const sortedRecords = useMemo(
    () => [...records].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()),
    [records],
  );

  const getCardName = (cardId: string) => {
    const card = MOCK_TAROT_CARDS.find((c) => c.id === cardId);
    return card ? card.nameCn : '未知牌';
  };

  const formatDate = (iso: string) => {
    const d = new Date(iso);
    const now = new Date();
    const diffMs = now.getTime() - d.getTime();
    const diffMin = Math.floor(diffMs / 60000);
    const diffHour = Math.floor(diffMs / 3600000);
    const diffDay = Math.floor(diffMs / 86400000);

    if (diffMin < 1) return '刚刚';
    if (diffMin < 60) return `${diffMin}分钟前`;
    if (diffHour < 24) return `${diffHour}小时前`;
    if (diffDay < 7) return `${diffDay}天前`;

    const month = d.getMonth() + 1;
    const day = d.getDate();
    return `${month}月${day}日`;
  };

  const styleLabels: Record<string, string> = {
    gentle: '温柔治愈',
    rational: '理性分析',
    traditional: '传统专业',
  };

  if (sortedRecords.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        className="flex flex-col items-center justify-center py-20 px-4"
      >
        <div className="size-20 rounded-full bg-muted flex items-center justify-center mb-5">
          <Clock className="size-8 text-muted-foreground/50" />
        </div>
        <p className="text-base font-medium text-foreground mb-1.5">暂无占卜记录</p>
        <p className="text-sm text-muted-foreground mb-6">开始你的第一次塔罗占卜吧</p>
        <Button
          onClick={() => navigate('/')}
          className="rounded-xl"
        >
          <Sparkles className="size-4" />
          去占卜
        </Button>
      </motion.div>
    );
  }

  return (
    <div className="space-y-3">
      {sortedRecords.map((record, i) => (
        <motion.div
          key={record.id}
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: i * 0.06, ease: [0.16, 1, 0.3, 1] }}
        >
          <Card
            className="cursor-pointer hover:shadow-md transition-shadow rounded-2xl border-border/60"
            onClick={() => navigate(`/history/${record.id}`)}
          >
            <CardContent className="p-4">
              <div className="flex items-start gap-3 min-w-0">
                {/* 左侧：牌阵信息 */}
                <div className="flex-1 min-w-0 space-y-2">
                  {/* 顶部：牌阵名称 + 时间 */}
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2 min-w-0">
                      <h3 className="text-sm font-semibold text-foreground truncate">
                        {record.spreadName}
                      </h3>
                      {record.isFavorite && (
                        <Heart className="size-3.5 shrink-0 text-rose-400 fill-rose-400" />
                      )}
                    </div>
                    <span className="text-xs text-muted-foreground shrink-0">
                      {formatDate(record.createdAt)}
                    </span>
                  </div>

                  {/* 问题摘要 */}
                  {record.question && (
                    <p className="text-xs text-muted-foreground line-clamp-1">
                      {record.question}
                    </p>
                  )}

                  {/* 底部：牌面缩略 + 标签 */}
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-1.5 min-w-0 flex-1">
                      {record.cards.slice(0, 4).map((card, idx) => (
                        <span
                          key={idx}
                          className={`inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-medium shrink-0 ${
                            card.isReversed
                              ? 'bg-warning/10 text-warning'
                              : 'bg-success/10 text-success'
                          }`}
                        >
                          {getCardName(card.cardId)}
                          {card.isReversed ? ' (逆)' : ''}
                        </span>
                      ))}
                      {record.cards.length > 4 && (
                        <span className="text-[11px] text-muted-foreground shrink-0">
                          +{record.cards.length - 4}
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      {record.style && (
                        <Badge variant="outline" className="text-[10px] px-1.5 py-0 h-5 rounded-md">
                          {styleLabels[record.style] || record.style}
                        </Badge>
                      )}
                      {record.interpretation && (
                        <Sparkles className="size-3 text-primary" />
                      )}
                    </div>
                  </div>
                </div>

                {/* 右侧：操作按钮 */}
                <div className="flex flex-col items-center gap-1.5 shrink-0">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="size-7 rounded-lg"
                    onClick={(e) => {
                      e.stopPropagation();
                      onToggleFavorite(record.id);
                    }}
                    aria-label={record.isFavorite ? '取消收藏' : '收藏'}
                  >
                    <Heart
                      className={`size-3.5 ${
                        record.isFavorite
                          ? 'text-rose-400 fill-rose-400'
                          : 'text-muted-foreground'
                      }`}
                    />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="size-7 rounded-lg text-muted-foreground hover:text-destructive"
                    onClick={(e) => {
                      e.stopPropagation();
                      onDelete(record.id);
                    }}
                    aria-label="删除"
                  >
                    <Trash2 className="size-3.5" />
                  </Button>
                  <ChevronRight className="size-4 text-muted-foreground/40 mt-1" />
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      ))}
    </div>
  );
}
