import { useState, type FormEvent } from 'react';
import { motion } from 'framer-motion';
import { User, Pencil, Check, X, Camera } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { toast } from 'sonner';
import type { IUserProfile } from '@/types/tarot';
import { loadUserProfile, saveUserProfile } from '@/lib/storage';

export default function ProfileInfoSection() {
  const [profile, setProfile] = useState<IUserProfile>(() => loadUserProfile() || { nickname: '塔罗探索者' });
  const [editing, setEditing] = useState(false);
  const [draftNickname, setDraftNickname] = useState(profile.nickname);
  const [draftAvatar, setDraftAvatar] = useState(profile.avatar ?? '');

  const handleStartEdit = () => {
    setDraftNickname(profile.nickname);
    setDraftAvatar(profile.avatar ?? '');
    setEditing(true);
  };

  const handleCancel = () => {
    setEditing(false);
  };

  const handleSave = (e: FormEvent) => {
    e.preventDefault();
    const trimmed = draftNickname.trim();
    if (!trimmed) {
      toast.error('昵称不能为空');
      return;
    }
    const updated: IUserProfile = {
      nickname: trimmed,
      avatar: draftAvatar.trim() || undefined,
    };
    setProfile(updated);
    saveUserProfile(updated);
    setEditing(false);
    toast.success('个人信息已更新');
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      className="rounded-2xl border border-border/40 bg-card p-6 shadow-sm"
    >
      {editing ? (
        <form onSubmit={handleSave} className="flex flex-col items-center gap-4">
          {/* 头像编辑区 */}
          <div className="relative">
            <Avatar className="size-20 ring-2 ring-primary/20 ring-offset-2 ring-offset-background">
              <AvatarImage src={draftAvatar || undefined} alt={draftNickname} />
              <AvatarFallback className="bg-primary/10 text-primary text-xl font-semibold">
                {draftNickname.slice(0, 2) || <User className="size-8" />}
              </AvatarFallback>
            </Avatar>
            <div className="absolute -bottom-1 -right-1 size-7 rounded-full bg-primary text-primary-foreground flex items-center justify-center shadow-sm">
              <Camera className="size-3.5" />
            </div>
          </div>

          {/* 头像URL输入 */}
          <div className="w-full max-w-xs">
            <label className="text-xs text-muted-foreground mb-1 block">
              头像链接（可选）
            </label>
            <Input
              value={draftAvatar}
              onChange={(e) => setDraftAvatar(e.target.value)}
              placeholder="输入头像图片链接"
              className="h-9 text-sm"
            />
          </div>

          {/* 昵称输入 */}
          <div className="w-full max-w-xs">
            <label className="text-xs text-muted-foreground mb-1 block">
              昵称
            </label>
            <Input
              value={draftNickname}
              onChange={(e) => setDraftNickname(e.target.value)}
              placeholder="输入你的昵称"
              maxLength={20}
              className="h-9 text-sm"
            />
          </div>

          {/* 操作按钮 */}
          <div className="flex items-center gap-2 pt-1">
            <Button
              type="submit"
              size="sm"
              className="gap-1.5"
            >
              <Check className="size-3.5" />
              保存
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={handleCancel}
              className="gap-1.5"
            >
              <X className="size-3.5" />
              取消
            </Button>
          </div>
        </form>
      ) : (
        <div className="flex flex-col items-center gap-3">
          {/* 头像 */}
          <Avatar className="size-20 ring-2 ring-primary/20 ring-offset-2 ring-offset-background">
            <AvatarImage src={profile.avatar} alt={profile.nickname} />
            <AvatarFallback className="bg-primary/10 text-primary text-xl font-semibold">
              {profile.nickname.slice(0, 2) || <User className="size-8" />}
            </AvatarFallback>
          </Avatar>

          {/* 昵称 */}
          <h2 className="text-lg font-semibold text-foreground">
            {profile.nickname}
          </h2>

          {/* 编辑按钮 */}
          <Button
            variant="outline"
            size="sm"
            onClick={handleStartEdit}
            className="gap-1.5 rounded-full border-border/60 text-muted-foreground hover:text-foreground"
          >
            <Pencil className="size-3.5" />
            编辑资料
          </Button>
        </div>
      )}
    </motion.div>
  );
}
