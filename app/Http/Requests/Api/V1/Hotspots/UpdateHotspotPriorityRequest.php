<?php

namespace App\Http\Requests\Api\V1\Hotspots;

use App\Http\Requests\Api\FormRequest;

class UpdateHotspotPriorityRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'priority' => ['required', 'string', 'in:low,medium,high'],
        ];
    }
}
