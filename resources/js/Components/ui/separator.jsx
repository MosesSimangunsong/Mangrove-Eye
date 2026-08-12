import { forwardRef } from 'react';
import { cn } from '@/lib/utils';

const Separator = forwardRef(function Separator(
    { className, orientation = 'horizontal', decorative = true, ...props },
    ref,
) {
    return (
        <div
            ref={ref}
            role={decorative ? 'presentation' : 'separator'}
            aria-orientation={orientation}
            className={cn(
                'shrink-0 bg-border',
                orientation === 'horizontal' ? 'h-px w-full' : 'h-full w-px',
                className,
            )}
            {...props}
        />
    );
});

export { Separator };
