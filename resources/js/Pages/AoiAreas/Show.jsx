import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { fetchAoiAreaDetail } from '@/lib/api';
import { Head, Link } from '@inertiajs/react';
import { useEffect, useMemo, useState } from 'react';
import { Alert, AlertDescription, AlertTitle } from '@/Components/ui/alert';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/Components/ui/card';
import WebGISMap from '@/Components/WebGIS/WebGISMap';
import { formatDateTime, formatNumber } from '@/Components/Dashboard/dashboardHelpers';
import AoiTypeBadge from '@/Components/AoiAreas/AoiTypeBadge';
import VerificationStatusBadge from '@/Components/AoiAreas/VerificationStatusBadge';

export default function AoiAreasShow({ aoiAreaId }) {
    const [aoiArea, setAoiArea] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        let active = true;

        async function loadDetail() {
            setLoading(true);
            setError('');

            try {
                const detail = await fetchAoiAreaDetail(aoiAreaId);

                if (active) {
                    setAoiArea(detail);
                }
            } catch {
                if (active) {
                    setError('Detail AOI belum berhasil dimuat.');
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
    }, [aoiAreaId]);

    const emptyHotspotCollection = useMemo(
        () => ({ type: 'FeatureCollection', features: [] }),
        [],
    );

    return (
        <AuthenticatedLayout
            title={aoiArea?.name ?? 'AOI Detail'}
            description="Telaah metadata, status verifikasi, sumber data, dan geometri satu AOI secara lebih fokus di luar dashboard."
            eyebrow="AOI detail"
            breadcrumbItems={[
                { label: 'Dashboard', href: '/dashboard' },
                { label: 'AOI Management', href: '/aoi-areas' },
                { label: aoiArea?.code ?? 'Detail' },
            ]}
        >
            <Head title={aoiArea?.name ?? 'AOI Detail'} />

            <div className="space-y-6">
                <div className="flex flex-wrap gap-3">
                    <Link
                        href={route('aoi-areas.index')}
                        className="inline-flex h-10 items-center justify-center rounded-lg border border-input bg-background px-4 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground"
                    >
                        Kembali ke Daftar AOI
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
                        <AlertTitle>Gagal memuat detail AOI</AlertTitle>
                        <AlertDescription>{error}</AlertDescription>
                    </Alert>
                ) : null}

                {loading ? (
                    <Card>
                        <CardContent className="p-6 text-sm text-muted-foreground">
                            Memuat detail AOI...
                        </CardContent>
                    </Card>
                ) : aoiArea ? (
                    <>
                        <section className="grid gap-4 lg:grid-cols-4">
                            <Card>
                                <CardHeader className="pb-3">
                                    <CardDescription>Tipe AOI</CardDescription>
                                    <CardTitle><AoiTypeBadge type={aoiArea.aoi_type} /></CardTitle>
                                </CardHeader>
                            </Card>
                            <Card>
                                <CardHeader className="pb-3">
                                    <CardDescription>Verification</CardDescription>
                                    <CardTitle><VerificationStatusBadge status={aoiArea.verification_status} /></CardTitle>
                                </CardHeader>
                            </Card>
                            <Card>
                                <CardHeader className="pb-3">
                                    <CardDescription>Estimasi area</CardDescription>
                                    <CardTitle>{formatNumber(aoiArea.estimated_area_ha, 2)} ha</CardTitle>
                                </CardHeader>
                            </Card>
                            <Card>
                                <CardHeader className="pb-3">
                                    <CardDescription>Updated at</CardDescription>
                                    <CardTitle className="text-base">{formatDateTime(aoiArea.updated_at)}</CardTitle>
                                </CardHeader>
                            </Card>
                        </section>

                        <section className="grid gap-6 xl:grid-cols-[minmax(0,1.15fr)_minmax(0,0.85fr)]">
                            <Card>
                                <CardHeader>
                                    <CardTitle>Map Preview</CardTitle>
                                    <CardDescription>
                                        Preview geometri AOI agar pengelolaan area analisis tidak lagi bergantung penuh pada dashboard.
                                    </CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <div className="map-frame h-[30rem] min-h-0">
                                        <WebGISMap
                                            aoiGeometry={aoiArea.geometry}
                                            hotspotCollection={emptyHotspotCollection}
                                            selectedFeature={null}
                                            onSelectFeature={() => {}}
                                            layerVisibility={{
                                                aoi: true,
                                                polygons: false,
                                                centroids: false,
                                                selected: false,
                                                staticPlaceholder: false,
                                            }}
                                            viewportMode={{ mode: 'aoi', nonce: 0 }}
                                        />
                                    </div>
                                </CardContent>
                            </Card>

                            <Card>
                                <CardHeader>
                                    <CardTitle>Ringkasan AOI</CardTitle>
                                    <CardDescription>Metadata inti untuk pembacaan cepat.</CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-3 text-sm">
                                    <p>Kode: <span className="font-medium">{aoiArea.code}</span></p>
                                    <p>Nama: <span className="font-medium">{aoiArea.name}</span></p>
                                    <p>Lokasi: <span className="font-medium">
                                        {[aoiArea.village, aoiArea.district, aoiArea.regency, aoiArea.province].filter(Boolean).join(', ') || '-'}
                                    </span></p>
                                    <p>Legal status: <span className="font-medium">{aoiArea.legal_status ?? '-'}</span></p>
                                    <p>Legal reference: <span className="font-medium">{aoiArea.legal_reference ?? '-'}</span></p>
                                    <p>Source type: <span className="font-medium">{aoiArea.source_type ?? '-'}</span></p>
                                    <p>Source name: <span className="font-medium">{aoiArea.source_name ?? '-'}</span></p>
                                    <p>Sensitivity: <span className="font-medium">{aoiArea.sensitivity_level ?? '-'}</span></p>
                                </CardContent>
                            </Card>
                        </section>

                        <Card>
                            <CardHeader>
                                <CardTitle>Deskripsi AOI</CardTitle>
                                <CardDescription>
                                    Catatan deskriptif area untuk mendukung analisis, import, dan verifikasi internal.
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <p className="text-sm text-muted-foreground">
                                    {aoiArea.description || 'Belum ada deskripsi tambahan untuk AOI ini.'}
                                </p>
                            </CardContent>
                        </Card>
                    </>
                ) : null}
            </div>
        </AuthenticatedLayout>
    );
}
