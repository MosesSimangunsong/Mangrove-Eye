import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import ReportStatusBadge from '@/Components/Reports/ReportStatusBadge';
import ReportTypeBadge from '@/Components/Reports/ReportTypeBadge';
import { Alert, AlertDescription, AlertTitle } from '@/Components/ui/alert';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/Components/ui/card';
import { Input } from '@/Components/ui/input';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/Components/ui/table';
import {
    formatDateTime,
    formatNumber,
} from '@/Components/Dashboard/dashboardHelpers';
import { fetchDashboardBootstrap, fetchReports } from '@/lib/api';
import { Head, Link } from '@inertiajs/react';
import { useEffect, useMemo, useState } from 'react';

function matchesSearch(report, keyword) {
    if (!keyword) {
        return true;
    }

    const haystack = [
        report.report_code,
        report.title,
        report.hotspot?.hotspot_code,
        report.analysis_run?.name,
        report.generated_by?.name,
        report.status,
    ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase();

    return haystack.includes(keyword.toLowerCase());
}

export default function ReportsIndex() {
    const [bootstrap, setBootstrap] = useState({ analysisRuns: [], aoiAreas: [] });
    const [reports, setReports] = useState([]);
    const [meta, setMeta] = useState({ current_page: 1, last_page: 1, total: 0 });
    const [filters, setFilters] = useState({
        search: '',
        report_type: 'all',
        analysis_run_id: 'all',
        hotspot_id: 'all',
        per_page: 15,
        page: 1,
    });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        let active = true;

        async function loadBootstrap() {
            try {
                const data = await fetchDashboardBootstrap();

                if (active) {
                    setBootstrap({
                        analysisRuns: data.analysisRuns,
                        aoiAreas: data.aoiAreas,
                    });
                }
            } catch {
                if (active) {
                    setError('Metadata analysis run untuk halaman report belum berhasil dimuat.');
                }
            }
        }

        loadBootstrap();

        return () => {
            active = false;
        };
    }, []);

    useEffect(() => {
        let active = true;

        async function loadReports() {
            setLoading(true);
            setError('');

            try {
                const response = await fetchReports({
                    report_type: filters.report_type,
                    analysis_run_id: filters.analysis_run_id,
                    hotspot_id: filters.hotspot_id,
                    per_page: filters.per_page,
                    page: filters.page,
                });

                if (!active) {
                    return;
                }

                const filteredItems = response.data.filter((report) =>
                    matchesSearch(report, filters.search),
                );

                setReports(filteredItems);
                setMeta(response.meta);
            } catch {
                if (active) {
                    setReports([]);
                    setError('Daftar report belum berhasil dimuat.');
                }
            } finally {
                if (active) {
                    setLoading(false);
                }
            }
        }

        loadReports();

        return () => {
            active = false;
        };
    }, [
        filters.analysis_run_id,
        filters.hotspot_id,
        filters.page,
        filters.per_page,
        filters.report_type,
        filters.search,
    ]);

    const summary = useMemo(() => {
        return {
            total: meta.total ?? reports.length,
            hotspot: reports.filter((item) => item.report_type === 'hotspot').length,
            analysis: reports.filter((item) => item.report_type === 'analysis_run').length,
            ready: reports.filter((item) =>
                ['generated', 'ready', 'completed'].includes(item.status),
            ).length,
        };
    }, [meta.total, reports]);

    return (
        <AuthenticatedLayout
            title="Reports"
            description="Sentralisasi daftar PDF internal agar proses review, unduh, dan pelacakan generator tidak lagi tersembunyi di dashboard."
            eyebrow="Export center"
            breadcrumbItems={[
                { label: 'Dashboard', href: '/dashboard' },
                { label: 'Reports' },
            ]}
        >
            <Head title="Reports" />

            <div className="space-y-6">
                {error ? (
                    <Alert variant="destructive">
                        <AlertTitle>Gagal memuat report</AlertTitle>
                        <AlertDescription>{error}</AlertDescription>
                    </Alert>
                ) : null}

                <section className="grid gap-4 lg:grid-cols-4">
                    <Card>
                        <CardHeader className="pb-3">
                            <CardDescription>Total report</CardDescription>
                            <CardTitle>{loading ? '...' : summary.total}</CardTitle>
                        </CardHeader>
                    </Card>
                    <Card>
                        <CardHeader className="pb-3">
                            <CardDescription>Hotspot PDF</CardDescription>
                            <CardTitle>{loading ? '...' : summary.hotspot}</CardTitle>
                        </CardHeader>
                    </Card>
                    <Card>
                        <CardHeader className="pb-3">
                            <CardDescription>Analysis run PDF</CardDescription>
                            <CardTitle>{loading ? '...' : summary.analysis}</CardTitle>
                        </CardHeader>
                    </Card>
                    <Card>
                        <CardHeader className="pb-3">
                            <CardDescription>Ready to download</CardDescription>
                            <CardTitle>{loading ? '...' : summary.ready}</CardTitle>
                        </CardHeader>
                    </Card>
                </section>

                <section className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_22rem]">
                    <div className="space-y-6">
                        <Card>
                            <CardHeader>
                                <CardTitle>Filter Reports</CardTitle>
                                <CardDescription>
                                    Persempit daftar berdasarkan tipe dokumen, analysis run, dan referensi hotspot.
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                                <label className="space-y-2 text-sm font-medium xl:col-span-2">
                                    <span>Cari</span>
                                    <Input
                                        value={filters.search}
                                        onChange={(event) =>
                                            setFilters((current) => ({
                                                ...current,
                                                search: event.target.value,
                                                page: 1,
                                            }))
                                        }
                                        placeholder="Judul, kode report, generator..."
                                    />
                                </label>

                                <label className="space-y-2 text-sm font-medium">
                                    <span>Tipe</span>
                                    <select
                                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                                        value={filters.report_type}
                                        onChange={(event) =>
                                            setFilters((current) => ({
                                                ...current,
                                                report_type: event.target.value,
                                                page: 1,
                                            }))
                                        }
                                    >
                                        <option value="all">Semua tipe</option>
                                        <option value="hotspot">Hotspot</option>
                                        <option value="analysis_run">Analysis run</option>
                                    </select>
                                </label>

                                <label className="space-y-2 text-sm font-medium">
                                    <span>Analysis run</span>
                                    <select
                                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                                        value={filters.analysis_run_id}
                                        onChange={(event) =>
                                            setFilters((current) => ({
                                                ...current,
                                                analysis_run_id: event.target.value,
                                                page: 1,
                                            }))
                                        }
                                    >
                                        <option value="all">Semua run</option>
                                        {bootstrap.analysisRuns.map((run) => (
                                            <option key={run.id} value={run.id}>
                                                {run.name}
                                            </option>
                                        ))}
                                    </select>
                                </label>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle>Daftar Report</CardTitle>
                                <CardDescription>
                                    Setiap file tetap diunduh lewat endpoint yang sudah diproteksi permission backend.
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                {loading ? (
                                    <p className="text-sm text-muted-foreground">
                                        Memuat daftar report...
                                    </p>
                                ) : reports.length === 0 ? (
                                    <p className="text-sm text-muted-foreground">
                                        Belum ada report yang cocok dengan filter aktif.
                                    </p>
                                ) : (
                                    <Table>
                                        <TableHeader>
                                            <TableRow>
                                                <TableHead>Report</TableHead>
                                                <TableHead>Tipe</TableHead>
                                                <TableHead>Status</TableHead>
                                                <TableHead>Relasi</TableHead>
                                                <TableHead>Generator</TableHead>
                                                <TableHead>Unduh</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {reports.map((report) => (
                                                <TableRow key={report.id}>
                                                    <TableCell>
                                                        <div className="space-y-1">
                                                            <p className="font-medium">
                                                                {report.title}
                                                            </p>
                                                            <p className="text-xs text-muted-foreground">
                                                                {report.report_code} -{' '}
                                                                {formatDateTime(
                                                                    report.generated_at ??
                                                                        report.created_at,
                                                                )}
                                                            </p>
                                                        </div>
                                                    </TableCell>
                                                    <TableCell>
                                                        <ReportTypeBadge
                                                            type={report.report_type}
                                                        />
                                                    </TableCell>
                                                    <TableCell>
                                                        <ReportStatusBadge
                                                            status={report.status}
                                                        />
                                                    </TableCell>
                                                    <TableCell>
                                                        <div className="space-y-1 text-sm">
                                                            <p>
                                                                Hotspot:{' '}
                                                                <span className="font-medium">
                                                                    {report.hotspot
                                                                        ?.hotspot_code ?? '-'}
                                                                </span>
                                                            </p>
                                                            <p>
                                                                Run:{' '}
                                                                <span className="font-medium">
                                                                    {report.analysis_run?.name ??
                                                                        '-'}
                                                                </span>
                                                            </p>
                                                        </div>
                                                    </TableCell>
                                                    <TableCell>
                                                        {report.generated_by?.name ?? '-'}
                                                    </TableCell>
                                                    <TableCell>
                                                        <a
                                                            href={report.download_url}
                                                            className="inline-flex h-9 items-center justify-center rounded-lg bg-primary px-3 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
                                                        >
                                                            Download
                                                        </a>
                                                    </TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                )}
                            </CardContent>
                        </Card>
                    </div>

                    <div className="space-y-6">
                        <Card>
                            <CardHeader>
                                <CardTitle>Shortcut Generate</CardTitle>
                                <CardDescription>
                                    Pembuatan report tetap diarahkan dari halaman entitas asal agar konteksnya tidak hilang.
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                <Link
                                    href={route('hotspots.index')}
                                    className="inline-flex w-full items-center justify-center rounded-lg border border-input bg-background px-4 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground"
                                >
                                    Buka Modul Hotspots
                                </Link>
                                <Link
                                    href={route('analysis-runs.index')}
                                    className="inline-flex w-full items-center justify-center rounded-lg border border-input bg-background px-4 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground"
                                >
                                    Buka Analysis Runs
                                </Link>
                                <Link
                                    href={route('dashboard')}
                                    className="inline-flex w-full items-center justify-center rounded-lg border border-input bg-background px-4 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground"
                                >
                                    Kembali ke Dashboard
                                </Link>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle>Ringkasan Konten</CardTitle>
                                <CardDescription>
                                    Metadata ini membantu tim memeriksa volume report tanpa membuka PDF satu per satu.
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-3 text-sm">
                                <p>
                                    Halaman aktif:{' '}
                                    <span className="font-medium">
                                        {meta.current_page ?? 1} / {meta.last_page ?? 1}
                                    </span>
                                </p>
                                <p>
                                    Per page:{' '}
                                    <span className="font-medium">
                                        {formatNumber(filters.per_page, 0)}
                                    </span>
                                </p>
                                <p>
                                    Total tersedia:{' '}
                                    <span className="font-medium">
                                        {formatNumber(meta.total ?? 0, 0)}
                                    </span>
                                </p>
                            </CardContent>
                        </Card>
                    </div>
                </section>
            </div>
        </AuthenticatedLayout>
    );
}
