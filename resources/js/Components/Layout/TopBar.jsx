import { Link } from '@inertiajs/react';
import { Badge } from '@/Components/ui/badge';
import { Button } from '@/Components/ui/button';

function formatRoleLabel(role) {
    if (!role) {
        return 'Internal user';
    }

    return role.replaceAll('_', ' ');
}

export default function TopBar({
    user,
    title,
    subtitle,
    onToggleNavigation,
    isCompactNavigation = false,
}) {
    const primaryRole = user?.roles?.[0] ?? null;

    return (
        <div className="app-topbar">
            <div className="app-topbar-copy">
                <div className="app-topbar-mobile">
                    <Button
                        variant="outline"
                        size="sm"
                        className="app-nav-toggle"
                        onClick={onToggleNavigation}
                    >
                        {isCompactNavigation ? 'Tutup Menu' : 'Buka Menu'}
                    </Button>
                </div>

                <div>
                    <p className="app-topbar-kicker">Internal workspace</p>
                    <h2 className="app-topbar-title">{title}</h2>
                    {subtitle ? <p className="app-topbar-subtitle">{subtitle}</p> : null}
                </div>
            </div>

            <div className="app-topbar-user">
                {primaryRole ? (
                    <Badge variant="secondary" className="app-role-badge">
                        {formatRoleLabel(primaryRole)}
                    </Badge>
                ) : null}

                <div className="app-user-summary">
                    <strong>{user?.name ?? 'Internal user'}</strong>
                    <span>{user?.email ?? '-'}</span>
                </div>

                <div className="app-topbar-actions">
                    <Link href={route('profile.edit')} className="app-topbar-link app-topbar-link-outline">
                        Settings
                    </Link>
                    <Link href={route('logout')} method="post" as="button" className="app-topbar-link">
                        Log Out
                    </Link>
                </div>
            </div>
        </div>
    );
}
