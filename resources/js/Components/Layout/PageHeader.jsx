import { Badge } from '@/Components/ui/badge';
import { cn } from '@/lib/utils';
import BreadcrumbBar from './BreadcrumbBar';

export default function PageHeader({
    title,
    description,
    breadcrumbItems = [],
    actions = null,
    eyebrow = null,
    status = null,
    className,
    children = null,
}) {
    if (!title && !description && !children) {
        return null;
    }

    return (
        <header className={cn('page-header-shell', className)}>
            {breadcrumbItems.length ? <BreadcrumbBar items={breadcrumbItems} /> : null}

            <div className="page-header-main">
                <div className="page-header-copy">
                    {eyebrow ? <p className="page-header-eyebrow">{eyebrow}</p> : null}
                    {title ? <h1 className="page-header-title">{title}</h1> : null}
                    {description ? <p className="page-header-description">{description}</p> : null}
                    {status ? (
                        <div className="page-header-status">
                            <Badge variant="secondary">{status}</Badge>
                        </div>
                    ) : null}
                    {children}
                </div>

                {actions ? <div className="page-header-actions">{actions}</div> : null}
            </div>
        </header>
    );
}
