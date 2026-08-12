import AppShell from '@/Components/Layout/AppShell';

export default function AuthenticatedLayout({
    children,
    header = null,
    title,
    description,
    breadcrumbItems,
    eyebrow,
    actions,
    contentClassName,
    pageHeaderClassName,
}) {
    return (
        <AppShell
            header={header}
            title={title}
            description={description}
            breadcrumbItems={breadcrumbItems}
            eyebrow={eyebrow}
            actions={actions}
            contentClassName={contentClassName}
            pageHeaderClassName={pageHeaderClassName}
        >
            {children}
        </AppShell>
    );
}
