import Modal from '@/Components/Modal';
import DashboardEmptyState from '@/Components/Dashboard/DashboardEmptyState';
import DashboardErrorState from '@/Components/Dashboard/DashboardErrorState';
import DashboardMetricStrip from '@/Components/Dashboard/DashboardMetricStrip';
import FloatingLegend from '@/Components/Dashboard/FloatingLegend';
import HotspotDetailDrawer from '@/Components/Dashboard/HotspotDetailDrawer';
import HotspotFilterPanel from '@/Components/Dashboard/HotspotFilterPanel';
import LayerControlPanel from '@/Components/Dashboard/LayerControlPanel';
import {
    buildValidationPayload,
    CONFIDENCE_OPTIONS,
    DEFAULT_ANALYSIS_RUN_REPORT_FORM,
    DEFAULT_FILTERS,
    DEFAULT_HOTSPOT_REPORT_FORM,
    DEFAULT_LAYER_VISIBILITY,
    DEFAULT_PHOTO_FORM,
    DEFAULT_VALIDATION_FORM,
    formatDateTime,
    formatLabel,
    formatNumber,
    formatStatus,
    getFeatureCentroid,
    getFeatureId,
    getValidationHistory,
    normalizeBoolean,
    OBSERVED_CONDITION_OPTIONS,
    PRIORITY_OPTIONS,
    SENSITIVITY_OPTIONS,
    STATUS_OPTIONS,
    toDateTimeLocalValue,
    VALIDATION_STATUS_OPTIONS,
} from '@/Components/Dashboard/dashboardHelpers';
import WebGISMap from '@/Components/WebGIS/WebGISMap';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import {
    createAnalysisRunReport,
    createFieldValidation,
    createHotspotReport,
    fetchAnalysisContext,
    fetchDashboardBootstrap,
    fetchHotspotDetail,
    fetchReports,
    updateFieldValidation,
    uploadValidationPhoto,
} from '@/lib/api';
import { Head, usePage } from '@inertiajs/react';
import { useEffect, useMemo, useState } from 'react';

