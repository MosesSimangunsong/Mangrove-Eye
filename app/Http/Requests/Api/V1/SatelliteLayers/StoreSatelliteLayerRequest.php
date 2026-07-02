<?php

namespace App\Http\Requests\Api\V1\SatelliteLayers;

use App\Http\Requests\Api\FormRequest;

class StoreSatelliteLayerRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'layer_name' => ['required', 'string', 'max:150'],
            'layer_type' => ['required', 'string', 'in:rgb_before,rgb_after,mvi,cmri,ndvi,ndwi,delta,static_map'],
            'period_type' => ['required', 'string', 'in:before,after,delta,summary'],
            'storage_type' => ['required', 'string', 'in:file,tile_url,external_url'],
            'file_path' => ['nullable', 'string', 'max:255'],
            'tile_url' => ['nullable', 'string'],
            'bbox' => ['nullable', 'array'],
            'bbox.*' => ['numeric'],
            'visualization_params' => ['nullable', 'array'],
            'is_public' => ['nullable', 'boolean'],
        ];
    }
}
