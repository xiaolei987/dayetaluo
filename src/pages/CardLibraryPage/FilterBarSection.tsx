import { motion } from 'framer-motion';

const FILTER_CATEGORIES = [
  { key: 'all', label: '全部', count: 78 },
  { key: 'major', label: '大阿卡纳', count: 22 },
  { key: 'wands', label: '权杖', count: 14 },
  { key: 'cups', label: '圣杯', count: 14 },
  { key: 'swords', label: '宝剑', count: 14 },
  { key: 'pentacles', label: '星币', count: 14 },
] as const;

export type FilterCategory = (typeof FILTER_CATEGORIES)[number]['key'];

interface FilterBarSectionProps {
  activeCategory: FilterCategory;
  onCategoryChange: (category: FilterCategory) => void;
}

export default function FilterBarSection({
  activeCategory,
  onCategoryChange,
}: FilterBarSectionProps) {
  return (
    <section className="w-full py-6">
      <div className="max-w-7xl mx-auto px-4 md:px-6">
        <div className="flex flex-wrap items-center gap-2">
          {FILTER_CATEGORIES.map((cat, i) => {
            const isActive = activeCategory === cat.key;
            return (
              <motion.button
                key={cat.key}
                onClick={() => onCategoryChange(cat.key)}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.35, delay: i * 0.05, ease: [0.16, 1, 0.3, 1] }}
                whileHover={{ y: -1 }}
                whileTap={{ scale: 0.97 }}
                className={`inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-primary text-primary-foreground shadow-sm'
                    : 'bg-muted text-muted-foreground hover:bg-accent hover:text-accent-foreground'
                }`}
              >
                {cat.label}
                <span
                  className={`text-xs rounded-full px-1.5 py-0.5 ${
                    isActive
                      ? 'bg-primary-foreground/20 text-primary-foreground'
                      : 'bg-background/60 text-muted-foreground'
                  }`}
                >
                  {cat.count}
                </span>
              </motion.button>
            );
          })}
        </div>
      </div>
    </section>
  );
}
