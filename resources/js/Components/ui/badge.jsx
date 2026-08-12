import { forwardRef } from 'react';
import { cn } from '@/lib/utils';

const badgeVariants = {
    default: 'bg-primary/10 text-primary',
    secondary: 'bg-secondary text-secondary-foreground',
    outline: 'border border-border text-foreground',
    success: 'bg-[hsl(var(--risk-low-soft))] text-[hsl(var(--risk-low-foreground))]',
    warning: 'bg-[hsl(var(--risk-medium-soft))] text-[hsl(var(--risk-medium-foreground))]',
    destructive: 'bg-destructive/10 text-destructive',
};

const Badge = forwardRef(function Badge({ className, variant = 'default', ...props }, ref) {
    return (
        <span
            ref={ref}
            className={cn(
                'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold transition-colors',
                badgeVariants[variant] ?? badgeVariants.default,
                className,
            )}
            {...props}
        />
    );
});

export { Badge };
