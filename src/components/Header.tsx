import { NavLink } from 'react-router-dom';
import { Home, BookOpen, Clock, User } from 'lucide-react';

const NAV_ITEMS = [
  { path: '/', label: '首页', icon: Home },
  { path: '/library', label: '牌库', icon: BookOpen },
  { path: '/history', label: '历史', icon: Clock },
  { path: '/profile', label: '我的', icon: User },
];

export default function Header() {
  return (
    <header className="sticky top-0 z-50 w-full bg-background/80 backdrop-blur-md border-b border-border/30">
      <div className="max-w-7xl mx-auto px-4 md:px-6 flex h-14 items-center justify-between">
        {/* 品牌 logo */}
        <NavLink to="/" className="flex items-center gap-2 shrink-0">
          <div className="size-8 rounded-lg bg-primary flex items-center justify-center text-primary-foreground text-sm font-bold">
            塔
          </div>
          <span className="text-base font-semibold text-foreground hidden sm:block">
            大爷塔罗
          </span>
        </NavLink>

        {/* 导航项 */}
        <nav className="flex items-center gap-1">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                end={item.path === '/'}
                className={({ isActive }) =>
                  `flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    isActive
                      ? 'text-primary bg-primary/10'
                      : 'text-muted-foreground hover:text-foreground hover:bg-muted/60'
                  }`
                }
              >
                <Icon className="size-4" />
                <span className="hidden sm:inline">{item.label}</span>
              </NavLink>
            );
          })}
        </nav>
      </div>
    </header>
  );
}
