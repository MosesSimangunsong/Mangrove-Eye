export const PRIORITY_OPTIONS = [
    { value: 'all', label: 'Semua prioritas' },
    { value: 'high', label: 'High' },
    { value: 'medium', label: 'Medium' },
    { value: 'low', label: 'Low' },
];

export const STATUS_OPTIONS = [
    { value: 'all', label: 'Semua status' },
    { value: 'detected', label: 'Detected' },
    { value: 'under_review', label: 'Under review' },
    { value: 'validated', label: 'Validated' },
    { value: 'rejected', label: 'Rejected' },
    { value: 'needs_recheck', label: 'Needs recheck' },
];

export const VALIDATION_STATUS_OPTIONS = STATUS_OPTIONS.filter(
    ({ value }) => value !== 'all' && value !== 'detected',
);

export const CONFIDENCE_OPTIONS = [
    { value: '', label: 'Pilih confidence' },
    { value: 'low', label: 'Low' },
    { value: 'medium', label: 'Medium' },
    { value: 'high', label: 'High' },
];

export const OBSERVED_CONDITION_OPTIONS = [
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

export const SENSITIVITY_OPTIONS = [
    { value: 'restricted', label: 'Restricted' },
    { value: 'internal', label: 'Internal' },
    { value: 'public', label: 'Public' },
];

export const DEFAULT_FILTERS = {
    priority: 'all',
    validationStatus: 'all',
    detectedFrom: '',
    detectedTo: '',
    areaMin: '',
    areaMax: '',
};

export const DEFAULT_LAYER_VISIBILITY = {
    aoi: true,
    polygons: true,
    centroids: true,
    selected: true,
    staticPlaceholder: true,
};

export const DEFAULT_VALIDATION_FORM = {
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

export const DEFAULT_PHOTO_FORM = {
    caption: '',
    taken_at: '',
    is_primary: true,
    sensitivity_level: 'restricted',
    photo_lat: '',
    photo_lng: '',
};

export const DEFAULT_HOTSPOT_REPORT_FORM = {
    title: '',
    include_validation_photos: true,
    include_precise_coordinates: false,
};

export const DEFAULT_ANALYSIS_RUN_REPORT_FORM = {
    title: '',
    include_hotspot_summary: true,
    include_validation_summary: true,
};

export function formatStatus(value) {
    if (!value) {
        return '-';
    }

    return value.replaceAll('_', ' ');
}

export function formatLabel(value) {
    return formatStatus(value).replace(/\b\w/g, (char) => char.toUpperCase());
}

export function formatNumber(value, digits = 2) {
    if (value == null || value === '') {
        return '-';
    }

    return Number(value).toFixed(digits);
}

export function formatDateTime(value) {
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

export function toDateTimeLocalValue(value) {
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

export function getFeatureId(feature) {
    return feature?.properties?.id ?? null;
}

export function getFeatureCentroid(feature, detail) {
    return detail?.centroid?.coordinates ?? feature?.properties?.centroid?.coordinates ?? null;
}

export function getValidationHistory(detail) {
    return Array.isArray(detail?.validations) ? detail.validations : [];
}

export function normalizeBoolean(value) {
    return value === true || value === '1' || value === 1;
}

export function buildValidationPayload(form) {
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
