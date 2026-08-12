import { Badge } from '@/Components/ui/badge';

function formatLabel(value) {
    if (!value) {
        return '-';
    }

    return value.replaceAll('_', ' ');
}

const TYPE_VARIANTS = {
    main_aoi: 'success',
    conflict_zone: 'destructive',
    buffer: 'warning',
    reference: 'secondary',
};

export default function AoiTypeBadge({ type }) {
    return (
        <Badge variant={TYPE_VARIANTS[type] ?? 'outline'}>
            {formatLabel(type)}
        </Badge>
    );
}
