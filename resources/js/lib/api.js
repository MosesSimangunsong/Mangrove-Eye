import axios from 'axios';

const api = axios.create({
    baseURL: '/api/v1',
    headers: {
        Accept: 'application/json',
        'X-Requested-With': 'XMLHttpRequest',
    },
});

export async function fetchDashboardBootstrap() {
    const [summary, analysisRuns, aoiAreas] = await Promise.all([
        api.get('/dashboard/summary'),
        api.get('/analysis-runs?per_page=50'),
        api.get('/aoi-areas?per_page=50'),
    ]);

    return {
        summary: summary.data.data,
        analysisRuns: analysisRuns.data.data,
        aoiAreas: aoiAreas.data.data,
    };
}

export async function fetchAnalysisContext(analysisRunId) {
    const [hotspots, layers] = await Promise.all([
        api.get(`/hotspots?analysis_run_id=${analysisRunId}&format=geojson`),
        api.get(`/dashboard/layers?analysis_run_id=${analysisRunId}`),
    ]);

    return {
        hotspots: hotspots.data.data,
        layers: layers.data.data,
    };
}

export async function fetchHotspotDetail(hotspotId) {
    const response = await api.get(`/hotspots/${hotspotId}`);

    return response.data.data;
}

export async function fetchAoiAreas(filters = {}) {
    const params = new URLSearchParams();

    Object.entries(filters).forEach(([key, value]) => {
        if (value != null && value !== '' && value !== 'all') {
            params.append(key, value);
        }
    });

    const response = await api.get(
        `/aoi-areas${params.toString() ? `?${params.toString()}` : ''}`,
    );

    return {
        data: response.data.data,
        meta: response.data.meta ?? {},
    };
}

export async function fetchAoiAreaDetail(aoiAreaId) {
    const response = await api.get(`/aoi-areas/${aoiAreaId}`);

    return response.data.data;
}

export async function fetchAnalysisRuns(filters = {}) {
    const params = new URLSearchParams();

    Object.entries(filters).forEach(([key, value]) => {
        if (value != null && value !== '' && value !== 'all') {
            params.append(key, value);
        }
    });

    const response = await api.get(
        `/analysis-runs${params.toString() ? `?${params.toString()}` : ''}`,
    );

    return {
        data: response.data.data,
        meta: response.data.meta ?? {},
    };
}

export async function fetchAnalysisRunDetail(analysisRunId) {
    const response = await api.get(`/analysis-runs/${analysisRunId}`);

    return response.data.data;
}

export async function fetchHotspots(filters = {}) {
    const params = new URLSearchParams();

    Object.entries(filters).forEach(([key, value]) => {
        if (value != null && value !== '' && value !== 'all') {
            params.append(key, value);
        }
    });

    const response = await api.get(
        `/hotspots${params.toString() ? `?${params.toString()}` : ''}`,
    );

    return {
        data: response.data.data,
        meta: response.data.meta ?? {},
    };
}

export async function fetchPublicDashboardSummary() {
    const response = await api.get('/public/dashboard/summary');

    return response.data.data;
}

export async function fetchPublicHotspots(filters = {}) {
    const params = new URLSearchParams();

    Object.entries(filters).forEach(([key, value]) => {
        if (value != null && value !== '' && value !== 'all') {
            params.append(key, value);
        }
    });

    const response = await api.get(
        `/public/hotspots${params.toString() ? `?${params.toString()}` : ''}`,
    );

    return response.data.data;
}

export async function createFieldValidation(hotspotId, payload) {
    const response = await api.post(`/hotspots/${hotspotId}/field-validations`, payload);

    return response.data.data;
}

export async function fetchFieldValidations(hotspotId) {
    const response = await api.get(`/hotspots/${hotspotId}/field-validations`);

    return response.data.data;
}

export async function updateFieldValidation(fieldValidationId, payload) {
    const response = await api.put(`/field-validations/${fieldValidationId}`, payload);

    return response.data.data;
}

export async function uploadValidationPhoto(fieldValidationId, formData) {
    const response = await api.post(
        `/field-validations/${fieldValidationId}/photos`,
        formData,
        {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        },
    );

    return response.data.data;
}

export async function fetchValidationPhotos(fieldValidationId) {
    const response = await api.get(`/field-validations/${fieldValidationId}/photos`);

    return response.data.data;
}

export async function fetchReports(filters = {}) {
    const params = new URLSearchParams();

    Object.entries(filters).forEach(([key, value]) => {
        if (value != null && value !== '' && value !== 'all') {
            params.append(key, value);
        }
    });

    const response = await api.get(
        `/reports${params.toString() ? `?${params.toString()}` : ''}`,
    );

    return {
        data: response.data.data,
        meta: response.data.meta ?? {},
    };
}

export async function fetchGeeImports(analysisRunId, filters = {}) {
    const params = new URLSearchParams();

    Object.entries(filters).forEach(([key, value]) => {
        if (value != null && value !== '' && value !== 'all') {
            params.append(key, value);
        }
    });

    const response = await api.get(
        `/analysis-runs/${analysisRunId}/gee-imports${params.toString() ? `?${params.toString()}` : ''}`,
    );

    return {
        data: response.data.data,
        meta: response.data.meta ?? {},
    };
}

export async function createHotspotReport(hotspotId, payload) {
    const response = await api.post(`/hotspots/${hotspotId}/reports`, payload);

    return response.data.data;
}

export async function createAnalysisRunReport(analysisRunId, payload) {
    const response = await api.post(`/analysis-runs/${analysisRunId}/reports`, payload);

    return response.data.data;
}

export default api;
