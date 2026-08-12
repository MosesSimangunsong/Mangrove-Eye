import { forwardRef } from 'react';
import { cn } from '@/lib/utils';

const Breadcrumb = forwardRef(function Breadcrumb({ className, ...props }, ref) {
    return <nav ref={ref} aria-label="breadcrumb" className={cn('', className)} {...props} />;
});

const BreadcrumbList = forwardRef(function BreadcrumbList({ className, ...props }, ref) {
    return <ol ref={ref} className={cn('flex flex-wrap items-center gap-2 text-sm text-muted-foreground', className)} {...props} />;
});

const BreadcrumbItem = forwardRef(function BreadcrumbItem({ className, ...props }, ref) {
    return <li ref={ref} className={cn('inline-flex items-center gap-2', className)} {...props} />;
});

const BreadcrumbLink = forwardRef(function BreadcrumbLink({ className, ...props }, ref) {
    return <a ref={ref} className={cn('transition-colors hover:text-foreground', className)} {...props} />;
});

const BreadcrumbPage = forwardRef(function BreadcrumbPage({ className, ...props }, ref) {
    return <span ref={ref} aria-current="page" className={cn('font-medium text-foreground', className)} {...props} />;
});

const BreadcrumbSeparator = forwardRef(function BreadcrumbSeparator({ className, children = '/', ...props }, ref) {
    return <li ref={ref} role="presentation" className={cn('text-muted-foreground', className)} {...props}>{children}</li>;
});

export {
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbLink,
    BreadcrumbList,
    BreadcrumbPage,
    BreadcrumbSeparator,
};
