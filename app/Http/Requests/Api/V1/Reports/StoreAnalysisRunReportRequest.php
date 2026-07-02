<?php

namespace App\Http\Requests\Api\V1\Reports;

use App\Http\Requests\Api\FormRequest;

class StoreAnalysisRunReportRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'title' => ['required', 'string', 'max:200'],
            'include_hotspot_summary' => ['nullable', 'boolean'],
            'include_validation_summary' => ['nullable', 'boolean'],
        ];
    }
}
