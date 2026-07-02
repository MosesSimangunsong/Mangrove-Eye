<?php

namespace App\Http\Requests\Api\V1\AoiAreas;

use App\Http\Requests\Api\FormRequest;

class ImportAoiAreaRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'file' => ['required', 'file', 'mimes:json,geojson'],
            'aoi_type' => ['required', 'string', 'in:main_aoi,conflict_zone,buffer,reference'],
            'source_type' => ['required', 'string', 'in:official,digitized,osm,manual,other'],
            'sensitivity_level' => ['required', 'string', 'in:public,internal,restricted'],
            'verification_status' => ['nullable', 'string', 'in:draft,verified,needs_revision'],
            'source_name' => ['nullable', 'string', 'max:150'],
        ];
    }
}
