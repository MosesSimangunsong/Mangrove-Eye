<?php

namespace App\Http\Requests\Api\V1\AoiAreas;

use App\Http\Requests\Api\FormRequest;
use Illuminate\Validation\Rule;

class UpdateAoiAreaRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        $aoiAreaId = $this->route('aoiArea')?->id ?? $this->route('id');

        return [
            'code' => ['sometimes', 'required', 'string', 'max:50', Rule::unique('aoi_areas', 'code')->ignore($aoiAreaId)],
            'name' => ['sometimes', 'required', 'string', 'max:150'],
            'aoi_type' => ['sometimes', 'required', 'string', 'in:main_aoi,conflict_zone,buffer,reference'],
            'description' => ['nullable', 'string'],
            'village' => ['nullable', 'string', 'max:100'],
            'district' => ['nullable', 'string', 'max:100'],
            'regency' => ['nullable', 'string', 'max:100'],
            'province' => ['nullable', 'string', 'max:100'],
            'estimated_area_ha' => ['nullable', 'numeric'],
            'legal_status' => ['nullable', 'string', 'max:255'],
            'legal_reference' => ['nullable', 'string', 'max:255'],
            'source_type' => ['nullable', 'string', 'in:official,digitized,osm,manual,other'],
            'source_name' => ['nullable', 'string', 'max:150'],
            'source_file_path' => ['nullable', 'string', 'max:255'],
            'verification_status' => ['nullable', 'string', 'in:draft,verified,needs_revision'],
            'sensitivity_level' => ['sometimes', 'required', 'string', 'in:public,internal,restricted'],
            'geometry' => ['sometimes', 'required', 'array'],
            'geometry.type' => ['required_with:geometry', 'string', 'in:Polygon,MultiPolygon'],
            'geometry.coordinates' => ['required_with:geometry', 'array', 'min:1'],
        ];
    }
}
