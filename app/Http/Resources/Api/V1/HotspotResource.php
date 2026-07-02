<?php

namespace App\Http\Resources\Api\V1;

use App\Services\SpatialService;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class HotspotResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        $spatial = app(SpatialService::class);

        return [
            'id' => $this->id,
            'hotspot_code' => $this->hotspot_code,
            'analysis_run_id' => $this->analysis_run_id,
            'aoi_area_id' => $this->aoi_area_id,
            'gee_import_id' => $this->gee_import_id,
            'analysis_run' => $this->whenLoaded('analysisRun', fn () => [
                'id' => $this->analysisRun?->id,
                'name' => $this->analysisRun?->name,
            ]),
            'aoi_area' => $this->whenLoaded('aoiArea', fn () => [
                'id' => $this->aoiArea?->id,
                'name' => $this->aoiArea?->name,
            ]),
            'validations' => $this->whenLoaded('validations', fn () => FieldValidationResource::collection($this->validations)->resolve()),
            'detected_at' => $this->detected_at?->toISOString(),
            'centroid' => $spatial->geometryFromModel($this->resource, 'centroid'),
            'geometry' => $spatial->geometryFromModel($this->resource, 'geom'),
            'area_ha' => $this->area_ha !== null ? (float) $this->area_ha : null,
            'priority' => $this->priority,
            'validation_status' => $this->validation_status,
            'false_positive_reason' => $this->false_positive_reason,
            'sensitivity_level' => $this->sensitivity_level,
            'indices' => [
                'mvi_before' => $this->mvi_before !== null ? (float) $this->mvi_before : null,
                'mvi_after' => $this->mvi_after !== null ? (float) $this->mvi_after : null,
                'mvi_delta' => $this->mvi_delta !== null ? (float) $this->mvi_delta : null,
                'cmri_before' => $this->cmri_before !== null ? (float) $this->cmri_before : null,
                'cmri_after' => $this->cmri_after !== null ? (float) $this->cmri_after : null,
                'cmri_delta' => $this->cmri_delta !== null ? (float) $this->cmri_delta : null,
                'ndvi_before' => $this->ndvi_before !== null ? (float) $this->ndvi_before : null,
                'ndvi_after' => $this->ndvi_after !== null ? (float) $this->ndvi_after : null,
                'ndvi_delta' => $this->ndvi_delta !== null ? (float) $this->ndvi_delta : null,
                'ndwi_before' => $this->ndwi_before !== null ? (float) $this->ndwi_before : null,
                'ndwi_after' => $this->ndwi_after !== null ? (float) $this->ndwi_after : null,
                'ndwi_delta' => $this->ndwi_delta !== null ? (float) $this->ndwi_delta : null,
            ],
            'properties' => $this->properties ?? new \stdClass(),
            'created_at' => $this->created_at?->toISOString(),
            'updated_at' => $this->updated_at?->toISOString(),
        ];
    }
}
