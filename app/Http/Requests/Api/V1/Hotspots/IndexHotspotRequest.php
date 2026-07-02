<?php

namespace App\Http\Requests\Api\V1\Hotspots;

use App\Http\Requests\Api\FormRequest;

class IndexHotspotRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'analysis_run_id' => ['nullable', 'integer', 'exists:analysis_runs,id'],
            'aoi_area_id' => ['nullable', 'integer', 'exists:aoi_areas,id'],
            'validation_status' => ['nullable', 'string', 'in:detected,under_review,validated,rejected,needs_recheck'],
            'priority' => ['nullable', 'string', 'in:low,medium,high'],
            'bbox' => ['nullable', 'string'],
            'format' => ['nullable', 'string', 'in:json,geojson'],
            'per_page' => ['nullable', 'integer', 'min:1', 'max:100'],
        ];
    }
}
