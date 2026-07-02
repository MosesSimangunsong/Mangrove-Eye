<?php

namespace App\Http\Requests\Api\V1\AnalysisRuns;

use App\Http\Requests\Api\FormRequest;

class UpdateAnalysisRunRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'aoi_area_id' => ['sometimes', 'required', 'integer', 'exists:aoi_areas,id'],
            'name' => ['sometimes', 'required', 'string', 'max:180'],
            'description' => ['nullable', 'string'],
            'dataset_name' => ['nullable', 'string', 'max:100'],
            'gee_collection_id' => ['nullable', 'string', 'max:150'],
            'before_start_date' => ['sometimes', 'required', 'date'],
            'before_end_date' => ['sometimes', 'required', 'date'],
            'after_start_date' => ['sometimes', 'required', 'date'],
            'after_end_date' => ['sometimes', 'required', 'date'],
            'cloud_threshold' => ['nullable', 'numeric', 'min:0', 'max:100'],
            'primary_indices' => ['sometimes', 'required', 'array', 'min:1'],
            'primary_indices.*' => ['string'],
            'supporting_indices' => ['nullable', 'array'],
            'supporting_indices.*' => ['string'],
            'threshold_params' => ['nullable', 'array'],
            'processing_params' => ['nullable', 'array'],
            'total_hotspots' => ['nullable', 'integer', 'min:0'],
            'total_area_ha' => ['nullable', 'numeric', 'min:0'],
            'status' => ['nullable', 'string', 'in:draft,processed,published,archived,failed'],
            'processed_at' => ['nullable', 'date'],
            'published_at' => ['nullable', 'date'],
        ];
    }
}
