<?php

namespace App\Http\Resources\Api\V1;

use App\Services\SpatialService;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class AoiAreaResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        $spatial = app(SpatialService::class);

        return [
            'id' => $this->id,
            'code' => $this->code,
            'name' => $this->name,
            'aoi_type' => $this->aoi_type,
            'description' => $this->description,
            'village' => $this->village,
            'district' => $this->district,
            'regency' => $this->regency,
            'province' => $this->province,
            'estimated_area_ha' => $this->estimated_area_ha !== null ? (float) $this->estimated_area_ha : null,
            'legal_status' => $this->legal_status,
            'legal_reference' => $this->legal_reference,
            'source_type' => $this->source_type,
            'source_name' => $this->source_name,
            'verification_status' => $this->verification_status,
            'sensitivity_level' => $this->sensitivity_level,
            'geometry' => $spatial->geometryFromModel($this->resource, 'geom'),
            'created_at' => $this->created_at?->toISOString(),
            'updated_at' => $this->updated_at?->toISOString(),
        ];
    }
}
