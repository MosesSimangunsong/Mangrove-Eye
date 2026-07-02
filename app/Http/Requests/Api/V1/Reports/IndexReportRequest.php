<?php

namespace App\Http\Requests\Api\V1\Reports;

use App\Http\Requests\Api\FormRequest;

class IndexReportRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'report_type' => ['nullable', 'string', 'in:hotspot,analysis_run'],
            'hotspot_id' => ['nullable', 'integer', 'exists:hotspots,id'],
            'analysis_run_id' => ['nullable', 'integer', 'exists:analysis_runs,id'],
            'per_page' => ['nullable', 'integer', 'min:1', 'max:100'],
        ];
    }
}
