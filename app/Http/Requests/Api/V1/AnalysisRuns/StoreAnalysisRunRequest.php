<?php

namespace App\Http\Requests\Api\V1\AnalysisRuns;

use App\Http\Requests\Api\FormRequest;

class StoreAnalysisRunRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'aoi_area_id' => ['required', 'integer', 'exists:aoi_areas,id'],
            'name' => ['required', 'string', 'max:180'],
            'description' => ['nullable', 'string'],
            'dataset_name' => ['nullable', 'string', 'max:100'],
            'gee_collection_id' => ['nullable', 'string', 'max:150'],
            'before_start_date' => ['required', 'date'],
            'before_end_date' => ['required', 'date', 'after_or_equal:before_start_date'],
            'after_start_date' => ['required', 'date'],
            'after_end_date' => ['required', 'date', 'after_or_equal:after_start_date'],
            'cloud_threshold' => ['nullable', 'numeric', 'min:0', 'max:100'],
            'primary_indices' => ['required', 'array', 'min:1'],
            'primary_indices.*' => ['string'],
            'supporting_indices' => ['nullable', 'array'],
            'supporting_indices.*' => ['string'],
            'threshold_params' => ['nullable', 'array'],
            'processing_params' => ['nullable', 'array'],
            'status' => ['nullable', 'string', 'in:draft,processed,published,archived,failed'],
        ];
    }
}
