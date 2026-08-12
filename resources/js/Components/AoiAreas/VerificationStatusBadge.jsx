import { Badge } from '@/Components/ui/badge';

function formatLabel(value) {
    if (!value) {
        return '-';
    }

    return value.replaceAll('_', ' ');
}

const STATUS_VARIANTS = {
    verified: 'success',
    draft: 'warning',
    needs_revision: 'destructive',
};

export default function VerificationStatusBadge({ status }) {
    return (
        <Badge variant={STATUS_VARIANTS[status] ?? 'outline'}>
            {formatLabel(status)}
        </Badge>
    );
}
