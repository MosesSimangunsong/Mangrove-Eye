import { Badge } from '@/Components/ui/badge';

const STATUS_VARIANTS = {
    draft: 'warning',
    processed: 'success',
    published: 'success',
    archived: 'secondary',
    failed: 'destructive',
};

function formatLabel(value) {
    if (!value) {
        return '-';
    }

    return value.replaceAll('_', ' ');
}

export default function AnalysisRunStatusBadge({ status }) {
    return (
        <Badge variant={STATUS_VARIANTS[status] ?? 'outline'}>
            {formatLabel(status)}
        </Badge>
    );
}