export default function Dashboard() {
    const { auth } = usePage().props;
    const currentUser = auth.user;
    const userPermissions = currentUser?.permissions ?? [];
    const canValidateHotspot = userPermissions.includes('validate_hotspot');
    const canExportReport = userPermissions.includes('export_report');

    const [bootstrapData, setBootstrapData] = useState({
        summary: null,
        analysisRuns: [],
        aoiAreas: [],
    });
    const [analysisContext, setAnalysisContext] = useState({
        hotspots: { type: 'FeatureCollection', features: [] },
        layers: [],
    });
    const [selectedRunId, setSelectedRunId] = useState('');
    const [selectedHotspotId, setSelectedHotspotId] = useState(null);
    const [selectedHotspotDetail, setSelectedHotspotDetail] = useState(null);
    const [filters, setFilters] = useState(DEFAULT_FILTERS);
    const [layerVisibility, setLayerVisibility] = useState(DEFAULT_LAYER_VISIBILITY);
    const [mapViewportMode, setMapViewportMode] = useState({ mode: 'all', nonce: 0 });
    const [validationForm, setValidationForm] = useState(DEFAULT_VALIDATION_FORM);
    const [photoForm, setPhotoForm] = useState(DEFAULT_PHOTO_FORM);
    const [photoFile, setPhotoFile] = useState(null);
    const [photoPreviewUrl, setPhotoPreviewUrl] = useState('');
    const [hotspotReportForm, setHotspotReportForm] = useState(DEFAULT_HOTSPOT_REPORT_FORM);
    const [analysisRunReportForm, setAnalysisRunReportForm] = useState(DEFAULT_ANALYSIS_RUN_REPORT_FORM);
    const [validationMode, setValidationMode] = useState('create');
    const [reportModal, setReportModal] = useState({ open: false, type: 'hotspot' });
    const [hotspotReports, setHotspotReports] = useState([]);
    const [analysisRunReports, setAnalysisRunReports] = useState([]);
    const [validationMessage, setValidationMessage] = useState('');
    const [photoMessage, setPhotoMessage] = useState('');
    const [reportMessage, setReportMessage] = useState('');
    const [loading, setLoading] = useState(true);
    const [contextLoading, setContextLoading] = useState(false);
    const [detailLoading, setDetailLoading] = useState(false);
    const [submittingValidation, setSubmittingValidation] = useState(false);
    const [uploadingPhoto, setUploadingPhoto] = useState(false);
    const [submittingReport, setSubmittingReport] = useState(false);
    const [reportLoading, setReportLoading] = useState(false);
    const [locating, setLocating] = useState(false);
    const [error, setError] = useState('');
    const [detailError, setDetailError] = useState('');
    const [validationError, setValidationError] = useState('');
    const [photoError, setPhotoError] = useState('');
    const [reportError, setReportError] = useState('');

    useEffect(() => {
        let active = true;

        async function loadBootstrap() {
            setLoading(true);
            setError('');

            try {
                const data = await fetchDashboardBootstrap();

                if (!active) {
                    return;
                }

                setBootstrapData(data);

                if (data.analysisRuns.length > 0) {
                    setSelectedRunId(String(data.analysisRuns[0].id));
                }
            } catch {
                if (active) {
                    setError('Dashboard internal belum bisa memuat data API saat ini.');
                }
            } finally {
                if (active) {
                    setLoading(false);
                }
            }
        }

        loadBootstrap();

        return () => {
            active = false;
        };
    }, []);

    useEffect(() => {
        if (!selectedRunId) {
            return;
        }

        let active = true;

        async function loadContext() {
            setContextLoading(true);
            setError('');
            setSelectedHotspotId(null);
            setSelectedHotspotDetail(null);
            setDetailError('');
            setValidationError('');
            setPhotoError('');
            setValidationMessage('');
            setPhotoMessage('');
            setAnalysisContext({
                hotspots: { type: 'FeatureCollection', features: [] },
                layers: [],
            });

            try {
                const data = await fetchAnalysisContext(selectedRunId);

                if (!active) {
                    return;
                }

                setAnalysisContext(data);
                setMapViewportMode({ mode: 'all', nonce: Date.now() });
            } catch {
                if (active) {
                    setAnalysisContext({
                        hotspots: { type: 'FeatureCollection', features: [] },
                        layers: [],
                    });
                    setError('Hotspot atau layer map belum berhasil dimuat.');
                }
            } finally {
                if (active) {
                    setContextLoading(false);
                }
            }
        }

        loadContext();

        return () => {
            active = false;
        };
    }, [selectedRunId]);

    useEffect(() => {
        if (!selectedHotspotId) {
            setSelectedHotspotDetail(null);
            setDetailError('');
            return;
        }

        let active = true;

        async function loadHotspotDetail() {
            setDetailLoading(true);
            setDetailError('');

            try {
                const detail = await fetchHotspotDetail(selectedHotspotId);

                if (active) {
                    setSelectedHotspotDetail(detail);
                }
            } catch {
                if (active) {
                    setSelectedHotspotDetail(null);
                    setDetailError('Detail hotspot belum berhasil dimuat.');
                }
            } finally {
                if (active) {
                    setDetailLoading(false);
                }
            }
        }

        loadHotspotDetail();

        return () => {
            active = false;
        };
    }, [selectedHotspotId]);

    useEffect(() => {
        if (!photoFile) {
            setPhotoPreviewUrl('');
            return undefined;
        }

        const previewUrl = URL.createObjectURL(photoFile);
        setPhotoPreviewUrl(previewUrl);

        return () => {
            URL.revokeObjectURL(previewUrl);
        };
    }, [photoFile]);

    const selectedRun = useMemo(
        () =>
            bootstrapData.analysisRuns.find(
                (analysisRun) => String(analysisRun.id) === String(selectedRunId),
            ) ?? null,
        [bootstrapData.analysisRuns, selectedRunId],
    );

    const selectedAoi = useMemo(() => {
        const aoiId = selectedRun?.aoi_area_id;

        return bootstrapData.aoiAreas.find((aoiArea) => aoiArea.id === aoiId) ?? null;
    }, [bootstrapData.aoiAreas, selectedRun]);

    const allFeatures = useMemo(
        () => analysisContext.hotspots?.features ?? [],
        [analysisContext.hotspots],
    );

    const filteredFeatures = useMemo(() => {
        return allFeatures.filter((feature) => {
            const properties = feature.properties ?? {};
            const detectedAt = properties.detected_at ? new Date(properties.detected_at) : null;
            const areaValue = properties.area_ha != null ? Number(properties.area_ha) : null;

            if (filters.priority !== 'all' && properties.priority !== filters.priority) {
                return false;
            }

            if (
                filters.validationStatus !== 'all'
                && properties.validation_status !== filters.validationStatus
            ) {
                return false;
            }

            if (filters.detectedFrom && detectedAt) {
                const startDate = new Date(`${filters.detectedFrom}T00:00:00`);

                if (detectedAt < startDate) {
                    return false;
                }
            }

            if (filters.detectedFrom && !detectedAt) {
                return false;
            }

            if (filters.detectedTo && detectedAt) {
                const endDate = new Date(`${filters.detectedTo}T23:59:59`);

                if (detectedAt > endDate) {
                    return false;
                }
            }

            if (filters.detectedTo && !detectedAt) {
                return false;
            }

            if (filters.areaMin !== '' && areaValue != null && areaValue < Number(filters.areaMin)) {
                return false;
            }

            if (filters.areaMin !== '' && areaValue == null) {
                return false;
            }

            if (filters.areaMax !== '' && areaValue != null && areaValue > Number(filters.areaMax)) {
                return false;
            }

            if (filters.areaMax !== '' && areaValue == null) {
                return false;
            }

            return true;
        });
    }, [allFeatures, filters]);

    useEffect(() => {
        if (filteredFeatures.length === 0) {
            setSelectedHotspotId(null);
            return;
        }

        const selectedStillVisible = filteredFeatures.some(
            (feature) => String(getFeatureId(feature)) === String(selectedHotspotId),
        );

        if (!selectedStillVisible) {
            setSelectedHotspotId(getFeatureId(filteredFeatures[0]));
        }
    }, [filteredFeatures, selectedHotspotId]);

    const filteredHotspotCollection = useMemo(
        () => ({
            type: 'FeatureCollection',
            features: filteredFeatures,
        }),
        [filteredFeatures],
    );

    const selectedFeature = useMemo(
        () =>
            filteredFeatures.find(
                (feature) => String(getFeatureId(feature)) === String(selectedHotspotId),
            ) ?? null,
        [filteredFeatures, selectedHotspotId],
    );

    const visibleAreaTotal = useMemo(
        () =>
            filteredFeatures.reduce((sum, feature) => {
                const areaValue = Number(feature.properties?.area_ha ?? 0);

                return sum + (Number.isNaN(areaValue) ? 0 : areaValue);
            }, 0),
        [filteredFeatures],
    );

    const validatedCount = useMemo(
        () =>
            filteredFeatures.filter(
                (feature) => feature.properties?.validation_status === 'validated',
            ).length,
        [filteredFeatures],
    );

    const highPriorityCount = useMemo(
        () =>
            filteredFeatures.filter((feature) => feature.properties?.priority === 'high').length,
        [filteredFeatures],
    );

    const selectedFeatureProperties = selectedFeature?.properties ?? {};
    const selectedDetail = selectedHotspotDetail ?? {};
    const centroidCoordinates = getFeatureCentroid(selectedFeature, selectedHotspotDetail);
    const validationHistory = getValidationHistory(selectedHotspotDetail);
    const latestValidation = validationHistory[0] ?? null;
    const editableValidation = validationHistory.find(
        (validation) => validation.validator_id === currentUser?.id,
    ) ?? null;
    const allValidationPhotos = validationHistory.flatMap((validation) =>
        (validation.photos ?? []).map((photo) => ({
            ...photo,
            validation_id: validation.id,
            validation_status: validation.validation_status,
        })),
    );
    const hasNonDefaultFilters = Object.entries(DEFAULT_FILTERS).some(
        ([key, value]) => filters[key] !== value,
    );
    const canUploadPhoto = canValidateHotspot && Boolean(editableValidation?.id || latestValidation?.id);

    useEffect(() => {
        if (!selectedHotspotId) {
            setValidationForm(DEFAULT_VALIDATION_FORM);
            setPhotoForm(DEFAULT_PHOTO_FORM);
            setPhotoFile(null);
            setValidationMode('create');
            setHotspotReportForm(DEFAULT_HOTSPOT_REPORT_FORM);
            return;
        }

        if (editableValidation) {
            setValidationMode('update');
            setValidationForm({
                validation_status: editableValidation.validation_status ?? 'under_review',
                validation_note: editableValidation.validation_note ?? '',
                observed_condition: editableValidation.observed_condition ?? '',
                confidence_level: editableValidation.confidence_level ?? '',
                visited_at: toDateTimeLocalValue(editableValidation.visited_at),
                is_geotagged: normalizeBoolean(editableValidation.is_geotagged),
                sensitivity_level: editableValidation.sensitivity_level ?? 'restricted',
                photo_lat: editableValidation.validation_point?.coordinates?.[1]?.toString() ?? '',
                photo_lng: editableValidation.validation_point?.coordinates?.[0]?.toString() ?? '',
            });
        } else {
            setValidationMode('create');
            setValidationForm({
                ...DEFAULT_VALIDATION_FORM,
                photo_lat: centroidCoordinates?.[1]?.toString() ?? '',
                photo_lng: centroidCoordinates?.[0]?.toString() ?? '',
            });
        }

        setPhotoForm((current) => ({
            ...DEFAULT_PHOTO_FORM,
            taken_at: current.taken_at,
            photo_lat: current.photo_lat || centroidCoordinates?.[1]?.toString() || '',
            photo_lng: current.photo_lng || centroidCoordinates?.[0]?.toString() || '',
        }));
        setPhotoFile(null);
        setValidationError('');
        setPhotoError('');
        setValidationMessage('');
        setPhotoMessage('');
        setReportError('');
        setReportMessage('');
        setHotspotReportForm({
            ...DEFAULT_HOTSPOT_REPORT_FORM,
            title: `Laporan Indikasi Awal ${selectedFeature?.properties?.hotspot_code ?? 'Hotspot'}`,
        });
    }, [selectedHotspotId, editableValidation, centroidCoordinates]);

    useEffect(() => {
        if (!selectedRun) {
            setAnalysisRunReportForm(DEFAULT_ANALYSIS_RUN_REPORT_FORM);
            return;
        }

        setAnalysisRunReportForm({
            ...DEFAULT_ANALYSIS_RUN_REPORT_FORM,
            title: `Laporan Analysis Run ${selectedRun.name}`,
        });
    }, [selectedRun]);

    useEffect(() => {
        if (!canExportReport || !selectedHotspotId) {
            setHotspotReports([]);
            return;
        }

        let active = true;

        async function loadHotspotReports() {
            setReportLoading(true);

            try {
                const response = await fetchReports({
                    hotspot_id: selectedHotspotId,
                    report_type: 'hotspot',
                    per_page: 10,
                });

                if (active) {
                    setHotspotReports(response.data);
                }
            } catch {
                if (active) {
                    setHotspotReports([]);
                }
            } finally {
                if (active) {
                    setReportLoading(false);
                }
            }
        }

        loadHotspotReports();

        return () => {
            active = false;
        };
    }, [canExportReport, selectedHotspotId]);

    useEffect(() => {
        if (!canExportReport || !selectedRunId) {
            setAnalysisRunReports([]);
            return;
        }

        let active = true;

        async function loadRunReports() {
            try {
                const response = await fetchReports({
                    analysis_run_id: selectedRunId,
                    report_type: 'analysis_run',
                    per_page: 10,
                });

                if (active) {
                    setAnalysisRunReports(response.data);
                }
            } catch {
                if (active) {
                    setAnalysisRunReports([]);
                }
            }
        }

        loadRunReports();

        return () => {
            active = false;
        };
    }, [canExportReport, selectedRunId]);

    function handleFilterChange(key, value) {
        setFilters((current) => ({
            ...current,
            [key]: value,
        }));
    }

    function resetFilters() {
        setFilters(DEFAULT_FILTERS);
    }

    function toggleLayer(key) {
        setLayerVisibility((current) => ({
            ...current,
            [key]: !current[key],
        }));
    }

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

    function handleHotspotReportFormChange(key, value) {
        setHotspotReportForm((current) => ({
            ...current,
            [key]: value,
        }));
    }

    function handleAnalysisRunReportFormChange(key, value) {
        setAnalysisRunReportForm((current) => ({
            ...current,
            [key]: value,
        }));
    }

    async function refreshSelectedHotspot() {
        if (!selectedHotspotId) {
            return;
        }

        const detail = await fetchHotspotDetail(selectedHotspotId);
        setSelectedHotspotDetail(detail);
    }

    async function handleUseBrowserLocation(target = 'validation') {
        if (!navigator.geolocation) {
            if (target === 'validation') {
                setValidationError('Browser ini tidak mendukung geolocation.');
            } else {
                setPhotoError('Browser ini tidak mendukung geolocation.');
            }
            return;
        }

        setLocating(true);

        navigator.geolocation.getCurrentPosition(
            (position) => {
                const latitude = position.coords.latitude.toFixed(6);
                const longitude = position.coords.longitude.toFixed(6);

                if (target === 'validation') {
                    setValidationForm((current) => ({
                        ...current,
                        photo_lat: latitude,
                        photo_lng: longitude,
                        is_geotagged: true,
                    }));
                    setValidationMessage('Lokasi browser berhasil diisi ke form validasi.');
                    setValidationError('');
                } else {
                    setPhotoForm((current) => ({
                        ...current,
                        photo_lat: latitude,
                        photo_lng: longitude,
                    }));
                    setPhotoMessage('Lokasi browser berhasil diisi ke form foto.');
                    setPhotoError('');
                }

                setLocating(false);
            },
            () => {
                if (target === 'validation') {
                    setValidationError('Lokasi browser belum bisa diambil. Periksa izin lokasi.');
                } else {
                    setPhotoError('Lokasi browser belum bisa diambil. Periksa izin lokasi.');
                }
                setLocating(false);
            },
            {
                enableHighAccuracy: true,
                timeout: 10000,
            },
        );
    }

    async function handleSubmitValidation(event) {
        event.preventDefault();

        if (!selectedHotspotId) {
            return;
        }

        setSubmittingValidation(true);
        setValidationError('');
        setValidationMessage('');

        try {
            const payload = buildValidationPayload(validationForm);

            if (validationMode === 'update' && editableValidation?.id) {
                await updateFieldValidation(editableValidation.id, payload);
                setValidationMessage('Validasi lapangan berhasil diperbarui.');
            } else {
                await createFieldValidation(selectedHotspotId, payload);
                setValidationMessage('Validasi lapangan berhasil disimpan.');
            }

            await refreshSelectedHotspot();
        } catch (submitError) {
            setValidationError(
                submitError?.response?.data?.message
                ?? 'Validasi lapangan belum berhasil disimpan.',
            );
        } finally {
            setSubmittingValidation(false);
        }
    }

    async function handlePhotoUpload(event) {
        event.preventDefault();

        const targetValidationId = editableValidation?.id ?? latestValidation?.id;

        if (!targetValidationId || !photoFile) {
            setPhotoError('Simpan validasi dulu dan pilih foto sebelum upload.');
            return;
        }

        setUploadingPhoto(true);
        setPhotoError('');
        setPhotoMessage('');

        try {
            const formData = new FormData();
            formData.append('photo', photoFile);
            formData.append('caption', photoForm.caption);
            formData.append('is_primary', photoForm.is_primary ? '1' : '0');
            formData.append('sensitivity_level', photoForm.sensitivity_level);

            if (photoForm.taken_at) {
                formData.append('taken_at', new Date(photoForm.taken_at).toISOString());
            }

            if (photoForm.photo_lat !== '' && photoForm.photo_lng !== '') {
                formData.append('photo_lat', photoForm.photo_lat);
                formData.append('photo_lng', photoForm.photo_lng);
            }

            await uploadValidationPhoto(targetValidationId, formData);
            setPhotoMessage('Foto validasi berhasil diunggah.');
            setPhotoForm({
                ...DEFAULT_PHOTO_FORM,
                photo_lat: photoForm.photo_lat,
                photo_lng: photoForm.photo_lng,
            });
            setPhotoFile(null);
            await refreshSelectedHotspot();
        } catch (uploadError) {
            setPhotoError(
                uploadError?.response?.data?.message
                ?? 'Foto validasi belum berhasil diunggah.',
            );
        } finally {
            setUploadingPhoto(false);
        }
    }

    async function handleSubmitReport(event) {
        event.preventDefault();

        if (!canExportReport) {
            return;
        }

        setSubmittingReport(true);
        setReportError('');
        setReportMessage('');

        try {
            if (reportModal.type === 'hotspot') {
                if (!selectedHotspotId) {
                    throw new Error('Hotspot belum dipilih.');
                }

                await createHotspotReport(selectedHotspotId, hotspotReportForm);
                setReportMessage('Laporan PDF hotspot berhasil dibuat.');
                const response = await fetchReports({
                    hotspot_id: selectedHotspotId,
                    report_type: 'hotspot',
                    per_page: 10,
                });
                setHotspotReports(response.data);
            } else {
                if (!selectedRunId) {
                    throw new Error('Analysis run belum dipilih.');
                }

                await createAnalysisRunReport(selectedRunId, analysisRunReportForm);
                setReportMessage('Laporan analysis run berhasil dibuat.');
                const response = await fetchReports({
                    analysis_run_id: selectedRunId,
                    report_type: 'analysis_run',
                    per_page: 10,
                });
                setAnalysisRunReports(response.data);
            }

            setReportModal((current) => ({
                ...current,
                open: false,
            }));
        } catch (submitError) {
            setReportError(
                submitError?.response?.data?.message
                ?? submitError?.message
                ?? 'Laporan PDF belum berhasil dibuat.',
            );
        } finally {
            setSubmittingReport(false);
        }
    }

    return (
        <AuthenticatedLayout
            title="WebGIS Deteksi Dini Mangrove"
            description="Review hotspot berbasis peta dengan filter cepat, detail indeks, validasi lapangan, dan unggah bukti foto dalam satu workspace internal."
            eyebrow="MANGROVE-EYE Internal"
            breadcrumbItems={[{ label: 'Dashboard' }]}
            pageHeaderClassName="webgis-page-header"
        >
            <Head title="WebGIS Dashboard" />

            <div className="webgis-shell">
                <section className="webgis-topbar">
                    <div>
                        <p className="webgis-kicker">MANGROVE-EYE Internal</p>
                        <h1>WebGIS Deteksi Dini Mangrove</h1>
                        <p className="webgis-subtitle">
                            Review hotspot berbasis peta dengan filter cepat, detail indeks,
                            validasi lapangan, dan unggah bukti foto dalam satu workspace internal.
                        </p>
                    </div>

                    <div className="webgis-select-group">
                        <label htmlFor="analysis-run-select">Analysis Run Aktif</label>
                        <select
                            id="analysis-run-select"
                            value={selectedRunId}
                            onChange={(event) => setSelectedRunId(event.target.value)}
                            disabled={loading || bootstrapData.analysisRuns.length === 0}
                        >
                            {bootstrapData.analysisRuns.length === 0 ? (
                                <option value="">Belum ada analysis run</option>
                            ) : null}
                            {bootstrapData.analysisRuns.map((analysisRun) => (
                                <option key={analysisRun.id} value={analysisRun.id}>
                                    {analysisRun.name}
                                </option>
                            ))}
                        </select>
                    </div>
                </section>

                <DashboardMetricStrip
                    filteredCount={filteredFeatures.length}
                    allCount={allFeatures.length}
                    visibleAreaTotal={visibleAreaTotal}
                    validatedCount={validatedCount}
                    highPriorityCount={highPriorityCount}
                    formatNumber={formatNumber}
                />

                <section className="webgis-layout">
                    <aside className="left-panel">
                        <div className="panel-card">
                            <p className="panel-kicker">AOI Aktif</p>
                            <h2>{selectedAoi?.name ?? 'Belum dipilih'}</h2>
                            <p>
                                {selectedAoi?.village ?? 'Kwala Serapuh'}
                                {selectedAoi?.district ? `, ${selectedAoi.district}` : ''}
                            </p>
                            <div className="meta-row">
                                <span>Status AOI</span>
                                <strong>{selectedAoi?.verification_status ?? '-'}</strong>
                            </div>
                            <div className="meta-row">
                                <span>Luas Estimasi</span>
                                <strong>
                                    {selectedAoi?.estimated_area_ha != null
                                        ? `${selectedAoi.estimated_area_ha} ha`
                                        : '-'}
                                </strong>
                            </div>
                        </div>

                        <div className="panel-card">
                            <div className="panel-heading-row">
                                <div>
                                    <p className="panel-kicker">Report Analysis Run</p>
                                    <h3>Ringkasan PDF run aktif</h3>
                                </div>
                                <span className="panel-caption">
                                    {analysisRunReports.length} report
                                </span>
                            </div>
                            <p className="drawer-caption">
                                Gunakan untuk menyimpan snapshot ringkas satu analysis run lengkap dengan disclaimer internal.
                            </p>
                            <div className="drawer-actions">
                                <button
                                    type="button"
                                    className="secondary-button"
                                    onClick={() => setReportModal({ open: true, type: 'analysis_run' })}
                                    disabled={!selectedRunId || !canExportReport}
                                >
                                    Generate Run Report
                                </button>
                                {analysisRunReports[0]?.download_url ? (
                                    <a
                                        href={analysisRunReports[0].download_url}
                                        className="secondary-button secondary-button-link"
                                    >
                                        Download Latest
                                    </a>
                                ) : null}
                            </div>
                        </div>

                        <HotspotFilterPanel
                            filters={filters}
                            handleFilterChange={handleFilterChange}
                            resetFilters={resetFilters}
                            hasNonDefaultFilters={hasNonDefaultFilters}
                            filteredFeatures={filteredFeatures}
                            selectedHotspotId={selectedHotspotId}
                            setSelectedHotspotId={setSelectedHotspotId}
                            PRIORITY_OPTIONS={PRIORITY_OPTIONS}
                            STATUS_OPTIONS={STATUS_OPTIONS}
                            formatNumber={formatNumber}
                            formatStatus={formatStatus}
                        />

                        <LayerControlPanel
                            layerVisibility={layerVisibility}
                            toggleLayer={toggleLayer}
                            layers={analysisContext.layers}
                        />
                    </aside>

                    <div className="map-stage">
                        <div className="map-frame">
                            <WebGISMap
                                aoiGeometry={selectedAoi?.geometry ?? null}
                                hotspotCollection={filteredHotspotCollection}
                                selectedFeature={selectedFeature}
                                onSelectFeature={(feature) => setSelectedHotspotId(getFeatureId(feature))}
                                layerVisibility={layerVisibility}
                                viewportMode={mapViewportMode}
                            />

                            <div className="map-toolbar">
                                <button
                                    type="button"
                                    className="map-toolbar-button"
                                    onClick={() => setMapViewportMode({ mode: 'aoi', nonce: Date.now() })}
                                >
                                    Fit to AOI
                                </button>
                                <button
                                    type="button"
                                    className="map-toolbar-button"
                                    onClick={() => setMapViewportMode({ mode: 'hotspots', nonce: Date.now() })}
                                    disabled={filteredFeatures.length === 0}
                                >
                                    Fit to all hotspots
                                </button>
                            </div>

                            <FloatingLegend statusOptions={STATUS_OPTIONS} />

                            {layerVisibility.staticPlaceholder ? (
                                <div className="static-layer-placeholder">
                                    Layer citra/statik analisis belum diaktifkan pada fase ini.
                                </div>
                            ) : null}

                            {contextLoading ? (
                                <div className="map-overlay-state">Memuat hotspot dan layer analysis run...</div>
                            ) : null}

                            {!contextLoading && error ? <DashboardErrorState message={error} /> : null}

                            {!contextLoading && !error && filteredFeatures.length === 0 ? (
                                <DashboardEmptyState message="Tidak ada hotspot yang tampil. Coba ubah filter atau pilih analysis run lain." />
                            ) : null}
                        </div>
                    </div>

                    <HotspotDetailDrawer
                        selectedFeatureProperties={selectedFeatureProperties}
                        selectedDetail={selectedDetail}
                        selectedRun={selectedRun}
                        centroidCoordinates={centroidCoordinates}
                        detailLoading={detailLoading}
                        detailError={detailError}
                        selectedHotspotId={selectedHotspotId}
                        canExportReport={canExportReport}
                        setReportModal={setReportModal}
                        hotspotReports={hotspotReports}
                        reportMessage={reportMessage}
                        reportError={reportError}
                        reportLoading={reportLoading}
                        validationMode={validationMode}
                        editableValidation={editableValidation}
                        handleSubmitValidation={handleSubmitValidation}
                        validationForm={validationForm}
                        handleValidationFormChange={handleValidationFormChange}
                        VALIDATION_STATUS_OPTIONS={VALIDATION_STATUS_OPTIONS}
                        CONFIDENCE_OPTIONS={CONFIDENCE_OPTIONS}
                        OBSERVED_CONDITION_OPTIONS={OBSERVED_CONDITION_OPTIONS}
                        SENSITIVITY_OPTIONS={SENSITIVITY_OPTIONS}
                        normalizeBoolean={normalizeBoolean}
                        locating={locating}
                        canValidateHotspot={canValidateHotspot}
                        handleUseBrowserLocation={handleUseBrowserLocation}
                        submittingValidation={submittingValidation}
                        validationMessage={validationMessage}
                        validationError={validationError}
                        handlePhotoUpload={handlePhotoUpload}
                        setPhotoFile={setPhotoFile}
                        photoPreviewUrl={photoPreviewUrl}
                        photoFile={photoFile}
                        photoForm={photoForm}
                        handlePhotoFormChange={handlePhotoFormChange}
                        canUploadPhoto={canUploadPhoto}
                        uploadingPhoto={uploadingPhoto}
                        photoMessage={photoMessage}
                        photoError={photoError}
                        allValidationPhotos={allValidationPhotos}
                        validationHistory={validationHistory}
                        loading={loading}
                        allFeatures={allFeatures}
                        formatStatus={formatStatus}
                        formatLabel={formatLabel}
                        formatNumber={formatNumber}
                        formatDateTime={formatDateTime}
                    />
                </section>
            </div>

            <Modal
                show={reportModal.open}
                maxWidth="lg"
                onClose={() => setReportModal((current) => ({ ...current, open: false }))}
            >
                <div className="report-modal-shell">
                    <div className="report-modal-header">
                        <div>
                            <p className="panel-kicker">Generate PDF</p>
                            <h3>
                                {reportModal.type === 'hotspot'
                                    ? 'Laporan Indikasi Awal Hotspot'
                                    : 'Laporan Analysis Run'}
                            </h3>
                        </div>
                    </div>

                    <p className="drawer-caption">
                        Laporan ini merupakan indikasi awal, bukan vonis hukum final. Pastikan opsi data sensitif dipilih secara hati-hati sebelum generate.
                    </p>

                    <form className="validation-form" onSubmit={handleSubmitReport}>
                        {reportModal.type === 'hotspot' ? (
                            <>
                                <label className="field-block field-block-full">
                                    <span>Judul report</span>
                                    <input
                                        type="text"
                                        value={hotspotReportForm.title}
                                        onChange={(event) =>
                                            handleHotspotReportFormChange('title', event.target.value)
                                        }
                                        placeholder="Laporan Hotspot"
                                    />
                                </label>

                                <div className="filter-grid">
                                    <label className="field-block field-checkbox">
                                        <span>Sertakan foto validasi</span>
                                        <input
                                            type="checkbox"
                                            checked={normalizeBoolean(hotspotReportForm.include_validation_photos)}
                                            onChange={(event) =>
                                                handleHotspotReportFormChange('include_validation_photos', event.target.checked)
                                            }
                                        />
                                    </label>
                                    <label className="field-block field-checkbox">
                                        <span>Sertakan koordinat presisi</span>
                                        <input
                                            type="checkbox"
                                            checked={normalizeBoolean(hotspotReportForm.include_precise_coordinates)}
                                            onChange={(event) =>
                                                handleHotspotReportFormChange('include_precise_coordinates', event.target.checked)
                                            }
                                        />
                                    </label>
                                </div>
                            </>
                        ) : (
                            <>
                                <label className="field-block field-block-full">
                                    <span>Judul report</span>
                                    <input
                                        type="text"
                                        value={analysisRunReportForm.title}
                                        onChange={(event) =>
                                            handleAnalysisRunReportFormChange('title', event.target.value)
                                        }
                                        placeholder="Laporan Analysis Run"
                                    />
                                </label>

                                <div className="filter-grid">
                                    <label className="field-block field-checkbox">
                                        <span>Sertakan ringkasan hotspot</span>
                                        <input
                                            type="checkbox"
                                            checked={normalizeBoolean(analysisRunReportForm.include_hotspot_summary)}
                                            onChange={(event) =>
                                                handleAnalysisRunReportFormChange('include_hotspot_summary', event.target.checked)
                                            }
                                        />
                                    </label>
                                    <label className="field-block field-checkbox">
                                        <span>Sertakan ringkasan validasi</span>
                                        <input
                                            type="checkbox"
                                            checked={normalizeBoolean(analysisRunReportForm.include_validation_summary)}
                                            onChange={(event) =>
                                                handleAnalysisRunReportFormChange('include_validation_summary', event.target.checked)
                                            }
                                        />
                                    </label>
                                </div>
                            </>
                        )}

                        <div className="report-confirmation-box">
                            <strong>Ringkasan sebelum generate</strong>
                            <p>
                                {reportModal.type === 'hotspot'
                                    ? `Hotspot: ${selectedFeatureProperties.hotspot_code ?? '-'} | AOI: ${selectedAoi?.name ?? '-'} | Status: ${formatStatus(selectedDetail.validation_status ?? selectedFeatureProperties.validation_status)}`
                                    : `Analysis Run: ${selectedRun?.name ?? '-'} | AOI: ${selectedAoi?.name ?? '-'} | Hotspot tampil: ${filteredFeatures.length}`}
                            </p>
                        </div>

                        <div className="report-modal-actions">
                            <button
                                type="button"
                                className="secondary-button"
                                onClick={() => setReportModal((current) => ({ ...current, open: false }))}
                            >
                                Batal
                            </button>
                            <button
                                type="submit"
                                className="secondary-button secondary-button-strong"
                                disabled={submittingReport}
                            >
                                {submittingReport ? 'Generating...' : 'Generate PDF'}
                            </button>
                        </div>
                    </form>
                </div>
            </Modal>
        </AuthenticatedLayout>
    );
}
