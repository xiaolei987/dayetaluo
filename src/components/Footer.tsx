import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="w-full border-t border-border/50 bg-background/60 backdrop-blur-sm">
      <div className="max-w-7xl mx-auto px-4 md:px-6 py-6 flex flex-col sm:flex-row items-center justify-between gap-3">
        <p className="text-xs text-muted-foreground">
          © {new Date().getFullYear()} 大爷塔罗 · 仅供娱乐参考
        </p>
        <div className="flex items-center gap-4 text-xs text-muted-foreground">
          <Link to="/" className="hover:text-foreground transition-colors">
            首页
          </Link>
          <Link to="/library" className="hover:text-foreground transition-colors">
            牌库
          </Link>
          <Link to="/history" className="hover:text-foreground transition-colors">
            历史
          </Link>
          <Link to="/profile" className="hover:text-foreground transition-colors">
            我的
          </Link>
        </div>
      </div>
    </footer>
  );
}
