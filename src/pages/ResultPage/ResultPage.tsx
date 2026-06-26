import { useState, useEffect, useCallback, useMemo } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Heart, Share2, Bookmark } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { scopedStorage, logger } from '@lark-apaas/client-toolkit-lite';
import SpreadLayoutSection from '@/pages/ResultPage/SpreadLayoutSection';
import InterpretationSection from '@/pages/ResultPage/InterpretationSection';
import FollowUpChatSection from '@/pages/ResultPage/FollowUpChatSection';
import type { IReadingRecord, IInterpretationResult, IChatMessage } from '@/types/tarot';
import type { ISpreadConfig } from '@/types/spread';
import { MOCK_SPREADS } from '@/data/spreads';

const STORAGE_KEY = '__tarot_readings';
const FAVORITES_KEY = '__tarot_favorites';

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
    try {
      const raw = scopedStorage.getItem(STORAGE_KEY);
      if (raw) {
        const records: IReadingRecord[] = JSON.parse(raw);
        const found = records.find((r) => r.id === readingId);
        if (found) {
          setRecord(found);
        } else {
          setNotFound(true);
        }
      } else {
        setNotFound(true);
      }
    } catch (err) {
      logger.error('Failed to load reading record:', String(err));
      setNotFound(true);
    }
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
      try {
        const raw = scopedStorage.getItem(STORAGE_KEY);
        const records: IReadingRecord[] = raw ? JSON.parse(raw) : [];
        const idx = records.findIndex((r) => r.id === updated.id);
        if (idx >= 0) {
          records[idx] = updated;
        } else {
          records.unshift(updated);
        }
        scopedStorage.setItem(STORAGE_KEY, JSON.stringify(records));
      } catch (err) {
        logger.error('Failed to save reading record:', String(err));
      }
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
    try {
      const raw = scopedStorage.getItem(FAVORITES_KEY);
      const favorites: string[] = raw ? JSON.parse(raw) : [];
      if (updated.isFavorite) {
        if (!favorites.includes(updated.id)) {
          favorites.push(updated.id);
        }
      } else {
        const idx = favorites.indexOf(updated.id);
        if (idx >= 0) favorites.splice(idx, 1);
      }
      scopedStorage.setItem(FAVORITES_KEY, JSON.stringify(favorites));
    } catch (err) {
      logger.error('Failed to update favorites:', String(err));
    }

    toast.success(updated.isFavorite ? '已收藏' : '已取消收藏');
  }, [record, saveRecord]);

  // 追问消息变更
  const handleFollowUpMessagesChange = useCallback(
    (messages: IChatMessage[]) => {
      if (!record?.interpretation) return;
      const updated: IReadingRecord = {
        ...record,
        interpretation: { ...record.interpretation, followUpChat: messages },
      };
      saveRecord(updated);
    },
    [record, saveRecord],
  );

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

  // 构建追问历史上下文
  const followUpContext = useMemo(() => {
    if (!record || !spread) return '';
    const parts = [
      `牌阵：${spread.name}`,
      `用户问题：${record.question || '未填写'}`,
    ];
    if (record.interpretation) {
      parts.push(`牌面总览：${record.interpretation.overview}`);
      parts.push(`综合结论：${record.interpretation.conclusion}`);
      parts.push(`行动建议：${record.interpretation.advice}`);
    }
    return parts.join('\n');
  }, [record, spread]);

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

      {/* 用户问题展示 */}
      {record.question && (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="max-w-7xl mx-auto px-4 md:px-6"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-primary/5 border border-primary/10">
            <span className="text-xs text-muted-foreground">你的问题：</span>
            <span className="text-sm font-medium text-foreground">{record.question}</span>
          </div>
        </motion.div>
      )}

      {/* 牌阵布局 */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
      >
        <SpreadLayoutSection spread={spread} drawnCards={record.cards} />
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
          interpretation={record.interpretation ?? null}
          onInterpretationChange={handleInterpretationChange}
          isFavorite={record.isFavorite}
          onToggleFavorite={handleToggleFavorite}
        />
      </motion.div>

      {/* 追问对话区 */}
      {record.interpretation && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.35, ease: [0.16, 1, 0.3, 1] }}
          className="max-w-7xl mx-auto px-4 md:px-6"
        >
          <FollowUpChatSection
            historyContext={followUpContext}
            messages={record.interpretation.followUpChat}
            onMessagesChange={handleFollowUpMessagesChange}
          />
        </motion.div>
      )}
    </div>
  );
}
