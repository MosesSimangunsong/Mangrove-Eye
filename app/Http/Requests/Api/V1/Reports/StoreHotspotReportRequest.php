<?php

namespace App\Http\Requests\Api\V1\Reports;

use App\Http\Requests\Api\FormRequest;

class StoreHotspotReportRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'title' => ['required', 'string', 'max:200'],
            'include_validation_photos' => ['nullable', 'boolean'],
            'include_precise_coordinates' => ['nullable', 'boolean'],
        ];
    }
}
