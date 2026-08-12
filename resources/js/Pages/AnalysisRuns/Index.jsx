import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { fetchAoiAreas, fetchAnalysisRunDetail, fetchAnalysisRuns } from '@/lib/api';
import { Head, Link } from '@inertiajs/react';
import { useEffect, useMemo, useState } from 'react';
import { Alert, AlertDescription, AlertTitle } from '@/Components/ui/alert';
import { Button } from '@/Components/ui/button';
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
import { formatDateTime, formatNumber } from '@/Components/Dashboard/dashboardHelpers';
import AnalysisRunStatusBadge from '@/Components/AnalysisRuns/AnalysisRunStatusBadge';

const STATUS_OPTIONS = [
    { value: 'all', label: 'Semua status' },
    { value: 'draft', label: 'Draft' },
    { value: 'processed', label: 'Processed' },
    { value: 'published', label: 'Published' },
    { value: 'archived', label: 'Archived' },
    { value: 'failed', label: 'Failed' },
];

function matchesSearch(run, keyword) {
    if (!keyword) {
        return true;
    }

    const haystack = [
        run.name,
        run.description,
        run.aoi_area?.name,
        run.dataset_name,
        run.status,
    ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase();

    return haystack.includes(keyword.toLowerCase());
}

export default function AnalysisRunsIndex() {
    const [aoiAreas, setAoiAreas] = useState([]);
    const [items, setItems] = useState([]);
    const [meta, setMeta] = useState({ current_page: 1, last_page: 1, total: 0 });
    const [filters, setFilters] = useState({
        search: '',
        aoi_area_id: 'all',
        status: 'all',
        year: 'all',
        per_page: 15,
        page: 1,
    });
    const [selectedPreviewId, setSelectedPreviewId] = useState(null);
    const [previewRun, setPreviewRun] = useState(null);
    const [loading, setLoading] = useState(true);
    const [previewLoading, setPreviewLoading] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        let active = true;

        async function loadAoiAreas() {
            try {
                const response = await fetchAoiAreas({ per_page: 100 });

                if (active) {
                    setAoiAreas(response.data);
                }
            } catch {
                if (active) {
                    setError('Metadata AOI belum berhasil dimuat untuk analysis run.');
                }
            }
        }

        loadAoiAreas();

        return () => {
            active = false;
        };
    }, []);

    useEffect(() => {
        let active = true;

        async function loadRuns() {
            setLoading(true);
            setError('');

            try {
                const response = await fetchAnalysisRuns({
                    aoi_area_id: filters.aoi_area_id,
                    status: filters.status,
                    year: filters.year,
                    per_page: filters.per_page,
                    page: filters.page,
                });

                if (!active) {
                    return;
                }

                const filteredItems = response.data.filter((run) => matchesSearch(run, filters.search));

                setItems(filteredItems);
                setMeta(response.meta);

                if (filteredItems.length > 0 && !selectedPreviewId) {
                    setSelectedPreviewId(filteredItems[0].id);
                }
            } catch {
                if (active) {
                    setItems([]);
                    setError('Data analysis run belum berhasil dimuat.');
                }
            } finally {
                if (active) {
                    setLoading(false);
                }
            }
        }

        loadRuns();

        return () => {
            active = false;
        };
    }, [
        filters.aoi_area_id,
        filters.status,
        filters.year,
        filters.per_page,
        filters.page,
        filters.search,
        selectedPreviewId,
    ]);

    useEffect(() => {
        if (!selectedPreviewId) {
            setPreviewRun(null);
            return;
        }

        let active = true;

        async function loadPreview() {
            setPreviewLoading(true);

            try {
                const detail = await fetchAnalysisRunDetail(selectedPreviewId);

                if (active) {
                    setPreviewRun(detail);
                }
            } catch {
                if (active) {
                    setPreviewRun(null);
                }
            } finally {
                if (active) {
                    setPreviewLoading(false);
                }
            }
        }

        loadPreview();

        return () => {
            active = false;
        };
    }, [selectedPreviewId]);

    const summary = useMemo(() => {
        return {
            total: items.length,
            processed: items.filter((item) => item.status === 'processed').length,
            failed: items.filter((item) => item.status === 'failed').length,
            area: items.reduce((sum, item) => sum + Number(item.total_area_ha ?? 0), 0),
        };
    }, [items]);

    function setFilter(key, value) {
        setFilters((current) => ({
            ...current,
            [key]: value,
            page: key === 'page' ? value : 1,
        }));
    }

    const currentYear = new Date().getFullYear();
    const years = Array.from({ length: 5 }, (_, index) => currentYear - index);

    return (
        <AuthenticatedLayout
            title="Analysis Runs"
            description="Kelola dan telaah metadata before-after sebagai penghubung antara AOI, dashboard, dan import hasil GEE."
            eyebrow="Analysis workspace"
            breadcrumbItems={[
                { label: 'Dashboard', href: '/dashboard' },
                { label: 'Analysis Runs' },
            ]}
        >
            <Head title="Analysis Runs" />

            <div className="space-y-6">
                {error ? (
                    <Alert variant="destructive">
                        <AlertTitle>Gagal memuat analysis run</AlertTitle>
                        <AlertDescription>{error}</AlertDescription>
                    </Alert>
                ) : null}

                <section className="grid gap-4 lg:grid-cols-4">
                    <Card>
                        <CardHeader className="pb-3">
                            <CardDescription>Run tampil</CardDescription>
                            <CardTitle>{loading ? '...' : summary.total}</CardTitle>
                        </CardHeader>
                    </Card>
                    <Card>
                        <CardHeader className="pb-3">
                            <CardDescription>Processed</CardDescription>
                            <CardTitle>{loading ? '...' : summary.processed}</CardTitle>
                        </CardHeader>
                    </Card>
                    <Card>
                        <CardHeader className="pb-3">
                            <CardDescription>Failed</CardDescription>
                            <CardTitle>{loading ? '...' : summary.failed}</CardTitle>
                        </CardHeader>
                    </Card>
                    <Card>
                        <CardHeader className="pb-3">
                            <CardDescription>Total area</CardDescription>
                            <CardTitle>{loading ? '...' : `${formatNumber(summary.area, 2)} ha`}</CardTitle>
                        </CardHeader>
                    </Card>
                </section>

                <section className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_24rem]">
                    <div className="space-y-6">
                        <Card>
                            <CardHeader>
                                <CardTitle>Filter Analysis Run</CardTitle>
                                <CardDescription>
                                    Saring run berdasarkan AOI, status, dan tahun agar penelusuran lebih fokus.
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
                                <label className="space-y-2 text-sm">
                                    <span className="font-medium text-foreground">Search</span>
                                    <Input
                                        value={filters.search}
                                        onChange={(event) => setFilter('search', event.target.value)}
                                        placeholder="Cari nama run atau dataset"
                                    />
                                </label>

                                <label className="space-y-2 text-sm">
                                    <span className="font-medium text-foreground">AOI</span>
                                    <select
                                        className="flex h-10 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm"
                                        value={filters.aoi_area_id}
                                        onChange={(event) => setFilter('aoi_area_id', event.target.value)}
                                    >
                                        <option value="all">Semua AOI</option>
                                        {aoiAreas.map((aoi) => (
                                            <option key={aoi.id} value={aoi.id}>
                                                {aoi.name}
                                            </option>
                                        ))}
                                    </select>
                                </label>

                                <label className="space-y-2 text-sm">
                                    <span className="font-medium text-foreground">Status</span>
                                    <select
                                        className="flex h-10 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm"
                                        value={filters.status}
                                        onChange={(event) => setFilter('status', event.target.value)}
                                    >
                                        {STATUS_OPTIONS.map((option) => (
                                            <option key={option.value} value={option.value}>
                                                {option.label}
                                            </option>
                                        ))}
                                    </select>
                                </label>

                                <label className="space-y-2 text-sm">
                                    <span className="font-medium text-foreground">Year</span>
                                    <select
                                        className="flex h-10 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm"
                                        value={filters.year}
                                        onChange={(event) => setFilter('year', event.target.value)}
                                    >
                                        <option value="all">Semua tahun</option>
                                        {years.map((year) => (
                                            <option key={year} value={year}>
                                                {year}
                                            </option>
                                        ))}
                                    </select>
                                </label>

                                <div className="flex items-end">
                                    <Button
                                        variant="outline"
                                        className="w-full"
                                        onClick={() =>
                                            setFilters({
                                                search: '',
                                                aoi_area_id: 'all',
                                                status: 'all',
                                                year: 'all',
                                                per_page: 15,
                                                page: 1,
                                            })
                                        }
                                    >
                                        Reset Filter
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle>Daftar Analysis Run</CardTitle>
                                <CardDescription>
                                    Buka detail run untuk melihat periode before-after dan shortcut ke GEE imports.
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Nama</TableHead>
                                            <TableHead>AOI</TableHead>
                                            <TableHead>Status</TableHead>
                                            <TableHead>Periode After</TableHead>
                                            <TableHead>Total Hotspot</TableHead>
                                            <TableHead>Total Area</TableHead>
                                            <TableHead className="text-right">Action</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {loading ? (
                                            <TableRow>
                                                <TableCell colSpan={7}>Memuat data analysis run...</TableCell>
                                            </TableRow>
                                        ) : items.length === 0 ? (
                                            <TableRow>
                                                <TableCell colSpan={7}>
                                                    Tidak ada analysis run yang cocok dengan filter saat ini.
                                                </TableCell>
                                            </TableRow>
                                        ) : (
                                            items.map((run) => (
                                                <TableRow
                                                    key={run.id}
                                                    data-state={selectedPreviewId === run.id ? 'selected' : undefined}
                                                    className="cursor-pointer"
                                                    onClick={() => setSelectedPreviewId(run.id)}
                                                >
                                                    <TableCell className="font-medium">{run.name}</TableCell>
                                                    <TableCell>{run.aoi_area?.name ?? '-'}</TableCell>
                                                    <TableCell><AnalysisRunStatusBadge status={run.status} /></TableCell>
                                                    <TableCell>
                                                        {run.after_period?.start ?? '-'} - {run.after_period?.end ?? '-'}
                                                    </TableCell>
                                                    <TableCell>{run.total_hotspots ?? 0}</TableCell>
                                                    <TableCell>{formatNumber(run.total_area_ha, 2)} ha</TableCell>
                                                    <TableCell className="text-right">
                                                        <Link
                                                            href={route('analysis-runs.show', run.id)}
                                                            className="inline-flex h-9 items-center justify-center rounded-lg bg-primary px-3 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
                                                        >
                                                            Buka Detail
                                                        </Link>
                                                    </TableCell>
                                                </TableRow>
                                            ))
                                        )}
                                    </TableBody>
                                </Table>

                                <div className="mt-4 flex items-center justify-between gap-3">
                                    <p className="text-sm text-muted-foreground">
                                        Total API: {meta.total ?? 0} item
                                    </p>
                                    <div className="flex items-center gap-2">
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            disabled={(meta.current_page ?? 1) <= 1}
                                            onClick={() => setFilter('page', Math.max((meta.current_page ?? 1) - 1, 1))}
                                        >
                                            Prev
                                        </Button>
                                        <span className="text-sm text-muted-foreground">
                                            Halaman {meta.current_page ?? 1} / {meta.last_page ?? 1}
                                        </span>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            disabled={(meta.current_page ?? 1) >= (meta.last_page ?? 1)}
                                            onClick={() => setFilter('page', (meta.current_page ?? 1) + 1)}
                                        >
                                            Next
                                        </Button>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    <Card className="h-fit">
                        <CardHeader>
                            <CardTitle>Preview Run</CardTitle>
                            <CardDescription>
                                Ringkasan cepat analysis run yang dipilih dari tabel.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {previewLoading ? (
                                <p className="text-sm text-muted-foreground">Memuat preview analysis run...</p>
                            ) : previewRun ? (
                                <>
                                    <div className="space-y-1">
                                        <p className="text-sm text-muted-foreground">Run name</p>
                                        <p className="text-base font-semibold">{previewRun.name}</p>
                                    </div>
                                    <div className="flex flex-wrap gap-2">
                                        <AnalysisRunStatusBadge status={previewRun.status} />
                                    </div>
                                    <div className="space-y-2 text-sm text-muted-foreground">
                                        <p>AOI: <span className="font-medium text-foreground">{previewRun.aoi_area?.name ?? '-'}</span></p>
                                        <p>Dataset: <span className="font-medium text-foreground">{previewRun.dataset_name ?? '-'}</span></p>
                                        <p>Hotspot: <span className="font-medium text-foreground">{previewRun.total_hotspots ?? 0}</span></p>
                                        <p>Area: <span className="font-medium text-foreground">{formatNumber(previewRun.total_area_ha, 2)} ha</span></p>
                                        <p>Updated: <span className="font-medium text-foreground">{formatDateTime(previewRun.updated_at)}</span></p>
                                    </div>
                                    <div className="grid gap-2">
                                        <Link
                                            href={route('analysis-runs.show', previewRun.id)}
                                            className="inline-flex w-full items-center justify-center rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
                                        >
                                            Buka Detail Run
                                        </Link>
                                        <Link
                                            href={route('gee-imports.index', { analysis_run_id: previewRun.id })}
                                            className="inline-flex w-full items-center justify-center rounded-lg border border-input bg-background px-4 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground"
                                        >
                                            Lihat GEE Imports
                                        </Link>
                                    </div>
                                </>
                            ) : (
                                <p className="text-sm text-muted-foreground">
                                    Pilih satu analysis run dari tabel untuk melihat preview cepat.
                                </p>
                            )}
                        </CardContent>
                    </Card>
                </section>
            </div>
        </AuthenticatedLayout>
    );
}
