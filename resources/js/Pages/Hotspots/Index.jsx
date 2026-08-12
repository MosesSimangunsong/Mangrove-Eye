import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { fetchDashboardBootstrap, fetchHotspotDetail, fetchHotspots } from '@/lib/api';
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
import PriorityBadge from '@/Components/Hotspots/PriorityBadge';
import ValidationStatusBadge from '@/Components/Hotspots/ValidationStatusBadge';
import {
    formatDateTime,
    formatNumber,
    PRIORITY_OPTIONS,
    STATUS_OPTIONS,
} from '@/Components/Dashboard/dashboardHelpers';

function matchesSearch(hotspot, keyword) {
    if (!keyword) {
        return true;
    }

    const haystack = [
        hotspot.hotspot_code,
        hotspot.analysis_run?.name,
        hotspot.aoi_area?.name,
        hotspot.priority,
        hotspot.validation_status,
    ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase();

    return haystack.includes(keyword.toLowerCase());
}

export default function HotspotsIndex() {
    const [bootstrap, setBootstrap] = useState({ analysisRuns: [], aoiAreas: [] });
    const [items, setItems] = useState([]);
    const [meta, setMeta] = useState({ current_page: 1, last_page: 1, total: 0 });
    const [filters, setFilters] = useState({
        search: '',
        analysis_run_id: 'all',
        aoi_area_id: 'all',
        priority: 'all',
        validation_status: 'all',
        per_page: 15,
        page: 1,
    });
    const [selectedPreviewId, setSelectedPreviewId] = useState(null);
    const [previewHotspot, setPreviewHotspot] = useState(null);
    const [loading, setLoading] = useState(true);
    const [previewLoading, setPreviewLoading] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        let active = true;

        async function loadBootstrap() {
            try {
                const data = await fetchDashboardBootstrap();

                if (!active) {
                    return;
                }

                setBootstrap({
                    analysisRuns: data.analysisRuns,
                    aoiAreas: data.aoiAreas,
                });
            } catch {
                if (active) {
                    setError('Gagal memuat metadata analysis run atau AOI untuk halaman hotspot.');
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

        async function loadHotspots() {
            setLoading(true);
            setError('');

            try {
                const response = await fetchHotspots({
                    analysis_run_id: filters.analysis_run_id,
                    aoi_area_id: filters.aoi_area_id,
                    priority: filters.priority,
                    validation_status: filters.validation_status,
                    per_page: filters.per_page,
                    page: filters.page,
                });

                if (!active) {
                    return;
                }

                const filteredItems = response.data.filter((hotspot) =>
                    matchesSearch(hotspot, filters.search),
                );

                setItems(filteredItems);
                setMeta(response.meta);

                if (filteredItems.length > 0 && !selectedPreviewId) {
                    setSelectedPreviewId(filteredItems[0].id);
                }
            } catch {
                if (active) {
                    setItems([]);
                    setError('Data hotspot belum berhasil dimuat.');
                }
            } finally {
                if (active) {
                    setLoading(false);
                }
            }
        }

        loadHotspots();

        return () => {
            active = false;
        };
    }, [
        filters.analysis_run_id,
        filters.aoi_area_id,
        filters.priority,
        filters.validation_status,
        filters.per_page,
        filters.page,
        filters.search,
        selectedPreviewId,
    ]);

    useEffect(() => {
        if (!selectedPreviewId) {
            setPreviewHotspot(null);
            return;
        }

        let active = true;

        async function loadPreview() {
            setPreviewLoading(true);

            try {
                const detail = await fetchHotspotDetail(selectedPreviewId);

                if (active) {
                    setPreviewHotspot(detail);
                }
            } catch {
                if (active) {
                    setPreviewHotspot(null);
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
            validated: items.filter((item) => item.validation_status === 'validated').length,
            high: items.filter((item) => item.priority === 'high').length,
            area: items.reduce((sum, item) => sum + Number(item.area_ha ?? 0), 0),
        };
    }, [items]);

    function setFilter(key, value) {
        setFilters((current) => ({
            ...current,
            [key]: value,
            page: key === 'page' ? value : 1,
        }));
    }

    return (
        <AuthenticatedLayout
            title="Hotspots"
            description="Pantau dan telaah indikasi awal perubahan tutupan mangrove secara page-per-page tanpa menumpuk semuanya di dashboard."
            eyebrow="Hotspot management"
            breadcrumbItems={[
                { label: 'Dashboard', href: '/dashboard' },
                { label: 'Hotspots' },
            ]}
        >
            <Head title="Hotspots" />

            <div className="space-y-6">
                {error ? (
                    <Alert variant="destructive">
                        <AlertTitle>Gagal memuat hotspot</AlertTitle>
                        <AlertDescription>{error}</AlertDescription>
                    </Alert>
                ) : null}

                <section className="grid gap-4 lg:grid-cols-4">
                    <Card>
                        <CardHeader className="pb-3">
                            <CardDescription>Hotspot tampil</CardDescription>
                            <CardTitle>{loading ? '...' : summary.total}</CardTitle>
                        </CardHeader>
                    </Card>
                    <Card>
                        <CardHeader className="pb-3">
                            <CardDescription>Validated</CardDescription>
                            <CardTitle>{loading ? '...' : summary.validated}</CardTitle>
                        </CardHeader>
                    </Card>
                    <Card>
                        <CardHeader className="pb-3">
                            <CardDescription>High priority</CardDescription>
                            <CardTitle>{loading ? '...' : summary.high}</CardTitle>
                        </CardHeader>
                    </Card>
                    <Card>
                        <CardHeader className="pb-3">
                            <CardDescription>Area tampil</CardDescription>
                            <CardTitle>{loading ? '...' : `${formatNumber(summary.area, 2)} ha`}</CardTitle>
                        </CardHeader>
                    </Card>
                </section>

                <section className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_22rem]">
                    <div className="space-y-6">
                        <Card>
                            <CardHeader>
                                <CardTitle>Filter Hotspot</CardTitle>
                                <CardDescription>
                                    Gunakan filter ini untuk mempersempit daftar hotspot sebelum membuka detail.
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                                <label className="space-y-2 text-sm">
                                    <span className="font-medium text-foreground">Search</span>
                                    <Input
                                        value={filters.search}
                                        onChange={(event) => setFilter('search', event.target.value)}
                                        placeholder="Cari kode hotspot atau analysis run"
                                    />
                                </label>

                                <label className="space-y-2 text-sm">
                                    <span className="font-medium text-foreground">Analysis Run</span>
                                    <select
                                        className="flex h-10 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm"
                                        value={filters.analysis_run_id}
                                        onChange={(event) => setFilter('analysis_run_id', event.target.value)}
                                    >
                                        <option value="all">Semua run</option>
                                        {bootstrap.analysisRuns.map((run) => (
                                            <option key={run.id} value={run.id}>
                                                {run.name}
                                            </option>
                                        ))}
                                    </select>
                                </label>

                                <label className="space-y-2 text-sm">
                                    <span className="font-medium text-foreground">AOI</span>
                                    <select
                                        className="flex h-10 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm"
                                        value={filters.aoi_area_id}
                                        onChange={(event) => setFilter('aoi_area_id', event.target.value)}
                                    >
                                        <option value="all">Semua AOI</option>
                                        {bootstrap.aoiAreas.map((aoi) => (
                                            <option key={aoi.id} value={aoi.id}>
                                                {aoi.name}
                                            </option>
                                        ))}
                                    </select>
                                </label>

                                <label className="space-y-2 text-sm">
                                    <span className="font-medium text-foreground">Priority</span>
                                    <select
                                        className="flex h-10 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm"
                                        value={filters.priority}
                                        onChange={(event) => setFilter('priority', event.target.value)}
                                    >
                                        {PRIORITY_OPTIONS.map((option) => (
                                            <option key={option.value} value={option.value}>
                                                {option.label}
                                            </option>
                                        ))}
                                    </select>
                                </label>

                                <label className="space-y-2 text-sm">
                                    <span className="font-medium text-foreground">Validation Status</span>
                                    <select
                                        className="flex h-10 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm"
                                        value={filters.validation_status}
                                        onChange={(event) => setFilter('validation_status', event.target.value)}
                                    >
                                        {STATUS_OPTIONS.map((option) => (
                                            <option key={option.value} value={option.value}>
                                                {option.label}
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
                                                analysis_run_id: 'all',
                                                aoi_area_id: 'all',
                                                priority: 'all',
                                                validation_status: 'all',
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
                                <CardTitle>Daftar Hotspot</CardTitle>
                                <CardDescription>
                                    Klik baris untuk memilih preview cepat, atau buka halaman detail untuk telaah lengkap.
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Kode</TableHead>
                                            <TableHead>Priority</TableHead>
                                            <TableHead>Status</TableHead>
                                            <TableHead>Area</TableHead>
                                            <TableHead>Analysis Run</TableHead>
                                            <TableHead>Detected</TableHead>
                                            <TableHead className="text-right">Action</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {loading ? (
                                            <TableRow>
                                                <TableCell colSpan={7}>Memuat data hotspot...</TableCell>
                                            </TableRow>
                                        ) : items.length === 0 ? (
                                            <TableRow>
                                                <TableCell colSpan={7}>
                                                    Tidak ada hotspot yang cocok dengan filter saat ini.
                                                </TableCell>
                                            </TableRow>
                                        ) : (
                                            items.map((hotspot) => (
                                                <TableRow
                                                    key={hotspot.id}
                                                    data-state={selectedPreviewId === hotspot.id ? 'selected' : undefined}
                                                    className="cursor-pointer"
                                                    onClick={() => setSelectedPreviewId(hotspot.id)}
                                                >
                                                    <TableCell className="font-medium">{hotspot.hotspot_code}</TableCell>
                                                    <TableCell><PriorityBadge priority={hotspot.priority} /></TableCell>
                                                    <TableCell><ValidationStatusBadge status={hotspot.validation_status} /></TableCell>
                                                    <TableCell>{formatNumber(hotspot.area_ha, 2)} ha</TableCell>
                                                    <TableCell>{hotspot.analysis_run?.name ?? '-'}</TableCell>
                                                    <TableCell>{formatDateTime(hotspot.detected_at)}</TableCell>
                                                    <TableCell className="text-right">
                                                        <Link
                                                            href={route('hotspots.show', hotspot.id)}
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
                            <CardTitle>Preview Terpilih</CardTitle>
                            <CardDescription>
                                Ringkasan cepat hotspot yang dipilih dari tabel.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {previewLoading ? (
                                <p className="text-sm text-muted-foreground">Memuat preview hotspot...</p>
                            ) : previewHotspot ? (
                                <>
                                    <div className="space-y-1">
                                        <p className="text-sm text-muted-foreground">Hotspot code</p>
                                        <p className="text-base font-semibold">{previewHotspot.hotspot_code}</p>
                                    </div>
                                    <div className="flex flex-wrap gap-2">
                                        <PriorityBadge priority={previewHotspot.priority} />
                                        <ValidationStatusBadge status={previewHotspot.validation_status} />
                                    </div>
                                    <div className="space-y-2 text-sm text-muted-foreground">
                                        <p>AOI: <span className="font-medium text-foreground">{previewHotspot.aoi_area?.name ?? '-'}</span></p>
                                        <p>Analysis Run: <span className="font-medium text-foreground">{previewHotspot.analysis_run?.name ?? '-'}</span></p>
                                        <p>Area: <span className="font-medium text-foreground">{formatNumber(previewHotspot.area_ha, 2)} ha</span></p>
                                        <p>Detected: <span className="font-medium text-foreground">{formatDateTime(previewHotspot.detected_at)}</span></p>
                                    </div>
                                    <Link
                                        href={route('hotspots.show', previewHotspot.id)}
                                        className="inline-flex w-full items-center justify-center rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
                                    >
                                        Buka Detail Lengkap
                                    </Link>
                                </>
                            ) : (
                                <p className="text-sm text-muted-foreground">
                                    Pilih satu hotspot dari tabel untuk melihat preview cepat.
                                </p>
                            )}
                        </CardContent>
                    </Card>
                </section>
            </div>
        </AuthenticatedLayout>
    );
}
