import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { fetchHotspotDetail, fetchReports } from '@/lib/api';
import { Head, Link, usePage } from '@inertiajs/react';
import { useEffect, useMemo, useState } from 'react';
import { Alert, AlertDescription, AlertTitle } from '@/Components/ui/alert';
import { Button } from '@/Components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/Components/ui/card';
import PriorityBadge from '@/Components/Hotspots/PriorityBadge';
import ValidationStatusBadge from '@/Components/Hotspots/ValidationStatusBadge';
import WebGISMap from '@/Components/WebGIS/WebGISMap';
import {
    formatDateTime,
    formatLabel,
    formatNumber,
} from '@/Components/Dashboard/dashboardHelpers';

export default function HotspotsShow({ hotspotId }) {
    const { auth } = usePage().props;
    const userPermissions = auth.user?.permissions ?? [];
    const canExportReport = userPermissions.includes('export_report');
    const canValidate = userPermissions.includes('validate_hotspot');

    const [hotspot, setHotspot] = useState(null);
    const [reports, setReports] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        let active = true;

        async function loadDetail() {
            setLoading(true);
            setError('');

            try {
                const detail = await fetchHotspotDetail(hotspotId);

                if (!active) {
                    return;
                }

                setHotspot(detail);

                if (canExportReport) {
                    const reportResponse = await fetchReports({
                        hotspot_id: hotspotId,
                        report_type: 'hotspot',
                        per_page: 10,
                    });

                    if (active) {
                        setReports(reportResponse.data);
                    }
                }
            } catch {
                if (active) {
                    setError('Detail hotspot belum berhasil dimuat.');
                }
            } finally {
                if (active) {
                    setLoading(false);
                }
            }
        }

        loadDetail();

        return () => {
            active = false;
        };
    }, [canExportReport, hotspotId]);

    const singleFeatureCollection = useMemo(() => {
        if (!hotspot?.geometry) {
            return { type: 'FeatureCollection', features: [] };
        }

        return {
            type: 'FeatureCollection',
            features: [
                {
                    type: 'Feature',
                    geometry: hotspot.geometry,
                    properties: {
                        id: hotspot.id,
                        hotspot_code: hotspot.hotspot_code,
                        area_ha: hotspot.area_ha,
                        priority: hotspot.priority,
                        validation_status: hotspot.validation_status,
                        detected_at: hotspot.detected_at,
                        mvi_delta: hotspot.indices?.mvi_delta,
                        cmri_delta: hotspot.indices?.cmri_delta,
                        centroid: hotspot.centroid,
                    },
                },
            ],
        };
    }, [hotspot]);

    const selectedFeature = singleFeatureCollection.features[0] ?? null;
    const validations = hotspot?.validations ?? [];
    const photos = validations.flatMap((validation) => validation.photos ?? []);

    return (
        <AuthenticatedLayout
            title={hotspot?.hotspot_code ? `Hotspot ${hotspot.hotspot_code}` : 'Hotspot Detail'}
            description="Telaah lengkap satu hotspot, termasuk ringkasan spasial, validasi lapangan, foto bukti, dan laporan terkait."
            eyebrow="Hotspot detail"
            breadcrumbItems={[
                { label: 'Dashboard', href: '/dashboard' },
                { label: 'Hotspots', href: '/hotspots' },
                { label: hotspot?.hotspot_code ?? 'Detail' },
            ]}
        >
            <Head title={hotspot?.hotspot_code ? `Hotspot ${hotspot.hotspot_code}` : 'Hotspot Detail'} />

            <div className="space-y-6">
                <div className="flex flex-wrap gap-3">
                    <Link
                        href={route('hotspots.index')}
                        className="inline-flex h-10 items-center justify-center rounded-lg border border-input bg-background px-4 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground"
                    >
                        Kembali ke Daftar
                    </Link>
                    <Link
                        href={route('dashboard')}
                        className="inline-flex h-10 items-center justify-center rounded-lg border border-input bg-background px-4 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground"
                    >
                        Buka Dashboard
                    </Link>
                </div>

                {error ? (
                    <Alert variant="destructive">
                        <AlertTitle>Gagal memuat detail hotspot</AlertTitle>
                        <AlertDescription>{error}</AlertDescription>
                    </Alert>
                ) : null}

                {loading ? (
                    <Card>
                        <CardContent className="p-6 text-sm text-muted-foreground">
                            Memuat detail hotspot...
                        </CardContent>
                    </Card>
                ) : hotspot ? (
                    <>
                        <section className="grid gap-4 lg:grid-cols-4">
                            <Card>
                                <CardHeader className="pb-3">
                                    <CardDescription>Priority</CardDescription>
                                    <CardTitle><PriorityBadge priority={hotspot.priority} /></CardTitle>
                                </CardHeader>
                            </Card>
                            <Card>
                                <CardHeader className="pb-3">
                                    <CardDescription>Status validasi</CardDescription>
                                    <CardTitle><ValidationStatusBadge status={hotspot.validation_status} /></CardTitle>
                                </CardHeader>
                            </Card>
                            <Card>
                                <CardHeader className="pb-3">
                                    <CardDescription>Area</CardDescription>
                                    <CardTitle>{formatNumber(hotspot.area_ha, 2)} ha</CardTitle>
                                </CardHeader>
                            </Card>
                            <Card>
                                <CardHeader className="pb-3">
                                    <CardDescription>Detected at</CardDescription>
                                    <CardTitle className="text-base">{formatDateTime(hotspot.detected_at)}</CardTitle>
                                </CardHeader>
                            </Card>
                        </section>

                        <section className="grid gap-6 xl:grid-cols-[minmax(0,1.15fr)_minmax(0,0.85fr)]">
                            <Card>
                                <CardHeader>
                                    <CardTitle>Map Preview</CardTitle>
                                    <CardDescription>
                                        Preview spasial satu hotspot tanpa memindahkan pengguna kembali ke dashboard.
                                    </CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <div className="map-frame h-[28rem] min-h-0">
                                        <WebGISMap
                                            aoiGeometry={null}
                                            hotspotCollection={singleFeatureCollection}
                                            selectedFeature={selectedFeature}
                                            onSelectFeature={() => {}}
                                            layerVisibility={{
                                                aoi: false,
                                                polygons: true,
                                                centroids: true,
                                                selected: true,
                                                staticPlaceholder: false,
                                            }}
                                            viewportMode={{ mode: 'all', nonce: 0 }}
                                        />
                                    </div>
                                </CardContent>
                            </Card>

                            <Card>
                                <CardHeader>
                                    <CardTitle>Ringkasan Hotspot</CardTitle>
                                    <CardDescription>Metadata inti untuk pembacaan cepat.</CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-3 text-sm">
                                    <p>Hotspot code: <span className="font-medium">{hotspot.hotspot_code}</span></p>
                                    <p>Analysis Run: <span className="font-medium">{hotspot.analysis_run?.name ?? '-'}</span></p>
                                    <p>AOI: <span className="font-medium">{hotspot.aoi_area?.name ?? '-'}</span></p>
                                    <p>Sensitivity: <span className="font-medium">{hotspot.sensitivity_level ?? '-'}</span></p>
                                    <p>Centroid: <span className="font-medium">
                                        {hotspot.centroid?.coordinates
                                            ? `${formatNumber(hotspot.centroid.coordinates[1], 6)}, ${formatNumber(hotspot.centroid.coordinates[0], 6)}`
                                            : '-'}
                                    </span></p>
                                    <p>Detection method: <span className="font-medium">{hotspot.properties?.detection_method ?? '-'}</span></p>
                                    <p>Source: <span className="font-medium">{hotspot.properties?.source ?? '-'}</span></p>
                                </CardContent>
                            </Card>
                        </section>

                        <section className="grid gap-6 lg:grid-cols-2">
                            <Card>
                                <CardHeader>
                                    <CardTitle>Indices Overview</CardTitle>
                                    <CardDescription>
                                        Delta indeks disajikan ringkas agar lebih mudah dibaca di luar dashboard.
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="grid gap-3 sm:grid-cols-2 text-sm">
                                    <p>MVI before: <span className="font-medium">{formatNumber(hotspot.indices?.mvi_before, 3)}</span></p>
                                    <p>MVI after: <span className="font-medium">{formatNumber(hotspot.indices?.mvi_after, 3)}</span></p>
                                    <p>MVI delta: <span className="font-medium">{formatNumber(hotspot.indices?.mvi_delta, 3)}</span></p>
                                    <p>CMRI before: <span className="font-medium">{formatNumber(hotspot.indices?.cmri_before, 3)}</span></p>
                                    <p>CMRI after: <span className="font-medium">{formatNumber(hotspot.indices?.cmri_after, 3)}</span></p>
                                    <p>CMRI delta: <span className="font-medium">{formatNumber(hotspot.indices?.cmri_delta, 3)}</span></p>
                                    <p>NDVI delta: <span className="font-medium">{formatNumber(hotspot.indices?.ndvi_delta, 3)}</span></p>
                                    <p>NDWI delta: <span className="font-medium">{formatNumber(hotspot.indices?.ndwi_delta, 3)}</span></p>
                                </CardContent>
                            </Card>

                            <Card>
                                <CardHeader>
                                    <CardTitle>Validation Summary</CardTitle>
                                    <CardDescription>
                                        Ringkasan validasi yang sudah tersimpan untuk hotspot ini.
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    {validations.length === 0 ? (
                                        <p className="text-sm text-muted-foreground">
                                            Belum ada validasi lapangan untuk hotspot ini.
                                        </p>
                                    ) : (
                                        validations.map((validation) => (
                                            <div key={validation.id} className="rounded-xl border p-4">
                                                <div className="flex flex-wrap items-center gap-2">
                                                    <ValidationStatusBadge status={validation.validation_status} />
                                                    <span className="text-sm text-muted-foreground">
                                                        {validation.validator?.name ?? 'Validator internal'} - {formatDateTime(validation.visited_at ?? validation.created_at)}
                                                    </span>
                                                </div>
                                                <p className="mt-3 text-sm text-muted-foreground">
                                                    {validation.validation_note ?? 'Belum ada catatan validasi.'}
                                                </p>
                                                <p className="mt-2 text-sm">
                                                    Observed condition: <span className="font-medium">{formatLabel(validation.observed_condition)}</span>
                                                </p>
                                                <p className="text-sm">
                                                    Confidence: <span className="font-medium">{formatLabel(validation.confidence_level)}</span>
                                                </p>
                                            </div>
                                        ))
                                    )}
                                    {!canValidate ? (
                                        <Alert>
                                            <AlertTitle>Shortcut validasi masih di dashboard</AlertTitle>
                                            <AlertDescription>
                                                Form validasi page-per-page akan dipisahkan di modul berikutnya. Untuk saat ini, aksi input masih tetap aman di dashboard.
                                            </AlertDescription>
                                        </Alert>
                                    ) : null}
                                </CardContent>
                            </Card>
                        </section>

                        <section className="grid gap-6 lg:grid-cols-2">
                            <Card>
                                <CardHeader>
                                    <CardTitle>Validation Photos</CardTitle>
                                    <CardDescription>
                                        File tetap dibuka melalui `file_url` terproteksi, tanpa menampilkan path mentah.
                                    </CardDescription>
                                </CardHeader>
                                <CardContent>
                                    {photos.length === 0 ? (
                                        <p className="text-sm text-muted-foreground">
                                            Belum ada foto validasi untuk hotspot ini.
                                        </p>
                                    ) : (
                                        <div className="grid gap-4 sm:grid-cols-2">
                                            {photos.map((photo) => (
                                                <article key={photo.id} className="rounded-xl border p-3">
                                                    <img
                                                        src={photo.file_url}
                                                        alt={photo.caption || photo.original_filename}
                                                        className="h-40 w-full rounded-lg object-cover"
                                                    />
                                                    <p className="mt-3 text-sm font-medium">
                                                        {photo.caption || photo.original_filename}
                                                    </p>
                                                    <p className="text-xs text-muted-foreground">
                                                        {formatDateTime(photo.taken_at || photo.created_at)}
                                                    </p>
                                                </article>
                                            ))}
                                        </div>
                                    )}
                                </CardContent>
                            </Card>

                            <Card>
                                <CardHeader>
                                    <CardTitle>Reports</CardTitle>
                                    <CardDescription>
                                        Laporan hotspot tetap permission-aware dan hanya muncul untuk user berwenang.
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    {!canExportReport ? (
                                        <Alert>
                                            <AlertTitle>Akses report terbatas</AlertTitle>
                                            <AlertDescription>
                                                Akun ini belum memiliki permission `export_report`, jadi daftar dan aksi download report disembunyikan.
                                            </AlertDescription>
                                        </Alert>
                                    ) : reports.length === 0 ? (
                                        <p className="text-sm text-muted-foreground">
                                            Belum ada report hotspot yang dibuat.
                                        </p>
                                    ) : (
                                        reports.map((report) => (
                                            <div key={report.id} className="flex items-center justify-between gap-3 rounded-xl border p-4">
                                                <div>
                                                    <p className="font-medium">{report.title}</p>
                                                    <p className="text-sm text-muted-foreground">
                                                        {report.report_code} - {formatDateTime(report.generated_at)}
                                                    </p>
                                                </div>
                                                <a
                                                    href={report.download_url}
                                                    className="inline-flex h-9 items-center justify-center rounded-lg bg-primary px-3 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
                                                >
                                                    Download
                                                </a>
                                            </div>
                                        ))
                                    )}
                                </CardContent>
                            </Card>
                        </section>
                    </>
                ) : null}
            </div>
        </AuthenticatedLayout>
    );
}
