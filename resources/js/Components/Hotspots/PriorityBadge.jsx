import { Badge } from '@/Components/ui/badge';

const PRIORITY_VARIANTS = {
    high: 'destructive',
    medium: 'warning',
    low: 'success',
};

export default function PriorityBadge({ priority }) {
    if (!priority) {
        return <Badge variant="outline">-</Badge>;
    }

    return <Badge variant={PRIORITY_VARIANTS[priority] ?? 'secondary'}>{priority}</Badge>;
}
