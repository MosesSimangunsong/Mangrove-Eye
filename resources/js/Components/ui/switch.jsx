import { forwardRef } from 'react';
import { cn } from '@/lib/utils';

const Switch = forwardRef(function Switch({ className, ...props }, ref) {
    return (
        <input
            ref={ref}
            type="checkbox"
            role="switch"
            className={cn(
                'h-5 w-10 appearance-none rounded-full border border-input bg-muted transition-colors checked:bg-primary focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2',
                className,
            )}
            {...props}
        />
    );
});

export { Switch };
