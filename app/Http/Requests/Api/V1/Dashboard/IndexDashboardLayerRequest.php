<?php

namespace App\Http\Requests\Api\V1\Dashboard;

use App\Http\Requests\Api\FormRequest;

class IndexDashboardLayerRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'analysis_run_id' => ['required', 'integer', 'exists:analysis_runs,id'],
        ];
    }
}
