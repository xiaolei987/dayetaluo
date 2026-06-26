import { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { User, Settings, Info, Heart, Sparkles, Edit3, Check, X, Star, ChevronRight, Clock, Trash2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { scopedStorage } from '@lark-apaas/client-toolkit-lite';
import type { IUserProfile, IReadingRecord } from '@/types/tarot';
import { Image } from '@/components/ui/image';

const STORAGE_KEY_PROFILE = '__tarot_userProfile';
const STORAGE_KEY_READINGS = '__tarot_readings';
const STORAGE_KEY_FAVORITES = '__tarot_favorites';

function getStoredProfile(): IUserProfile {
  try {
    const raw = scopedStorage.getItem(STORAGE_KEY_PROFILE);
    if (raw) return JSON.parse(raw) as IUserProfile;
  } catch { /* ignore */ }
  return { nickname: '塔罗探索者' };
}

function getStoredReadings(): IReadingRecord[] {
  try {
    const raw = scopedStorage.getItem(STORAGE_KEY_READINGS);
    if (raw) return JSON.parse(raw) as IReadingRecord[];
  } catch { /* ignore */ }
  return [];
}

function getStoredFavorites(): string[] {
  try {
    const raw = scopedStorage.getItem(STORAGE_KEY_FAVORITES);
    if (raw) return JSON.parse(raw) as string[];
  } catch { /* ignore */ }
  return [];
}

export default function ProfilePage() {
  const navigate = useNavigate();

  const [profile, setProfile] = useState<IUserProfile>(getStoredProfile);
  const [readings, setReadings] = useState<IReadingRecord[]>(getStoredReadings);
  const [favoriteIds, setFavoriteIds] = useState<string[]>(getStoredFavorites);

  const [editingNickname, setEditingNickname] = useState(false);
  const [nicknameDraft, setNicknameDraft] = useState(profile.nickname);

  // 统计数据
  const stats = useMemo(() => {
    const totalReadings = readings.length;
    const totalFavorites = favoriteIds.length;
    const thisMonth = new Date().getMonth();
    const thisYear = new Date().getFullYear();
    const monthlyReadings = readings.filter((r) => {
      const d = new Date(r.createdAt);
      return d.getMonth() === thisMonth && d.getFullYear() === thisYear;
    }).length;
    return { totalReadings, totalFavorites, monthlyReadings };
  }, [readings, favoriteIds]);

  // 收藏的占卜记录
  const favoriteReadings = useMemo(
    () => readings.filter((r) => favoriteIds.includes(r.id)).slice(0, 5),
    [readings, favoriteIds],
  );

  // 最近占卜
  const recentReadings = useMemo(() => readings.slice(0, 3), [readings]);

  const [settingsOpen, setSettingsOpen] = useState(false);

  // 保存昵称
  const handleSaveNickname = () => {
    const trimmed = nicknameDraft.trim();
    if (!trimmed) {
      toast.error('昵称不能为空');
      return;
    }
    const updated: IUserProfile = { ...profile, nickname: trimmed };
    setProfile(updated);
    scopedStorage.setItem(STORAGE_KEY_PROFILE, JSON.stringify(updated));
    setEditingNickname(false);
    toast.success('昵称已更新');
  };

  // 刷新数据
  useEffect(() => {
    setReadings(getStoredReadings());
    setFavoriteIds(getStoredFavorites());
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <main className="space-y-8 md:space-y-12">
        {/* ===== 用户信息区 ===== */}
        <section className="w-full pt-8 md:pt-12">
          <div className="max-w-2xl mx-auto px-4 md:px-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
            >
              <Card className="rounded-2xl border-border/50 bg-card/80 shadow-sm">
                <CardContent className="p-6">
                  <div className="flex items-center gap-4">
                    {/* 头像 */}
                    <div className="size-16 rounded-full bg-primary/15 flex items-center justify-center shrink-0">
                      {profile.avatar ? (
                        <Image
                          src={profile.avatar}
                          alt={profile.nickname}
                          className="size-16 rounded-full object-cover"
                        />
                      ) : (
                        <User className="size-7 text-primary" />
                      )}
                    </div>

                    {/* 昵称区 */}
                    <div className="flex-1 min-w-0">
                      {editingNickname ? (
                        <div className="flex items-center gap-2">
                          <Input
                            value={nicknameDraft}
                            onChange={(e) => setNicknameDraft(e.target.value)}
                            className="h-9 text-base font-semibold max-w-[180px]"
                            autoFocus
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') handleSaveNickname();
                              if (e.key === 'Escape') {
                                setEditingNickname(false);
                                setNicknameDraft(profile.nickname);
                              }
                            }}
                          />
                          <Button
                            size="icon"
                            variant="ghost"
                            className="size-8"
                            onClick={handleSaveNickname}
                          >
                            <Check className="size-4 text-success" />
                          </Button>
                          <Button
                            size="icon"
                            variant="ghost"
                            className="size-8"
                            onClick={() => {
                              setEditingNickname(false);
                              setNicknameDraft(profile.nickname);
                            }}
                          >
                            <X className="size-4 text-muted-foreground" />
                          </Button>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2">
                          <h2 className="text-lg font-semibold text-foreground truncate">
                            {profile.nickname}
                          </h2>
                          <Button
                            size="icon"
                            variant="ghost"
                            className="size-7"
                            onClick={() => {
                              setEditingNickname(true);
                              setNicknameDraft(profile.nickname);
                            }}
                          >
                            <Edit3 className="size-3.5 text-muted-foreground" />
                          </Button>
                        </div>
                      )}
                      <p className="text-xs text-muted-foreground mt-0.5">
                        塔罗探索者 · 聆听内心的声音
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </section>

        {/* ===== 统计数据区 ===== */}
        <section className="w-full">
          <div className="max-w-2xl mx-auto px-4 md:px-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
              className="grid grid-cols-3 gap-3"
            >
              {/* 累计占卜 */}
              <Card className="rounded-2xl border-border/50 bg-card/80 shadow-sm">
                <CardContent className="p-4 text-center">
                  <Sparkles className="size-5 text-primary mx-auto mb-1.5" />
                  <div className="text-2xl font-bold tabular-nums text-foreground">
                    {stats.totalReadings}
                  </div>
                  <div className="text-xs text-muted-foreground mt-0.5">累计占卜</div>
                </CardContent>
              </Card>

              {/* 本月占卜 */}
              <Card className="rounded-2xl border-border/50 bg-card/80 shadow-sm">
                <CardContent className="p-4 text-center">
                  <Clock className="size-5 text-accent-foreground mx-auto mb-1.5" />
                  <div className="text-2xl font-bold tabular-nums text-foreground">
                    {stats.monthlyReadings}
                  </div>
                  <div className="text-xs text-muted-foreground mt-0.5">本月占卜</div>
                </CardContent>
              </Card>

              {/* 收藏数 */}
              <Card className="rounded-2xl border-border/50 bg-card/80 shadow-sm">
                <CardContent className="p-4 text-center">
                  <Heart className="size-5 text-destructive mx-auto mb-1.5" />
                  <div className="text-2xl font-bold tabular-nums text-foreground">
                    {stats.totalFavorites}
                  </div>
                  <div className="text-xs text-muted-foreground mt-0.5">我的收藏</div>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </section>

        {/* ===== 功能入口区 ===== */}
        <section className="w-full">
          <div className="max-w-2xl mx-auto px-4 md:px-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
            >
              <Card className="rounded-2xl border-border/50 bg-card/80 shadow-sm">
                <CardHeader className="pb-2">
                  <CardTitle className="text-base font-semibold">功能入口</CardTitle>
                </CardHeader>
                <CardContent className="space-y-0.5">
                  {/* 我的收藏 */}
                  <button
                    type="button"
                    onClick={() => navigate('/history')}
                    className="w-full flex items-center justify-between px-3 py-3 rounded-xl hover:bg-muted/60 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <Heart className="size-4 text-destructive" />
                      <span className="text-sm text-foreground">我的收藏</span>
                      {stats.totalFavorites > 0 && (
                        <Badge variant="secondary" className="text-xs">
                          {stats.totalFavorites}
                        </Badge>
                      )}
                    </div>
                    <ChevronRight className="size-4 text-muted-foreground" />
                  </button>

                  {/* 占卜历史 */}
                  <button
                    type="button"
                    onClick={() => navigate('/history')}
                    className="w-full flex items-center justify-between px-3 py-3 rounded-xl hover:bg-muted/60 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <Clock className="size-4 text-muted-foreground" />
                      <span className="text-sm text-foreground">占卜历史</span>
                    </div>
                    <ChevronRight className="size-4 text-muted-foreground" />
                  </button>

                  {/* 设置 */}
                  <Dialog open={settingsOpen} onOpenChange={setSettingsOpen}>
                    <DialogTrigger asChild>
                      <button
                        type="button"
                        className="w-full flex items-center justify-between px-3 py-3 rounded-xl hover:bg-muted/60 transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          <Settings className="size-4 text-muted-foreground" />
                          <span className="text-sm text-foreground">设置</span>
                        </div>
                        <ChevronRight className="size-4 text-muted-foreground" />
                      </button>
                    </DialogTrigger>
                    <DialogContent className="rounded-2xl max-w-sm">
                      <DialogHeader>
                        <DialogTitle>设置</DialogTitle>
                        <DialogDescription>管理你的应用偏好和数据</DialogDescription>
                      </DialogHeader>
                      <div className="space-y-4 py-2">
                        <div className="space-y-2">
                          <label className="text-sm font-medium text-foreground">昵称</label>
                          <Input
                            value={nicknameDraft}
                            onChange={(e) => setNicknameDraft(e.target.value)}
                            className="rounded-xl"
                          />
                        </div>
                        <Button
                          variant="destructive"
                          size="sm"
                          className="w-full rounded-xl gap-2"
                          onClick={() => {
                            scopedStorage.removeItem(STORAGE_KEY_READINGS);
                            scopedStorage.removeItem(STORAGE_KEY_FAVORITES);
                            setReadings([]);
                            setFavoriteIds([]);
                            setSettingsOpen(false);
                            toast.success('数据已清除');
                          }}
                        >
                          <Trash2 className="size-4" />
                          清除所有占卜数据
                        </Button>
                      </div>
                      <DialogFooter>
                        <Button
                          variant="outline"
                          className="rounded-xl"
                          onClick={() => setSettingsOpen(false)}
                        >
                          取消
                        </Button>
                        <Button
                          className="rounded-xl"
                          onClick={() => {
                            handleSaveNickname();
                            setSettingsOpen(false);
                          }}
                        >
                          保存
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>

                  {/* 关于 */}
                  <button
                    type="button"
                    onClick={() => toast.info('大爷塔罗 v1.0 · 仅供娱乐参考')}
                    className="w-full flex items-center justify-between px-3 py-3 rounded-xl hover:bg-muted/60 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <Info className="size-4 text-muted-foreground" />
                      <span className="text-sm text-foreground">关于</span>
                    </div>
                    <ChevronRight className="size-4 text-muted-foreground" />
                  </button>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </section>

        {/* ===== 收藏列表区 ===== */}
        {favoriteReadings.length > 0 && (
          <section className="w-full">
            <div className="max-w-2xl mx-auto px-4 md:px-6">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
              >
                <Card className="rounded-2xl border-border/50 bg-card/80 shadow-sm">
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-base font-semibold flex items-center gap-2">
                        <Star className="size-4 text-warning" />
                        收藏的解读
                      </CardTitle>
                      {favoriteReadings.length > 5 && (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-xs text-muted-foreground"
                          onClick={() => navigate('/history')}
                        >
                          查看全部
                        </Button>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    {favoriteReadings.map((record, i) => (
                      <motion.button
                        key={record.id}
                        type="button"
                        initial={{ opacity: 0, x: -12 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.4, delay: i * 0.06 }}
                        onClick={() => navigate(`/history/${record.id}`)}
                        className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-muted/60 transition-colors text-left"
                      >
                        {/* 牌阵图标 */}
                        <div className="size-9 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                          <Sparkles className="size-4 text-primary" />
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-medium text-foreground truncate">
                              {record.spreadName}
                            </span>
                            <Badge variant="outline" className="text-[10px] px-1.5 py-0 shrink-0">
                              {record.style === 'gentle'
                                ? '温柔治愈'
                                : record.style === 'rational'
                                  ? '理性分析'
                                  : '传统专业'}
                            </Badge>
                          </div>
                          <p className="text-xs text-muted-foreground truncate mt-0.5">
                            {record.question || '未填写问题'}
                          </p>
                        </div>

                        <ChevronRight className="size-4 text-muted-foreground shrink-0" />
                      </motion.button>
                    ))}
                  </CardContent>
                </Card>
              </motion.div>
            </div>
          </section>
        )}

        {/* ===== 最近占卜区 ===== */}
        {recentReadings.length > 0 && (
          <section className="w-full pb-12">
            <div className="max-w-2xl mx-auto px-4 md:px-6">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.25, ease: [0.16, 1, 0.3, 1] }}
              >
                <Card className="rounded-2xl border-border/50 bg-card/80 shadow-sm">
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-base font-semibold flex items-center gap-2">
                        <Clock className="size-4 text-muted-foreground" />
                        最近占卜
                      </CardTitle>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-xs text-muted-foreground"
                        onClick={() => navigate('/history')}
                      >
                        查看全部
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    {recentReadings.map((record, i) => (
                      <motion.button
                        key={record.id}
                        type="button"
                        initial={{ opacity: 0, x: -12 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.4, delay: i * 0.06 }}
                        onClick={() => navigate(`/history/${record.id}`)}
                        className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-muted/60 transition-colors text-left"
                      >
                        <div className="size-9 rounded-lg bg-muted flex items-center justify-center shrink-0">
                          <Sparkles className="size-4 text-muted-foreground" />
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-medium text-foreground truncate">
                              {record.spreadName}
                            </span>
                            {record.isFavorite && (
                              <Heart className="size-3 text-destructive shrink-0 fill-destructive" />
                            )}
                          </div>
                          <p className="text-xs text-muted-foreground truncate mt-0.5">
                            {record.question || '未填写问题'}
                          </p>
                        </div>

                        <span className="text-[11px] text-muted-foreground shrink-0">
                          {formatRelativeTime(record.createdAt)}
                        </span>
                      </motion.button>
                    ))}
                  </CardContent>
                </Card>
              </motion.div>
            </div>
          </section>
        )}

        {/* ===== 空状态 ===== */}
        {readings.length === 0 && (
          <section className="w-full pb-12">
            <div className="max-w-2xl mx-auto px-4 md:px-6">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="text-center py-12"
              >
                <div className="size-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                  <Sparkles className="size-7 text-primary" />
                </div>
                <h3 className="text-base font-semibold text-foreground mb-1">
                  还没有占卜记录
                </h3>
                <p className="text-sm text-muted-foreground mb-5">
                  开始你的第一次塔罗占卜吧
                </p>
                <Button
                  variant="outline"
                  className="rounded-xl"
                  onClick={() => navigate('/')}
                >
                  <Sparkles className="size-4" />
                  去首页选择牌阵
                </Button>
              </motion.div>
            </div>
          </section>
        )}
      </main>
    </div>
  );
}

/** 格式化相对时间 */
function formatRelativeTime(isoString: string): string {
  const now = Date.now();
  const then = new Date(isoString).getTime();
  const diffMs = now - then;
  const diffMin = Math.floor(diffMs / 60000);
  const diffHour = Math.floor(diffMs / 3600000);
  const diffDay = Math.floor(diffMs / 86400000);

  if (diffMin < 1) return '刚刚';
  if (diffMin < 60) return `${diffMin}分钟前`;
  if (diffHour < 24) return `${diffHour}小时前`;
  if (diffDay < 7) return `${diffDay}天前`;
  if (diffDay < 30) return `${Math.floor(diffDay / 7)}周前`;
  return `${Math.floor(diffDay / 30)}月前`;
}
