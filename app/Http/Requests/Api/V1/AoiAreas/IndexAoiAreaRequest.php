<?php

namespace App\Http\Requests\Api\V1\AoiAreas;

use App\Http\Requests\Api\FormRequest;

class IndexAoiAreaRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'aoi_type' => ['nullable', 'string', 'in:main_aoi,conflict_zone,buffer,reference'],
            'verification_status' => ['nullable', 'string', 'in:draft,verified,needs_revision'],
            'per_page' => ['nullable', 'integer', 'min:1', 'max:100'],
        ];
    }
}
