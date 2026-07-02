<?php

namespace App\Http\Requests\Api\V1\AnalysisRuns;

use App\Http\Requests\Api\FormRequest;

class ImportGeeHotspotsRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'file' => ['required', 'file', 'mimes:json,geojson'],
            'metadata' => ['nullable', 'array'],
            'metadata.*' => ['nullable'],
            'import_summary' => ['nullable', 'array'],
            'import_summary.*' => ['nullable'],
        ];
    }
}
