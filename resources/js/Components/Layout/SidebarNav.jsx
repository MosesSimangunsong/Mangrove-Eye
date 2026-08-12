import { Link } from '@inertiajs/react';
import { Badge } from '@/Components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/Components/ui/card';
import { Separator } from '@/Components/ui/separator';
import { cn } from '@/lib/utils';
import { hasAnyPermission, hasRoute, isCurrentRoute } from './PermissionGate';

function createNavItems(permissions) {
    return [
        {
            key: 'dashboard',
            label: 'Dashboard',
            description: 'Map-first monitoring',
            routeName: 'dashboard',
            requiredPermissions: ['view_internal_dashboard'],
            alwaysVisible: true,
        },
        {
            key: 'hotspots',
            label: 'Hotspots',
            description: 'Daftar indikasi awal',
            routeName: 'hotspots.index',
            requiredPermissions: ['view_hotspot'],
        },
        {
            key: 'aoi-areas',
            label: 'AOI Management',
            description: 'Kelola area analisis',
            routeName: 'aoi-areas.index',
            requiredPermissions: ['manage_aoi'],
        },
        {
            key: 'analysis-runs',
            label: 'Analysis Runs',
            description: 'Metadata before-after',
            routeName: 'analysis-runs.index',
            requiredPermissions: ['manage_analysis_runs'],
        },
        {
            key: 'gee-imports',
            label: 'GEE Imports',
            description: 'Riwayat import hasil GEE',
            routeName: 'gee-imports.index',
            requiredPermissions: ['import_gee_result'],
        },
        {
            key: 'field-validations',
            label: 'Field Validations',
            description: 'Validasi lapangan',
            routeName: 'field-validations.index',
            requiredPermissions: ['validate_hotspot', 'view_validation'],
        },
        {
            key: 'reports',
            label: 'Reports',
            description: 'Generate dan unduh PDF',
            routeName: 'reports.index',
            requiredPermissions: ['export_report'],
        },
        {
            key: 'users',
            label: 'Users & Roles',
            description: 'Kelola akun internal',
            routeName: 'users.index',
            requiredPermissions: ['manage_users'],
        },
        {
            key: 'audit-logs',
            label: 'Audit Logs',
            description: 'Jejak aktivitas penting',
            routeName: 'audit-logs.index',
            requiredPermissions: ['view_audit_logs'],
        },
        {
            key: 'profile',
            label: 'Settings / Profile',
            description: 'Profil dan preferensi',
            routeName: 'profile.edit',
            alwaysVisible: true,
        },
    ].filter((item) => item.alwaysVisible || hasAnyPermission(permissions, item.requiredPermissions));
}

function formatRoleLabel(role) {
    if (!role) {
        return 'Internal user';
    }

    return role.replaceAll('_', ' ');
}

export default function SidebarNav({ user, isCompact = false, onNavigate = null }) {
    const permissions = user?.permissions ?? [];
    const navItems = createNavItems(permissions);

    return (
        <aside className={cn('app-sidebar', isCompact && 'app-sidebar-compact')}>
            <Card className="app-sidebar-card">
                <CardHeader className="app-sidebar-brand">
                    <div className="app-sidebar-brand-mark">ME</div>
                    <div>
                        <p className="app-sidebar-brand-kicker">MANGROVE-EYE</p>
                        <CardTitle className="text-base">Internal Operations</CardTitle>
                    </div>
                </CardHeader>

                <CardContent className="app-sidebar-content">
                    <div className="app-sidebar-user">
                        <div>
                            <strong>{user?.name ?? 'Internal user'}</strong>
                            <span>{user?.email ?? '-'}</span>
                        </div>
                        <Badge variant="secondary">
                            {formatRoleLabel(user?.roles?.[0] ?? null)}
                        </Badge>
                    </div>

                    <Separator />

                    <nav className="app-sidebar-nav" aria-label="Internal navigation">
                        {navItems.map((item) => {
                            const routeExists = hasRoute(item.routeName);
                            const isActive = routeExists && isCurrentRoute(item.routeName);
                            const stateLabel = routeExists ? 'Active' : 'Coming soon';

                            if (!routeExists) {
                                return (
                                    <div
                                        key={item.key}
                                        className="app-sidebar-link is-disabled"
                                        aria-disabled="true"
                                    >
                                        <div>
                                            <strong>{item.label}</strong>
                                            <span>{item.description}</span>
                                        </div>
                                        <Badge variant="outline">{stateLabel}</Badge>
                                    </div>
                                );
                            }

                            return (
                                <Link
                                    key={item.key}
                                    href={route(item.routeName)}
                                    className={cn('app-sidebar-link', isActive && 'is-active')}
                                    onClick={onNavigate}
                                >
                                    <div>
                                        <strong>{item.label}</strong>
                                        <span>{item.description}</span>
                                    </div>
                                    {isActive ? <Badge>Now</Badge> : null}
                                </Link>
                            );
                        })}
                    </nav>

                    <div className="app-sidebar-footer">
                        <p>
                            Dashboard tetap jadi pusat monitoring peta. Modul lain disiapkan
                            bertahap tanpa memindahkan logic existing terlalu cepat.
                        </p>
                        <Link
                            href={route('dashboard')}
                            onClick={onNavigate}
                            className="app-sidebar-footer-link"
                        >
                            Kembali ke Dashboard
                        </Link>
                    </div>
                </CardContent>
            </Card>
        </aside>
    );
}
