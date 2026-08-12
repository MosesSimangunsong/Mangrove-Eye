import { Link } from '@inertiajs/react';
import {
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbList,
    BreadcrumbPage,
    BreadcrumbSeparator,
} from '@/Components/ui/breadcrumb';

export default function BreadcrumbBar({ items = [] }) {
    if (!items.length) {
        return null;
    }

    return (
        <Breadcrumb>
            <BreadcrumbList>
                {items.map((item, index) => {
                    const isLast = index === items.length - 1;

                    return (
                        <BreadcrumbItem key={`${item.label}-${index}`}>
                            {isLast || !item.href ? (
                                <BreadcrumbPage>{item.label}</BreadcrumbPage>
                            ) : (
                                <Link href={item.href} className="transition-colors hover:text-foreground">
                                    {item.label}
                                </Link>
                            )}
                            {!isLast ? <BreadcrumbSeparator /> : null}
                        </BreadcrumbItem>
                    );
                })}
            </BreadcrumbList>
        </Breadcrumb>
    );
}
