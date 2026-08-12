import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { fetchAnalysisRunDetail } from '@/lib/api';
import { Head, Link } from '@inertiajs/react';
import { useEffect, useState } from 'react';
import { Alert, AlertDescription, AlertTitle } from '@/Components/ui/alert';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/Components/ui/card';
import { formatDateTime, formatNumber } from '@/Components/Dashboard/dashboardHelpers';
import AnalysisRunStatusBadge from '@/Components/AnalysisRuns/AnalysisRunStatusBadge';

export default function AnalysisRunsShow({ analysisRunId }) {
    const [analysisRun, setAnalysisRun] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        let active = true;

        async function loadDetail() {
            setLoading(true);
            setError('');

            try {
                const detail = await fetchAnalysisRunDetail(analysisRunId);

                if (active) {
                    setAnalysisRun(detail);
                }
            } catch {
                if (active) {
                    setError('Detail analysis run belum berhasil dimuat.');
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
    }, [analysisRunId]);

    return (
        <AuthenticatedLayout
            title={analysisRun?.name ?? 'Analysis Run Detail'}
            description="Telaah periode before-after, parameter analisis, dan shortcut operasional yang terhubung ke import hasil GEE."
            eyebrow="Analysis detail"
            breadcrumbItems={[
                { label: 'Dashboard', href: '/dashboard' },
                { label: 'Analysis Runs', href: '/analysis-runs' },
                { label: analysisRun?.name ?? 'Detail' },
            ]}
        >
            <Head title={analysisRun?.name ?? 'Analysis Run Detail'} />

            <div className="space-y-6">
                <div className="flex flex-wrap gap-3">
                    <Link
                        href={route('analysis-runs.index')}
                        className="inline-flex h-10 items-center justify-center rounded-lg border border-input bg-background px-4 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground"
                    >
                        Kembali ke Daftar Run
                    </Link>
                    <Link
                        href={route('gee-imports.index', { analysis_run_id: analysisRunId })}
                        className="inline-flex h-10 items-center justify-center rounded-lg border border-input bg-background px-4 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground"
                    >
                        Buka GEE Imports
                    </Link>
                </div>

                {error ? (
                    <Alert variant="destructive">
                        <AlertTitle>Gagal memuat detail analysis run</AlertTitle>
                        <AlertDescription>{error}</AlertDescription>
                    </Alert>
                ) : null}

                {loading ? (
                    <Card>
                        <CardContent className="p-6 text-sm text-muted-foreground">
                            Memuat detail analysis run...
                        </CardContent>
                    </Card>
                ) : analysisRun ? (
                    <>
                        <section className="grid gap-4 lg:grid-cols-4">
                            <Card>
                                <CardHeader className="pb-3">
                                    <CardDescription>Status</CardDescription>
                                    <CardTitle><AnalysisRunStatusBadge status={analysisRun.status} /></CardTitle>
                                </CardHeader>
                            </Card>
                            <Card>
                                <CardHeader className="pb-3">
                                    <CardDescription>Total hotspot</CardDescription>
                                    <CardTitle>{analysisRun.total_hotspots ?? 0}</CardTitle>
                                </CardHeader>
                            </Card>
                            <Card>
                                <CardHeader className="pb-3">
                                    <CardDescription>Total area</CardDescription>
                                    <CardTitle>{formatNumber(analysisRun.total_area_ha, 2)} ha</CardTitle>
                                </CardHeader>
                            </Card>
                            <Card>
                                <CardHeader className="pb-3">
                                    <CardDescription>Processed at</CardDescription>
                                    <CardTitle className="text-base">{formatDateTime(analysisRun.processed_at)}</CardTitle>
                                </CardHeader>
                            </Card>
                        </section>

                        <section className="grid gap-6 lg:grid-cols-2">
                            <Card>
                                <CardHeader>
                                    <CardTitle>Ringkasan Run</CardTitle>
                                    <CardDescription>Metadata utama analysis run.</CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-3 text-sm">
                                    <p>Nama: <span className="font-medium">{analysisRun.name}</span></p>
                                    <p>AOI: <span className="font-medium">{analysisRun.aoi_area?.name ?? '-'}</span></p>
                                    <p>Dataset: <span className="font-medium">{analysisRun.dataset_name ?? '-'}</span></p>
                                    <p>GEE Collection: <span className="font-medium">{analysisRun.gee_collection_id ?? '-'}</span></p>
                                    <p>Cloud threshold: <span className="font-medium">{formatNumber(analysisRun.cloud_threshold, 2)}</span></p>
                                    <p>Published at: <span className="font-medium">{formatDateTime(analysisRun.published_at)}</span></p>
                                    <p>Updated at: <span className="font-medium">{formatDateTime(analysisRun.updated_at)}</span></p>
                                </CardContent>
                            </Card>

                            <Card>
                                <CardHeader>
                                    <CardTitle>Periode Before / After</CardTitle>
                                    <CardDescription>Rentang waktu yang dipakai untuk komparasi.</CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-4 text-sm">
                                    <div className="rounded-xl border p-4">
                                        <p className="font-medium">Before</p>
                                        <p className="text-muted-foreground">
                                            {analysisRun.before_period?.start ?? '-'} sampai {analysisRun.before_period?.end ?? '-'}
                                        </p>
                                    </div>
                                    <div className="rounded-xl border p-4">
                                        <p className="font-medium">After</p>
                                        <p className="text-muted-foreground">
                                            {analysisRun.after_period?.start ?? '-'} sampai {analysisRun.after_period?.end ?? '-'}
                                        </p>
                                    </div>
                                </CardContent>
                            </Card>
                        </section>

                        <section className="grid gap-6 lg:grid-cols-2">
                            <Card>
                                <CardHeader>
                                    <CardTitle>Indices</CardTitle>
                                    <CardDescription>Indeks utama dan pendukung yang dipakai run ini.</CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-3 text-sm">
                                    <p>Primary: <span className="font-medium">{(analysisRun.primary_indices ?? []).join(', ') || '-'}</span></p>
                                    <p>Supporting: <span className="font-medium">{(analysisRun.supporting_indices ?? []).join(', ') || '-'}</span></p>
                                </CardContent>
                            </Card>

                            <Card>
                                <CardHeader>
                                    <CardTitle>Shortcut Operasional</CardTitle>
                                    <CardDescription>Penghubung aman ke modul berikutnya.</CardDescription>
                                </CardHeader>
                                <CardContent className="grid gap-3">
                                    <Link
                                        href={route('gee-imports.index', { analysis_run_id: analysisRun.id })}
                                        className="inline-flex items-center justify-center rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
                                    >
                                        Lihat Riwayat GEE Import
                                    </Link>
                                    <Link
                                        href={route('hotspots.index')}
                                        className="inline-flex items-center justify-center rounded-lg border border-input bg-background px-4 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground"
                                    >
                                        Buka Daftar Hotspot
                                    </Link>
                                </CardContent>
                            </Card>
                        </section>

                        <Card>
                            <CardHeader>
                                <CardTitle>Deskripsi</CardTitle>
                                <CardDescription>Catatan tambahan untuk run ini.</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <p className="text-sm text-muted-foreground">
                                    {analysisRun.description || 'Belum ada deskripsi tambahan untuk analysis run ini.'}
                                </p>
                            </CardContent>
                        </Card>
                    </>
                ) : null}
            </div>
        </AuthenticatedLayout>
    );
}
