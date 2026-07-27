/**
 * 历史占卜详情页 — 路由 /history/:readingId
 * 
 * ⚠️ AI 解读渲染在此文件中内联完成（非 HistoryDetailSection.tsx）。
 * HistoryDetailSection.tsx 已废弃，不被任何文件导入。
 * 新增/修改 AI 解读模块时，请直接修改本文件内的 interpretation 渲染区。
 */
import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Share2, Heart, Download, Copy, Check } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { resolveAppUrl } from '@lark-apaas/client-toolkit-lite';
import type { IReadingRecord } from '@/types/tarot';
import { MOCK_TAROT_CARDS } from '@/data/tarotCards';
import { MOCK_SPREADS } from '@/data/spreads';
import { findReading, toggleFavorite, syncReadingFavorite } from '@/lib/storage';
import SpreadLayoutSection from '@/pages/ResultPage/SpreadLayoutSection';

const STYLE_LABELS: Record<string, string> = {
  gentle: '温柔治愈风',
  rational: '理性分析风',
  traditional: '传统专业风',
};

export default function HistoryDetailPage() {
  const { readingId } = useParams<{ readingId: string }>();
  const navigate = useNavigate();

  const [reading, setReading] = useState<IReadingRecord | null>(null);
  const [isFavorite, setIsFavorite] = useState(false);
  const [copied, setCopied] = useState(false);
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    overview: true,
    cardDetails: false,
    energyFlow: false,
    positionAnalysis: false,
    coreConflict: false,
    conclusion: false,
    advice: false,
  });

  useEffect(() => {
    if (!readingId) {
      navigate('/history', { replace: true });
      return;
    }
    const record = findReading(readingId);
    if (!record) {
      toast.error('未找到该占卜记录');
      navigate('/history', { replace: true });
      return;
    }
    setReading(record);
    setIsFavorite(record.isFavorite);
  }, [readingId, navigate]);

  const handleToggleFavorite = useCallback(() => {
    if (!readingId) return;
    const newFav = toggleFavorite(readingId);
    setIsFavorite(newFav);
    syncReadingFavorite(readingId, newFav);
    toast.success(newFav ? '已收藏' : '已取消收藏');
  }, [readingId]);

  const handleShare = useCallback(async () => {
    if (!reading) return;
    const shareUrl = resolveAppUrl(`/history/${reading.id}`);
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      toast.success('链接已复制到剪贴板');
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error('复制失败，请手动复制');
    }
  }, [reading]);

  const handleDownloadCard = useCallback(() => {
    if (!reading) return;
    const canvas = document.createElement('canvas');
    canvas.width = 750;
    canvas.height = 1334;
    const ctx = canvas.getContext('2d');
    if (!ctx) {
      toast.error('生成失败，请重试');
      return;
    }

    // 背景
    const bgGrad = ctx.createLinearGradient(0, 0, 0, 1334);
    bgGrad.addColorStop(0, '#FAF8F5');
    bgGrad.addColorStop(1, '#F5F0EB');
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, 750, 1334);

    // 顶部装饰条
    const topGrad = ctx.createLinearGradient(0, 0, 750, 0);
    topGrad.addColorStop(0, '#9B8AC4');
    topGrad.addColorStop(1, '#7B68A8');
    ctx.fillStyle = topGrad;
    ctx.fillRect(0, 0, 750, 8);

    // 标题
    ctx.fillStyle = '#4A4A4A';
    ctx.font = 'bold 42px "Noto Serif SC", serif';
    ctx.textAlign = 'center';
    ctx.fillText('🔮 大爷塔罗', 375, 80);

    // 牌阵名称
    ctx.font = 'bold 32px "Noto Sans SC", sans-serif';
    ctx.fillStyle = '#7B68A8';
    ctx.fillText(reading.spreadName, 375, 140);

    // 问题
    if (reading.question) {
      ctx.font = '22px "Noto Sans SC", sans-serif';
      ctx.fillStyle = '#7A7A7A';
      const q = reading.question.length > 28 ? reading.question.slice(0, 28) + '...' : reading.question;
      ctx.fillText(`「${q}」`, 375, 190);
    }

    // 分隔线
    ctx.strokeStyle = '#E8D5B7';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(150, 230);
    ctx.lineTo(600, 230);
    ctx.stroke();

    // 卡牌列表
    let y = 280;
    reading.cards.forEach((dc) => {
      const card = MOCK_TAROT_CARDS.find((c) => c.id === dc.cardId);
      const name = card?.nameCn ?? dc.cardId;
      const dir = dc.isReversed ? '逆位' : '正位';
      const dirColor = dc.isReversed ? '#E5B896' : '#A8C5A0';

      // 位置名
      ctx.font = '18px "Noto Sans SC", sans-serif';
      ctx.fillStyle = '#B0B0B0';
      ctx.textAlign = 'left';
      ctx.fillText(dc.positionName, 100, y);

      // 牌名
      ctx.font = 'bold 24px "Noto Serif SC", serif';
      ctx.fillStyle = '#4A4A4A';
      ctx.fillText(name, 100, y + 34);

      // 正逆位标签
      ctx.font = '18px "Noto Sans SC", sans-serif';
      ctx.fillStyle = dirColor;
      ctx.textAlign = 'right';
      ctx.fillText(dir, 650, y + 20);
      ctx.textAlign = 'left';

      y += 80;
    });

    // 底部
    ctx.fillStyle = '#B0B0B0';
    ctx.font = '18px "Noto Sans SC", sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('— 大爷塔罗 · 仅供娱乐参考 —', 375, 1280);

    // 下载
    canvas.toBlob((blob) => {
      if (!blob) {
        toast.error('生成失败');
        return;
      }
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `大爷塔罗_${reading.spreadName}_${new Date().toLocaleDateString('zh-CN')}.png`;
      a.click();
      URL.revokeObjectURL(url);
      toast.success('分享卡片已保存');
    }, 'image/png');
  }, [reading]);

  const toggleSection = (key: string) => {
    setExpandedSections((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  if (!reading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <p className="text-muted-foreground text-sm">加载中...</p>
      </div>
    );
  }

  const spread = MOCK_SPREADS.find((s) => s.id === reading.spreadId);
  const interpretation = reading.interpretation;

  return (
    <div className="min-h-screen bg-background">
      <main className="max-w-3xl mx-auto px-4 md:px-6 py-8 space-y-8">
        {/* 顶部导航栏 */}
        <motion.div
          initial={{ opacity: 0, y: -12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="flex items-center justify-between"
        >
          <Button
            variant="ghost"
            size="sm"
            className="gap-1.5 text-muted-foreground hover:text-foreground"
            onClick={() => navigate(-1)}
          >
            <ArrowLeft className="size-4" />
            返回
          </Button>

          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              className="gap-1.5"
              onClick={handleToggleFavorite}
            >
              <Heart
                className={`size-4 ${isFavorite ? 'fill-red-400 text-red-400' : 'text-muted-foreground'}`}
              />
              {isFavorite ? '已收藏' : '收藏'}
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="gap-1.5"
              onClick={handleShare}
            >
              {copied ? (
                <Check className="size-4 text-success" />
              ) : (
                <Share2 className="size-4" />
              )}
              分享
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="gap-1.5"
              onClick={handleDownloadCard}
            >
              <Download className="size-4" />
              保存卡片
            </Button>
          </div>
        </motion.div>

        {/* 占卜信息头 */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <Card className="rounded-2xl border-border/50 shadow-sm">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <div>
                  <CardTitle className="text-xl font-semibold">
                    {reading.spreadName}
                  </CardTitle>
                  <CardDescription className="mt-1 text-sm">
                    {spread?.scenario ?? ''}
                  </CardDescription>
                </div>
                <Badge variant="secondary" className="text-xs">
                  {STYLE_LABELS[reading.style] ?? reading.style}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              {reading.question && (
                <div className="bg-muted/50 rounded-xl px-4 py-3">
                  <p className="text-xs text-muted-foreground mb-1">你的问题</p>
                  <p className="text-sm text-foreground">{reading.question}</p>
                </div>
              )}
              <div className="flex items-center gap-4 text-xs text-muted-foreground">
                <span>
                  {new Date(reading.createdAt).toLocaleString('zh-CN', {
                    year: 'numeric',
                    month: '2-digit',
                    day: '2-digit',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </span>
                <span>{reading.cards.length} 张牌</span>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* 牌阵布局 */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <Card className="rounded-2xl border-border/50 shadow-sm overflow-hidden">
            <CardHeader className="pb-2">
              <CardTitle className="text-base font-semibold">牌阵布局</CardTitle>
            </CardHeader>
            <CardContent className="p-0 sm:p-1">
              {spread ? (
                <SpreadLayoutSection
                  spread={spread}
                  drawnCards={reading.cards}
                  questionType={reading.questionType || undefined}
                />
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 p-4">
                  {reading.cards.map((dc) => {
                    const card = MOCK_TAROT_CARDS.find((c) => c.id === dc.cardId);
                    return (
                      <div
                        key={`${dc.cardId}-${dc.positionName}`}
                        className={`rounded-xl border p-3 space-y-1.5 ${
                          dc.isReversed
                            ? 'border-warning/30 bg-warning/5'
                            : 'border-success/30 bg-success/5'
                        }`}
                      >
                        <p className="text-xs font-medium text-muted-foreground truncate">
                          {dc.positionName}
                        </p>
                        <p className="text-sm font-semibold text-foreground truncate">
                          {card?.nameCn ?? dc.cardId}
                        </p>
                        <Badge
                          variant={dc.isReversed ? 'outline' : 'secondary'}
                          className={`text-[10px] px-1.5 py-0 h-5 ${
                            dc.isReversed
                              ? 'border-warning/50 text-warning'
                              : 'border-success/50 text-success'
                          }`}
                        >
                          {dc.isReversed ? '逆位' : '正位'}
                        </Badge>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* AI 解读结果 */}
        {interpretation && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="space-y-4"
          >
            <h3 className="text-lg font-semibold text-foreground">AI 解读</h3>

            {/* 牌面总览 */}
            <Card className="rounded-2xl border-border/50 shadow-sm">
              <button
                type="button"
                className="w-full text-left"
                onClick={() => toggleSection('overview')}
              >
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-base font-semibold">牌面总览</CardTitle>
                    <span className="text-xs text-muted-foreground">
                      {expandedSections.overview ? '收起' : '展开'}
                    </span>
                  </div>
                </CardHeader>
              </button>
              {expandedSections.overview && (
                <CardContent>
                  <p className="text-sm text-foreground leading-relaxed whitespace-pre-line">
                    {interpretation.overview}
                  </p>
                </CardContent>
              )}
            </Card>

            {/* 分牌详细解读 */}
            <Card className="rounded-2xl border-border/50 shadow-sm">
              <button
                type="button"
                className="w-full text-left"
                onClick={() => toggleSection('cardDetails')}
              >
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-base font-semibold">分牌解读</CardTitle>
                    <span className="text-xs text-muted-foreground">
                      {expandedSections.cardDetails ? '收起' : '展开'}
                    </span>
                  </div>
                </CardHeader>
              </button>
              {expandedSections.cardDetails && (
                <CardContent className="space-y-4">
                  {interpretation.cardDetails.map((cd) => {
                    const card = MOCK_TAROT_CARDS.find((c) => c.id === cd.cardId);
                    const dc = reading.cards.find((d) => d.cardId === cd.cardId);
                    return (
                      <div key={cd.cardId} className="space-y-1.5">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-semibold text-foreground">
                            {card?.nameCn ?? cd.cardId}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            · {cd.positionName}
                          </span>
                          {dc && (
                            <Badge
                              variant={dc.isReversed ? 'outline' : 'secondary'}
                              className={`text-[10px] px-1.5 py-0 h-5 ${
                                dc.isReversed
                                  ? 'border-warning/50 text-warning'
                                  : 'border-success/50 text-success'
                              }`}
                            >
                              {dc.isReversed ? '逆位' : '正位'}
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-foreground/80 leading-relaxed whitespace-pre-line">
                          {cd.content}
                        </p>
                        <Separator className="mt-3 last:hidden" />
                      </div>
                    );
                  })}
                </CardContent>
              )}
            </Card>

            {/* 综合结论 */}
            <Card className="rounded-2xl border-border/50 shadow-sm">
              <button
                type="button"
                className="w-full text-left"
                onClick={() => toggleSection('conclusion')}
              >
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-base font-semibold">综合结论</CardTitle>
                    <span className="text-xs text-muted-foreground">
                      {expandedSections.conclusion ? '收起' : '展开'}
                    </span>
                  </div>
                </CardHeader>
              </button>
              {expandedSections.conclusion && (
                <CardContent>
                  <p className="text-sm text-foreground leading-relaxed whitespace-pre-line">
                    {interpretation.conclusion}
                  </p>
                </CardContent>
              )}
            </Card>

            {/* 行动建议 */}
            <Card className="rounded-2xl border-border/50 shadow-sm">
              <button
                type="button"
                className="w-full text-left"
                onClick={() => toggleSection('advice')}
              >
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-base font-semibold">行动建议</CardTitle>
                    <span className="text-xs text-muted-foreground">
                      {expandedSections.advice ? '收起' : '展开'}
                    </span>
                  </div>
                </CardHeader>
              </button>
              {expandedSections.advice && (
                <CardContent>
                  <p className="text-sm text-foreground leading-relaxed whitespace-pre-line">
                    {interpretation.advice}
                  </p>
                </CardContent>
              )}
            </Card>

            {/* 🌊 能量流动 */}
            {interpretation.energyFlow ? (
              <Card className="rounded-2xl border-border/50 shadow-sm">
                <CardHeader
                  className="cursor-pointer hover:bg-muted/30 transition-colors rounded-2xl"
                  onClick={() => setExpandedSections(prev => ({ ...prev, energyFlow: !prev.energyFlow }))}
                >
                  <CardTitle className="text-base font-semibold flex items-center gap-2">
                     🌊 能量流动
                    <span className="ml-auto text-xs text-muted-foreground">
                      {expandedSections.energyFlow ? '收起' : '展开'}
                    </span>
                  </CardTitle>
                </CardHeader>
                {expandedSections.energyFlow && (
                  <CardContent>
                    <p className="text-sm text-foreground leading-relaxed whitespace-pre-line">
                      {interpretation.energyFlow}
                    </p>
                  </CardContent>
                )}
              </Card>
            ) : null}

            {/* 📍 牌阵宫位精析 */}
            {interpretation.positionAnalysis ? (
              <Card className="rounded-2xl border-border/50 shadow-sm">
                <CardHeader
                  className="cursor-pointer hover:bg-muted/30 transition-colors rounded-2xl"
                  onClick={() => setExpandedSections(prev => ({ ...prev, positionAnalysis: !prev.positionAnalysis }))}
                >
                  <CardTitle className="text-base font-semibold flex items-center gap-2">
                     📍 牌阵宫位精析
                    <span className="ml-auto text-xs text-muted-foreground">
                      {expandedSections.positionAnalysis ? '收起' : '展开'}
                    </span>
                  </CardTitle>
                </CardHeader>
                {expandedSections.positionAnalysis && (
                  <CardContent>
                    <p className="text-sm text-foreground leading-relaxed whitespace-pre-line">
                      {interpretation.positionAnalysis}
                    </p>
                  </CardContent>
                )}
              </Card>
            ) : null}

            {/* ⚡ 核心冲突与转化 */}
            {interpretation.coreConflict ? (
              <Card className="rounded-2xl border-border/50 shadow-sm">
                <CardHeader
                  className="cursor-pointer hover:bg-muted/30 transition-colors rounded-2xl"
                  onClick={() => setExpandedSections(prev => ({ ...prev, coreConflict: !prev.coreConflict }))}
                >
                  <CardTitle className="text-base font-semibold flex items-center gap-2">
                     ⚡ 核心冲突与转化
                    <span className="ml-auto text-xs text-muted-foreground">
                      {expandedSections.coreConflict ? '收起' : '展开'}
                    </span>
                  </CardTitle>
                </CardHeader>
                {expandedSections.coreConflict && (
                  <CardContent>
                    <p className="text-sm text-foreground leading-relaxed whitespace-pre-line">
                      {interpretation.coreConflict}
                    </p>
                  </CardContent>
                )}
              </Card>
            ) : null}

            {/* 追问对话历史 */}
            {interpretation.followUpChat.length > 0 && (
              <Card className="rounded-2xl border-border/50 shadow-sm">
                <CardHeader className="pb-3">
                  <CardTitle className="text-base font-semibold">追问记录</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {interpretation.followUpChat.map((msg, idx) => (
                    <div
                      key={idx}
                      className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`max-w-[80%] rounded-2xl px-4 py-2.5 text-sm ${
                          msg.role === 'user'
                            ? 'bg-primary text-primary-foreground'
                            : 'bg-muted text-foreground'
                        }`}
                      >
                        <p className="whitespace-pre-line">{msg.content}</p>
                        <p className="text-[10px] opacity-60 mt-1">
                          {new Date(msg.timestamp).toLocaleTimeString('zh-CN', {
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </p>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}
          </motion.div>
        )}

        {/* 无解读时的空状态 */}
        {!interpretation && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.4, delay: 0.3 }}
            className="text-center py-12"
          >
            <p className="text-sm text-muted-foreground">该记录暂无 AI 解读</p>
          </motion.div>
        )}
      </main>
    </div>
  );
}
