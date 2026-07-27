import { useState, useEffect, useCallback, useMemo } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Heart, Share2, Bookmark } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import SpreadLayoutSection from '@/pages/ResultPage/SpreadLayoutSection';
import InterpretationSection from '@/pages/ResultPage/InterpretationSection';
import type { IReadingRecord, IInterpretationResult } from '@/types/tarot';
import type { ISpreadConfig } from '@/types/spread';
import { MOCK_SPREADS } from '@/data/spreads';
import { findReading, upsertReading, toggleFavorite } from '@/lib/storage';

export default function ResultPage() {
  const { readingId } = useParams<{ readingId: string }>();
  const navigate = useNavigate();
  const location = useLocation();

  // 从导航状态或 localStorage 加载记录
  const [record, setRecord] = useState<IReadingRecord | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  // 加载占卜记录
  useEffect(() => {
    if (!readingId) {
      setNotFound(true);
      setLoading(false);
      return;
    }

    // 优先从导航状态获取
    const stateRecord = (location.state as { record?: IReadingRecord })?.record;
    if (stateRecord && stateRecord.id === readingId) {
      setRecord(stateRecord);
      setLoading(false);
      return;
    }

    // 从 localStorage 加载
    const found = findReading(readingId);
    if (found) setRecord(found);
    else setNotFound(true);
    setLoading(false);
  }, [readingId, location.state]);

  // 牌阵配置
  const spread = useMemo<ISpreadConfig | null>(() => {
    if (!record) return null;
    return MOCK_SPREADS.find((s) => s.id === record.spreadId) ?? null;
  }, [record]);

  // 保存记录到 localStorage
  const saveRecord = useCallback(
    (updated: IReadingRecord) => {
      setRecord(updated);
      upsertReading(updated);
    },
    [],
  );

  // 解读结果变更
  const handleInterpretationChange = useCallback(
    (result: IInterpretationResult) => {
      if (!record) return;
      const updated: IReadingRecord = { ...record, interpretation: result };
      saveRecord(updated);
    },
    [record, saveRecord],
  );

  // 收藏切换
  const handleToggleFavorite = useCallback(() => {
    if (!record) return;
    const updated: IReadingRecord = { ...record, isFavorite: !record.isFavorite };
    saveRecord(updated);

    // 同步更新收藏列表
    toggleFavorite(updated.id);

    toast.success(updated.isFavorite ? '已收藏' : '已取消收藏');
  }, [record, saveRecord]);

  // 分享
  const handleShare = useCallback(async () => {
    if (!record) return;
    try {
      const shareText = `🔮 大爷塔罗 · ${record.spreadName}\n问题：${record.question || '未填写'}\n${record.interpretation ? `解读：${record.interpretation.overview.slice(0, 100)}...` : ''}`;
      await navigator.clipboard.writeText(shareText);
      toast.success('分享内容已复制到剪贴板');
    } catch {
      toast.error('复制失败，请重试');
    }
  }, [record]);

  // ==================== 加载态 ====================
  if (loading) {
    return (
      <div className="flex items-center justify-center py-32">
        <div className="flex flex-col items-center gap-3">
          <div className="size-8 rounded-full border-2 border-primary border-t-transparent animate-spin" />
          <p className="text-sm text-muted-foreground">加载中...</p>
        </div>
      </div>
    );
  }

  // ==================== 未找到 ====================
  if (notFound || !record || !spread) {
    return (
      <div className="flex flex-col items-center justify-center py-32 px-4">
        <div className="size-16 rounded-2xl bg-muted/50 flex items-center justify-center mb-4">
          <Bookmark className="size-8 text-muted-foreground/40" />
        </div>
        <h2 className="text-lg font-semibold text-foreground mb-1">记录未找到</h2>
        <p className="text-sm text-muted-foreground mb-6">该占卜记录不存在或已被删除</p>
        <Button variant="outline" className="rounded-xl" onClick={() => navigate('/')}>
          返回首页
        </Button>
      </div>
    );
  }

  // ==================== 主渲染 ====================
  return (
    <div className="space-y-8 pb-12">
      {/* 顶部操作栏 */}
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="sticky top-14 z-40 w-full bg-background/80 backdrop-blur-md border-b border-border/30"
      >
        <div className="max-w-7xl mx-auto px-4 md:px-6 flex h-12 items-center justify-between">
          {/* 左侧：返回 */}
          <Button
            variant="ghost"
            size="sm"
            className="gap-1.5 rounded-xl text-sm"
            onClick={() => navigate(-1)}
          >
            <ArrowLeft className="size-4" />
            返回
          </Button>

          {/* 中间：牌阵名称 */}
          <span className="text-sm font-medium text-foreground truncate max-w-[200px]">
            {record.spreadName}
          </span>

          {/* 右侧：收藏 + 分享 */}
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="icon"
              className="size-9 rounded-xl"
              onClick={handleToggleFavorite}
              aria-label={record.isFavorite ? '取消收藏' : '收藏'}
            >
              <Heart
                className={`size-4 transition-colors ${
                  record.isFavorite ? 'fill-red-400 text-red-400' : 'text-muted-foreground'
                }`}
              />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="size-9 rounded-xl"
              onClick={handleShare}
              aria-label="分享"
            >
              <Share2 className="size-4 text-muted-foreground" />
            </Button>
          </div>
        </div>
      </motion.div>

      {/* 用户问题/类型展示 */}
      {(record.question || record.questionType) && (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="max-w-7xl mx-auto px-4 md:px-6"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-primary/5 border border-primary/10">
            {record.question && (
              <>
                <span className="text-xs text-muted-foreground">你的问题：</span>
                <span className="text-sm font-medium text-foreground">{record.question}</span>
              </>
            )}
            {record.questionType === 'love' && (
              <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-pink-500/10 text-pink-600 dark:text-pink-400">恋爱婚姻</span>
            )}
            {record.questionType === 'career' && (
              <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-600 dark:text-blue-400">工作事业</span>
            )}
            {record.questionType === 'money' && (
              <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400">金钱财物</span>
            )}
          </div>
        </motion.div>
      )}

      {/* 牌阵布局 */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
      >
        <SpreadLayoutSection spread={spread} drawnCards={record.cards} questionType={record.questionType} />
      </motion.div>

      {/* AI 解读区 */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.25, ease: [0.16, 1, 0.3, 1] }}
        className="max-w-7xl mx-auto px-4 md:px-6"
      >
        <InterpretationSection
          spread={spread}
          drawnCards={record.cards}
          question={record.question}
          questionType={record.questionType}
          interpretation={record.interpretation ?? null}
          onInterpretationChange={handleInterpretationChange}
          isFavorite={record.isFavorite}
          onToggleFavorite={handleToggleFavorite}
        />
      </motion.div>

    </div>
  );
}
