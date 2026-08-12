import { Badge } from '@/Components/ui/badge';

const variants = {
    hotspot: 'default',
    analysis_run: 'secondary',
};

export default function ReportTypeBadge({ type }) {
    const label = type ? type.replaceAll('_', ' ') : 'unknown';

    return (
        <Badge variant={variants[type] ?? 'outline'}>
            {label.replace(/\b\w/g, (char) => char.toUpperCase())}
        </Badge>
    );
}
