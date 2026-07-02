import Modal from '@/Components/Modal';
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

const PRIORITY_OPTIONS = [
    { value: 'all', label: 'Semua prioritas' },
    { value: 'high', label: 'High' },
    { value: 'medium', label: 'Medium' },
    { value: 'low', label: 'Low' },
];

const STATUS_OPTIONS = [
    { value: 'all', label: 'Semua status' },
    { value: 'detected', label: 'Detected' },
    { value: 'under_review', label: 'Under review' },
    { value: 'validated', label: 'Validated' },
    { value: 'rejected', label: 'Rejected' },
    { value: 'needs_recheck', label: 'Needs recheck' },
];

const VALIDATION_STATUS_OPTIONS = STATUS_OPTIONS.filter(({ value }) => value !== 'all' && value !== 'detected');

const CONFIDENCE_OPTIONS = [
    { value: '', label: 'Pilih confidence' },
    { value: 'low', label: 'Low' },
    { value: 'medium', label: 'Medium' },
    { value: 'high', label: 'High' },
];

const OBSERVED_CONDITION_OPTIONS = [
    { value: '', label: 'Pilih kondisi lapangan' },
    { value: 'mangrove_cut', label: 'Mangrove cut' },
    { value: 'oil_palm_planted', label: 'Oil palm planted' },
    { value: 'open_land', label: 'Open land' },
    { value: 'water_tide', label: 'Water tide' },
    { value: 'pond_or_aquaculture', label: 'Pond or aquaculture' },
    { value: 'cloud_shadow', label: 'Cloud shadow' },
    { value: 'unknown', label: 'Unknown' },
    { value: 'other', label: 'Other' },
];

const SENSITIVITY_OPTIONS = [
    { value: 'restricted', label: 'Restricted' },
    { value: 'internal', label: 'Internal' },
    { value: 'public', label: 'Public' },
];

const DEFAULT_FILTERS = {
    priority: 'all',
    validationStatus: 'all',
    detectedFrom: '',
    detectedTo: '',
    areaMin: '',
    areaMax: '',
};

const DEFAULT_LAYER_VISIBILITY = {
    aoi: true,
    polygons: true,
    centroids: true,
    selected: true,
    staticPlaceholder: true,
};

const DEFAULT_VALIDATION_FORM = {
    validation_status: 'under_review',
    validation_note: '',
    observed_condition: '',
    confidence_level: '',
    visited_at: '',
    is_geotagged: false,
    sensitivity_level: 'restricted',
    photo_lat: '',
    photo_lng: '',
};

const DEFAULT_PHOTO_FORM = {
    caption: '',
    taken_at: '',
    is_primary: true,
    sensitivity_level: 'restricted',
    photo_lat: '',
    photo_lng: '',
};

const DEFAULT_HOTSPOT_REPORT_FORM = {
    title: '',
    include_validation_photos: true,
    include_precise_coordinates: false,
};

const DEFAULT_ANALYSIS_RUN_REPORT_FORM = {
    title: '',
    include_hotspot_summary: true,
    include_validation_summary: true,
};

function MetricTile({ label, value, tone = 'default', caption = '' }) {
    return (
        <div className={`metric-tile metric-tile-${tone}`}>
            <p>{label}</p>
            <strong>{value}</strong>
            {caption ? <small>{caption}</small> : null}
        </div>
    );
}

function formatStatus(value) {
    if (!value) {
        return '-';
    }

    return value.replaceAll('_', ' ');
}

function formatLabel(value) {
    return formatStatus(value).replace(/\b\w/g, (char) => char.toUpperCase());
}

function formatNumber(value, digits = 2) {
    if (value == null || value === '') {
        return '-';
    }

    return Number(value).toFixed(digits);
}

function formatDateTime(value) {
    if (!value) {
        return '-';
    }

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
        return value;
    }

    return new Intl.DateTimeFormat('id-ID', {
        dateStyle: 'medium',
        timeStyle: 'short',
    }).format(date);
}

function toDateTimeLocalValue(value) {
    if (!value) {
        return '';
    }

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
        return '';
    }

    const local = new Date(date.getTime() - date.getTimezoneOffset() * 60000);

    return local.toISOString().slice(0, 16);
}

