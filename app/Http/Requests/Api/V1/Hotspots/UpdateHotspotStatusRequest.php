<?php

namespace App\Http\Requests\Api\V1\Hotspots;

use App\Http\Requests\Api\FormRequest;

class UpdateHotspotStatusRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'validation_status' => ['required', 'string', 'in:detected,under_review,validated,rejected,needs_recheck'],
            'false_positive_reason' => ['nullable', 'string'],
        ];
    }
}
