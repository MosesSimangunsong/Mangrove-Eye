<?php

namespace App\Http\Resources\Api\V1;

use App\Services\SpatialService;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class FieldValidationResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        $spatial = app(SpatialService::class);

        return [
            'id' => $this->id,
            'hotspot_id' => $this->hotspot_id,
            'validator_id' => $this->validator_id,
            'validation_status' => $this->validation_status,
            'validation_note' => $this->validation_note,
            'observed_condition' => $this->observed_condition,
            'confidence_level' => $this->confidence_level,
            'validation_point' => $spatial->geometryFromModel($this->resource, 'validation_point'),
            'visited_at' => $this->visited_at?->toISOString(),
            'is_geotagged' => $this->is_geotagged,
            'sensitivity_level' => $this->sensitivity_level,
            'validator' => $this->whenLoaded('validator', fn () => [
                'id' => $this->validator?->id,
                'name' => $this->validator?->name,
            ]),
            'photos' => $this->whenLoaded('photos', fn () => ValidationPhotoResource::collection($this->photos)->resolve()),
            'created_at' => $this->created_at?->toISOString(),
            'updated_at' => $this->updated_at?->toISOString(),
        ];
    }
}