function getFeatureId(feature) {
    return feature?.properties?.id ?? null;
}

function getFeatureCentroid(feature, detail) {
    return detail?.centroid?.coordinates ?? feature?.properties?.centroid?.coordinates ?? null;
}

function getValidationHistory(detail) {
    return Array.isArray(detail?.validations) ? detail.validations : [];
}

function normalizeBoolean(value) {
    return value === true || value === '1' || value === 1;
}

function buildValidationPayload(form) {
    const payload = {
        validation_status: form.validation_status,
        validation_note: form.validation_note || null,
        observed_condition: form.observed_condition || null,
        confidence_level: form.confidence_level || null,
        visited_at: form.visited_at ? new Date(form.visited_at).toISOString() : null,
        is_geotagged: normalizeBoolean(form.is_geotagged),
        sensitivity_level: form.sensitivity_level,
    };

    if (form.photo_lat !== '' && form.photo_lng !== '') {
        payload.validation_point = {
            type: 'Point',
            coordinates: [Number(form.photo_lng), Number(form.photo_lat)],
        };
    }

    return payload;
}

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
        <AuthenticatedLayout>
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

                <section className="metric-strip">
                    <MetricTile
                        label="Hotspot Tampil"
                        value={filteredFeatures.length}
                        tone="ember"
                        caption={`Dari ${allFeatures.length} hotspot pada run aktif`}
                    />
                    <MetricTile
                        label="Area Tampil"
                        value={`${formatNumber(visibleAreaTotal, 2)} ha`}
                        tone="teal"
                        caption="Akumulasi area hotspot yang lolos filter"
                    />
                    <MetricTile
                        label="Validated"
                        value={validatedCount}
                        caption="Jumlah hotspot berstatus validated"
                    />
                    <MetricTile
                        label="High Priority"
                        value={highPriorityCount}
                        caption="Fokus recheck paling mendesak"
                    />
                </section>

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

                        <div className="panel-card">
                            <div className="panel-heading-row">
                                <div>
                                    <p className="panel-kicker">Filter Hotspot</p>
                                    <h3>Refine tampilan peta</h3>
                                </div>
                                <button
                                    type="button"
                                    className="panel-action-link"
                                    onClick={resetFilters}
                                    disabled={!hasNonDefaultFilters}
                                >
                                    Reset
                                </button>
                            </div>

                            <div className="filter-grid">
                                <label className="field-block">
                                    <span>Priority</span>
                                    <select
                                        value={filters.priority}
                                        onChange={(event) => handleFilterChange('priority', event.target.value)}
                                    >
                                        {PRIORITY_OPTIONS.map((option) => (
                                            <option key={option.value} value={option.value}>
                                                {option.label}
                                            </option>
                                        ))}
                                    </select>
                                </label>

                                <label className="field-block">
                                    <span>Status</span>
                                    <select
                                        value={filters.validationStatus}
                                        onChange={(event) =>
                                            handleFilterChange('validationStatus', event.target.value)
                                        }
                                    >
                                        {STATUS_OPTIONS.map((option) => (
                                            <option key={option.value} value={option.value}>
                                                {option.label}
                                            </option>
                                        ))}
                                    </select>
                                </label>

                                <label className="field-block">
                                    <span>Tanggal deteksi dari</span>
                                    <input
                                        type="date"
                                        value={filters.detectedFrom}
                                        onChange={(event) =>
                                            handleFilterChange('detectedFrom', event.target.value)
                                        }
                                    />
                                </label>

                                <label className="field-block">
                                    <span>Tanggal deteksi sampai</span>
                                    <input
                                        type="date"
                                        value={filters.detectedTo}
                                        onChange={(event) =>
                                            handleFilterChange('detectedTo', event.target.value)
                                        }
                                    />
                                </label>

                                <label className="field-block">
                                    <span>Luas minimum (ha)</span>
                                    <input
                                        type="number"
                                        min="0"
                                        step="0.01"
                                        value={filters.areaMin}
                                        onChange={(event) => handleFilterChange('areaMin', event.target.value)}
                                        placeholder="0.50"
                                    />
                                </label>

                                <label className="field-block">
                                    <span>Luas maksimum (ha)</span>
                                    <input
                                        type="number"
                                        min="0"
                                        step="0.01"
                                        value={filters.areaMax}
                                        onChange={(event) => handleFilterChange('areaMax', event.target.value)}
                                        placeholder="5.00"
                                    />
                                </label>
                            </div>
                        </div>

                        <div className="panel-card">
                            <p className="panel-kicker">Layer Control</p>
                            <div className="toggle-list">
                                {Object.entries({
                                    aoi: 'AOI layer',
                                    polygons: 'Hotspot polygon',
                                    centroids: 'Hotspot centroid',
                                    selected: 'Selected highlight',
                                    staticPlaceholder: 'Static map placeholder',
                                }).map(([key, label]) => (
                                    <label key={key} className="toggle-row">
                                        <input
                                            type="checkbox"
                                            checked={layerVisibility[key]}
                                            onChange={() => toggleLayer(key)}
                                        />
                                        <span>{label}</span>
                                    </label>
                                ))}
                            </div>

                            <div className="panel-divider" />

                            <p className="panel-kicker">Metadata Layer</p>
                            <ul className="layer-list">
                                {analysisContext.layers.length === 0 ? (
                                    <li>Belum ada metadata layer untuk analysis run ini.</li>
                                ) : (
                                    analysisContext.layers.map((layer) => (
                                        <li key={layer.id}>
                                            <strong>{layer.layer_name}</strong>
                                            <span>{layer.layer_type} - {layer.storage_type}</span>
                                        </li>
                                    ))
                                )}
                            </ul>
                        </div>

                        <div className="panel-card">
                            <div className="panel-heading-row">
                                <div>
                                    <p className="panel-kicker">Hotspot Terfilter</p>
                                    <h3>{filteredFeatures.length} hotspot terlihat</h3>
                                </div>
                                <span className="panel-caption">Klik item untuk sinkron ke peta</span>
                            </div>

                            <ul className="hotspot-list">
                                {filteredFeatures.length === 0 ? (
                                    <li className="hotspot-list-empty">
                                        Tidak ada hotspot yang cocok dengan filter saat ini.
                                    </li>
                                ) : (
                                    filteredFeatures.map((feature) => {
                                        const properties = feature.properties ?? {};
                                        const isSelected = String(getFeatureId(feature)) === String(selectedHotspotId);

                                        return (
                                            <li key={properties.id ?? properties.hotspot_code}>
                                                <button
                                                    type="button"
                                                    className={`hotspot-list-item ${isSelected ? 'is-selected' : ''}`}
                                                    onClick={() => setSelectedHotspotId(getFeatureId(feature))}
                                                >
                                                    <div>
                                                        <strong>{properties.hotspot_code ?? 'Tanpa kode'}</strong>
                                                        <span>
                                                            {formatStatus(properties.validation_status)} - {properties.priority ?? '-'}
                                                        </span>
                                                    </div>
                                                    <small>
                                                        {properties.area_ha != null
                                                            ? `${formatNumber(properties.area_ha, 2)} ha`
                                                            : 'Tanpa luas'}
                                                    </small>
                                                </button>
                                            </li>
                                        );
                                    })
                                )}
                            </ul>
                        </div>
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

                            <div className="map-legend final">
                                <strong>Legend</strong>
                                <div className="legend-section">
                                    <span className="legend-label">Layer utama</span>
                                    <div className="legend-row">
                                        <span className="legend-swatch layer-aoi" />
                                        <span>AOI</span>
                                    </div>
                                    <div className="legend-row">
                                        <span className="legend-swatch layer-selected" />
                                        <span>Hotspot dipilih</span>
                                    </div>
                                </div>
                                <div className="legend-section">
                                    <span className="legend-label">Priority</span>
                                    <div className="legend-row">
                                        <span className="legend-swatch priority-high-swatch" />
                                        <span>High</span>
                                    </div>
                                    <div className="legend-row">
                                        <span className="legend-swatch priority-medium-swatch" />
                                        <span>Medium</span>
                                    </div>
                                    <div className="legend-row">
                                        <span className="legend-swatch priority-low-swatch" />
                                        <span>Low</span>
                                    </div>
                                </div>
                                <div className="legend-section">
                                    <span className="legend-label">Status</span>
                                    {STATUS_OPTIONS.filter(({ value }) => value !== 'all').map((option) => (
                                        <div key={option.value} className="legend-row">
                                            <span className={`legend-chip status-${option.value.replaceAll('_', '-')}`}>
                                                {option.label}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                                <p className="legend-note">
                                    Hotspot adalah indikasi awal perubahan tutupan mangrove,
                                    bukan vonis hukum atau kesimpulan akhir lapangan.
                                </p>
                            </div>

                            {layerVisibility.staticPlaceholder ? (
                                <div className="static-layer-placeholder">
                                    Layer citra/statik analisis belum diaktifkan pada fase ini.
                                </div>
                            ) : null}

                            {contextLoading ? (
                                <div className="map-overlay-state">Memuat hotspot dan layer analysis run...</div>
                            ) : null}

                            {!contextLoading && error ? (
                                <div className="map-overlay-state is-error">{error}</div>
                            ) : null}

                            {!contextLoading && !error && filteredFeatures.length === 0 ? (
                                <div className="map-overlay-state is-empty">
                                    Tidak ada hotspot yang tampil. Coba ubah filter atau pilih analysis run lain.
                                </div>
                            ) : null}
                        </div>
                    </div>

                    <aside className="right-drawer">
                        <div className="drawer-card">
                            <div className="panel-heading-row">
                                <div>
                                    <p className="panel-kicker">Hotspot Detail</p>
                                    <h2>{selectedFeatureProperties.hotspot_code ?? 'Belum dipilih'}</h2>
                                </div>
                                {selectedFeatureProperties.priority ? (
                                    <span className={`priority-pill priority-pill-${selectedFeatureProperties.priority}`}>
                                        {selectedFeatureProperties.priority}
                                    </span>
                                ) : null}
                            </div>

                            <p className="drawer-muted">
                                Klik polygon atau centroid hotspot pada peta untuk melihat detail lebih lengkap dan memulai validasi.
                            </p>

                            {detailLoading ? <p className="drawer-inline-state">Memuat detail hotspot...</p> : null}
                            {detailError ? <p className="error-banner">{detailError}</p> : null}

                            <div className="drawer-grid">
                                <div>
                                    <span>ID Hotspot</span>
                                    <strong>{selectedDetail.id ?? selectedFeatureProperties.id ?? '-'}</strong>
                                </div>
                                <div>
                                    <span>Status</span>
                                    <strong>{formatStatus(selectedDetail.validation_status ?? selectedFeatureProperties.validation_status)}</strong>
                                </div>
                                <div>
                                    <span>Luas</span>
                                    <strong>
                                        {selectedDetail.area_ha != null || selectedFeatureProperties.area_ha != null
                                            ? `${formatNumber(selectedDetail.area_ha ?? selectedFeatureProperties.area_ha, 2)} ha`
                                            : '-'}
                                    </strong>
                                </div>
                                <div>
                                    <span>Analysis Run</span>
                                    <strong>{selectedDetail.analysis_run?.name ?? selectedRun?.name ?? '-'}</strong>
                                </div>
                                <div>
                                    <span>Centroid Latitude</span>
                                    <strong>{centroidCoordinates ? formatNumber(centroidCoordinates[1], 6) : '-'}</strong>
                                </div>
                                <div>
                                    <span>Centroid Longitude</span>
                                    <strong>{centroidCoordinates ? formatNumber(centroidCoordinates[0], 6) : '-'}</strong>
                                </div>
                                <div>
                                    <span>Detected At</span>
                                    <strong>{formatDateTime(selectedDetail.detected_at ?? selectedFeatureProperties.detected_at)}</strong>
                                </div>
                                <div>
                                    <span>Created At</span>
                                    <strong>{formatDateTime(selectedDetail.created_at)}</strong>
                                </div>
                                <div>
                                    <span>MVI Before</span>
                                    <strong>{formatNumber(selectedDetail.indices?.mvi_before, 3)}</strong>
                                </div>
                                <div>
                                    <span>MVI After</span>
                                    <strong>{formatNumber(selectedDetail.indices?.mvi_after, 3)}</strong>
                                </div>
                                <div>
                                    <span>MVI Delta</span>
                                    <strong>{formatNumber(selectedDetail.indices?.mvi_delta ?? selectedFeatureProperties.mvi_delta, 3)}</strong>
                                </div>
                                <div>
                                    <span>CMRI Before</span>
                                    <strong>{formatNumber(selectedDetail.indices?.cmri_before, 3)}</strong>
                                </div>
                                <div>
                                    <span>CMRI After</span>
                                    <strong>{formatNumber(selectedDetail.indices?.cmri_after, 3)}</strong>
                                </div>
                                <div>
                                    <span>CMRI Delta</span>
                                    <strong>{formatNumber(selectedDetail.indices?.cmri_delta ?? selectedFeatureProperties.cmri_delta, 3)}</strong>
                                </div>
                                <div>
                                    <span>NDVI Delta</span>
                                    <strong>{formatNumber(selectedDetail.indices?.ndvi_delta, 3)}</strong>
                                </div>
                                <div>
                                    <span>NDWI Delta</span>
                                    <strong>{formatNumber(selectedDetail.indices?.ndwi_delta, 3)}</strong>
                                </div>
                                <div>
                                    <span>Hotspot Type</span>
                                    <strong>{selectedDetail.properties?.hotspot_type ?? '-'}</strong>
                                </div>
                                <div>
                                    <span>Detection Method</span>
                                    <strong>{selectedDetail.properties?.detection_method ?? '-'}</strong>
                                </div>
                                <div>
                                    <span>Source</span>
                                    <strong>{selectedDetail.properties?.source ?? '-'}</strong>
                                </div>
                            </div>
                        </div>

                        <div className="drawer-card">
                            <div className="panel-heading-row">
                                <div>
                                    <p className="panel-kicker">Report Action</p>
                                    <h3>Laporan PDF hotspot</h3>
                                </div>
                                <span className="panel-caption">
                                    {canExportReport ? 'Internal only' : 'Perlu permission export_report'}
                                </span>
                            </div>

                            <p className="drawer-caption">
                                PDF ini bersifat indikasi awal untuk kebutuhan advokasi internal dan tetap membutuhkan verifikasi lanjutan.
                            </p>

                            <div className="drawer-actions">
                                <button
                                    type="button"
                                    className="secondary-button secondary-button-strong"
                                    onClick={() => setReportModal({ open: true, type: 'hotspot' })}
                                    disabled={!selectedHotspotId || !canExportReport}
                                >
                                    Generate PDF Report
                                </button>
                                {hotspotReports[0]?.download_url ? (
                                    <a
                                        href={hotspotReports[0].download_url}
                                        className="secondary-button secondary-button-link"
                                    >
                                        Download Latest Report
                                    </a>
                                ) : null}
                            </div>

                            {!canExportReport ? (
                                <p className="drawer-caption">
                                    Akun ini belum memiliki permission `export_report`.
                                </p>
                            ) : null}
                            {reportMessage ? <p className="success-banner">{reportMessage}</p> : null}
                            {reportError ? <p className="error-banner">{reportError}</p> : null}

                            {reportLoading ? (
                                <p className="drawer-inline-state">Memuat daftar report hotspot...</p>
                            ) : hotspotReports.length ? (
                                <div className="report-list">
                                    {hotspotReports.slice(0, 3).map((report) => (
                                        <article key={report.id} className="report-list-item">
                                            <div>
                                                <strong>{report.title}</strong>
                                                <span>
                                                    {formatDateTime(report.generated_at)} - {report.report_code}
                                                </span>
                                            </div>
                                            <a href={report.download_url} className="report-download-link">
                                                Download PDF
                                            </a>
                                        </article>
                                    ))}
                                </div>
                            ) : (
                                <p className="drawer-caption">Belum ada report hotspot yang dibuat.</p>
                            )}
                        </div>

                        <div className="drawer-card">
                            <div className="panel-heading-row">
                                <div>
                                    <p className="panel-kicker">Field Validation</p>
                                    <h3>{validationMode === 'update' ? 'Update validasi Anda' : 'Tambah validasi baru'}</h3>
                                </div>
                                <span className="panel-caption">
                                    {editableValidation ? 'Draft Anda ditemukan' : 'Belum ada draft milik Anda'}
                                </span>
                            </div>

                            <form className="validation-form" onSubmit={handleSubmitValidation}>
                                <div className="filter-grid">
                                    <label className="field-block">
                                        <span>Status validasi</span>
                                        <select
                                            value={validationForm.validation_status}
                                            onChange={(event) =>
                                                handleValidationFormChange('validation_status', event.target.value)
                                            }
                                        >
                                            {VALIDATION_STATUS_OPTIONS.map((option) => (
                                                <option key={option.value} value={option.value}>
                                                    {option.label}
                                                </option>
                                            ))}
                                        </select>
                                    </label>

                                    <label className="field-block">
                                        <span>Confidence</span>
                                        <select
                                            value={validationForm.confidence_level}
                                            onChange={(event) =>
                                                handleValidationFormChange('confidence_level', event.target.value)
                                            }
                                        >
                                            {CONFIDENCE_OPTIONS.map((option) => (
                                                <option key={option.value} value={option.value}>
                                                    {option.label}
                                                </option>
                                            ))}
                                        </select>
                                    </label>

                                    <label className="field-block">
                                        <span>Observed condition</span>
                                        <select
                                            value={validationForm.observed_condition}
                                            onChange={(event) =>
                                                handleValidationFormChange('observed_condition', event.target.value)
                                            }
                                        >
                                            {OBSERVED_CONDITION_OPTIONS.map((option) => (
                                                <option key={option.value} value={option.value}>
                                                    {option.label}
                                                </option>
                                            ))}
                                        </select>
                                    </label>

                                    <label className="field-block">
                                        <span>Sensitivity</span>
                                        <select
                                            value={validationForm.sensitivity_level}
                                            onChange={(event) =>
                                                handleValidationFormChange('sensitivity_level', event.target.value)
                                            }
                                        >
                                            {SENSITIVITY_OPTIONS.map((option) => (
                                                <option key={option.value} value={option.value}>
                                                    {option.label}
                                                </option>
                                            ))}
                                        </select>
                                    </label>

                                    <label className="field-block">
                                        <span>Visited at</span>
                                        <input
                                            type="datetime-local"
                                            value={validationForm.visited_at}
                                            onChange={(event) =>
                                                handleValidationFormChange('visited_at', event.target.value)
                                            }
                                        />
                                    </label>

                                    <label className="field-block field-checkbox">
                                        <span>Geotag</span>
                                        <input
                                            type="checkbox"
                                            checked={normalizeBoolean(validationForm.is_geotagged)}
                                            onChange={(event) =>
                                                handleValidationFormChange('is_geotagged', event.target.checked)
                                            }
                                        />
                                    </label>

                                    <label className="field-block">
                                        <span>Latitude validasi</span>
                                        <input
                                            type="number"
                                            step="0.000001"
                                            value={validationForm.photo_lat}
                                            onChange={(event) =>
                                                handleValidationFormChange('photo_lat', event.target.value)
                                            }
                                            placeholder="4.012345"
                                        />
                                    </label>

                                    <label className="field-block">
                                        <span>Longitude validasi</span>
                                        <input
                                            type="number"
                                            step="0.000001"
                                            value={validationForm.photo_lng}
                                            onChange={(event) =>
                                                handleValidationFormChange('photo_lng', event.target.value)
                                            }
                                            placeholder="98.456789"
                                        />
                                    </label>
                                </div>

                                <label className="field-block field-block-full">
                                    <span>Catatan lapangan</span>
                                    <textarea
                                        rows="4"
                                        value={validationForm.validation_note}
                                        onChange={(event) =>
                                            handleValidationFormChange('validation_note', event.target.value)
                                        }
                                        placeholder="Ringkasan temuan lapangan, kondisi lokasi, dan konteks tambahan."
                                    />
                                </label>

                                <div className="drawer-actions">
                                    <button
                                        type="button"
                                        className="secondary-button"
                                        onClick={() => handleUseBrowserLocation('validation')}
                                        disabled={locating || !canValidateHotspot}
                                    >
                                        {locating ? 'Mengambil lokasi...' : 'Ambil Lokasi Browser'}
                                    </button>
                                    <button
                                        type="submit"
                                        className="secondary-button secondary-button-strong"
                                        disabled={!selectedHotspotId || submittingValidation || !canValidateHotspot}
                                    >
                                        {submittingValidation
                                            ? 'Menyimpan...'
                                            : validationMode === 'update'
                                                ? 'Update Validasi'
                                                : 'Simpan Validasi'}
                                    </button>
                                </div>

                                {!canValidateHotspot ? (
                                    <p className="drawer-caption">
                                        Akun ini belum memiliki permission `validate_hotspot`, jadi form hanya tampil sebagai referensi.
                                    </p>
                                ) : null}
                                {validationMessage ? <p className="success-banner">{validationMessage}</p> : null}
                                {validationError ? <p className="error-banner">{validationError}</p> : null}
                            </form>
                        </div>

                        <div className="drawer-card">
                            <div className="panel-heading-row">
                                <div>
                                    <p className="panel-kicker">Validation Photos</p>
                                    <h3>Unggah bukti lapangan</h3>
                                </div>
                                <span className="panel-caption">
                                    {canUploadPhoto ? 'Terkait validasi aktif' : 'Simpan validasi terlebih dahulu'}
                                </span>
                            </div>

                            <form className="validation-form" onSubmit={handlePhotoUpload}>
                                <label className="field-block field-block-full">
                                    <span>Pilih foto</span>
                                    <input
                                        type="file"
                                        accept="image/png,image/jpeg,image/webp"
                                        onChange={(event) => setPhotoFile(event.target.files?.[0] ?? null)}
                                    />
                                </label>

                                {photoPreviewUrl ? (
                                    <div className="photo-preview-card">
                                        <img src={photoPreviewUrl} alt="Preview foto validasi" className="photo-preview-image" />
                                        <small>{photoFile?.name}</small>
                                    </div>
                                ) : null}

                                <div className="filter-grid">
                                    <label className="field-block">
                                        <span>Caption</span>
                                        <input
                                            type="text"
                                            value={photoForm.caption}
                                            onChange={(event) => handlePhotoFormChange('caption', event.target.value)}
                                            placeholder="Contoh: bekas pembukaan lahan"
                                        />
                                    </label>

                                    <label className="field-block">
                                        <span>Taken at</span>
                                        <input
                                            type="datetime-local"
                                            value={photoForm.taken_at}
                                            onChange={(event) => handlePhotoFormChange('taken_at', event.target.value)}
                                        />
                                    </label>

                                    <label className="field-block">
                                        <span>Sensitivity</span>
                                        <select
                                            value={photoForm.sensitivity_level}
                                            onChange={(event) =>
                                                handlePhotoFormChange('sensitivity_level', event.target.value)
                                            }
                                        >
                                            {SENSITIVITY_OPTIONS.map((option) => (
                                                <option key={option.value} value={option.value}>
                                                    {option.label}
                                                </option>
                                            ))}
                                        </select>
                                    </label>

                                    <label className="field-block field-checkbox">
                                        <span>Primary photo</span>
                                        <input
                                            type="checkbox"
                                            checked={normalizeBoolean(photoForm.is_primary)}
                                            onChange={(event) =>
                                                handlePhotoFormChange('is_primary', event.target.checked)
                                            }
                                        />
                                    </label>

                                    <label className="field-block">
                                        <span>Photo latitude</span>
                                        <input
                                            type="number"
                                            step="0.000001"
                                            value={photoForm.photo_lat}
                                            onChange={(event) => handlePhotoFormChange('photo_lat', event.target.value)}
                                            placeholder="4.012345"
                                        />
                                    </label>

                                    <label className="field-block">
                                        <span>Photo longitude</span>
                                        <input
                                            type="number"
                                            step="0.000001"
                                            value={photoForm.photo_lng}
                                            onChange={(event) => handlePhotoFormChange('photo_lng', event.target.value)}
                                            placeholder="98.456789"
                                        />
                                    </label>
                                </div>

                                <div className="drawer-actions">
                                    <button
                                        type="button"
                                        className="secondary-button"
                                        onClick={() => handleUseBrowserLocation('photo')}
                                        disabled={locating || !canValidateHotspot}
                                    >
                                        {locating ? 'Mengambil lokasi...' : 'Gunakan Lokasi Browser'}
                                    </button>
                                    <button
                                        type="submit"
                                        className="secondary-button secondary-button-strong"
                                        disabled={!canUploadPhoto || !photoFile || uploadingPhoto}
                                    >
                                        {uploadingPhoto ? 'Mengunggah...' : 'Upload Foto'}
                                    </button>
                                </div>

                                {photoMessage ? <p className="success-banner">{photoMessage}</p> : null}
                                {photoError ? <p className="error-banner">{photoError}</p> : null}
                            </form>

                            {allValidationPhotos.length ? (
                                <div className="validation-photo-grid">
                                    {allValidationPhotos.map((photo) => (
                                        <article key={photo.id} className="validation-photo-item">
                                            <img
                                                src={photo.file_url}
                                                alt={photo.caption || photo.original_filename}
                                                className="validation-photo-thumb"
                                            />
                                            <div className="validation-photo-meta">
                                                <strong>{photo.caption || photo.original_filename}</strong>
                                                <span>{formatDateTime(photo.taken_at || photo.created_at)}</span>
                                            </div>
                                            <small>
                                                {formatLabel(photo.validation_status)} - {photo.file_name} - {formatLabel(photo.sensitivity_level)}
                                            </small>
                                        </article>
                                    ))}
                                </div>
                            ) : (
                                <p className="drawer-caption">Belum ada foto validasi yang tersimpan untuk hotspot ini.</p>
                            )}
                        </div>

                        <div className="drawer-card">
                            <p className="panel-kicker">Riwayat Validasi</p>
                            {validationHistory.length === 0 ? (
                                <p className="drawer-muted">
                                    Belum ada riwayat validasi yang tersedia untuk hotspot ini.
                                </p>
                            ) : (
                                <ul className="validation-timeline">
                                    {validationHistory.map((validation) => (
                                        <li key={validation.id}>
                                            <strong>{formatStatus(validation.validation_status)}</strong>
                                            <span>
                                                {validation.validator?.name ?? 'Validator internal'} - {formatDateTime(validation.visited_at ?? validation.created_at)}
                                            </span>
                                            <p>{validation.validation_note ?? 'Belum ada catatan validasi.'}</p>
                                            <small className="timeline-meta">
                                                {validation.observed_condition
                                                    ? `${formatLabel(validation.observed_condition)} - `
                                                    : ''}
                                                {validation.confidence_level
                                                    ? `Confidence ${formatLabel(validation.confidence_level)}`
                                                    : 'Tanpa confidence level'}
                                            </small>
                                            {validation.photos?.length ? (
                                                <div className="timeline-photo-chips">
                                                    {validation.photos.map((photo) => (
                                                        <a
                                                            key={photo.id}
                                                            href={photo.file_url}
                                                            target="_blank"
                                                            rel="noreferrer"
                                                            className="timeline-photo-link"
                                                        >
                                                            {photo.original_filename}
                                                        </a>
                                                    ))}
                                                </div>
                                            ) : null}
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </div>

                        <div className="drawer-card">
                            <p className="panel-kicker">Status Dashboard</p>
                            <ul className="status-list">
                                <li>
                                    <span>Bootstrap API</span>
                                    <strong>{loading ? 'Loading' : 'Ready'}</strong>
                                </li>
                                <li>
                                    <span>Run Aktif</span>
                                    <strong>{selectedRun?.name ?? '-'}</strong>
                                </li>
                                <li>
                                    <span>Hotspot GeoJSON</span>
                                    <strong>{allFeatures.length} fitur</strong>
                                </li>
                                <li>
                                    <span>Validasi pada hotspot</span>
                                    <strong>{validationHistory.length}</strong>
                                </li>
                            </ul>
                            {error ? <p className="error-banner">{error}</p> : null}
                        </div>
                    </aside>
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
