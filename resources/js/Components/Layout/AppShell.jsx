import { useState } from 'react';
import { usePage } from '@inertiajs/react';
import { cn } from '@/lib/utils';
import PageHeader from './PageHeader';
import SidebarNav from './SidebarNav';
import TopBar from './TopBar';

const DEFAULT_PAGE_CONFIG = {
    dashboard: {
        title: 'Dashboard',
        description: 'Pantau hotspot, filter spasial, dan alur validasi internal tanpa memindahkan workflow inti yang sudah berjalan.',
        eyebrow: 'WebGIS workspace',
        breadcrumbItems: [{ label: 'Dashboard' }],
    },
    'profile.edit': {
        title: 'Profile Settings',
        description: 'Kelola data akun internal dan pengaturan dasar tanpa mengubah akses operasional sistem.',
        eyebrow: 'Account',
        breadcrumbItems: [
            { label: 'Dashboard', href: '/dashboard' },
            { label: 'Settings / Profile' },
        ],
    },
};

export default function AppShell({
    children,
    title,
    description,
    breadcrumbItems,
    eyebrow,
    actions,
    header,
    contentClassName,
    pageHeaderClassName,
}) {
    const { auth } = usePage().props;
    const [compactNavOpen, setCompactNavOpen] = useState(false);

    let currentRouteName = '';

    try {
        currentRouteName = route().current();
    } catch {
        currentRouteName = '';
    }

    const fallbackConfig = DEFAULT_PAGE_CONFIG[currentRouteName] ?? {};
    const resolvedTitle = title ?? fallbackConfig.title ?? 'Internal Workspace';
    const resolvedDescription = description ?? fallbackConfig.description ?? '';
    const resolvedEyebrow = eyebrow ?? fallbackConfig.eyebrow ?? 'Internal workspace';
    const resolvedBreadcrumbs = breadcrumbItems ?? fallbackConfig.breadcrumbItems ?? [];

    return (
        <div className="app-shell">
            <SidebarNav user={auth.user} />

            <div className="app-shell-main">
                <TopBar
                    user={auth.user}
                    title={resolvedTitle}
                    subtitle={resolvedDescription}
                    isCompactNavigation={compactNavOpen}
                    onToggleNavigation={() => setCompactNavOpen((current) => !current)}
                />

                {compactNavOpen ? (
                    <div className="app-shell-mobile-nav">
                        <SidebarNav
                            user={auth.user}
                            isCompact
                            onNavigate={() => setCompactNavOpen(false)}
                        />
                    </div>
                ) : null}

                <div className="app-shell-content">
                    <PageHeader
                        title={resolvedTitle}
                        description={resolvedDescription}
                        eyebrow={resolvedEyebrow}
                        breadcrumbItems={resolvedBreadcrumbs}
                        actions={actions}
                        className={pageHeaderClassName}
                    >
                        {header}
                    </PageHeader>

                    <div className={cn('app-shell-page', contentClassName)}>
                        {children}
                    </div>
                </div>
            </div>
        </div>
    );
}
