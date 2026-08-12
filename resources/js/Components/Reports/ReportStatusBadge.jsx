import { Badge } from '@/Components/ui/badge';

const variants = {
    generated: 'default',
    ready: 'default',
    completed: 'default',
    pending: 'secondary',
    processing: 'secondary',
    failed: 'destructive',
};

export default function ReportStatusBadge({ status }) {
    const label = status ? status.replaceAll('_', ' ') : 'unknown';

    return (
        <Badge variant={variants[status] ?? 'outline'}>
            {label.replace(/\b\w/g, (char) => char.toUpperCase())}
        </Badge>
    );
}
