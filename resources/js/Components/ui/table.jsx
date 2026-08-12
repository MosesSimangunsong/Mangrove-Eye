import { forwardRef } from 'react';
import { cn } from '@/lib/utils';

const Table = forwardRef(function Table({ className, ...props }, ref) {
    return (
        <div className="w-full overflow-auto">
            <table ref={ref} className={cn('w-full caption-bottom text-sm', className)} {...props} />
        </div>
    );
});

const TableHeader = forwardRef(function TableHeader({ className, ...props }, ref) {
    return <thead ref={ref} className={cn('[&_tr]:border-b', className)} {...props} />;
});

const TableBody = forwardRef(function TableBody({ className, ...props }, ref) {
    return <tbody ref={ref} className={cn('[&_tr:last-child]:border-0', className)} {...props} />;
});

const TableFooter = forwardRef(function TableFooter({ className, ...props }, ref) {
    return <tfoot ref={ref} className={cn('border-t bg-muted/50 font-medium', className)} {...props} />;
});

const TableRow = forwardRef(function TableRow({ className, ...props }, ref) {
    return (
        <tr
            ref={ref}
            className={cn('border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted', className)}
            {...props}
        />
    );
});

const TableHead = forwardRef(function TableHead({ className, ...props }, ref) {
    return (
        <th
            ref={ref}
            className={cn('h-12 px-4 text-left align-middle font-medium text-muted-foreground', className)}
            {...props}
        />
    );
});

const TableCell = forwardRef(function TableCell({ className, ...props }, ref) {
    return <td ref={ref} className={cn('p-4 align-middle', className)} {...props} />;
});

const TableCaption = forwardRef(function TableCaption({ className, ...props }, ref) {
    return <caption ref={ref} className={cn('mt-4 text-sm text-muted-foreground', className)} {...props} />;
});

export {
    Table,
    TableBody,
    TableCaption,
    TableCell,
    TableFooter,
    TableHead,
    TableHeader,
    TableRow,
};
