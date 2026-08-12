import { forwardRef } from 'react';
import { cn } from '@/lib/utils';

const Alert = forwardRef(function Alert({ className, variant = 'default', ...props }, ref) {
    return (
        <div
            ref={ref}
            role="alert"
            className={cn(
                'relative w-full rounded-xl border p-4 text-sm',
                variant === 'destructive'
                    ? 'border-destructive/30 bg-destructive/5 text-destructive'
                    : 'border-border bg-card text-card-foreground',
                className,
            )}
            {...props}
        />
    );
});

const AlertTitle = forwardRef(function AlertTitle({ className, ...props }, ref) {
    return <h5 ref={ref} className={cn('mb-1 font-medium leading-none tracking-tight', className)} {...props} />;
});

const AlertDescription = forwardRef(function AlertDescription({ className, ...props }, ref) {
    return <div ref={ref} className={cn('text-sm text-muted-foreground', className)} {...props} />;
});

export { Alert, AlertDescription, AlertTitle };
