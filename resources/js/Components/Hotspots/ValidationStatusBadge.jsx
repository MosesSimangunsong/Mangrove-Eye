import { Badge } from '@/Components/ui/badge';

const STATUS_VARIANTS = {
    detected: 'secondary',
    under_review: 'warning',
    validated: 'success',
    rejected: 'destructive',
    needs_recheck: 'warning',
};

function formatStatus(value) {
    if (!value) {
        return '-';
    }

    return value.replaceAll('_', ' ');
}

export default function ValidationStatusBadge({ status }) {
    return (
        <Badge variant={STATUS_VARIANTS[status] ?? 'outline'}>
            {formatStatus(status)}
        </Badge>
    );
}
