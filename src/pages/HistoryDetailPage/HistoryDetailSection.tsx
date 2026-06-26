import { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Heart, Share2, ChevronDown, ChevronUp, Sparkles, MessageCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Image } from '@/components/ui/image';
import type { IReadingRecord, IDrawnCard, IChatMessage } from '@/types/tarot';
import { MOCK_TAROT_CARDS, getCardById } from '@/data/tarotCards';
import { MOCK_SPREADS } from '@/data/spreads';
import { callAiStream, hasAiConfig } from '@/lib/aiApi';

interface HistoryDetailSectionProps {
  record: IReadingRecord;
  onToggleFavorite: (id: string) => void;
}

export default function HistoryDetailSection({ record, onToggleFavorite }: HistoryDetailSectionProps) {
  const navigate = useNavigate();
  const [expandedCard, setExpandedCard] = useState<string | null>(null);
  const [showOverview, setShowOverview] = useState(true);
  const [showConclusion, setShowConclusion] = useState(true);
  const [showAdvice, setShowAdvice] = useState(true);
  const [showCardDetails, setShowCardDetails] = useState(true);
  const [followUpInput, setFollowUpInput] = useState('');
  const [followUpMessages, setFollowUpMessages] = useState<IChatMessage[]>(
    record.interpretation?.followUpChat ?? [],
  );
  const [isSendingFollowUp, setIsSendingFollowUp] = useState(false);

  const spread = MOCK_SPREADS.find((s) => s.id === record.spreadId);

  const styleLabel: Record<string, string> = {
    gentle: '温柔治愈风',
    rational: '理性分析风',
    traditional: '传统专业风',
  };

  const handleShare = () => {
    const text = `🔮 大爷塔罗 · ${record.spreadName}\n\n问题：${record.question || '未填写'}\n解读风格：${styleLabel[record.style] || record.style}\n\n${record.interpretation?.overview ?? ''}\n\n—— 来自大爷塔罗`;
    navigator.clipboard.writeText(text).then(() => {
      toast.success('已复制分享内容');
    }).catch(() => {
      toast.error('复制失败，请重试');
    });
  };

  const handleSendFollowUp = async () => {
    if (!followUpInput.trim() || isSendingFollowUp) return;
    if (!hasAiConfig()) {
      toast.error('请先在"我的-功能入口-AI接口"中配置 API');
      return;
    }
    const userMsg: IChatMessage = {
      role: 'user',
      content: followUpInput.trim(),
      timestamp: new Date().toISOString(),
    };
    const updated = [...followUpMessages, userMsg];
    setFollowUpMessages(updated);
    setFollowUpInput('');
    setIsSendingFollowUp(true);

    try {
      const historyContext = `牌阵：${record.spreadName}
问题：${record.question}
牌面：${record.cards.map((c) => {
  const card = getCardById(c.cardId);
  return `${c.positionName}: ${card?.nameCn ?? c.cardId} (${c.isReversed ? '逆' : '正'})`;
}).join('，')}
${record.interpretation ? `解读概述：${record.interpretation.overview}\n综合结论：${record.interpretation.conclusion}` : ''}`;

      const systemPrompt = '你是一位专业的韦特塔罗解读师，请基于用户的占卜背景和追问问题给出专业、温暖的回答。';

      const fullContent = await callAiStream(systemPrompt, `占卜背景：\n${historyContext}\n\n追问：${followUpInput.trim()}`, () => {});

      setFollowUpMessages((prev) => {
        const copy = [...prev];
        const last = copy[copy.length - 1];
        if (last && last.role === 'assistant') {
          copy[copy.length - 1] = { ...last, content: fullContent };
        } else {
          copy.push({
            role: 'assistant',
            content: fullContent,
            timestamp: new Date().toISOString(),
          });
        }
        return copy;
      });
    } catch {
      toast.error('追问失败，请稍后重试');
    } finally {
      setIsSendingFollowUp(false);
    }
  };

  const toggleCardExpand = (cardId: string) => {
    setExpandedCard((prev) => (prev === cardId ? null : cardId));
  };

  return (
    <div className="space-y-6">
      {/* 返回按钮 + 操作栏 */}
      <div className="flex items-center justify-between">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate(-1)}
          className="gap-1.5 text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="size-4" />
          返回
        </Button>
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onToggleFavorite(record.id)}
            className="gap-1.5"
          >
            <Heart
              className={`size-4 ${record.isFavorite ? 'fill-red-400 text-red-400' : 'text-muted-foreground'}`}
            />
            {record.isFavorite ? '已收藏' : '收藏'}
          </Button>
          <Button variant="ghost" size="sm" onClick={handleShare} className="gap-1.5">
            <Share2 className="size-4" />
            分享
          </Button>
        </div>
      </div>

      {/* 占卜信息卡片 */}
      <Card className="rounded-2xl border-border/40 shadow-sm">
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Sparkles className="size-4 text-primary" />
            <span>{record.spreadName}</span>
            <span>·</span>
            <span>{new Date(record.createdAt).toLocaleString('zh-CN')}</span>
          </div>
          {record.question && (
            <p className="mt-2 text-foreground font-medium">「{record.question}」</p>
          )}
          <div className="flex items-center gap-2 mt-2">
            <Badge variant="secondary" className="text-xs">
              {styleLabel[record.style] || record.style}
            </Badge>
            <Badge variant="outline" className="text-xs">
              {record.cards.length} 张牌
            </Badge>
          </div>
        </CardHeader>
      </Card>

      {/* 牌阵布局 */}
      <Card className="rounded-2xl border-border/40 shadow-sm">
        <CardHeader className="pb-2">
          <CardTitle className="text-base font-semibold">牌阵布局</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
            {record.cards.map((drawnCard: IDrawnCard, idx: number) => {
              const card = getCardById(drawnCard.cardId);
              const isExpanded = expandedCard === drawnCard.cardId;
              return (
                <motion.div
                  key={`${drawnCard.cardId}-${idx}`}
                  initial={{ opacity: 0, y: 16 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: idx * 0.06, ease: [0.16, 1, 0.3, 1] }}
                >
                  <Card
                    className={`rounded-xl border-border/40 shadow-sm cursor-pointer transition-all duration-300 hover:shadow-md ${
                      isExpanded ? 'ring-2 ring-primary/30' : ''
                    }`}
                    onClick={() => toggleCardExpand(drawnCard.cardId)}
                  >
                    <CardContent className="p-3">
                      {/* 牌面缩略 */}
                      <div
                        className={`w-full aspect-[3/4] rounded-lg mb-2 overflow-hidden border ${
                          drawnCard.isReversed ? 'rotate-180 border-warning/30' : 'border-border/40'
                        }`}
                      >
                        {card?.imageUrl ? (
                          <Image
                            src={card.imageUrl}
                            alt={card.nameCn}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className={`w-full h-full flex items-center justify-center text-2xl font-serif ${
                            drawnCard.isReversed ? 'bg-warning/10 text-warning' : 'bg-primary/10 text-primary'
                          }`}>
                            {card?.nameCn ?? drawnCard.cardId}
                          </div>
                        )}
                      </div>
                      {/* 牌名 */}
                      <p className="text-xs font-medium text-foreground text-center truncate">
                        {card?.nameCn ?? drawnCard.cardId}
                      </p>
                      {/* 位置名称 */}
                      <p className="text-[10px] text-muted-foreground text-center truncate">
                        {drawnCard.positionName}
                      </p>
                      {/* 正逆位标识 */}
                      <Badge
                        variant="outline"
                        className={`mt-0.5 w-full justify-center text-[10px] ${
                          drawnCard.isReversed
                            ? 'border-warning/40 text-warning'
                            : 'border-success/40 text-success'
                        }`}
                      >
                        {drawnCard.isReversed ? '逆位' : '正位'}
                      </Badge>

                      {/* 展开详情 */}
                      {isExpanded && card && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          transition={{ duration: 0.3 }}
                          className="mt-3 pt-3 border-t border-border/40 space-y-2"
                        >
                          <p className="text-xs font-medium text-foreground">
                            {card.nameCn} · {card.nameEn}
                          </p>
                          <div className="flex flex-wrap gap-1">
                            {(drawnCard.isReversed ? card.reversedKeywords : card.uprightKeywords).map(
                              (kw) => (
                                <Badge key={kw} variant="secondary" className="text-[10px]">
                                  {kw}
                                </Badge>
                              ),
                            )}
                          </div>
                          <p className="text-xs text-muted-foreground leading-relaxed">
                            {drawnCard.isReversed ? card.reversedMeaning : card.uprightMeaning}
                          </p>
                        </motion.div>
                      )}
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* AI 解读结果 */}
      {record.interpretation && (
        <Card className="rounded-2xl border-border/40 shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-semibold flex items-center gap-2">
              <Sparkles className="size-4 text-primary" />
              AI 解读
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* 牌面总览 */}
            <div>
              <button
                type="button"
                onClick={() => setShowOverview(!showOverview)}
                className="flex items-center justify-between w-full text-left py-2"
              >
                <span className="text-sm font-semibold text-foreground">📋 牌面总览</span>
                {showOverview ? (
                  <ChevronUp className="size-4 text-muted-foreground" />
                ) : (
                  <ChevronDown className="size-4 text-muted-foreground" />
                )}
              </button>
              {showOverview && (
                <motion.p
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  transition={{ duration: 0.3 }}
                  className="text-sm text-muted-foreground leading-relaxed whitespace-pre-line"
                >
                  {record.interpretation.overview}
                </motion.p>
              )}
            </div>

            <Separator />

            {/* 分牌解读 */}
            <div>
              <button
                type="button"
                onClick={() => setShowCardDetails(!showCardDetails)}
                className="flex items-center justify-between w-full text-left py-2"
              >
                <span className="text-sm font-semibold text-foreground">🃏 分牌详细解读</span>
                {showCardDetails ? (
                  <ChevronUp className="size-4 text-muted-foreground" />
                ) : (
                  <ChevronDown className="size-4 text-muted-foreground" />
                )}
              </button>
              {showCardDetails && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  transition={{ duration: 0.3 }}
                  className="space-y-3 mt-2"
                >
                  {record.interpretation.cardDetails.map((cd) => {
                    const card = getCardById(cd.cardId);
                    return (
                      <div
                        key={cd.cardId}
                        className="p-3 rounded-xl bg-muted/40 border border-border/30"
                      >
                        <p className="text-sm font-medium text-foreground">
                          {cd.positionName} — {card?.nameCn ?? cd.cardId}
                        </p>
                        <p className="text-xs text-muted-foreground leading-relaxed mt-1 whitespace-pre-line">
                          {cd.content}
                        </p>
                      </div>
                    );
                  })}
                </motion.div>
              )}
            </div>

            <Separator />

            {/* 综合结论 */}
            <div>
              <button
                type="button"
                onClick={() => setShowConclusion(!showConclusion)}
                className="flex items-center justify-between w-full text-left py-2"
              >
                <span className="text-sm font-semibold text-foreground">🔮 综合结论</span>
                {showConclusion ? (
                  <ChevronUp className="size-4 text-muted-foreground" />
                ) : (
                  <ChevronDown className="size-4 text-muted-foreground" />
                )}
              </button>
              {showConclusion && (
                <motion.p
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  transition={{ duration: 0.3 }}
                  className="text-sm text-muted-foreground leading-relaxed whitespace-pre-line"
                >
                  {record.interpretation.conclusion}
                </motion.p>
              )}
            </div>

            <Separator />

            {/* 行动建议 */}
            <div>
              <button
                type="button"
                onClick={() => setShowAdvice(!showAdvice)}
                className="flex items-center justify-between w-full text-left py-2"
              >
                <span className="text-sm font-semibold text-foreground">💡 行动建议</span>
                {showAdvice ? (
                  <ChevronUp className="size-4 text-muted-foreground" />
                ) : (
                  <ChevronDown className="size-4 text-muted-foreground" />
                )}
              </button>
              {showAdvice && (
                <motion.p
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  transition={{ duration: 0.3 }}
                  className="text-sm text-muted-foreground leading-relaxed whitespace-pre-line"
                >
                  {record.interpretation.advice}
                </motion.p>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* 追问对话区 */}
      <Card className="rounded-2xl border-border/40 shadow-sm">
        <CardHeader className="pb-2">
          <CardTitle className="text-base font-semibold flex items-center gap-2">
            <MessageCircle className="size-4 text-primary" />
            追问交流
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* 对话历史 */}
          {followUpMessages.length > 0 && (
            <div className="space-y-3 max-h-80 overflow-y-auto">
              {followUpMessages.map((msg, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                  className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[80%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${
                      msg.role === 'user'
                        ? 'bg-primary text-primary-foreground rounded-br-md'
                        : 'bg-muted text-foreground rounded-bl-md'
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
                </motion.div>
              ))}
            </div>
          )}

          {/* 追问输入 */}
          <div className="flex gap-2">
            <Textarea
              value={followUpInput}
              onChange={(e) => setFollowUpInput(e.target.value)}
              placeholder="针对解读结果继续提问..."
              className="min-h-10 resize-none rounded-xl text-sm"
              rows={2}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSendFollowUp();
                }
              }}
            />
            <Button
              size="sm"
              onClick={handleSendFollowUp}
              disabled={!followUpInput.trim() || isSendingFollowUp}
              className="shrink-0 self-end rounded-xl"
            >
              {isSendingFollowUp ? '发送中...' : '发送'}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
