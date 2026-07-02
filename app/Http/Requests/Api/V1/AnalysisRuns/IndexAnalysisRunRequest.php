<?php

namespace App\Http\Requests\Api\V1\AnalysisRuns;

use App\Http\Requests\Api\FormRequest;

class IndexAnalysisRunRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'aoi_area_id' => ['nullable', 'integer', 'exists:aoi_areas,id'],
            'status' => ['nullable', 'string', 'in:draft,processed,published,archived,failed'],
            'year' => ['nullable', 'integer', 'min:2000', 'max:2100'],
            'per_page' => ['nullable', 'integer', 'min:1', 'max:100'],
        ];
    }
}
