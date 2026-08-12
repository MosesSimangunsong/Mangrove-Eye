import { forwardRef } from 'react';
import { cn } from '@/lib/utils';

const Checkbox = forwardRef(function Checkbox({ className, ...props }, ref) {
    return (
        <input
            ref={ref}
            type="checkbox"
            className={cn(
                'h-4 w-4 rounded border border-input text-primary focus:ring-2 focus:ring-ring focus:ring-offset-2',
                className,
            )}
            {...props}
        />
    );
});

export { Checkbox };
