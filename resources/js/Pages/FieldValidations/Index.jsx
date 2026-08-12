import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import ValidationStatusBadge from '@/Components/Hotspots/ValidationStatusBadge';
import PriorityBadge from '@/Components/Hotspots/PriorityBadge';
import { Alert, AlertDescription, AlertTitle } from '@/Components/ui/alert';
import { Button } from '@/Components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/Components/ui/card';
import { Checkbox } from '@/Components/ui/checkbox';
import { Input } from '@/Components/ui/input';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/Components/ui/table';
import { Textarea } from '@/Components/ui/textarea';
import {
    buildValidationPayload,
    CONFIDENCE_OPTIONS,
    DEFAULT_PHOTO_FORM,
    DEFAULT_VALIDATION_FORM,
    formatDateTime,
    formatLabel,
    formatNumber,
    normalizeBoolean,
    OBSERVED_CONDITION_OPTIONS,
    SENSITIVITY_OPTIONS,
    toDateTimeLocalValue,
    VALIDATION_STATUS_OPTIONS,
} from '@/Components/Dashboard/dashboardHelpers';
import {
    createFieldValidation,
    fetchDashboardBootstrap,
    fetchFieldValidations,
    fetchHotspotDetail,
    fetchHotspots,
    fetchValidationPhotos,
    updateFieldValidation,
    uploadValidationPhoto,
} from '@/lib/api';
import { Head, Link, usePage } from '@inertiajs/react';
import { useEffect, useMemo, useState } from 'react';

function buildHotspotLabel(hotspot) {
    return [hotspot.hotspot_code, hotspot.analysis_run?.name, hotspot.aoi_area?.name]
        .filter(Boolean)
        .join(' - ');
}

