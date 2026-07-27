import { cn } from '@/lib/utils';
import { cva, type VariantProps } from 'class-variance-authority';

const emptyStateVariants = cva(
  'flex flex-col items-center justify-center text-center rounded-2xl py-16 px-6',
  {
    variants: {
      variant: {
        default: 'text-muted-foreground',
        card: 'bg-card/60 border border-border/40 shadow-sm',
        ghost: 'bg-transparent',
      },
      size: {
        default: 'py-16',
        sm: 'py-12',
        lg: 'py-24',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  },
);

export interface EmptyStateProps extends VariantProps<typeof emptyStateVariants> {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  action?: React.ReactNode;
  className?: string;
}

export function EmptyState({
  icon,
  title,
  description,
  action,
  variant,
  size,
  className,
}: EmptyStateProps) {
  return (
    <div className={cn(emptyStateVariants({ variant, size }), className)}>
      {icon && (
        <div className="size-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
          <div className="text-primary">{icon}</div>
        </div>
      )}
      <h3 className="text-base font-semibold text-foreground mb-1.5">{title}</h3>
      {description && (
        <p className="text-sm text-muted-foreground max-w-xs mb-5">{description}</p>
      )}
      {action && <div className="flex items-center gap-2">{action}</div>}
    </div>
  );
}
