import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { fetchAoiAreaDetail, fetchAoiAreas } from '@/lib/api';
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
import WebGISMap from '@/Components/WebGIS/WebGISMap';
import { formatDateTime, formatNumber } from '@/Components/Dashboard/dashboardHelpers';
import AoiTypeBadge from '@/Components/AoiAreas/AoiTypeBadge';
import VerificationStatusBadge from '@/Components/AoiAreas/VerificationStatusBadge';

const AOI_TYPE_OPTIONS = [
    { value: 'all', label: 'Semua tipe' },
    { value: 'main_aoi', label: 'Main AOI' },
    { value: 'conflict_zone', label: 'Conflict Zone' },
    { value: 'buffer', label: 'Buffer' },
    { value: 'reference', label: 'Reference' },
];

const VERIFICATION_OPTIONS = [
    { value: 'all', label: 'Semua status' },
    { value: 'draft', label: 'Draft' },
    { value: 'verified', label: 'Verified' },
    { value: 'needs_revision', label: 'Needs Revision' },
];

function matchesSearch(aoi, keyword) {
    if (!keyword) {
        return true;
    }

    const haystack = [
        aoi.code,
        aoi.name,
        aoi.aoi_type,
        aoi.village,
        aoi.district,
        aoi.regency,
        aoi.province,
        aoi.verification_status,
    ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase();

    return haystack.includes(keyword.toLowerCase());
}

export default function AoiAreasIndex() {
    const [items, setItems] = useState([]);
    const [meta, setMeta] = useState({ current_page: 1, last_page: 1, total: 0 });
    const [filters, setFilters] = useState({
        search: '',
        aoi_type: 'all',
        verification_status: 'all',
        per_page: 15,
        page: 1,
    });
    const [selectedPreviewId, setSelectedPreviewId] = useState(null);
    const [previewAoi, setPreviewAoi] = useState(null);
    const [loading, setLoading] = useState(true);
    const [previewLoading, setPreviewLoading] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        let active = true;

        async function loadAoiAreas() {
            setLoading(true);
            setError('');

            try {
                const response = await fetchAoiAreas({
                    aoi_type: filters.aoi_type,
                    verification_status: filters.verification_status,
                    per_page: filters.per_page,
                    page: filters.page,
                });

                if (!active) {
                    return;
                }

                const filteredItems = response.data.filter((aoi) => matchesSearch(aoi, filters.search));

                setItems(filteredItems);
                setMeta(response.meta);

                if (filteredItems.length > 0 && !selectedPreviewId) {
                    setSelectedPreviewId(filteredItems[0].id);
                }
            } catch {
                if (active) {
                    setItems([]);
                    setError('Data AOI belum berhasil dimuat.');
                }
            } finally {
                if (active) {
                    setLoading(false);
                }
            }
        }

        loadAoiAreas();

        return () => {
            active = false;
        };
    }, [
        filters.aoi_type,
        filters.verification_status,
        filters.per_page,
        filters.page,
        filters.search,
        selectedPreviewId,
    ]);

    useEffect(() => {
        if (!selectedPreviewId) {
            setPreviewAoi(null);
            return;
        }

        let active = true;

        async function loadPreview() {
            setPreviewLoading(true);

            try {
                const detail = await fetchAoiAreaDetail(selectedPreviewId);

                if (active) {
                    setPreviewAoi(detail);
                }
            } catch {
                if (active) {
                    setPreviewAoi(null);
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
            verified: items.filter((item) => item.verification_status === 'verified').length,
            conflict: items.filter((item) => item.aoi_type === 'conflict_zone').length,
            area: items.reduce((sum, item) => sum + Number(item.estimated_area_ha ?? 0), 0),
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
            title="AOI Management"
            description="Kelola dan telaah Area of Interest secara page-per-page agar analisis, dashboard, dan import GEE tetap tertata."
            eyebrow="AOI workspace"
            breadcrumbItems={[
                { label: 'Dashboard', href: '/dashboard' },
                { label: 'AOI Management' },
            ]}
        >
            <Head title="AOI Management" />

            <div className="space-y-6">
                {error ? (
                    <Alert variant="destructive">
                        <AlertTitle>Gagal memuat AOI</AlertTitle>
                        <AlertDescription>{error}</AlertDescription>
                    </Alert>
                ) : null}

                <section className="grid gap-4 lg:grid-cols-4">
                    <Card>
                        <CardHeader className="pb-3">
                            <CardDescription>AOI tampil</CardDescription>
                            <CardTitle>{loading ? '...' : summary.total}</CardTitle>
                        </CardHeader>
                    </Card>
                    <Card>
                        <CardHeader className="pb-3">
                            <CardDescription>Verified</CardDescription>
                            <CardTitle>{loading ? '...' : summary.verified}</CardTitle>
                        </CardHeader>
                    </Card>
                    <Card>
                        <CardHeader className="pb-3">
                            <CardDescription>Conflict zone</CardDescription>
                            <CardTitle>{loading ? '...' : summary.conflict}</CardTitle>
                        </CardHeader>
                    </Card>
                    <Card>
                        <CardHeader className="pb-3">
                            <CardDescription>Estimasi area</CardDescription>
                            <CardTitle>{loading ? '...' : `${formatNumber(summary.area, 2)} ha`}</CardTitle>
                        </CardHeader>
                    </Card>
                </section>

                <section className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_24rem]">
                    <div className="space-y-6">
                        <Card>
                            <CardHeader>
                                <CardTitle>Filter AOI</CardTitle>
                                <CardDescription>
                                    Saring AOI berdasarkan tipe dan status verifikasi sebelum membuka detail.
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                                <label className="space-y-2 text-sm">
                                    <span className="font-medium text-foreground">Search</span>
                                    <Input
                                        value={filters.search}
                                        onChange={(event) => setFilter('search', event.target.value)}
                                        placeholder="Cari kode, nama, atau lokasi AOI"
                                    />
                                </label>

                                <label className="space-y-2 text-sm">
                                    <span className="font-medium text-foreground">Tipe AOI</span>
                                    <select
                                        className="flex h-10 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm"
                                        value={filters.aoi_type}
                                        onChange={(event) => setFilter('aoi_type', event.target.value)}
                                    >
                                        {AOI_TYPE_OPTIONS.map((option) => (
                                            <option key={option.value} value={option.value}>
                                                {option.label}
                                            </option>
                                        ))}
                                    </select>
                                </label>

                                <label className="space-y-2 text-sm">
                                    <span className="font-medium text-foreground">Verification</span>
                                    <select
                                        className="flex h-10 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm"
                                        value={filters.verification_status}
                                        onChange={(event) => setFilter('verification_status', event.target.value)}
                                    >
                                        {VERIFICATION_OPTIONS.map((option) => (
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
                                                aoi_type: 'all',
                                                verification_status: 'all',
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
                                <CardTitle>Daftar AOI</CardTitle>
                                <CardDescription>
                                    Klik baris untuk memilih preview cepat, atau buka detail AOI untuk telaah lebih lengkap.
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Kode</TableHead>
                                            <TableHead>Nama</TableHead>
                                            <TableHead>Tipe</TableHead>
                                            <TableHead>Status</TableHead>
                                            <TableHead>Area</TableHead>
                                            <TableHead>Lokasi</TableHead>
                                            <TableHead className="text-right">Action</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {loading ? (
                                            <TableRow>
                                                <TableCell colSpan={7}>Memuat data AOI...</TableCell>
                                            </TableRow>
                                        ) : items.length === 0 ? (
                                            <TableRow>
                                                <TableCell colSpan={7}>
                                                    Tidak ada AOI yang cocok dengan filter saat ini.
                                                </TableCell>
                                            </TableRow>
                                        ) : (
                                            items.map((aoi) => (
                                                <TableRow
                                                    key={aoi.id}
                                                    data-state={selectedPreviewId === aoi.id ? 'selected' : undefined}
                                                    className="cursor-pointer"
                                                    onClick={() => setSelectedPreviewId(aoi.id)}
                                                >
                                                    <TableCell className="font-medium">{aoi.code}</TableCell>
                                                    <TableCell>{aoi.name}</TableCell>
                                                    <TableCell><AoiTypeBadge type={aoi.aoi_type} /></TableCell>
                                                    <TableCell><VerificationStatusBadge status={aoi.verification_status} /></TableCell>
                                                    <TableCell>{formatNumber(aoi.estimated_area_ha, 2)} ha</TableCell>
                                                    <TableCell>
                                                        {[aoi.village, aoi.district, aoi.regency].filter(Boolean).join(', ') || '-'}
                                                    </TableCell>
                                                    <TableCell className="text-right">
                                                        <Link
                                                            href={route('aoi-areas.show', aoi.id)}
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
                            <CardTitle>Preview AOI</CardTitle>
                            <CardDescription>
                                Ringkasan cepat AOI yang dipilih dari tabel.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {previewLoading ? (
                                <p className="text-sm text-muted-foreground">Memuat preview AOI...</p>
                            ) : previewAoi ? (
                                <>
                                    <div className="space-y-1">
                                        <p className="text-sm text-muted-foreground">AOI code</p>
                                        <p className="text-base font-semibold">{previewAoi.code}</p>
                                    </div>
                                    <div className="flex flex-wrap gap-2">
                                        <AoiTypeBadge type={previewAoi.aoi_type} />
                                        <VerificationStatusBadge status={previewAoi.verification_status} />
                                    </div>
                                    <div className="space-y-2 text-sm text-muted-foreground">
                                        <p>Nama: <span className="font-medium text-foreground">{previewAoi.name}</span></p>
                                        <p>Area: <span className="font-medium text-foreground">{formatNumber(previewAoi.estimated_area_ha, 2)} ha</span></p>
                                        <p>Source: <span className="font-medium text-foreground">{previewAoi.source_name ?? previewAoi.source_type ?? '-'}</span></p>
                                        <p>Lokasi: <span className="font-medium text-foreground">
                                            {[previewAoi.village, previewAoi.district, previewAoi.regency, previewAoi.province].filter(Boolean).join(', ') || '-'}
                                        </span></p>
                                        <p>Updated: <span className="font-medium text-foreground">{formatDateTime(previewAoi.updated_at)}</span></p>
                                    </div>
                                    <Link
                                        href={route('aoi-areas.show', previewAoi.id)}
                                        className="inline-flex w-full items-center justify-center rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
                                    >
                                        Buka Detail AOI
                                    </Link>
                                </>
                            ) : (
                                <p className="text-sm text-muted-foreground">
                                    Pilih satu AOI dari tabel untuk melihat preview cepat.
                                </p>
                            )}
                        </CardContent>
                    </Card>
                </section>
            </div>
        </AuthenticatedLayout>
    );
}
