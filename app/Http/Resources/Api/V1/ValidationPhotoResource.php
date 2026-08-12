<?php

namespace App\Http\Resources\Api\V1;

use App\Services\SpatialService;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ValidationPhotoResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        $spatial = app(SpatialService::class);

        return [
            'id' => $this->id,
            'field_validation_id' => $this->field_validation_id,
            'original_filename' => $this->file_name,
            'file_name' => $this->file_name,
            'mime_type' => $this->mime_type,
            'file_size' => $this->file_size,
            'file_url' => route('api.v1.validation-photos.show', $this->resource),
            'photo_point' => $spatial->geometryFromModel($this->resource, 'photo_point'),
            'taken_at' => $this->taken_at?->toISOString(),
            'caption' => $this->caption,
            'is_primary' => $this->is_primary,
            'sensitivity_level' => $this->sensitivity_level,
            'created_at' => $this->created_at?->toISOString(),
            'updated_at' => $this->updated_at?->toISOString(),
        ];
    }
}
