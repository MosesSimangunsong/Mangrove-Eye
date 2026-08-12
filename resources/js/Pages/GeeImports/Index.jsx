import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { fetchAnalysisRuns, fetchGeeImports } from '@/lib/api';
import { Head } from '@inertiajs/react';
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
import GeeImportStatusBadge from '@/Components/GeeImports/GeeImportStatusBadge';
import AnalysisRunStatusBadge from '@/Components/AnalysisRuns/AnalysisRunStatusBadge';
import { formatDateTime } from '@/Components/Dashboard/dashboardHelpers';

const IMPORT_STATUS_OPTIONS = [
    { value: 'all', label: 'Semua status' },
    { value: 'pending', label: 'Pending' },
    { value: 'imported', label: 'Imported' },
    { value: 'failed', label: 'Failed' },
];

function matchesSearch(item, keyword) {
    if (!keyword) {
        return true;
    }

    const haystack = [
        item.file_name,
        item.original_filename,
        item.import_type,
        item.status,
        item.gee_task_id,
    ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase();

    return haystack.includes(keyword.toLowerCase());
}

export default function GeeImportsIndex({ initialAnalysisRunId = null }) {
    const [analysisRuns, setAnalysisRuns] = useState([]);
    const [items, setItems] = useState([]);
    const [meta, setMeta] = useState({ current_page: 1, last_page: 1, total: 0 });
    const [filters, setFilters] = useState({
        search: '',
        analysis_run_id: initialAnalysisRunId ? String(initialAnalysisRunId) : 'all',
        status: 'all',
        per_page: 15,
        page: 1,
    });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        let active = true;

        async function loadRuns() {
            try {
                const response = await fetchAnalysisRuns({ per_page: 100 });

                if (active) {
                    setAnalysisRuns(response.data);
                }
            } catch {
                if (active) {
                    setError('Metadata analysis run belum berhasil dimuat untuk halaman GEE import.');
                }
            }
        }

        loadRuns();

        return () => {
            active = false;
        };
    }, []);

    useEffect(() => {
        let active = true;

        async function loadImports() {
            if (filters.analysis_run_id === 'all') {
                setItems([]);
                setMeta({ current_page: 1, last_page: 1, total: 0 });
                setLoading(false);
                return;
            }

            setLoading(true);
            setError('');

            try {
                const response = await fetchGeeImports(filters.analysis_run_id, {
                    status: filters.status,
                    per_page: filters.per_page,
                    page: filters.page,
                });

                if (!active) {
                    return;
                }

                const filteredItems = response.data.filter((item) => matchesSearch(item, filters.search));
                setItems(filteredItems);
                setMeta(response.meta);
            } catch {
                if (active) {
                    setItems([]);
                    setError('Riwayat GEE import belum berhasil dimuat.');
                }
            } finally {
                if (active) {
                    setLoading(false);
                }
            }
        }

        loadImports();

        return () => {
            active = false;
        };
    }, [
        filters.analysis_run_id,
        filters.status,
        filters.per_page,
        filters.page,
        filters.search,
    ]);

    const selectedRun = useMemo(
        () => analysisRuns.find((run) => String(run.id) === String(filters.analysis_run_id)) ?? null,
        [analysisRuns, filters.analysis_run_id],
    );

    function setFilter(key, value) {
        setFilters((current) => ({
            ...current,
            [key]: value,
            page: key === 'page' ? value : 1,
        }));
    }

    return (
        <AuthenticatedLayout
            title="GEE Imports"
            description="Tinjau riwayat import hotspot GeoJSON dari Google Earth Engine secara lebih fokus per analysis run."
            eyebrow="GEE import history"
            breadcrumbItems={[
                { label: 'Dashboard', href: '/dashboard' },
                { label: 'GEE Imports' },
            ]}
        >
            <Head title="GEE Imports" />

            <div className="space-y-6">
                {error ? (
                    <Alert variant="destructive">
                        <AlertTitle>Gagal memuat GEE import</AlertTitle>
                        <AlertDescription>{error}</AlertDescription>
                    </Alert>
                ) : null}

                <section className="grid gap-4 lg:grid-cols-3">
                    <Card>
                        <CardHeader>
                            <CardDescription>Analysis run aktif</CardDescription>
                            <CardTitle className="text-base">
                                {selectedRun?.name ?? 'Pilih analysis run'}
                            </CardTitle>
                        </CardHeader>
                    </Card>
                    <Card>
                        <CardHeader>
                            <CardDescription>Status run</CardDescription>
                            <CardTitle>
                                {selectedRun ? <AnalysisRunStatusBadge status={selectedRun.status} /> : '-'}
                            </CardTitle>
                        </CardHeader>
                    </Card>
                    <Card>
                        <CardHeader>
                            <CardDescription>Import tampil</CardDescription>
                            <CardTitle>{loading ? '...' : items.length}</CardTitle>
                        </CardHeader>
                    </Card>
                </section>

                <Card>
                    <CardHeader>
                        <CardTitle>Filter GEE Imports</CardTitle>
                        <CardDescription>
                            Pilih analysis run terlebih dahulu untuk melihat riwayat import terkait.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                        <label className="space-y-2 text-sm">
                            <span className="font-medium text-foreground">Analysis Run</span>
                            <select
                                className="flex h-10 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm"
                                value={filters.analysis_run_id}
                                onChange={(event) => setFilter('analysis_run_id', event.target.value)}
                            >
                                <option value="all">Pilih analysis run</option>
                                {analysisRuns.map((run) => (
                                    <option key={run.id} value={run.id}>
                                        {run.name}
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
                                {IMPORT_STATUS_OPTIONS.map((option) => (
                                    <option key={option.value} value={option.value}>
                                        {option.label}
                                    </option>
                                ))}
                            </select>
                        </label>

                        <label className="space-y-2 text-sm">
                            <span className="font-medium text-foreground">Search</span>
                            <Input
                                value={filters.search}
                                onChange={(event) => setFilter('search', event.target.value)}
                                placeholder="Cari file atau task id"
                            />
                        </label>

                        <div className="flex items-end">
                            <Button
                                variant="outline"
                                className="w-full"
                                onClick={() =>
                                    setFilters({
                                        search: '',
                                        analysis_run_id: initialAnalysisRunId ? String(initialAnalysisRunId) : 'all',
                                        status: 'all',
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
                        <CardTitle>Riwayat Import</CardTitle>
                        <CardDescription>
                            Halaman ini masih fokus pada monitoring riwayat. Form upload/import tetap bisa dipindahkan pada tahap berikutnya.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>File</TableHead>
                                    <TableHead>Import Type</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead>Total Features</TableHead>
                                    <TableHead>Imported At</TableHead>
                                    <TableHead>Task ID</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {filters.analysis_run_id === 'all' ? (
                                    <TableRow>
                                        <TableCell colSpan={6}>
                                            Pilih analysis run untuk melihat riwayat GEE import.
                                        </TableCell>
                                    </TableRow>
                                ) : loading ? (
                                    <TableRow>
                                        <TableCell colSpan={6}>Memuat data GEE import...</TableCell>
                                    </TableRow>
                                ) : items.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={6}>
                                            Belum ada riwayat import yang cocok dengan filter saat ini.
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    items.map((item) => (
                                        <TableRow key={item.id}>
                                            <TableCell className="font-medium">{item.original_filename ?? item.file_name ?? '-'}</TableCell>
                                            <TableCell>{item.import_type ?? '-'}</TableCell>
                                            <TableCell><GeeImportStatusBadge status={item.status} /></TableCell>
                                            <TableCell>{item.total_features ?? 0}</TableCell>
                                            <TableCell>{formatDateTime(item.imported_at ?? item.created_at)}</TableCell>
                                            <TableCell>{item.gee_task_id ?? '-'}</TableCell>
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
        </AuthenticatedLayout>
    );
}
