import { Badge } from '@/Components/ui/badge';

const STATUS_VARIANTS = {
    pending: 'warning',
    imported: 'success',
    failed: 'destructive',
};

function formatLabel(value) {
    if (!value) {
        return '-';
    }

    return value.replaceAll('_', ' ');
}

export default function GeeImportStatusBadge({ status }) {
    return (
        <Badge variant={STATUS_VARIANTS[status] ?? 'outline'}>
            {formatLabel(status)}
        </Badge>
    );
}