function matchesSearch(validation, hotspot, keyword) {
    if (!keyword) {
        return true;
    }

    const haystack = [
        hotspot?.hotspot_code,
        hotspot?.analysis_run?.name,
        hotspot?.aoi_area?.name,
        validation.validator?.name,
        validation.validation_status,
        validation.observed_condition,
        validation.confidence_level,
        validation.validation_note,
    ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase();

    return haystack.includes(keyword.toLowerCase());
}

export default function FieldValidationsIndex() {
    const { auth } = usePage().props;
    const userPermissions = auth.user?.permissions ?? [];
    const userId = auth.user?.id ?? null;
    const canValidate = userPermissions.includes('validate_hotspot');

    const [bootstrap, setBootstrap] = useState({ analysisRuns: [] });
    const [hotspots, setHotspots] = useState([]);
    const [selectedHotspotId, setSelectedHotspotId] = useState('');
    const [selectedHotspot, setSelectedHotspot] = useState(null);
    const [validations, setValidations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [detailLoading, setDetailLoading] = useState(false);
    const [submittingValidation, setSubmittingValidation] = useState(false);
    const [uploadingPhoto, setUploadingPhoto] = useState(false);
    const [filters, setFilters] = useState({
        search: '',
        analysis_run_id: 'all',
        status: 'all',
    });
    const [error, setError] = useState('');
    const [validationMessage, setValidationMessage] = useState('');
    const [photoMessage, setPhotoMessage] = useState('');
    const [validationForm, setValidationForm] = useState(DEFAULT_VALIDATION_FORM);
    const [photoForm, setPhotoForm] = useState(DEFAULT_PHOTO_FORM);
    const [editableValidationId, setEditableValidationId] = useState(null);
    const [selectedValidationId, setSelectedValidationId] = useState(null);
    const [selectedValidationPhotos, setSelectedValidationPhotos] = useState([]);
    const [photoFile, setPhotoFile] = useState(null);

    useEffect(() => {
        let active = true;

        async function loadBootstrapAndHotspots() {
            setLoading(true);
            setError('');

            try {
                const [dashboardBootstrap, hotspotResponse] = await Promise.all([
                    fetchDashboardBootstrap(),
                    fetchHotspots({ per_page: 100 }),
                ]);

                if (!active) {
                    return;
                }

                setBootstrap({ analysisRuns: dashboardBootstrap.analysisRuns });
                setHotspots(hotspotResponse.data);

                if (hotspotResponse.data[0]?.id) {
                    setSelectedHotspotId(String(hotspotResponse.data[0].id));
                }
            } catch {
                if (active) {
                    setError('Daftar hotspot atau metadata analysis run belum berhasil dimuat.');
                }
            } finally {
                if (active) {
                    setLoading(false);
                }
            }
        }

        loadBootstrapAndHotspots();

        return () => {
            active = false;
        };
    }, []);

    useEffect(() => {
        if (!selectedHotspotId) {
            setSelectedHotspot(null);
            setValidations([]);
            setSelectedValidationId(null);
            return;
        }

        let active = true;

        async function loadSelectedHotspot() {
            setDetailLoading(true);
            setError('');
            setValidationMessage('');
            setPhotoMessage('');

            try {
                const [hotspotDetail, validationList] = await Promise.all([
                    fetchHotspotDetail(selectedHotspotId),
                    fetchFieldValidations(selectedHotspotId),
                ]);

                if (!active) {
                    return;
                }

                setSelectedHotspot(hotspotDetail);
                setValidations(validationList);

                const editableValidation = validationList.find(
                    (item) => item.validator_id === userId,
                );
                const preferredValidation =
                    editableValidation ?? validationList[0] ?? null;

                setEditableValidationId(editableValidation?.id ?? null);
                setSelectedValidationId(preferredValidation?.id ?? null);

                if (editableValidation) {
                    setValidationForm({
                        validation_status:
                            editableValidation.validation_status ?? 'under_review',
                        validation_note: editableValidation.validation_note ?? '',
                        observed_condition: editableValidation.observed_condition ?? '',
                        confidence_level: editableValidation.confidence_level ?? '',
                        visited_at: toDateTimeLocalValue(editableValidation.visited_at),
                        is_geotagged: normalizeBoolean(editableValidation.is_geotagged),
                        sensitivity_level:
                            editableValidation.sensitivity_level ?? 'restricted',
                        photo_lat:
                            editableValidation.validation_point?.coordinates?.[1]?.toString() ??
                            '',
                        photo_lng:
                            editableValidation.validation_point?.coordinates?.[0]?.toString() ??
                            '',
                    });
                } else {
                    setValidationForm(DEFAULT_VALIDATION_FORM);
                }
            } catch {
                if (active) {
                    setSelectedHotspot(null);
                    setValidations([]);
                    setSelectedValidationId(null);
                    setEditableValidationId(null);
                    setError('Detail hotspot atau riwayat validasi belum berhasil dimuat.');
                }
            } finally {
                if (active) {
                    setDetailLoading(false);
                }
            }
        }

        loadSelectedHotspot();

        return () => {
            active = false;
        };
    }, [selectedHotspotId, userId]);

    useEffect(() => {
        if (!selectedValidationId) {
            setSelectedValidationPhotos([]);
            return;
        }

        let active = true;

        async function loadPhotos() {
            try {
                const photos = await fetchValidationPhotos(selectedValidationId);

                if (active) {
                    setSelectedValidationPhotos(photos);
                }
            } catch {
                if (active) {
                    setSelectedValidationPhotos([]);
                }
            }
        }

        loadPhotos();

        return () => {
            active = false;
        };
    }, [selectedValidationId]);

    const filteredHotspots = useMemo(() => {
        return hotspots.filter((hotspot) => {
            if (
                filters.analysis_run_id !== 'all' &&
                String(hotspot.analysis_run?.id ?? '') !== filters.analysis_run_id
            ) {
                return false;
            }

            return true;
        });
    }, [filters.analysis_run_id, hotspots]);

    const selectedValidation = useMemo(() => {
        return validations.find((item) => item.id === selectedValidationId) ?? null;
    }, [selectedValidationId, validations]);

    const filteredValidations = useMemo(() => {
        return validations.filter((validation) => {
            if (
                filters.status !== 'all' &&
                validation.validation_status !== filters.status
            ) {
                return false;
            }

            return matchesSearch(validation, selectedHotspot, filters.search);
        });
    }, [filters.search, filters.status, selectedHotspot, validations]);

    const summary = useMemo(() => {
        return {
            total: validations.length,
            validated: validations.filter(
                (item) => item.validation_status === 'validated',
            ).length,
            rejected: validations.filter(
                (item) => item.validation_status === 'rejected',
            ).length,
            photos: validations.reduce(
                (sum, item) => sum + (item.photos?.length ?? 0),
                0,
            ),
        };
    }, [validations]);

    function handleValidationFormChange(key, value) {
        setValidationForm((current) => ({
            ...current,
            [key]: value,
        }));
    }

    function handlePhotoFormChange(key, value) {
        setPhotoForm((current) => ({
            ...current,
            [key]: value,
        }));
    }

    async function refreshSelectedHotspot() {
        if (!selectedHotspotId) {
            return;
        }

        const [hotspotDetail, validationList] = await Promise.all([
            fetchHotspotDetail(selectedHotspotId),
            fetchFieldValidations(selectedHotspotId),
        ]);

        setSelectedHotspot(hotspotDetail);
        setValidations(validationList);

        const editableValidation = validationList.find((item) => item.validator_id === userId);
        setEditableValidationId(editableValidation?.id ?? null);
        setSelectedValidationId((current) => {
            if (current && validationList.some((item) => item.id === current)) {
                return current;
            }

            return editableValidation?.id ?? validationList[0]?.id ?? null;
        });
    }

    async function handleSubmitValidation(event) {
        event.preventDefault();

        if (!selectedHotspotId || !canValidate) {
            return;
        }

        setSubmittingValidation(true);
        setValidationMessage('');
        setPhotoMessage('');
        setError('');

        try {
            const payload = buildValidationPayload(validationForm);

            if (editableValidationId) {
                await updateFieldValidation(editableValidationId, payload);
                setValidationMessage('Validasi lapangan berhasil diperbarui.');
            } else {
                await createFieldValidation(selectedHotspotId, payload);
                setValidationMessage('Validasi lapangan baru berhasil disimpan.');
            }

            await refreshSelectedHotspot();
        } catch {
            setError('Validasi lapangan belum berhasil disimpan.');
        } finally {
            setSubmittingValidation(false);
        }
    }

    async function handleUploadPhoto(event) {
        event.preventDefault();

        if (!editableValidationId || !photoFile || !canValidate) {
            return;
        }

        setUploadingPhoto(true);
        setPhotoMessage('');
        setError('');

        try {
            const formData = new FormData();

            formData.append('photo', photoFile);

            if (photoForm.caption) {
                formData.append('caption', photoForm.caption);
            }

            if (photoForm.taken_at) {
                formData.append('taken_at', new Date(photoForm.taken_at).toISOString());
            }

            formData.append('is_primary', normalizeBoolean(photoForm.is_primary) ? '1' : '0');
            formData.append('sensitivity_level', photoForm.sensitivity_level);

            if (photoForm.photo_lat !== '') {
                formData.append('photo_lat', photoForm.photo_lat);
            }

            if (photoForm.photo_lng !== '') {
                formData.append('photo_lng', photoForm.photo_lng);
            }

            await uploadValidationPhoto(editableValidationId, formData);
            setPhotoMessage('Foto validasi berhasil diunggah.');
            setPhotoForm(DEFAULT_PHOTO_FORM);
            setPhotoFile(null);
            await refreshSelectedHotspot();
        } catch {
            setError('Foto validasi belum berhasil diunggah.');
        } finally {
            setUploadingPhoto(false);
        }
    }

    return (
        <AuthenticatedLayout
            title="Field Validations"
            description="Pisahkan validasi lapangan dari dashboard tanpa memutus hubungan ke hotspot, foto bukti, dan status verifikasi yang sudah ada."
            eyebrow="Field operations"
            breadcrumbItems={[
                { label: 'Dashboard', href: '/dashboard' },
                { label: 'Field Validations' },
            ]}
        >
            <Head title="Field Validations" />

            <div className="space-y-6">
                {error ? (
                    <Alert variant="destructive">
                        <AlertTitle>Terjadi kendala</AlertTitle>
                        <AlertDescription>{error}</AlertDescription>
                    </Alert>
                ) : null}

                <section className="grid gap-4 lg:grid-cols-4">
                    <Card>
                        <CardHeader className="pb-3">
                            <CardDescription>Hotspot terpilih</CardDescription>
                            <CardTitle>{selectedHotspot?.hotspot_code ?? '-'}</CardTitle>
                        </CardHeader>
                    </Card>
                    <Card>
                        <CardHeader className="pb-3">
                            <CardDescription>Total validasi</CardDescription>
                            <CardTitle>{detailLoading ? '...' : summary.total}</CardTitle>
                        </CardHeader>
                    </Card>
                    <Card>
                        <CardHeader className="pb-3">
                            <CardDescription>Validated</CardDescription>
                            <CardTitle>{detailLoading ? '...' : summary.validated}</CardTitle>
                        </CardHeader>
                    </Card>
                    <Card>
                        <CardHeader className="pb-3">
                            <CardDescription>Foto bukti</CardDescription>
                            <CardTitle>{detailLoading ? '...' : summary.photos}</CardTitle>
                        </CardHeader>
                    </Card>
                </section>

                <section className="grid gap-6 xl:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)]">
                    <div className="space-y-6">
                        <Card>
                            <CardHeader>
                                <CardTitle>Konteks Hotspot</CardTitle>
                                <CardDescription>
                                    Pilih hotspot terlebih dahulu, lalu telaah riwayat validasi secara page-per-page.
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                                <label className="space-y-2 text-sm font-medium">
                                    <span>Analysis run</span>
                                    <select
                                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                                        value={filters.analysis_run_id}
                                        onChange={(event) =>
                                            setFilters((current) => ({
                                                ...current,
                                                analysis_run_id: event.target.value,
                                            }))
                                        }
                                    >
                                        <option value="all">Semua analysis run</option>
                                        {bootstrap.analysisRuns.map((run) => (
                                            <option key={run.id} value={run.id}>
                                                {run.name}
                                            </option>
                                        ))}
                                    </select>
                                </label>

                                <label className="space-y-2 text-sm font-medium md:col-span-2 xl:col-span-2">
                                    <span>Hotspot</span>
                                    <select
                                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                                        value={selectedHotspotId}
                                        onChange={(event) => setSelectedHotspotId(event.target.value)}
                                        disabled={loading}
                                    >
                                        <option value="">Pilih hotspot</option>
                                        {filteredHotspots.map((hotspot) => (
                                            <option key={hotspot.id} value={hotspot.id}>
                                                {buildHotspotLabel(hotspot)}
                                            </option>
                                        ))}
                                    </select>
                                </label>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle>Riwayat Validasi</CardTitle>
                                <CardDescription>
                                    Fokus pada validator, status, confidence, dan catatan lapangan.
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="grid gap-4 md:grid-cols-2">
                                    <label className="space-y-2 text-sm font-medium">
                                        <span>Cari catatan</span>
                                        <Input
                                            value={filters.search}
                                            onChange={(event) =>
                                                setFilters((current) => ({
                                                    ...current,
                                                    search: event.target.value,
                                                }))
                                            }
                                            placeholder="Kode hotspot, validator, catatan..."
                                        />
                                    </label>
                                    <label className="space-y-2 text-sm font-medium">
                                        <span>Status</span>
                                        <select
                                            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                                            value={filters.status}
                                            onChange={(event) =>
                                                setFilters((current) => ({
                                                    ...current,
                                                    status: event.target.value,
                                                }))
                                            }
                                        >
                                            <option value="all">Semua status</option>
                                            {VALIDATION_STATUS_OPTIONS.map((option) => (
                                                <option key={option.value} value={option.value}>
                                                    {option.label}
                                                </option>
                                            ))}
                                        </select>
                                    </label>
                                </div>

                                {detailLoading ? (
                                    <p className="text-sm text-muted-foreground">
                                        Memuat riwayat validasi...
                                    </p>
                                ) : filteredValidations.length === 0 ? (
                                    <p className="text-sm text-muted-foreground">
                                        Belum ada data validasi yang cocok untuk hotspot ini.
                                    </p>
                                ) : (
                                    <Table>
                                        <TableHeader>
                                            <TableRow>
                                                <TableHead>Validator</TableHead>
                                                <TableHead>Status</TableHead>
                                                <TableHead>Observed</TableHead>
                                                <TableHead>Visited</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {filteredValidations.map((validation) => (
                                                <TableRow
                                                    key={validation.id}
                                                    className="cursor-pointer"
                                                    onClick={() => setSelectedValidationId(validation.id)}
                                                >
                                                    <TableCell>
                                                        <div className="space-y-1">
                                                            <p className="font-medium">
                                                                {validation.validator?.name ??
                                                                    'Validator internal'}
                                                            </p>
                                                            <p className="text-xs text-muted-foreground">
                                                                Confidence:{' '}
                                                                {formatLabel(
                                                                    validation.confidence_level,
                                                                )}
                                                            </p>
                                                        </div>
                                                    </TableCell>
                                                    <TableCell>
                                                        <ValidationStatusBadge
                                                            status={validation.validation_status}
                                                        />
                                                    </TableCell>
                                                    <TableCell>
                                                        {formatLabel(validation.observed_condition)}
                                                    </TableCell>
                                                    <TableCell>
                                                        {formatDateTime(
                                                            validation.visited_at ??
                                                                validation.created_at,
                                                        )}
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
                                <CardTitle>Detail Konteks</CardTitle>
                                <CardDescription>
                                    Shortcut aman ke hotspot asal dan ringkasan yang relevan untuk tim lapangan.
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-3 text-sm">
                                <div className="flex flex-wrap items-center gap-2">
                                    <PriorityBadge priority={selectedHotspot?.priority} />
                                    <ValidationStatusBadge
                                        status={selectedHotspot?.validation_status}
                                    />
                                </div>
                                <p>
                                    Hotspot code:{' '}
                                    <span className="font-medium">
                                        {selectedHotspot?.hotspot_code ?? '-'}
                                    </span>
                                </p>
                                <p>
                                    Analysis run:{' '}
                                    <span className="font-medium">
                                        {selectedHotspot?.analysis_run?.name ?? '-'}
                                    </span>
                                </p>
                                <p>
                                    Area:{' '}
                                    <span className="font-medium">
                                        {formatNumber(selectedHotspot?.area_ha, 2)} ha
                                    </span>
                                </p>
                                <div className="flex flex-wrap gap-3 pt-2">
                                    {selectedHotspot?.id ? (
                                        <Link
                                            href={route('hotspots.show', selectedHotspot.id)}
                                            className="inline-flex h-10 items-center justify-center rounded-lg border border-input bg-background px-4 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground"
                                        >
                                            Buka Halaman Hotspot
                                        </Link>
                                    ) : null}
                                    <Link
                                        href={route('dashboard')}
                                        className="inline-flex h-10 items-center justify-center rounded-lg border border-input bg-background px-4 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground"
                                    >
                                        Kembali ke Dashboard
                                    </Link>
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle>
                                    {editableValidationId
                                        ? 'Perbarui Validasi Anda'
                                        : 'Tambah Validasi Baru'}
                                </CardTitle>
                                <CardDescription>
                                    Satu halaman kerja untuk update status, catatan, koordinat, dan metadata kunjungan.
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <form className="space-y-4" onSubmit={handleSubmitValidation}>
                                    <div className="grid gap-4 md:grid-cols-2">
                                        <label className="space-y-2 text-sm font-medium">
                                            <span>Status validasi</span>
                                            <select
                                                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                                                value={validationForm.validation_status}
                                                onChange={(event) =>
                                                    handleValidationFormChange(
                                                        'validation_status',
                                                        event.target.value,
                                                    )
                                                }
                                            >
                                                {VALIDATION_STATUS_OPTIONS.map((option) => (
                                                    <option
                                                        key={option.value}
                                                        value={option.value}
                                                    >
                                                        {option.label}
                                                    </option>
                                                ))}
                                            </select>
                                        </label>

                                        <label className="space-y-2 text-sm font-medium">
                                            <span>Confidence</span>
                                            <select
                                                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                                                value={validationForm.confidence_level}
                                                onChange={(event) =>
                                                    handleValidationFormChange(
                                                        'confidence_level',
                                                        event.target.value,
                                                    )
                                                }
                                            >
                                                {CONFIDENCE_OPTIONS.map((option) => (
                                                    <option
                                                        key={option.value}
                                                        value={option.value}
                                                    >
                                                        {option.label}
                                                    </option>
                                                ))}
                                            </select>
                                        </label>

                                        <label className="space-y-2 text-sm font-medium">
                                            <span>Observed condition</span>
                                            <select
                                                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                                                value={validationForm.observed_condition}
                                                onChange={(event) =>
                                                    handleValidationFormChange(
                                                        'observed_condition',
                                                        event.target.value,
                                                    )
                                                }
                                            >
                                                {OBSERVED_CONDITION_OPTIONS.map((option) => (
                                                    <option
                                                        key={option.value}
                                                        value={option.value}
                                                    >
                                                        {option.label}
                                                    </option>
                                                ))}
                                            </select>
                                        </label>

                                        <label className="space-y-2 text-sm font-medium">
                                            <span>Sensitivity</span>
                                            <select
                                                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                                                value={validationForm.sensitivity_level}
                                                onChange={(event) =>
                                                    handleValidationFormChange(
                                                        'sensitivity_level',
                                                        event.target.value,
                                                    )
                                                }
                                            >
                                                {SENSITIVITY_OPTIONS.map((option) => (
                                                    <option
                                                        key={option.value}
                                                        value={option.value}
                                                    >
                                                        {option.label}
                                                    </option>
                                                ))}
                                            </select>
                                        </label>

                                        <label className="space-y-2 text-sm font-medium">
                                            <span>Visited at</span>
                                            <Input
                                                type="datetime-local"
                                                value={validationForm.visited_at}
                                                onChange={(event) =>
                                                    handleValidationFormChange(
                                                        'visited_at',
                                                        event.target.value,
                                                    )
                                                }
                                            />
                                        </label>

                                        <label className="space-y-2 text-sm font-medium">
                                            <span>Latitude</span>
                                            <Input
                                                type="number"
                                                step="0.000001"
                                                value={validationForm.photo_lat}
                                                onChange={(event) =>
                                                    handleValidationFormChange(
                                                        'photo_lat',
                                                        event.target.value,
                                                    )
                                                }
                                                placeholder="4.012345"
                                            />
                                        </label>

                                        <label className="space-y-2 text-sm font-medium">
                                            <span>Longitude</span>
                                            <Input
                                                type="number"
                                                step="0.000001"
                                                value={validationForm.photo_lng}
                                                onChange={(event) =>
                                                    handleValidationFormChange(
                                                        'photo_lng',
                                                        event.target.value,
                                                    )
                                                }
                                                placeholder="98.456789"
                                            />
                                        </label>

                                        <div className="flex items-center gap-3 rounded-lg border p-3">
                                            <Checkbox
                                                id="validation-geotag"
                                                checked={normalizeBoolean(
                                                    validationForm.is_geotagged,
                                                )}
                                                onCheckedChange={(checked) =>
                                                    handleValidationFormChange(
                                                        'is_geotagged',
                                                        checked === true,
                                                    )
                                                }
                                            />
                                            <label
                                                htmlFor="validation-geotag"
                                                className="text-sm font-medium"
                                            >
                                                Tandai data ini sebagai geotagged
                                            </label>
                                        </div>
                                    </div>

                                    <label className="space-y-2 text-sm font-medium">
                                        <span>Catatan lapangan</span>
                                        <Textarea
                                            rows={5}
                                            value={validationForm.validation_note}
                                            onChange={(event) =>
                                                handleValidationFormChange(
                                                    'validation_note',
                                                    event.target.value,
                                                )
                                            }
                                            placeholder="Ringkasan temuan lapangan, akses lokasi, dan konteks tambahan."
                                        />
                                    </label>

                                    {validationMessage ? (
                                        <Alert>
                                            <AlertTitle>Validasi tersimpan</AlertTitle>
                                            <AlertDescription>
                                                {validationMessage}
                                            </AlertDescription>
                                        </Alert>
                                    ) : null}

                                    <Button
                                        type="submit"
                                        disabled={
                                            !selectedHotspotId ||
                                            !canValidate ||
                                            submittingValidation
                                        }
                                    >
                                        {submittingValidation
                                            ? 'Menyimpan...'
                                            : editableValidationId
                                                ? 'Update Validasi'
                                                : 'Simpan Validasi'}
                                    </Button>
                                </form>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle>Foto Bukti Validasi</CardTitle>
                                <CardDescription>
                                    File tetap melalui URL terproteksi dan hanya aktif setelah validasi tersimpan.
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <form className="space-y-4" onSubmit={handleUploadPhoto}>
                                    <label className="space-y-2 text-sm font-medium">
                                        <span>Pilih foto</span>
                                        <Input
                                            type="file"
                                            accept="image/png,image/jpeg,image/webp"
                                            onChange={(event) =>
                                                setPhotoFile(event.target.files?.[0] ?? null)
                                            }
                                        />
                                    </label>

                                    <div className="grid gap-4 md:grid-cols-2">
                                        <label className="space-y-2 text-sm font-medium">
                                            <span>Caption</span>
                                            <Input
                                                value={photoForm.caption}
                                                onChange={(event) =>
                                                    handlePhotoFormChange(
                                                        'caption',
                                                        event.target.value,
                                                    )
                                                }
                                                placeholder="Contoh: bekas pembukaan lahan"
                                            />
                                        </label>

                                        <label className="space-y-2 text-sm font-medium">
                                            <span>Taken at</span>
                                            <Input
                                                type="datetime-local"
                                                value={photoForm.taken_at}
                                                onChange={(event) =>
                                                    handlePhotoFormChange(
                                                        'taken_at',
                                                        event.target.value,
                                                    )
                                                }
                                            />
                                        </label>

                                        <label className="space-y-2 text-sm font-medium">
                                            <span>Photo latitude</span>
                                            <Input
                                                type="number"
                                                step="0.000001"
                                                value={photoForm.photo_lat}
                                                onChange={(event) =>
                                                    handlePhotoFormChange(
                                                        'photo_lat',
                                                        event.target.value,
                                                    )
                                                }
                                            />
                                        </label>

                                        <label className="space-y-2 text-sm font-medium">
                                            <span>Photo longitude</span>
                                            <Input
                                                type="number"
                                                step="0.000001"
                                                value={photoForm.photo_lng}
                                                onChange={(event) =>
                                                    handlePhotoFormChange(
                                                        'photo_lng',
                                                        event.target.value,
                                                    )
                                                }
                                            />
                                        </label>
                                    </div>

                                    <div className="grid gap-4 md:grid-cols-2">
                                        <label className="space-y-2 text-sm font-medium">
                                            <span>Sensitivity</span>
                                            <select
                                                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                                                value={photoForm.sensitivity_level}
                                                onChange={(event) =>
                                                    handlePhotoFormChange(
                                                        'sensitivity_level',
                                                        event.target.value,
                                                    )
                                                }
                                            >
                                                {SENSITIVITY_OPTIONS.map((option) => (
                                                    <option
                                                        key={option.value}
                                                        value={option.value}
                                                    >
                                                        {option.label}
                                                    </option>
                                                ))}
                                            </select>
                                        </label>

                                        <div className="flex items-center gap-3 rounded-lg border p-3">
                                            <Checkbox
                                                id="photo-primary"
                                                checked={normalizeBoolean(
                                                    photoForm.is_primary,
                                                )}
                                                onCheckedChange={(checked) =>
                                                    handlePhotoFormChange(
                                                        'is_primary',
                                                        checked === true,
                                                    )
                                                }
                                            />
                                            <label
                                                htmlFor="photo-primary"
                                                className="text-sm font-medium"
                                            >
                                                Jadikan sebagai primary photo
                                            </label>
                                        </div>
                                    </div>

                                    {photoMessage ? (
                                        <Alert>
                                            <AlertTitle>Foto tersimpan</AlertTitle>
                                            <AlertDescription>{photoMessage}</AlertDescription>
                                        </Alert>
                                    ) : null}

                                    <Button
                                        type="submit"
                                        disabled={
                                            !editableValidationId ||
                                            !photoFile ||
                                            !canValidate ||
                                            uploadingPhoto
                                        }
                                    >
                                        {uploadingPhoto ? 'Mengunggah...' : 'Upload Foto'}
                                    </Button>
                                </form>

                                {selectedValidation ? (
                                    <div className="space-y-3 border-t pt-4">
                                        <div>
                                            <p className="text-sm font-medium">
                                                Foto untuk validasi #{selectedValidation.id}
                                            </p>
                                            <p className="text-xs text-muted-foreground">
                                                Validator:{' '}
                                                {selectedValidation.validator?.name ??
                                                    'Validator internal'}
                                            </p>
                                        </div>

                                        {selectedValidationPhotos.length === 0 ? (
                                            <p className="text-sm text-muted-foreground">
                                                Belum ada foto untuk validasi yang dipilih.
                                            </p>
                                        ) : (
                                            <div className="grid gap-4 sm:grid-cols-2">
                                                {selectedValidationPhotos.map((photo) => (
                                                    <article
                                                        key={photo.id}
                                                        className="rounded-xl border p-3"
                                                    >
                                                        <img
                                                            src={photo.file_url}
                                                            alt={
                                                                photo.caption ??
                                                                photo.original_filename
                                                            }
                                                            className="h-36 w-full rounded-lg object-cover"
                                                        />
                                                        <p className="mt-3 text-sm font-medium">
                                                            {photo.caption ??
                                                                photo.original_filename}
                                                        </p>
                                                        <p className="text-xs text-muted-foreground">
                                                            {formatDateTime(
                                                                photo.taken_at ??
                                                                    photo.created_at,
                                                            )}
                                                        </p>
                                                    </article>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                ) : null}
                            </CardContent>
                        </Card>
                    </div>
                </section>
            </div>
        </AuthenticatedLayout>
    );
}
